import { useState } from 'react';
import { Dialog, Box, Typography, Button, Checkbox, keyframes } from '@mui/material';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { SMOOTH, SPRING, BLACK } from '../theme';

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
`;

export const AdultBanner = () => {
  const { user, refreshUser } = useAuth();
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOpen = Boolean(user) && user?.isAdultConfirmed === false;

  const handleAccept = async () => {
    if (!checked) return;
    setLoading(true);
    try {
      await api.post('/users/me/confirm-adult');
      await refreshUser();
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => {}}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: { sx: { bgcolor: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(8px)' } },
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
        Antes de continuar
      </Typography>

      <Typography
        sx={{
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: -0.8,
          lineHeight: 1.15,
          color: BLACK,
          fontFamily: '"Instrument Sans", system-ui, sans-serif',
        }}
      >
        Contenido para adultos
      </Typography>

      <Typography sx={{ mt: 2, fontSize: 14, color: 'rgba(17,17,17,0.6)', lineHeight: 1.55, fontWeight: 500 }}>
        TrendCoins son una moneda virtual sin valor real. Solo pueden usarse dentro de Torneos TrendSport para
        participar en el sistema de apuestas y canjear premios de patrocinadores.
      </Typography>

      <Typography sx={{ mt: 1.5, fontSize: 14, color: 'rgba(17,17,17,0.6)', lineHeight: 1.55, fontWeight: 500 }}>
        Debes ser mayor de 18 años para participar.
      </Typography>

      <Box
        onClick={() => setChecked(!checked)}
        sx={{
          mt: 3,
          px: 1.5,
          py: 1.25,
          borderRadius: '12px',
          border: '1.5px solid',
          borderColor: checked ? BLACK : 'rgba(17,17,17,0.12)',
          bgcolor: checked ? 'white' : 'rgba(255,255,255,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
          transition: `all 0.25s ${SMOOTH}`,
        }}
      >
        <Checkbox
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          sx={{
            p: 0,
            '& .MuiSvgIcon-root': { fontSize: 22, color: 'rgba(17,17,17,0.15)' },
            '&.Mui-checked .MuiSvgIcon-root': { color: BLACK },
          }}
        />
        <Typography sx={{ fontSize: 12, color: 'rgba(17,17,17,0.75)', lineHeight: 1.4, fontWeight: 600 }}>
          Confirmo que soy mayor de 18 años y acepto participar en el sistema de apuestas virtuales.
        </Typography>
      </Box>

      <Button
        fullWidth
        disabled={!checked || loading}
        onClick={handleAccept}
        sx={{
          mt: 3,
          height: 54,
          borderRadius: '16px',
          fontWeight: 700,
          fontSize: 15.5,
          bgcolor: BLACK,
          color: 'white',
          '&:disabled': { bgcolor: 'rgba(17,17,17,0.06)', color: 'rgba(17,17,17,0.3)' },
          '&:hover': { bgcolor: '#1a1a1a' },
        }}
      >
        {loading ? 'Confirmando…' : 'Confirmar y continuar'}
      </Button>
    </Dialog>
  );
};