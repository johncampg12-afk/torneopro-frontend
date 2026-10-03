import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Stack, Chip, Dialog, keyframes, IconButton,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { REWARDS, TIER_INFO, ORGANIZER_WHATSAPP, Reward } from '../data/rewards';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { BLACK, SMOOTH, SPRING } from '../theme';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
`;

const MAX_WIDTH = 1280;

export default function Rewards() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [redeeming, setRedeeming] = useState<Reward | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [justRedeemed, setJustRedeemed] = useState<any>(null);

  const coins = user?.coins ?? 0;
  const phone = user?.phone;

  const handleRedeem = async () => {
    if (!redeeming) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/redemptions', {
        rewardId: redeeming.id,
        rewardTitle: redeeming.title,
        sponsorName: redeeming.sponsor,
        cost: redeeming.cost,
      });
      await refreshUser();
      setJustRedeemed({ ...redeeming, code: res.data.redemption.id.slice(-6).toUpperCase() });
      setRedeeming(null);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al canjear');
    } finally {
      setLoading(false);
    }
  };

  const grouped = {
    bronze: REWARDS.filter(r => r.tier === 'bronze'),
    silver: REWARDS.filter(r => r.tier === 'silver'),
    gold: REWARDS.filter(r => r.tier === 'gold'),
    diamond: REWARDS.filter(r => r.tier === 'diamond'),
  };

  return (
    <Box sx={{ maxWidth: MAX_WIDTH, mx: 'auto', width: '100%', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 5 } }}>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          component={Link}
          to="/"
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
        <Box sx={{ flex: 1, minWidth: 0 }}>
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
            Premios
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13.5, color: 'rgba(17,17,17,0.5)', fontWeight: 500 }}>
            Canjea tus TrendCoins por recompensas reales
          </Typography>
        </Box>
        {user && (
          <Chip
            label={`🪙 ${coins.toLocaleString('es-ES')}`}
            sx={{
              height: 34,
              fontSize: 13.5,
              fontWeight: 800,
              bgcolor: BLACK,
              color: 'white',
              fontFamily: '"Instrument Sans", system-ui, sans-serif',
            }}
          />
        )}
      </Box>

      {/* Aviso sin teléfono */}
      {user && !phone && (
        <Box
          sx={{
            p: 2,
            borderRadius: '16px',
            bgcolor: 'rgba(251,146,60,0.08)',
            border: '1px solid rgba(251,146,60,0.25)',
            mb: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Typography sx={{ fontSize: 20 }}>📱</Typography>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#9A3412' }}>
              Añade tu teléfono para canjear
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'rgba(154,52,18,0.8)', mt: 0.25 }}>
              Lo necesitamos para contactarte por WhatsApp
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/profile"
            sx={{
              height: 36,
              borderRadius: '999px',
              px: 2,
              fontWeight: 700,
              fontSize: 12.5,
              bgcolor: '#9A3412',
              color: 'white',
              '&:hover': { bgcolor: '#7C2D12' },
            }}
          >
            Añadir
          </Button>
        </Box>
      )}

      {/* Aviso no logueado */}
      {!user && (
        <Box
          sx={{
            p: 2.5,
            borderRadius: '16px',
            bgcolor: 'rgba(17,17,17,0.03)',
            border: '1px solid rgba(17,17,17,0.08)',
            mb: 4,
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: 'rgba(17,17,17,0.7)', mb: 1.5 }}>
            Inicia sesión para empezar a canjear premios
          </Typography>
          <Button
            component={Link}
            to="/auth"
            sx={{
              height: 42,
              borderRadius: '999px',
              px: 3,
              fontWeight: 700,
              fontSize: 13.5,
              bgcolor: BLACK,
              color: 'white',
              '&:hover': { bgcolor: '#1a1a1a' },
            }}
          >
            Iniciar sesión
          </Button>
        </Box>
      )}

      {/* Secciones por tier */}
      {(Object.keys(grouped) as Array<keyof typeof grouped>).map(tierKey => {
        const tier = TIER_INFO[tierKey];
        const rewards = grouped[tierKey];
        if (rewards.length === 0) return null;

        return (
          <Box key={tierKey} sx={{ mb: 6, animation: `${fadeInUp} 0.5s ${SMOOTH} both` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
              <Typography sx={{ fontSize: 24 }}>{tier.emoji}</Typography>
              <Typography
                sx={{
                  fontSize: { xs: 18, md: 22 },
                  fontWeight: 800,
                  letterSpacing: -0.6,
                  color: BLACK,
                  fontFamily: '"Instrument Sans", system-ui, sans-serif',
                }}
              >
                {tier.label}
              </Typography>
              <Chip
                label={`${rewards.length} premios`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: 10,
                  fontWeight: 700,
                  bgcolor: tier.bg,
                  color: tier.color,
                }}
              />
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)',
                },
                gap: 2.5,
              }}
            >
              {rewards.map(reward => {
                const canAfford = coins >= reward.cost;
                return (
                  <Box
                    key={reward.id}
                    sx={{
                      borderRadius: '20px',
                      bgcolor: 'white',
                      border: '1px solid rgba(17,17,17,0.06)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: `all 0.3s ${SMOOTH}`,
                      '&:hover': {
                        borderColor: 'rgba(17,17,17,0.15)',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    {/* Imagen */}
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '16 / 10',
                        bgcolor: 'rgba(17,17,17,0.04)',
                        backgroundImage: `url(${reward.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <Chip
                        label={tier.emoji + ' ' + tier.label}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          height: 22,
                          fontSize: 10,
                          fontWeight: 800,
                          bgcolor: 'rgba(255,255,255,0.9)',
                          color: tier.color,
                          backdropFilter: 'blur(8px)',
                        }}
                      />
                    </Box>

                    {/* Info */}
                    <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: 0.5,
                          textTransform: 'uppercase',
                          color: 'rgba(17,17,17,0.45)',
                          mb: 0.5,
                        }}
                      >
                        {reward.sponsor}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 17,
                          fontWeight: 800,
                          letterSpacing: -0.4,
                          color: BLACK,
                          fontFamily: '"Instrument Sans", system-ui, sans-serif',
                          lineHeight: 1.25,
                          mb: 1,
                        }}
                      >
                        {reward.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 13,
                          color: 'rgba(17,17,17,0.55)',
                          lineHeight: 1.5,
                          mb: 2.5,
                          flex: 1,
                        }}
                      >
                        {reward.description}
                      </Typography>

                      {/* Coste + botón */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        <Box>
                          <Typography
                            sx={{
                              fontSize: 20,
                              fontWeight: 900,
                              color: canAfford ? BLACK : 'rgba(17,17,17,0.35)',
                              fontFamily: '"Instrument Sans", system-ui, sans-serif',
                              lineHeight: 1,
                            }}
                          >
                            {reward.cost.toLocaleString('es-ES')}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 9.5,
                              fontWeight: 700,
                              letterSpacing: 0.5,
                              textTransform: 'uppercase',
                              color: 'rgba(17,17,17,0.4)',
                              mt: 0.25,
                            }}
                          >
                            coins
                          </Typography>
                        </Box>

                        <Button
                          disabled={!user || !canAfford || !phone}
                          onClick={() => setRedeeming(reward)}
                          sx={{
                            height: 40,
                            borderRadius: '999px',
                            px: 2.5,
                            fontWeight: 700,
                            fontSize: 13,
                            bgcolor: BLACK,
                            color: 'white',
                            '&:disabled': { bgcolor: 'rgba(17,17,17,0.06)', color: 'rgba(17,17,17,0.3)' },
                            '&:hover': { bgcolor: '#1a1a1a' },
                          }}
                        >
                          {!user ? 'Inicia sesión' : !phone ? 'Falta teléfono' : !canAfford ? 'Sin coins' : 'Canjear'}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        );
      })}

      {/* Modal de confirmación */}
      <Dialog
        open={Boolean(redeeming)}
        onClose={() => !loading && setRedeeming(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          backdrop: { sx: { bgcolor: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(8px)' } },
          paper: {
            sx: {
              borderRadius: '24px',
              bgcolor: '#FAFAF8',
              p: 3,
              backgroundImage: 'none',
              animation: `${scaleIn} 0.4s ${SPRING} both`,
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.4,
              textTransform: 'uppercase',
              color: 'rgba(17,17,17,0.4)',
            }}
          >
            Confirmar canje
          </Typography>
          <IconButton onClick={() => !loading && setRedeeming(null)} size="small" sx={{ color: 'rgba(17,17,17,0.5)' }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {redeeming && (
          <>
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: -0.6,
                lineHeight: 1.2,
                color: BLACK,
                fontFamily: '"Instrument Sans", system-ui, sans-serif',
                mb: 1,
              }}
            >
              {redeeming.title}
            </Typography>
            <Typography sx={{ fontSize: 13.5, color: 'rgba(17,17,17,0.55)', mb: 3 }}>
              {redeeming.sponsor}
            </Typography>

            <Box
              sx={{
                p: 2,
                borderRadius: '14px',
                bgcolor: 'white',
                border: '1px solid rgba(17,17,17,0.06)',
                mb: 3,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontSize: 13, color: 'rgba(17,17,17,0.55)' }}>Coste</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: BLACK }}>
                  -{redeeming.cost.toLocaleString('es-ES')} coins
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 13, color: 'rgba(17,17,17,0.55)' }}>Saldo restante</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: BLACK }}>
                  {(coins - redeeming.cost).toLocaleString('es-ES')} coins
                </Typography>
              </Box>
            </Box>

            <Typography
              sx={{
                fontSize: 12,
                color: 'rgba(17,17,17,0.5)',
                lineHeight: 1.5,
                mb: 3,
                textAlign: 'center',
              }}
            >
              Te contactaremos por WhatsApp al <strong>{phone}</strong> para coordinar la entrega.
            </Typography>

            {error && (
              <Typography sx={{ mb: 2, fontSize: 13, color: '#DC2626', fontWeight: 500, textAlign: 'center' }}>
                {error}
              </Typography>
            )}

            <Button
              fullWidth
              disabled={loading}
              onClick={handleRedeem}
              sx={{
                height: 52,
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: 15,
                bgcolor: BLACK,
                color: 'white',
                '&:disabled': { bgcolor: 'rgba(17,17,17,0.06)', color: 'rgba(17,17,17,0.3)' },
                '&:hover': { bgcolor: '#1a1a1a' },
              }}
            >
              {loading ? 'Canjeando…' : 'Confirmar canje'}
            </Button>
          </>
        )}
      </Dialog>

      {/* Modal de éxito */}
      <Dialog
        open={Boolean(justRedeemed)}
        onClose={() => setJustRedeemed(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          backdrop: { sx: { bgcolor: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(8px)' } },
          paper: {
            sx: {
              borderRadius: '24px',
              bgcolor: '#FAFAF8',
              p: 3.5,
              backgroundImage: 'none',
              animation: `${scaleIn} 0.4s ${SPRING} both`,
            },
          },
        }}
      >
        <Box
          sx={{
            width: 64, height: 64,
            borderRadius: '20px',
            bgcolor: 'rgba(34,197,94,0.12)',
            display: 'grid', placeItems: 'center',
            mx: 'auto', mb: 2.5,
            fontSize: 30,
          }}
        >
          🎉
        </Box>

        <Typography
          sx={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: -0.6,
            color: BLACK,
            fontFamily: '"Instrument Sans", system-ui, sans-serif',
            textAlign: 'center',
            mb: 1.5,
          }}
        >
          ¡Canje registrado!
        </Typography>

        {justRedeemed && (
          <>
            <Typography
              sx={{
                fontSize: 14,
                color: 'rgba(17,17,17,0.6)',
                textAlign: 'center',
                lineHeight: 1.55,
                mb: 3,
              }}
            >
              Te contactaremos por WhatsApp para coordinar la entrega de <strong>{justRedeemed.title}</strong> en <strong>{justRedeemed.sponsor}</strong>.
            </Typography>

            <Box
              sx={{
                p: 2.5,
                borderRadius: '14px',
                bgcolor: 'white',
                border: '1px solid rgba(17,17,17,0.06)',
                textAlign: 'center',
                mb: 3,
              }}
            >
              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: 'rgba(17,17,17,0.4)',
                  mb: 0.5,
                }}
              >
                Tu código de canje
              </Typography>
              <Typography
                sx={{
                  fontSize: 24,
                  fontWeight: 900,
                  letterSpacing: 3,
                  color: BLACK,
                  fontFamily: '"Fragment Mono", monospace',
                }}
              >
                #{justRedeemed.code}
              </Typography>
            </Box>

            <Button
              component={Link}
              to="/my-rewards"
              fullWidth
              sx={{
                height: 52,
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: 15,
                bgcolor: BLACK,
                color: 'white',
                mb: 1,
                '&:hover': { bgcolor: '#1a1a1a' },
              }}
            >
              Ver mis canjes
            </Button>

            <Box
              onClick={() => setJustRedeemed(null)}
              sx={{ textAlign: 'center', cursor: 'pointer', mt: 1.5, '&:hover': { opacity: 0.7 } }}
            >
              <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: 'rgba(17,17,17,0.5)' }}>
                Seguir explorando
              </Typography>
            </Box>
          </>
        )}
      </Dialog>
    </Box>
  );
}