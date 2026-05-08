import { Link } from 'react-router-dom';

export default function PoliticaPrivacidad() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-slate-300">
      <h1 className="text-3xl font-bold text-white mb-6">Política de Privacidad y Tratamiento de Datos Personales</h1>
      <p className="mb-6 italic">
        En cumplimiento de la <strong className="text-white">Ley Orgánica de Protección de Datos Personales (LOPDP)</strong> de la República del Ecuador y su
        reglamento, "Torneos TrendSport" se compromete a proteger la privacidad de los usuarios que nos confían sus datos.
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">1. Identidad y Domicilio del Responsable del Tratamiento</h2>
        <p>
          A los efectos de esta Política de Privacidad, los datos de contacto del responsable del tratamiento de datos son
          los mismos que figuran en el <Link to="/aviso-legal" className="text-primary-400 hover:text-primary-300 underline">Aviso Legal</Link>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">2. Finalidad del Tratamiento de los Datos</h2>
        <p className="mb-2">Los datos personales que recopilamos a través de nuestra aplicación son tratados con las siguientes finalidades:</p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong className="text-white">Datos de Registro de Cuenta (Nombre y Correo Electrónico):</strong> Son necesarios para crear y gestionar tu cuenta de usuario, permitirte iniciar sesión y asociarte los torneos que creas. La base legal para este tratamiento es tu consentimiento expreso al registrarte y la necesidad de ejecutar el servicio solicitado.</li>
          <li><strong className="text-white">Datos de Jugadores (Nombre y Número):</strong> Se utilizan exclusivamente para generar las estadísticas del torneo (goleadores, tarjetas). Al introducir estos datos, garantizas que tienes el consentimiento de los participantes para su tratamiento con esta finalidad.</li>
          <li><strong className="text-white">Imágenes (Escudos de Equipos):</strong> Las imágenes se almacenan para mostrarlas en el contexto del torneo. Son necesarias para la funcionalidad principal de la plataforma.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">3. Categorías de Datos Recogidos</h2>
        <p>Tratamos las siguientes categorías de datos:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Datos identificativos de usuario: Nombre y dirección de correo electrónico.</li>
          <li>Datos de participantes: Nombres y, opcionalmente, números de dorsales de los jugadores.</li>
          <li>Imágenes: Logos o escudos de equipos.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">4. Derechos de los Titulares de los Datos (Derechos ARCO)</h2>
        <p>
          Conforme a la LOPDP, como titular de los datos, puedes ejercer gratuitamente los siguientes derechos a través del
          correo electrónico indicado en el Aviso Legal:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><strong>Acceso:</strong> Conocer qué datos tuyos estamos tratando.</li>
          <li><strong>Rectificación:</strong> Solicitar la modificación de tus datos si son inexactos.</li>
          <li><strong>Cancelación/Oposición:</strong> Solicitar la baja de tu cuenta y la eliminación de tus datos personales.</li>
          <li><strong>Portabilidad:</strong> Solicitar una copia de los datos que nos has proporcionado en un formato electrónico.</li>
        </ul>
        <p className="mt-2">
          Atenderemos tu solicitud en un plazo máximo de 15 días. Para cualquier reclamo adicional, puedes dirigirte a la
          Superintendencia de Protección de Datos Personales (SPDP).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">5. Conservación y Seguridad de los Datos</h2>
        <p>
          Tus datos serán conservados mientras mantengas tu cuenta activa. Si decides eliminar tu cuenta, procederemos a
          suprimir tu información personal en un plazo no mayor a 30 días, salvo que exista una obligación legal de
          conservarlos por más tiempo.
        </p>
        <p className="mt-2">
          Hemos implementado las medidas de seguridad técnicas y organizativas apropiadas para proteger tus datos contra el
          acceso no autorizado, la alteración, la divulgación o la destrucción, como el cifrado de contraseñas y el acceso
          restringido a la base de datos.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">6. Comunicación de Datos a Terceros</h2>
        <p>
          "Torneos TrendSport" no comparte ni comercializa tus datos personales con terceros. Compartimos información
          únicamente en los siguientes supuestos:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><strong>Torneos Públicos:</strong> Los resultados, estadísticas de jugadores y los escudos de los equipos serán visibles públicamente en la página del torneo si el organizador lo marca como "Público". Los datos de tu cuenta de usuario (como tu correo electrónico) nunca se mostrarán en la vista pública.</li>
          <li><strong>Proveedores de Servicios:</strong> Utilizamos servicios de alojamiento en la nube (como Vercel, Render o Neon) que actúan como "encargados del tratamiento" bajo nuestras instrucciones y con las debidas garantías de seguridad.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-3">7. Uso de Tecnologías de Rastreo (Cookies)</h2>
        <p>
          Nuestra aplicación no utiliza cookies de terceros para fines publicitarios. Solo utilizamos "cookies técnicas"
          estrictamente necesarias para mantener tu sesión de usuario iniciada (por ejemplo, <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">token</code> en
          <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">localStorage</code> en este prototipo; en una versión avanzada se usaría una cookie <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs">httpOnly</code>).
        </p>
        <p className="mt-2">
          Según el Art. 7 de la LOPDP y el criterio de la autoridad de protección de datos, este tipo de cookies técnicas
          no requieren consentimiento expreso, aunque siempre te informamos de ello por transparencia. Si en un futuro
          decidiéramos implementar servicios de analítica de terceros (como Google Analytics), se te informará y solicitará
          tu consentimiento previo, mostrando un banner claro al acceder a la aplicación.
        </p>
      </section>

      <div className="mt-10 text-center">
        <Link to="/" className="text-primary-400 hover:text-primary-300">← Volver al inicio</Link>
      </div>
    </div>
  );
}