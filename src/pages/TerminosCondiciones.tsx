import { Link } from 'react-router-dom';

export default function TerminosCondiciones() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-slate-300 text-sm leading-relaxed">
      <h1 className="text-3xl font-bold text-white mb-6">Términos y Condiciones del Servicio</h1>
      <p className="mb-6 text-slate-400">
        Fecha de última actualización: 08 de mayo de 2026
      </p>

      {/* 1. Aceptación */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">1. Aceptación de los Términos</h2>
        <p>
          El acceso y uso de la plataforma <strong className="text-white">"Torneos TrendSport"</strong> (en adelante,
          "el Servicio" o "la Aplicación") está sujeto a los presentes Términos y Condiciones (en adelante, "los
          Términos"). Al registrarse como usuario, crear un torneo, añadir equipos o jugadores, o simplemente navegar
          por la Aplicación, el Usuario acepta íntegramente estos Términos y se obliga a cumplirlos en su totalidad.
          Si el Usuario no está de acuerdo con alguna de las disposiciones aquí contenidas, deberá abstenerse de
          utilizar el Servicio.
        </p>
        <p className="mt-2">
          El Titular se reserva el derecho a modificar los presentes Términos en cualquier momento. Las modificaciones
          entrarán en vigor en el momento de su publicación en la Aplicación. Se recomienda al Usuario revisar
          periódicamente los Términos. El uso continuado del Servicio después de la publicación de cambios constituye
          la aceptación de los mismos.
        </p>
      </section>

      {/* 2. Descripción */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">2. Descripción del Servicio</h2>
        <p>
          "Torneos TrendSport" es una plataforma web gratuita que actúa exclusivamente como herramienta técnica para
          facilitar a los Usuarios la gestión de torneos deportivos. Las funcionalidades incluyen, de manera enunciativa
          pero no limitativa:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Alta de torneos con diferentes formatos (liga, eliminatoria, grupos) y deportes.</li>
          <li>Registro de equipos y personalización de sus nombres y escudos.</li>
          <li>Alta de jugadores asociados a cada equipo.</li>
          <li>Generación automática de fixture/calendario de partidos.</li>
          <li>Registro de resultados y eventos de partido (goles, asistencias, tarjetas).</li>
          <li>Visualización de tablas de posiciones, estadísticas de juego y ranking de goleadores.</li>
          <li>Compartición de un enlace público para que terceros puedan consultar el torneo en modo solo lectura.</li>
        </ul>
        <p className="mt-2">
          El Titular se reserva el derecho a añadir, modificar o eliminar funcionalidades del Servicio en cualquier
          momento, sin necesidad de previo aviso.
        </p>
      </section>

      {/* 3. Obligaciones del Organizador */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">3. Obligaciones y Responsabilidad del Usuario Organizador</h2>
        <p>
          El Usuario que crea un torneo (en adelante, "el Organizador") asume de manera exclusiva las siguientes
          responsabilidades:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><strong className="text-white">Veracidad de los datos:</strong> Es responsable de la exactitud y veracidad de todos los datos que introduce en la Aplicación, incluyendo nombres de equipos, jugadores, resultados y eventos de partido. El Titular no verifica ni valida dichos datos.</li>
          <li><strong className="text-white">Cumplimiento legal sobre datos personales:</strong> Es responsable de obtener el consentimiento previo, libre e informado de todas las personas físicas cuyos datos (nombre, apodo, estadísticas) sean introducidos en la Aplicación, de conformidad con la Ley Orgánica de Protección de Datos Personales (LOPDP) de Ecuador. El Organizador mantendrá indemne al Titular frente a cualquier reclamación, multa o sanción derivada del incumplimiento de esta obligación.</li>
          <li><strong className="text-white">Derechos sobre contenidos:</strong> Garantiza que los nombres de equipos, escudos, logotipos y cualquier otro contenido que suba a la Aplicación no infringen derechos de propiedad intelectual, industrial o de imagen de terceros, y que no son contrarios a la ley, el orden público o las buenas costumbres.</li>
          <li><strong className="text-white">Configuración de privacidad del torneo:</strong> Es el único responsable de establecer la visibilidad del torneo (público o privado) y de las consecuencias que de ello se deriven. Si el torneo se configura como público, el Organizador acepta que cualquier persona con el enlace podrá acceder a toda la información del torneo (resultados, estadísticas, escudos de equipos, etc.).</li>
        </ul>
      </section>

      {/* 4. Exención de responsabilidad (la más larga) */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">4. Exención de Responsabilidad del Titular</h2>
        <p>
          En la máxima medida permitida por la legislación aplicable, "Torneos TrendSport" y su Titular quedan exentos de
          cualquier responsabilidad por los siguientes conceptos:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-2">
          <li><strong className="text-white">Naturaleza de la plataforma:</strong> La Aplicación es una herramienta técnica informática, no una entidad organizadora de eventos deportivos. El Titular no tiene relación alguna con la organización logística, arbitral o administrativa de los torneos. Cualquier disputa derivada del desarrollo de los torneos es ajena al Titular.</li>
          <li><strong className="text-white">Exactitud de cálculos automáticos:</strong> Las tablas de posiciones, estadísticas de jugadores, avance de ganadores en eliminatorias y cualquier otro dato generado automáticamente se calculan a partir de los datos ingresados por el Organizador. El Titular no garantiza la exactitud de dichos cálculos si los datos de entrada son incorrectos o incompletos.</li>
          <li><strong className="text-white">Pérdida de datos:</strong> El Titular no se responsabiliza de la pérdida de datos causada por eliminación del torneo por parte del Organizador, fallos en los servicios de terceros (hosting, bases de datos cloud), ciberataques, errores de software o cualquier otra causa. El Organizador es el único responsable de mantener copias de seguridad de la información de su torneo si así lo desea.</li>
          <li><strong className="text-white">Contenido de terceros:</strong> El Titular no asume obligación alguna de supervisar los contenidos generados por los Usuarios. No obstante, se reserva el derecho a eliminar cualquier contenido que sea notificado como ilegal o inapropiado, sin que ello genere responsabilidad por los contenidos no eliminados.</li>
          <li><strong className="text-white">Indemnidad:</strong> El Organizador se compromete a mantener indemne al Titular frente a cualquier reclamación judicial o extrajudicial, así como frente a cualquier sanción administrativa, multa o gasto (incluidos honorarios legales) que pudiera derivarse del incumplimiento por parte del Organizador de los presentes Términos o de la legislación vigente.</li>
          <li><strong className="text-white">Límite de responsabilidad económica:</strong> Dado que el Servicio es completamente gratuito, en ningún caso la responsabilidad económica total del Titular frente al Usuario por cualquier causa podrá exceder la suma de cero dólares de los Estados Unidos de América (USD 0.00). El Usuario reconoce y acepta expresamente esta limitación.</li>
        </ul>
      </section>

      {/* 5. Suspensión y terminación */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">5. Suspensión y Terminación del Servicio</h2>
        <p>
          El Titular se reserva el derecho a suspender, interrumpir o dar por terminado el Servicio o el acceso de un
          Usuario específico en cualquier momento, con o sin causa, y sin previo aviso. En particular, podrá cancelar o
          suspender la cuenta de un Usuario que incumpla los presentes Términos o utilice la Aplicación de manera abusiva
          o fraudulenta.
        </p>
      </section>

      {/* 6. Legislación */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">6. Legislación Aplicable y Jurisdicción</h2>
        <p>
          Los presentes Términos se rigen por las leyes de la República del Ecuador. Cualquier controversia que surja de
          o esté relacionada con estos Términos o el uso del Servicio será sometida a la jurisdicción exclusiva de los
          juzgados y tribunales de la ciudad de [Tu Ciudad], Ecuador, con renuncia a cualquier otro fuero.
        </p>
      </section>

      <div className="mt-10 text-center border-t border-slate-800 pt-6">
        <Link to="/" className="text-primary-400 hover:text-primary-300 text-base">← Volver al inicio</Link>
      </div>
    </div>
  );
}