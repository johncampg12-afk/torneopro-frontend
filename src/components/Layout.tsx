import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function Layout() {
  const location = useLocation();
  const { user, refreshUser, refreshUnseenBets } = useAuth();
  const isPublicView = location.pathname.startsWith('/t/');
  const dailyBonusCheckedRef = useRef(false);

  // Refrescar usuario y contador de apuestas al montar
  useEffect(() => {
    if (!user) return;
    refreshUser();
    refreshUnseenBets();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Bono diario automático (solo usuarios normales, solo 1 vez por sesión)
  useEffect(() => {
    if (!user || user.role !== 'user') return;
    if (dailyBonusCheckedRef.current) return;
    dailyBonusCheckedRef.current = true;

    api.post('/users/me/daily-bonus')
      .then(res => {
        if (res.data.granted) {
          refreshUser();
          const el = document.createElement('div');
          el.textContent = `🎁 +${res.data.bonus} TrendCoins`;
          el.style.cssText = `
            position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
            background:#0A0A0A;color:white;padding:12px 24px;border-radius:999px;
            font-size:14px;font-weight:700;z-index:9999;font-family:inherit;
            box-shadow:0 8px 24px rgba(0,0,0,0.3);
          `;
          document.body.appendChild(el);
          setTimeout(() => el.remove(), 3000);
        }
      })
      .catch(() => {});
  }, [user, refreshUser]);

  // Refrescar al recuperar foco de la pestaña
  useEffect(() => {
    const onFocus = () => {
      if (user) {
        refreshUser();
        refreshUnseenBets();
      }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [user, refreshUser, refreshUnseenBets]);

  // Refrescar al volver a la pestaña (cambio de visibilityState)
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && user) {
        refreshUser();
        refreshUnseenBets();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [user, refreshUser, refreshUnseenBets]);

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