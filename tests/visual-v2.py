"""Regresión integrada sobre una demostración local identificada, sin correo externo."""
import argparse
import json
from pathlib import Path
import re
import secrets
import subprocess
import time

from playwright.sync_api import expect, sync_playwright


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--state", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--functional-only", action="store_true", help="Omite la matriz visual durante la depuración de flujos")
    args = parser.parse_args()
    state = json.loads(args.state.read_text(encoding="utf-8"))
    project = state["project"]
    if not re.fullmatch(r"lizardjudge-defensa-v2-[a-z0-9-]+", project):
        parser.error("Solo proyectos ficticios de experiencia v2")
    info = json.loads(subprocess.check_output(["docker", "inspect", project + "-oj-backend-1"], text=True))[0]
    assert "OJ_VERIFICATION_ONLY=1" in info["Config"]["Env"], "El backend no es una demostración"
    frontend = json.loads(subprocess.check_output(["docker", "inspect", project + "-oj-frontend-1"], text=True))[0]
    ports = frontend["NetworkSettings"]["Ports"]["8080/tcp"]
    assert any(port["HostIp"] == "127.0.0.1" and port["HostPort"] == str(state["port"]) for port in ports)
    root = "http://127.0.0.1:" + str(state["port"])
    args.output.mkdir(parents=True, exist_ok=True)
    errors, overflows, warnings, routes, contrasts = [], [], [], [], []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        context = browser.new_context(viewport={"width": 1440, "height": 1000})

        def csrf(target):
            return {"X-CSRFToken": next(c["value"] for c in target.cookies() if c["name"] == "csrftoken")}

        def login(target, username, password):
            target.request.get(root + "/api/profile")
            result = target.request.post(root + "/api/login", data={"username": username, "password": password}, headers=csrf(target))
            assert result.ok and not result.json()["error"]

        login(context, "docente-demo", state["teacher_password"])
        page = context.new_page()
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on("console", lambda message: warnings.append(message.text) if "Cannot translate" in message.text else None)

        def visit(route):
            page.goto(root + route, wait_until="networkidle")
            assert not re.search(r"[\u3400-\u9fff]", page.locator("body").inner_text()), route

        matrix = [("/", "inicio"), ("/problem", "problemas"), ("/problem/DEF-SUMA", "resolver"),
                  ("/status", "envios"), ("/contest", "concursos"), ("/acm-rank", "ranking"),
                  ("/changelog", "versiones"), ("/admin/", "tablero"), ("/admin/conf", "correo"),
                  ("/admin/user", "usuarios"), ("/admin/problems", "admin-problemas"),
                  ("/admin/problem/edit/1", "editor"), ("/admin/announcement", "anuncios"),
                  ("/admin/contest", "admin-concursos"), ("/admin/judge-server", "juez")]
        for width in (() if args.functional_only else (320, 768, 1440)):
            page.set_viewport_size({"width": width, "height": 1000})
            for theme in ("light", "dark"):
                page.goto(root + "/", wait_until="networkidle")
                page.evaluate("value => localStorage.setItem('lizard-theme', value)", theme)
                for route, label in matrix:
                    visit(route)
                    dimensions = page.evaluate("({width:innerWidth,scroll:document.documentElement.scrollWidth})")
                    if dimensions["scroll"] > width:
                        overflows.append({"route": route, "theme": theme, **dimensions})
                    clipped = page.locator(".el-button,.ivu-btn,.v2-primary-link,.v2-secondary-link,.v2-editor-nav button").evaluate_all("""elements => elements.filter(element => {
                      const box=element.getBoundingClientRect();
                      return box.width && box.height && getComputedStyle(element).visibility!=='hidden' && element.scrollWidth>element.clientWidth+3;
                    }).map(element=>element.textContent.trim()).filter(Boolean)""")
                    if clipped:
                        overflows.append({"route": route, "theme": theme, "buttons": clipped})
                    if label == "problemas" and width == 1440:
                        ratios = page.locator(".ivu-table th .ivu-table-cell").evaluate_all("""elements => {
                          const lum = text => {
                            const c=text.match(/[\\d.]+/g).slice(0,3).map(Number).map(x=>x/255).map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));
                            return c[0]*.2126+c[1]*.7152+c[2]*.0722;
                          };
                          return elements.filter(e=>e.getBoundingClientRect().width).map(e=>{
                            const a=lum(getComputedStyle(e).color),b=lum(getComputedStyle(e.closest('th')).backgroundColor);
                            return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
                          });
                        }""")
                        assert ratios and min(ratios) >= 4.5, {"theme": theme, "ratios": ratios}
                        contrasts.append({"theme": theme, "table_header_minimum": min(ratios)})
                    routes.append({"route": route, "theme": theme, "width": width})
                    if width in (320, 1440) and label in ("inicio", "problemas", "correo", "editor", "tablero", "versiones"):
                        page.screenshot(path=str(args.output / f"{label}-{theme}-{width}.png"), full_page=True)

        (args.output / "matrix.json").write_text(json.dumps({"routes": routes, "overflows": overflows, "errors": errors}, indent=2), encoding="utf-8")
        page.set_viewport_size({"width": 375, "height": 900})
        visit("/")
        page.get_by_role("button", name="Abrir navegación", exact=True).click()
        expect(page.locator("#portal-navigation")).to_be_visible()
        page.get_by_role("button", name="Cerrar navegación", exact=True).first.press("Escape")
        expect(page.locator("#portal-navigation")).not_to_be_visible()
        visit("/admin/conf")
        page.get_by_role("button", name="Abrir navegación", exact=True).click()
        expect(page.locator("#admin-navigation")).to_be_visible()
        page.get_by_role("button", name="Cerrar navegación", exact=True).click()
        expect(page.locator("#admin-navigation")).not_to_be_visible()

        # SMTP: persistencia real en la demo; la entrega se intercepta antes de llegar al servidor.
        page.get_by_role("button", name="Usar Resend", exact=True).click()
        page.locator('input[placeholder="smtp.example.com"]').fill("smtp.resend.com")
        page.locator('input[placeholder="email@example.com"]').fill("avisos@example.com")
        page.locator('input[placeholder="Por ejemplo, LizardJudge Univalle"]').fill("Comunidad Univalle")
        ephemeral = secrets.token_urlsafe(24)
        page.locator('input[type="password"]').fill(ephemeral)
        with page.expect_response(lambda r: "/api/admin/smtp" in r.url and r.request.method in ("POST", "PUT")) as saved:
            page.get_by_role("button", name=re.compile(r"Guardar$")).first.click()
        assert not saved.value.json()["error"]
        expect(page.locator('input[type="password"]')).to_have_value("")
        page.reload(wait_until="networkidle")
        expect(page.locator('input[placeholder="Por ejemplo, LizardJudge Univalle"]')).to_have_value("Comunidad Univalle")
        with page.expect_response(lambda r: "/api/admin/smtp" in r.url and r.request.method == "PUT") as saved:
            page.get_by_role("button", name=re.compile(r"Guardar$")).first.click()
        assert not saved.value.json()["error"] and "password" not in saved.value.request.post_data_json
        config = context.request.get(root + "/api/admin/smtp").json()["data"]
        assert "password" not in config and config["sender_name"] == "Comunidad Univalle"
        assert config["username"] == "resend" and config["ssl"] and not config["tls"]
        test_button = page.get_by_role("button", name=re.compile(r"Enviar Correo de Prueba$"))
        page.locator('input[placeholder="email@example.com"]').fill("otro@example.com")
        expect(test_button).to_be_disabled()
        page.locator('input[placeholder="email@example.com"]').fill("avisos@example.com")
        expect(test_button).to_be_enabled()
        sent = []

        def intercept_delivery(route):
            sent.append(route.request.post_data_json)
            route.fulfill(status=200, json={"error": None, "data": None})

        page.route("**/api/admin/smtp_test", intercept_delivery)
        page.locator("#smtp-test-recipient").fill("destino@example.com")
        test_button.click()
        expect(page.locator(".settings-test [role=status]")).to_contain_text("El servidor SMTP aceptó el mensaje")
        assert sent == [{"email": "destino@example.com"}]
        page.unroute("**/api/admin/smtp_test", intercept_delivery)
        page.get_by_role("tab", name="Sitio", exact=True).click()
        expect(page.locator('input[placeholder="https://lj.isilp.com"]')).to_be_visible()
        page.get_by_role("tab", name="Diagnóstico", exact=True).click()
        expect(page.get_by_text("Diagnóstico de Correo", exact=True)).to_be_visible()

        # Secciones del editor conservan texto y siguen aplicando la protección de peticiones demoradas.
        visit("/admin/problem/edit/1")
        statement = page.locator("#editor-tab-statement")
        statement.focus()
        statement.press("ArrowRight")
        expect(page.locator("#problem-evaluation")).to_be_visible()
        page.locator("#editor-tab-evaluation").press("Home")
        expect(page.locator("#problem-statement")).to_be_visible()
        original = page.locator(".simditor-body").first.inner_text()
        page.locator("#editor-tab-evaluation").click()
        if page.locator(".tags .el-tag").count() == 0:
            page.locator(".button-new-tag").click()
            page.locator(".input-new-tag input").fill("regresion-v2")
            page.locator(".input-new-tag input").press("Enter")
        page.locator("#editor-tab-statement").click()
        expect(page.locator(".simditor-body").first).to_have_text(original)
        page.locator(".el-icon-fa-globe").click()
        page.locator(".el-dropdown-menu__item").filter(has_text=re.compile(r"^English$")).click()
        expect(page.locator(".simditor").first.locator('[title^="Bold"]')).to_be_visible()
        expect(page.locator(".simditor-body").first).to_have_text(original)
        page.locator(".el-icon-fa-globe").click()
        page.locator(".el-dropdown-menu__item").filter(has_text="Español (LA)").click()
        expect(page.locator(".simditor").first.locator('[title^="Negrita"]')).to_be_visible()
        page.locator("#editor-tab-evaluation").click()
        page.get_by_role("button", name="Cargar casos guardados", exact=True).click()
        expect(page.locator(".text-case")).to_have_count(3)
        rows = page.locator(".text-case")
        rows.first.locator("textarea").nth(0).fill("10 20\n")
        rows.first.locator("textarea").nth(1).fill("30\n")
        pending = []

        def hold_cases(route):
            pending.append(route) if route.request.method == "POST" else route.continue_()

        page.route("**/api/admin/test_case/text", hold_cases)
        apply = page.get_by_role("button", name="Aplicar casos de texto", exact=True)
        apply.click()
        page.locator(".el-message-box").get_by_role("button", name="Sí", exact=True).click()
        for _ in range(100):
            if pending:
                break
            page.wait_for_timeout(40)
        assert pending
        rows.first.locator("textarea").nth(0).fill("100 200\n")
        rows.first.locator("textarea").nth(1).fill("300\n")
        pending[0].fulfill(response=pending[0].fetch())
        expect(apply).to_be_enabled()
        page.unroute("**/api/admin/test_case/text", hold_cases)
        page.get_by_role("button", name=re.compile(r"Guardar$")).click()
        expect(page.get_by_text("Aplica los cambios de los casos de texto antes de guardar el problema.", exact=True)).to_be_visible()
        with page.expect_response(lambda r: "/api/admin/test_case/text" in r.url and r.request.method == "POST"):
            apply.click()
            page.locator(".el-message-box").get_by_role("button", name="Sí", exact=True).click()
        expect(apply).to_be_enabled()
        with page.expect_response(lambda r: "/api/admin/problem" in r.url and r.request.method == "PUT") as saved:
            page.get_by_role("button", name=re.compile(r"Guardar$")).click()
        assert not saved.value.json()["error"]
        page.wait_for_url(re.compile(r"/admin/problems/?$"))
        cases = context.request.get(root + "/api/admin/test_case/text?problem_id=1").json()["data"]["cases"]
        assert cases[0] == {"input": "100 200\n", "output": "300\n"}

        student = browser.new_context()
        login(student, "estudiante-demo", state["student_password"])
        assert student.request.get(root + "/api/admin/test_case/text?problem_id=1").json()["error"]
        assert student.request.get(root + "/api/admin/smtp").json()["error"]
        verdicts = []
        for code, expected in (("print(5)", -1), ("a,b=map(int,input().split());print(a+b)", 0)):
            created = student.request.post(root + "/api/submission", data={"problem_id": 1, "language": "Python3", "code": code}, headers=csrf(student)).json()
            assert not created["error"]
            identifier = created["data"]["submission_id"]
            for _ in range(100):
                result = student.request.get(root + "/api/submission?id=" + identifier).json()["data"]["result"]
                if result not in (6, 7, 9):
                    break
                time.sleep(.3)
            assert result == expected, (result, expected)
            verdicts.append(result)

        # El historial falla de forma visible, permite reintentar y trata los detalles como texto.
        fail = [True]

        def release_failure(route):
            if fail[0]:
                route.fulfill(status=503, body="unavailable")
            else:
                route.continue_()

        page.route("**/release-notes.json", release_failure)
        visit("/changelog")
        expect(page.get_by_text("No pudimos cargar las notas de esta versión.")).to_be_visible()
        fail[0] = False
        page.get_by_role("button", name="Reintentar", exact=True).click()
        expect(page.locator(".release-entry")).not_to_have_count(0)
        page.unroute("**/release-notes.json", release_failure)

        def hostile_notes(route):
            route.fulfill(status=200, json={"source_url": "javascript:alert(1)", "update": [
                {"version": "2.0.0", "title": "Prueba local", "details": ['<img src=x onerror="window.__release_injected=1">']}]})

        page.route("**/release-notes.json", hostile_notes)
        visit("/changelog")
        expect(page.locator(".release-entry li")).to_contain_text("<img")
        assert page.evaluate("typeof window.__release_injected") == "undefined"
        assert page.locator(".v2-source-link").count() == 0
        page.unroute("**/release-notes.json", hostile_notes)
        visit("/changelog")
        assert context.request.get(root + "/version.json").json()["version"] == "2.0.0"
        notes = context.request.get(root + "/release-notes.json").json()
        assert notes["local_version"] == "2.0.0" and notes["update"]
        assert "CHANGELOG.md" in notes["source_url"]

        reduced = browser.new_context(reduced_motion="reduce")
        reduced_page = reduced.new_page()
        reduced_page.goto(root, wait_until="networkidle")
        assert reduced_page.locator(".v2-hero__art").evaluate("e=>getComputedStyle(e).animationName") == "none"

        # Acceso real desde la interfaz: el menú debe desaparecer antes de abrir el modal.
        anonymous = browser.new_context(viewport={"width": 375, "height": 900})
        access = anonymous.new_page()
        access.goto(root, wait_until="networkidle")
        access.get_by_role("button", name="Abrir navegación", exact=True).click()
        access.locator(".btn-menu .nav-btn").first.click()
        expect(access.locator("#portal-navigation")).not_to_be_visible()
        modal = access.locator(".auth-modal .ivu-modal-content")
        expect(modal).to_be_visible()
        access.screenshot(path=str(args.output / "acceso-estudiante-final-375.png"), full_page=True, animations="disabled")
        modal.locator('input[type="text"]').first.fill("estudiante-demo")
        modal.locator('input[type="password"]').fill(state["student_password"])
        with access.expect_response(lambda r: "/api/login" in r.url and r.request.method == "POST") as authenticated:
            modal.locator(".auth-submit-btn").click()
        assert not authenticated.value.json()["error"]
        expect(modal).not_to_be_visible()
        assert anonymous.request.get(root + "/api/profile").json()["data"]["user"]["username"] == "estudiante-demo"
        browser.close()

    result = {"routes_checked": len(routes), "page_errors": errors, "translation_warnings": warnings,
              "overflows": overflows, "smtp_external_messages": 0, "smtp_delivery_mocked": True,
              "smtp_admin_saved": True, "private_cases_preserved": True, "verdicts": verdicts,
              "release_notes_repo_backed": True, "release_retry_and_text_safety": True, "reduced_motion": True,
              "contrast": contrasts, "mobile_login_via_ui": True}
    (args.output / "result.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
    assert not errors and not overflows, result
    print(json.dumps(result))


if __name__ == "__main__":
    main()
