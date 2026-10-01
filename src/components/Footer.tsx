import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { SMOOTH, BLACK } from '../theme';

const MAX_WIDTH = 1280;

const linkSx = {
  fontSize: 12.5,
  fontFamily: '"Fragment Mono", monospace',
  color: 'rgba(17,17,17,0.45)',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: `color 0.2s ${SMOOTH}`,
  '&:hover': { color: BLACK },
} as const;

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: '1px solid rgba(17,17,17,0.06)',
        mt: 10,
        py: { xs: 5, md: 6 },
      }}
    >
      <Box
        sx={{
          maxWidth: MAX_WIDTH,
          mx: 'auto',
          width: '100%',
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'center' },
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          {/* Logo + nombre */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '10px',
                bgcolor: 'white',
                p: 0.25,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid rgba(17,17,17,0.06)',
              }}
            >
              <Box
                component="img"
                src="/torneo-trend-sport.png"
                sx={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }}
              />
            </Box>
            <Typography
              sx={{
                fontSize: 13.5,
                fontWeight: 800,
                letterSpacing: -0.4,
                color: BLACK,
                fontFamily: '"Instrument Sans", system-ui, sans-serif',
              }}
            >
              Torneos TrendSport
            </Typography>
          </Box>

          {/* Enlaces legales */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 3 } }}>
            <Typography component={Link} to="/aviso-legal" sx={linkSx}>
              Aviso legal
            </Typography>
            <Typography component={Link} to="/politica-privacidad" sx={linkSx}>
              Privacidad
            </Typography>
            <Typography component={Link} to="/terminos-condiciones" sx={linkSx}>
              Términos
            </Typography>
          </Box>
        </Box>

        <Typography
          sx={{
            mt: 4,
            fontSize: 11,
            color: 'rgba(17,17,17,0.3)',
            textAlign: 'center',
            fontFamily: '"Fragment Mono", monospace',
          }}
        >
          © {new Date().getFullYear()} Torneos TrendSport · Hecho en Valencia
        </Typography>
      </Box>
    </Box>
  );
}