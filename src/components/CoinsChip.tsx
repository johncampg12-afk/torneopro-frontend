import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BLACK, SMOOTH } from '../theme';

export const CoinsChip = ({ compact = false }: { compact?: boolean }) => {
  const { user } = useAuth();
  if (!user) return null;

  const coins = user.coins ?? 0;
  const low = coins < 100;

  return (
    <Box
      component={Link}
      to="/my-bets"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: compact ? 1.25 : 1.75,
        py: compact ? 0.5 : 0.75,
        borderRadius: '999px',
        bgcolor: low ? 'rgba(251,146,60,0.12)' : 'rgba(17,17,17,0.04)',
        border: '1px solid',
        borderColor: low ? 'rgba(251,146,60,0.25)' : 'rgba(17,17,17,0.06)',
        textDecoration: 'none',
        transition: `all 0.2s ${SMOOTH}`,
        '&:hover': {
          bgcolor: low ? 'rgba(251,146,60,0.18)' : 'rgba(17,17,17,0.08)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Typography
        component="span"
        sx={{
          fontSize: compact ? 13 : 14,
          lineHeight: 1,
        }}
      >
        🪙
      </Typography>
      <Typography
        sx={{
          fontSize: compact ? 12.5 : 13.5,
          fontWeight: 800,
          color: low ? '#C2410C' : BLACK,
          fontFamily: '"Instrument Sans", system-ui, sans-serif',
          lineHeight: 1,
          letterSpacing: -0.3,
        }}
      >
        {coins.toLocaleString('es-ES')}
      </Typography>
    </Box>
  );
};