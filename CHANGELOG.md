# LizardJudge — historial de versiones

Las notas visibles en la aplicación se generan desde este archivo al compilar.
Las entradas describen funciones implementadas; no acreditan un despliegue.

## [2.2.2] - 2026-11-27

### Experiencia
- Tema oscuro legible en todo el sitio: filas alternas de las tablas, menú lateral de concursos y problemas, tarjetas del resumen del concurso, lista de concursos, encabezado del envío, bloques de código de «Acerca de», etiquetas de la sesión y configuración del perfil y la cuenta ya no muestran texto oscuro sobre fondo oscuro ni paneles blancos.
- Encabezados de las tablas de envíos y del detalle del envío con texto legible; botones «Rejuzgar» y «Compartir», enlaces, menú de configuración, barra de carga y botón «Volver arriba» con los colores de la marca en lugar del azul por defecto.
- Etiquetas «Aceptado» y cifras de aciertos con contraste suficiente; la gráfica de estadísticas ya no corta los porcentajes y su leyenda se lee en ambos temas.
- La tabla de clasificaciones de un concurso sin participantes ya no deja un gran espacio vacío y la lista de concursos queda dentro de su panel.
- En tema oscuro el editor de código arranca con un tema oscuro; los modales usan la misma tipografía que el resto del sitio.
- El menú superior ya no falla al cambiar el ancho de la ventana por encima o por debajo de 1120 px.

### Idioma
- Mensajes de validación en español en el inicio de sesión, el registro, la recuperación de contraseña y el editor de problemas (antes salían «username is required» o «title is required»).
- El registro vuelve a validar usuario, correo, contraseña y captcha al pulsar «Registrarse».
- «Lenguaje» para el lenguaje de programación, «Problema» en la columna de envíos, «Repite la contraseña», «Todos los concursos», duración de concursos («2 días»), cuenta regresiva, aviso de inicio de sesión requerido, títulos de las pestañas del navegador y tipo y estado de los concursos en administración.

### Privacidad
- Se retira Google Analytics heredado del proyecto original: la navegación de los estudiantes ya no se envía a terceros.

## [2.2.1] - 2026-11-05

### Tutor
- «Proponer con IA» espera hasta 120 s la respuesta en lugar de 45 s: el servidor genera la propuesta en unos 60 a 90 s.
- Mientras se genera, el aviso dice «Generando la propuesta… puede tardar hasta 90 s.» y muestra los segundos transcurridos.
- La ruta de la propuesta tiene su propio límite de espera en el proxy (115 s); el resto de la API mantiene 60 s.

## [2.2.0] - 2026-11-05

### Tutor
- Nuevo botón «Proponer con IA» en la pestaña Tutor del problema: rellena conceptos, explicaciones y las tres pistas para que el docente las revise, las edite y las guarde como borrador. No guarda ni activa nada por sí solo y pide confirmación antes de reemplazar lo ya escrito.

### Administración
- Los concursos se pueden eliminar desde la lista, con confirmación; si ya tienen envíos se muestra el motivo y no se borra.
- Al agregar problemas a un concurso la interfaz ya no se desordena: botones de acción de una sola fila, filas bajo el puntero legibles en el tema oscuro, página activa visible y confirmaciones con el tema oscuro.
- Las listas de concursos y de problemas del concurso, y el diálogo «Agregar desde problema público», caben en el celular sin esconder el título; las acciones pasan a la fila expandible.
- El diálogo para agregar problemas muestra el nombre del problema, exige un ID de visualización, no deja el indicador de carga atascado si falla la consulta y usa la regla (ACM/OI) del concurso actual.
- Al eliminar un problema se recarga la página actual de la lista en lugar de pedir una página inexistente.

## [2.1.2] - 2026-11-05

### Administración
- Los diálogos (editar usuario y demás) vuelven a aparecer por encima de la capa oscura y aceptan clics.
- Menú lateral con texto e iconos alineados, la página actual resaltada y nombres largos completos.
- Etiquetas de formularios sin palabras cortadas e interruptores grises cuando están apagados.
- Icono de pantalla completa a su tamaño y campos de fecha sin el reloj encima del texto.
- Tema oscuro: títulos de panel, buscador, paginación, botones secundarios, editor y avisos legibles.

## [2.1.1] - 2026-11-05

### Tutor
- El problema con entrenamiento encendido pero sin conceptos ni pistas activos ya no dice que tu cuenta no está habilitada: explica que el docente aún debe activarlos.
- La edición de problemas avisa al docente cuando falta activar una versión pedagógica.
- El aviso de entrenamiento indica pulsar «Iniciar entrenamiento» en lugar de «iniciar sesión».

## [2.1.0] - 2026-11-05

### Experiencia
- Nueva lagartija ilustrada con cuatro etapas, parpadeo, cola animada y festejo al tocarla.
- Panel «Mi práctica» renovado: progreso hacia la siguiente etapa, mensajes de ánimo y accesos directos.
- Colores y accesorios bloqueados visibles con el número de logros necesarios.
- Tu lagartija reacciona al veredicto de cada envío con un consejo breve.

### Tutor
- Explicaciones más concretas según el veredicto, el lenguaje y el mensaje del compilador.

## [2.0.0] - 2026-10-25

### Experiencia
- Nueva identidad visual en verde, guinda y tonos pastel, con temas claro y oscuro.
- Navegación adaptable, formularios ordenados y botones preparados para textos largos.
- Transiciones discretas que respetan la preferencia de movimiento reducido.

### Administración
- Configuración de SMTP, remitente, cifrado y prueba de correo desde administración.
- Compatibilidad con Resend y conservación de la contraseña al editar sin reemplazarla.
- Entrada y salida de casos mediante texto, conservando la importación ZIP.

### Plataforma
- Práctica personal, tutor de programación y seguimiento de avances.
- Notas de versión generadas desde el repositorio y vinculadas a la revisión instalada.
