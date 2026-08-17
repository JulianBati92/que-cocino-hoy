import Link from "next/link";

const updated = "16 de agosto de 2026";

export default function LegalPage() {
  return (
    <main className="legal-page">
      <header className="legal-top">
        <Link href="/" className="brand">
          <img className="brand-mark" src="/app-icon-192.png" alt="" />
          <span>
            <strong>¿Qué Cocino Hoy?</strong>
            <small>Centro legal y de privacidad</small>
          </span>
        </Link>
        <Link href="/" className="legal-back">
          Volver a la aplicación
        </Link>
      </header>
      <section className="legal-hero">
        <span className="eyebrow">INFORMACIÓN LEGAL</span>
        <h1>Transparencia para cocinar con confianza.</h1>
        <p>
          En esta página reunimos las condiciones de uso, el tratamiento de
          datos, las tecnologías de almacenamiento y las advertencias
          importantes del servicio.
        </p>
        <small>Última actualización: {updated}</small>
      </section>
      <nav className="legal-nav" aria-label="Contenido legal">
        <a href="#terminos">Términos</a>
        <a href="#privacidad">Privacidad</a>
        <a href="#cookies">Cookies</a>
        <a href="#pagos">Pagos</a>
        <a href="#seguridad">Seguridad alimentaria</a>
        <a href="#contacto">Contacto</a>
      </nav>
      <div className="legal-content">
        <section id="terminos">
          <span>01</span>
          <div>
            <h2>Términos y condiciones de uso</h2>
            <h3>Alcance y aceptación</h3>
            <p>
              Estos términos regulan el acceso y uso de ¿Qué Cocino Hoy?, una
              herramienta digital que genera sugerencias de recetas a partir de
              ingredientes, preferencias e imágenes aportadas por la persona
              usuaria. Al crear una cuenta o usar el servicio aceptás estas
              condiciones. Si no estás de acuerdo, no utilices la plataforma.
            </p>
            <h3>Requisitos de uso</h3>
            <p>
              Debés tener capacidad legal para contratar. Las personas menores
              de 18 años sólo pueden utilizar el servicio con autorización y
              supervisión de su representante legal. La información suministrada
              debe ser lícita, exacta y no vulnerar derechos de terceros.
            </p>
            <h3>Uso permitido</h3>
            <p>
              El servicio es para uso personal. No se permite intentar vulnerar
              la seguridad, automatizar consultas abusivas, revender resultados,
              cargar contenido ilícito o de terceros sin autorización, ni usar
              las recetas para prestar asesoramiento médico o nutricional
              profesional.
            </p>
            <h3>Servicio asistido por inteligencia artificial</h3>
            <p>
              Las recetas son generadas automáticamente y pueden contener
              errores, omisiones o resultados imprecisos. Deben revisarse antes
              de cocinar. El servicio puede cambiar, interrumpirse o limitarse
              por mantenimiento, disponibilidad de proveedores o prevención de
              abuso.
            </p>
            <h3>Contenido aportado</h3>
            <p>
              Conservás los derechos sobre las imágenes y datos que cargás. Nos
              otorgás una autorización limitada, no exclusiva y temporal para
              procesarlos únicamente con el fin de prestar la función
              solicitada. Declarás que contás con autorización para usar ese
              contenido.
            </p>
            <h3>Propiedad intelectual</h3>
            <p>
              La marca, diseño, software y contenidos propios del sitio están
              protegidos. Las sugerencias generadas pueden no ser exclusivas y
              otras personas podrían recibir resultados similares.
            </p>
            <h3>Responsabilidad</h3>
            <p>
              En la máxima medida permitida por la ley aplicable, no
              garantizamos que una receta sea adecuada para una condición
              médica, alergia, dieta o necesidad individual. Nada de estos
              términos limita derechos irrenunciables reconocidos por la
              normativa de defensa del consumidor.
            </p>
          </div>
        </section>
        <section id="privacidad">
          <span>02</span>
          <div>
            <h2>Política de privacidad</h2>
            <h3>Datos tratados y finalidad</h3>
            <p>
              Podemos tratar nombre, correo electrónico, identificadores de
              cuenta y sesión, preferencias culinarias, ingredientes, imágenes
              enviadas para analizar un plato, historial técnico de solicitudes,
              estado de membresía y datos necesarios para gestionar pagos. Los
              usamos para autenticar, generar recetas, administrar el servicio,
              prevenir fraude, brindar soporte y cumplir obligaciones legales.
            </p>
            <h3>Base y consentimiento</h3>
            <p>
              El tratamiento se realiza para ejecutar el servicio solicitado,
              cumplir obligaciones legales, proteger la seguridad y, cuando
              corresponda, con tu consentimiento. No vendemos datos personales.
            </p>
            <h3>Proveedores y transferencias</h3>
            <p>
              Para operar usamos servicios de terceros, entre ellos Google
              Firebase para autenticación y almacenamiento, Google Gemini para
              generación asistida, Vercel para alojamiento y Mercado Pago para
              pagos. Estos proveedores pueden procesar información fuera de
              Argentina bajo sus propias condiciones y medidas de protección.
              Evitá incluir datos sensibles innecesarios en imágenes o textos.
            </p>
            <h3>Conservación</h3>
            <p>
              Conservamos los datos mientras la cuenta esté activa y por el
              tiempo razonablemente necesario para prestar el servicio, resolver
              reclamos, prevenir abuso y cumplir obligaciones legales. Las
              imágenes se envían para procesar la solicitud; no prometemos su
              eliminación inmediata de sistemas temporales o registros de
              proveedores.
            </p>
            <h3>Tus derechos</h3>
            <p>
              Podés solicitar información, acceso, rectificación, actualización
              o supresión de tus datos, y retirar consentimientos cuando
              corresponda. La normativa argentina contempla respuesta al acceso
              dentro de 10 días corridos y a rectificación, actualización o
              supresión dentro de 5 días hábiles. También podés reclamar ante la
              Agencia de Acceso a la Información Pública.
            </p>
            <h3>Decisiones automatizadas</h3>
            <p>
              La selección y redacción de recetas es automatizada. No produce
              decisiones jurídicas ni efectos equivalentes sobre tu persona.
              Podés no utilizar una sugerencia y reformular la consulta.
            </p>
          </div>
        </section>
        <section id="cookies">
          <span>03</span>
          <div>
            <h2>Cookies y almacenamiento local</h2>
            <p>
              La aplicación utiliza almacenamiento local y tecnologías
              equivalentes estrictamente necesarias para mantener la sesión,
              recordar favoritos y conservar preferencias del dispositivo. Los
              servicios de autenticación y pago pueden establecer sus propias
              cookies al abrir sus pantallas. Actualmente no usamos cookies
              publicitarias propias. Si incorporamos analítica o publicidad no
              esencial, actualizaremos esta política y solicitaremos la elección
              correspondiente cuando resulte exigible.
            </p>
            <p>
              Podés borrar estos datos desde la configuración del navegador;
              hacerlo puede cerrar la sesión o eliminar preferencias guardadas.
            </p>
          </div>
        </section>
        <section id="pagos">
          <span>04</span>
          <div>
            <h2>Planes, pagos y cancelación</h2>
            <p>
              Antes de contratar se debe informar de forma clara el precio
              final, moneda, periodicidad, funciones incluidas y cualquier
              limitación. Los pagos se procesan mediante Mercado Pago; no
              almacenamos los datos completos de la tarjeta. La disponibilidad
              del plan depende de la acreditación del pago.
            </p>
            <p>
              La persona usuaria puede cancelar futuras renovaciones desde el
              mecanismo que se habilite o solicitándolo al canal de contacto del
              responsable. La cancelación no afecta el período ya abonado, salvo
              que la ley aplicable reconozca un derecho de revocación, reembolso
              u otra solución más favorable. Los derechos de consumidores son
              irrenunciables.
            </p>
          </div>
        </section>
        <section id="seguridad">
          <span>05</span>
          <div>
            <h2>Salud y seguridad alimentaria</h2>
            <p>
              Las recetas son orientativas y no sustituyen la evaluación de
              profesionales de medicina o nutrición. Verificá alergias,
              intolerancias, contaminación cruzada, estado de conservación,
              fechas de vencimiento, cocción completa y temperaturas seguras.
              Las necesidades de personas embarazadas, niñas y niños, personas
              mayores, inmunocomprometidas o con diabetes u otras condiciones
              requieren especial cuidado profesional.
            </p>
            <p>
              Una fotografía no permite identificar con certeza ingredientes,
              alérgenos, contaminación ni estado sanitario. Ante cualquier duda,
              no consumas el alimento.
            </p>
          </div>
        </section>
        <section id="contacto">
          <span>06</span>
          <div>
            <h2>Responsable y contacto</h2>
            <p>
              El servicio es operado bajo el nombre ¿Qué Cocino Hoy? El
              responsable debe informar aquí, antes de comercializar el
              servicio, su nombre o razón social, CUIT, domicilio legal y un
              correo electrónico válido para soporte, privacidad, cancelaciones
              y reclamos.
            </p>
            <div className="legal-pending">
              <strong>Información pendiente de completar por el titular</strong>
              <p>
                Nombre o razón social · CUIT · domicilio legal · correo de
                contacto. Estos datos no deben inventarse y son necesarios para
                una identificación comercial completa.
              </p>
            </div>
            <p>
              Para reclamos de consumo también podés consultar los canales
              oficiales de Defensa del Consumidor. Para cuestiones sobre datos
              personales, podés acudir a la Agencia de Acceso a la Información
              Pública.
            </p>
          </div>
        </section>
      </div>
      <footer className="legal-footer">
        <p>© 2026 ¿Qué Cocino Hoy?</p>
        <div>
          <a href="#terminos">Términos</a>
          <a href="#privacidad">Privacidad</a>
          <a href="#cookies">Cookies</a>
          <Link href="/">Aplicación</Link>
        </div>
      </footer>
    </main>
  );
}
