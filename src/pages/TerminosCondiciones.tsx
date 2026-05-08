import { Link } from 'react-router-dom';

export default function TerminosCondiciones() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-slate-300">
      <h1 className="text-3xl font-bold text-white mb-6">Términos y Condiciones del Servicio</h1>
      <p className="mb-6 italic">
        Los presentes Términos y Condiciones regulan el uso de la plataforma <strong className="text-white">"Torneos TrendSport"</strong>.
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">1. Aceptación de los Términos</h2>
        <p>
          Al registrarse y hacer uso de los servicios de gestión de torneos ofrecidos por "Torneos TrendSport", el Usuario
          acepta de manera íntegra y sin reservas los presentes Términos y Condiciones.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">2. Descripción del Servicio</h2>
        <p className="mb-2">La Aplicación es una herramienta que permite a los usuarios:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Crear y configurar torneos deportivos con diferentes formatos.</li>
          <li>Gestionar equipos y sus respectivos jugadores.</li>
          <li>Registrar resultados de partidos y visualizar tablas de posiciones automáticas.</li>
          <li>Registrar eventos de juego (goles, asistencias, tarjetas) para obtener estadísticas detalladas de jugadores.</li>
          <li>Compartir una vista pública de solo lectura del torneo a través de un enlace.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">3. Obligaciones del Usuario Organizador</h2>
        <p>El usuario que crea un torneo ("Organizador") es el único responsable de:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>La veracidad de los datos introducidos en el torneo (nombres de equipos, jugadores, y resultados).</li>
          <li>Obtener el consentimiento de los participantes (jugadores) para el tratamiento de sus nombres y estadísticas dentro de la plataforma, conforme a la LOPDP.</li>
          <li>El contenido de los nombres de los equipos y las imágenes de los escudos, asegurando que no violan derechos de propiedad intelectual o industrial de terceros, ni contienen contenido inapropiado.</li>
          <li>La configuración de la visibilidad del torneo. El Organizador entiende que si marca un torneo como "Público", cualquier persona con el enlace podrá ver los resultados, estadísticas y contenido del torneo.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">4. Exención de Responsabilidad de la Plataforma</h2>
        <p>"Torneos TrendSport" es una herramienta de gestión y no se responsabiliza de:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Los resultados, la organización logística o las decisiones arbitrales de los torneos creados. La plataforma se limita a procesar los datos introducidos por el Organizador.</li>
          <li>Las inexactitudes en las estadísticas o tablas de posiciones que resulten de una introducción incorrecta de datos por parte del Organizador.</li>
          <li>La eliminación de un torneo por parte de su creador o la pérdida de datos asociada a la misma.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">5. Modificaciones y Disponibilidad del Servicio</h2>
        <p>
          "Torneos TrendSport" se reserva el derecho a modificar, suspender o cancelar el servicio en cualquier momento.
          Nos esforzaremos por informar a los usuarios de cualquier cambio significativo. Las presentes condiciones también
          pueden ser modificadas para adaptarse a cambios legislativos.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">6. Legislación Aplicable</h2>
        <p>
          Al igual que el Aviso Legal, estos Términos y Condiciones se rigen por las leyes de la República del Ecuador.
        </p>
      </section>

      <div className="mt-10 text-center">
        <Link to="/" className="text-primary-400 hover:text-primary-300">← Volver al inicio</Link>
      </div>
    </div>
  );
}