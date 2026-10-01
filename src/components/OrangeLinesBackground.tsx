import { Box, keyframes } from '@mui/material';

// ── Movimientos flotantes ──
const float1 = keyframes`
  0%   { transform: translate(0, 0) rotate(0deg); }
  25%  { transform: translate(6vw, -8vh) rotate(45deg); }
  50%  { transform: translate(-4vw, 6vh) rotate(90deg); }
  75%  { transform: translate(8vw, 4vh) rotate(135deg); }
  100% { transform: translate(0, 0) rotate(180deg); }
`;

const float2 = keyframes`
  0%   { transform: translate(0, 0) rotate(0deg); }
  33%  { transform: translate(-8vw, 5vh) rotate(-60deg); }
  66%  { transform: translate(6vw, -6vh) rotate(-120deg); }
  100% { transform: translate(0, 0) rotate(-180deg); }
`;

const float3 = keyframes`
  0%   { transform: translate(0, 0) rotate(0deg) scale(1); }
  50%  { transform: translate(10vw, -10vh) rotate(120deg) scale(1.1); }
  100% { transform: translate(0, 0) rotate(240deg) scale(1); }
`;

const float4 = keyframes`
  0%   { transform: translate(0, 0) rotate(0deg) scale(1); }
  40%  { transform: translate(-12vw, -6vh) rotate(-90deg) scale(0.9); }
  70%  { transform: translate(8vw, 8vh) rotate(-200deg) scale(1.05); }
  100% { transform: translate(0, 0) rotate(-360deg) scale(1); }
`;

const float5 = keyframes`
  0%   { transform: translate(0, 0) rotate(0deg); }
  30%  { transform: translate(4vw, 10vh) rotate(80deg); }
  60%  { transform: translate(-10vw, -4vh) rotate(200deg); }
  100% { transform: translate(0, 0) rotate(360deg); }
`;

const float6 = keyframes`
  0%   { transform: translate(0, 0) rotate(0deg); }
  45%  { transform: translate(-6vw, 12vh) rotate(-140deg); }
  80%  { transform: translate(12vw, -6vh) rotate(-280deg); }
  100% { transform: translate(0, 0) rotate(-360deg); }
`;

// ── SVG de triángulo con línea (outline) ──
interface TriangleProps {
  size: number;
  strokeWidth: number;
  opacity: number;
}

const Triangle = ({ size, strokeWidth, opacity }: TriangleProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block', opacity }}
  >
    <polygon
      points="50,8 92,88 8,88"
      stroke="#0A0A0A"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

interface Props {
  /** Opacidad global. Default 0.5 */
  opacity?: number;
  /** Color del trazo. Default '#0A0A0A' */
  color?: string;
}

export const OrangeLinesBackground = ({
  opacity = 0.5,
  color = '#0A0A0A',
}: Props) => {
  // Configuración de cada triángulo: tamaño, grosor de línea, opacidad, posición y animación
  const triangles = [
    { size: 120, stroke: 1.2, opa: 0.5, top: '8%', left: '6%', anim: float1, dur: 42 },
    { size: 90, stroke: 1, opa: 0.45, top: '18%', right: '12%', anim: float2, dur: 38 },
    { size: 160, stroke: 1.4, opa: 0.35, top: '48%', left: '40%', anim: float3, dur: 52 },
    { size: 70, stroke: 1, opa: 0.5, bottom: '18%', left: '12%', anim: float4, dur: 46 },
    { size: 100, stroke: 1.2, opa: 0.4, bottom: '12%', right: '8%', anim: float5, dur: 40 },
    { size: 140, stroke: 1.3, opa: 0.35, top: '30%', right: '35%', anim: float6, dur: 56 },
    { size: 60, stroke: 0.9, opa: 0.55, top: '65%', right: '22%', anim: float1, dur: 44 },
    { size: 80, stroke: 1, opa: 0.4, bottom: '40%', left: '55%', anim: float2, dur: 50 },
    { size: 110, stroke: 1.1, opa: 0.35, top: '80%', left: '30%', anim: float3, dur: 48 },
    { size: 65, stroke: 0.9, opa: 0.5, top: '22%', left: '55%', anim: float5, dur: 42 },
  ];

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
      {/* Los triángulos, flotando */}
      {triangles.map((t, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            top: t.top,
            left: t.left,
            right: t.right,
            bottom: t.bottom,
            animation: `${t.anim} ${t.dur}s ease-in-out infinite`,
            willChange: 'transform',
          }}
        >
          {/* Forzamos el color del stroke por encima */}
          <Box
            sx={{
              '& svg polygon': {
                stroke: color,
              },
            }}
          >
            <Triangle size={t.size} strokeWidth={t.stroke} opacity={t.opa} />
          </Box>
        </Box>
      ))}

      {/* Suavizado en los bordes para que no se vean cortados */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(250,250,248,0.7) 95%)',
        }}
      />
    </Box>
  );
};