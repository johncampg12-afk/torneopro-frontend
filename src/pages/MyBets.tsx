import { useEffect, useState } from 'react';
import { Box, Typography, Button, Stack, Chip, keyframes, Skeleton } from '@mui/material';
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

const MAX_WIDTH = 800;

export default function MyBets() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [bets, setBets] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/welcome'); return; }

    Promise.all([
      api.get('/bets/my'),
      api.get('/users/me/stats'),
    ])
      .then(([betsRes, statsRes]) => {
        setBets(betsRes.data);
        setStats(statsRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Bono diario al entrar
    api.post('/users/me/daily-bonus')
      .then(res => {
        if (res.data.granted) {
          refreshUser();
          const el = document.createElement('div');
          el.textContent = `🎁 +${res.data.bonus} TrendCoins`;
          el.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0A0A0A;color:white;padding:10px 20px;border-radius:999px;font-size:13px;font-weight:600;z-index:9999;font-family:inherit;box-shadow:0 8px 24px rgba(0,0,0,0.2);`;
          document.body.appendChild(el);
          setTimeout(() => el.remove(), 2500);
        }
      })
      .catch(() => {});
  }, [user, navigate, refreshUser]);

  if (loading) return (
    <Box sx={{ maxWidth: MAX_WIDTH, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: 5 }}>
      <Skeleton variant="rounded" height={120} sx={{ borderRadius: '20px', mb: 3 }} />
      <Skeleton variant="rounded" height={400} sx={{ borderRadius: '20px' }} />
    </Box>
  );

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
            Mis apuestas
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13.5, color: 'rgba(17,17,17,0.5)', fontWeight: 500 }}>
            Historial y estadísticas
          </Typography>
        </Box>
      </Box>

      {/* Stats */}
      {stats && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 2,
            mb: 4,
            animation: `${fadeInUp} 0.5s ${SMOOTH} both`,
          }}
        >
          {[
            { label: 'Saldo', value: stats.coins.toLocaleString('es-ES'), accent: true },
            { label: 'Ganadas', value: stats.bets.won, color: '#16A34A' },
            { label: 'Perdidas', value: stats.bets.lost, color: '#DC2626' },
            { label: '% Acierto', value: `${stats.bets.winRate}%`, color: BLACK },
          ].map((s, i) => (
            <Box
              key={i}
              sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: '18px',
                bgcolor: s.accent ? BLACK : 'white',
                border: '1px solid',
                borderColor: s.accent ? BLACK : 'rgba(17,17,17,0.06)',
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: 22, md: 26 },
                  fontWeight: 900,
                  letterSpacing: -1,
                  color: s.accent ? 'white' : (s.color || BLACK),
                  fontFamily: '"Instrument Sans", system-ui, sans-serif',
                  lineHeight: 1,
                }}
              >
                {s.value}
              </Typography>
              <Typography
                sx={{
                  mt: 0.75,
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  color: s.accent ? 'rgba(255,255,255,0.5)' : 'rgba(17,17,17,0.4)',
                }}
              >
                {s.label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Botón ir a premios */}
      <Button
        component={Link}
        to="/rewards"
        fullWidth
        sx={{
          height: 52,
          borderRadius: '16px',
          mb: 4,
          fontWeight: 700,
          fontSize: 14.5,
          bgcolor: 'white',
          color: BLACK,
          border: '1.5px solid rgba(17,17,17,0.08)',
          '&:hover': { borderColor: 'rgba(17,17,17,0.25)', bgcolor: 'white' },
        }}
      >
        🎁 Ver catálogo de premios
      </Button>

      {/* Lista de apuestas */}
      {bets.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 8, md: 10 },
            borderRadius: '24px',
            bgcolor: 'white',
            border: '1px solid rgba(17,17,17,0.06)',
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
            Aún no has hecho ninguna apuesta
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 14, color: 'rgba(17,17,17,0.5)' }}>
            Cuando apuestes en un partido, aparecerá aquí.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5} sx={{ animation: `${fadeInUp} 0.5s ${SMOOTH} both 0.1s` }}>
          {bets.map(bet => {
            const match = bet.match;
            const home = match?.homeTeam;
            const away = match?.awayTeam;
            const predictedTeam = bet.prediction === 'home' ? home : away;
            const t = match?.round?.tournament;

            let statusLabel = 'Pendiente';
            let statusColor = 'rgba(17,17,17,0.5)';
            let statusBg = 'rgba(17,17,17,0.05)';

            if (bet.resolved) {
              if (bet.won === true) {
                statusLabel = `Ganada · +${bet.payout}`;
                statusColor = '#16A34A';
                statusBg = 'rgba(34,197,94,0.12)';
              } else if (bet.won === false) {
                statusLabel = `Perdida · -${bet.amount}`;
                statusColor = '#DC2626';
                statusBg = 'rgba(220,38,38,0.1)';
              } else {
                statusLabel = `Devuelta · +${bet.payout}`;
                statusColor = '#64748B';
                statusBg = 'rgba(100,116,139,0.1)';
              }
            }

            return (
              <Box
                key={bet.id}
                sx={{
                  p: 2.5,
                  borderRadius: '18px',
                  bgcolor: 'white',
                  border: '1px solid rgba(17,17,17,0.06)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
                  <Typography sx={{ fontSize: 11.5, color: 'rgba(17,17,17,0.45)', fontWeight: 600 }}>
                    {t?.name || 'Torneo'}
                  </Typography>
                  <Chip
                    label={statusLabel}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: 10.5,
                      fontWeight: 800,
                      letterSpacing: 0.3,
                      bgcolor: statusBg,
                      color: statusColor,
                    }}
                  />
                </Box>

                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: BLACK,
                    mb: 1.5,
                    fontFamily: '"Instrument Sans", system-ui, sans-serif',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {home?.name} vs {away?.name}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {predictedTeam?.logo ? (
                      <Box
                        component="img"
                        src={predictedTeam.logo}
                        sx={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 24, height: 24, borderRadius: '50%',
                          bgcolor: predictedTeam?.color || BLACK,
                          display: 'grid', placeItems: 'center',
                          color: 'white', fontSize: 10, fontWeight: 800,
                        }}
                      >
                        {predictedTeam?.name?.[0]?.toUpperCase()}
                      </Box>
                    )}
                    <Typography sx={{ fontSize: 12.5, color: 'rgba(17,17,17,0.6)', fontWeight: 600 }}>
                      Apostaste a {predictedTeam?.name}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 800, color: BLACK, fontFamily: '"Instrument Sans", system-ui, sans-serif', lineHeight: 1 }}>
                      {bet.amount} coins
                    </Typography>
                    {bet.resolved && match?.played && (
                      <Typography sx={{ fontSize: 11, color: 'rgba(17,17,17,0.5)', mt: 0.5 }}>
                        Resultado: {match.homeScore} - {match.awayScore}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}