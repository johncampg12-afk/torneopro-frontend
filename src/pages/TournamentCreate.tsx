import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Stack, keyframes, TextField, Checkbox,
  IconButton, Drawer, useMediaQuery,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import LayersIcon from '@mui/icons-material/Layers';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { EditorialBackground } from '../components/EditorialBackground';
import { SMOOTH, BLACK } from '../theme';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const formats = [
  { id: 'liga', name: 'Liga', desc: 'Todos contra todos. Tabla automática.', Icon: ListAltIcon },
  { id: 'eliminatoria', name: 'Eliminación', desc: 'Bracket. El que pierde queda fuera.', Icon: AccountTreeIcon },
  { id: 'grupos', name: 'Grupos + Elim.', desc: 'Fase de grupos y luego cruces.', Icon: LayersIcon },
  { id: 'dos-ligas', name: '2 Ligas + Elim.', desc: 'Dos ligas separadas y eliminatoria cruzada.', Icon: CallSplitIcon },
];

const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1'];

const steps = [
  { n: 1, label: 'Info' },
  { n: 2, label: 'Equipos' },
  { n: 3, label: 'Resumen' },
];

export default function TournamentCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 900px)');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    name: '',
    format: 'liga',
    doubleRound: false,
    description: '',
    startDate: '',
    location: '',
    isPublic: true,
  });

  const [teams, setTeams] = useState([
    { name: '', color: colors[0], logo: null as string | null },
  ]);

  const [importTemplates, setImportTemplates] = useState<Record<string, string>>({});
  const [templatesDrawer, setTemplatesDrawer] = useState(false);
  const [userTemplates, setUserTemplates] = useState<any[]>([]);

  useEffect(() => {
    if (!user) navigate('/welcome');
  }, [user, navigate]);

  useEffect(() => {
    if (templatesDrawer) {
      api.get('/team-templates')
        .then(res => setUserTemplates(res.data))
        .catch(() => {});
    }
  }, [templatesDrawer]);

  const addTeam = () =>
    setTeams([...teams, { name: '', color: colors[teams.length % colors.length], logo: null }]);

  const updateTeam = (idx: number, field: string, value: string | null) => {
    const updated = [...teams];
    updated[idx] = { ...updated[idx], [field]: value };
    setTeams(updated);
  };

  const removeTeam = (idx: number) => {
    if (teams.length > 2) {
      const updated = teams.filter((_, i) => i !== idx);
      // Recalcular índice de plantillas (índices cambian)
      const newImport: Record<string, string> = {};
      Object.entries(importTemplates).forEach(([k, v]) => {
        const ki = parseInt(k);
        if (ki < idx) newImport[ki] = v;
        else if (ki > idx) newImport[ki - 1] = v;
      });
      setImportTemplates(newImport);
      setTeams(updated);
    }
  };

  const handleLogoChange = (idx: number, file: File) => {
    if (!file) return;
    if (file.size > 200000) { alert('La imagen no debe superar los 200 KB.'); return; }
    const reader = new FileReader();
    reader.onload = () => updateTeam(idx, 'logo', reader.result as string);
    reader.readAsDataURL(file);
  };

  const canContinueStep1 = data.name.trim().length > 0;
  const validTeamsCount = teams.filter(t => t.name.trim()).length;
  const canContinueStep2 = validTeamsCount >= 2;

  const handleCreate = async () => {
    const validTeams = teams
      .filter(t => t.name.trim())
      .map(t => ({ name: t.name.trim(), color: t.color, logo: t.logo || null }));

    if (validTeams.length < 2) return alert('Mínimo 2 equipos');
    if (!data.name.trim()) return alert('Nombre del torneo requerido');

    setLoading(true);
    try {
      const res = await api.post('/tournaments', {
        ...data,
        sport: 'futbol',
        teams: validTeams,
      });
      const created = res.data;

      // Importar jugadores de plantillas
      for (const [indexStr, templateId] of Object.entries(importTemplates)) {
        const teamIndex = parseInt(indexStr);
        if (teamIndex < created.teams.length) {
          try {
            await api.post(`/team-templates/${templateId}/import-to-team/${created.teams[teamIndex].id}`);
          } catch {}
        }
      }

      navigate(`/tournaments/${created.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear torneo');
    } finally {
      setLoading(false);
    }
  };

  // ── Inputs comunes ──
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '14px',
      bgcolor: 'white',
      minHeight: 52,
      '& fieldset': { borderColor: 'rgba(17,17,17,0.08)', borderWidth: '1.5px' },
      '&:hover fieldset': { borderColor: 'rgba(17,17,17,0.2)' },
      '&.Mui-focused fieldset': { borderColor: BLACK, borderWidth: '1.5px' },
    },
    '& input, & textarea': { fontSize: 15, fontWeight: 500, color: BLACK },
    '& input::placeholder, & textarea::placeholder': { color: 'rgba(17,17,17,0.3)', opacity: 1 },
  } as const;

  const labelSx = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
    color: 'rgba(17,17,17,0.45)',
    mb: 1,
    ml: 0.5,
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'clip',
        bgcolor: '#FAFAF8',
        position: 'relative',
      }}
    >
      {/* Fondo editorial solo en móvil para no competir con el contenido denso en desktop */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0, display: { md: 'none' } }}>
        <EditorialBackground />
      </Box>

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 720,
          mx: 'auto',
          width: '100%',
          px: { xs: 3, sm: 4, md: 0 },
          pt: { xs: 'calc(20px + env(safe-area-inset-top, 0px))', md: 5 },
          pb: { xs: 'calc(120px + env(safe-area-inset-bottom, 0px))', md: 5 },
        }}
      >
        {/* ── Header ── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            mb: 4,
            animation: `${fadeInUp} 0.5s ${SMOOTH} both`,
          }}
        >
          <IconButton
            onClick={() => navigate('/dashboard')}
            sx={{
              width: 40, height: 40,
              bgcolor: 'white',
              border: '1px solid rgba(17,17,17,0.06)',
              color: 'rgba(17,17,17,0.7)',
              '&:hover': { bgcolor: 'white', borderColor: 'rgba(17,17,17,0.2)' },
              '&:active': { transform: 'scale(0.94)' },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {steps.map((s, i) => (
              <Box key={s.n} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: step === s.n ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: step >= s.n ? BLACK : 'rgba(17,17,17,0.15)',
                    transition: `all 0.3s ${SMOOTH}`,
                  }}
                />
                {i < steps.length - 1 && step > s.n && (
                  <Box sx={{ width: 8, height: 1, bgcolor: BLACK }} />
                )}
              </Box>
            ))}
          </Box>

          <Box sx={{ width: 40 }} />
        </Box>

        {/* ── Hero ── */}
        <Box sx={{ mb: 5, animation: `${fadeInUp} 0.6s ${SMOOTH} both 0.05s` }}>
          <Typography
            sx={{
              fontSize: { xs: 32, sm: 38, md: 44 },
              fontWeight: 800,
              letterSpacing: -1.4,
              lineHeight: 1.05,
              color: BLACK,
              fontFamily: '"Instrument Sans", system-ui, sans-serif',
            }}
          >
            {step === 1 && <>Nuevo<br />torneo</>}
            {step === 2 && <>Añade<br />los equipos</>}
            {step === 3 && <>Todo<br />listo</>}
          </Typography>
          <Typography sx={{ mt: 1.5, fontSize: 15, fontWeight: 500, color: 'rgba(17,17,17,0.55)' }}>
            {step === 1 && 'Configura lo básico del campeonato.'}
            {step === 2 && `Mínimo 2 equipos. Ahora llevas ${validTeamsCount}.`}
            {step === 3 && 'Revisa antes de crearlo.'}
          </Typography>
        </Box>

        {/* ═══════ PASO 1: Info ═══════ */}
        {step === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, animation: `${fadeInUp} 0.5s ${SMOOTH} both 0.1s` }}>
            <Box>
              <Typography sx={labelSx}>Nombre del torneo *</Typography>
              <TextField
                fullWidth
                value={data.name}
                onChange={e => setData({ ...data, name: e.target.value })}
                placeholder="Liga de Verano 2026"
                autoFocus
                sx={inputSx}
              />
            </Box>

            <Box>
              <Typography sx={labelSx}>Formato</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
                {formats.map(f => {
                  const selected = data.format === f.id;
                  const Icon = f.Icon;
                  return (
                    <Box
                      key={f.id}
                      onClick={() => setData({ ...data, format: f.id })}
                      sx={{
                        p: 2.5,
                        borderRadius: '18px',
                        bgcolor: selected ? BLACK : 'white',
                        border: '1.5px solid',
                        borderColor: selected ? BLACK : 'rgba(17,17,17,0.08)',
                        cursor: 'pointer',
                        transition: `all 0.25s ${SMOOTH}`,
                        '&:hover': {
                          borderColor: selected ? BLACK : 'rgba(17,17,17,0.25)',
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      <Icon sx={{ fontSize: 22, color: selected ? 'white' : 'rgba(17,17,17,0.5)', mb: 1.5 }} />
                      <Typography
                        sx={{
                          fontSize: 14.5,
                          fontWeight: 700,
                          color: selected ? 'white' : BLACK,
                          mb: 0.5,
                          fontFamily: '"Instrument Sans", system-ui, sans-serif',
                        }}
                      >
                        {f.name}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: selected ? 'rgba(255,255,255,0.6)' : 'rgba(17,17,17,0.45)', lineHeight: 1.4 }}>
                        {f.desc}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {(data.format === 'liga' || data.format === 'dos-ligas') && (
              <Box
                onClick={() => setData({ ...data, doubleRound: !data.doubleRound })}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 2, p: 2,
                  borderRadius: '14px', bgcolor: 'white',
                  border: '1.5px solid', borderColor: 'rgba(17,17,17,0.08)',
                  cursor: 'pointer',
                  transition: `all 0.2s ${SMOOTH}`,
                  '&:hover': { borderColor: 'rgba(17,17,17,0.2)' },
                }}
              >
                <Checkbox
                  checked={data.doubleRound}
                  onChange={e => setData({ ...data, doubleRound: e.target.checked })}
                  sx={{
                    p: 0,
                    '& .MuiSvgIcon-root': { fontSize: 22, color: 'rgba(17,17,17,0.15)' },
                    '&.Mui-checked .MuiSvgIcon-root': { color: BLACK },
                  }}
                />
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: BLACK }}>
                    Ida y vuelta
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: 'rgba(17,17,17,0.5)' }}>
                    {data.format === 'dos-ligas'
                      ? 'Cada liga juega todos contra todos dos veces'
                      : 'Cada equipo juega contra todos dos veces'}
                  </Typography>
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography sx={labelSx}>Fecha de inicio</Typography>
                <TextField
                  fullWidth
                  type="date"
                  value={data.startDate}
                  onChange={e => setData({ ...data, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={inputSx}
                />
              </Box>
              <Box>
                <Typography sx={labelSx}>Ubicación</Typography>
                <TextField
                  fullWidth
                  value={data.location}
                  onChange={e => setData({ ...data, location: e.target.value })}
                  placeholder="Cancha Municipal"
                  sx={inputSx}
                />
              </Box>
            </Box>

            <Box>
              <Typography sx={labelSx}>Descripción (opcional)</Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={data.description}
                onChange={e => setData({ ...data, description: e.target.value })}
                placeholder="Torneo entre amigos del barrio"
                sx={inputSx}
              />
            </Box>

            <Box
              onClick={() => setData({ ...data, isPublic: !data.isPublic })}
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                p: 2, borderRadius: '14px', bgcolor: 'white',
                border: '1.5px solid rgba(17,17,17,0.08)',
                cursor: 'pointer',
                transition: `all 0.2s ${SMOOTH}`,
                '&:hover': { borderColor: 'rgba(17,17,17,0.2)' },
              }}
            >
              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: BLACK }}>
                  Torneo público
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'rgba(17,17,17,0.5)' }}>
                  Cualquiera con el enlace podrá verlo
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 44, height: 26, borderRadius: 13,
                  bgcolor: data.isPublic ? BLACK : 'rgba(17,17,17,0.15)',
                  position: 'relative',
                  transition: `all 0.3s ${SMOOTH}`,
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 3, left: data.isPublic ? 21 : 3,
                    width: 20, height: 20, borderRadius: '50%',
                    bgcolor: 'white',
                    transition: `all 0.3s ${SMOOTH}`,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* ═══════ PASO 2: Equipos ═══════ */}
        {step === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, animation: `${fadeInUp} 0.5s ${SMOOTH} both` }}>
            {/* Acciones */}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                onClick={async () => {
                  try {
                    const res = await api.get('/team-templates');
                    if (res.data.length === 0) {
                      alert('No tienes plantillas guardadas. Guarda un equipo desde un torneo primero.');
                      return;
                    }
                    setTemplatesDrawer(true);
                  } catch { alert('Error al cargar plantillas'); }
                }}
                startIcon={<FolderOpenIcon sx={{ fontSize: 18 }} />}
                sx={{
                  height: 40, borderRadius: '999px', px: 2.5,
                  fontWeight: 600, fontSize: 13.5, color: BLACK,
                  border: '1.5px solid rgba(17,17,17,0.1)',
                  '&:hover': { borderColor: 'rgba(17,17,17,0.3)', bgcolor: 'transparent' },
                }}
              >
                Cargar plantilla
              </Button>
            </Box>

            {/* Lista */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {teams.map((team, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 2,
                    borderRadius: '18px',
                    bgcolor: 'white',
                    border: '1.5px solid rgba(17,17,17,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {team.logo ? (
                      <Box
                        component="img"
                        src={team.logo}
                        alt=""
                        sx={{
                          width: 48, height: 48,
                          borderRadius: '14px',
                          objectFit: 'cover',
                          border: '1px solid rgba(17,17,17,0.06)',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 48, height: 48,
                          borderRadius: '14px',
                          bgcolor: team.color,
                          display: 'grid', placeItems: 'center',
                          color: 'white', fontWeight: 800, fontSize: 20,
                          fontFamily: '"Instrument Sans", system-ui, sans-serif',
                          flexShrink: 0,
                        }}
                      >
                        {team.name.trim() ? team.name.trim()[0].toUpperCase() : '?'}
                      </Box>
                    )}

                    <TextField
                      value={team.name}
                      onChange={e => updateTeam(idx, 'name', e.target.value)}
                      placeholder={`Equipo ${idx + 1}`}
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px', bgcolor: 'transparent',
                          '& fieldset': { borderColor: 'transparent' },
                          '&:hover fieldset': { borderColor: 'transparent' },
                          '&.Mui-focused fieldset': { borderColor: 'rgba(17,17,17,0.15)' },
                        },
                        '& input': { fontSize: 15, fontWeight: 600, color: BLACK, px: 1, py: 0.5 },
                      }}
                    />

                    {teams.length > 2 && (
                      <IconButton
                        onClick={() => removeTeam(idx)}
                        size="small"
                        sx={{
                          color: 'rgba(17,17,17,0.35)',
                          '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' },
                        }}
                      >
                        <DeleteOutlinedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    )}
                  </Box>

                  {/* Colores + Escudo */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                      {colors.slice(0, 8).map(c => (
                        <Box
                          key={c}
                          onClick={() => updateTeam(idx, 'color', c)}
                          sx={{
                            width: 24, height: 24, borderRadius: '50%',
                            bgcolor: c, cursor: 'pointer',
                            border: team.color === c ? '2px solid white' : '2px solid transparent',
                            boxShadow: team.color === c ? `0 0 0 2px ${BLACK}` : 'none',
                            transition: `all 0.15s ${SMOOTH}`,
                            '&:hover': { transform: 'scale(1.1)' },
                          }}
                        />
                      ))}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input
                        type="file"
                        accept="image/*"
                        id={`logo-${idx}`}
                        hidden
                        onChange={e => { if (e.target.files?.[0]) handleLogoChange(idx, e.target.files[0]); }}
                      />
                      <Box
                        component="label"
                        htmlFor={`logo-${idx}`}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 0.75,
                          px: 1.5, py: 0.75, borderRadius: '999px',
                          cursor: 'pointer',
                          fontSize: 12.5, fontWeight: 600,
                          color: 'rgba(17,17,17,0.6)',
                          transition: `all 0.2s ${SMOOTH}`,
                          '&:hover': { bgcolor: 'rgba(17,17,17,0.04)', color: BLACK },
                        }}
                      >
                        <ImageOutlinedIcon sx={{ fontSize: 16 }} />
                        {team.logo ? 'Cambiar escudo' : 'Añadir escudo'}
                      </Box>
                      {team.logo && (
                        <IconButton
                          onClick={() => updateTeam(idx, 'logo', null)}
                          size="small"
                          sx={{ color: 'rgba(17,17,17,0.35)' }}
                        >
                          <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>

            <Button
              onClick={addTeam}
              startIcon={<AddIcon />}
              sx={{
                height: 48,
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: 14,
                color: BLACK,
                bgcolor: 'white',
                border: '1.5px dashed rgba(17,17,17,0.15)',
                '&:hover': { borderColor: 'rgba(17,17,17,0.35)', bgcolor: 'white' },
              }}
            >
              Añadir equipo
            </Button>
          </Box>
        )}

        {/* ═══════ PASO 3: Resumen ═══════ */}
        {step === 3 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, animation: `${fadeInUp} 0.5s ${SMOOTH} both` }}>
            <Box
              sx={{
                p: 3,
                borderRadius: '20px',
                bgcolor: 'white',
                border: '1.5px solid rgba(17,17,17,0.08)',
              }}
            >
              {[
                ['Nombre', data.name],
                ['Formato', `${formats.find(f => f.id === data.format)?.name}${(data.format === 'liga' || data.format === 'dos-ligas') && data.doubleRound ? ' · Ida y vuelta' : ''}`],
                ...(data.startDate ? [['Inicio', new Date(data.startDate).toLocaleDateString('es-ES')]] : []),
                ...(data.location ? [['Ubicación', data.location]] : []),
                ['Visibilidad', data.isPublic ? 'Público' : 'Privado'],
              ].map(([label, value], i, arr) => (
                <Box
                  key={label}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    py: 1.75,
                    borderBottom: i < arr.length - 1 ? '1px solid rgba(17,17,17,0.06)' : 'none',
                  }}
                >
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'rgba(17,17,17,0.45)' }}>
                    {label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: BLACK,
                      textAlign: 'right',
                      maxWidth: '60%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box>
              <Typography sx={{ ...labelSx, ml: 0 }}>
                Equipos ({validTeamsCount})
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                {teams.filter(t => t.name.trim()).map((team, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.25,
                      p: 1.25,
                      borderRadius: '12px',
                      bgcolor: 'white',
                      border: '1px solid rgba(17,17,17,0.06)',
                      minWidth: 0,
                    }}
                  >
                    {team.logo ? (
                      <Box
                        component="img"
                        src={team.logo}
                        sx={{ width: 28, height: 28, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 28, height: 28, borderRadius: '8px',
                          bgcolor: team.color, flexShrink: 0,
                        }}
                      />
                    )}
                    <Typography
                      sx={{
                        fontSize: 13, fontWeight: 600, color: BLACK,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}
                    >
                      {team.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* ── Navegación inferior ── */}
        <Box
          sx={{
            position: { xs: 'fixed', md: 'sticky' },
            bottom: { xs: 'calc(16px + env(safe-area-inset-bottom, 0px))', md: 'auto' },
            left: { xs: 0, md: 'auto' },
            right: { xs: 0, md: 'auto' },
            px: { xs: 3, md: 0 },
            mt: { md: 5 },
            maxWidth: { xs: 720, md: '100%' },
            mx: { xs: 'auto', md: 0 },
            zIndex: 2,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {step > 1 ? (
            <Button
              onClick={() => setStep(step - 1)}
              sx={{
                height: 52,
                borderRadius: '999px',
                px: 3,
                fontWeight: 700,
                fontSize: 14.5,
                color: BLACK,
                bgcolor: 'white',
                border: '1.5px solid rgba(17,17,17,0.1)',
                '&:hover': { borderColor: 'rgba(17,17,17,0.3)', bgcolor: 'white' },
              }}
            >
              Atrás
            </Button>
          ) : (
            <Box />
          )}

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={(step === 1 && !canContinueStep1) || (step === 2 && !canContinueStep2)}
              sx={{
                height: 52,
                borderRadius: '999px',
                px: 3.5,
                fontWeight: 700,
                fontSize: 14.5,
                bgcolor: BLACK,
                color: 'white',
                boxShadow: '0 8px 24px rgba(17,17,17,0.15)',
                '&:disabled': {
                  bgcolor: 'rgba(17,17,17,0.06)',
                  color: 'rgba(17,17,17,0.3)',
                  boxShadow: 'none',
                },
                '&:hover': { bgcolor: '#1a1a1a', transform: 'translateY(-1px)' },
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              Continuar
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={loading}
              sx={{
                height: 52,
                borderRadius: '999px',
                px: 3.5,
                fontWeight: 700,
                fontSize: 14.5,
                bgcolor: BLACK,
                color: 'white',
                boxShadow: '0 8px 24px rgba(17,17,17,0.15)',
                '&:disabled': { bgcolor: 'rgba(17,17,17,0.06)', color: 'rgba(17,17,17,0.3)' },
                '&:hover': { bgcolor: '#1a1a1a', transform: 'translateY(-1px)' },
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              {loading ? 'Creando…' : 'Crear torneo'}
            </Button>
          )}
        </Box>
      </Box>

      {/* ═══════ Drawer de plantillas ═══════ */}
      <Drawer
        anchor={isDesktop ? 'right' : 'bottom'}
        open={templatesDrawer}
        onClose={() => setTemplatesDrawer(false)}
        slotProps={{
          backdrop: { sx: { bgcolor: 'rgba(10,10,10,0.5)', backdropFilter: 'blur(6px)' } },
          paper: {
            sx: {
              bgcolor: '#FAFAF8',
              backgroundImage: 'none',
              width: { md: 420 },
              maxHeight: { xs: '85dvh', md: '100dvh' },
              borderTopLeftRadius: { xs: '28px', md: 0 },
              borderTopRightRadius: { xs: '28px', md: 0 },
              boxShadow: '0 -20px 60px rgba(0,0,0,0.18)',
            },
          },
        }}
      >
        <Box sx={{ p: 3, pt: 3, pb: 'calc(28px + env(safe-area-inset-bottom, 0px))' }}>
          {!isDesktop && (
            <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: 'rgba(17,17,17,0.14)', mx: 'auto', mb: 3 }} />
          )}
          <Typography
            sx={{
              fontSize: 11, fontWeight: 700, letterSpacing: 1.4,
              textTransform: 'uppercase', color: 'rgba(17,17,17,0.4)', mb: 1.5,
            }}
          >
            Tus plantillas
          </Typography>
          <Typography
            sx={{
              fontSize: 22, fontWeight: 800, letterSpacing: -0.6,
              lineHeight: 1.15, color: BLACK,
              fontFamily: '"Instrument Sans", system-ui, sans-serif', mb: 3,
            }}
          >
            Elige un equipo
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {userTemplates.map(template => (
              <Box
                key={template.id}
                onClick={() => {
                  const newIndex = teams.length;
                  setTeams([...teams, {
                    name: template.name,
                    color: template.color || colors[newIndex % colors.length],
                    logo: template.logo || null,
                  }]);
                  setImportTemplates(prev => ({ ...prev, [newIndex]: template.id }));
                  setTemplatesDrawer(false);
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: '14px',
                  bgcolor: 'white',
                  border: '1.5px solid rgba(17,17,17,0.06)',
                  cursor: 'pointer',
                  transition: `all 0.2s ${SMOOTH}`,
                  '&:hover': {
                    borderColor: 'rgba(17,17,17,0.2)',
                    transform: 'translateX(2px)',
                  },
                }}
              >
                {template.logo ? (
                  <Box
                    component="img"
                    src={template.logo}
                    sx={{ width: 44, height: 44, borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 44, height: 44, borderRadius: '12px',
                      bgcolor: template.color || BLACK,
                      display: 'grid', placeItems: 'center',
                      color: 'white', fontWeight: 800, fontSize: 18,
                      fontFamily: '"Instrument Sans", system-ui, sans-serif',
                      flexShrink: 0,
                    }}
                  >
                    {template.name?.[0]?.toUpperCase()}
                  </Box>
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: 15, fontWeight: 700, color: BLACK,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                  >
                    {template.name}
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, color: 'rgba(17,17,17,0.5)', mt: 0.25 }}>
                    {template.players?.length || 0} jugadores
                  </Typography>
                </Box>
                <AddIcon sx={{ fontSize: 20, color: 'rgba(17,17,17,0.4)' }} />
              </Box>
            ))}
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}