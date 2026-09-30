import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Stack, keyframes, InputBase } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { EditorialBackground } from '../../components/EditorialBackground';
import { api } from '../../lib/api';
import { SMOOTH, BLACK, SPRING } from '../../theme';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const BasicInfoPage = () => {
  const navigate = useNavigate();
  const { data, setData } = useOnboarding();
  const [mounted, setMounted] = useState(false);

  const [fullName, setFullName] = useState(data.fullName || '');
  const [username, setUsername] = useState(data.username || '');
  const [city, setCity] = useState(data.city || '');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [touched, setTouched] = useState({ fullName: false, username: false, city: false });
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (data.photo) {
      setPhotoPreview(URL.createObjectURL(data.photo));
      setPhotoFile(data.photo);
    }
  }, [data.photo]);

  const isFullNameValid = fullName.trim().length >= 2;
  const isUsernameValid = /^[a-z0-9_.]{3,}$/.test(username.trim());
  const isCityValid = city.trim().length >= 2;
  const isUsernameAvailable = usernameStatus === 'available';
  const isValid = isFullNameValid && isUsernameValid && isCityValid && isUsernameAvailable;

  // Verificar username
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
    setTouched({ fullName: true, username: true, city: true });
    if (!isValid) return;
    setData({ fullName: fullName.trim(), username: username.trim().toLowerCase(), city: city.trim(), photo: photoFile || undefined });
    navigate('/auth');
  };

  const inputBoxSx = (invalid: boolean) => ({
    height: 52, px: 2, borderRadius: '14px', bgcolor: '#FFFFFF',
    border: '1.5px solid', borderColor: invalid ? '#EF4444' : 'rgba(17,17,17,0.06)',
    display: 'flex', alignItems: 'center',
    transition: `border-color 0.25s ${SMOOTH}`,
    '&:focus-within': { borderColor: BLACK },
  });

  const labelSx = {
    fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
    color: 'rgba(17,17,17,0.4)', mb: 1, ml: 0.5,
  } as const;

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: '#FAFAF8', position: 'relative', overflow: 'hidden',
      opacity: mounted ? 1 : 0, transition: 'opacity 0.4s ease' }}>
      <EditorialBackground />

      <Box sx={{ position: 'relative', zIndex: 1, minHeight: '100dvh',
        maxWidth: 480, mx: 'auto', width: '100%',
        display: 'flex', flexDirection: 'column',
        px: 2.5, pt: 'calc(24px + env(safe-area-inset-top, 0px))',
        pb: 'calc(100px + env(safe-area-inset-bottom, 0px))' }}>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button onClick={() => navigate('/welcome')}
            sx={{ minWidth: 32, width: 32, height: 32, borderRadius: '50%', bgcolor: '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.7)',
              display: 'grid', placeItems: 'center', p: 0 }}>
            <ArrowBackIcon sx={{ fontSize: 16 }} />
          </Button>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: BLACK }} />
            <Box sx={{ width: 24, height: 8, borderRadius: 4, bgcolor: BLACK }} />
            <Box sx={{ width: 8, height: 8, borderRadius: 4, bgcolor: 'rgba(0,0,0,0.15)' }} />
          </Stack>

          <Box sx={{ width: 32 }} />
        </Box>

        {/* Título */}
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontSize: { xs: 32, md: 38 }, fontWeight: 800, letterSpacing: -0.03,
            lineHeight: 1.1, color: BLACK, fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
            Cuéntanos<br />sobre ti
          </Typography>
          <Typography sx={{ mt: 1.5, fontSize: 15, fontWeight: 500, color: 'rgba(0,0,0,0.6)' }}>
            Personalizaremos tu experiencia en TrendSport.
          </Typography>
        </Box>

        {/* Foto */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ width: 96, height: 96, borderRadius: '20px', bgcolor: '#FFFFFF',
              border: '1.5px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', p: 0.5 }}>
              <Box sx={{ width: '100%', height: '100%', borderRadius: '16px',
                bgcolor: 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                backgroundImage: photoPreview ? `url(${photoPreview})` : 'none',
                backgroundSize: 'cover', backgroundPosition: 'center' }}>
                {!photoPreview && <CameraAltIcon sx={{ fontSize: 32, color: 'rgba(0,0,0,0.3)' }} />}
              </Box>
            </Box>
            <Box onClick={() => fileRef.current?.click()}
              sx={{ position: 'absolute', bottom: -4, right: -4, width: 28, height: 28,
                borderRadius: '50%', bgcolor: 'black', display: 'grid', placeItems: 'center',
                color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                '&:active': { transform: 'scale(0.95)' } }}>
              <CameraAltIcon sx={{ fontSize: 14 }} />
            </Box>
          </Box>
          <Typography onClick={() => fileRef.current?.click()}
            sx={{ mt: 1.5, fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.6)', cursor: 'pointer' }}>
            {photoPreview ? 'Cambiar foto' : 'Añadir foto de perfil'}
          </Typography>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
        </Box>

        {/* Formulario */}
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2,
          animation: `${fadeInUp} 0.5s ${SMOOTH} both` }}>

          {/* Nombre completo */}
          <Box>
            <Typography sx={labelSx}>Nombre completo</Typography>
            <Box sx={inputBoxSx(touched.fullName && !isFullNameValid)}>
              <InputBase value={fullName}
                onChange={(e) => { setFullName(e.target.value); setTouched(s => ({ ...s, fullName: true })); }}
                placeholder="Alex García"
                sx={{ flex: 1, fontSize: 15, fontWeight: 500, color: 'black' }} />
              {touched.fullName && isFullNameValid && <span style={{ color: BLACK, fontSize: 16 }}>✓</span>}
              {touched.fullName && !isFullNameValid && <span style={{ color: '#EF4444', fontSize: 14 }}>✕</span>}
            </Box>
            {touched.fullName && !isFullNameValid && (
              <Typography sx={{ fontSize: 12, color: '#EF4444', mt: 0.5, ml: 0.5 }}>Mínimo 2 caracteres</Typography>
            )}
          </Box>

          {/* Username */}
          <Box>
            <Typography sx={labelSx}>Nombre de usuario</Typography>
            <Box sx={inputBoxSx(touched.username && (!isUsernameValid || usernameStatus === 'taken'))}>
              <span style={{ color: 'rgba(0,0,0,0.4)', fontWeight: 600, fontSize: 15, marginRight: 4 }}>@</span>
              <InputBase value={username}
                onChange={(e) => { setUsername(e.target.value.toLowerCase().replace(/\s/g, '')); setTouched(s => ({ ...s, username: true })); }}
                placeholder="alex"
                sx={{ flex: 1, fontSize: 15, fontWeight: 500, color: 'black' }} />
              {usernameStatus === 'checking' && <span style={{ fontSize: 12, color: '#6B7280' }}>…</span>}
              {usernameStatus === 'available' && <span style={{ color: BLACK, fontSize: 16 }}>✓</span>}
              {usernameStatus === 'taken' && <span style={{ color: '#EF4444', fontSize: 14 }}>✕</span>}
            </Box>
            {touched.username && !isUsernameValid && (
              <Typography sx={{ fontSize: 12, color: '#EF4444', mt: 0.5, ml: 0.5 }}>Mínimo 3 caracteres (a-z, 0-9, _, .)</Typography>
            )}
            {touched.username && isUsernameValid && usernameStatus === 'taken' && (
              <Typography sx={{ fontSize: 12, color: '#EF4444', mt: 0.5, ml: 0.5 }}>No disponible</Typography>
            )}
          </Box>

          {/* Ciudad */}
          <Box>
            <Typography sx={labelSx}>Ciudad</Typography>
            <Box sx={inputBoxSx(touched.city && !isCityValid)}>
              <InputBase value={city}
                onChange={(e) => { setCity(e.target.value); setTouched(s => ({ ...s, city: true })); }}
                placeholder="Valencia"
                sx={{ flex: 1, fontSize: 15, fontWeight: 500, color: 'black' }} />
              {touched.city && isCityValid && <span style={{ color: BLACK, fontSize: 16 }}>✓</span>}
              {touched.city && !isCityValid && <span style={{ color: '#EF4444', fontSize: 14 }}>✕</span>}
            </Box>
            {touched.city && !isCityValid && (
              <Typography sx={{ fontSize: 12, color: '#EF4444', mt: 0.5, ml: 0.5 }}>Mínimo 2 caracteres</Typography>
            )}
          </Box>
        </Box>

        {/* Botón Continuar fijo abajo */}
        <Box sx={{ position: 'fixed', bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
          left: 0, right: 0, px: 2.5, maxWidth: 480, mx: 'auto', zIndex: 2 }}>
          <Button fullWidth disabled={!isValid} onClick={handleContinue}
            sx={{ height: 52, borderRadius: '999px', fontWeight: 700, fontSize: 16,
              bgcolor: isValid ? BLACK : 'rgba(0,0,0,0.06)',
              color: isValid ? 'white' : 'rgba(0,0,0,0.3)',
              boxShadow: isValid ? '0 8px 24px rgba(0,0,0,0.16)' : 'none',
              transition: `all 0.3s ${SMOOTH}`,
              '&:disabled': { bgcolor: 'rgba(0,0,0,0.06)' },
              '&:hover': { bgcolor: isValid ? '#1a1a1a' : 'rgba(0,0,0,0.06)', transform: isValid ? 'translateY(-1px)' : 'none' },
              '&:active': { transform: 'scale(0.98)' } }}>
            Continuar
          </Button>
        </Box>
      </Box>
    </Box>
  );
};