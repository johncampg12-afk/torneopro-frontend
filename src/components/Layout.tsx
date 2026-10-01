import { Box } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  const location = useLocation();
  const isPublicView = location.pathname.startsWith('/t/');

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