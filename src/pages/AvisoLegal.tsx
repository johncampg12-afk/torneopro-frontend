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

export default function AvisoLegal() {
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
        Aviso Legal
      </Typography>
      <Typography sx={{ fontSize: 13, color: 'rgba(17,17,17,0.45)', mb: 5 }}>
        Última actualización: 01 de octubre de 2026
      </Typography>

      <Section title="1. Identificación del Responsable del Sitio Web">
        <p>
          En cumplimiento de lo dispuesto en la Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos de
          Ecuador, se informa que la aplicación web <strong>Torneos TrendSport</strong> es gestionada por:
        </p>
        <ul>
          <li><strong>Responsable:</strong> [Tu Nombre Completo o Razón Social]</li>
          <li><strong>Cédula/RUC:</strong> [Tu número de cédula o RUC]</li>
          <li><strong>Correo electrónico:</strong> [ej. admin@torneostrendsport.com]</li>
          <li><strong>Dirección física:</strong> [Tu ciudad y dirección, ej. Valencia, España]</li>
        </ul>
      </Section>

      <Section title="2. Objeto y Ámbito de Aplicación">
        <p>
          Este aviso legal regula el acceso y uso de la aplicación web <strong>Torneos TrendSport</strong> (en adelante,
          "la Aplicación"), cuya finalidad es ofrecer una plataforma para la gestión de torneos deportivos locales.
        </p>
        <p>
          La utilización de la Aplicación atribuye la condición de "Usuario" e implica la aceptación plena y sin reservas
          de todas y cada una de las disposiciones incluidas en este Aviso Legal, nuestra Política de Privacidad y los
          Términos y Condiciones de la plataforma.
        </p>
      </Section>

      <Section title="3. Propiedad Intelectual e Industrial">
        <p>
          El código fuente, los elementos gráficos, el diseño y la apariencia de Torneos TrendSport son propiedad de
          [Tu Nombre]. La Aplicación está protegida como obra de software por el Servicio Nacional de Derechos
          Intelectuales (SENADI), desde el momento mismo de su creación. Queda expresamente prohibida la reproducción,
          distribución o modificación del código sin autorización previa y por escrito.
        </p>
        <p>
          Las imágenes de los escudos de los equipos subidas por los usuarios son responsabilidad de quien las publica.
          El Usuario garantiza que cuenta con los derechos necesarios sobre dichas imágenes y exime a Torneos TrendSport
          de cualquier reclamación de terceros.
        </p>
      </Section>

      <Section title="4. Responsabilidad del Usuario">
        <p>El Usuario se compromete a utilizar la Aplicación de forma lícita y de acuerdo con el orden público y las buenas costumbres. No podrá utilizar la plataforma para:</p>
        <ul>
          <li>Publicar contenido ofensivo, violento o discriminatorio en nombres de equipos o torneos.</li>
          <li>Introducir datos falsos o de terceros sin su consentimiento.</li>
          <li>Realizar actividades que puedan dañar, sobrecargar o inutilizar el servicio.</li>
        </ul>
        <p>
          Torneos TrendSport actúa como un mero intermediario en la gestión de los torneos. La organización del torneo,
          las reglas y la veracidad de los resultados son responsabilidad exclusiva del usuario organizador. La
          plataforma no actúa como federación deportiva ni entidad organizadora oficial.
        </p>
      </Section>

      <Section title="5. Exclusión de Garantías y Responsabilidad">
        <p>Torneos TrendSport ha adoptado las medidas técnicas necesarias para el correcto funcionamiento de la aplicación. Sin embargo, no se hace responsable de:</p>
        <ul>
          <li>La disponibilidad y continuidad del servicio, especialmente en caso de fallos en servicios de terceros (hosting, bases de datos cloud).</li>
          <li>Los daños y perjuicios de cualquier naturaleza que puedan deberse a la falta de veracidad de los datos proporcionados por los usuarios.</li>
          <li>Las decisiones tomadas por los organizadores basándose en los datos generados automáticamente (tablas de posiciones, avances de ganadores en eliminatorias, etc.).</li>
        </ul>
      </Section>

      <Section title="6. Legislación Aplicable y Jurisdicción">
        <p>
          La presente política se rige en todos y cada uno de sus extremos por la legislación vigente. Para la resolución
          de cualquier controversia que pudiera derivarse del acceso o uso de la aplicación, el Usuario y el Titular se
          someten expresamente a los juzgados y tribunales de la ciudad de [Tu Ciudad].
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