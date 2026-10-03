import { useEffect } from 'react';
import { Box } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const location = useLocation();
  const { user, refreshUser } = useAuth();
  const isPublicView = location.pathname.startsWith('/t/');

  // Refrescar usuario al montar
  useEffect(() => {
    if (user) refreshUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refrescar al recuperar foco de la pestaña
  useEffect(() => {
    const onFocus = () => {
      if (user) refreshUser();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [user, refreshUser]);

  // Refrescar al volver a la pestaña (cambio de visibilityState)
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && user) {
        refreshUser();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [user, refreshUser]);

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: '#FAFAF8',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {!isPublicView && <Navbar />}

      <Box component="main" sx={{ flex: 1, width: '100%' }}>
        <Outlet />
      </Box>

      {!isPublicView && <Footer />}
    </Box>
  );
}