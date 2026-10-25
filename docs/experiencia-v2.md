# Experiencia LizardJudge 2.0

La versión se define en `VERSION`. La interfaz conserva Vue 2, iView y Element UI;
no introduce otra biblioteca de componentes. La identidad combina verde, guinda,
menta y rosa pastel para el contexto de Univalle.

## Cambios de interacción

- Portal con navegación adaptable, accesos a problemas/progreso, práctica personal
  distribuida en tarjetas y estados vacíos explícitos.
- Catálogo con tabla de escritorio y tarjetas de móvil. Se corrigió el límite de
  paginación enviado a la API para que coincida con el selector.
- Administración con navegación lateral desplegable en móvil, títulos según la
  sección, controles con etiquetas accesibles y botones que admiten varias líneas.
- Editor separado en Enunciado, Evaluación y Tutor. Los paneles se ocultan sin
  destruir sus editores ni borradores. Los errores de validación y los casos sin
  aplicar llevan a la sección correspondiente; las pestañas admiten teclado.
- Correo, Sitio y Diagnóstico organizados en pestañas. SMTP configura servidor,
  puerto, usuario, cifrado, clave, correo y nombre del remitente desde el panel.
  La prueba exige configuración guardada y destinatario explícito. Editar sin
  contraseña conserva la existente; editar mientras guarda no borra una clave nueva.
- Animaciones discretas en navegación, transiciones, carga y marca. Todas respetan
  `prefers-reduced-motion`. El modo oscuro comparte las mismas variables de color.

## Notas y versión desde el repositorio

`build/version.js` lee `VERSION` y `CHANGELOG.md` del checkout y genera
`dist/version.json` y `dist/release-notes.json` en cada compilación. La interfaz
consulta ese manifiesto en la raíz del sitio con un cliente HTTP que no hereda
el prefijo `/api`. El tablero y `/changelog` usan el mismo componente.

El enlace a GitHub señala `CHANGELOG.md` de la revisión suministrada mediante
`APP_REVISION`. Los detalles se muestran como texto, nunca como HTML remoto. Un
archivo ausente o inválido muestra un error recuperable. No se usa el JSON antiguo
del upstream ni se confunde la versión instalada con una publicación futura.

Las notas se actualizan al compilar y desplegar el código del repositorio. No se
consulta GitHub desde el navegador ni se expone un token de repositorio privado.

## Marca

`src/assets/logo-v2.png` es una nueva versión del icono; el original permanece.
`BrandMark.vue` unifica el nombre, la afiliación y la versión visible. El favicon
SVG es una variante simplificada para tamaños pequeños. No sustituye un escudo
institucional de la universidad.

## Comprobaciones

`yarn lint`, `yarn test:tutor` y la auditoría existente forman parte de CI. El test
de notas edita un historial temporal y comprueba que cambie el manifiesto, además
de fijar el enlace a su revisión y rechazar versiones inválidas.

`tests/visual-v2.py` usa Chromium contra un proyecto ficticio identificado de Docker,
con puertos exclusivamente locales. Comprueba páginas a 320/768/1440, ambos temas,
desbordamientos, botones, navegación, guardado SMTP y conservación de contraseña,
casos privados, peticiones demoradas, juicio WA/AC, notas, reintento, texto seguro y
movimiento reducido. La entrega de correo se intercepta: no se envía correo externo.

Ejemplo: `python tests/visual-v2.py --state RUTA_PRIVADA/state.json --output RUTA_PRIVADA/evidencias`.
Las credenciales ficticias y capturas operativas se mantienen fuera de Git.

Esta rama depende de `integracion/produccion-lizardjudge`. No fusionar ni desplegar
hasta que el responsable cierre la revisión visual y coordine el corte de PG17.
