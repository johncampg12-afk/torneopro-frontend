import { Link } from 'react-router-dom';

export default function AvisoLegal() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-slate-300 text-sm leading-relaxed">
      <h1 className="text-3xl font-bold text-white mb-6">Aviso Legal y Condiciones de Uso</h1>
      <p className="mb-6 text-slate-400">
        Fecha de última actualización: 08 de mayo de 2026
      </p>

      {/* 1. Identificación */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">1. Identificación del Responsable del Sitio Web</h2>
        <p>
          En cumplimiento de lo dispuesto en la Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos de
          Ecuador, y demás normativa aplicable, se informa que la aplicación web denominada{" "}
          <strong className="text-white">"Torneos TrendSport"</strong> (en adelante, "la Aplicación" o "el Servicio") es
          operada y gestionada por:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><strong className="text-white">Titular:</strong> [Tu Nombre Completo o Razón Social]</li>
          <li><strong className="text-white">Cédula/RUC:</strong> [Tu número de cédula o RUC]</li>
          <li><strong className="text-white">Correo Electrónico:</strong> [ej. admin@torneostrendsport.com]</li>
          <li><strong className="text-white">Dirección Física:</strong> [Tu ciudad y dirección completa, ej. Guayaquil, Ecuador]</li>
        </ul>
        <p className="mt-2">
          La presente Aplicación tiene carácter gratuito y su finalidad exclusiva es servir como herramienta técnica para
          la gestión y visualización de torneos deportivos creados por los propios usuarios. En ningún caso "Torneos
          TrendSport" organiza, patrocina o se responsabiliza de los eventos deportivos gestionados a través de ella.
        </p>
      </section>

      {/* 2. Objeto */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">2. Objeto y Ámbito de Aplicación</h2>
        <p>
          Este Aviso Legal y Condiciones de Uso (en adelante, "Condiciones") regulan el acceso, navegación y utilización
          de la Aplicación por parte de cualquier persona física o jurídica (en adelante, "el Usuario" o "los Usuarios").
          Se entiende por Aplicación la totalidad de las páginas web, interfaces, funcionalidades, bases de datos y demás
          elementos que la componen, accesibles a través de la URL principal y sus subdominios.
        </p>
        <p className="mt-2">
          El simple acceso a la Aplicación atribuye la condición de Usuario y supone la aceptación plena, expresa y sin
          reservas de todas y cada una de las cláusulas de este Aviso Legal, así como de nuestra{" "}
          <Link to="/politica-privacidad" className="text-primary-400 hover:text-primary-300 underline">Política de Privacidad</Link> y{" "}
          <Link to="/terminos-condiciones" className="text-primary-400 hover:text-primary-300 underline">Términos y Condiciones del Servicio</Link>.
          Si el Usuario no está de acuerdo con estas Condiciones, debe abstenerse de utilizar la Aplicación.
        </p>
      </section>

      {/* 3. Propiedad Intelectual */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">3. Propiedad Intelectual e Industrial</h2>
        <p>
          Todos los derechos de propiedad intelectual e industrial sobre la Aplicación (código fuente, elementos gráficos,
          diseño, logotipos, estructura de la base de datos y documentación técnica) son titularidad exclusiva de [Tu
          Nombre], y están protegidos conforme a la legislación ecuatoriana e internacional, en particular por el Servicio
          Nacional de Derechos Intelectuales (SENADI). La Aplicación se considera una obra de software protegida desde el
          momento de su creación.
        </p>
        <p className="mt-2">
          Queda terminantemente prohibida la reproducción total o parcial, distribución, comunicación pública,
          transformación o cualquier otra forma de explotación no autorizada del código fuente, diseño o contenido de la
          Aplicación. La infracción de estos derechos podrá dar lugar a las acciones legales correspondientes.
        </p>
        <p className="mt-2">
          Los contenidos generados por los Usuarios (nombres de equipos, escudos, fotos de perfil, etc.) son de exclusiva
          responsabilidad de quien los publica. El Usuario manifiesta y garantiza que es titular de todos los derechos de
          propiedad intelectual sobre dichos contenidos o que cuenta con las autorizaciones necesarias para publicarlos en
          la Aplicación. "Torneos TrendSport" no asume responsabilidad alguna por la violación de derechos de terceros
          que pudiera derivarse de dichos contenidos.
        </p>
      </section>

      {/* 4. Responsabilidad del Usuario */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">4. Responsabilidad del Usuario</h2>
        <p>
          El Usuario se obliga a utilizar la Aplicación de conformidad con la ley, la moral, el orden público y las
          presentes Condiciones. A título enunciativo pero no limitativo, queda prohibido:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Utilizar la Aplicación con fines ilícitos o lesivos contra el Titular o cualquier tercero.</li>
          <li>Publicar, almacenar o difundir contenidos ofensivos, difamatorios, discriminatorios, violentos o que atenten contra los derechos fundamentales de las personas.</li>
          <li>Suplantar la identidad de otra persona o entidad, o utilizar datos de terceros sin su consentimiento.</li>
          <li>Introducir deliberadamente datos falsos o inexactos que puedan afectar al normal funcionamiento de la Aplicación o al resto de Usuarios.</li>
          <li>Realizar cualquier acto que pueda dañar, sobrecargar, deteriorar o impedir el normal funcionamiento de la Aplicación, así como intentar acceder a áreas restringidas de la misma sin autorización.</li>
        </ul>
        <p className="mt-2">
          El Usuario será el único responsable frente al Titular y frente a terceros de los daños y perjuicios que pudieran
          derivarse del incumplimiento de las obligaciones anteriores. El Titular se reserva el derecho a retirar cualquier
          contenido o suspender el acceso a la Aplicación a aquellos Usuarios que incumplan lo aquí dispuesto.
        </p>
      </section>

      {/* 5. Exclusión de Garantías */}  
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">5. Exclusión de Garantías y Responsabilidad del Titular</h2>
        <p>
          "Torneos TrendSport" se ofrece "tal cual" y "según disponibilidad". El Titular no concede ninguna garantía ni
          asume responsabilidad alguna, en la máxima medida permitida por la legislación aplicable, en relación con:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-2">
          <li><strong className="text-white">Disponibilidad y continuidad del Servicio:</strong> El Titular no garantiza la disponibilidad ininterrumpida, el acceso permanente o la ausencia de errores en la Aplicación. El servicio puede suspenderse temporalmente por tareas de mantenimiento, actualización o por causas de fuerza mayor.</li>
          <li><strong className="text-white">Exactitud de los datos generados:</strong> La generación automática de fixtures, tablas de posiciones, estadísticas de jugadores, avance de ganadores en eliminatorias y demás cálculos se realiza exclusivamente a partir de los datos introducidos por los Usuarios. El Titular no asume responsabilidad por posibles inexactitudes derivadas de datos incorrectos o incompletos ingresados por el Organizador del torneo.</li>
          <li><strong className="text-white">Contenidos generados por Usuarios:</strong> El Titular no ejerce control editorial previo sobre los contenidos que los Usuarios publican en la Aplicación (nombres, escudos, etc.). No se hace responsable de su veracidad, legalidad o adecuación. No obstante, se compromete a retirar aquellos contenidos que sean notificados como inapropiados o ilegales.</li>
          <li><strong className="text-white">Decisiones del Organizador:</strong> La Aplicación es una mera herramienta de soporte. Las decisiones sobre reglamentos, sanciones, adjudicación de partidos o cualquier otra cuestión relativa a la competición corresponden exclusivamente al Organizador del torneo. El Titular no interviene ni asume responsabilidad alguna por tales decisiones.</li>
          <li><strong className="text-white">Servicios de terceros:</strong> La Aplicación depende de servicios de infraestructura cloud (alojamiento, base de datos) prestados por terceros (ej. Vercel, Render, Neon). El Titular no se responsabiliza de las interrupciones, fallos de seguridad o incidencias que pudieran ser atribuibles a dichos proveedores.</li>
          <li><strong className="text-white">Seguridad informática:</strong> A pesar de implementar medidas de seguridad razonables, el Titular no puede garantizar la ausencia absoluta de virus, ataques informáticos o vulnerabilidades en la Aplicación. El Usuario asume el riesgo inherente al uso de internet.</li>
        </ul>
        <p className="mt-2">
          En la máxima medida permitida por la legislación ecuatoriana, el Titular rechaza cualquier responsabilidad por
          daños directos, indirectos, incidentales, especiales, consecuenciales o punitivos derivados del uso o la
          imposibilidad de uso de la Aplicación, incluso si se hubiera advertido de la posibilidad de tales daños.
        </p>
      </section>

      {/* 6. Enlaces externos */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">6. Enlaces a Sitios de Terceros</h2>
        <p>
          La Aplicación puede contener enlaces a sitios web externos (ej. patrocinadores). Estos enlaces tienen una
          finalidad meramente informativa. El Titular no ejerce control alguno sobre dichos sitios ni sobre sus políticas
          de privacidad o condiciones de uso. El acceso a sitios de terceros se realiza bajo la exclusiva responsabilidad
          del Usuario.
        </p>
      </section>

      {/* 7. Legislación */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">7. Legislación Aplicable y Jurisdicción</h2>
        <p>
          Las presentes Condiciones se rigen en todos y cada uno de sus extremos por la legislación de la República del
          Ecuador. Para la resolución de cualquier controversia, discrepancia o reclamación que pudiera derivarse del
          acceso, uso o interpretación de este Aviso Legal o de la Aplicación, el Usuario y el Titular se someten
          expresamente a la jurisdicción de los juzgados y tribunales de la ciudad de [Tu Ciudad], Ecuador, con renuncia
          expresa a cualquier otro fuero que pudiera corresponderles.
        </p>
      </section>

      <div className="mt-10 text-center border-t border-slate-800 pt-6">
        <Link to="/" className="text-primary-400 hover:text-primary-300 text-base">← Volver al inicio</Link>
      </div>
    </div>
  );
}