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
    <Box sx={{
      minHeight: '100dvh', bgcolor: '#FAFAF8', position: 'relative', overflow: 'hidden',
      opacity: mounted ? 1 : 0, transition: 'opacity 0.4s ease',
    }}>
      <EditorialBackground />

      <Box sx={{
        position: 'relative', zIndex: 1,
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
      }}>

        {/* ═══════════ COLUMNA IZQUIERDA / MÓVIL ═══════════ */}
        <Box sx={{
          flex: { md: 1 },
          display: 'flex', flexDirection: 'column',
          px: { xs: 3, sm: 4, md: 8, lg: 12 },
          pt: { xs: 'calc(24px + env(safe-area-inset-top, 0px))', md: 6 },
          pb: { xs: 'calc(24px + env(safe-area-inset-bottom, 0px))', md: 6 },
          maxWidth: { xs: '100%', md: 640 },
          width: '100%',
          mx: { md: 0 },
        }}>

          {/* Logo (en móvil centrado, en desktop arriba a la izquierda) */}
          <Box sx={{
            display: { xs: 'flex', md: 'flex' },
            justifyContent: { xs: 'center', md: 'flex-start' },
            animation: `${fadeInUp} 0.6s ${SMOOTH} both`,
          }}>
            <Box sx={{
              width: { xs: 96, md: 64 },
              height: { xs: 96, md: 64 },
              borderRadius: { xs: '24px', md: '18px' },
              bgcolor: 'white',
              p: 0.5,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}>
              <Box component="img" src="/torneo-trend-sport.png"
                sx={{ width: '100%', height: '100%', borderRadius: { xs: '20px', md: '14px' }, objectFit: 'cover' }} />
            </Box>
          </Box>

          {/* Hero */}
          <Box sx={{
            mt: { xs: 'auto', md: 0 },
            mb: { xs: 'auto', md: 0 },
            pt: { xs: 6, md: 0 },
            flex: { md: 1 },
            display: { md: 'flex' }, flexDirection: { md: 'column' }, justifyContent: { md: 'center' },
            animation: `${fadeInUp} 0.7s ${SMOOTH} both 0.1s`,
          }}>
            <Box sx={{ height: 1, bgcolor: 'rgba(17,17,17,0.14)', transformOrigin: 'left center',
              animation: `${lineGrow} 0.8s ${SMOOTH} both 0.5s` }} />

            <Typography sx={{
              mt: { xs: 5, md: 4 },
              fontSize: { xs: 34, sm: 42, md: 56, lg: 72 },
              lineHeight: 1.02, fontWeight: 800, letterSpacing: -1.6,
              color: BLACK, fontFamily: '"Instrument Sans", system-ui, sans-serif',
              textTransform: 'uppercase',
            }}>
              Torneos<br />
              <Box component="span" sx={{ color: 'rgba(17,17,17,0.35)', fontWeight: 700 }}>
                TrendSport
              </Box>
            </Typography>

            <Typography sx={{
              mt: { xs: 2.5, md: 3 },
              fontSize: { xs: 15, md: 18 },
              fontWeight: 500, color: 'rgba(17,17,17,0.55)', lineHeight: 1.55,
              maxWidth: 440,
            }}>
              La forma más simple de crear, gestionar y compartir torneos locales de fútbol.
            </Typography>
          </Box>

          {/* Botones + legal */}
          <Box sx={{
            display: 'flex', flexDirection: 'column',
            gap: { xs: 1.5, md: 2 },
            animation: `${fadeInUp} 0.6s ${SMOOTH} both 0.35s`,
          }}>
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1.5,
            }}>
              <Button fullWidth onClick={() => navigate('/onboarding/basic-info')}
                sx={{
                  height: { xs: 56, md: 58 },
                  borderRadius: '16px', fontWeight: 700, fontSize: 15.5, letterSpacing: -0.01,
                  bgcolor: BLACK, color: 'white', boxShadow: '0 8px 24px rgba(17,17,17,0.15)',
                  transition: `all 0.3s ${SMOOTH}`,
                  '&:hover': { bgcolor: '#1a1a1a', transform: 'translateY(-1px)',
                    boxShadow: '0 12px 32px rgba(17,17,17,0.25)' },
                  '&:active': { transform: 'scale(0.985)' },
                }}>
                Empezar
              </Button>
              <Button fullWidth onClick={() => navigate('/auth')}
                sx={{
                  height: { xs: 56, md: 58 },
                  borderRadius: '16px', fontWeight: 700, fontSize: 15.5, letterSpacing: -0.01,
                  bgcolor: 'white', color: BLACK, border: '1.5px solid rgba(17,17,17,0.1)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                  transition: `all 0.3s ${SMOOTH}`,
                  '&:hover': { bgcolor: 'white', borderColor: 'rgba(17,17,17,0.35)',
                    transform: 'translateY(-1px)', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' },
                  '&:active': { transform: 'scale(0.985)' },
                }}>
                Ya tengo cuenta
              </Button>
            </Box>

            <Box onClick={() => setOrganizerModal(true)}
              sx={{ textAlign: { xs: 'center', md: 'left' }, cursor: 'pointer', mt: { md: 1 },
                transition: `opacity 0.2s ${SMOOTH}`, '&:hover': { opacity: 0.7 } }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
                color: 'rgba(17,17,17,0.35)', textTransform: 'uppercase' }}>
                Soy organizador
              </Typography>
            </Box>

            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              mt: { xs: 2, md: 3 },
              justifyContent: { xs: 'center', md: 'flex-start' },
            }}>
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

        {/* ═══════════ COLUMNA DERECHA (solo desktop) ═══════════ */}
        <Box sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          alignItems: 'center', justifyContent: 'center',
          p: { md: 6, lg: 10 },
          position: 'relative',
          borderLeft: '1px solid rgba(17,17,17,0.06)',
        }}>
          <Box sx={{
            position: 'relative',
            width: '100%', maxWidth: 480,
            aspectRatio: '4/5',
            borderRadius: '32px',
            overflow: 'hidden',
            background: 'linear-gradient(160deg, #0A0A0A 0%, #1a1a1a 100%)',
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06) inset',
            display: 'flex', flexDirection: 'column',
            animation: `${fadeInUp} 0.9s ${SMOOTH} both 0.2s`,
          }}>
            {/* Patrón de círculos sutiles */}
            <Box sx={{
              position: 'absolute', top: -100, right: -100,
              width: 300, height: 300, borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.06)',
              '&::before': { content: '""', position: 'absolute', inset: 40, borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.04)' },
            }} />
            <Box sx={{
              position: 'absolute', bottom: -120, left: -80,
              width: 280, height: 280, borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.05)',
            }} />

            {/* Logo gigante arriba */}
            <Box sx={{
              position: 'relative', zIndex: 1,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              flex: 1, p: 5, gap: 4,
            }}>
              <Box sx={{
                width: 160, height: 160,
                borderRadius: '40px', bgcolor: 'white',
                p: 1, boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              }}>
                <Box component="img" src="/torneo-trend-sport.png"
                  sx={{ width: '100%', height: '100%', borderRadius: '32px', objectFit: 'cover' }} />
              </Box>

              <Typography sx={{
                mt: 2, textAlign: 'center',
                fontSize: 11, fontWeight: 700, letterSpacing: 3,
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                fontFamily: '"Fragment Mono", monospace',
              }}>
                Fútbol · Torneos · Local
              </Typography>
            </Box>

            {/* Footer de la tarjeta */}
            <Box sx={{
              position: 'relative', zIndex: 1,
              p: 5, pt: 0,
            }}>
              <Box sx={{
                pt: 4, borderTop: '1px solid rgba(255,255,255,0.08)',
              }}>
                <Typography sx={{
                  fontSize: 22, fontWeight: 700, color: 'white',
                  lineHeight: 1.25, letterSpacing: -0.5,
                  fontFamily: '"Instrument Sans", system-ui, sans-serif',
                }}>
                  Crea el torneo.<br />
                  Comparte el enlace.<br />
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