import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Stack, InputBase, Drawer, Dialog, keyframes } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import EmailIcon from '@mui/icons-material/Email';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import { useAuth } from '../../contexts/AuthContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { EditorialBackground } from '../../components/EditorialBackground';
import { api } from '../../lib/api';
import { SMOOTH, SPRING, BLACK, TEXT_SECONDARY } from '../../theme';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;
const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
`;
const lineGrow = keyframes`
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
`;

const TERMS_VERSION = '1.0';
const TERMS_STORAGE_KEY = 'trendsport_terms_accepted';

export const AuthPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { data: onboarding } = useOnboarding();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  // Si viene del Welcome pulsando "Ya tengo cuenta", no hay datos de onboarding → login
  useEffect(() => {
    if (!onboarding.fullName && !onboarding.username) {
      setIsRegistering(false);
    }
  }, [onboarding.fullName, onboarding.username]);

  const isOrganizer = onboarding.role === 'organizer';
  const displayName = onboarding.fullName || '';

  const requireTerms = (action: () => void) => {
    if (localStorage.getItem(TERMS_STORAGE_KEY) === TERMS_VERSION) { action(); return; }
    pendingActionRef.current = action;
    setTermsChecked(false);
    setTermsModalOpen(true);
  };

  const acceptTerms = () => {
    if (!termsChecked) return;
    localStorage.setItem(TERMS_STORAGE_KEY, TERMS_VERSION);
    setTermsModalOpen(false);
    const a = pendingActionRef.current;
    pendingActionRef.current = null;
    if (a) a();
  };

  const handleEmailAuth = async () => {
    if (!email || password.length < 8) return;
    setLoading(true); setError('');
    try {
      const endpoint = isRegistering ? '/auth/register' : '/auth/login';
      const body: any = { email, password };

      if (isRegistering) {
        body.name = onboarding.fullName;
        body.username = onboarding.username;
        body.city = onboarding.city;
        body.role = isOrganizer ? 'organizer' : 'user';
        body.terms_version = TERMS_VERSION;
        if (isOrganizer) {
          const token = sessionStorage.getItem('trendsport_organizer_token');
          if (token) body.organizer_token = token;
        }
      }

      const res = await api.post(endpoint, body);
      const token = res.data.token || res.data.access_token;

      // Si hay foto, subirla aparte
      if (isRegistering && onboarding.photo) {
        const fd = new FormData();
        fd.append('photo', onboarding.photo);
        try { await api.put('/users/me/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); } catch {}
      }

      sessionStorage.removeItem('trendsport_organizer_token');
      login(token, res.data.user);
      navigate('/');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error de autenticación');
    } finally { setLoading(false); }
  };

  const handleGoogle = async (credential?: string) => {
    if (!credential) return;
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/social', {
        provider: 'google',
        token: credential,
        role: isOrganizer ? 'organizer' : 'user',
        name: onboarding.fullName,
        username: onboarding.username,
        city: onboarding.city,
        terms_version: TERMS_VERSION,
      });
      const token = res.data.token || res.data.access_token;
      login(token, res.data.user);
      navigate('/');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error con Google');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: '#FAFAF8', position: 'relative', overflow: 'hidden', color: 'black' }}>
      <EditorialBackground />

      <Box sx={{ position: 'relative', zIndex: 1, minHeight: '100dvh',
        maxWidth: 480, mx: 'auto', width: '100%',
        display: 'flex', flexDirection: 'column',
        px: 3, pt: 'calc(20px + env(safe-area-inset-top, 0px))',
        pb: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button onClick={() => navigate(-1)}
            sx={{ minWidth: 32, width: 32, height: 32, borderRadius: '50%', bgcolor: '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.7)', display: 'grid', placeItems: 'center', p: 0 }}>
            <ArrowBackIcon sx={{ fontSize: 16 }} />
          </Button>
          <Box sx={{ px: 1.5, py: 0.6, borderRadius: '999px', border: '1px solid rgba(17,17,17,0.12)',
            fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(17,17,17,0.55)' }}>
            {isOrganizer ? 'Organizador' : 'Cuenta'}
          </Box>
        </Box>

        {/* Hero */}
        <Box sx={{ mt: 'auto', mb: 'auto', pt: 6, animation: `${fadeInUp} 0.7s ${SMOOTH} both 0.1s` }}>
          <Box sx={{ height: 1, bgcolor: 'rgba(17,17,17,0.14)', transformOrigin: 'left center',
            animation: `${lineGrow} 0.8s ${SMOOTH} both 0.5s` }} />
          <Typography sx={{ mt: 5, fontSize: { xs: 42, md: 48 }, lineHeight: 1.02, fontWeight: 800,
            letterSpacing: -1.6, color: BLACK, fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
            {isRegistering ? 'Crea tu' : 'Bienvenido,'}<br />
            <Box component="span" sx={{ color: 'rgba(17,17,17,0.35)', fontWeight: 700 }}>
              {isRegistering ? 'cuenta' : (displayName ? displayName.split(' ')[0] : 'de nuevo')}
            </Box>
          </Typography>
          <Typography sx={{ mt: 2.5, fontSize: 15, fontWeight: 500, color: TEXT_SECONDARY, lineHeight: 1.55, maxWidth: 340 }}>
            {isRegistering
              ? 'Solo necesitamos tu email y una contraseña para guardar todo.'
              : 'Introduce tus datos para acceder a tus torneos.'}
          </Typography>
        </Box>

        {error && (
          <Box sx={{ mb: 2, p: 1.75, borderRadius: '14px', bgcolor: '#FEF2F2', border: '1px solid #FECACA',
            animation: `${scaleIn} 0.4s ${SPRING} both` }}>
            <Typography sx={{ fontSize: 13, color: '#DC2626', fontWeight: 500 }}>{error}</Typography>
          </Box>
        )}

        {/* Botones auth */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5,
          animation: `${fadeInUp} 0.6s ${SMOOTH} both 0.35s` }}>
          {/* Google */}
          <Box sx={{ '& iframe': { width: '100% !important' } }}>
            <GoogleLogin
              onSuccess={(cred) => requireTerms(() => handleGoogle(cred.credential))}
              onError={() => setError('Error con Google')}
              theme="outline"
              size="large"
              text={isRegistering ? 'signup_with' : 'signin_with'}
              shape="pill"
              width="400"
            />
          </Box>

          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', py: 0.5 }}>
            <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(17,17,17,0.09)' }} />
            <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
              color: 'rgba(17,17,17,0.35)' }}>o</Typography>
            <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(17,17,17,0.09)' }} />
          </Stack>

          <Button fullWidth onClick={() => { setSheetOpen(true); setIsRegistering(true); }}
            startIcon={<EmailIcon sx={{ fontSize: 19 }} />}
            sx={{ height: 56, borderRadius: '16px', fontWeight: 700, fontSize: 15,
              bgcolor: BLACK, color: 'white', boxShadow: '0 8px 24px rgba(17,17,17,0.15)',
              transition: `all 0.3s ${SMOOTH}`,
              '&:hover': { bgcolor: '#1a1a1a', transform: 'translateY(-1px)' },
              '&:active': { transform: 'scale(0.985)' } }}>
            {isRegistering ? 'Registrarme con email' : 'Iniciar con email'}
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 1 }}>
            <Typography onClick={() => navigate('/terminos-condiciones')}
              sx={{ fontSize: 12, fontWeight: 500, color: 'rgba(17,17,17,0.45)', cursor: 'pointer', '&:hover': { color: BLACK } }}>
              Términos
            </Typography>
            <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'rgba(17,17,17,0.25)' }} />
            <Typography onClick={() => navigate('/politica-privacidad')}
              sx={{ fontSize: 12, fontWeight: 500, color: 'rgba(17,17,17,0.45)', cursor: 'pointer', '&:hover': { color: BLACK } }}>
              Privacidad
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Bottom sheet email */}
      <Drawer anchor="bottom" open={sheetOpen} onClose={() => setSheetOpen(false)}
        slotProps={{
          backdrop: { sx: { bgcolor: 'rgba(10,10,10,0.55)', backdropFilter: 'blur(6px)' } },
          paper: { sx: { borderTopLeftRadius: '28px', borderTopRightRadius: '28px', maxHeight: '90dvh',
            bgcolor: '#FAFAF8', backgroundImage: 'none', boxShadow: '0 -20px 60px rgba(0,0,0,0.18)' } },
        }}>
        <Box sx={{ p: 3, pb: 'calc(28px + env(safe-area-inset-bottom, 0px))', maxWidth: 480, mx: 'auto', width: '100%' }}>
          <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: 'rgba(17,17,17,0.14)', mx: 'auto', mb: 3.5 }} />
          <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase',
            color: 'rgba(17,17,17,0.4)', mb: 1.5 }}>
            {isRegistering ? 'Nueva cuenta' : 'Iniciar sesión'}
          </Typography>
          <Typography sx={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.1,
            color: BLACK, fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
            {isRegistering ? 'Crea tu cuenta' : 'Hola de nuevo'}
          </Typography>

          <Stack spacing={2.5} sx={{ mt: 3.5 }}>
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                color: 'rgba(17,17,17,0.45)', mb: 1 }}>Email</Typography>
              <Box sx={{ height: 52, display: 'flex', alignItems: 'center',
                borderBottom: '1.5px solid rgba(17,17,17,0.14)',
                transition: `border-color 0.25s ${SMOOTH}`, '&:focus-within': { borderColor: BLACK } }}>
                <InputBase value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com" type="email"
                  sx={{ flex: 1, fontSize: 16, fontWeight: 500, color: BLACK,
                    '& input::placeholder': { color: 'rgba(17,17,17,0.3)' } }} />
              </Box>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                color: 'rgba(17,17,17,0.45)', mb: 1 }}>Contraseña</Typography>
              <Box sx={{ height: 52, display: 'flex', alignItems: 'center',
                borderBottom: '1.5px solid rgba(17,17,17,0.14)',
                transition: `border-color 0.25s ${SMOOTH}`, '&:focus-within': { borderColor: BLACK } }}>
                <InputBase value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres" type={showPass ? 'text' : 'password'}
                  sx={{ flex: 1, fontSize: 16, fontWeight: 500, color: BLACK,
                    '& input::placeholder': { color: 'rgba(17,17,17,0.3)' } }} />
                <Box onClick={() => setShowPass(!showPass)} sx={{ p: 0.5, cursor: 'pointer' }}>
                  {showPass ? <VisibilityOffIcon sx={{ fontSize: 20, color: 'rgba(17,17,17,0.5)' }} />
                            : <VisibilityIcon sx={{ fontSize: 20, color: 'rgba(17,17,17,0.5)' }} />}
                </Box>
              </Box>
            </Box>
          </Stack>

          <Button fullWidth disabled={!email || password.length < 8 || loading}
            onClick={() => requireTerms(() => handleEmailAuth())}
            sx={{ mt: 4, height: 56, borderRadius: '16px', fontWeight: 700, fontSize: 15.5,
              bgcolor: BLACK, color: 'white', boxShadow: '0 8px 24px rgba(17,17,17,0.15)',
              '&:disabled': { bgcolor: 'rgba(17,17,17,0.06)', color: 'rgba(17,17,17,0.3)' },
              '&:hover': { bgcolor: '#1a1a1a' },
              '&:active': { transform: 'scale(0.985)' } }}>
            {loading ? 'Un momento…' : (isRegistering ? 'Crear cuenta' : 'Iniciar sesión')}
          </Button>

          <Box onClick={() => setIsRegistering(!isRegistering)}
            sx={{ mt: 2, textAlign: 'center', cursor: 'pointer', '&:hover': { opacity: 0.7 } }}>
            <Typography sx={{ fontSize: 13.5, color: 'rgba(17,17,17,0.55)', fontWeight: 500 }}>
              {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
              <Box component="span" sx={{ color: BLACK, fontWeight: 700, textDecoration: 'underline',
                textUnderlineOffset: 3, textDecorationColor: 'rgba(17,17,17,0.3)' }}>
                {isRegistering ? 'Inicia sesión' : 'Regístrate'}
              </Box>
            </Typography>
          </Box>
        </Box>
      </Drawer>

      {/* Modal de términos */}
      <Dialog open={termsModalOpen} onClose={() => {}}
        maxWidth="xs" fullWidth
        slotProps={{
          backdrop: { sx: { bgcolor: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(8px)' } },
          paper: { sx: { borderRadius: '24px', bgcolor: '#FAFAF8', p: 3.5, minHeight: 420,
            display: 'flex', flexDirection: 'column', backgroundImage: 'none',
            animation: `${scaleIn} 0.5s ${SPRING} both`, boxShadow: '0 24px 80px rgba(0,0,0,0.3)' } },
        }}>
        <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase',
          color: 'rgba(17,17,17,0.4)', mb: 1.5 }}>
          Antes de continuar
        </Typography>
        <Typography sx={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.1,
          color: BLACK, fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
          Términos y privacidad
        </Typography>
        <Typography sx={{ mt: 2, fontSize: 14, color: 'rgba(17,17,17,0.6)', lineHeight: 1.55, fontWeight: 500 }}>
          Para crear tu cuenta necesitamos que aceptes nuestros Términos y la Política de Privacidad.
        </Typography>

        <Box sx={{ mt: 'auto', pt: 1 }}>
          <Box onClick={() => setTermsChecked(!termsChecked)}
            sx={{ px: 1.5, py: 1, borderRadius: '12px', border: '1.5px solid',
              borderColor: termsChecked ? BLACK : 'rgba(17,17,17,0.12)',
              bgcolor: termsChecked ? 'white' : 'rgba(255,255,255,0.5)',
              display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer',
              transition: `all 0.25s ${SMOOTH}` }}>
            <Box sx={{ width: 28, height: 28, borderRadius: '7px', border: '1.5px solid',
              borderColor: termsChecked ? BLACK : 'rgba(17,17,17,0.2)',
              bgcolor: termsChecked ? BLACK : 'white', display: 'grid', placeItems: 'center',
              transition: `all 0.25s ${SPRING}` }}>
              {termsChecked && <CheckIcon sx={{ fontSize: 16, color: 'white' }} />}
            </Box>
            <Typography sx={{ fontSize: 10.5, color: 'rgba(17,17,17,0.7)', lineHeight: 1.4, fontWeight: 500 }}>
              He leído y acepto los <Box component="span" sx={{ fontWeight: 700, color: BLACK }}>Términos</Box> y la{' '}
              <Box component="span" sx={{ fontWeight: 700, color: BLACK }}>Política de Privacidad</Box>.
            </Typography>
          </Box>
          <Button fullWidth disabled={!termsChecked} onClick={acceptTerms}
            sx={{ mt: 2, height: 56, borderRadius: '16px', fontWeight: 700, fontSize: 15.5,
              bgcolor: BLACK, color: 'white',
              '&:disabled': { bgcolor: 'rgba(17,17,17,0.06)', color: 'rgba(17,17,17,0.3)' },
              '&:hover': { bgcolor: '#1a1a1a' } }}>
            Aceptar y continuar
          </Button>
          <Box onClick={() => { setTermsModalOpen(false); pendingActionRef.current = null; }}
            sx={{ mt: 2, textAlign: 'center', cursor: 'pointer' }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: 'rgba(17,17,17,0.5)' }}>Cancelar</Typography>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};