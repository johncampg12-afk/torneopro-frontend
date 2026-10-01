import { Component, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', bgcolor: '#FAFAF8', p: 3 }}>
          <Box sx={{ maxWidth: 480, textAlign: 'center' }}>
            <Typography sx={{ fontSize: 22, fontWeight: 800, mb: 1 }}>
              Algo salió mal
            </Typography>
            <Typography sx={{ fontSize: 14, color: 'rgba(17,17,17,0.55)', mb: 3 }}>
              {this.state.error?.message || 'Error inesperado'}
            </Typography>
            <Button
              onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
              sx={{
                height: 48, borderRadius: '999px', px: 3,
                bgcolor: '#0A0A0A', color: 'white', fontWeight: 700,
                '&:hover': { bgcolor: '#1a1a1a' },
              }}
            >
              Volver al inicio
            </Button>
          </Box>
        </Box>
      );
    }
    return this.props.children;
  }
}