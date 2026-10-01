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
  50%  { transform: translate(10vw, -10vh) rotate(120deg) scale(1.08); }
  100% { transform: translate(0, 0) rotate(240deg) scale(1); }
`;

const float4 = keyframes`
  0%   { transform: translate(0, 0) rotate(0deg) scale(1); }
  40%  { transform: translate(-12vw, -6vh) rotate(-90deg) scale(0.94); }
  70%  { transform: translate(8vw, 8vh) rotate(-200deg) scale(1.04); }
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
  color: string;
}

const Triangle = ({ size, strokeWidth, opacity, color }: TriangleProps) => (
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
      stroke={color}
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

// ── Tipos de triángulos por escala ──
type TriangleConfig = {
  size: number;
  stroke: number;
  opa: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  anim: any;
  dur: number;
  delay?: number;
};

// GRANDES (muy grandes, muy sutiles, lentos)
const largeTriangles: TriangleConfig[] = [
  { size: 380, stroke: 1, opa: 0.18, top: '-4%', left: '-6%', anim: float1, dur: 70 },
  { size: 340, stroke: 1, opa: 0.16, top: '20%', right: '-8%', anim: float3, dur: 80, delay: 3 },
  { size: 420, stroke: 1.2, opa: 0.15, bottom: '-8%', left: '25%', anim: float4, dur: 90, delay: 5 },
  { size: 300, stroke: 0.9, opa: 0.2, top: '55%', right: '20%', anim: float5, dur: 75, delay: 2 },
];

// MEDIANOS (visibles, ritmo medio)
const mediumTriangles: TriangleConfig[] = [
  { size: 180, stroke: 1, opa: 0.35, top: '10%', left: '20%', anim: float2, dur: 55 },
  { size: 160, stroke: 1, opa: 0.4, top: '35%', right: '8%', anim: float5, dur: 50, delay: 1 },
  { size: 200, stroke: 1.1, opa: 0.3, bottom: '18%', left: '8%', anim: float6, dur: 60, delay: 4 },
  { size: 150, stroke: 1, opa: 0.38, bottom: '30%', right: '25%', anim: float1, dur: 48, delay: 2 },
  { size: 170, stroke: 1, opa: 0.32, top: '70%', left: '40%', anim: float3, dur: 58, delay: 6 },
  { size: 140, stroke: 0.9, opa: 0.4, top: '15%', right: '35%', anim: float4, dur: 52, delay: 3 },
];

// PEQUEÑOS (muchos, más visibles en proporción, dan textura)
const smallTriangles: TriangleConfig[] = [
  { size: 80, stroke: 1, opa: 0.5, top: '5%', left: '42%', anim: float5, dur: 40 },
  { size: 70, stroke: 0.9, opa: 0.55, top: '25%', left: '8%', anim: float2, dur: 36, delay: 1 },
  { size: 90, stroke: 1, opa: 0.45, top: '45%', left: '55%', anim: float6, dur: 44, delay: 2 },
  { size: 60, stroke: 0.9, opa: 0.6, top: '60%', left: '18%', anim: float1, dur: 38, delay: 3 },
  { size: 75, stroke: 1, opa: 0.5, top: '80%', right: '12%', anim: float3, dur: 42, delay: 1 },
  { size: 65, stroke: 0.9, opa: 0.55, bottom: '8%', left: '35%', anim: float4, dur: 40, delay: 4 },
  { size: 85, stroke: 1, opa: 0.45, bottom: '22%', right: '45%', anim: float5, dur: 46, delay: 2 },
  { size: 55, stroke: 0.9, opa: 0.6, top: '55%', right: '8%', anim: float2, dur: 34, delay: 5 },
  { size: 70, stroke: 1, opa: 0.5, top: '35%', left: '30%', anim: float6, dur: 42, delay: 3 },
  { size: 60, stroke: 0.9, opa: 0.55, bottom: '45%', right: '18%', anim: float1, dur: 38, delay: 6 },
  { size: 80, stroke: 1, opa: 0.45, top: '75%', left: '62%', anim: float3, dur: 44, delay: 2 },
  { size: 65, stroke: 0.9, opa: 0.55, top: '12%', left: '70%', anim: float5, dur: 40, delay: 4 },
  { size: 75, stroke: 1, opa: 0.5, bottom: '15%', left: '55%', anim: float2, dur: 42, delay: 1 },
  { size: 55, stroke: 0.9, opa: 0.6, top: '90%', right: '35%', anim: float4, dur: 36, delay: 5 },
  { size: 70, stroke: 1, opa: 0.5, top: '50%', left: '75%', anim: float6, dur: 44, delay: 3 },
  { size: 60, stroke: 0.9, opa: 0.55, bottom: '50%', left: '45%', anim: float1, dur: 38, delay: 2 },
];

export const OrangeLinesBackground = ({
  opacity = 0.5,
  color = '#0A0A0A',
}: Props) => {
  const allTriangles: TriangleConfig[] = [
    ...largeTriangles,
    ...mediumTriangles,
    ...smallTriangles,
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
      {allTriangles.map((t, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            top: t.top,
            left: t.left,
            right: t.right,
            bottom: t.bottom,
            animation: `${t.anim} ${t.dur}s ease-in-out infinite`,
            animationDelay: t.delay ? `${t.delay}s` : '0s',
            willChange: 'transform',
          }}
        >
          <Triangle
            size={t.size}
            strokeWidth={t.stroke}
            opacity={t.opa}
            color={color}
          />
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