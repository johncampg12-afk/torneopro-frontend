import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, TextField, InputAdornment, Chip,
  IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, keyframes, ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { SMOOTH, BLACK } from '../theme';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const MAX_WIDTH = 1280;

const formatName = (f: string) =>
  ({ liga: 'Liga', eliminatoria: 'Eliminación Directa', grupos: 'Grupos + Eliminatoria' }[f] || f);

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuTournament, setMenuTournament] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [pendingRedemptions, setPendingRedemptions] = useState(0);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/welcome');
      return;
    }
    if (user) {
      api.get('/tournaments')
        .then(res => setTournaments(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user?.role !== 'organizer') return;
    api.get('/redemptions/stats')
      .then(res => setPendingRedemptions(res.data.pending))
      .catch(() => {});
  }, [user]);

  const filtered = tournaments.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: tournaments.length,
    active: tournaments.filter(t => t.status === 'active').length,
    finished: tournaments.filter(t => t.status === 'finished').length,
    teams: tournaments.reduce((a, t) => a + (t._count?.teams || 0), 0),
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/tournaments/${deleteTarget.id}`);
      setTournaments(tournaments.filter(t => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {}
  };

  const handleCopyLink = (code: string) => {
    const url = `${window.location.origin}/t/${code}`;
    navigator.clipboard.writeText(url);
    setMenuAnchor(null);
    const el = document.createElement('div');
    el.textContent = 'Enlace copiado';
    el.style.cssText = `
      position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
      background:#0A0A0A;color:white;padding:10px 20px;border-radius:999px;
      font-size:13px;font-weight:600;z-index:9999;font-family:inherit;
      box-shadow:0 8px 24px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  };

  if (isLoading) return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60dvh' }}>
      <Box sx={{
        width: 32, height: 32,
        border: '3px solid rgba(17,17,17,0.1)',
        borderTopColor: BLACK, borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
      }} />
    </Box>
  );

  return (
    <Box sx={{ maxWidth: MAX_WIDTH, mx: 'auto', width: '100%', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 4, md: 6 } }}>

      {/* ── Header ── */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: { xs: 4, md: 5 },
          animation: `${fadeInUp} 0.6s ${SMOOTH} both`,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 28, sm: 34, md: 42 },
              fontWeight: 800,
              letterSpacing: -1.2,
              lineHeight: 1.05,
              color: BLACK,
              fontFamily: '"Instrument Sans", system-ui, sans-serif',
            }}
          >
            Mis torneos
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 14.5, color: 'rgba(17,17,17,0.55)', fontWeight: 500 }}>
            Gestiona y comparte tus campeonatos
          </Typography>
        </Box>

        <Button
          component={Link}
          to="/tournaments/create"
          startIcon={<AddIcon sx={{ fontSize: 18 }} />}
          sx={{
            height: 44,
            borderRadius: '999px',
            px: 2.75,
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: -0.01,
            bgcolor: BLACK,
            color: 'white',
            boxShadow: '0 8px 24px rgba(17,17,17,0.15)',
            transition: `all 0.3s ${SMOOTH}`,
            '& .MuiButton-startIcon': { mr: 0.75 },
            '&:hover': {
              bgcolor: '#1a1a1a',
              transform: 'translateY(-1px)',
              boxShadow: '0 12px 32px rgba(17,17,17,0.25)',
            },
            '&:active': { transform: 'scale(0.98)' },
          }}
        >
          Nuevo torneo
        </Button>
      </Box>

      {/* ── Banner canjes pendientes ── */}
      {pendingRedemptions > 0 && (
        <Box
          component={Link}
          to="/organizer/redemptions"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2.5,
            borderRadius: '20px',
            bgcolor: 'rgba(251,191,36,0.08)',
            border: '1.5px solid rgba(251,191,36,0.3)',
            mb: 3,
            textDecoration: 'none',
            color: 'inherit',
            transition: `all 0.3s ${SMOOTH}`,
            animation: `${fadeInUp} 0.6s ${SMOOTH} both 0.02s`,
            '&:hover': {
              bgcolor: 'rgba(251,191,36,0.12)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          <Box
            sx={{
              width: 44, height: 44,
              borderRadius: '14px',
              bgcolor: 'rgba(217,119,6,0.15)',
              display: 'grid', placeItems: 'center',
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            🔔
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 14.5,
                fontWeight: 800,
                color: '#92400E',
                fontFamily: '"Instrument Sans", system-ui, sans-serif',
              }}
            >
              {pendingRedemptions} canje{pendingRedemptions === 1 ? '' : 's'} pendiente{pendingRedemptions === 1 ? '' : 's'}
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: 'rgba(146,64,14,0.75)', mt: 0.25 }}>
              Pulsa aquí para gestionarlos
            </Typography>
          </Box>
          <ChevronRightIcon sx={{ fontSize: 20, color: 'rgba(146,64,14,0.5)' }} />
        </Box>
      )}

      {/* ── Stats ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: { xs: 4, md: 5 },
          animation: `${fadeInUp} 0.6s ${SMOOTH} both 0.05s`,
        }}
      >
        {[
          { label: 'Total', value: stats.total },
          { label: 'En curso', value: stats.active },
          { label: 'Finalizados', value: stats.finished },
          { label: 'Equipos', value: stats.teams },
        ].map(s => (
          <Box
            key={s.label}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: '20px',
              bgcolor: 'white',
              border: '1px solid rgba(17,17,17,0.06)',
              transition: `all 0.3s ${SMOOTH}`,
              '&:hover': { borderColor: 'rgba(17,17,17,0.15)' },
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: 26, md: 32 },
                fontWeight: 800,
                letterSpacing: -1,
                color: BLACK,
                fontFamily: '"Instrument Sans", system-ui, sans-serif',
                lineHeight: 1,
              }}
            >
              {s.value}
            </Typography>
            <Typography sx={{ mt: 0.75, fontSize: 12, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(17,17,17,0.4)' }}>
              {s.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ── Filtros + búsqueda ── */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          mb: 4,
          alignItems: { md: 'center' },
          animation: `${fadeInUp} 0.6s ${SMOOTH} both 0.1s`,
        }}
      >
        {/* Toggle pill container */}
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
            <ToggleButton value="all">Todos</ToggleButton>
            <ToggleButton value="active">En curso</ToggleButton>
            <ToggleButton value="finished">Finalizados</ToggleButton>
            <ToggleButton value="draft">Borradores</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ flex: 1 }} />

        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar torneo…"
          size="small"
          sx={{
            width: { xs: '100%', md: 260 },
            '& .MuiOutlinedInput-root': {
              height: 40,
              borderRadius: '999px',
              bgcolor: 'white',
              '& fieldset': { borderColor: 'rgba(17,17,17,0.08)' },
              '&:hover fieldset': { borderColor: 'rgba(17,17,17,0.2)' },
              '&.Mui-focused fieldset': { borderColor: BLACK, borderWidth: '1.5px' },
            },
            '& input': { fontSize: 13.5, fontWeight: 500, color: BLACK },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 17, color: 'rgba(17,17,17,0.35)' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* ── Lista de torneos ── */}
      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' }, gap: 3 }}>
          {[1, 2, 3].map(i => (
            <Box key={i} sx={{ height: 220, borderRadius: '24px', bgcolor: 'rgba(17,17,17,0.04)' }} />
          ))}
        </Box>
      ) : filtered.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 8, md: 12 },
            borderRadius: '24px',
            bgcolor: 'white',
            border: '1px solid rgba(17,17,17,0.06)',
          }}
        >
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 700,
              color: 'rgba(17,17,17,0.6)',
              fontFamily: '"Instrument Sans", system-ui, sans-serif',
            }}
          >
            {search || filter !== 'all' ? 'Sin resultados' : 'Aún no tienes torneos'}
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 14, color: 'rgba(17,17,17,0.5)' }}>
            {search || filter !== 'all'
              ? 'Prueba con otros filtros o cambia la búsqueda.'
              : 'Crea tu primer torneo para empezar.'}
          </Typography>
          {!search && filter === 'all' && (
            <Button
              component={Link}
              to="/tournaments/create"
              startIcon={<AddIcon sx={{ fontSize: 18 }} />}
              sx={{
                mt: 3,
                height: 44,
                borderRadius: '999px',
                px: 2.75,
                fontWeight: 700,
                fontSize: 14,
                bgcolor: BLACK,
                color: 'white',
                boxShadow: '0 8px 24px rgba(17,17,17,0.15)',
                '& .MuiButton-startIcon': { mr: 0.75 },
                '&:hover': { bgcolor: '#1a1a1a', transform: 'translateY(-1px)' },
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              Crear torneo
            </Button>
          )}
        </Box>
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' },
          gap: 3,
          animation: `${fadeInUp} 0.6s ${SMOOTH} both 0.15s`,
        }}>
          {filtered.map(t => {
            const totalMatches = t.rounds?.reduce((a: number, r: any) => a + r.matches.length, 0) || 0;
            const playedMatches = t.rounds?.reduce((a: number, r: any) =>
              a + r.matches.filter((m: any) => m.played).length, 0) || 0;
            const progress = totalMatches > 0 ? Math.round((playedMatches / totalMatches) * 100) : 0;

            return (
              <Box
                key={t.id}
                sx={{
                  position: 'relative',
                  borderRadius: '24px',
                  bgcolor: 'white',
                  border: '1px solid rgba(17,17,17,0.06)',
                  p: 3,
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
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      width: 48, height: 48,
                      borderRadius: '14px',
                      bgcolor: BLACK,
                      display: 'grid', placeItems: 'center',
                    }}
                  >
                    <SportsSoccerIcon sx={{ fontSize: 24, color: 'white' }} />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Chip
                      label={t.status === 'active' ? 'En curso' : t.status === 'finished' ? 'Finalizado' : 'Borrador'}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 0.3,
                        bgcolor: t.status === 'active'
                          ? 'rgba(34,197,94,0.12)'
                          : 'rgba(17,17,17,0.06)',
                        color: t.status === 'active' ? '#16A34A' : 'rgba(17,17,17,0.6)',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => { setMenuAnchor(e.currentTarget); setMenuTournament(t); }}
                      sx={{ color: 'rgba(17,17,17,0.4)' }}
                    >
                      <MoreVertIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Box>
                </Box>

                <Box
                  component={Link}
                  to={`/tournaments/${t.id}`}
                  sx={{ textDecoration: 'none', color: 'inherit', flex: 1, display: 'block' }}
                >
                  <Typography
                    sx={{
                      fontSize: 19,
                      fontWeight: 800,
                      letterSpacing: -0.4,
                      lineHeight: 1.25,
                      color: BLACK,
                      fontFamily: '"Instrument Sans", system-ui, sans-serif',
                      mb: 0.75,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {t.name}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: 'rgba(17,17,17,0.5)', fontWeight: 500 }}>
                    {formatName(t.format)} · {t._count?.teams || 0} equipos
                  </Typography>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(17,17,17,0.4)' }}>
                      Progreso
                    </Typography>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: BLACK }}>
                      {playedMatches}/{totalMatches}
                    </Typography>
                  </Box>
                  <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(17,17,17,0.06)', overflow: 'hidden' }}>
                    <Box
                      sx={{
                        height: '100%',
                        width: `${progress}%`,
                        bgcolor: BLACK,
                        borderRadius: 3,
                        transition: `width 0.6s ${SMOOTH}`,
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* ── Menú contextual de la tarjeta ── */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => { setMenuAnchor(null); setMenuTournament(null); }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 220,
              borderRadius: '16px',
              border: '1px solid rgba(17,17,17,0.06)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
              bgcolor: '#FFFFFF',
              p: 0.5,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => menuTournament && handleCopyLink(menuTournament.shareCode)}
          sx={{
            borderRadius: '10px',
            fontSize: 14,
            fontWeight: 500,
            py: 1,
            gap: 1.5,
            transition: `all 0.2s ${SMOOTH}`,
            '&:hover': { bgcolor: 'rgba(17,17,17,0.04)' },
          }}
        >
          <Box
            sx={{
              width: 28, height: 28,
              borderRadius: '8px',
              bgcolor: 'rgba(17,17,17,0.05)',
              display: 'grid', placeItems: 'center',
              color: 'rgba(17,17,17,0.6)',
              flexShrink: 0,
            }}
          >
            <LinkIcon sx={{ fontSize: 15 }} />
          </Box>
          Copiar enlace público
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuTournament) navigate(`/tournaments/${menuTournament.id}`);
            setMenuAnchor(null);
          }}
          sx={{
            borderRadius: '10px',
            fontSize: 14,
            fontWeight: 500,
            py: 1,
            gap: 1.5,
            transition: `all 0.2s ${SMOOTH}`,
            '&:hover': { bgcolor: 'rgba(17,17,17,0.04)' },
          }}
        >
          <Box
            sx={{
              width: 28, height: 28,
              borderRadius: '8px',
              bgcolor: 'rgba(17,17,17,0.05)',
              display: 'grid', placeItems: 'center',
              color: 'rgba(17,17,17,0.6)',
              flexShrink: 0,
            }}
          >
            <OpenInNewIcon sx={{ fontSize: 15 }} />
          </Box>
          Ver torneo
        </MenuItem>
        <MenuItem
          onClick={() => { setDeleteTarget(menuTournament); setMenuAnchor(null); }}
          sx={{
            borderRadius: '10px',
            fontSize: 14,
            fontWeight: 500,
            py: 1,
            gap: 1.5,
            color: '#DC2626',
            transition: `all 0.2s ${SMOOTH}`,
            '&:hover': { bgcolor: '#FEF2F2' },
          }}
        >
          <Box
            sx={{
              width: 28, height: 28,
              borderRadius: '8px',
              bgcolor: 'rgba(220,38,38,0.08)',
              display: 'grid', placeItems: 'center',
              color: '#DC2626',
              flexShrink: 0,
            }}
          >
            <DeleteOutlinedIcon sx={{ fontSize: 15 }} />
          </Box>
          Eliminar torneo
        </MenuItem>
      </Menu>

      {/* ── Confirmación de borrado ── */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
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
              boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
            },
          },
        }}
      >
        <Box
          sx={{
            width: 56, height: 56,
            borderRadius: '18px',
            bgcolor: 'rgba(220,38,38,0.1)',
            display: 'grid', placeItems: 'center',
            mx: 'auto', mb: 2.5,
          }}
        >
          <DeleteOutlinedIcon sx={{ fontSize: 26, color: '#DC2626' }} />
        </Box>

        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: -0.5,
            color: BLACK,
            fontFamily: '"Instrument Sans", system-ui, sans-serif',
            textAlign: 'center',
            mb: 1.5,
          }}
        >
          ¿Eliminar torneo?
        </Typography>
        <Typography
          sx={{
            fontSize: 13.5,
            color: 'rgba(17,17,17,0.6)',
            textAlign: 'center',
            lineHeight: 1.55,
            mb: 3,
          }}
        >
          Se eliminará <strong>{deleteTarget?.name}</strong> y todos sus partidos, equipos y jugadores. Esta acción no se puede deshacer.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            fullWidth
            sx={{
              height: 52,
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: 14.5,
              color: 'rgba(17,17,17,0.7)',
              bgcolor: 'transparent',
              border: '1.5px solid rgba(17,17,17,0.12)',
              transition: `all 0.25s ${SMOOTH}`,
              '&:hover': {
                borderColor: 'rgba(17,17,17,0.3)',
                bgcolor: 'transparent',
                color: BLACK,
              },
              '&:active': { transform: 'scale(0.98)' },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            fullWidth
            sx={{
              height: 52,
              borderRadius: '999px',
              fontWeight: 700,
              fontSize: 14.5,
              bgcolor: '#DC2626',
              color: 'white',
              boxShadow: '0 8px 24px rgba(220,38,38,0.25)',
              transition: `all 0.25s ${SMOOTH}`,
              '&:hover': {
                bgcolor: '#B91C1C',
                transform: 'translateY(-1px)',
                boxShadow: '0 12px 32px rgba(220,38,38,0.35)',
              },
              '&:active': { transform: 'scale(0.98)' },
            }}
          >
            Eliminar
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}