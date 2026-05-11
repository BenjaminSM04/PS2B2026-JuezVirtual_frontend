param(
    [int[]]$Only = @(),
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

$Repo        = "BenjaminSM04/PS2B2026-JuezVirtual_frontend"
$ProjectNum  = 1
$ProjectId   = "PVT_kwHOCFVUtM4BQ4mO"
$Owner       = "BenjaminSM04"

$FieldStatus   = "PVTSSF_lAHOCFVUtM4BQ4mOzg-4CJM"
$FieldPriority = "PVTSSF_lAHOCFVUtM4BQ4mOzg-4C_A"
$FieldSize     = "PVTSSF_lAHOCFVUtM4BQ4mOzg-4C_E"
$FieldEstimate = "PVTF_lAHOCFVUtM4BQ4mOzg-4C_I"
$FieldSprint   = "PVTF_lAHOCFVUtM4BQ4mOzg-4EtU"

$StatusBacklog = "f75ad846"

$PriorityMap = @{
    "Urgente" = "79628723"
    "Alta"    = "0a877460"
    "Media"   = "da944a9c"
    "Baja"    = "a97a40cf"
}

$SizeMap = @{
    "XS" = "6c6483d2"
    "S"  = "f784b110"
    "M"  = "7515a9f1"
    "L"  = "817d0097"
    "XL" = "db339eb2"
}

$Tasks = @(
    @{
        Num = 1; Sprint = "Sprint 2"; Assignee = "BenjaminSM04"; Priority = "Alta"; Size = "S"; Estimate = 180
        Title = "Bug: Reparar renderizado de LaTeX en la directiva v-katex"
        Body = @'
## Descripcion
El plugin `src/plugins/katex.js` registra la directiva `v-katex` con el hook `bind`,
que se ejecuta antes que `v-html` inserte el HTML real en el DOM. Como resultado,
`renderMathInElement` actua sobre un contenido vacio y las formulas matematicas no se ven.
Ademas, `Object.assign(options, defaultOptions)` esta al reves y sobrescribe las opciones del usuario.

## Archivos
- `src/plugins/katex.js`

## Cambios
- Cambiar `bind: render` por `inserted: render` (manteniendo `componentUpdated`).
- Envolver `renderMathInElement` dentro de `Vue.nextTick(() => ...)` para asegurar que el DOM ya este actualizado.
- Corregir el merge de opciones: `Object.assign({}, defaultOptions, options)`.

## Criterio de aceptacion
Las formulas `$x^2$`, `$$\int_0^1 f(x)dx$$` y `\(x\)` se renderizan correctamente en:
- `src/pages/oj/views/problem/Problem.vue`
- `src/pages/oj/views/general/Announcements.vue`
'@
    },
    @{
        Num = 2; Sprint = "Sprint 2"; Assignee = "BenjaminSM04"; Priority = "Alta"; Size = "S"; Estimate = 60
        Title = "Habilitar LaTeX en las descripciones de concursos (panel OJ)"
        Body = @'
## Descripcion
Las descripciones de los concursos pueden contener formulas LaTeX, pero el contenedor
que las renderiza no tiene aplicada la directiva `v-katex`. Hay que agregarla.

## Archivos
- `src/pages/oj/views/contest/ContestDetail.vue` (linea 21 aprox)

## Cambios
- Agregar `v-katex` al elemento `<div v-html="contest.description">`.

## Criterio de aceptacion
Crear un concurso con una descripcion que contenga `$E = mc^2$`: la formula debe verse renderizada al abrir el detalle del concurso.

## Dependencia
Depende del fix general de LaTeX (tarea 1).
'@
    },
    @{
        Num = 3; Sprint = "Sprint 2"; Assignee = "BenjaminSM04"; Priority = "Alta"; Size = "S"; Estimate = 120
        Title = "Personalizar la pagina de Inicio de Sesion del estudiante con la marca LizardJudge Univalle"
        Body = @'
## Descripcion
El modal/pagina de Login del lado estudiante todavia usa estilos genericos. Hay que aplicar la marca LizardJudge Univalle, paleta UPV y mensajes en espanol.

## Archivos
- `src/pages/oj/views/user/Login.vue`

## Cambios
- Logo LizardJudge Univalle en la cabecera del modal.
- Paleta de colores UPV en botones y campos.
- Mensajes en espanol claros (errores de credenciales, contrasena olvidada).
- Mejorar UX: loader durante login, mensaje de bienvenida.

## Criterio de aceptacion
Al abrir el modal de Login, se ve el branding UPV, todos los textos estan en espanol y el flujo de login funciona sin regresiones.
'@
    },
    @{
        Num = 4; Sprint = "Sprint 2"; Assignee = "BenjaminSM04"; Priority = "Media"; Size = "S"; Estimate = 120
        Title = "Reescribir el README.md en espanol con la marca LizardJudge Univalle (UPV - La Paz)"
        Body = @'
## Descripcion
El README.md actual esta en ingles y referencia el proyecto original OnlineJudgeFE. Hay que reescribirlo en espanol como LizardJudge Univalle, plataforma de juez en linea para la Universidad Privada del Valle (UPV) - La Paz.

## Archivos
- `README.md`

## Estructura propuesta
1. Titulo: `# LizardJudge Univalle`
2. Descripcion: plataforma de juez en linea para la UPV - La Paz, basada en OnlineJudgeFE.
3. Equipo: Benjamin (Scrum Master + Dev), Brisa, Abigail, Brenda.
4. Stack: Vue 2.7 + Vuex + Element UI + iView + KaTeX + Webpack 3.
5. Requisitos previos (Node >= 8, npm).
6. Setup paso a paso (Windows y Linux): `npm install`, `build:dll`, `dev`, `build`, `lint`.
7. Capturas: splash, dashboard.
8. Atribucion al proyecto original (QingdaoU/OnlineJudgeFE) y licencia MIT.

## Criterio de aceptacion
El README abre limpio en GitHub, todo el contenido esta en espanol, las instrucciones de setup funcionan en Windows con PowerShell, y se mantiene la atribucion al proyecto original.
'@
    },
    @{
        Num = 5; Sprint = "Sprint 2"; Assignee = "BrisaCriales"; Priority = "Alta"; Size = "S"; Estimate = 180
        Title = "Personalizar la pagina de Inicio (Home) del estudiante con branding UPV"
        Body = @'
## Descripcion
La pagina Home del lado estudiante (carrusel de concursos + lista de anuncios) todavia tiene el estilo original de OnlineJudge. Hay que aplicar el branding UPV.

## Archivos
- `src/pages/oj/views/general/Home.vue`

## Cambios
- Paleta UPV en el carrusel de concursos y en la seccion de anuncios.
- Mensaje de bienvenida: "Bienvenido a LizardJudge Univalle".
- Subtitulo con frase institucional UPV.
- Iconos consistentes con el resto del panel OJ.

## Criterio de aceptacion
Al entrar al sitio como estudiante, la pagina principal muestra la marca UPV claramente y todos los textos estan en espanol.
'@
    },
    @{
        Num = 6; Sprint = "Sprint 2"; Assignee = "BrisaCriales"; Priority = "Alta"; Size = "S"; Estimate = 120
        Title = "Personalizar la Lista de Concursos del lado estudiante (panel OJ)"
        Body = @'
## Descripcion
La lista de concursos que ve el estudiante todavia esta en estilo original. Hay que adaptarla a UPV.

## Archivos
- `src/pages/oj/views/contest/ContestList.vue`

## Cambios
- Chips de estado ("En curso", "Proximo", "Finalizado") con colores UPV.
- Iconos coherentes con el panel admin de concursos.
- Estilo de cards/lista en paleta UPV.
- Textos en espanol revisados.

## Criterio de aceptacion
El estudiante ve los concursos con estilo UPV consistente; los estados son inmediatamente reconocibles por color.
'@
    },
    @{
        Num = 7; Sprint = "Sprint 2"; Assignee = "BrisaCriales"; Priority = "Media"; Size = "S"; Estimate = 180
        Title = "Personalizar la Lista de Problemas del lado estudiante (panel OJ)"
        Body = @'
## Descripcion
La tabla de problemas del estudiante usa estilos por defecto. Hay que aplicar branding UPV y mejorar la legibilidad.

## Archivos
- `src/pages/oj/views/problem/ProblemList.vue`

## Cambios
- Estilo de tabla con paleta UPV.
- Badges de dificultad (Facil, Medio, Dificil) con colores UPV.
- Filtros y tags traducidos al espanol.
- Mensaje amigable cuando la lista esta vacia.

## Criterio de aceptacion
La lista se ve clara, los filtros funcionan en espanol y los badges de dificultad son consistentes con el resto del UI.
'@
    },
    @{
        Num = 8; Sprint = "Sprint 2"; Assignee = "AbigailAranda"; Priority = "Alta"; Size = "S"; Estimate = 120
        Title = "Personalizar la pagina de Registro de usuario con branding UPV"
        Body = @'
## Descripcion
La pagina de Registro tiene estilo original y mensajes de error en ingles. Hay que adaptarla a UPV y mejorar las validaciones visuales.

## Archivos
- `src/pages/oj/views/user/Register.vue`

## Cambios
- Estilo UPV en formulario y botones.
- Mensajes de error en espanol claros.
- Validaciones visuales (contrasenas coinciden, formato de email).
- Texto de bienvenida al registrar.

## Criterio de aceptacion
Un usuario nuevo puede registrarse, recibe mensajes claros si comete errores y ve la marca UPV en todo el proceso.
'@
    },
    @{
        Num = 9; Sprint = "Sprint 2"; Assignee = "AbigailAranda"; Priority = "Media"; Size = "S"; Estimate = 180
        Title = "Personalizar la Lista de Envios del estudiante (panel OJ)"
        Body = @'
## Descripcion
La lista de envios (submissions) del estudiante todavia muestra estados con colores genericos.

## Archivos
- `src/pages/oj/views/submission/SubmissionList.vue`

## Cambios
- Colores de estado con paleta UPV: Accepted (verde), Wrong Answer (rojo), Time Limit (amarillo), etc.
- Iconos por estado.
- Tooltips traducidos al espanol.
- Estilo de tabla consistente con ProblemList.

## Criterio de aceptacion
El estudiante identifica el estado de sus envios de un vistazo gracias al color y los iconos.
'@
    },
    @{
        Num = 10; Sprint = "Sprint 2"; Assignee = "AbigailAranda"; Priority = "Media"; Size = "S"; Estimate = 120
        Title = "Personalizar el Detalle de Envio del estudiante (panel OJ)"
        Body = @'
## Descripcion
La vista de detalle de envio (codigo enviado, resultado de cada test) usa estilos por defecto.

## Archivos
- `src/pages/oj/views/submission/SubmissionDetails.vue`

## Cambios
- Bloque de codigo con sintaxis resaltada y paleta UPV.
- Headers en espanol con estilo consistente.
- Resultados por test case con iconos claros.

## Criterio de aceptacion
Al abrir un envio el estudiante ve su codigo legible, el veredicto destacado y los detalles de cada test case organizados.
'@
    },
    @{
        Num = 11; Sprint = "Sprint 2"; Assignee = "brendachallco7-spec"; Priority = "Alta"; Size = "S"; Estimate = 180
        Title = "Personalizar los Rankings ACM y OI con podio y branding UPV"
        Body = @'
## Descripcion
Las paginas de ranking ACM y OI tienen estilo original. Hay que aplicar branding UPV y destacar visualmente el top 3.

## Archivos
- `src/pages/oj/views/rank/ACMRank.vue`
- `src/pages/oj/views/rank/OIRank.vue`

## Cambios
- Estilo de tabla con paleta UPV.
- Podio para los primeros 3 lugares con destaque visual.
- Avatares de usuarios.
- Textos y tooltips traducidos al espanol.

## Criterio de aceptacion
Los estudiantes ven el ranking con el top 3 destacado y todo en espanol con la marca UPV.
'@
    },
    @{
        Num = 12; Sprint = "Sprint 2"; Assignee = "brendachallco7-spec"; Priority = "Media"; Size = "S"; Estimate = 180
        Title = "Personalizar la Configuracion de usuario (Perfil y Cuenta) en el panel OJ"
        Body = @'
## Descripcion
Las paginas de Perfil y Cuenta del estudiante tienen estilo por defecto.

## Archivos
- `src/pages/oj/views/setting/ProfileSetting.vue`
- `src/pages/oj/views/setting/AccountSetting.vue`

## Cambios
- Layout limpio con secciones diferenciadas.
- Mensajes en espanol claros (cambios guardados, errores).
- Validaciones visibles bajo cada campo.
- Paleta UPV en botones y campos.

## Criterio de aceptacion
El estudiante puede actualizar su perfil y cuenta con feedback claro en cada accion.
'@
    },
    @{
        Num = 13; Sprint = "Sprint 2"; Assignee = "brendachallco7-spec"; Priority = "Baja"; Size = "S"; Estimate = 120
        Title = "Disenar mensajes de 404, Error y Loading con identidad UPV"
        Body = @'
## Descripcion
Las paginas de error (404, error generico) y los estados de carga deben tener identidad UPV y mensajes amigables.

## Archivos
- Buscar componentes existentes de NotFound y Loading dentro de `src/pages/oj/`.
- Si no existen, crearlos en `src/pages/oj/components/`.

## Cambios
- Mensaje amigable en espanol ("La pagina no existe", "Algo salio mal", etc.).
- Logo o ilustracion UPV.
- Boton para volver al inicio.

## Criterio de aceptacion
Al visitar una URL invalida o ante un error, el estudiante ve una pantalla con identidad UPV y puede volver al inicio facilmente.
'@
    },
    @{
        Num = 14; Sprint = "Sprint 3"; Assignee = "BenjaminSM04"; Priority = "Alta"; Size = "M"; Estimate = 1440
        Title = "Integrar previsualizacion de LaTeX en vivo dentro del editor Simditor (admin)"
        Body = @'
## Descripcion
El editor Simditor que usan los admins para crear problemas no renderiza LaTeX en el preview. Hay que enganchar el evento `valuechanged` para reprocesar KaTeX al escribir.

## Archivos
- `src/pages/admin/components/Simditor.vue`

## Cambios
- Hookear el evento `valuechanged` del editor para llamar a `renderMathInElement` sobre el area de preview.
- Asegurar que el render se ejecute despues del proximo tick del DOM.

## Criterio de aceptacion
Al escribir `$x^2$` en el editor de creacion de problema, el preview muestra la formula renderizada en vivo.

## Dependencia
Depende del fix general de LaTeX (tarea 1).
'@
    },
    @{
        Num = 15; Sprint = "Sprint 3"; Assignee = "BenjaminSM04"; Priority = "Media"; Size = "S"; Estimate = 180
        Title = "Hacer responsive el formulario de creacion/edicion de problemas del admin"
        Body = @'
## Descripcion
El formulario de problemas del admin usa spans fijos (`:span="6"`, `:span="18"`) que no responden en pantallas pequenas.

## Archivos
- `src/pages/admin/views/problem/Problem.vue`

## Cambios
- Reemplazar los spans fijos por breakpoints (`:xs="24" :sm="12" :md="6"`) en cada fila del formulario.

## Criterio de aceptacion
El formulario se ve correctamente en viewports de 375px, 768px y 1024px sin que ningun campo desborde.
'@
    },
    @{
        Num = 16; Sprint = "Sprint 3"; Assignee = "BenjaminSM04"; Priority = "Baja"; Size = "S"; Estimate = 120
        Title = "Personalizar el panel de Importacion/Exportacion de problemas (admin)"
        Body = @'
## Descripcion
La pagina de Import/Export de problemas en el admin tiene textos en ingles y estilo generico.

## Archivos
- `src/pages/admin/views/problem/ImportAndExport.vue`

## Cambios
- Textos en espanol.
- Instrucciones mas claras.
- Estilo UPV en botones y zonas de drag-and-drop.

## Criterio de aceptacion
El admin puede importar y exportar problemas con instrucciones claras en espanol.
'@
    },
    @{
        Num = 17; Sprint = "Sprint 3"; Assignee = "BrisaCriales"; Priority = "Alta"; Size = "S"; Estimate = 180
        Title = "Personalizar el Detalle de Concurso del lado estudiante con cronometro destacado"
        Body = @'
## Descripcion
La vista de detalle de concurso (Overview, Problems, Rank, Submissions, Announcements) tiene estilo original. Hay que aplicar branding UPV y destacar el contador regresivo.

## Archivos
- `src/pages/oj/views/contest/ContestDetail.vue`

## Cambios
- Estilo de pestanas con paleta UPV.
- Contador regresivo destacado.
- Iconos consistentes.

## Criterio de aceptacion
Al abrir un concurso el estudiante ve claramente cuanto falta para que inicie o termine, y puede navegar las pestanas con un diseno UPV.
'@
    },
    @{
        Num = 18; Sprint = "Sprint 3"; Assignee = "BrisaCriales"; Priority = "Alta"; Size = "S"; Estimate = 180
        Title = "Personalizar el Detalle de Problema del lado estudiante (con LaTeX funcionando)"
        Body = @'
## Descripcion
La vista de detalle de problema tiene estilo original. Hay que aplicar branding UPV, mejorar la presentacion del enunciado, los samples y los limites.

## Archivos
- `src/pages/oj/views/problem/Problem.vue`

## Cambios
- Estilo del enunciado con paleta UPV.
- Bloques de sample input/output con codigo resaltado.
- Panel de info (limites de tiempo/memoria) con iconos.

## Dependencia
Trabajar despues del fix de LaTeX (tarea 1) para validar que las formulas se ven correctamente.

## Criterio de aceptacion
El detalle de problema se ve coherente con el resto del sitio, las formulas LaTeX se renderizan correctamente y los samples son legibles.
'@
    },
    @{
        Num = 19; Sprint = "Sprint 3"; Assignee = "BrisaCriales"; Priority = "Baja"; Size = "XS"; Estimate = 60
        Title = "Reforzar validaciones visuales en el formulario de Registro"
        Body = @'
## Descripcion
Tras la personalizacion del Registro (tarea 8), agregar validaciones en vivo mientras el usuario escribe.

## Archivos
- `src/pages/oj/views/user/Register.vue`

## Cambios
- Validar formato de email mientras se escribe.
- Indicador de fortaleza de contrasena.
- Mensajes de error en rojo bajo cada campo.

## Criterio de aceptacion
Al equivocarse al escribir el email, el usuario ve el error de inmediato sin tener que enviar el formulario.

## Dependencia
Depende de la tarea 8 (personalizacion base del Registro).
'@
    },
    @{
        Num = 20; Sprint = "Sprint 3"; Assignee = "AbigailAranda"; Priority = "Media"; Size = "S"; Estimate = 120
        Title = "Revision y mejoras visuales en el panel admin de Judge Server"
        Body = @'
## Descripcion
La pagina de Judge Server ya fue tocada inicialmente (issue #42), pero hay que hacer un segundo pase para consolidar la paleta UPV y mejorar la presentacion.

## Archivos
- `src/pages/admin/views/general/JudgeServer.vue`

## Cambios
- Cards de cada servidor con colores claros de estado (online verde, offline rojo).
- Tipografia y espaciados consistentes con el resto del admin.
- Branding UPV donde aplique.

## Criterio de aceptacion
El admin identifica visualmente que servidores estan activos sin tener que leer texto.
'@
    },
    @{
        Num = 21; Sprint = "Sprint 3"; Assignee = "AbigailAranda"; Priority = "Media"; Size = "S"; Estimate = 180
        Title = "Personalizar la Lista de Problemas del admin (paleta UPV y acciones traducidas)"
        Body = @'
## Descripcion
La lista de problemas en el admin tiene estilo original.

## Archivos
- `src/pages/admin/views/problem/ProblemList.vue`

## Cambios
- Tabla con paleta UPV.
- Badges de visibilidad (publico/privado) con colores.
- Acciones (editar/eliminar/duplicar) con tooltips en espanol.

## Criterio de aceptacion
El admin gestiona problemas con una interfaz consistente con el resto del panel.
'@
    },
    @{
        Num = 22; Sprint = "Sprint 3"; Assignee = "AbigailAranda"; Priority = "Baja"; Size = "XS"; Estimate = 60
        Title = "Validar rangos numericos en los limites de tiempo y memoria del formulario de problemas (admin)"
        Body = @'
## Descripcion
Los campos `time_limit` y `memory_limit` del formulario de problemas aceptan valores negativos o cero.

## Archivos
- `src/pages/admin/views/problem/Problem.vue` (lineas 41 y 46 aprox)

## Cambios
- Agregar reglas `{ type: "number", min: 1 }` a las validaciones de ambos campos.
- Mensaje de error en espanol.

## Criterio de aceptacion
Al intentar guardar un problema con `time_limit = -1` o `memory_limit = 0`, el formulario rechaza el envio con un mensaje claro.
'@
    },
    @{
        Num = 23; Sprint = "Sprint 3"; Assignee = "brendachallco7-spec"; Priority = "Baja"; Size = "S"; Estimate = 120
        Title = "Revision y mejoras visuales en el panel admin de Prune Test Case"
        Body = @'
## Descripcion
La pagina de Prune Test Case ya fue tocada inicialmente (issue #43), pero hay que reforzar la confirmacion antes de borrar y la consistencia UPV.

## Archivos
- `src/pages/admin/views/general/PruneTestCase.vue`

## Cambios
- Modal de confirmacion en rojo antes de eliminar.
- Textos en espanol revisados.
- Paleta UPV consistente con el resto del admin.

## Criterio de aceptacion
El admin no puede borrar test cases por error: siempre debe confirmar via modal explicito.
'@
    },
    @{
        Num = 24; Sprint = "Sprint 3"; Assignee = "brendachallco7-spec"; Priority = "Alta"; Size = "S"; Estimate = 180
        Title = "Revision y mejoras visuales en el panel admin de Concursos (Crear/Editar)"
        Body = @'
## Descripcion
La pagina de creacion/edicion de concursos en el admin ya fue tocada inicialmente (issue #45), pero requiere consolidar el branding UPV y mejorar la experiencia.

## Archivos
- `src/pages/admin/views/contest/Contest.vue`

## Cambios
- Datepicker en espanol.
- Tooltips de ayuda en cada campo.
- Paleta UPV consistente.

## Criterio de aceptacion
El admin crea un concurso completo con fechas en formato local y tiene tooltips de ayuda en cada campo dudoso.
'@
    },
    @{
        Num = 25; Sprint = "Sprint 3"; Assignee = "brendachallco7-spec"; Priority = "Media"; Size = "S"; Estimate = 120
        Title = "Hacer responsive el NavBar del panel OJ con hamburger menu en mobile"
        Body = @'
## Descripcion
El NavBar del lado estudiante no es responsive en pantallas menores a 768px.

## Archivos
- `src/pages/oj/components/NavBar.vue`

## Cambios
- Hamburger menu en viewports menores a 768px.
- Logo mas pequeno en mobile.
- Items del menu colapsables.

## Criterio de aceptacion
En un viewport de 375px (movil) el NavBar muestra hamburger menu y todos los items son accesibles.
'@
    }
)

function Create-Issue {
    param([hashtable]$Task)

    Write-Host ""
    Write-Host "[$($Task.Num)/25] $($Task.Title)" -ForegroundColor Cyan

    if ($DryRun) {
        Write-Host "  (dry-run) Assignee: $($Task.Assignee), Sprint: $($Task.Sprint), Priority: $($Task.Priority), Size: $($Task.Size), Estimate: $($Task.Estimate)" -ForegroundColor Yellow
        return
    }

    $tmpBody = New-TemporaryFile
    Set-Content -Path $tmpBody.FullName -Value $Task.Body -Encoding UTF8

    $issueUrl = gh issue create `
        -R $Repo `
        --title $Task.Title `
        --body-file $tmpBody.FullName `
        --assignee $Task.Assignee

    Remove-Item $tmpBody.FullName

    if (-not $issueUrl) {
        Write-Host "  ERROR: no se obtuvo URL del issue" -ForegroundColor Red
        return
    }

    Write-Host "  Creado: $issueUrl" -ForegroundColor Green

    $itemJson = gh project item-add $ProjectNum --owner $Owner --url $issueUrl --format json | ConvertFrom-Json
    $itemId = $itemJson.id

    if (-not $itemId) {
        Write-Host "  ERROR: no se obtuvo item ID al agregar al project" -ForegroundColor Red
        return
    }

    Write-Host "  Project item: $itemId" -ForegroundColor Gray

    gh project item-edit --id $itemId --project-id $ProjectId --field-id $FieldStatus   --single-select-option-id $StatusBacklog                | Out-Null
    gh project item-edit --id $itemId --project-id $ProjectId --field-id $FieldPriority --single-select-option-id $PriorityMap[$Task.Priority]  | Out-Null
    gh project item-edit --id $itemId --project-id $ProjectId --field-id $FieldSize     --single-select-option-id $SizeMap[$Task.Size]          | Out-Null

    $estimateStr = [string]([double]$Task.Estimate)
    gh project item-edit --id $itemId --project-id $ProjectId --field-id $FieldEstimate --number $estimateStr 2>$null | Out-Null
    gh project item-edit --id $itemId --project-id $ProjectId --field-id $FieldSprint   --text $Task.Sprint  | Out-Null

    Write-Host "  Fields seteados: Status=Backlog, Priority=$($Task.Priority), Size=$($Task.Size), Estimate=$($Task.Estimate), Sprint=$($Task.Sprint)" -ForegroundColor Gray
}

$toRun = @(if ($Only.Count -gt 0) { $Tasks | Where-Object { $Only -contains $_.Num } } else { $Tasks })

Write-Host ""
Write-Host "=== Creando $($toRun.Count) issues ===" -ForegroundColor Magenta

foreach ($task in $toRun) {
    try {
        Create-Issue -Task $task
    } catch {
        Write-Host "  EXCEPCION en tarea $($task.Num): $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Listo ===" -ForegroundColor Magenta
