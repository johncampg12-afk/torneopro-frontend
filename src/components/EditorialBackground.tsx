import { Box, keyframes } from '@mui/material';

const gridShift = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 60px 60px; }
`;
const arcRotate1 = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;
const arcRotate2 = keyframes`
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
`;

export const EditorialBackground = () => (
  <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
    {/* Gradiente radial */}
    <Box sx={{ position: 'absolute', inset: 0,
      background: 'radial-gradient(120% 90% at 50% 0%, rgba(17,17,17,0.05) 0%, rgba(17,17,17,0) 55%)' }} />

    {/* Grid */}
    <Box sx={{ position: 'absolute', inset: 0, opacity: 0.55,
      backgroundImage:
        'linear-gradient(rgba(17,17,17,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(17,17,17,0.045) 1px, transparent 1px)',
      backgroundSize: '60px 60px',
      maskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%, black 40%, transparent 100%)',
      WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 40%, black 40%, transparent 100%)',
      animation: `${gridShift} 40s linear infinite` }} />

    {/* Arco superior derecha */}
    <Box sx={{ position: 'absolute', top: -220, right: -220, width: 520, height: 520, borderRadius: '50%',
      border: '1px solid rgba(17,17,17,0.09)',
      '&::before': { content: '""', position: 'absolute', inset: 40, borderRadius: '50%', border: '1px solid rgba(17,17,17,0.06)' },
      '&::after': { content: '""', position: 'absolute', inset: 100, borderRadius: '50%', border: '1px solid rgba(17,17,17,0.035)' },
      animation: `${arcRotate1} 80s linear infinite` }} />

    {/* Arco inferior izquierda */}
    <Box sx={{ position: 'absolute', bottom: -260, left: -260, width: 560, height: 560, borderRadius: '50%',
      border: '1px solid rgba(17,17,17,0.08)',
      '&::before': { content: '""', position: 'absolute', inset: 60, borderRadius: '50%', border: '1px solid rgba(17,17,17,0.05)' },
      '&::after': { content: '""', position: 'absolute', inset: 140, borderRadius: '50%', border: '1px solid rgba(17,17,17,0.03)' },
      animation: `${arcRotate2} 100s linear infinite` }} />

    {/* Grano */}
    <Box sx={{ position: 'absolute', inset: 0, opacity: 0.035, mixBlendMode: 'multiply',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
  </Box>
);