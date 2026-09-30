import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    background: { default: '#FAFAF8', paper: '#FFFFFF' },
    primary: { main: '#0A0A0A' },
    text: { primary: '#0A0A0A', secondary: 'rgba(17,17,17,0.55)' },
  },
  typography: {
    fontFamily: '"Instrument Sans", system-ui, -apple-system, sans-serif',
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: '-0.01em' },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          overscrollBehavior: 'none',
        },
      },
    },
  },
});

// Constantes reutilizables (copiadas de las referencias)
export const SMOOTH = 'cubic-bezier(0.22, 1, 0.36, 1)';
export const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
export const BG = '#FAFAF8';
export const BLACK = '#0A0A0A';
export const BORDER = 'rgba(17,17,17,0.1)';
export const TEXT_SECONDARY = 'rgba(17,17,17,0.55)';