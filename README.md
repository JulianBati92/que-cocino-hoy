# ¿Qué Cocino Hoy?

Proyecto personal para resolver una pregunta cotidiana: qué cocinar con lo que ya hay en casa. La aplicación combina ingredientes, una foto opcional y preferencias escritas con palabras propias para proponer cinco recetas posibles.

[Ver aplicación en producción](https://quecocinohoy.vercel.app) · [Documentación legal](https://quecocinohoy.vercel.app/legal)

## Qué quise resolver

Una lista de ingredientes no alcanza para explicar cómo come una persona. Alguien puede no querer un bife, pero sí una milanesa; aceptar zanahoria cocida, pero no cruda; o evitar el morrón quemado sin eliminarlo por completo. Esos matices terminaron siendo una parte central del producto.

## Qué permite hacer

¿Qué Cocino Hoy? permite:

- cargar ingredientes manualmente;
- usar una fotografía como referencia visual;
- indicar dieta, tiempo, porciones y momento del día;
- describir gustos, texturas y formas de cocción preferidas;
- recibir cinco propuestas ordenadas por coincidencia y menor necesidad de compras;
- consultar cantidades, reemplazos, faltantes, seguridad y pasos detallados;
- guardar recetas favoritas en el dispositivo;
- acceder mediante correo o Google;
- probar tres generaciones gratuitas y contratar Premium con Mercado Pago.

## Tecnologías

- Next.js 16 y React 19
- TypeScript con modo estricto
- Firebase Authentication y Firebase Admin
- Google Gemini con salida JSON estructurada
- Mercado Pago Subscriptions y webhooks
- Vercel Functions y despliegues de producción
- CSS responsive sin una biblioteca visual externa

## Arquitectura

```text
Navegador
  ├─ Firebase Authentication
  ├─ interfaz responsive y favoritos locales
  └─ API de Next.js
       ├─ verificación de identidad y cupos
       ├─ Gemini: generación estructurada
       ├─ Firebase: membresías
       └─ Mercado Pago: suscripción y webhook
```

Las claves privadas se usan únicamente en el servidor. Las variables `NEXT_PUBLIC_*` contienen la configuración pública necesaria para inicializar Firebase en el navegador.

Más detalles en [docs/architecture.md](docs/architecture.md).

## Ejecutar localmente

Requisitos:

- Node.js 22
- un proyecto de Firebase;
- una clave de Gemini;
- credenciales de Mercado Pago para probar suscripciones.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abrí `http://localhost:3000`.

## Variables de entorno

| Variable                      | Alcance  | Uso                                      |
| ----------------------------- | -------- | ---------------------------------------- |
| `GEMINI_API_KEY`              | Servidor | Generación de recetas                    |
| `MERCADOPAGO_ACCESS_TOKEN`    | Servidor | Suscripciones y verificación de webhooks |
| `FIREBASE_ADMIN_PROJECT_ID`   | Servidor | Firebase Admin                           |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Servidor | Cuenta de servicio                       |
| `FIREBASE_ADMIN_PRIVATE_KEY`  | Servidor | Firma de credenciales                    |
| `ADMIN_EMAIL`                 | Servidor | Acceso administrativo                    |
| `NEXT_PUBLIC_APP_URL`         | Público  | URL canónica y callbacks                 |
| `NEXT_PUBLIC_FIREBASE_*`      | Público  | Inicialización del cliente Firebase      |

No agregues `.env.local` ni credenciales reales al repositorio.

## Verificación

```bash
npm run typecheck
npm run build
```

El build valida TypeScript y genera las rutas estáticas y dinámicas utilizadas en producción.

## Decisiones de producto

- **Preferencias escritas libremente:** surgieron para representar casos como “carne sólo en milanesa” o “zanahoria, pero no cruda”, que un selector rígido no puede describir bien.
- **Respuesta JSON estructurada:** reduce resultados incompletos y mantiene la interfaz consistente.
- **Tres usos gratuitos por cuenta:** permite probar el producto antes de la suscripción.
- **Guardado del cupo con respaldo:** Firebase Auth funciona como contingencia si Firestore no está disponible.
- **Privacidad por diseño:** las imágenes se procesan sólo para responder la solicitud y se desalienta cargar datos sensibles.
- **Mobile first:** formularios, navegación, modales y contenido legal se adaptan a pantallas táctiles.

## Cómo fue evolucionando

El primer flujo se concentraba en cargar ingredientes y obtener recetas. Durante las iteraciones incorporé cambios que aparecieron al usar la aplicación como producto real:

- una bienvenida más clara, con imágenes y mensajes rotativos;
- una explicación breve del proceso antes del formulario;
- preferencias detalladas de sabor, textura y cocción;
- una experiencia completa para celulares, no sólo una versión reducida del escritorio;
- tres generaciones gratuitas y una continuidad Premium mediante Mercado Pago;
- avisos de seguridad alimentaria, privacidad y documentación legal accesible desde el sitio.

El objetivo no fue sumar opciones por cantidad, sino hacer que el resultado se parezca más a lo que la persona realmente cocinaría.

## Limitaciones conocidas

- Las recetas generadas por IA deben revisarse antes de cocinar.
- Una imagen no permite confirmar alérgenos, ingredientes ocultos ni estado sanitario.
- El texto legal requiere completar los datos reales del responsable comercial.
- El mecanismo de cupos en Firebase Auth es una contingencia; para mayor escala conviene usar una base transaccional con permisos correctamente configurados.

## Seguridad

Consultá [SECURITY.md](SECURITY.md) para reportar vulnerabilidades. No abras incidencias públicas con credenciales, tokens o datos personales.

## Licencia

Este proyecto se distribuye bajo la licencia MIT. Consultá [LICENSE](LICENSE).
