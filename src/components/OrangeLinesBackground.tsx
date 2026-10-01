import { Box, keyframes } from '@mui/material';

// ── Movimientos tipo lámpara de lava ──
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

// ── Movimientos de triángulos (flotación + rotación lenta) ──
const triFloatA = keyframes`
  0%   { transform: translate(0, 0) rotate(0deg); }
  25%  { transform: translate(6vw, -8vh) rotate(45deg); }
  50%  { transform: translate(-4vw, 10vh) rotate(120deg); }
  75%  { transform: translate(-8vw, -6vh) rotate(200deg); }
  100% { transform: translate(0, 0) rotate(360deg); }
`;
const triFloatB = keyframes`
  0%   { transform: translate(0, 0) rotate(0deg); }
  30%  { transform: translate(-10vw, 8vh) rotate(-60deg); }
  60%  { transform: translate(8vw, -12vh) rotate(-180deg); }
  100% { transform: translate(0, 0) rotate(-360deg); }
`;
const triFloatC = keyframes`
  0%   { transform: translate(0, 0) rotate(0deg); }
  40%  { transform: translate(12vw, 6vh) rotate(90deg); }
  70%  { transform: translate(-6vw, -10vh) rotate(220deg); }
  100% { transform: translate(0, 0) rotate(360deg); }
`;
const triFloatD = keyframes`
  0%   { transform: translate(0, 0) rotate(0deg); }
  20%  { transform: translate(-8vw, -12vh) rotate(-45deg); }
  55%  { transform: translate(10vw, 10vh) rotate(-150deg); }
  85%  { transform: translate(-4vw, 6vh) rotate(-280deg); }
  100% { transform: translate(0, 0) rotate(-360deg); }
`;

interface Props {
  opacity?: number;
  color?: string;
}

