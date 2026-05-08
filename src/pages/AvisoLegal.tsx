import { Link } from 'react-router-dom';

export default function AvisoLegal() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-slate-300">
      <h1 className="text-3xl font-bold text-white mb-6">Aviso Legal y Condiciones de Uso</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">1. Identificación del Responsable del Sitio Web</h2>
        <p className="mb-2">
          En cumplimiento de lo dispuesto en la Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos de
          Ecuador, se informa que la aplicación web <strong className="text-white">"Torneos TrendSport"</strong> es
          gestionada por:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Responsable:</strong> [Tu Nombre Completo o Razón Social]</li>
          <li><strong>Cédula/RUC:</strong> [Tu número de cédula o RUC]</li>
          <li><strong>Correo Electrónico de Contacto:</strong> [ej. admin@torneostrendsport.com]</li>
          <li><strong>Dirección Física:</strong> [Tu ciudad y dirección, ej. Guayaquil, Ecuador]</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">2. Objeto y Ámbito de Aplicación</h2>
        <p>
          Este aviso legal regula el acceso y uso de la aplicación web "Torneos TrendSport" (en adelante, "la
          Aplicación"), que tiene como finalidad ofrecer una plataforma gratuita para la gestión de torneos deportivos
          locales.
        </p>
        <p className="mt-2">
          La utilización de la Aplicación atribuye la condición de "Usuario" e implica la aceptación plena y sin reservas
          de todas y cada una de las disposiciones incluidas en este Aviso Legal, nuestra Política de Privacidad y los
          Términos y Condiciones de la plataforma.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">3. Propiedad Intelectual e Industrial</h2>
        <p>
          El código fuente, los elementos gráficos, el diseño y la apariencia de "Torneos TrendSport" son propiedad de
          [Tu Nombre]. De acuerdo con la legislación ecuatoriana, la aplicación está protegida como obra de software por
          el Servicio Nacional de Derechos Intelectuales (SENADI), desde el momento mismo de su creación. Queda
          expresamente prohibida la reproducción, distribución o modificación del código sin autorización previa y por
          escrito.
        </p>
        <p className="mt-2">
          Las imágenes de los escudos de los equipos subidas por los usuarios son responsabilidad de quien las publica. El
          Usuario garantiza que cuenta con los derechos necesarios sobre dichas imágenes y exime a "Torneos TrendSport" de
          cualquier reclamación de terceros.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">4. Responsabilidad del Usuario</h2>
        <p>
          El Usuario se compromete a utilizar la Aplicación de forma lícita y de acuerdo con el orden público y las buenas
          costumbres. No podrá utilizar la plataforma para:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Publicar contenido ofensivo, violento o discriminatorio en nombres de equipos o torneos.</li>
          <li>Introducir datos falsos o de terceros sin su consentimiento.</li>
          <li>Realizar actividades que puedan dañar, sobrecargar o inutilizar el servicio.</li>
        </ul>
        <p className="mt-2">
          "Torneos TrendSport" actúa como un mero intermediario en la gestión de los torneos. La organización del torneo,
          las reglas y la veracidad de los resultados son responsabilidad exclusiva del usuario organizador. La plataforma
          no actúa como federación deportiva ni entidad organizadora oficial.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">5. Exclusión de Garantías y Responsabilidad</h2>
        <p>
          "Torneos TrendSport" ha adoptado las medidas técnicas necesarias para el correcto funcionamiento de la
          aplicación. Sin embargo, no se hace responsable de:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>La disponibilidad y continuidad del servicio, especialmente en caso de fallos en servicios de terceros
            (hosting, bases de datos cloud).</li>
          <li>Los daños y perjuicios de cualquier naturaleza que puedan deberse a la falta de veracidad de los datos
            proporcionados por los usuarios.</li>
          <li>Las decisiones tomadas por los organizadores basándose en los datos generados automáticamente (ej. tablas de
            posiciones, avances de ganadores en eliminatorias).</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">6. Legislación Aplicable y Jurisdicción</h2>
        <p>
          La presente política se rige en todos y cada uno de sus extremos por la legislación de la República del Ecuador.
          Para la resolución de cualquier controversia que pudiera derivarse del acceso o uso de la aplicación, el Usuario
          y el Titular se someten expresamente a los juzgados y tribunales de la ciudad de [Tu Ciudad], Ecuador.
        </p>
      </section>

      <div className="mt-10 text-center">
        <Link to="/" className="text-primary-400 hover:text-primary-300">← Volver al inicio</Link>
      </div>
    </div>
  );
}