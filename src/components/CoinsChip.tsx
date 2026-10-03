import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BLACK, SMOOTH } from '../theme';

export const CoinsChip = ({ compact = false }: { compact?: boolean }) => {
  const { user, unseenBetsCount } = useAuth();
  if (!user) return null;

  const coins = user.coins ?? 0;
  const low = coins < 100;
  const hasUnseen = unseenBetsCount > 0;

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
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

      {/* Badge rojo de apuestas resueltas no vistas */}
      {hasUnseen && (
        <Box
          sx={{
            position: 'absolute',
            top: -6,
            right: -6,
            minWidth: 18,
            height: 18,
            px: 0.5,
            borderRadius: '999px',
            bgcolor: '#DC2626',
            color: 'white',
            display: 'grid',
            placeItems: 'center',
            fontSize: 10,
            fontWeight: 800,
            fontFamily: '"Instrument Sans", system-ui, sans-serif',
            boxShadow: '0 0 0 2px #FAFAF8, 0 2px 6px rgba(220,38,38,0.4)',
            animation: 'pulse-badge 1.5s ease-in-out infinite',
            '@keyframes pulse-badge': {
              '0%, 100%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.15)' },
            },
          }}
        >
          {unseenBetsCount > 9 ? '9+' : unseenBetsCount}
        </Box>
      )}
    </Box>
  );
};