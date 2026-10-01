import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { BLACK } from '../theme';

const MAX_WIDTH = 800;

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box sx={{ mb: 4 }}>
    <Typography
      sx={{
        fontSize: { xs: 16, md: 17 },
        fontWeight: 800,
        letterSpacing: -0.3,
        color: BLACK,
        fontFamily: '"Instrument Sans", system-ui, sans-serif',
        mb: 1.5,
      }}
    >
      {title}
    </Typography>
    <Box
      sx={{
        fontSize: { xs: 14, md: 15 },
        lineHeight: 1.7,
        color: 'rgba(17,17,17,0.7)',
        '& p': { mt: 1.5 },
        '& ul': { pl: 3, mt: 1.5 },
        '& li': { mb: 0.75 },
        '& strong': { color: BLACK, fontWeight: 700 },
      }}
    >
      {children}
    </Box>
  </Box>
);

export default function PoliticaPrivacidad() {
  return (
    <Box sx={{ maxWidth: MAX_WIDTH, mx: 'auto', width: '100%', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 5 } }}>
      <Button
        component={Link}
        to="/"
        startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
        sx={{
          height: 36,
          borderRadius: '999px',
          px: 1.75,
          mb: 4,
          fontWeight: 600,
          fontSize: 13,
          color: 'rgba(17,17,17,0.6)',
          '&:hover': { bgcolor: 'rgba(17,17,17,0.04)', color: BLACK },
        }}
      >
        Volver
      </Button>

      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.4,
          textTransform: 'uppercase',
          color: 'rgba(17,17,17,0.4)',
          mb: 1.5,
        }}
      >
        Legal
      </Typography>
      <Typography
        sx={{
          fontSize: { xs: 30, sm: 36, md: 44 },
          fontWeight: 800,
          letterSpacing: -1.4,
          lineHeight: 1.1,
          color: BLACK,
          fontFamily: '"Instrument Sans", system-ui, sans-serif',
          mb: 1,
        }}
      >
        Política de Privacidad
      </Typography>
      <Typography sx={{ fontSize: 13, color: 'rgba(17,17,17,0.45)', mb: 5 }}>
        Última actualización: 01 de octubre de 2026
      </Typography>

      <Box
        sx={{
          p: 2.5,
          borderRadius: '16px',
          bgcolor: 'rgba(17,17,17,0.02)',
          border: '1px solid rgba(17,17,17,0.06)',
          mb: 5,
        }}
      >
        <Typography sx={{ fontSize: 13.5, color: 'rgba(17,17,17,0.7)', lineHeight: 1.6, fontStyle: 'italic' }}>
          En cumplimiento de la <strong>Ley Orgánica de Protección de Datos Personales (LOPDP)</strong> y su Reglamento,
          Torneos TrendSport se compromete a proteger la privacidad de los usuarios que nos confían sus datos.
        </Typography>
      </Box>

      <Section title="1. Identidad del Responsable del Tratamiento">
        <p>
          El responsable del tratamiento de los datos personales recabados a través de la Aplicación Torneos TrendSport
          es [Tu Nombre Completo], con cédula/RUC [Tu número], domiciliado en [Tu dirección completa]. Los datos de
          contacto completos se encuentran en el Aviso Legal.
        </p>
      </Section>

      <Section title="2. Datos Personales y Categorías de Datos Recabados">
        <p>La Aplicación recaba y trata las siguientes categorías de datos:</p>
        <ul>
          <li><strong>Datos de Registro de Cuenta:</strong> Nombre completo, nombre de usuario, edad y dirección de correo electrónico, proporcionados voluntariamente por el Usuario al crear una cuenta.</li>
          <li><strong>Datos de Participantes en Torneos:</strong> Nombres y, opcionalmente, números de dorsales de los jugadores, introducidos por el Organizador del torneo.</li>
          <li><strong>Imágenes:</strong> Fotos de perfil de usuario y logotipos o escudos de equipos subidos por los Usuarios.</li>
          <li><strong>Datos de uso y navegación:</strong> Dirección IP, tipo de navegador, páginas visitadas y tiempo de permanencia, con fines exclusivamente estadísticos y de seguridad del sistema.</li>
        </ul>
      </Section>

      <Section title="3. Finalidad del Tratamiento y Base Legal">
        <p>Los datos personales son tratados con las siguientes finalidades y bases de legitimación:</p>
        <ul>
          <li><strong>Ejecutar el servicio solicitado:</strong> Los datos de la cuenta son necesarios para crear y gestionar la cuenta de Usuario, permitir el inicio de sesión y mostrar los torneos asociados. La base legal es la ejecución de la relación contractual.</li>
          <li><strong>Funcionalidad del torneo:</strong> Los datos de jugadores y los escudos de equipos se tratan para hacer posible la generación automática de fixtures, estadísticas y la visualización del torneo.</li>
          <li><strong>Mejora del servicio:</strong> Los datos de navegación se utilizan de forma agregada para analizar el uso de la Aplicación y mejorar su funcionamiento.</li>
          <li><strong>Cumplimiento legal:</strong> Atender requerimientos de autoridades competentes en caso de obligación legal.</li>
        </ul>
      </Section>

      <Section title="4. Derechos de los Titulares de los Datos (Derechos ARCO)">
        <p>De conformidad con la LOPDP, los titulares de los datos personales pueden ejercer los siguientes derechos:</p>
        <ul>
          <li><strong>Acceso:</strong> Conocer qué datos personales están siendo tratados.</li>
          <li><strong>Rectificación:</strong> Solicitar la corrección de datos inexactos o incompletos.</li>
          <li><strong>Cancelación/Oposición:</strong> Solicitar la eliminación de los datos personales.</li>
          <li><strong>Portabilidad:</strong> Recibir los datos personales en un formato estructurado.</li>
        </ul>
        <p>
          Para ejercer estos derechos, el titular deberá enviar una solicitud al correo electrónico indicado en el Aviso
          Legal, adjuntando copia de su documento de identidad. Atenderemos la solicitud en un plazo máximo de 15 días.
        </p>
      </Section>

      <Section title="5. Plazo de Conservación de los Datos">
        <p>
          Los datos personales serán conservados durante el tiempo necesario para cumplir la finalidad para la que fueron
          recabados. Los datos de la cuenta de Usuario se mantendrán mientras la cuenta permanezca activa. Una vez
          eliminada la cuenta, los datos serán suprimidos en un plazo máximo de 30 días, salvo obligación legal.
        </p>
      </Section>

      <Section title="6. Medidas de Seguridad">
        <p>Torneos TrendSport ha adoptado las medidas técnicas y organizativas necesarias para garantizar la seguridad de los datos personales. Entre otras medidas:</p>
        <ul>
          <li>Cifrado de contraseñas mediante algoritmos de hash robustos.</li>
          <li>Uso de conexiones cifradas (HTTPS) para todas las comunicaciones.</li>
          <li>Acceso restringido a la base de datos solo desde el backend autorizado.</li>
          <li>Almacenamiento de datos en proveedores cloud con estándares internacionales de seguridad.</li>
        </ul>
      </Section>

      <Section title="7. Comunicación de Datos a Terceros">
        <p>Torneos TrendSport no comercializa ni cede datos personales a terceros con fines comerciales. Únicamente se comunican datos en los siguientes supuestos:</p>
        <ul>
          <li><strong>Torneos configurados como públicos:</strong> Los datos del torneo (equipos, escudos, resultados, estadísticas) serán accesibles públicamente a través del enlace compartido. Los datos de la cuenta de Usuario (correo electrónico) nunca se mostrarán públicamente.</li>
          <li><strong>Proveedores de servicios:</strong> La Aplicación utiliza servicios de infraestructura en la nube (hosting, base de datos) que actúan como encargados del tratamiento.</li>
          <li><strong>Obligación legal:</strong> Cuando así lo requiera una autoridad judicial o administrativa competente.</li>
        </ul>
      </Section>

      <Section title="8. Uso de Cookies y Tecnologías Similares">
        <p>
          La Aplicación utiliza exclusivamente cookies técnicas estrictamente necesarias para mantener la sesión del
          Usuario. No se utilizan cookies de publicidad ni de terceros.
        </p>
      </Section>

      <Section title="9. Datos de Menores de Edad">
        <p>
          La Aplicación no está dirigida a menores de edad. En caso de que un torneo incluya datos de participantes
          menores, el Organizador es el único responsable de obtener el consentimiento de los padres o tutores legales.
        </p>
      </Section>

      <Section title="10. Modificaciones a esta Política">
        <p>
          Torneos TrendSport se reserva el derecho a modificar esta Política de Privacidad para adaptarla a novedades
          legislativas o cambios en el funcionamiento de la Aplicación. Se notificará cualquier cambio mediante la
          publicación de la nueva versión en esta misma página.
        </p>
      </Section>

      <Box sx={{ pt: 4, borderTop: '1px solid rgba(17,17,17,0.06)', textAlign: 'center' }}>
        <Button
          component={Link}
          to="/"
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: BLACK,
            textTransform: 'none',
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          }}
        >
          ← Volver al inicio
        </Button>
      </Box>
    </Box>
  );
}