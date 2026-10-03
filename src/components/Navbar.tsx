import { useState } from 'react';
import {
  AppBar, Toolbar, Box, Typography, Button, IconButton, Avatar,
  Menu, MenuItem, Divider, Drawer, List, ListItemButton, ListItemText,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../contexts/AuthContext';
import { CoinsChip } from './CoinsChip';
import { AdultBanner } from './AdultBanner';
import { SMOOTH, BLACK } from '../theme';

const MAX_WIDTH = 1280;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState<null | HTMLElement>(null);

  const isOrganizer = user?.role === 'organizer';
  const isRegularUser = user?.role === 'user';

  const handleLogout = () => {
    setUserMenu(null);
    logout();
    navigate('/welcome');
  };

  const linkSx = {
    color: 'rgba(17,17,17,0.7)',
    fontWeight: 500,
    fontSize: 14.5,
    letterSpacing: -0.01,
    px: 1.5,
    py: 1,
    minWidth: 0,
    borderRadius: '10px',
    transition: `all 0.2s ${SMOOTH}`,
    '&:hover': { bgcolor: 'rgba(17,17,17,0.04)', color: BLACK },
  } as const;

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(250,250,248,0.78)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(17,17,17,0.06)',
          color: BLACK,
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            maxWidth: MAX_WIDTH,
            width: '100%',
            mx: 'auto',
            minHeight: { xs: 64, md: 72 },
            px: { xs: 2, sm: 3, md: 4 },
            gap: 2,
          }}
        >
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              textDecoration: 'none',
              color: 'inherit',
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 40, height: 40,
                borderRadius: '12px',
                bgcolor: 'white',
                p: 0.25,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid rgba(17,17,17,0.06)',
              }}
            >
              <Box
                component="img"
                src="/torneo-trend-sport.png"
                sx={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }}
              />
            </Box>
            <Typography
              sx={{
                fontSize: 17,
                fontWeight: 800,
                letterSpacing: -0.6,
                color: BLACK,
                fontFamily: '"Instrument Sans", system-ui, sans-serif',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Torneos TrendSport
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }} />

          {/* Desktop nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
            <Button component={Link} to="/" sx={linkSx}>
              Inicio
            </Button>

            {/* Premios: solo usuarios normales */}
            {isRegularUser && (
              <Button component={Link} to="/rewards" sx={linkSx}>
                Premios
              </Button>
            )}

            {user ? (
              <>
                {isOrganizer && (
                  <>
                    <Button component={Link} to="/dashboard" sx={linkSx}>
                      Mis torneos
                    </Button>
                    <Button component={Link} to="/templates" sx={linkSx}>
                      Plantillas
                    </Button>
                    <Button
                      component={Link}
                      to="/tournaments/create"
                      sx={{
                        ml: 1,
                        height: 40,
                        borderRadius: '999px',
                        px: 2.5,
                        fontWeight: 700,
                        fontSize: 14,
                        bgcolor: BLACK,
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(17,17,17,0.12)',
                        transition: `all 0.2s ${SMOOTH}`,
                        '&:hover': {
                          bgcolor: '#1a1a1a',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 8px 20px rgba(17,17,17,0.2)',
                        },
                        '&:active': { transform: 'scale(0.98)' },
                      }}
                    >
                      Nuevo torneo
                    </Button>
                  </>
                )}

                {/* Chip de coins: solo usuarios normales */}
                {isRegularUser && (
                  <Box sx={{ ml: 1.5 }}>
                    <CoinsChip />
                  </Box>
                )}

                <IconButton
                  onClick={(e) => setUserMenu(e.currentTarget)}
                  sx={{ ml: 1, p: 0.5 }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: BLACK,
                      color: 'white',
                      fontSize: 14,
                      fontWeight: 700,
                      border: '1.5px solid rgba(17,17,17,0.06)',
                    }}
                  >
                    {user.name?.charAt(0).toUpperCase() || '?'}
                  </Avatar>
                </IconButton>
              </>
            ) : (
              <>
                <Button component={Link} to="/auth" sx={linkSx}>
                  Iniciar sesión
                </Button>
                <Button
                  component={Link}
                  to="/welcome"
                  sx={{
                    ml: 1,
                    height: 40,
                    borderRadius: '999px',
                    px: 2.5,
                    fontWeight: 700,
                    fontSize: 14,
                    bgcolor: BLACK,
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(17,17,17,0.12)',
                    '&:hover': {
                      bgcolor: '#1a1a1a',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 8px 20px rgba(17,17,17,0.2)',
                    },
                  }}
                >
                  Empezar
                </Button>
              </>
            )}
          </Box>

          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{
              display: { xs: 'inline-flex', md: 'none' },
              color: BLACK,
              border: '1px solid rgba(17,17,17,0.08)',
              borderRadius: '12px',
              p: 1,
            }}
          >
            <MenuIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Menú de usuario */}
      <Menu
        anchorEl={userMenu}
        open={Boolean(userMenu)}
        onClose={() => setUserMenu(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 240,
              borderRadius: '16px',
              border: '1px solid rgba(17,17,17,0.06)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
              bgcolor: '#FFFFFF',
              p: 0.5,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: BLACK }}>
            {user?.name || 'Usuario'}
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'rgba(17,17,17,0.5)', mt: 0.25 }}>
            {user?.email || ''}
          </Typography>
          {isOrganizer && (
            <Box
              sx={{
                mt: 1,
                display: 'inline-block',
                px: 1,
                py: 0.25,
                borderRadius: '6px',
                bgcolor: 'rgba(34,197,94,0.12)',
                color: '#16A34A',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              Organizador
            </Box>
          )}
        </Box>
        <Divider sx={{ my: 0.5 }} />

        {/* ═══ SECCIÓN USUARIOS NORMALES ═══ */}
        {isRegularUser && (
          <>
            <MenuItem
              component={Link}
              to="/profile"
              onClick={() => setUserMenu(null)}
              sx={{ borderRadius: '10px', fontSize: 14, fontWeight: 500, py: 1 }}
            >
              Mi perfil
            </MenuItem>
            <MenuItem
              component={Link}
              to="/my-bets"
              onClick={() => setUserMenu(null)}
              sx={{ borderRadius: '10px', fontSize: 14, fontWeight: 500, py: 1 }}
            >
              Mis apuestas
            </MenuItem>
            <MenuItem
              component={Link}
              to="/my-rewards"
              onClick={() => setUserMenu(null)}
              sx={{ borderRadius: '10px', fontSize: 14, fontWeight: 500, py: 1 }}
            >
              Mis premios
            </MenuItem>
            <MenuItem
              component={Link}
              to="/rewards"
              onClick={() => setUserMenu(null)}
              sx={{ borderRadius: '10px', fontSize: 14, fontWeight: 500, py: 1 }}
            >
              🎁 Ver catálogo de premios
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
          </>
        )}

        {/* ═══ SECCIÓN ORGANIZADORES ═══ */}
        {isOrganizer && (
          <>
            <MenuItem
              component={Link}
              to="/dashboard"
              onClick={() => setUserMenu(null)}
              sx={{ borderRadius: '10px', fontSize: 14, fontWeight: 500, py: 1 }}
            >
              Mis torneos
            </MenuItem>
            <MenuItem
              component={Link}
              to="/templates"
              onClick={() => setUserMenu(null)}
              sx={{ borderRadius: '10px', fontSize: 14, fontWeight: 500, py: 1 }}
            >
              Mis plantillas
            </MenuItem>
            <MenuItem
              component={Link}
              to="/organizer/redemptions"
              onClick={() => setUserMenu(null)}
              sx={{ borderRadius: '10px', fontSize: 14, fontWeight: 500, py: 1 }}
            >
              🎁 Canjes de premios
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
          </>
        )}

        <MenuItem
          onClick={handleLogout}
          sx={{
            borderRadius: '10px',
            fontSize: 14,
            fontWeight: 500,
            py: 1,
            color: '#DC2626',
            '&:hover': { bgcolor: '#FEF2F2' },
          }}
        >
          Cerrar sesión
        </MenuItem>
      </Menu>

      {/* Drawer móvil */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{
          backdrop: { sx: { bgcolor: 'rgba(10,10,10,0.5)', backdropFilter: 'blur(6px)' } },
          paper: {
            sx: {
              width: 320,
              maxWidth: '85vw',
              bgcolor: '#FAFAF8',
              backgroundImage: 'none',
              borderLeft: '1px solid rgba(17,17,17,0.06)',
            },
          },
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 36, height: 36,
                  borderRadius: '10px',
                  bgcolor: 'white',
                  p: 0.25,
                  border: '1px solid rgba(17,17,17,0.06)',
                }}
              >
                <Box
                  component="img"
                  src="/torneo-trend-sport.png"
                  sx={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }}
                />
              </Box>
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: -0.4,
                  color: BLACK,
                  fontFamily: '"Instrument Sans", system-ui, sans-serif',
                }}
              >
                Torneos TrendSport
              </Typography>
            </Box>
            <IconButton onClick={() => setMobileOpen(false)} size="small">
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          {user && (
            <Box
              sx={{
                p: 2,
                borderRadius: '14px',
                bgcolor: 'white',
                border: '1px solid rgba(17,17,17,0.06)',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Avatar sx={{ width: 40, height: 40, bgcolor: BLACK, color: 'white', fontSize: 15, fontWeight: 700 }}>
                {user.name?.charAt(0).toUpperCase() || '?'}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: BLACK }}>
                  {user.name}
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'rgba(17,17,17,0.5)' }}>
                  {user.email}
                </Typography>
                {isOrganizer && (
                  <Box
                    sx={{
                      mt: 0.5,
                      display: 'inline-block',
                      px: 0.75,
                      py: 0.15,
                      borderRadius: '5px',
                      bgcolor: 'rgba(34,197,94,0.12)',
                      color: '#16A34A',
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                    }}
                  >
                    Organizador
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Chip de coins en móvil: solo usuarios normales */}
          {isRegularUser && (
            <Box sx={{ mb: 3 }}>
              <CoinsChip />
            </Box>
          )}

          <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <ListItemButton
              component={Link}
              to="/"
              onClick={() => setMobileOpen(false)}
              sx={{ borderRadius: '12px', py: 1.25 }}
            >
              <ListItemText
                primary="Inicio"
                primaryTypographyProps={{ fontSize: 15, fontWeight: 600, color: BLACK }}
              />
            </ListItemButton>

            {/* ═══ SECCIÓN USUARIOS NORMALES ═══ */}
            {isRegularUser && (
              <>
                <ListItemButton
                  component={Link}
                  to="/rewards"
                  onClick={() => setMobileOpen(false)}
                  sx={{ borderRadius: '12px', py: 1.25 }}
                >
                  <ListItemText
                    primary="🎁 Premios"
                    primaryTypographyProps={{ fontSize: 15, fontWeight: 600, color: BLACK }}
                  />
                </ListItemButton>
                <ListItemButton
                  component={Link}
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  sx={{ borderRadius: '12px', py: 1.25 }}
                >
                  <ListItemText
                    primary="Mi perfil"
                    primaryTypographyProps={{ fontSize: 15, fontWeight: 600, color: BLACK }}
                  />
                </ListItemButton>
                <ListItemButton
                  component={Link}
                  to="/my-bets"
                  onClick={() => setMobileOpen(false)}
                  sx={{ borderRadius: '12px', py: 1.25 }}
                >
                  <ListItemText
                    primary="Mis apuestas"
                    primaryTypographyProps={{ fontSize: 15, fontWeight: 600, color: BLACK }}
                  />
                </ListItemButton>
                <ListItemButton
                  component={Link}
                  to="/my-rewards"
                  onClick={() => setMobileOpen(false)}
                  sx={{ borderRadius: '12px', py: 1.25 }}
                >
                  <ListItemText
                    primary="Mis premios"
                    primaryTypographyProps={{ fontSize: 15, fontWeight: 600, color: BLACK }}
                  />
                </ListItemButton>
              </>
            )}

            {/* ═══ SECCIÓN ORGANIZADORES ═══ */}
            {isOrganizer && (
              <>
                <ListItemButton
                  component={Link}
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  sx={{ borderRadius: '12px', py: 1.25 }}
                >
                  <ListItemText
                    primary="Mis torneos"
                    primaryTypographyProps={{ fontSize: 15, fontWeight: 600, color: BLACK }}
                  />
                </ListItemButton>
                <ListItemButton
                  component={Link}
                  to="/templates"
                  onClick={() => setMobileOpen(false)}
                  sx={{ borderRadius: '12px', py: 1.25 }}
                >
                  <ListItemText
                    primary="Mis plantillas"
                    primaryTypographyProps={{ fontSize: 15, fontWeight: 600, color: BLACK }}
                  />
                </ListItemButton>
                <ListItemButton
                  component={Link}
                  to="/organizer/redemptions"
                  onClick={() => setMobileOpen(false)}
                  sx={{ borderRadius: '12px', py: 1.25 }}
                >
                  <ListItemText
                    primary="🎁 Canjes de premios"
                    primaryTypographyProps={{ fontSize: 15, fontWeight: 600, color: BLACK }}
                  />
                </ListItemButton>
              </>
            )}
          </List>

          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {user ? (
              <>
                {isOrganizer && (
                  <Button
                    component={Link}
                    to="/tournaments/create"
                    onClick={() => setMobileOpen(false)}
                    fullWidth
                    sx={{
                      height: 48,
                      borderRadius: '14px',
                      fontWeight: 700,
                      fontSize: 15,
                      bgcolor: BLACK,
                      color: 'white',
                      '&:hover': { bgcolor: '#1a1a1a' },
                    }}
                  >
                    Nuevo torneo
                  </Button>
                )}
                <Button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  fullWidth
                  sx={{
                    height: 48,
                    borderRadius: '14px',
                    fontWeight: 600,
                    fontSize: 14,
                    color: '#DC2626',
                    '&:hover': { bgcolor: '#FEF2F2' },
                  }}
                >
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  to="/welcome"
                  onClick={() => setMobileOpen(false)}
                  fullWidth
                  sx={{
                    height: 48,
                    borderRadius: '14px',
                    fontWeight: 700,
                    fontSize: 15,
                    bgcolor: BLACK,
                    color: 'white',
                    '&:hover': { bgcolor: '#1a1a1a' },
                  }}
                >
                  Empezar
                </Button>
                <Button
                  component={Link}
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  fullWidth
                  sx={{
                    height: 48,
                    borderRadius: '14px',
                    fontWeight: 600,
                    fontSize: 14,
                    color: BLACK,
                    border: '1.5px solid rgba(17,17,17,0.1)',
                    '&:hover': { borderColor: 'rgba(17,17,17,0.3)', bgcolor: 'transparent' },
                  }}
                >
                  Iniciar sesión
                </Button>
              </>
            )}

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, py: 1 }}>
              <Typography
                component={Link}
                to="/aviso-legal"
                onClick={() => setMobileOpen(false)}
                sx={{ fontSize: 11.5, fontFamily: '"Fragment Mono", monospace', color: 'rgba(17,17,17,0.35)', textDecoration: 'none' }}
              >
                Legal
              </Typography>
              <Typography
                component={Link}
                to="/politica-privacidad"
                onClick={() => setMobileOpen(false)}
                sx={{ fontSize: 11.5, fontFamily: '"Fragment Mono", monospace', color: 'rgba(17,17,17,0.35)', textDecoration: 'none' }}
              >
                Privacidad
              </Typography>
              <Typography
                component={Link}
                to="/terminos-condiciones"
                onClick={() => setMobileOpen(false)}
                sx={{ fontSize: 11.5, fontFamily: '"Fragment Mono", monospace', color: 'rgba(17,17,17,0.35)', textDecoration: 'none' }}
              >
                Términos
              </Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Banner +18: solo usuarios normales */}
      {isRegularUser && <AdultBanner />}
    </>
  );
}