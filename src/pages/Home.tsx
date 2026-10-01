import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Chip, Skeleton, keyframes,
} from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GroupsIcon from '@mui/icons-material/Groups';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { SMOOTH, BLACK } from '../theme';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const marquee = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const MAX_WIDTH = 1280;

const sponsors = [
  {
    id: 1,
    name: 'Dental Fresh Plus',
    tier: 'Principal',
    size: '970x250',
    image: '/sponsors/dental-fresh-plus-hrz.jpeg',
    cta: 'Reservar cita',
    link: '#',
    title: 'Tu sonrisa,\nnuestra victoria.',
    description: 'Revisión gratuita para jugadores de TrendSport este mes. Clínica oficial del torneo.',
  },
  {
    id: 2,
    name: 'Trend Sport',
    tier: 'Oficial',
    size: '300x250',
    image: '/sponsors/trend-sport-hrz.png',
    cta: 'Ver colección',
    link: '#',
    title: 'Trend Sport',
    description: 'Atrévete a vestir diferente.',
  },
  {
    id: 3,
    name: 'Emprende Conmigo',
    tier: 'Colaborador',
    size: '300x250',
    image: '/sponsors/EMPRENDE-CONMIGO-TREND-SPORT.png',
    cta: 'Apuntarme',
    link: '#',
    title: 'Emprende',
    description: 'Descubre nuevas oportunidades.',
  },
];

const formatName = (f: string) =>
  ({ liga: 'Liga', eliminatoria: 'Eliminación Directa', grupos: 'Grupos + Eliminatoria' }[f] || f);

// ── Slot publicitario reutilizable ──
function AdSlot({
  label,
  size,
  children,
  dashed = false,
  href = '#',
}: {
  label: string;
  size: string;
  children: React.ReactNode;
  dashed?: boolean;
  href?: string;
}) {
  return (
    <Box
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        textDecoration: 'none',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '24px',
        bgcolor: dashed ? 'transparent' : 'white',
        border: dashed ? '1.5px dashed rgba(17,17,17,0.15)' : '1px solid rgba(17,17,17,0.06)',
        boxShadow: dashed ? 'none' : '0 8px 32px rgba(0,0,0,0.04)',
        p: 2.5,
        minHeight: 180,
        transition: `all 0.3s ${SMOOTH}`,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.08)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Chip
          label={label}
          size="small"
          sx={{
            height: 20,
            fontSize: 9.5,
            fontWeight: 700,
            fontFamily: '"Fragment Mono", monospace',
            letterSpacing: 0.5,
            bgcolor: dashed ? 'transparent' : 'rgba(17,17,17,0.06)',
            color: 'rgba(17,17,17,0.6)',
          }}
        />
        <Typography
          sx={{
            fontSize: 9.5,
            fontFamily: '"Fragment Mono", monospace',
            color: 'rgba(17,17,17,0.3)',
          }}
        >
          {size}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, display: 'grid', placeItems: 'center' }}>{children}</Box>
    </Box>
  );
}

