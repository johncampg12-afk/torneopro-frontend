import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, keyframes,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import GroupsIcon from '@mui/icons-material/Groups';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { SMOOTH, BLACK } from '../theme';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const MAX_WIDTH = 1280;

export default function Templates() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  useEffect(() => {
    if (!user) { navigate('/welcome'); return; }
    api.get('/team-templates')
      .then(res => setTemplates(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/team-templates/${deleteTarget.id}`);
      setTemplates(prev => prev.filter(t => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {}
  };

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
            Mis plantillas
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 14.5, color: 'rgba(17,17,17,0.55)', fontWeight: 500 }}>
            Reutiliza equipos con jugadores en cualquier torneo
          </Typography>
        </Box>

        <Button
          component={Link}
          to="/tournaments/create"
          startIcon={<AddIcon sx={{ fontSize: 20 }} />}
          sx={{
            height: 48,
            borderRadius: '999px',
            px: 3,
            fontWeight: 700,
            fontSize: 14.5,
            bgcolor: BLACK,
            color: 'white',
            boxShadow: '0 8px 24px rgba(17,17,17,0.15)',
            transition: `all 0.3s ${SMOOTH}`,
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

      {/* ── Lista ── */}
      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' }, gap: 3 }}>
          {[1, 2, 3].map(i => (
            <Box key={i} sx={{ height: 180, borderRadius: '24px', bgcolor: 'rgba(17,17,17,0.04)' }} />
          ))}
        </Box>
      ) : templates.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 8, md: 12 },
            borderRadius: '24px',
            bgcolor: 'white',
            border: '1px solid rgba(17,17,17,0.06)',
          }}
        >
          <Box
            sx={{
              width: 64, height: 64, borderRadius: '20px',
              bgcolor: 'rgba(17,17,17,0.04)',
              display: 'grid', placeItems: 'center',
              mx: 'auto', mb: 2.5,
            }}
          >
            <GroupsIcon sx={{ fontSize: 30, color: 'rgba(17,17,17,0.3)' }} />
          </Box>
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 700,
              color: 'rgba(17,17,17,0.6)',
              fontFamily: '"Instrument Sans", system-ui, sans-serif',
            }}
          >
            Aún no tienes plantillas
          </Typography>
          <Typography sx={{ mt: 1, fontSize: 14, color: 'rgba(17,17,17,0.5)', maxWidth: 380, mx: 'auto' }}>
            Guarda un equipo desde cualquier torneo y podrás reutilizarlo con sus jugadores en futuros torneos.
          </Typography>
          <Button
            component={Link}
            to="/dashboard"
            sx={{
              mt: 3,
              height: 46,
              borderRadius: '999px',
              px: 3,
              fontWeight: 700,
              fontSize: 14,
              color: BLACK,
              border: '1.5px solid rgba(17,17,17,0.1)',
              '&:hover': { borderColor: 'rgba(17,17,17,0.3)', bgcolor: 'transparent' },
            }}
          >
            Ir a mis torneos
          </Button>
        </Box>
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' },
          gap: 3,
          animation: `${fadeInUp} 0.6s ${SMOOTH} both 0.1s`,
        }}>
          {templates.map(t => (
            <Box
              key={t.id}
              sx={{
                position: 'relative',
                borderRadius: '24px',
                bgcolor: 'white',
                border: '1px solid rgba(17,17,17,0.06)',
                p: 3,
                transition: `all 0.3s ${SMOOTH}`,
                '&:hover': {
                  borderColor: 'rgba(17,17,17,0.15)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)',
                },
              }}
            >
              {/* Cabecera: logo + botón borrar */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                {t.logo ? (
                  <Box
                    component="img"
                    src={t.logo}
                    alt={t.name}
                    sx={{
                      width: 56, height: 56,
                      borderRadius: '16px',
                      objectFit: 'cover',
                      border: '1px solid rgba(17,17,17,0.06)',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 56, height: 56,
                      borderRadius: '16px',
                      bgcolor: t.color || BLACK,
                      display: 'grid', placeItems: 'center',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: 22,
                      fontFamily: '"Instrument Sans", system-ui, sans-serif',
                    }}
                  >
                    {t.name?.[0]?.toUpperCase() || '?'}
                  </Box>
                )}

                <IconButton
                  size="small"
                  onClick={() => setDeleteTarget(t)}
                  sx={{
                    color: 'rgba(17,17,17,0.35)',
                    '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' },
                  }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>

              {/* Nombre */}
              <Typography
                sx={{
                  fontSize: 19,
                  fontWeight: 800,
                  letterSpacing: -0.4,
                  lineHeight: 1.25,
                  color: BLACK,
                  fontFamily: '"Instrument Sans", system-ui, sans-serif',
                  mb: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {t.name}
              </Typography>

              {/* Contador de jugadores */}
              <Typography sx={{ fontSize: 13, color: 'rgba(17,17,17,0.5)', fontWeight: 500 }}>
                {t.players?.length || 0} {t.players?.length === 1 ? 'jugador' : 'jugadores'}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* ── Confirmación de borrado ── */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          backdrop: { sx: { bgcolor: 'rgba(10,10,10,0.5)', backdropFilter: 'blur(6px)' } },
          paper: {
            sx: {
              borderRadius: '24px',
              bgcolor: '#FAFAF8',
              p: 1,
              backgroundImage: 'none',
              boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 22, letterSpacing: -0.5, fontFamily: '"Instrument Sans", system-ui, sans-serif', pt: 3 }}>
          ¿Eliminar plantilla?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: 14, color: 'rgba(17,17,17,0.6)' }}>
            Se eliminará <strong>{deleteTarget?.name}</strong> con sus {deleteTarget?.players?.length || 0} jugadores de tu biblioteca de plantillas.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            sx={{
              flex: 1,
              height: 46,
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: 14,
              color: 'rgba(17,17,17,0.7)',
              border: '1px solid rgba(17,17,17,0.1)',
              '&:hover': { borderColor: 'rgba(17,17,17,0.25)', bgcolor: 'transparent' },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            sx={{
              flex: 1,
              height: 46,
              borderRadius: '999px',
              fontWeight: 700,
              fontSize: 14,
              bgcolor: '#DC2626',
              color: 'white',
              '&:hover': { bgcolor: '#B91C1C' },
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}