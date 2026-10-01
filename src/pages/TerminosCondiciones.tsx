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

export default function TerminosCondiciones() {
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
        Términos y Condiciones
      </Typography>
      <Typography sx={{ fontSize: 13, color: 'rgba(17,17,17,0.45)', mb: 5 }}>
        Última actualización: 01 de octubre de 2026
      </Typography>

      <Section title="1. Aceptación de los Términos">
        <p>
          El acceso y uso de la plataforma Torneos TrendSport (en adelante, "el Servicio") está sujeto a los presentes
          Términos y Condiciones. Al registrarse como usuario, crear un torneo, añadir equipos o jugadores, o simplemente
          navegar por la Aplicación, el Usuario acepta íntegramente estos Términos.
        </p>
        <p>
          El Titular se reserva el derecho a modificar los presentes Términos en cualquier momento. Las modificaciones
          entrarán en vigor en el momento de su publicación en la Aplicación.
        </p>
      </Section>

      <Section title="2. Descripción del Servicio">
        <p>Torneos TrendSport es una plataforma web que actúa como herramienta técnica para facilitar a los Usuarios la gestión de torneos deportivos. Las funcionalidades incluyen, de manera enunciativa pero no limitativa:</p>
        <ul>
          <li>Alta de torneos con diferentes formatos (liga, eliminatoria, grupos) y deportes.</li>
          <li>Registro de equipos y personalización de sus nombres y escudos.</li>
          <li>Alta de jugadores asociados a cada equipo.</li>
          <li>Generación automática de fixture/calendario de partidos.</li>
          <li>Registro de resultados y eventos de partido (goles, asistencias, tarjetas).</li>
          <li>Visualización de tablas de posiciones, estadísticas y ranking de goleadores.</li>
          <li>Compartición de un enlace público para consultar el torneo en modo solo lectura.</li>
        </ul>
      </Section>

      <Section title="3. Obligaciones y Responsabilidad del Usuario Organizador">
        <p>El Usuario que crea un torneo (en adelante, "el Organizador") asume de manera exclusiva las siguientes responsabilidades:</p>
        <ul>
          <li><strong>Veracidad de los datos:</strong> Es responsable de la exactitud y veracidad de todos los datos que introduce, incluyendo nombres de equipos, jugadores, resultados y eventos de partido.</li>
          <li><strong>Cumplimiento legal sobre datos personales:</strong> Es responsable de obtener el consentimiento previo, libre e informado de todas las personas cuyos datos sean introducidos en la Aplicación.</li>
          <li><strong>Derechos sobre contenidos:</strong> Garantiza que los nombres de equipos, escudos y cualquier otro contenido que suba no infringen derechos de propiedad intelectual ni son contrarios a la ley.</li>
          <li><strong>Configuración de privacidad:</strong> Es el único responsable de establecer la visibilidad del torneo (público o privado) y de las consecuencias que de ello se deriven.</li>
        </ul>
      </Section>

      <Section title="4. Exención de Responsabilidad del Titular">
        <p>En la máxima medida permitida por la legislación aplicable, Torneos TrendSport y su Titular quedan exentos de cualquier responsabilidad por los siguientes conceptos:</p>
        <ul>
          <li><strong>Naturaleza de la plataforma:</strong> La Aplicación es una herramienta técnica informática, no una entidad organizadora de eventos deportivos.</li>
          <li><strong>Exactitud de cálculos automáticos:</strong> Las tablas, estadísticas y avance de ganadores se calculan a partir de los datos ingresados por el Organizador.</li>
          <li><strong>Pérdida de datos:</strong> El Titular no se responsabiliza de la pérdida de datos causada por eliminación del torneo, fallos en servicios de terceros, ciberataques o errores de software.</li>
          <li><strong>Contenido de terceros:</strong> El Titular no asume obligación alguna de supervisar los contenidos generados por los Usuarios.</li>
          <li><strong>Indemnidad:</strong> El Organizador se compromete a mantener indemne al Titular frente a cualquier reclamación judicial o extrajudicial.</li>
          <li><strong>Límite de responsabilidad económica:</strong> Al ser el Servicio gratuito, la responsabilidad económica total del Titular frente al Usuario no podrá exceder la suma de cero dólares.</li>
        </ul>
      </Section>

      <Section title="5. Suspensión y Terminación del Servicio">
        <p>
          El Titular se reserva el derecho a suspender, interrumpir o dar por terminado el Servicio o el acceso de un
          Usuario específico en cualquier momento, con o sin causa, y sin previo aviso.
        </p>
      </Section>

      <Section title="6. Legislación Aplicable y Jurisdicción">
        <p>
          Los presentes Términos se rigen por las leyes vigentes. Cualquier controversia que surja de o esté relacionada
          con estos Términos o el uso del Servicio será sometida a la jurisdicción exclusiva de los juzgados y tribunales
          de la ciudad de [Tu Ciudad].
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