export default function Home() {
  const { user } = useAuth();
  const isOrganizer = user?.role === 'organizer';

  const [publicTournaments, setPublicTournaments] = useState<any[]>([]);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBottomAd, setShowBottomAd] = useState(true);

  useEffect(() => {
    api.get('/tournaments/public')
      .then(res => {
        setPublicTournaments(res.data);
        const teams = res.data.flatMap((t: any) =>
          (t.teams || []).map((team: any) => ({ ...team, tournamentName: t.name }))
        );
        const unique = teams.filter(
          (v: any, i: number, a: any[]) => a.findIndex((t: any) => t.id === v.id) === i
        );
        setAllTeams(unique);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Torneos', value: publicTournaments.length },
    { label: 'Equipos', value: publicTournaments.reduce((a, t) => a + (t._count?.teams || 0), 0) },
    { label: 'En curso', value: publicTournaments.filter(t => t.status === 'active').length },
  ];

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'clip',
        bgcolor: '#FAFAF8',
        pb: { xs: showBottomAd ? '72px' : 0, md: 0 },
      }}
    >
      {/* ═══════════ TOP BAR PUBLICITARIA ═══════════ */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: 40,
          bgcolor: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(17,17,17,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2.5, md: 6 },
          gap: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: 700,
            fontFamily: '"Fragment Mono", monospace',
            letterSpacing: 1,
            color: 'rgba(17,17,17,0.4)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          PUBLICIDAD · ESPACIO DISPONIBLE PARA TU MARCA
        </Typography>
        <Button
          size="small"
          sx={{
            height: 24,
            borderRadius: '999px',
            bgcolor: BLACK,
            color: 'white',
            fontSize: 11,
            fontWeight: 700,
            px: 1.5,
            flexShrink: 0,
            '&:hover': { bgcolor: '#1a1a1a' },
          }}
        >
          Anúnciate →
        </Button>
      </Box>

      <Box
        sx={{
          maxWidth: MAX_WIDTH,
          mx: 'auto',
          width: '100%',
          px: { xs: 2.5, md: 6 },
          py: { xs: 3, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 3, md: 4 },
        }}
      >
        {/* ═══════════ HERO AD (takeover principal) ═══════════ */}
        <Box
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: '28px',
            bgcolor: 'white',
            border: '1px solid rgba(17,17,17,0.06)',
            boxShadow: '0 24px 64px -20px rgba(0,0,0,0.12)',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            animation: `${fadeInUp} 0.5s ${SMOOTH} both`,
          }}
        >
          <Box
            sx={{
              flex: 1.2,
              minWidth: 0,
              display: 'grid',
              placeItems: 'center',
              bgcolor: '#FAFAF8',
              borderRadius: '20px',
              p: 3,
              aspectRatio: { xs: '16/9', md: '16/7' },
            }}
          >
            <Box
              component="img"
              src={sponsors[0].image}
              alt={sponsors[0].name}
              sx={{ maxWidth: '100%', maxHeight: 140, objectFit: 'contain' }}
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1.5 }}>
            <Chip
              label={`ANUNCIO · ${sponsors[0].tier.toUpperCase()} · ${sponsors[0].size}`}
              size="small"
              sx={{
                alignSelf: 'flex-start',
                fontFamily: '"Fragment Mono", monospace',
                fontSize: 10,
                height: 22,
                bgcolor: 'rgba(17,17,17,0.06)',
                color: 'rgba(17,17,17,0.6)',
              }}
            />
            <Typography
              sx={{
                fontSize: { xs: 24, md: 30 },
                fontWeight: 800,
                lineHeight: 0.95,
                letterSpacing: -1,
                fontFamily: '"Instrument Sans", system-ui, sans-serif',
                textTransform: 'uppercase',
                color: BLACK,
                whiteSpace: 'pre-line',
              }}
            >
              {sponsors[0].title}
            </Typography>
            <Typography sx={{ fontSize: 13.5, color: 'rgba(17,17,17,0.5)', lineHeight: 1.5 }}>
              {sponsors[0].description}
            </Typography>
            <Button
              endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
              sx={{
                alignSelf: 'flex-start',
                mt: 1,
                height: 40,
                borderRadius: '999px',
                bgcolor: BLACK,
                color: 'white',
                px: 2.5,
                fontWeight: 700,
                fontSize: 13,
                '&:hover': { bgcolor: '#1a1a1a' },
              }}
            >
              {sponsors[0].cta}
            </Button>
          </Box>
        </Box>

        {/* ═══════════ MARQUEE DE EQUIPOS ═══════════ */}
        {allTeams.length > 0 && (
          <Box sx={{ animation: `${fadeInUp} 0.5s ${SMOOTH} both 0.05s` }}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                color: 'rgba(17,17,17,0.4)',
                fontFamily: '"Fragment Mono", monospace',
                textAlign: 'center',
                mb: 2,
              }}
            >
              Equipos participantes
            </Typography>

            <Box
              sx={{
                position: 'relative',
                overflow: 'hidden',
                py: 2,
                borderRadius: '20px',
                bgcolor: 'white',
                border: '1px solid rgba(17,17,17,0.06)',
                maskImage: 'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
              }}
            >
              <Box sx={{ display: 'flex', width: 'max-content', animation: `${marquee} 30s linear infinite` }}>
                {[...allTeams, ...allTeams].map((team, i) => (
                  <Box key={`${team.id}-${i}`} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mx: 3, flexShrink: 0 }}>
                    {team.logo ? (
                      <Box
                        component="img"
                        src={team.logo}
                        alt={team.name}
                        sx={{
                          width: { xs: 32, md: 40 },
                          height: { xs: 32, md: 40 },
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1.5px solid rgba(17,17,17,0.06)',
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: { xs: 32, md: 40 },
                          height: { xs: 32, md: 40 },
                          borderRadius: '50%',
                          bgcolor: team.color || BLACK,
                          display: 'grid',
                          placeItems: 'center',
                          color: 'white',
                          fontWeight: 800,
                          fontSize: { xs: 13, md: 15 },
                          fontFamily: '"Instrument Sans", system-ui, sans-serif',
                        }}
                      >
                        {team.name?.[0]?.toUpperCase() || '?'}
                      </Box>
                    )}
                    <Typography sx={{ fontSize: { xs: 13.5, md: 15 }, fontWeight: 700, color: BLACK, whiteSpace: 'nowrap' }}>
                      {team.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* ═══════════ TRIPACK PUBLICITARIO ═══════════ */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: 2,
            animation: `${fadeInUp} 0.5s ${SMOOTH} both 0.1s`,
          }}
        >
          <AdSlot label="MEDIUM RECTANGLE · TREND SPORT" size={sponsors[1].size} href={sponsors[1].link}>
            <Box component="img" src={sponsors[1].image} alt={sponsors[1].name} sx={{ maxWidth: 180, maxHeight: 120, objectFit: 'contain' }} />
          </AdSlot>

          <AdSlot label="NATIVE · EMPRENDE" size={sponsors[2].size} href={sponsors[2].link}>
            <Box component="img" src={sponsors[2].image} alt={sponsors[2].name} sx={{ maxWidth: 180, maxHeight: 120, objectFit: 'contain' }} />
          </AdSlot>

          <AdSlot label="TU ANUNCIO AQUÍ" size="300x250" dashed>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: 'rgba(17,17,17,0.35)', fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
                Espacio disponible
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'rgba(17,17,17,0.3)', mt: 0.5 }}>
                Contacta y aparece aquí
              </Typography>
            </Box>
          </AdSlot>
        </Box>

        {/* ═══════════ MAIN: TORNEOS + SIDEBAR ═══════════ */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 3,
            alignItems: 'flex-start',
            animation: `${fadeInUp} 0.5s ${SMOOTH} both 0.15s`,
          }}
        >
          {/* Columna principal */}
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 1, bgcolor: 'rgba(17,17,17,0.14)' }} />
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: '"Fragment Mono", monospace',
                  letterSpacing: 1,
                  color: 'rgba(17,17,17,0.35)',
                }}
              >
                TORNEOS PÚBLICOS
              </Typography>
            </Box>

            {loading ? (
              <>
                <Skeleton variant="rounded" height={96} sx={{ borderRadius: '24px', bgcolor: 'rgba(17,17,17,0.04)' }} />
                <Skeleton variant="rounded" height={96} sx={{ borderRadius: '24px', bgcolor: 'rgba(17,17,17,0.04)' }} />
                <Skeleton variant="rounded" height={96} sx={{ borderRadius: '24px', bgcolor: 'rgba(17,17,17,0.04)' }} />
              </>
            ) : publicTournaments.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: { xs: 6, md: 8 },
                  borderRadius: '24px',
                  bgcolor: 'white',
                  border: '1px solid rgba(17,17,17,0.06)',
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '20px',
                    bgcolor: 'rgba(17,17,17,0.04)',
                    display: 'grid',
                    placeItems: 'center',
                    mx: 'auto',
                    mb: 2.5,
                  }}
                >
                  <GroupsIcon sx={{ fontSize: 30, color: 'rgba(17,17,17,0.3)' }} />
                </Box>
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'rgba(17,17,17,0.6)',
                    fontFamily: '"Instrument Sans", system-ui, sans-serif',
                  }}
                >
                  Aún no hay torneos públicos
                </Typography>
                <Typography sx={{ mt: 1, fontSize: 14, color: 'rgba(17,17,17,0.5)', maxWidth: 380, mx: 'auto' }}>
                  Cuando alguien cree y publique un torneo, aparecerá aquí automáticamente.
                </Typography>
                {isOrganizer && (
                  <Button
                    component={Link}
                    to="/tournaments/create"
                    startIcon={<AddIcon />}
                    sx={{
                      mt: 3,
                      height: 48,
                      borderRadius: '999px',
                      px: 3,
                      fontWeight: 700,
                      bgcolor: BLACK,
                      color: 'white',
                      '&:hover': { bgcolor: '#1a1a1a' },
                    }}
                  >
                    Crear torneo
                  </Button>
                )}
              </Box>
            ) : (
              <>
                {publicTournaments.map((t, idx) => (
                  <Box key={t.id}>
                    <Box
                      component={Link}
                      to={`/t/${t.shareCode}`}
                      sx={{
                        textDecoration: 'none',
                        color: 'inherit',
                        p: { xs: 2.5, md: 3 },
                        borderRadius: '24px',
                        bgcolor: 'white',
                        border: '1px solid rgba(17,17,17,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        transition: `all 0.3s ${SMOOTH}`,
                        '&:hover': {
                          borderColor: 'rgba(17,17,17,0.15)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 32px -12px rgba(0,0,0,0.1)',
                          '& .arrow-icon': { transform: 'translateX(4px)' },
                        },
                      }}
                    >
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                          <Typography
                            sx={{
                              fontSize: { xs: 17, md: 19 },
                              fontWeight: 800,
                              letterSpacing: -0.4,
                              color: BLACK,
                              fontFamily: '"Instrument Sans", system-ui, sans-serif',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {t.name}
                          </Typography>
                          <Chip
                            label={t.status === 'active' ? 'En curso' : 'Finalizado'}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: 10.5,
                              fontWeight: 700,
                              bgcolor: t.status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(17,17,17,0.06)',
                              color: t.status === 'active' ? '#16A34A' : 'rgba(17,17,17,0.6)',
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                          <Typography sx={{ fontSize: 12.5, color: 'rgba(17,17,17,0.5)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <GroupsIcon sx={{ fontSize: 15 }} />
                            {t._count?.teams || 0} equipos
                          </Typography>
                          <Typography sx={{ fontSize: 12.5, color: 'rgba(17,17,17,0.5)' }}>
                            {formatName(t.format)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: BLACK,
                          display: 'grid',
                          placeItems: 'center',
                          color: 'white',
                          flexShrink: 0,
                        }}
                      >
                        <ArrowForwardIcon
                          className="arrow-icon"
                          sx={{ fontSize: 18, transition: `transform 0.25s ${SMOOTH}` }}
                        />
                      </Box>
                    </Box>

                    {/* Ad nativo intercalado tras el 2º torneo */}
                    {idx === 1 && publicTournaments.length > 2 && (
                      <Box sx={{ mt: 2 }}>
                        <AdSlot label="PATROCINADO · NATIVE FEED" size="Feed · €200/mes">
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%' }}>
                            <Box
                              component="img"
                              src={sponsors[0].image}
                              alt={sponsors[0].name}
                              sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '14px',
                                objectFit: 'cover',
                                border: '1px solid rgba(17,17,17,0.06)',
                                flexShrink: 0,
                              }}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography sx={{ fontSize: 14, fontWeight: 700, color: BLACK }}>
                                20% dto en limpieza dental
                              </Typography>
                              <Typography sx={{ fontSize: 12, color: 'rgba(17,17,17,0.5)' }}>
                                Solo para jugadores TrendSport
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              sx={{
                                borderRadius: '999px',
                                bgcolor: BLACK,
                                color: 'white',
                                fontSize: 11,
                                px: 2,
                                '&:hover': { bgcolor: '#1a1a1a' },
                              }}
                            >
                              Ver
                            </Button>
                          </Box>
                        </AdSlot>
                      </Box>
                    )}
                  </Box>
                ))}
              </>
            )}
          </Box>

          {/* Sidebar sticky */}
          <Box
            sx={{
              width: { xs: '100%', lg: 340 },
              flexShrink: 0,
              position: { lg: 'sticky' },
              top: { lg: 64 },
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {/* Stats compactas */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: '20px',
                bgcolor: 'white',
                border: '1px solid rgba(17,17,17,0.06)',
              }}
            >
              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: '"Fragment Mono", monospace',
                  letterSpacing: 1,
                  color: 'rgba(17,17,17,0.35)',
                  mb: 2,
                }}
              >
                RESUMEN
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5 }}>
                {stats.map(s => (
                  <Box key={s.label} sx={{ textAlign: 'center' }}>
                    <Typography
                      sx={{
                        fontSize: 24,
                        fontWeight: 900,
                        color: BLACK,
                        fontFamily: '"Instrument Sans", system-ui, sans-serif',
                        lineHeight: 1,
                      }}
                    >
                      {s.value}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                        color: 'rgba(17,17,17,0.4)',
                        mt: 0.5,
                      }}
                    >
                      {s.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Spotlight del mes */}
            <AdSlot label="SPOTLIGHT DEL MES" size="300x600" href={sponsors[0].link}>
              <Box sx={{ textAlign: 'center', width: '100%' }}>
                <Box
                  component="img"
                  src={sponsors[0].image}
                  alt={sponsors[0].name}
                  sx={{ maxWidth: '100%', maxHeight: 100, objectFit: 'contain', mb: 2 }}
                />
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontFamily: '"Instrument Sans", system-ui, sans-serif',
                    color: BLACK,
                    fontSize: 15,
                  }}
                >
                  {sponsors[0].name}
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'rgba(17,17,17,0.5)', mt: 1, lineHeight: 1.5 }}>
                  Clínica oficial. 200+ jugadores ya han pasado.
                </Typography>
                <Button
                  fullWidth
                  sx={{
                    mt: 2,
                    height: 40,
                    borderRadius: '999px',
                    bgcolor: BLACK,
                    color: 'white',
                    fontWeight: 700,
                    fontSize: 13,
                    '&:hover': { bgcolor: '#1a1a1a' },
                  }}
                >
                  Pedir cita
                </Button>
              </Box>
            </AdSlot>

            {/* Patrocinadores oficiales */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: '20px',
                bgcolor: 'white',
                border: '1px solid rgba(17,17,17,0.06)',
              }}
            >
              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: '"Fragment Mono", monospace',
                  letterSpacing: 1,
                  color: 'rgba(17,17,17,0.35)',
                  mb: 1.5,
                }}
              >
                PATROCINADORES OFICIALES
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                {sponsors.map(s => (
                  <Box
                    key={s.id}
                    component="img"
                    src={s.image}
                    alt={s.name}
                    sx={{ height: 26, objectFit: 'contain', opacity: 0.6, transition: `opacity 0.2s ${SMOOTH}`, '&:hover': { opacity: 1 } }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ═══════════ BOTTOM STICKY (solo móvil) ═══════════ */}
      {showBottomAd && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 60,
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            px: 2.5,
            height: 64,
            bgcolor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderTop: '1px solid rgba(17,17,17,0.08)',
            pb: 'env(safe-area-inset-bottom)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '12px',
                bgcolor: BLACK,
                display: 'grid',
                placeItems: 'center',
                color: 'white',
                fontWeight: 800,
                fontSize: 12,
                fontFamily: '"Instrument Sans", system-ui, sans-serif',
                flexShrink: 0,
              }}
            >
              DF
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, lineHeight: 1.1, color: BLACK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Dental Fresh · 20% dto
              </Typography>
              <Typography sx={{ fontSize: 10, fontFamily: '"Fragment Mono", monospace', color: 'rgba(17,17,17,0.4)' }}>
                BOTTOM STICKY · €100/mes
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Button
              size="small"
              sx={{
                height: 32,
                borderRadius: '999px',
                bgcolor: BLACK,
                color: 'white',
                fontSize: 12,
                px: 2,
                '&:hover': { bgcolor: '#1a1a1a' },
              }}
            >
              Ver
            </Button>
            <Button
              onClick={() => setShowBottomAd(false)}
              sx={{
                minWidth: 32,
                width: 32,
                height: 32,
                borderRadius: '50%',
                color: 'rgba(17,17,17,0.5)',
                p: 0,
                '&:hover': { bgcolor: 'rgba(17,17,17,0.04)', color: BLACK },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}