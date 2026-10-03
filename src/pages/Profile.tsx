import { useEffect, useRef, useState } from 'react';
import {
  Box, Typography, Button, Stack, Chip, IconButton, TextField,
  Dialog, keyframes, Skeleton,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import CloseIcon from '@mui/icons-material/Close';
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

const MAX_WIDTH = 640;

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const loadedRef = useRef(false);

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatar, setEditAvatar] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/welcome'); return; }
    if (user.role === 'organizer') { navigate('/'); return; }
    if (loadedRef.current) return;
    loadedRef.current = true;

    Promise.all([
      api.get('/users/me'),
      api.get('/users/me/stats'),
    ])
      .then(([meRes, statsRes]) => {
        setStats(statsRes.data);
        const fresh = meRes.data;
        setEditName(fresh.name || '');
        setEditAge(fresh.age ? String(fresh.age) : '');
        setEditPhone(fresh.phone || '');
        setEditAvatar(fresh.avatar || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 3_000_000) { alert('Máximo 3 MB'); return; }
    const r = new FileReader();
    r.onload = () => setEditAvatar(r.result as string);
    r.readAsDataURL(f);
  };

  const saveEdit = async () => {
    setSavingEdit(true);
    setError('');
    try {
      await api.patch('/users/me', {
        name: editName,
        age: editAge ? parseInt(editAge) : undefined,
        phone: editPhone || undefined,
        avatar: editAvatar,
      });
      await refreshUser();
      setEditOpen(false);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al guardar');
    } finally {
      setSavingEdit(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await api.post('/users/me/delete');
      logout();
      navigate('/welcome');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al eliminar la cuenta');
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/welcome');
  };

  if (loading || !user) {
    return (
      <Box sx={{ maxWidth: MAX_WIDTH, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: 5 }}>
        <Skeleton variant="rounded" height={180} sx={{ borderRadius: '24px', mb: 3 }} />
        <Skeleton variant="rounded" height={300} sx={{ borderRadius: '24px' }} />
      </Box>
    );
  }

  const initial = (user.name || '?').charAt(0).toUpperCase();

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '14px',
      bgcolor: 'white',
      minHeight: 50,
      '& fieldset': { borderColor: 'rgba(17,17,17,0.08)', borderWidth: '1.5px' },
      '&:hover fieldset': { borderColor: 'rgba(17,17,17,0.2)' },
      '&.Mui-focused fieldset': { borderColor: BLACK, borderWidth: '1.5px' },
    },
    '& input': { fontSize: 15, fontWeight: 500, color: BLACK },
    '& input::placeholder': { color: 'rgba(17,17,17,0.3)', opacity: 1 },
  } as const;

  const labelSx = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
    color: 'rgba(17,17,17,0.45)',
    mb: 1,
    ml: 0.5,
  };

  const RowItem = ({
    icon, title, subtitle, onClick, danger = false, asLink = false, to = '#',
  }: any) => {
    const inner = (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          cursor: 'pointer',
          transition: `background-color 0.2s ${SMOOTH}`,
          '&:hover': { bgcolor: 'rgba(17,17,17,0.02)' },
        }}
      >
        <Box
          sx={{
            width: 40, height: 40,
            borderRadius: '12px',
            bgcolor: danger ? 'rgba(220,38,38,0.08)' : 'rgba(17,17,17,0.04)',
            display: 'grid', placeItems: 'center',
            color: danger ? '#DC2626' : 'rgba(17,17,17,0.7)',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 14.5,
              fontWeight: 700,
              color: danger ? '#DC2626' : BLACK,
              fontFamily: '"Instrument Sans", system-ui, sans-serif',
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ fontSize: 12, color: 'rgba(17,17,17,0.5)', mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <ChevronRightIcon sx={{ fontSize: 20, color: 'rgba(17,17,17,0.25)' }} />
      </Box>
    );

    return asLink ? (
      <Box component={Link} to={to} sx={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        {inner}
      </Box>
    ) : (
      <Box onClick={onClick}>{inner}</Box>
    );
  };

  return (
    <Box sx={{ maxWidth: MAX_WIDTH, mx: 'auto', width: '100%', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 5 } }}>

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
            Mi perfil
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13.5, color: 'rgba(17,17,17,0.5)', fontWeight: 500 }}>
            Gestiona tu cuenta y preferencias
          </Typography>
        </Box>
      </Box>

      {/* Card principal */}
      <Box
        sx={{
          p: 3,
          borderRadius: '24px',
          bgcolor: 'white',
          border: '1px solid rgba(17,17,17,0.06)',
          mb: 3,
          animation: `${fadeInUp} 0.5s ${SMOOTH} both`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          {user.avatar ? (
            <Box
              component="img"
              src={user.avatar}
              alt={user.name}
              sx={{ width: 72, height: 72, borderRadius: '20px', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <Box
              sx={{
                width: 72, height: 72,
                borderRadius: '20px',
                bgcolor: BLACK,
                display: 'grid', placeItems: 'center',
                color: 'white',
                fontSize: 28,
                fontWeight: 800,
                fontFamily: '"Instrument Sans", system-ui, sans-serif',
                flexShrink: 0,
              }}
            >
              {initial}
            </Box>
          )}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: -0.4,
                color: BLACK,
                fontFamily: '"Instrument Sans", system-ui, sans-serif',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.name}
            </Typography>
            {user.username && (
              <Typography
                sx={{
                  fontSize: 13.5,
                  color: 'rgba(17,17,17,0.5)',
                  mt: 0.25,
                  fontFamily: '"Fragment Mono", monospace',
                }}
              >
                @{user.username}
              </Typography>
            )}
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
              <Chip
                label="Usuario"
                size="small"
                sx={{
                  height: 22,
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  bgcolor: 'rgba(17,17,17,0.05)',
                  color: 'rgba(17,17,17,0.6)',
                }}
              />
              {stats && (
                <Chip
                  label={`🪙 ${stats.coins.toLocaleString('es-ES')} coins`}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: 0.3,
                    bgcolor: 'rgba(34,197,94,0.12)',
                    color: '#16A34A',
                  }}
                />
              )}
            </Stack>
          </Box>
        </Box>

        {stats && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mt: 3 }}>
            {[
              { label: 'Ganadas', value: stats.bets.won, color: '#16A34A' },
              { label: 'Perdidas', value: stats.bets.lost, color: '#DC2626' },
              { label: 'Acierto', value: `${stats.bets.winRate}%`, color: BLACK },
            ].map(s => (
              <Box
                key={s.label}
                sx={{
                  py: 1.5,
                  borderRadius: '14px',
                  bgcolor: 'rgba(17,17,17,0.03)',
                  textAlign: 'center',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: s.color,
                    fontFamily: '"Instrument Sans", system-ui, sans-serif',
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                    color: 'rgba(17,17,17,0.4)',
                    mt: 0.5,
                  }}
                >
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Botón ver premios */}
      <Button
        component={Link}
        to="/rewards"
        fullWidth
        sx={{
          height: 52,
          borderRadius: '16px',
          mb: 3,
          fontWeight: 700,
          fontSize: 14.5,
          bgcolor: BLACK,
          color: 'white',
          boxShadow: '0 8px 24px rgba(17,17,17,0.15)',
          '&:hover': { bgcolor: '#1a1a1a', transform: 'translateY(-1px)' },
          '&:active': { transform: 'scale(0.985)' },
        }}
      >
        🎁 Ver catálogo de premios
      </Button>

      {/* Cuenta */}
      <Typography sx={{ ...labelSx, ml: 0, mb: 1.5 }}>Cuenta</Typography>
      <Box
        sx={{
          borderRadius: '20px',
          bgcolor: 'white',
          border: '1px solid rgba(17,17,17,0.06)',
          overflow: 'hidden',
          mb: 3,
        }}
      >
        <RowItem
          icon={<EditOutlinedIcon sx={{ fontSize: 20 }} />}
          title="Editar perfil"
          subtitle="Nombre, edad, teléfono y foto"
          onClick={() => { setError(''); setEditOpen(true); }}
        />
        <Box sx={{ height: 1, bgcolor: 'rgba(17,17,17,0.06)' }} />
        <RowItem
          icon={<LogoutIcon sx={{ fontSize: 20 }} />}
          title="Cerrar sesión"
          subtitle="Salir de tu cuenta en este dispositivo"
          onClick={handleLogout}
        />
      </Box>

      {/* Legal */}
      <Typography sx={{ ...labelSx, ml: 0, mb: 1.5 }}>Legal</Typography>
      <Box
        sx={{
          borderRadius: '20px',
          bgcolor: 'white',
          border: '1px solid rgba(17,17,17,0.06)',
          overflow: 'hidden',
          mb: 3,
        }}
      >
        <RowItem
          icon={<DescriptionOutlinedIcon sx={{ fontSize: 20 }} />}
          title="Términos y condiciones"
          asLink
          to="/terminos-condiciones"
        />
        <Box sx={{ height: 1, bgcolor: 'rgba(17,17,17,0.06)' }} />
        <RowItem
          icon={<ShieldOutlinedIcon sx={{ fontSize: 20 }} />}
          title="Política de privacidad"
          asLink
          to="/politica-privacidad"
        />
        <Box sx={{ height: 1, bgcolor: 'rgba(17,17,17,0.06)' }} />
        <RowItem
          icon={<GavelOutlinedIcon sx={{ fontSize: 20 }} />}
          title="Aviso legal"
          asLink
          to="/aviso-legal"
        />
      </Box>

      {/* Zona peligrosa */}
      <Typography sx={{ ...labelSx, ml: 0, mb: 1.5, color: 'rgba(220,38,38,0.7)' }}>
        Zona peligrosa
      </Typography>
      <Box
        sx={{
          borderRadius: '20px',
          bgcolor: 'white',
          border: '1px solid rgba(220,38,38,0.15)',
          overflow: 'hidden',
          mb: 5,
        }}
      >
        <RowItem
          icon={<DeleteOutlinedIcon sx={{ fontSize: 20 }} />}
          title="Eliminar mi cuenta"
          subtitle="Borra permanentemente tu cuenta y todos tus datos"
          onClick={() => { setError(''); setDeleteOpen(true); }}
          danger
        />
      </Box>

      {/* Modal editar */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography sx={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, color: BLACK, fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
            Editar perfil
          </Typography>
          <IconButton onClick={() => setEditOpen(false)} size="small" sx={{ color: 'rgba(17,17,17,0.5)' }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box
            onClick={() => fileRef.current?.click()}
            sx={{ position: 'relative', cursor: 'pointer' }}
          >
            {editAvatar ? (
              <Box
                component="img"
                src={editAvatar}
                sx={{ width: 88, height: 88, borderRadius: '24px', objectFit: 'cover' }}
              />
            ) : (
              <Box
                sx={{
                  width: 88, height: 88,
                  borderRadius: '24px',
                  bgcolor: BLACK,
                  display: 'grid', placeItems: 'center',
                  color: 'white', fontSize: 32, fontWeight: 800,
                  fontFamily: '"Instrument Sans", system-ui, sans-serif',
                }}
              >
                {initial}
              </Box>
            )}
            <Box
              sx={{
                position: 'absolute', bottom: -4, right: -4,
                width: 30, height: 30, borderRadius: '50%',
                bgcolor: BLACK, color: 'white',
                display: 'grid', placeItems: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              <CameraAltIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
          <Typography
            onClick={() => fileRef.current?.click()}
            sx={{ mt: 1.5, fontSize: 12.5, fontWeight: 600, color: 'rgba(17,17,17,0.6)', cursor: 'pointer' }}
          >
            Cambiar foto
          </Typography>
        </Box>

        <Stack spacing={2}>
          <Box>
            <Typography sx={labelSx}>Nombre</Typography>
            <TextField
              fullWidth
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="Tu nombre"
              sx={inputSx}
            />
          </Box>
          <Box>
            <Typography sx={labelSx}>Edad</Typography>
            <TextField
              fullWidth
              type="number"
              value={editAge}
              onChange={e => setEditAge(e.target.value.replace(/\D/g, '').slice(0, 2))}
              placeholder="24"
              sx={inputSx}
            />
          </Box>
          <Box>
            <Typography sx={labelSx}>Teléfono (para canjear premios)</Typography>
            <TextField
              fullWidth
              value={editPhone}
              onChange={e => setEditPhone(e.target.value)}
              placeholder="+593 99 123 4567"
              sx={inputSx}
            />
          </Box>
        </Stack>

        {error && (
          <Typography sx={{ mt: 2, fontSize: 13, color: '#DC2626', fontWeight: 500 }}>
            {error}
          </Typography>
        )}

        <Button
          fullWidth
          disabled={savingEdit}
          onClick={saveEdit}
          sx={{
            mt: 3, height: 52, borderRadius: '999px',
            fontWeight: 700, fontSize: 15,
            bgcolor: BLACK, color: 'white',
            '&:hover': { bgcolor: '#1a1a1a' },
          }}
        >
          {savingEdit ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </Dialog>

      {/* Modal eliminar */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          backdrop: { sx: { bgcolor: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(8px)' } },
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
            fontSize: 20, fontWeight: 800, letterSpacing: -0.5,
            color: BLACK, fontFamily: '"Instrument Sans", system-ui, sans-serif',
            textAlign: 'center', mb: 1.5,
          }}
        >
          ¿Eliminar tu cuenta?
        </Typography>
        <Typography sx={{ fontSize: 13.5, color: 'rgba(17,17,17,0.6)', textAlign: 'center', lineHeight: 1.55, mb: 3 }}>
          Esta acción es <strong>permanente e irreversible</strong>. Se borrarán tu perfil, tus apuestas, tus coins y todos tus datos asociados.
        </Typography>

        {error && (
          <Typography sx={{ mt: 2, fontSize: 13, color: '#DC2626', fontWeight: 500, textAlign: 'center' }}>
            {error}
          </Typography>
        )}

        <Button
          fullWidth
          disabled={deleting}
          onClick={confirmDelete}
          sx={{
            mt: 2, height: 52, borderRadius: '999px',
            fontWeight: 700, fontSize: 15,
            bgcolor: '#DC2626', color: 'white',
            '&:disabled': { bgcolor: 'rgba(220,38,38,0.3)', color: 'white' },
            '&:hover': { bgcolor: '#B91C1C' },
          }}
        >
          {deleting ? 'Eliminando…' : 'Sí, eliminar mi cuenta'}
        </Button>
        <Button
          fullWidth
          onClick={() => setDeleteOpen(false)}
          sx={{
            mt: 1.5, height: 48, borderRadius: '999px',
            fontWeight: 600, fontSize: 14,
            color: 'rgba(17,17,17,0.6)',
            '&:hover': { bgcolor: 'transparent', color: BLACK },
          }}
        >
          Cancelar
        </Button>
      </Dialog>
    </Box>
  );
}