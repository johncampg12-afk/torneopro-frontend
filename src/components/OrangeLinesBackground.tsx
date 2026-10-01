import { Box, keyframes } from '@mui/material';

// ═══════════════════════════════════════════════════════════════
// Animaciones de los blobs (lava lamp)
// Cada blob tiene su propio recorrido y ritmo para que no se sincronicen
// ═══════════════════════════════════════════════════════════════

const blob1 = keyframes`
  0%   { transform: translate(0, 0) scale(1); }
  25%  { transform: translate(18vw, -14vh) scale(1.12); }
  50%  { transform: translate(-10vw, 20vh) scale(0.92); }
  75%  { transform: translate(-22vw, -8vh) scale(1.06); }
  100% { transform: translate(0, 0) scale(1); }
`;

const blob2 = keyframes`
  0%   { transform: translate(0, 0) scale(1); }
  30%  { transform: translate(-16vw, 12vh) scale(1.08); }
  60%  { transform: translate(14vw, -20vh) scale(0.94); }
  100% { transform: translate(0, 0) scale(1); }
`;

const blob3 = keyframes`
  0%   { transform: translate(0, 0) scale(1); }
  20%  { transform: translate(10vw, 18vh) scale(1.1); }
  50%  { transform: translate(-24vw, 6vh) scale(0.96); }
  80%  { transform: translate(16vw, -10vh) scale(1.04); }
  100% { transform: translate(0, 0) scale(1); }
`;

const blob4 = keyframes`
  0%   { transform: translate(0, 0) scale(1); }
  40%  { transform: translate(-20vw, -12vh) scale(1.15); }
  70%  { transform: translate(12vw, 14vh) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
`;

const blob5 = keyframes`
  0%   { transform: translate(0, 0) scale(1); }
  35%  { transform: translate(22vw, 8vh) scale(1.05); }
  65%  { transform: translate(-8vw, -18vh) scale(1.1); }
  100% { transform: translate(0, 0) scale(1); }
`;

// ═══════════════════════════════════════════════════════════════
// Props (mantengo la interfaz anterior para no romper llamadas)
// - opacity: controla la intensidad global
// - duration: escala la velocidad de todos los blobs
// - color: color base (por defecto naranja); se generan variantes
// - angle y gap: aceptadas por compatibilidad, ya no se usan
// ═══════════════════════════════════════════════════════════════

interface Props {
  opacity?: number;
  color?: string;
  duration?: number;
  angle?: number;
  gap?: number;
}

export const OrangeLinesBackground = ({
  opacity = 0.5,
  color = '#f97316',
  duration = 40,
}: Props) => {
  // Escala: si duration=40 es la base, valores menores aceleran
  const speedFactor = duration / 40;

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        opacity,
      }}
    >
      {/* Blob 1 · naranja principal */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '15%',
          width: '55vw',
          height: '55vw',
          maxWidth: 720,
          maxHeight: 720,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color} 0%, ${color}00 70%)`,
          filter: 'blur(90px)',
          opacity: 0.55,
          mixBlendMode: 'multiply',
          animation: `${blob1} ${38 * speedFactor}s ease-in-out infinite`,
        }}
      />

      {/* Blob 2 · ámbar */}
      <Box
        sx={{
          position: 'absolute',
          top: '40%',
          right: '10%',
          width: '50vw',
          height: '50vw',
          maxWidth: 640,
          maxHeight: 640,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #f59e0b 0%, #f59e0b00 70%)',
          filter: 'blur(100px)',
          opacity: 0.5,
          mixBlendMode: 'multiply',
          animation: `${blob2} ${45 * speedFactor}s ease-in-out infinite`,
        }}
      />

      {/* Blob 3 · naranja profundo */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '5%',
          left: '30%',
          width: '60vw',
          height: '60vw',
          maxWidth: 780,
          maxHeight: 780,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #ea580c 0%, #ea580c00 70%)',
          filter: 'blur(110px)',
          opacity: 0.45,
          mixBlendMode: 'multiply',
          animation: `${blob3} ${52 * speedFactor}s ease-in-out infinite`,
        }}
      />

      {/* Blob 4 · coral cálido */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '35%',
          width: '40vw',
          height: '40vw',
          maxWidth: 520,
          maxHeight: 520,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #fb923c 0%, #fb923c00 70%)',
          filter: 'blur(80px)',
          opacity: 0.4,
          mixBlendMode: 'multiply',
          animation: `${blob4} ${40 * speedFactor}s ease-in-out infinite`,
        }}
      />

      {/* Blob 5 · rosado cálido */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '5%',
          width: '35vw',
          height: '35vw',
          maxWidth: 460,
          maxHeight: 460,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #fb7185 0%, #fb718500 70%)',
          filter: 'blur(120px)',
          opacity: 0.3,
          mixBlendMode: 'multiply',
          animation: `${blob5} ${48 * speedFactor}s ease-in-out infinite`,
        }}
      />

      {/* Capa de suavizado en los bordes */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(250,250,248,0.4) 90%)',
        }}
      />
    </Box>
  );
};