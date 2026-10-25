# Dependencias del frontend conservado en Vue 2

El inventario del 23/10/2026 no es una certificación de ausencia de vulnerabilidades.
Después de actualizar Axios, jQuery (también las copias del editor), PapaParse,
KaTeX, Highlight.js, Moment y transitivas compatibles, Yarn informa 2 ocurrencias
bajas, 67 moderadas, 21 altas y 6 críticas; 28 avisos distintos. El inventario JSON
contiene identificador, versión, ruta y enlace. Antes había 557 ocurrencias.

Las altas y críticas restantes corresponden al compilador y servidor de desarrollo.
No se copian `node_modules`, Node, Webpack ni el servidor de desarrollo a la imagen
final. La compilación sí necesita protegerse: se aplica un backport determinista
antes de compilar, con SHA-256 del original y del resultado; cualquier diferencia
detiene la instalación. `--ignore-scripts` no sirve para producir una entrega.

| Dependencia | Tratamiento comprobado |
| --- | --- |
| Babel traverse 6.26 | Desactiva toda evaluación estática de llamadas. La transformación conserva su semántica; puede perder una optimización. Regresión del exploit de ejecución de código. |
| HTML minifier 3.5 | Desactiva fragmentos personalizados, origen del ReDoS. Prueba de rechazo acotado y HTML normal. |
| PostCSS 5/6/8.4 | Impide carga implícita de ficheros `.map` desde comentarios CSS. Conserva inline y `prev` de configuración de confianza. Regresión en todas las copias instaladas. |
| Webpack dev middleware 1.12 | Valida prefijo y confinamiento de la ruta decodificada al directorio de salida; pruebas de recorrido y colisión de prefijo. El servidor solo escucha loopback. |

La excepción por cada aviso es temporal hasta **22/11/2026**, responsable
BenjaminSM04; está acotada por ID, versión y ruta. `node build/audit-dependencies.js`
ejecuta la auditoría completa, rechaza alertas altas/críticas desconocidas o vencidas
y exige regresiones e integridad. No modifica el resultado bruto del escáner.
Una nueva versión debe revisarse y renovar la excepción con evidencia; el código
no la renueva automáticamente.

Las moderadas pendientes incluyen analizadores del build antiguo, Vue 2/compiler,
ECharts/zrender y las dependencias Node de la conversión HTML del editor. Los
templates se compilan desde código confiable, nunca desde HTML de problemas.
El backend sanea el HTML, los nombres de archivos se insertan como texto y KaTeX
mantiene `trust=false`. El navegador sigue procesando contenido y estas alertas
son deuda abierta; no se declara PB-28 aprobada ni un piloto autorizado.

No aplicar actualizaciones mayores generales para silenciar el escáner: comprobar
edición Markdown, fórmulas, CSV, uploads y ambas entradas con el lockfile actualizado.
Los backports locales tampoco reemplazan una revisión de seguridad independiente.
