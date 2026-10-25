# Administración preparada para el corte coordinado

Se conserva Vue 2 y las personalizaciones privadas: PasswordInput, CAPTCHA,
previsualización de CSV sin revelar contraseñas, proxy de Coolify y usuario 101.

Cambios integrados:

- Menús y submenús del editor traducidos, con destrucción segura y conservación
  del contenido al cambiar entre español e inglés.
- Entrada y salida privadas mediante texto, conservando ZIP. Los cambios requieren
  aplicarse antes de guardar; editar durante una petición no marca otro texto
  como guardado. Se confirman reemplazos y pérdidas de borradores.
- Preset Resend, usuario SMTP independiente, selección exclusiva SSL/TLS o
  STARTTLS, y conservación de la clave al guardar sin introducir una nueva.
- Diseño de administración verificado en anchos de 375 y 1280 píxeles.

Lint, pruebas del frontend, auditoría definida por el proyecto y compilación
aprobaron. Chromium probó la pareja de imágenes privadas con datos ficticios y
envíos realmente juzgados WA y AC. No se envió correo externo ni se accedió al
servidor de producción.

Esta versión requiere el backend con `/api/admin/test_case/text` y la ampliación
de SMTP. Publicar o fusionar no sustituye el corte coordinado de PostgreSQL y las
imágenes. Mantener credenciales y respaldos fuera de Git.