export const OrangeLinesBackground = ({
  opacity = 0.6,
  color = '#f97316',
}: Props) => {
  const warmColors = [color, '#ea580c', '#f59e0b', '#fb923c', '#fbbf24', '#fb7185'];

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
      {/* ═══════════ FONDO LAVA (blobs con gooey) ═══════════ */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="lava-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -12"
              result="goo"
            />
          </filter>
        </defs>
      </svg>

      <Box
        sx={{
          position: 'absolute',
          inset: '-10%',
          filter: 'url(#lava-goo)',
        }}
      >
        <Box
          sx={{
            position: 'absolute', top: '8%', left: '10%',
            width: '32vw', height: '32vw', maxWidth: 480, maxHeight: 480,
            borderRadius: '50%', bgcolor: warmColors[0],
            animation: `${blob1} 32s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: 'absolute', top: '15%', right: '12%',
            width: '26vw', height: '26vw', maxWidth: 400, maxHeight: 400,
            borderRadius: '50%', bgcolor: warmColors[2],
            animation: `${blob2} 38s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: 'absolute', top: '40%', left: '35%',
            width: '30vw', height: '30vw', maxWidth: 440, maxHeight: 440,
            borderRadius: '50%', bgcolor: warmColors[1],
            animation: `${blob3} 45s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: 'absolute', bottom: '12%', left: '8%',
            width: '28vw', height: '28vw', maxWidth: 420, maxHeight: 420,
            borderRadius: '50%', bgcolor: warmColors[3],
            animation: `${blob4} 40s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: 'absolute', bottom: '8%', right: '10%',
            width: '24vw', height: '24vw', maxWidth: 360, maxHeight: 360,
            borderRadius: '50%', bgcolor: warmColors[4],
            animation: `${blob5} 36s ease-in-out infinite`,
          }}
        />
      </Box>

      {/* ═══════════ TRIÁNGULOS DE LÍNEA NEGRA FLOTANDO ═══════════ */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
        }}
      >
        {/* Triángulo 1 · grande arriba-izquierda */}
        <Box
          component="svg"
          viewBox="0 0 100 100"
          sx={{
            position: 'absolute',
            top: '10%',
            left: '8%',
            width: { xs: 90, md: 140 },
            height: { xs: 90, md: 140 },
            opacity: 0.28,
            animation: `${triFloatA} 55s ease-in-out infinite`,
          }}
        >
          <polygon
            points="50,8 92,92 8,92"
            fill="none"
            stroke="#0A0A0A"
            strokeWidth="1"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </Box>

        {/* Triángulo 2 · medio derecha */}
        <Box
          component="svg"
          viewBox="0 0 100 100"
          sx={{
            position: 'absolute',
            top: '35%',
            right: '12%',
            width: { xs: 70, md: 110 },
            height: { xs: 70, md: 110 },
            opacity: 0.22,
            animation: `${triFloatB} 62s ease-in-out infinite`,
          }}
        >
          <polygon
            points="50,8 92,92 8,92"
            fill="none"
            stroke="#0A0A0A"
            strokeWidth="1"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </Box>

        {/* Triángulo 3 · pequeño abajo-izquierda */}
        <Box
          component="svg"
          viewBox="0 0 100 100"
          sx={{
            position: 'absolute',
            bottom: '15%',
            left: '18%',
            width: { xs: 60, md: 90 },
            height: { xs: 60, md: 90 },
            opacity: 0.32,
            animation: `${triFloatC} 48s ease-in-out infinite`,
          }}
        >
          <polygon
            points="50,8 92,92 8,92"
            fill="none"
            stroke="#0A0A0A"
            strokeWidth="1"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </Box>

        {/* Triángulo 4 · mediano abajo-derecha */}
        <Box
          component="svg"
          viewBox="0 0 100 100"
          sx={{
            position: 'absolute',
            bottom: '20%',
            right: '22%',
            width: { xs: 80, md: 120 },
            height: { xs: 80, md: 120 },
            opacity: 0.24,
            animation: `${triFloatD} 58s ease-in-out infinite`,
          }}
        >
          <polygon
            points="50,8 92,92 8,92"
            fill="none"
            stroke="#0A0A0A"
            strokeWidth="1"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </Box>

        {/* Triángulo 5 · mini arriba-centro */}
        <Box
          component="svg"
          viewBox="0 0 100 100"
          sx={{
            position: 'absolute',
            top: '18%',
            left: '48%',
            width: { xs: 50, md: 70 },
            height: { xs: 50, md: 70 },
            opacity: 0.35,
            animation: `${triFloatA} 45s ease-in-out infinite 3s`,
          }}
        >
          <polygon
            points="50,8 92,92 8,92"
            fill="none"
            stroke="#0A0A0A"
            strokeWidth="1"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </Box>

        {/* Triángulo 6 · mini centro */}
        <Box
          component="svg"
          viewBox="0 0 100 100"
          sx={{
            position: 'absolute',
            top: '60%',
            left: '42%',
            width: { xs: 44, md: 64 },
            height: { xs: 44, md: 64 },
            opacity: 0.2,
            animation: `${triFloatB} 52s ease-in-out infinite 5s`,
          }}
        >
          <polygon
            points="50,8 92,92 8,92"
            fill="none"
            stroke="#0A0A0A"
            strokeWidth="1"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </Box>

        {/* Triángulo 7 · grande abajo-derecha */}
        <Box
          component="svg"
          viewBox="0 0 100 100"
          sx={{
            position: 'absolute',
            bottom: '5%',
            right: '5%',
            width: { xs: 100, md: 150 },
            height: { xs: 100, md: 150 },
            opacity: 0.18,
            animation: `${triFloatC} 70s ease-in-out infinite 2s`,
          }}
        >
          <polygon
            points="50,8 92,92 8,92"
            fill="none"
            stroke="#0A0A0A"
            strokeWidth="1"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </Box>
      </Box>

      {/* ═══════════ Suavizado en los bordes ═══════════ */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(250,250,248,0.6) 95%)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
};