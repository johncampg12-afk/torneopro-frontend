import { useState, useEffect } from 'react';
import { Box, Typography, Button, keyframes } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { EditorialBackground } from '../../components/EditorialBackground';
import { OrganizerAccessModal } from '../../components/OrganizerAccessModal';
import { SMOOTH, BLACK } from '../../theme';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;
const lineGrow = keyframes`
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
`;

export const WelcomePage = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [organizerModal, setOrganizerModal] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: '#FAFAF8', position: 'relative', overflow: 'hidden',
      opacity: mounted ? 1 : 0, transition: 'opacity 0.4s ease' }}>
      <EditorialBackground />

      <Box sx={{ position: 'relative', zIndex: 1, minHeight: '100dvh',
        maxWidth: 480, mx: 'auto', width: '100%',
        display: 'flex', flexDirection: 'column',
        px: 3, pt: 'calc(24px + env(safe-area-inset-top, 0px))',
        pb: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>

        {/* Logo centrado arriba */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2,
          animation: `${fadeInUp} 0.6s ${SMOOTH} both` }}>
          <Box sx={{ width: 96, height: 96, borderRadius: '24px', bgcolor: 'white', p: 0.5,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <Box component="img" src="/torneo-trend-sport.png"
              sx={{ width: '100%', height: '100%', borderRadius: '20px', objectFit: 'cover' }} />
          </Box>
        </Box>

        {/* Hero */}
        <Box sx={{ mt: 'auto', mb: 'auto', pt: 6,
          animation: `${fadeInUp} 0.7s ${SMOOTH} both 0.1s` }}>
          <Box sx={{ height: 1, bgcolor: 'rgba(17,17,17,0.14)', transformOrigin: 'left center',
            animation: `${lineGrow} 0.8s ${SMOOTH} both 0.5s` }} />

          <Typography sx={{ mt: 5, fontSize: { xs: 34, md: 42 }, lineHeight: 1.02, fontWeight: 800,
            letterSpacing: -1.6, color: BLACK, fontFamily: '"Instrument Sans", system-ui, sans-serif',
            textTransform: 'uppercase' }}>
            Torneos<br />
            <Box component="span" sx={{ color: 'rgba(17,17,17,0.35)', fontWeight: 700 }}>
              TrendSport
            </Box>
          </Typography>

          <Typography sx={{ mt: 2.5, fontSize: 15, fontWeight: 500,
            color: 'rgba(17,17,17,0.55)', lineHeight: 1.55, maxWidth: 340 }}>
            La forma más simple de crear, gestionar y compartir torneos locales de fútbol.
          </Typography>
        </Box>

        {/* Botones */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5,
          animation: `${fadeInUp} 0.6s ${SMOOTH} both 0.35s` }}>
          <Button fullWidth onClick={() => navigate('/onboarding/basic-info')}
            sx={{ height: 56, borderRadius: '16px', fontWeight: 700, fontSize: 15.5, letterSpacing: -0.01,
              bgcolor: BLACK, color: 'white', boxShadow: '0 8px 24px rgba(17,17,17,0.15)',
              transition: `all 0.3s ${SMOOTH}`,
              '&:hover': { bgcolor: '#1a1a1a', transform: 'translateY(-1px)',
                boxShadow: '0 12px 32px rgba(17,17,17,0.25)' },
              '&:active': { transform: 'scale(0.985)' } }}>
            Empezar
          </Button>
          <Button fullWidth onClick={() => navigate('/auth')}
            sx={{ height: 56, borderRadius: '16px', fontWeight: 700, fontSize: 15.5, letterSpacing: -0.01,
              bgcolor: 'white', color: BLACK, border: '1.5px solid rgba(17,17,17,0.1)', boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
              transition: `all 0.3s ${SMOOTH}`,
              '&:hover': { bgcolor: 'white', borderColor: 'rgba(17,17,17,0.35)', transform: 'translateY(-1px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)' },
              '&:active': { transform: 'scale(0.985)' } }}>
            Ya tengo cuenta
          </Button>

          {/* Acceso organizadores (pequeño, discreto) */}
          <Box onClick={() => setOrganizerModal(true)}
            sx={{ mt: 1, textAlign: 'center', cursor: 'pointer', transition: `opacity 0.2s ${SMOOTH}`,
              '&:hover': { opacity: 0.7 } }}>
            <Typography sx={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
              color: 'rgba(17,17,17,0.35)', textTransform: 'uppercase' }}>
              Soy organizador
            </Typography>
          </Box>

          {/* Legal */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mt: 2 }}>
            <Typography onClick={() => navigate('/terminos-condiciones')}
              sx={{ fontSize: 11.5, fontFamily: '"Fragment Mono", monospace',
                color: 'rgba(17,17,17,0.35)', cursor: 'pointer',
                '&:hover': { color: BLACK } }}>
              Términos
            </Typography>
            <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'rgba(17,17,17,0.25)' }} />
            <Typography onClick={() => navigate('/politica-privacidad')}
              sx={{ fontSize: 11.5, fontFamily: '"Fragment Mono", monospace',
                color: 'rgba(17,17,17,0.35)', cursor: 'pointer',
                '&:hover': { color: BLACK } }}>
              Privacidad
            </Typography>
          </Box>
        </Box>
      </Box>

      <OrganizerAccessModal open={organizerModal} onClose={() => setOrganizerModal(false)} />
    </Box>
  );
};