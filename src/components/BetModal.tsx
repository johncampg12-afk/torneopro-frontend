import { useEffect, useState } from 'react';
import {
  Dialog, Box, Typography, Button, TextField, IconButton, keyframes, Stack, Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { SMOOTH, SPRING, BLACK } from '../theme';

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
`;

const MIN_BET = 10;
const MAX_BET = 300;

interface BetModalProps {
  open: boolean;
  onClose: () => void;
  match: any;
  getTeam: (id: string) => any;
  onPlaced: () => void;
}

export const BetModal = ({ open, onClose, match, getTeam, onPlaced }: BetModalProps) => {
  const { user, updateCoins } = useAuth();
  const [prediction, setPrediction] = useState<'home' | 'away' | null>(null);
  const [amount, setAmount] = useState(50);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingBet, setExistingBet] = useState<any>(null);

  const home = match ? getTeam(match.homeTeamId) : null;
  const away = match ? getTeam(match.awayTeamId) : null;
  const coins = user?.coins ?? 0;

  useEffect(() => {
    if (open && match) {
      setPrediction(null);
      setAmount(50);
      setError('');
      // ¿Ya tenía una apuesta en este partido?
      api.get(`/bets/match/${match.id}/mine`)
        .then(res => setExistingBet(res.data || null))
        .catch(() => setExistingBet(null));
    }
  }, [open, match]);

  const handlePlace = async () => {
    if (!prediction) return setError('Selecciona un equipo');
    if (amount < MIN_BET) return setError(`Mínimo ${MIN_BET} coins`);
    if (amount > MAX_BET) return setError(`Máximo ${MAX_BET} coins`);
    if (amount > coins) return setError('No tienes suficientes coins');

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/bets', { matchId: match.id, prediction, amount });
      updateCoins(res.data.coins);
      onPlaced();
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al realizar la apuesta');
    } finally {
      setLoading(false);
    }
  };

  if (!match || !home || !away) return null;

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
            p: 3,
            backgroundImage: 'none',
            animation: `${scaleIn} 0.4s ${SPRING} both`,
            boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
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
          Apostar
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(17,17,17,0.5)' }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* Saldo */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography sx={{ fontSize: 13, color: 'rgba(17,17,17,0.6)', fontWeight: 500 }}>
          Saldo actual
        </Typography>
        <Chip
          label={`🪙 ${coins.toLocaleString('es-ES')}`}
          size="small"
          sx={{
            height: 26,
            fontSize: 12.5,
            fontWeight: 800,
            bgcolor: 'rgba(17,17,17,0.05)',
            color: BLACK,
          }}
        />
      </Box>

      {/* Ya apostó */}
      {existingBet && !existingBet.resolved && (
        <Box
          sx={{
            p: 2,
            borderRadius: '14px',
            bgcolor: 'rgba(251,191,36,0.08)',
            border: '1px solid rgba(251,191,36,0.25)',
            mb: 2.5,
          }}
        >
          <Typography sx={{ fontSize: 12, color: '#92400E', fontWeight: 600 }}>
            Ya tienes una apuesta activa: <strong>{existingBet.amount} coins a {existingBet.prediction === 'home' ? home.name : away.name}</strong>
          </Typography>
        </Box>
      )}

      {/* Selección */}
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: 'rgba(17,17,17,0.45)',
          mb: 1.25,
        }}
      >
        ¿Quién gana?
      </Typography>

      <Stack spacing={1.5} sx={{ mb: 3 }}>
        {[
          { key: 'home' as const, team: home },
          { key: 'away' as const, team: away },
        ].map(opt => (
          <Box
            key={opt.key}
            onClick={() => setPrediction(opt.key)}
            sx={{
              p: 2,
              borderRadius: '14px',
              bgcolor: prediction === opt.key ? BLACK : 'white',
              border: '1.5px solid',
              borderColor: prediction === opt.key ? BLACK : 'rgba(17,17,17,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              transition: `all 0.2s ${SMOOTH}`,
              '&:hover': {
                borderColor: prediction === opt.key ? BLACK : 'rgba(17,17,17,0.25)',
              },
            }}
          >
            {opt.team.logo ? (
              <Box
                component="img"
                src={opt.team.logo}
                sx={{ width: 40, height: 40, borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <Box
                sx={{
                  width: 40, height: 40, borderRadius: '12px',
                  bgcolor: opt.team.color || BLACK,
                  display: 'grid', placeItems: 'center',
                  color: 'white', fontWeight: 800, fontSize: 16,
                  fontFamily: '"Instrument Sans", system-ui, sans-serif',
                  flexShrink: 0,
                }}
              >
                {opt.team.name?.[0]?.toUpperCase()}
              </Box>
            )}
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                color: prediction === opt.key ? 'white' : BLACK,
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {opt.team.name}
            </Typography>
          </Box>
        ))}
      </Stack>

      {/* Cantidad */}
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: 'rgba(17,17,17,0.45)',
          mb: 1.25,
        }}
      >
        Cantidad ({MIN_BET} - {MAX_BET})
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
        {[10, 50, 100, 200, 300].map(v => (
          <Button
            key={v}
            onClick={() => setAmount(v)}
            disabled={v > coins}
            sx={{
              height: 34,
              borderRadius: '999px',
              px: 2,
              minWidth: 0,
              fontWeight: 700,
              fontSize: 12.5,
              bgcolor: amount === v ? BLACK : 'white',
              color: amount === v ? 'white' : BLACK,
              border: '1px solid',
              borderColor: amount === v ? BLACK : 'rgba(17,17,17,0.08)',
              '&:hover': { bgcolor: amount === v ? BLACK : 'rgba(17,17,17,0.04)' },
              '&:disabled': { opacity: 0.3 },
            }}
          >
            {v}
          </Button>
        ))}
      </Box>

      <TextField
        type="number"
        value={amount}
        onChange={e => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
        inputProps={{ min: MIN_BET, max: MAX_BET }}
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '14px',
            bgcolor: 'white',
            '& fieldset': { borderColor: 'rgba(17,17,17,0.08)' },
            '&.Mui-focused fieldset': { borderColor: BLACK },
          },
          '& input': { fontSize: 18, fontWeight: 700, color: BLACK, textAlign: 'center' },
        }}
      />

      {error && (
        <Typography sx={{ mt: 1.5, fontSize: 13, color: '#DC2626', fontWeight: 500 }}>
          {error}
        </Typography>
      )}

      <Button
        fullWidth
        disabled={!prediction || loading || amount < MIN_BET || amount > MAX_BET || amount > coins}
        onClick={handlePlace}
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
        {loading ? 'Apostando…' : `Apostar ${amount} coins`}
      </Button>
    </Dialog>
  );
};