import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Stack, Chip, keyframes, Skeleton,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { BLACK, SMOOTH } from '../theme';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const MAX_WIDTH = 720;

const statusInfo = (status: string) => {
  if (status === 'pending') return { label: 'Pendiente', color: '#92400E', bg: 'rgba(251,191,36,0.15)' };
  if (status === 'completed') return { label: 'Entregado', color: '#16A34A', bg: 'rgba(34,197,94,0.12)' };
  if (status === 'cancelled') return { label: 'Cancelado', color: '#DC2626', bg: 'rgba(220,38,38,0.1)' };
  return { label: status, color: 'rgba(17,17,17,0.5)', bg: 'rgba(17,17,17,0.05)' };
};

export default function MyRewards() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/welcome'); return; }
    api.get('/redemptions/my')
      .then(res => setRedemptions(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) return (
    <Box sx={{ maxWidth: MAX_WIDTH, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: 5 }}>
      <Skeleton variant="rounded" height={120} sx={{ borderRadius: '20px', mb: 3 }} />
      <Skeleton variant="rounded" height={300} sx={{ borderRadius: '20px' }} />
    </Box>
  );

  return (
    <Box sx={{ maxWidth: MAX_WIDTH, mx: 'auto', width: '100%', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 5 } }}>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          component={Link}
          to="/profile"
          sx={{
            minWidth: 40, width: 40, height: 40, borderRadius: '50%',
            bgcolor: 'white',
            border: '1px solid rgba(17,17,17,0.06)',
            color: 'rgba(17,17,17,0.7)',
            display: 'grid', placeItems: 'center', p: 0,
            '&:hover': { bgcolor: 'white', borderColor: 'rgba(17,17,17,0.2)' },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} />
        </Button>
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 24, sm: 28, md: 34 },
              fontWeight: 800,
              letterSpacing: -1,
              lineHeight: 1.1,
              color: BLACK,
              fontFamily: '"Instrument Sans", system-ui, sans-serif',
            }}
          >
            Mis canjes
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13.5, color: 'rgba(17,17,17,0.5)', fontWeight: 500 }}>
            Historial de premios que has canjeado
          </Typography>
        </Box>
      </Box>

      {redemptions.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 8, md: 10 },
            borderRadius: '24px',
            bgcolor: 'white',
            border: '1px solid rgba(17,17,17,0.06)',
            animation: `${fadeInUp} 0.5s ${SMOOTH} both`,
          }}
        >
          <Box
            sx={{
              width: 64, height: 64,
              borderRadius: '20px',
              bgcolor: 'rgba(17,17,17,0.04)',
              display: 'grid', placeItems: 'center',
              mx: 'auto', mb: 2.5,
            }}
          >
            <EmojiEventsIcon sx={{ fontSize: 30, color: 'rgba(17,17,17,0.3)' }} />
          </Box>
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 700,
              color: 'rgba(17,17,17,0.6)',
              fontFamily: '"Instrument Sans", system-ui, sans-serif',
            }}
          >
            Aún no has canjeado ningún premio
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 14, color: 'rgba(17,17,17,0.5)', mb: 3 }}>
            Explora el catálogo y usa tus TrendCoins.
          </Typography>
          <Button
            component={Link}
            to="/rewards"
            sx={{
              height: 48,
              borderRadius: '999px',
              px: 3,
              fontWeight: 700,
              fontSize: 14,
              bgcolor: BLACK,
              color: 'white',
              '&:hover': { bgcolor: '#1a1a1a' },
            }}
          >
            🎁 Ver catálogo
          </Button>
        </Box>
      ) : (
        <Stack spacing={2} sx={{ animation: `${fadeInUp} 0.5s ${SMOOTH} both` }}>
          {redemptions.map(r => {
            const s = statusInfo(r.status);
            return (
              <Box
                key={r.id}
                sx={{
                  p: 2.5,
                  borderRadius: '18px',
                  bgcolor: 'white',
                  border: '1px solid rgba(17,17,17,0.06)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                        color: 'rgba(17,17,17,0.45)',
                        mb: 0.25,
                      }}
                    >
                      {r.sponsorName}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 17,
                        fontWeight: 800,
                        letterSpacing: -0.4,
                        color: BLACK,
                        fontFamily: '"Instrument Sans", system-ui, sans-serif',
                      }}
                    >
                      {r.rewardTitle}
                    </Typography>
                  </Box>
                  <Chip
                    label={s.label}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: 10.5,
                      fontWeight: 800,
                      letterSpacing: 0.3,
                      bgcolor: s.bg,
                      color: s.color,
                      flexShrink: 0,
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                  <Typography sx={{ fontSize: 12, color: 'rgba(17,17,17,0.5)' }}>
                    {new Date(r.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: BLACK,
                      fontFamily: '"Instrument Sans", system-ui, sans-serif',
                    }}
                  >
                    -{r.cost.toLocaleString('es-ES')} coins
                  </Typography>
                </Box>

                {/* Código y estado */}
                {r.status === 'pending' && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 1.75,
                      borderRadius: '12px',
                      bgcolor: 'rgba(251,191,36,0.08)',
                      border: '1px solid rgba(251,191,36,0.2)',
                    }}
                  >
                    <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#92400E', mb: 0.5 }}>
                      Código de canje
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 18,
                        fontWeight: 900,
                        letterSpacing: 2,
                        color: '#92400E',
                        fontFamily: '"Fragment Mono", monospace',
                      }}
                    >
                      #{r.id.slice(-6).toUpperCase()}
                    </Typography>
                    <Typography sx={{ fontSize: 11.5, color: 'rgba(146,64,14,0.75)', mt: 0.75, lineHeight: 1.4 }}>
                      Te contactaremos por WhatsApp para coordinar la entrega.
                    </Typography>
                  </Box>
                )}

                {r.status === 'completed' && r.completedAt && (
                  <Typography sx={{ mt: 2, fontSize: 12, color: '#16A34A', fontWeight: 600 }}>
                    ✓ Entregado el {new Date(r.completedAt).toLocaleDateString('es-ES')}
                  </Typography>
                )}

                {r.status === 'cancelled' && r.completedAt && (
                  <Typography sx={{ mt: 2, fontSize: 12, color: '#DC2626', fontWeight: 600 }}>
                    Cancelado el {new Date(r.completedAt).toLocaleDateString('es-ES')} · Coins devueltas
                  </Typography>
                )}
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}