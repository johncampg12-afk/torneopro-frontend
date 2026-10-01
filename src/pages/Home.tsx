import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Chip, Skeleton, keyframes,
} from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GroupsIcon from '@mui/icons-material/Groups';
import AddIcon from '@mui/icons-material/Add';
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
    image: '/sponsors/dental-fresh-plus-hrz.jpeg',
    title: 'Tu sonrisa, nuestra victoria.',
    description: 'Revisión gratuita para jugadores de TrendSport este mes. Clínica oficial del torneo.',
    link: '#',
  },
  {
    id: 2,
    name: 'Trend Sport',
    image: '/sponsors/trend-sport-hrz.png',
    title: 'Atrévete a vestir diferente.',
    description: 'Colección nueva disponible. Descuento especial para participantes del torneo.',
    link: '#',
  },
  {
    id: 3,
    name: 'Emprende Conmigo',
    image: '/sponsors/EMPRENDE-CONMIGO-TREND-SPORT.png',
    title: 'Descubre nuevas oportunidades.',
    description: 'Programa de mentorías para emprendedores.',
    link: '#',
  },
];

const formatName = (f: string) =>
  ({ liga: 'Liga', eliminatoria: 'Eliminación Directa', grupos: 'Grupos + Eliminatoria' }[f] || f);

// ── Tarjeta publicitaria: imagen llena el contenedor, título abajo-izq con subrayado difuminado, hover con detalle ──
function ImageAdCard({
  image,
  title,
  description,
  link,
  height = 220,
  large = false,
}: {
  image: string;
  title: string;
  description: string;
  link: string;
  height?: any;
  large?: boolean;
}) {
  return (
    <Box
      component="a"
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        position: 'relative',
        display: 'block',
        borderRadius: '24px',
        overflow: 'hidden',
        height,
        cursor: 'pointer',
        border: '1px solid rgba(17,17,17,0.06)',
        textDecoration: 'none',
        '& .base-img': { transition: `transform 0.7s ${SMOOTH}` },
        '&:hover .base-img': { transform: 'scale(1.06)' },
        '& .overlay': { opacity: 0, transition: `opacity 0.35s ${SMOOTH}` },
        '&:hover .overlay': { opacity: 1 },
      }}
    >
      {/* Imagen de fondo llenando todo */}
      <Box
        component="img"
        className="base-img"
        src={image}
        alt={title}
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Degradado inferior para legibilidad */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.75) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Título abajo izquierda + subrayado difuminado */}
      <Box
        sx={{
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: 18,
          zIndex: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: large ? { xs: 24, sm: 30, md: 38 } : 18,
            fontWeight: 800,
            letterSpacing: large ? -1 : -0.4,
            lineHeight: 1.15,
            color: 'white',
            fontFamily: '"Instrument Sans", system-ui, sans-serif',
            textShadow: '0 2px 12px rgba(0,0,0,0.4)',
            mb: 1,
            maxWidth: 560,
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            width: large ? 48 : 32,
            height: 3,
            borderRadius: 2,
            bgcolor: 'white',
            filter: 'blur(1.5px)',
            opacity: 0.9,
          }}
        />
      </Box>

      {/* Overlay al hover con detalle */}
      <Box
        className="overlay"
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: 'rgba(10,10,10,0.85)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: { xs: 2.5, md: 3 },
          zIndex: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: large ? { xs: 20, md: 26 } : 16,
            fontWeight: 800,
            letterSpacing: -0.4,
            color: 'white',
            fontFamily: '"Instrument Sans", system-ui, sans-serif',
            mb: 1,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontSize: large ? { xs: 14, md: 15 } : 13.5,
            lineHeight: 1.5,
            color: 'rgba(255,255,255,0.78)',
            mb: 2,
            maxWidth: 560,
          }}
        >
          {description}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'white' }}>Ver más</Typography>
          <ArrowForwardIcon sx={{ fontSize: 14, color: 'white' }} />
        </Box>
      </Box>
    </Box>
  );
}

export default function Home() {
  const { user } = useAuth();
  const isOrganizer = user?.role === 'organizer';

  const [publicTournaments, setPublicTournaments] = useState<any[]>([]);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      }}
    >
      <Box
        sx={{
          maxWidth: MAX_WIDTH,
          mx: 'auto',
          width: '100%',
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 3, md: 5 },
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 3, md: 4 },
        }}
      >
        {/* ═══════════ HERO AD (imagen llena) ═══════════ */}
        <Box sx={{ animation: `${fadeInUp} 0.5s ${SMOOTH} both` }}>
          <ImageAdCard
            image={sponsors[0].image}
            title={sponsors[0].title}
            description={sponsors[0].description}
            link={sponsors[0].link}
            height={{ xs: 260, sm: 320, md: 400, lg: 440 }}
            large
          />
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

        {/* ═══════════ TRIPACK DE PUBLICIDAD ═══════════ */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: 2,
            animation: `${fadeInUp} 0.5s ${SMOOTH} both 0.1s`,
          }}
        >
          <ImageAdCard
            image={sponsors[1].image}
            title={sponsors[1].title}
            description={sponsors[1].description}
            link={sponsors[1].link}
            height={240}
          />
          <ImageAdCard
            image={sponsors[2].image}
            title={sponsors[2].title}
            description={sponsors[2].description}
            link={sponsors[2].link}
            height={240}
          />
          <ImageAdCard
            image={sponsors[0].image}
            title={sponsors[0].title}
            description={sponsors[0].description}
            link={sponsors[0].link}
            height={240}
          />
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
          {/* Feed de torneos (SIN publicidad) */}
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 1, bgcolor: 'rgba(17,17,17,0.14)' }} />
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  color: 'rgba(17,17,17,0.35)',
                }}
              >
                Torneos públicos
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {publicTournaments.map(t => (
                  <Box
                    key={t.id}
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
                ))}
              </Box>
            )}
          </Box>

          {/* SIDEBAR */}
          <Box
            sx={{
              width: { xs: '100%', lg: 340 },
              flexShrink: 0,
              position: { lg: 'sticky' },
              top: { lg: 88 },
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {/* Stats */}
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
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  color: 'rgba(17,17,17,0.35)',
                  mb: 2,
                }}
              >
                Resumen
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

            {/* Spotlight vertical */}
            <ImageAdCard
              image={sponsors[0].image}
              title={sponsors[0].title}
              description={sponsors[0].description}
              link={sponsors[0].link}
              height={360}
            />

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
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  color: 'rgba(17,17,17,0.35)',
                  mb: 1.5,
                }}
              >
                Patrocinadores oficiales
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                {sponsors.map(s => (
                  <Box
                    key={s.id}
                    component="img"
                    src={s.image}
                    alt={s.name}
                    sx={{
                      height: 28,
                      objectFit: 'contain',
                      opacity: 0.6,
                      transition: `opacity 0.2s ${SMOOTH}`,
                      '&:hover': { opacity: 1 },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ═══════════ BANNER HORIZONTAL PUBLICITARIO (al final) ═══════════ */}
        <Box sx={{ animation: `${fadeInUp} 0.5s ${SMOOTH} both 0.2s` }}>
          <ImageAdCard
            image={sponsors[1].image}
            title={sponsors[1].title}
            description={sponsors[1].description}
            link={sponsors[1].link}
            height={{ xs: 160, sm: 180, md: 200 }}
          />
        </Box>
      </Box>
    </Box>
  );
}