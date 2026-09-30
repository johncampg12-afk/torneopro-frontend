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
    <Box sx={{
      minHeight: '100dvh', bgcolor: '#FAFAF8', position: 'relative', overflow: 'hidden',
      opacity: mounted ? 1 : 0, transition: 'opacity 0.4s ease',
    }}>
      <EditorialBackground />

      <Box sx={{
        position: 'relative', zIndex: 1,
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
      }}>

        {/* ═══════════ COLUMNA FORMULARIO ═══════════ */}
        <Box sx={{
          flex: { md: 1 },
          display: 'flex', flexDirection: 'column',
          px: { xs: 2.5, sm: 4, md: 8, lg: 12 },
          pt: { xs: 'calc(24px + env(safe-area-inset-top, 0px))', md: 6 },
          pb: { xs: 'calc(120px + env(safe-area-inset-bottom, 0px))', md: 6 },
          maxWidth: { xs: '100%', md: 640 },
          width: '100%',
          mx: { md: 0 },
        }}>

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
          <Box sx={{ mt: { xs: 3, md: 6 } }}>
            <Typography sx={{
              fontSize: { xs: 32, sm: 38, md: 48, lg: 56 },
              fontWeight: 800, letterSpacing: -0.03, lineHeight: 1.05,
              color: BLACK, fontFamily: '"Instrument Sans", system-ui, sans-serif',
            }}>
              Cuéntanos<br />sobre ti
            </Typography>
            <Typography sx={{ mt: 1.5, fontSize: { xs: 15, md: 17 }, fontWeight: 500, color: 'rgba(0,0,0,0.6)' }}>
              Personalizaremos tu experiencia en TrendSport.
            </Typography>
          </Box>

          {/* Foto (móvil: arriba centrada / desktop: oculta aquí, se muestra en el preview) */}
          <Box sx={{
            display: { xs: 'flex', md: 'none' },
            flexDirection: 'column', alignItems: 'center', mt: 3,
          }}>
            <Box sx={{ position: 'relative' }}>
              <Box sx={{
                width: 96, height: 96, borderRadius: '20px', bgcolor: '#FFFFFF',
                border: '1.5px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', p: 0.5,
              }}>
                <Box sx={{
                  width: '100%', height: '100%', borderRadius: '16px',
                  bgcolor: 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                  backgroundImage: photoPreview ? `url(${photoPreview})` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                }}>
                  {!photoPreview && <CameraAltIcon sx={{ fontSize: 32, color: 'rgba(0,0,0,0.3)' }} />}
                </Box>
              </Box>
              <Box onClick={() => fileRef.current?.click()}
                sx={{
                  position: 'absolute', bottom: -4, right: -4, width: 28, height: 28,
                  borderRadius: '50%', bgcolor: 'black', display: 'grid', placeItems: 'center',
                  color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  '&:active': { transform: 'scale(0.95)' },
                }}>
                <CameraAltIcon sx={{ fontSize: 14 }} />
              </Box>
            </Box>
            <Typography onClick={() => fileRef.current?.click()}
              sx={{ mt: 1.5, fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.6)', cursor: 'pointer' }}>
              {photoPreview ? 'Cambiar foto' : 'Añadir foto de perfil'}
            </Typography>
          </Box>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />

          {/* Formulario */}
          <Box sx={{
            mt: { xs: 3, md: 5 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
            animation: `${fadeInUp} 0.5s ${SMOOTH} both`,
          }}>
            {/* Nombre completo (full width) */}
            <Box sx={{ gridColumn: { md: '1 / -1' } }}>
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
              <Typography sx={labelSx}>Usuario</Typography>
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
                <Typography sx={{ fontSize: 12, color: '#EF4444', mt: 0.5, ml: 0.5 }}>Mínimo 3 caracteres</Typography>
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

          {/* Botón: fixed en móvil, en flujo en desktop */}
          <Box sx={{
            position: { xs: 'fixed', md: 'static' },
            bottom: { xs: 'calc(24px + env(safe-area-inset-bottom, 0px))', md: 'auto' },
            left: { xs: 0, md: 'auto' }, right: { xs: 0, md: 'auto' },
            px: { xs: 2.5, md: 0 },
            mt: { md: 5 },
            maxWidth: { xs: 480, md: '100%' },
            mx: { xs: 'auto', md: 0 },
            zIndex: 2,
            display: { md: 'flex' }, justifyContent: { md: 'flex-start' },
          }}>
            <Button onClick={handleContinue} disabled={!isValid}
              sx={{
                width: { xs: '100%', md: 'auto' },
                minWidth: { md: 240 },
                height: 52, borderRadius: '999px', fontWeight: 700, fontSize: 16,
                bgcolor: isValid ? BLACK : 'rgba(0,0,0,0.06)',
                color: isValid ? 'white' : 'rgba(0,0,0,0.3)',
                boxShadow: isValid ? '0 8px 24px rgba(0,0,0,0.16)' : 'none',
                transition: `all 0.3s ${SMOOTH}`,
                '&:disabled': { bgcolor: 'rgba(0,0,0,0.06)' },
                '&:hover': { bgcolor: isValid ? '#1a1a1a' : 'rgba(0,0,0,0.06)',
                  transform: isValid ? 'translateY(-1px)' : 'none' },
                '&:active': { transform: 'scale(0.98)' },
              }}>
              Continuar
            </Button>
          </Box>
        </Box>

        {/* ═══════════ COLUMNA PREVIEW (solo desktop) ═══════════ */}
        <Box sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          alignItems: 'center', justifyContent: 'center',
          p: { md: 6, lg: 10 },
          position: 'relative',
          borderLeft: '1px solid rgba(17,17,17,0.06)',
        }}>
          <Box sx={{
            width: '100%', maxWidth: 420,
            borderRadius: '28px',
            bgcolor: 'white',
            border: '1px solid rgba(17,17,17,0.06)',
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.15)',
            p: 4,
            animation: `${fadeInUp} 0.9s ${SMOOTH} both 0.2s`,
          }}>
            <Typography sx={{
              fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
              color: 'rgba(17,17,17,0.35)', fontFamily: '"Fragment Mono", monospace', mb: 3,
            }}>
              Vista previa
            </Typography>

            {/* Avatar preview */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
              <Box onClick={() => fileRef.current?.click()}
                sx={{
                  width: 112, height: 112, borderRadius: '28px',
                  bgcolor: 'rgba(17,17,17,0.04)',
                  border: '1px solid rgba(17,17,17,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', cursor: 'pointer',
                  backgroundImage: photoPreview ? `url(${photoPreview})` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  transition: `all 0.3s ${SMOOTH}`,
                  '&:hover': { borderColor: 'rgba(17,17,17,0.2)', transform: 'scale(1.02)' },
                }}>
                {!photoPreview && <CameraAltIcon sx={{ fontSize: 36, color: 'rgba(17,17,17,0.2)' }} />}
              </Box>

              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Typography sx={{
                  fontSize: 22, fontWeight: 800, letterSpacing: -0.5, color: BLACK,
                  fontFamily: '"Instrument Sans", system-ui, sans-serif',
                }}>
                  {fullName.trim() || 'Tu nombre'}
                </Typography>
                <Typography sx={{
                  fontSize: 14, fontWeight: 500, color: 'rgba(17,17,17,0.45)', mt: 0.5,
                  fontFamily: '"Fragment Mono", monospace',
                }}>
                  @{username.trim() || 'usuario'}
                </Typography>
                {city.trim() && (
                  <Typography sx={{
                    fontSize: 13, fontWeight: 500, color: 'rgba(17,17,17,0.4)', mt: 1.5,
                  }}>
                    📍 {city.trim()}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Aviso */}
            <Box sx={{
              mt: 4, pt: 3, borderTop: '1px solid rgba(17,17,17,0.06)',
            }}>
              <Typography sx={{
                fontSize: 12, color: 'rgba(17,17,17,0.45)', lineHeight: 1.5, textAlign: 'center',
              }}>
                Así te verán otros usuarios en los torneos.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};