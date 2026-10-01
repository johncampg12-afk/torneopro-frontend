import { useState } from 'react';
import { Dialog, Box, Typography, Button, InputBase, keyframes } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { SMOOTH, SPRING, BLACK } from '../theme';

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
`;

export const OrganizerAccessModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async () => {
    if (!user || !password) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/verify-organizer', { user, password });
      if (res.data?.ok && res.data.token && res.data.user) {
        login(res.data.token, res.data.user);
        onClose();
        navigate('/dashboard');
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    flex: 1,
    fontSize: 15,
    fontWeight: 500,
    color: BLACK,
    '& input::placeholder': { color: 'rgba(17,17,17,0.3)' },
  } as const;

  const boxSx = (hasError: boolean) => ({
    mt: 2,
    height: 52,
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1.5px solid',
    borderColor: hasError ? '#DC2626' : 'rgba(17,17,17,0.14)',
    transition: `border-color 0.25s ${SMOOTH}`,
    '&:focus-within': { borderColor: BLACK },
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            animation: `${scaleIn} 0.5s ${SPRING} both`,
            boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
          },
        },
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.4,
          textTransform: 'uppercase',
          color: 'rgba(17,17,17,0.4)',
          mb: 1.5,
        }}
      >
        Acceso restringido
      </Typography>
      <Typography
        sx={{
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: -0.8,
          lineHeight: 1.1,
          color: BLACK,
          fontFamily: '"Instrument Sans", system-ui, sans-serif',
        }}
      >
        Acceso organizadores
      </Typography>
      <Typography
        sx={{
          mt: 2,
          fontSize: 14,
          color: 'rgba(17,17,17,0.6)',
          lineHeight: 1.55,
          fontWeight: 500,
        }}
      >
        Introduce tus credenciales de organización para entrar directamente.
      </Typography>

      {/* Usuario */}
      <Box sx={{ mt: 3 }}>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: 'rgba(17,17,17,0.45)',
            mb: 1,
          }}
        >
          Usuario
        </Typography>
        <Box sx={boxSx(false)}>
          <InputBase
            value={user}
            onChange={(e) => setUser(e.target.value.toLowerCase().replace(/\s/g, ''))}
            placeholder="usuario"
            autoFocus
            sx={inputSx}
          />
        </Box>
      </Box>

      {/* Contraseña */}
      <Box>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: 'rgba(17,17,17,0.45)',
            mt: 2.5,
            mb: 1,
          }}
        >
          Contraseña
        </Typography>
        <Box sx={boxSx(!!error)}>
          <InputBase
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="••••••••••••"
            type="password"
            sx={inputSx}
          />
        </Box>
      </Box>

      {error && (
        <Typography sx={{ mt: 1.5, fontSize: 13, color: '#DC2626', fontWeight: 500 }}>
          {error}
        </Typography>
      )}

      <Button
        fullWidth
        disabled={!user || !password || loading}
        onClick={handleSubmit}
        sx={{
          mt: 4,
          height: 56,
          borderRadius: '16px',
          fontWeight: 700,
          fontSize: 15.5,
          bgcolor: BLACK,
          color: 'white',
          '&:disabled': { bgcolor: 'rgba(17,17,17,0.06)', color: 'rgba(17,17,17,0.3)' },
          '&:hover': { bgcolor: '#1a1a1a' },
          '&:active': { transform: 'scale(0.985)' },
        }}
      >
        {loading ? 'Comprobando…' : 'Entrar'}
      </Button>

      <Box
        onClick={onClose}
        sx={{ mt: 2, textAlign: 'center', cursor: 'pointer', '&:hover': { opacity: 0.7 } }}
      >
        <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: 'rgba(17,17,17,0.5)' }}>
          Cancelar
        </Typography>
      </Box>
    </Dialog>
  );
};