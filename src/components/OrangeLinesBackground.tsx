import { Box, keyframes } from '@mui/material';

const linesSlide = keyframes`
  0% { transform: translateY(0) translateX(0); }
  100% { transform: translateY(-80px) translateX(-80px); }
`;

const pulseGlow = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`;

interface Props {
  /** Opacidad global de las líneas (0-1). Default 0.5 */
  opacity?: number;
  /** Intensidad del color naranja. Default '#f97316' */
  color?: string;
  /** Velocidad en segundos del ciclo completo. Default 20 */
  duration?: number;
  /** Ángulo en grados de las líneas. Default 45 */
  angle?: number;
  /** Espaciado entre líneas en píxeles. Default 60 */
  gap?: number;
}

export const OrangeLinesBackground = ({
  opacity = 0.5,
  color = '#f97316',
  duration = 20,
  angle = 45,
  gap = 60,
}: Props) => {
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
      {/* Capa de líneas desplazándose */}
      <Box
        sx={{
          position: 'absolute',
          // Extendemos más allá del contenedor para que el movimiento no corte
          top: -160,
          left: -160,
          right: -160,
          bottom: -160,
          backgroundImage: `repeating-linear-gradient(
            ${angle}deg,
            transparent 0px,
            transparent ${gap - 1.5}px,
            ${color} ${gap - 1.5}px,
            ${color} ${gap}px
          )`,
          animation: `${linesSlide} ${duration}s linear infinite`,
        }}
      />

      {/* Halo naranja superior difuso */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}40 0%, transparent 65%)`,
          filter: 'blur(60px)',
          animation: `${pulseGlow} ${duration / 2}s ease-in-out infinite`,
        }}
      />

      {/* Halo naranja inferior difuso */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '50%',
          height: '50%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}30 0%, transparent 65%)`,
          filter: 'blur(60px)',
          animation: `${pulseGlow} ${duration / 2}s ease-in-out infinite reverse`,
        }}
      />

      {/* Máscara para difuminar los bordes */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(250,250,248,0.4) 0%, transparent 25%, transparent 75%, rgba(250,250,248,0.6) 100%)',
        }}
      />
    </Box>
  );
};