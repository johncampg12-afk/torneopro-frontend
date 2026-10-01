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
    <Box
      sx={{
        minHeight: '100dvh',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'clip',
        bgcolor: '#FAFAF8',
        position: 'relative',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}
    >
      {/* Fondo editorial aislado */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <EditorialBackground />
      </Box>

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100dvh',
          width: '100%',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {/* ══════════ COLUMNA IZQUIERDA ══════════ */}
        <Box
          sx={{
            flex: { xs: 1, md: '1 1 0%' },
            minWidth: 0,
            maxWidth: { xs: '100%', md: 620 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            px: { xs: 3, sm: 5, md: 7, lg: 10 },
            pt: { xs: 'calc(24px + env(safe-area-inset-top, 0px))', md: 6 },
            pb: { xs: 'calc(24px + env(safe-area-inset-bottom, 0px))', md: 6 },
          }}
        >
          {/* ── Logo ── */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: { xs: 'center', md: 'flex-start' },
              animation: `${fadeInUp} 0.6s ${SMOOTH} both`,
            }}
          >
            <Box
              sx={{
                width: { xs: 88, md: 60 },
                height: { xs: 88, md: 60 },
                borderRadius: { xs: '22px', md: '18px' },
                bgcolor: 'white',
                p: 0.5,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              }}
            >
              <Box
                component="img"
                src="/torneo-trend-sport.png"
                sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: { xs: '18px', md: '14px' },
                  objectFit: 'cover',
                }}
              />
            </Box>
          </Box>

          {/* ── Hero centrado verticalmente ── */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: { xs: 3, md: 3 },
              py: { xs: 5, md: 0 },
              animation: `${fadeInUp} 0.7s ${SMOOTH} both 0.1s`,
            }}
          >
            {/* Línea completa (igual que AuthPage) */}
            <Box
              sx={{
                width: '100%',
                height: '1px',
                bgcolor: 'rgba(17,17,17,0.14)',
                transformOrigin: 'left center',
                animation: `${lineGrow} 0.8s ${SMOOTH} both 0.4s`,
              }}
            />

            <Typography
              sx={{
                fontSize: { xs: 36, sm: 44, md: 52, lg: 64 },
                lineHeight: 1.02,
                fontWeight: 800,
                letterSpacing: -1.8,
                color: BLACK,
                fontFamily: '"Instrument Sans", system-ui, sans-serif',
                textTransform: 'uppercase',
                mt: { xs: 2, md: 1 },
              }}
            >
              Torneos<br />
              <Box component="span" sx={{ color: 'rgba(17,17,17,0.32)', fontWeight: 700 }}>
                TrendSport
              </Box>
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: 15, md: 16 },
                fontWeight: 500,
                color: 'rgba(17,17,17,0.55)',
                lineHeight: 1.6,
                maxWidth: 400,
              }}
            >
              La forma más simple de crear, gestionar y compartir torneos locales de fútbol.
            </Typography>
          </Box>

          {/* ── Acciones abajo ── */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 2, md: 2.5 },
              animation: `${fadeInUp} 0.6s ${SMOOTH} both 0.35s`,
            }}
          >
            {/* Botones */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 1.5,
              }}
            >
              <Button
                fullWidth
                onClick={() => navigate('/onboarding/basic-info')}
                sx={{
                  height: 52,
                  borderRadius: '999px',
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: -0.01,
                  bgcolor: BLACK,
                  color: 'white',
                  boxShadow: '0 8px 24px rgba(17,17,17,0.15)',
                  transition: `all 0.3s ${SMOOTH}`,
                  '&:hover': {
                    bgcolor: '#1a1a1a',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 12px 32px rgba(17,17,17,0.25)',
                  },
                  '&:active': { transform: 'scale(0.985)' },
                }}
              >
                Empezar
              </Button>
              <Button
                fullWidth
                onClick={() => navigate('/auth')}
                sx={{
                  height: 52,
                  borderRadius: '999px',
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: -0.01,
                  bgcolor: 'white',
                  color: BLACK,
                  border: '1.5px solid rgba(17,17,17,0.1)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                  transition: `all 0.3s ${SMOOTH}`,
                  '&:hover': {
                    bgcolor: 'white',
                    borderColor: 'rgba(17,17,17,0.35)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                  },
                  '&:active': { transform: 'scale(0.985)' },
                }}
              >
                Ya tengo cuenta
              </Button>
            </Box>

            {/* Enlaces secundarios */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: { xs: 'center', md: 'flex-start' },
                gap: 1.5,
                mt: 0.5,
              }}
            >
              <Typography
                onClick={() => setOrganizerModal(true)}
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 0.6,
                  color: 'rgba(17,17,17,0.35)',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: `color 0.2s ${SMOOTH}`,
                  '&:hover': { color: BLACK },
                }}
              >
                Soy organizador
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography
                  onClick={() => navigate('/terminos-condiciones')}
                  sx={{
                    fontSize: 11.5,
                    fontFamily: '"Fragment Mono", monospace',
                    color: 'rgba(17,17,17,0.35)',
                    cursor: 'pointer',
                    transition: `color 0.2s ${SMOOTH}`,
                    '&:hover': { color: BLACK },
                  }}
                >
                  Términos
                </Typography>
                <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'rgba(17,17,17,0.25)' }} />
                <Typography
                  onClick={() => navigate('/politica-privacidad')}
                  sx={{
                    fontSize: 11.5,
                    fontFamily: '"Fragment Mono", monospace',
                    color: 'rgba(17,17,17,0.35)',
                    cursor: 'pointer',
                    transition: `color 0.2s ${SMOOTH}`,
                    '&:hover': { color: BLACK },
                  }}
                >
                  Privacidad
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ══════════ COLUMNA DERECHA (desktop) ══════════ */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flex: '1 1 0%',
            minWidth: 0,
            alignItems: 'center',
            justifyContent: 'center',
            p: { md: 6, lg: 8 },
            borderLeft: '1px solid rgba(17,17,17,0.06)',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 460,
              aspectRatio: '4 / 5',
              borderRadius: '32px',
              overflow: 'hidden',
              background: 'linear-gradient(160deg, #0A0A0A 0%, #1a1a1a 100%)',
              boxShadow:
                '0 40px 80px -20px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06) inset',
              display: 'flex',
              flexDirection: 'column',
              animation: `${fadeInUp} 0.9s ${SMOOTH} both 0.2s`,
            }}
          >
            {/* Círculo decorativo arriba derecha */}
            <Box
              sx={{
                position: 'absolute',
                top: -100,
                right: -100,
                width: 300,
                height: 300,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.06)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 40,
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.04)',
                },
              }}
            />
            {/* Círculo decorativo abajo izquierda */}
            <Box
              sx={{
                position: 'absolute',
                bottom: -120,
                left: -80,
                width: 280,
                height: 280,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            />

            {/* Contenido central: logo gigante */}
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 5,
                gap: 3,
              }}
            >
              <Box
                sx={{
                  width: 150,
                  height: 150,
                  borderRadius: '38px',
                  bgcolor: 'white',
                  p: 1,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                }}
              >
                <Box
                  component="img"
                  src="/torneo-trend-sport.png"
                  sx={{ width: '100%', height: '100%', borderRadius: '30px', objectFit: 'cover' }}
                />
              </Box>

              <Typography
                sx={{
                  textAlign: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.4)',
                  fontFamily: '"Fragment Mono", monospace',
                }}
              >
                Fútbol · Torneos · Local
              </Typography>
            </Box>

            {/* Footer de la tarjeta */}
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                px: 5,
                pb: 5,
              }}
            >
              <Box sx={{ pt: 4, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: 'white',
                    lineHeight: 1.3,
                    letterSpacing: -0.5,
                    fontFamily: '"Instrument Sans", system-ui, sans-serif',
                  }}
                >
                  Crea el torneo.
                  <br />
                  Comparte el enlace.
                  <br />
                  <Box component="span" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                    Todo lo demás es automático.
                  </Box>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <OrganizerAccessModal open={organizerModal} onClose={() => setOrganizerModal(false)} />
    </Box>
  );
};