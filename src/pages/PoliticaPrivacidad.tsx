import { Link } from 'react-router-dom';

export default function PoliticaPrivacidad() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-slate-300 text-sm leading-relaxed">
      <h1 className="text-3xl font-bold text-white mb-6">Política de Privacidad y Tratamiento de Datos Personales</h1>
      <p className="mb-6 text-slate-400">
        Fecha de última actualización: 08 de mayo de 2026
      </p>
      <p className="mb-6 italic">
        En cumplimiento de la <strong className="text-white">Ley Orgánica de Protección de Datos Personales (LOPDP)</strong> de la República del Ecuador,
        publicada en el Registro Oficial Suplemento 459 de 26 de mayo de 2021, y su Reglamento, el Titular de esta
        Aplicación informa a los Usuarios sobre su política de privacidad y tratamiento de datos personales.
      </p>

      {/* 1. Responsable */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">1. Identidad del Responsable del Tratamiento</h2>
        <p>
          El responsable del tratamiento de los datos personales recabados a través de la Aplicación{" "}
          <strong className="text-white">"Torneos TrendSport"</strong> es [Tu Nombre Completo], con cédula/RUC [Tu
          número], domiciliado en [Tu dirección completa, ej. Guayaquil, Ecuador]. Los datos de contacto completos se
          encuentran en el <Link to="/aviso-legal" className="text-primary-400 hover:text-primary-300 underline">Aviso Legal</Link>.
        </p>
      </section>

      {/* 2. Datos recogidos */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">2. Datos Personales y Categorías de Datos Recabados</h2>
        <p>La Aplicación recaba y trata las siguientes categorías de datos:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><strong className="text-white">Datos de Registro de Cuenta:</strong> Nombre completo y dirección de correo electrónico, proporcionados voluntariamente por el Usuario al crear una cuenta.</li>
          <li><strong className="text-white">Datos de Participantes en Torneos:</strong> Nombres y, opcionalmente, números de dorsales de los jugadores, introducidos por el Organizador del torneo. Estos datos pueden incluir información de personas físicas que no son Usuarios directos de la Aplicación.</li>
          <li><strong className="text-white">Imágenes:</strong> Logotipos o escudos de equipos subidos por los Usuarios.</li>
          <li><strong className="text-white">Datos de uso y navegación:</strong> Dirección IP, tipo de navegador, páginas visitadas y tiempo de permanencia, con fines exclusivamente estadísticos y de seguridad del sistema.</li>
        </ul>
      </section>

      {/* 3. Finalidad y base legal */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">3. Finalidad del Tratamiento y Base Legal</h2>
        <p>Los datos personales son tratados con las siguientes finalidades y bases de legitimación:</p>
        <ul className="list-disc list-inside mt-2 space-y-2">
          <li><strong className="text-white">Ejecutar el servicio solicitado:</strong> Los datos de la cuenta son necesarios para crear y gestionar la cuenta de Usuario, permitir el inicio de sesión y mostrar los torneos asociados. La base legal es la ejecución de la relación contractual (prestación del servicio).</li>
          <li><strong className="text-white">Funcionalidad del torneo:</strong> Los datos de jugadores y los escudos de equipos se tratan para hacer posible la generación automática de fixtures, estadísticas y la visualización del torneo. La base legal es el consentimiento que el Organizador debe haber obtenido de los participantes, así como el interés legítimo en ofrecer la funcionalidad básica de la plataforma.</li>
          <li><strong className="text-white">Mejora del servicio:</strong> Los datos de navegación se utilizan de forma agregada para analizar el uso de la Aplicación y mejorar su funcionamiento. La base legal es el interés legítimo del responsable.</li>
          <li><strong className="text-white">Cumplimiento legal:</strong> Atender requerimientos de autoridades competentes en caso de obligación legal.</li>
        </ul>
      </section>

      {/* 4. Derechos ARCO */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">4. Derechos de los Titulares de los Datos (Derechos ARCO)</h2>
        <p>
          De conformidad con la LOPDP, los titulares de los datos personales (tanto Usuarios de la cuenta como
          participantes cuyos datos hayan sido introducidos por un Organizador) pueden ejercer los siguientes derechos:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><strong>Acceso:</strong> Conocer qué datos personales están siendo tratados.</li>
          <li><strong>Rectificación:</strong> Solicitar la corrección de datos inexactos o incompletos.</li>
          <li><strong>Cancelación/Oposición:</strong> Solicitar la eliminación de los datos personales cuando, entre otros motivos, ya no sean necesarios para los fines que fueron recogidos. El Organizador puede eliminar jugadores directamente desde la interfaz.</li>
          <li><strong>Portabilidad:</strong> Recibir los datos personales en un formato estructurado y de uso común.</li>
        </ul>
        <p className="mt-2">
          Para ejercer estos derechos, el titular deberá enviar una solicitud al correo electrónico indicado en el Aviso
          Legal, adjuntando copia de su cédula de identidad o documento equivalente. El Titular atenderá la solicitud en
          el plazo máximo de quince (15) días hábiles. En caso de no obtener respuesta satisfactoria, el titular puede
          acudir a la Superintendencia de Protección de Datos Personales (SPDP).
        </p>
      </section>

      {/* 5. Conservación */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">5. Plazo de Conservación de los Datos</h2>
        <p>
          Los datos personales serán conservados durante el tiempo necesario para cumplir la finalidad para la que fueron
          recabados. Los datos de la cuenta de Usuario se mantendrán mientras la cuenta permanezca activa. Los datos de
          un torneo (equipos, jugadores, resultados) se conservarán mientras el torneo no sea eliminado por el
          Organizador. Una vez eliminada la cuenta o el torneo, los datos serán suprimidos en un plazo máximo de treinta
          (30) días, salvo que exista una obligación legal de conservarlos por más tiempo.
        </p>
      </section>

      {/* 6. Seguridad */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">6. Medidas de Seguridad</h2>
        <p>
          El Titular ha adoptado las medidas de índole técnica y organizativa necesarias para garantizar la seguridad de
          los datos personales y evitar su alteración, pérdida, tratamiento o acceso no autorizado. Entre otras medidas:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Cifrado de contraseñas mediante algoritmos de hash robustos.</li>
          <li>Uso de conexiones cifradas (HTTPS) para todas las comunicaciones.</li>
          <li>Acceso restringido a la base de datos solo desde el backend autorizado.</li>
          <li>Almacenamiento de datos en proveedores cloud que cumplen estándares internacionales de seguridad.</li>
        </ul>
        <p className="mt-2">
          No obstante, ninguna medida de seguridad es infalible. El Titular no puede garantizar la seguridad absoluta de
          los datos frente a ataques informáticos sofisticados o acciones maliciosas de terceros. El Usuario asume este
          riesgo inherente al uso de servicios en línea.
        </p>
      </section>

      {/* 7. Cesión */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">7. Comunicación de Datos a Terceros</h2>
        <p>
          "Torneos TrendSport" no comercializa, alquila ni cede datos personales a terceros con fines comerciales.
          Únicamente se comunican datos en los siguientes supuestos:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><strong className="text-white">Torneos configurados como públicos:</strong> Si un Organizador configura su torneo como público, los datos del torneo (nombres de equipos, escudos, resultados, estadísticas de jugadores) serán accesibles públicamente a través del enlace compartido. Los datos de la cuenta de Usuario (correo electrónico) nunca se mostrarán públicamente.</li>
          <li><strong className="text-white">Proveedores de servicios:</strong> La Aplicación utiliza servicios de infraestructura en la nube (Vercel, Render, Neon) que actúan como encargados del tratamiento y solo acceden a los datos para prestar el servicio técnico de alojamiento.</li>
          <li><strong className="text-white">Obligación legal:</strong> Cuando así lo requiera una autoridad judicial o administrativa competente en ejercicio de sus funciones.</li>
        </ul>
      </section>

      {/* 8. Cookies */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">8. Uso de Cookies y Tecnologías Similares</h2>
        <p>
          La Aplicación utiliza exclusivamente cookies técnicas estrictamente necesarias para mantener la sesión del
          Usuario iniciada durante la navegación. Estas cookies no requieren consentimiento expreso del Usuario según la
          LOPDP, por ser necesarias para la prestación del servicio.
        </p>
        <p className="mt-2">
          No se utilizan cookies de publicidad, cookies de terceros ni herramientas de tracking analítico no esenciales.
          Si en el futuro se implementara algún servicio de analítica (como Google Analytics), se informará previamente
          a los Usuarios mediante un banner y se solicitará su consentimiento explícito.
        </p>
      </section>

      {/* 9. Menores */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">9. Datos de Menores de Edad</h2>
        <p>
          La Aplicación no está dirigida a menores de edad. El registro de una cuenta de Usuario presupone que el Usuario
          es mayor de edad. En caso de que un torneo incluya datos de participantes menores de edad (jugadores), el
          Organizador del torneo es el único responsable de obtener el consentimiento expreso de los padres, madres o
          tutores legales para el tratamiento de dichos datos en la Aplicación, eximiendo al Titular de cualquier
          responsabilidad al respecto.
        </p>
      </section>

      {/* 10. Modificaciones */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">10. Modificaciones a esta Política</h2>
        <p>
          El Titular se reserva el derecho a modificar esta Política de Privacidad para adaptarla a novedades legislativas,
          jurisprudenciales o cambios en el funcionamiento de la Aplicación. Se notificará a los Usuarios cualquier cambio
          mediante la publicación de la nueva versión en esta misma página, indicando la fecha de actualización. El uso
          continuado de la Aplicación tras dicha publicación implica la aceptación de los cambios.
        </p>
      </section>

      <div className="mt-10 text-center border-t border-slate-800 pt-6">
        <Link to="/" className="text-primary-400 hover:text-primary-300 text-base">← Volver al inicio</Link>
      </div>
    </div>
  );
}