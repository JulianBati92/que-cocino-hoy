# Arquitectura y decisiones técnicas

## Flujo principal

1. La persona inicia sesión con Firebase Authentication.
2. La interfaz reúne ingredientes, foto opcional, restricciones y preferencias.
3. `/api/recipes` verifica el token y la disponibilidad del cupo.
4. La solicitud se convierte en un prompt con un esquema JSON estricto.
5. Gemini devuelve cinco recetas estructuradas.
6. La interfaz muestra coincidencia, cantidades, faltantes, reemplazos y pasos.

## Autenticación

El navegador obtiene un ID token de Firebase. Las rutas privadas lo verifican con Firebase Admin antes de procesar información o iniciar un pago.

## Generación estructurada

La API define un esquema que exige los campos necesarios para renderizar cada receta. Esto evita depender de texto libre para construir la interfaz y permite validar la forma de la respuesta.

## Membresías y cupos

El plan gratuito permite tres generaciones. Firestore es la fuente principal prevista para el estado de membresía. Mientras sus permisos administrativos no estén disponibles, los custom claims de Firebase Authentication actúan como respaldo.

El respaldo mantiene el producto operativo, pero no reemplaza una transacción atómica bajo concurrencia elevada. Antes de escalar, debe configurarse correctamente IAM y consolidarse el contador en una base transaccional.

## Pagos

El servidor crea una suscripción mensual en Mercado Pago usando `external_reference` para asociarla al usuario. El webhook consulta la suscripción directamente en Mercado Pago antes de activar Premium.

## Privacidad

- Las credenciales privadas sólo existen en el entorno del servidor.
- La configuración web de Firebase usa variables públicas separadas.
- Los favoritos se conservan localmente en el navegador.
- Las fotos se incluyen únicamente en la solicitud de generación.
- Los documentos legales explican proveedores, transferencias y derechos.

## Despliegue

Vercel construye la aplicación Next.js, aloja los recursos estáticos y ejecuta las rutas API como funciones de servidor. Las variables se administran en el proyecto remoto y no forman parte del repositorio.
