import { Box, keyframes } from '@mui/material';

// ── Movimientos orgánicos tipo lava lamp ──
const lavaA = keyframes`
  0%   { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(8vw, -12vh) scale(1.15); }
  66%  { transform: translate(-6vw, 8vh) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
`;

const lavaB = keyframes`
  0%   { transform: translate(0, 0) scale(1); }
  25%  { transform: translate(-10vw, 6vh) scale(1.1); }
  50%  { transform: translate(6vw, -10vh) scale(0.95); }
  75%  { transform: translate(9vw, 10vh) scale(1.08); }
  100% { transform: translate(0, 0) scale(1); }
`;

const lavaC = keyframes`
  0%   { transform: translate(0, 0) scale(1); }
  20%  { transform: translate(6vw, 12vh) scale(1.2); }
  55%  { transform: translate(-12vw, 4vh) scale(0.85); }
  80%  { transform: translate(8vw, -6vh) scale(1.05); }
  100% { transform: translate(0, 0) scale(1); }
`;

const lavaD = keyframes`
  0%   { transform: translate(0, 0) scale(1); }
  40%  { transform: translate(-14vw, -8vh) scale(1.15); }
  70%  { transform: translate(10vw, 10vh) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
`;

const lavaE = keyframes`
  0%   { transform: translate(0, 0) scale(1); }
  30%  { transform: translate(12vw, 6vh) scale(1.1); }
  60%  { transform: translate(-8vw, -14vh) scale(0.92); }
  100% { transform: translate(0, 0) scale(1); }
`;

const lavaF = keyframes`
  0%   { transform: translate(0, 0) scale(1); }
  45%  { transform: translate(-6vw, 14vh) scale(1.18); }
  75%  { transform: translate(14vw, -8vh) scale(0.88); }
  100% { transform: translate(0, 0) scale(1); }
`;

interface Props {
  opacity?: number;
  color?: string;
}

export const OrangeLinesBackground = ({
  opacity = 0.6,
  color = '#f97316',
}: Props) => {
  // Colores cálidos en armonía con el naranja principal
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
      {/* ═══ Filtro SVG gooey (hace que los blobs se fusionen) ═══ */}
      <svg
        style={{ position: 'absolute', width: 0, height: 0 }}
        aria-hidden="true"
      >
        <defs>
          <filter id="lava-goo">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="30"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -12"
              result="goo"
            />
          </filter>
        </defs>
      </svg>

      {/* ═══ Contenedor con el filtro gooey aplicado ═══ */}
      <Box
        sx={{
          position: 'absolute',
          inset: '-10%',
          filter: 'url(#lava-goo)',
        }}
      >
        {/* Blob 1 · principal, arriba-izquierda */}
        <Box
          sx={{
            position: 'absolute',
            top: '8%',
            left: '10%',
            width: '32vw',
            height: '32vw',
            maxWidth: 480,
            maxHeight: 480,
            borderRadius: '50%',
            bgcolor: warmColors[0],
            animation: `${lavaA} 32s ease-in-out infinite`,
          }}
        />

        {/* Blob 2 · ámbar, arriba-derecha */}
        <Box
          sx={{
            position: 'absolute',
            top: '15%',
            right: '12%',
            width: '26vw',
            height: '26vw',
            maxWidth: 400,
            maxHeight: 400,
            borderRadius: '50%',
            bgcolor: warmColors[2],
            animation: `${lavaB} 38s ease-in-out infinite`,
          }}
        />

        {/* Blob 3 · naranja profundo, centro */}
        <Box
          sx={{
            position: 'absolute',
            top: '40%',
            left: '35%',
            width: '30vw',
            height: '30vw',
            maxWidth: 440,
            maxHeight: 440,
            borderRadius: '50%',
            bgcolor: warmColors[1],
            animation: `${lavaC} 45s ease-in-out infinite`,
          }}
        />

        {/* Blob 4 · coral claro, abajo-izquierda */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '12%',
            left: '8%',
            width: '28vw',
            height: '28vw',
            maxWidth: 420,
            maxHeight: 420,
            borderRadius: '50%',
            bgcolor: warmColors[3],
            animation: `${lavaD} 40s ease-in-out infinite`,
          }}
        />

        {/* Blob 5 · amarillo ámbar, abajo-derecha */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '8%',
            right: '10%',
            width: '24vw',
            height: '24vw',
            maxWidth: 360,
            maxHeight: 360,
            borderRadius: '50%',
            bgcolor: warmColors[4],
            animation: `${lavaE} 36s ease-in-out infinite`,
          }}
        />

        {/* Blob 6 · rosado cálido, centro-derecha */}
        <Box
          sx={{
            position: 'absolute',
            top: '55%',
            right: '20%',
            width: '22vw',
            height: '22vw',
            maxWidth: 320,
            maxHeight: 320,
            borderRadius: '50%',
            bgcolor: warmColors[5],
            animation: `${lavaF} 42s ease-in-out infinite`,
          }}
        />

        {/* Blob 7 · naranja extra, arriba-centro */}
        <Box
          sx={{
            position: 'absolute',
            top: '5%',
            left: '45%',
            width: '20vw',
            height: '20vw',
            maxWidth: 300,
            maxHeight: 300,
            borderRadius: '50%',
            bgcolor: warmColors[0],
            animation: `${lavaD} 48s ease-in-out infinite 2s`,
          }}
        />

        {/* Blob 8 · toque extra, abajo-centro */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            left: '50%',
            width: '18vw',
            height: '18vw',
            maxWidth: 280,
            maxHeight: 280,
            borderRadius: '50%',
            bgcolor: warmColors[2],
            animation: `${lavaB} 44s ease-in-out infinite 3s`,
          }}
        />
      </Box>

      {/* ═══ Suavizado en los bordes para no cortar los blobs ═══ */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(250,250,248,0.6) 95%)',
        }}
      />
    </Box>
  );
};