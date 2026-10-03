import { useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Button, Stack, Chip, keyframes, Skeleton,
  ToggleButton, ToggleButtonGroup, IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { BLACK, SMOOTH } from '../theme';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const MAX_WIDTH = 1000;

export default function OrganizerRedemptions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<'pending' | 'completed' | 'cancelled' | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { navigate('/welcome'); return; }
    if (user.role !== 'organizer') { navigate('/'); return; }
    load();
  }, [user, navigate]);

  const load = async () => {
    try {
      const [redRes, statsRes] = await Promise.all([
        api.get('/redemptions/all'),
        api.get('/redemptions/stats'),
      ]);
      setRedemptions(redRes.data);
      setStats(statsRes.data);
    } catch {}
    finally { setLoading(false); }
  };

  const handleComplete = async (id: string) => {
    if (!confirm('¿Marcar este canje como ENTREGADO?')) return;
    setActioning(id);
    try {
      await api.patch(`/redemptions/${id}/complete`);
      await load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error');
    } finally {
      setActioning(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('¿Cancelar este canje? Las coins se devolverán al usuario.')) return;
    setActioning(id);
    try {
      await api.patch(`/redemptions/${id}/cancel`);
      await load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error');
    } finally {
      setActioning(null);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    const el = document.createElement('div');
    el.textContent = 'Copiado';
    el.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0A0A0A;color:white;padding:10px 20px;border-radius:999px;font-size:13px;font-weight:600;z-index:9999;font-family:inherit;box-shadow:0 8px 24px rgba(0,0,0,0.2);`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  };

  const filtered = useMemo(() => {
    if (filter === 'all') return redemptions;
    return redemptions.filter(r => r.status === filter);
  }, [redemptions, filter]);

  const pendingCount = redemptions.filter(r => r.status === 'pending').length;

  if (loading) return (
    <Box sx={{ maxWidth: MAX_WIDTH, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: 5 }}>
      <Skeleton variant="rounded" height={180} sx={{ borderRadius: '24px', mb: 3 }} />
      <Skeleton variant="rounded" height={400} sx={{ borderRadius: '24px' }} />
    </Box>
  );

  return (
    <Box sx={{ maxWidth: MAX_WIDTH, mx: 'auto', width: '100%', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 5 } }}>

      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          onClick={() => navigate('/dashboard')}
          sx={{
            minWidth: 40, width: 40, height: 40, borderRadius: '50%',
            bgcolor: 'white',
            border: '1px solid rgba(17,17,17,0.06)',
            color: 'rgba(17,17,17,0.7)',
            display: 'grid', placeItems: 'center', p: 0,
            transition: `all 0.2s ${SMOOTH}`,
            '&:hover': { bgcolor: 'white', borderColor: 'rgba(17,17,17,0.2)' },
            '&:active': { transform: 'scale(0.94)' },
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
            Canjes
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13.5, color: 'rgba(17,17,17,0.5)', fontWeight: 500 }}>
            Gestiona los premios canjeados por los usuarios
          </Typography>
        </Box>
      </Box>

      {/* ── Stats ── */}
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
            { label: 'Pendientes', value: stats.pending, color: '#D97706', accent: stats.pending > 0 },
            { label: 'Entregados', value: stats.completed, color: '#16A34A' },
            { label: 'Cancelados', value: stats.cancelled, color: '#DC2626' },
            { label: 'Coins gastadas', value: stats.totalCoinsSpent.toLocaleString('es-ES'), color: BLACK },
          ].map(s => (
            <Box
              key={s.label}
              sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: '18px',
                border: '1px solid',
                borderColor: s.accent ? 'rgba(251,191,36,0.4)' : 'rgba(17,17,17,0.06)',
                bgcolor: s.accent ? 'rgba(251,191,36,0.05)' : 'white',
                transition: `all 0.25s ${SMOOTH}`,
                '&:hover': {
                  borderColor: s.accent ? 'rgba(251,191,36,0.6)' : 'rgba(17,17,17,0.15)',
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: 22, md: 26 },
                  fontWeight: 900,
                  letterSpacing: -1,
                  color: s.color,
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
                  color: 'rgba(17,17,17,0.4)',
                }}
              >
                {s.label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* ── Filtros (segmented control) ── */}
      <Box
        sx={{
          mb: 3,
          animation: `${fadeInUp} 0.5s ${SMOOTH} both 0.05s`,
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            p: 0.5,
            borderRadius: '999px',
            bgcolor: 'white',
            border: '1px solid rgba(17,17,17,0.06)',
            overflowX: 'auto',
            maxWidth: '100%',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(_, v) => v && setFilter(v)}
            sx={{
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: '999px !important',
                px: { xs: 1.75, md: 2.25 },
                py: 0.75,
                mx: 0,
                minWidth: 'auto',
                fontSize: 13,
                fontWeight: 700,
                color: 'rgba(17,17,17,0.55)',
                textTransform: 'none',
                whiteSpace: 'nowrap',
                transition: `all 0.25s ${SMOOTH}`,
                '&:hover': {
                  bgcolor: 'rgba(17,17,17,0.04)',
                  color: BLACK,
                },
                '&.Mui-selected': {
                  bgcolor: BLACK,
                  color: 'white',
                  '&:hover': { bgcolor: '#1a1a1a' },
                },
              },
            }}
          >
            <ToggleButton value="pending">
              Pendientes{pendingCount > 0 ? ` (${pendingCount})` : ''}
            </ToggleButton>
            <ToggleButton value="completed">Entregados</ToggleButton>
            <ToggleButton value="cancelled">Cancelados</ToggleButton>
            <ToggleButton value="all">Todos</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* ── Lista ── */}
      {filtered.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 8, md: 10 },
            borderRadius: '24px',
            bgcolor: 'white',
            border: '1px solid rgba(17,17,17,0.06)',
          }}
        >
          <Typography sx={{ fontSize: 15, color: 'rgba(17,17,17,0.5)', fontWeight: 500 }}>
            No hay canjes en esta categoría.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2} sx={{ animation: `${fadeInUp} 0.5s ${SMOOTH} both 0.1s` }}>
          {filtered.map(r => {
            const isPending = r.status === 'pending';
            return (
              <Box
                key={r.id}
                sx={{
                  p: 2.5,
                  borderRadius: '18px',
                  bgcolor: 'white',
                  border: '1px solid rgba(17,17,17,0.06)',
                  transition: `all 0.25s ${SMOOTH}`,
                  '&:hover': { borderColor: 'rgba(17,17,17,0.12)' },
                }}
              >
                {/* Cabecera del canje */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: 0.5,
                          textTransform: 'uppercase',
                          color: 'rgba(17,17,17,0.45)',
                          fontFamily: '"Fragment Mono", monospace',
                        }}
                      >
                        #{r.id.slice(-6).toUpperCase()}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: 'rgba(17,17,17,0.3)' }}>·</Typography>
                      <Typography sx={{ fontSize: 11, color: 'rgba(17,17,17,0.45)' }}>
                        {new Date(r.createdAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Box>
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
                    <Typography sx={{ fontSize: 12.5, color: 'rgba(17,17,17,0.55)', mt: 0.25 }}>
                      {r.sponsorName} · {r.cost.toLocaleString('es-ES')} coins
                    </Typography>
                  </Box>

                  {isPending && (
                    <Stack direction="row" spacing={1}>
                      <Button
                        onClick={() => handleComplete(r.id)}
                        disabled={actioning === r.id}
                        startIcon={<CheckCircleOutlinedIcon sx={{ fontSize: 15 }} />}
                        sx={{
                          height: 34,
                          borderRadius: '999px',
                          px: 1.75,
                          fontWeight: 700,
                          fontSize: 12.5,
                          bgcolor: '#16A34A',
                          color: 'white',
                          boxShadow: '0 4px 12px rgba(22,163,74,0.2)',
                          transition: `all 0.25s ${SMOOTH}`,
                          '& .MuiButton-startIcon': { mr: 0.5 },
                          '&:hover': {
                            bgcolor: '#15803D',
                            boxShadow: '0 6px 16px rgba(22,163,74,0.3)',
                            transform: 'translateY(-1px)',
                          },
                          '&:active': { transform: 'scale(0.98)' },
                          '&:disabled': { opacity: 0.5 },
                        }}
                      >
                        Entregado
                      </Button>
                      <Button
                        onClick={() => handleCancel(r.id)}
                        disabled={actioning === r.id}
                        startIcon={<CancelOutlinedIcon sx={{ fontSize: 15 }} />}
                        sx={{
                          height: 34,
                          borderRadius: '999px',
                          px: 1.75,
                          fontWeight: 700,
                          fontSize: 12.5,
                          color: '#DC2626',
                          bgcolor: 'rgba(220,38,38,0.06)',
                          transition: `all 0.25s ${SMOOTH}`,
                          '& .MuiButton-startIcon': { mr: 0.5 },
                          '&:hover': {
                            bgcolor: 'rgba(220,38,38,0.12)',
                            transform: 'translateY(-1px)',
                          },
                          '&:active': { transform: 'scale(0.98)' },
                          '&:disabled': { opacity: 0.5 },
                        }}
                      >
                        Cancelar
                      </Button>
                    </Stack>
                  )}

                  {!isPending && (
                    <Chip
                      label={r.status === 'completed' ? 'Entregado' : 'Cancelado'}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: 10.5,
                        fontWeight: 800,
                        letterSpacing: 0.3,
                        bgcolor: r.status === 'completed' ? 'rgba(34,197,94,0.12)' : 'rgba(220,38,38,0.1)',
                        color: r.status === 'completed' ? '#16A34A' : '#DC2626',
                      }}
                    />
                  )}
                </Box>

                {/* Datos de contacto */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: 'rgba(17,17,17,0.02)',
                    border: '1px solid rgba(17,17,17,0.05)',
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                    gap: 2,
                  }}
                >
                  {/* Nombre */}
                  <Box>
                    <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(17,17,17,0.4)', mb: 0.5 }}>
                      Nombre
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: BLACK, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.contactName}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(r.contactName)}
                        sx={{
                          width: 26, height: 26,
                          color: 'rgba(17,17,17,0.35)',
                          '&:hover': { color: BLACK, bgcolor: 'rgba(17,17,17,0.04)' },
                        }}
                      >
                        <ContentCopyIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Email */}
                  <Box>
                    <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(17,17,17,0.4)', mb: 0.5 }}>
                      Email
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: BLACK, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.contactEmail}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(r.contactEmail)}
                        sx={{
                          width: 26, height: 26,
                          color: 'rgba(17,17,17,0.35)',
                          '&:hover': { color: BLACK, bgcolor: 'rgba(17,17,17,0.04)' },
                        }}
                      >
                        <ContentCopyIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Teléfono */}
                  <Box>
                    <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(17,17,17,0.4)', mb: 0.5 }}>
                      Teléfono
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: BLACK, flex: 1, minWidth: 0 }}>
                        {r.contactPhone}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(r.contactPhone)}
                        sx={{
                          width: 26, height: 26,
                          color: 'rgba(17,17,17,0.35)',
                          '&:hover': { color: BLACK, bgcolor: 'rgba(17,17,17,0.04)' },
                        }}
                      >
                        <ContentCopyIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        component="a"
                        href={`https://wa.me/${r.contactPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hola ${r.contactName}, te escribo de Torneos TrendSport sobre tu premio "${r.rewardTitle}" de ${r.sponsorName}. Tu código es #${r.id.slice(-6).toUpperCase()}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          width: 26, height: 26,
                          color: '#25D366',
                          transition: `all 0.2s ${SMOOTH}`,
                          '&:hover': {
                            bgcolor: 'rgba(37,211,102,0.1)',
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        <WhatsAppIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
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