import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Stack, keyframes, InputBase } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { EditorialBackground } from '../../components/EditorialBackground';
import { api } from '../../lib/api';
import { SMOOTH, BLACK } from '../../theme';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const BasicInfoPage = () => {
  const navigate = useNavigate();
  const { data, setData } = useOnboarding();
  const [mounted, setMounted] = useState(false);

  // Cargar nombre y apellidos separados desde fullName previo
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState(data.username || '');
  const [age, setAge] = useState(data.age || '');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    username: false,
    age: false,
  });
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Hidratar desde el contexto si venimos de una visita anterior
  useEffect(() => {
    if (data.fullName) {
      const parts = data.fullName.trim().split(' ');
      if (parts.length > 1) {
        setLastName(parts.pop() || '');
        setFirstName(parts.join(' '));
      } else {
        setFirstName(parts[0] || '');
      }
    }
    if (data.photo) {
      setPhotoPreview(URL.createObjectURL(data.photo));
      setPhotoFile(data.photo);
    }
  }, [data.fullName, data.photo]);

  const isFirstNameValid = firstName.trim().length >= 2;
  const isLastNameValid = lastName.trim().length >= 2;
  const isUsernameValid = /^[a-z0-9_.]{3,}$/.test(username.trim());
  const isAgeValid = /^\d+$/.test(age) && parseInt(age) >= 13 && parseInt(age) <= 99;
  const isUsernameAvailable = usernameStatus === 'available';
  const isValid = isFirstNameValid && isLastNameValid && isUsernameValid && isAgeValid && isUsernameAvailable;

  useEffect(() => {
    if (!isUsernameValid) { setUsernameStatus('idle'); return; }
    setUsernameStatus('checking');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/users/check-username?username=${encodeURIComponent(username.trim().toLowerCase())}`);
        setUsernameStatus(res.data?.available ? 'available' : 'taken');
      } catch { setUsernameStatus('taken'); }
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [username]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 3_000_000) { alert('Máximo 3 MB'); return; }
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const handleContinue = () => {
    setTouched({ firstName: true, lastName: true, username: true, age: true });
    if (!isValid) return;
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    setData({
      fullName,
      username: username.trim().toLowerCase(),
      age,
      photo: photoFile || undefined,
    });
    navigate('/auth');
  };

  const inputBoxSx = (invalid: boolean) => ({
    height: 52,
    px: 2,
    borderRadius: '14px',
    bgcolor: '#FFFFFF',
    border: '1.5px solid',
    borderColor: invalid ? '#EF4444' : 'rgba(17,17,17,0.06)',
    display: 'flex',
    alignItems: 'center',
    transition: `border-color 0.25s ${SMOOTH}`,
    '&:focus-within': { borderColor: BLACK },
  });

  const labelSx = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(17,17,17,0.4)',
    mb: 1,
    ml: 0.5,
  } as const;

  // Nombre completo para el preview
  const previewFullName = `${firstName.trim()} ${lastName.trim()}`.trim();

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'clip',
        bgcolor: '#FAFAF8',
        position: 'relative',
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <EditorialBackground />
      </Box>

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100dvh',
          width: '100%',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {/* ══════════ COLUMNA FORMULARIO ══════════ */}
        <Box
          sx={{
            flex: { xs: 1, md: '1 1 0%' },
            minWidth: 0,
            maxWidth: { xs: '100%', md: 620 },
            display: 'flex',
            flexDirection: 'column',
            px: { xs: 3, sm: 5, md: 7, lg: 10 },
            pt: { xs: 'calc(24px + env(safe-area-inset-top, 0px))', md: 6 },
            pb: {
              xs: 'calc(120px + env(safe-area-inset-bottom, 0px))',
              md: 6,
            },
          }}
        >
          {/* ── Header ── */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: `${fadeInUp} 0.6s ${SMOOTH} both`,
            }}
          >
            <Button
              onClick={() => navigate('/welcome')}
              sx={{
                minWidth: 40,
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: '#FFFFFF',
                border: '1px solid rgba(17,17,17,0.06)',
                color: 'rgba(17,17,17,0.7)',
                display: 'grid',
                placeItems: 'center',
                p: 0,
                transition: `all 0.2s ${SMOOTH}`,
                '&:hover': { bgcolor: '#FFFFFF', borderColor: 'rgba(17,17,17,0.2)' },
                '&:active': { transform: 'scale(0.94)' },
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </Button>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: BLACK }} />
              <Box sx={{ width: 24, height: 8, borderRadius: 4, bgcolor: BLACK }} />
              <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: 'rgba(17,17,17,0.15)' }} />
            </Stack>

            <Box sx={{ width: 40 }} />
          </Box>

          {/* ── Hero ── */}
          <Box
            sx={{
              mt: { xs: 4, md: 6 },
              animation: `${fadeInUp} 0.7s ${SMOOTH} both 0.1s`,
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: 36, sm: 44, md: 52, lg: 64 },
                lineHeight: 1.02,
                fontWeight: 800,
                letterSpacing: -1.8,
                color: BLACK,
                fontFamily: '"Instrument Sans", system-ui, sans-serif',
              }}
            >
              Cuéntanos<br />sobre ti
            </Typography>
            <Typography
              sx={{
                mt: { xs: 2, md: 2.5 },
                fontSize: { xs: 15, md: 16 },
                fontWeight: 500,
                color: 'rgba(17,17,17,0.55)',
                lineHeight: 1.6,
                maxWidth: 400,
              }}
            >
              Personalizaremos tu experiencia en TrendSport.
            </Typography>
          </Box>

          {/* ── Foto (solo móvil) ── */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              flexDirection: 'column',
              alignItems: 'center',
              mt: 4,
              animation: `${fadeInUp} 0.7s ${SMOOTH} both 0.15s`,
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <Box
                sx={{
                  width: 96,
                  height: 96,
                  borderRadius: '20px',
                  bgcolor: '#FFFFFF',
                  border: '1.5px solid rgba(17,17,17,0.06)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                  p: 0.5,
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '16px',
                    bgcolor: 'rgba(17,17,17,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    backgroundImage: photoPreview ? `url(${photoPreview})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {!photoPreview && <CameraAltIcon sx={{ fontSize: 32, color: 'rgba(17,17,17,0.3)' }} />}
                </Box>
              </Box>
              <Box
                onClick={() => fileRef.current?.click()}
                sx={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: BLACK,
                  display: 'grid',
                  placeItems: 'center',
                  color: 'white',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  '&:active': { transform: 'scale(0.95)' },
                }}
              >
                <CameraAltIcon sx={{ fontSize: 14 }} />
              </Box>
            </Box>
            <Typography
              onClick={() => fileRef.current?.click()}
              sx={{
                mt: 1.5,
                fontSize: 13,
                fontWeight: 600,
                color: 'rgba(17,17,17,0.6)',
                cursor: 'pointer',
              }}
            >
              {photoPreview ? 'Cambiar foto' : 'Añadir foto de perfil'}
            </Typography>
          </Box>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />

          {/* ── Formulario ── */}
          <Box
            sx={{
              mt: { xs: 4, md: 5 },
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2.5,
              animation: `${fadeInUp} 0.6s ${SMOOTH} both 0.25s`,
            }}
          >
            {/* Nombre */}
            <Box>
              <Typography sx={labelSx}>Nombre</Typography>
              <Box sx={inputBoxSx(touched.firstName && !isFirstNameValid)}>
                <InputBase
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setTouched(s => ({ ...s, firstName: true }));
                  }}
                  placeholder="Alex"
                  sx={{ flex: 1, fontSize: 15, fontWeight: 500, color: BLACK }}
                />
                {touched.firstName && isFirstNameValid && (
                  <span style={{ color: BLACK, fontSize: 16 }}>✓</span>
                )}
                {touched.firstName && !isFirstNameValid && (
                  <span style={{ color: '#EF4444', fontSize: 14 }}>✕</span>
                )}
              </Box>
              {touched.firstName && !isFirstNameValid && (
                <Typography sx={{ fontSize: 12, color: '#EF4444', mt: 0.5, ml: 0.5 }}>
                  Mínimo 2 caracteres
                </Typography>
              )}
            </Box>

            {/* Apellidos */}
            <Box>
              <Typography sx={labelSx}>Apellidos</Typography>
              <Box sx={inputBoxSx(touched.lastName && !isLastNameValid)}>
                <InputBase
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setTouched(s => ({ ...s, lastName: true }));
                  }}
                  placeholder="García"
                  sx={{ flex: 1, fontSize: 15, fontWeight: 500, color: BLACK }}
                />
                {touched.lastName && isLastNameValid && (
                  <span style={{ color: BLACK, fontSize: 16 }}>✓</span>
                )}
                {touched.lastName && !isLastNameValid && (
                  <span style={{ color: '#EF4444', fontSize: 14 }}>✕</span>
                )}
              </Box>
              {touched.lastName && !isLastNameValid && (
                <Typography sx={{ fontSize: 12, color: '#EF4444', mt: 0.5, ml: 0.5 }}>
                  Mínimo 2 caracteres
                </Typography>
              )}
            </Box>

            {/* Usuario */}
            <Box>
              <Typography sx={labelSx}>Usuario</Typography>
              <Box sx={inputBoxSx(touched.username && (!isUsernameValid || usernameStatus === 'taken'))}>
                <span
                  style={{
                    color: 'rgba(17,17,17,0.4)',
                    fontWeight: 600,
                    fontSize: 15,
                    marginRight: 4,
                  }}
                >
                  @
                </span>
                <InputBase
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase().replace(/\s/g, ''));
                    setTouched(s => ({ ...s, username: true }));
                  }}
                  placeholder="alex"
                  sx={{ flex: 1, fontSize: 15, fontWeight: 500, color: BLACK }}
                />
                {usernameStatus === 'checking' && (
                  <span style={{ fontSize: 12, color: '#6B7280' }}>…</span>
                )}
                {usernameStatus === 'available' && (
                  <span style={{ color: BLACK, fontSize: 16 }}>✓</span>
                )}
                {usernameStatus === 'taken' && (
                  <span style={{ color: '#EF4444', fontSize: 14 }}>✕</span>
                )}
              </Box>
              {touched.username && !isUsernameValid && (
                <Typography sx={{ fontSize: 12, color: '#EF4444', mt: 0.5, ml: 0.5 }}>
                  Mínimo 3 caracteres
                </Typography>
              )}
              {touched.username && isUsernameValid && usernameStatus === 'taken' && (
                <Typography sx={{ fontSize: 12, color: '#EF4444', mt: 0.5, ml: 0.5 }}>
                  No disponible
                </Typography>
              )}
            </Box>

            {/* Edad */}
            <Box>
              <Typography sx={labelSx}>Edad</Typography>
              <Box sx={inputBoxSx(touched.age && !isAgeValid)}>
                <InputBase
                  value={age}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 2);
                    setAge(v);
                    setTouched(s => ({ ...s, age: true }));
                  }}
                  placeholder="24"
                  inputProps={{ inputMode: 'numeric' }}
                  sx={{ flex: 1, fontSize: 15, fontWeight: 500, color: BLACK }}
                />
                {touched.age && isAgeValid && (
                  <span style={{ color: BLACK, fontSize: 16 }}>✓</span>
                )}
                {touched.age && !isAgeValid && (
                  <span style={{ color: '#EF4444', fontSize: 14 }}>✕</span>
                )}
              </Box>
              {touched.age && !isAgeValid && (
                <Typography sx={{ fontSize: 12, color: '#EF4444', mt: 0.5, ml: 0.5 }}>
                  Entre 13 y 99 años
                </Typography>
              )}
            </Box>
          </Box>

          {/* ── Botón Continuar ── */}
          <Box
            sx={{
              position: { xs: 'fixed', md: 'static' },
              bottom: { xs: 'calc(24px + env(safe-area-inset-bottom, 0px))', md: 'auto' },
              left: { xs: 0, md: 'auto' },
              right: { xs: 0, md: 'auto' },
              px: { xs: 3, md: 0 },
              mt: { md: 5 },
              maxWidth: { xs: 620, md: '100%' },
              mx: { xs: 'auto', md: 0 },
              zIndex: 2,
              display: { md: 'flex' },
              justifyContent: { md: 'flex-start' },
            }}
          >
            <Button
              onClick={handleContinue}
              disabled={!isValid}
              sx={{
                width: { xs: '100%', md: 'auto' },
                minWidth: { md: 200 },
                height: 52,
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: -0.01,
                bgcolor: isValid ? BLACK : 'rgba(17,17,17,0.06)',
                color: isValid ? 'white' : 'rgba(17,17,17,0.3)',
                boxShadow: isValid ? '0 8px 24px rgba(17,17,17,0.16)' : 'none',
                transition: `all 0.3s ${SMOOTH}`,
                '&:disabled': { bgcolor: 'rgba(17,17,17,0.06)' },
                '&:hover': {
                  bgcolor: isValid ? '#1a1a1a' : 'rgba(17,17,17,0.06)',
                  transform: isValid ? 'translateY(-1px)' : 'none',
                  boxShadow: isValid ? '0 12px 32px rgba(17,17,17,0.25)' : 'none',
                },
                '&:active': { transform: 'scale(0.985)' },
              }}
            >
              Continuar
            </Button>
          </Box>
        </Box>

        {/* ══════════ COLUMNA PREVIEW (desktop) ══════════ */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flex: '1 1 0%',
            minWidth: 0,
            alignItems: 'center',
            justifyContent: 'center',
            p: { md: 6, lg: 8 },
            position: 'relative',
            borderLeft: '1px solid rgba(17,17,17,0.06)',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 420,
              borderRadius: '28px',
              bgcolor: 'white',
              border: '1px solid rgba(17,17,17,0.06)',
              boxShadow: '0 40px 80px -20px rgba(0,0,0,0.15)',
              p: 4,
              animation: `${fadeInUp} 0.9s ${SMOOTH} both 0.2s`,
            }}
          >
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: 'rgba(17,17,17,0.35)',
                fontFamily: '"Fragment Mono", monospace',
                mb: 3,
              }}
            >
              Vista previa
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                py: 1.5,
              }}
            >
              <Box
                onClick={() => fileRef.current?.click()}
                sx={{
                  width: 112,
                  height: 112,
                  borderRadius: '28px',
                  bgcolor: 'rgba(17,17,17,0.04)',
                  border: '1px solid rgba(17,17,17,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  backgroundImage: photoPreview ? `url(${photoPreview})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transition: `all 0.3s ${SMOOTH}`,
                  '&:hover': {
                    borderColor: 'rgba(17,17,17,0.2)',
                    transform: 'scale(1.02)',
                  },
                }}
              >
                {!photoPreview && (
                  <CameraAltIcon sx={{ fontSize: 36, color: 'rgba(17,17,17,0.2)' }} />
                )}
              </Box>

              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 800,
                    letterSpacing: -0.5,
                    color: BLACK,
                    fontFamily: '"Instrument Sans", system-ui, sans-serif',
                  }}
                >
                  {previewFullName || 'Tu nombre'}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'rgba(17,17,17,0.45)',
                    mt: 0.5,
                    fontFamily: '"Fragment Mono", monospace',
                  }}
                >
                  @{username.trim() || 'usuario'}
                </Typography>
                {age && (
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'rgba(17,17,17,0.4)',
                      mt: 1.5,
                    }}
                  >
                    {age} años
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(17,17,17,0.06)' }}>
              <Typography
                sx={{
                  fontSize: 12,
                  color: 'rgba(17,17,17,0.45)',
                  lineHeight: 1.5,
                  textAlign: 'center',
                }}
              >
                Así te verán otros usuarios en los torneos.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};