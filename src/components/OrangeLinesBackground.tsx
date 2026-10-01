import { Box, keyframes } from '@mui/material';

// ── Movimientos orgánicos tipo lava lamp (con rotación) ──
const lavaA = keyframes`
  0%   { transform: translate(0, 0) scale(1) rotate(0deg); }
  33%  { transform: translate(8vw, -12vh) scale(1.15) rotate(120deg); }
  66%  { transform: translate(-6vw, 8vh) scale(0.9) rotate(240deg); }
  100% { transform: translate(0, 0) scale(1) rotate(360deg); }
`;

const lavaB = keyframes`
  0%   { transform: translate(0, 0) scale(1) rotate(0deg); }
  25%  { transform: translate(-10vw, 6vh) scale(1.1) rotate(-90deg); }
  50%  { transform: translate(6vw, -10vh) scale(0.95) rotate(-180deg); }
  75%  { transform: translate(9vw, 10vh) scale(1.08) rotate(-270deg); }
  100% { transform: translate(0, 0) scale(1) rotate(-360deg); }
`;

const lavaC = keyframes`
  0%   { transform: translate(0, 0) scale(1) rotate(0deg); }
  20%  { transform: translate(6vw, 12vh) scale(1.2) rotate(80deg); }
  55%  { transform: translate(-12vw, 4vh) scale(0.85) rotate(200deg); }
  80%  { transform: translate(8vw, -6vh) scale(1.05) rotate(320deg); }
  100% { transform: translate(0, 0) scale(1) rotate(360deg); }
`;

const lavaD = keyframes`
  0%   { transform: translate(0, 0) scale(1) rotate(0deg); }
  40%  { transform: translate(-14vw, -8vh) scale(1.15) rotate(-140deg); }
  70%  { transform: translate(10vw, 10vh) scale(0.9) rotate(-280deg); }
  100% { transform: translate(0, 0) scale(1) rotate(-360deg); }
`;

const lavaE = keyframes`
  0%   { transform: translate(0, 0) scale(1) rotate(0deg); }
  30%  { transform: translate(12vw, 6vh) scale(1.1) rotate(100deg); }
  60%  { transform: translate(-8vw, -14vh) scale(0.92) rotate(220deg); }
  100% { transform: translate(0, 0) scale(1) rotate(360deg); }
`;

const lavaF = keyframes`
  0%   { transform: translate(0, 0) scale(1) rotate(0deg); }
  45%  { transform: translate(-6vw, 14vh) scale(1.18) rotate(-120deg); }
  75%  { transform: translate(14vw, -8vh) scale(0.88) rotate(-240deg); }
  100% { transform: translate(0, 0) scale(1) rotate(-360deg); }
`;

// ── Formas irregulares tipo "blob CSS" ──
const SHAPES = [
  '60% 40% 30% 70% / 60% 30% 70% 40%',
  '45% 55% 62% 38% / 55% 40% 60% 45%',
  '70% 30% 55% 45% / 40% 60% 35% 65%',
  '35% 65% 45% 55% / 65% 35% 60% 40%',
  '50% 50% 65% 35% / 40% 55% 45% 60%',
  '65% 35% 40% 60% / 55% 65% 35% 45%',
  '40% 60% 55% 45% / 50% 40% 65% 35%',
  '55% 45% 35% 65% / 60% 50% 45% 55%',
];

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
      {/* ═══ Filtro SVG gooey ═══ */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id="lava-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="28" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -11"
              result="goo"
            />
          </filter>
        </defs>
      </svg>

      {/* ═══ Contenedor con filtro gooey ═══ */}
      <Box
        sx={{
          position: 'absolute',
          inset: '-10%',
          filter: 'url(#lava-goo)',
        }}
      >
        {/* Blob 1 */}
        <Box
          sx={{
            position: 'absolute',
            top: '8%',
            left: '10%',
            width: '32vw',
            height: '32vw',
            maxWidth: 480,
            maxHeight: 480,
            borderRadius: SHAPES[0],
            bgcolor: warmColors[0],
            animation: `${lavaA} 32s ease-in-out infinite`,
          }}
        />

        {/* Blob 2 */}
        <Box
          sx={{
            position: 'absolute',
            top: '15%',
            right: '12%',
            width: '26vw',
            height: '26vw',
            maxWidth: 400,
            maxHeight: 400,
            borderRadius: SHAPES[1],
            bgcolor: warmColors[2],
            animation: `${lavaB} 38s ease-in-out infinite`,
          }}
        />

        {/* Blob 3 */}
        <Box
          sx={{
            position: 'absolute',
            top: '40%',
            left: '35%',
            width: '30vw',
            height: '30vw',
            maxWidth: 440,
            maxHeight: 440,
            borderRadius: SHAPES[2],
            bgcolor: warmColors[1],
            animation: `${lavaC} 45s ease-in-out infinite`,
          }}
        />

        {/* Blob 4 */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '12%',
            left: '8%',
            width: '28vw',
            height: '28vw',
            maxWidth: 420,
            maxHeight: 420,
            borderRadius: SHAPES[3],
            bgcolor: warmColors[3],
            animation: `${lavaD} 40s ease-in-out infinite`,
          }}
        />

        {/* Blob 5 */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '8%',
            right: '10%',
            width: '24vw',
            height: '24vw',
            maxWidth: 360,
            maxHeight: 360,
            borderRadius: SHAPES[4],
            bgcolor: warmColors[4],
            animation: `${lavaE} 36s ease-in-out infinite`,
          }}
        />

        {/* Blob 6 */}
        <Box
          sx={{
            position: 'absolute',
            top: '55%',
            right: '20%',
            width: '22vw',
            height: '22vw',
            maxWidth: 320,
            maxHeight: 320,
            borderRadius: SHAPES[5],
            bgcolor: warmColors[5],
            animation: `${lavaF} 42s ease-in-out infinite`,
          }}
        />

        {/* Blob 7 */}
        <Box
          sx={{
            position: 'absolute',
            top: '5%',
            left: '45%',
            width: '20vw',
            height: '20vw',
            maxWidth: 300,
            maxHeight: 300,
            borderRadius: SHAPES[6],
            bgcolor: warmColors[0],
            animation: `${lavaD} 48s ease-in-out infinite 2s`,
          }}
        />

        {/* Blob 8 */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            left: '50%',
            width: '18vw',
            height: '18vw',
            maxWidth: 280,
            maxHeight: 280,
            borderRadius: SHAPES[7],
            bgcolor: warmColors[2],
            animation: `${lavaB} 44s ease-in-out infinite 3s`,
          }}
        />

        {/* Blob 9 · pequeño extra */}
        <Box
          sx={{
            position: 'absolute',
            top: '35%',
            right: '5%',
            width: '14vw',
            height: '14vw',
            maxWidth: 220,
            maxHeight: 220,
            borderRadius: SHAPES[1],
            bgcolor: warmColors[3],
            animation: `${lavaC} 50s ease-in-out infinite 1s`,
          }}
        />

        {/* Blob 10 · pequeño extra */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '35%',
            left: '20%',
            width: '16vw',
            height: '16vw',
            maxWidth: 240,
            maxHeight: 240,
            borderRadius: SHAPES[5],
            bgcolor: warmColors[4],
            animation: `${lavaE} 46s ease-in-out infinite 4s`,
          }}
        />
      </Box>

      {/* ═══ Suavizado en los bordes ═══ */}
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