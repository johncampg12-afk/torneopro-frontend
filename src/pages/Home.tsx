import { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Button, keyframes, Skeleton, Chip,
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

// Datos del carrusel de publicidad (solo imágenes)
const ads = [
  { id: 1, image: '/sponsors/dental-fresh-plus-hrz.jpeg', link: '#' },
  { id: 2, image: '/sponsors/trend-sport-hrz.png', link: '#' },
  { id: 3, image: '/sponsors/EMPRENDE-CONMIGO-TREND-SPORT.png', link: '#' },
];

const formatName = (f: string) =>
  ({ liga: 'Liga', eliminatoria: 'Eliminación Directa', grupos: 'Grupos + Eliminatoria' }[f] || f);

export default function Home() {
  const { user } = useAuth();
  const [publicTournaments, setPublicTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAd, setCurrentAd] = useState(0);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const adIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Rotación de publicidad
  useEffect(() => {
    adIntervalRef.current = setInterval(() => {
      setCurrentAd(prev => (prev + 1) % ads.length);
    }, 4000);
    return () => {
      if (adIntervalRef.current) clearInterval(adIntervalRef.current);
    };
  }, []);

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
    { label: 'Torneos activos', value: publicTournaments.filter(t => t.status === 'active').length },
    { label: 'Finalizados', value: publicTournaments.filter(t => t.status === 'finished').length },
    { label: 'Equipos', value: publicTournaments.reduce((a, t) => a + (t._count?.teams || 0), 0) },
  ];

  return (
    <Box sx={{ maxWidth: MAX_WIDTH, mx: 'auto', width: '100%', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 5 } }}>

      {/* ═══════ CARRUSEL DE PUBLICIDAD ═══════ */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '24px',
          mb: { xs: 3, md: 4 },
          height: { xs: 200, sm: 260, md: 320, lg: 360 },
          bgcolor: '#0A0A0A',
          animation: `${fadeInUp} 0.5s ${SMOOTH} both`,
        }}
      >
        {ads.map((ad, index) => (
          <Box
            key={ad.id}
            component="a"
            href={ad.link}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              position: 'absolute',
              inset: 0,
              opacity: index === currentAd ? 1 : 0,
              zIndex: index === currentAd ? 10 : 0,
              transition: `opacity 0.7s ${SMOOTH}`,
              display: 'block',
            }}
          >
            <Box
              component="img"
              src={ad.image}
              alt="Anuncio"
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: { xs: 'contain', md: 'cover' },
              }}
            />
          </Box>
        ))}

        {/* Indicadores */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            display: 'flex',
            gap: 1,
          }}
        >
          {ads.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => setCurrentAd(idx)}
              sx={{
                width: idx === currentAd ? 24 : 8,
                height: 8,
                borderRadius: 4,
                bgcolor: idx === currentAd ? 'white' : 'rgba(255,255,255,0.35)',
                cursor: 'pointer',
                transition: `all 0.3s ${SMOOTH}`,
                '&:hover': { bgcolor: idx === currentAd ? 'white' : 'rgba(255,255,255,0.6)' },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* ═══════ CARRUSEL DE EQUIPOS (marquee) ═══════ */}
      {allTeams.length > 0 && (
        <Box sx={{ mb: { xs: 4, md: 5 }, animation: `${fadeInUp} 0.5s ${SMOOTH} both 0.05s` }}>
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
            <Box
              sx={{
                display: 'flex',
                width: 'max-content',
                animation: `${marquee} 30s linear infinite`,
              }}
            >
              {[...allTeams, ...allTeams].map((team, i) => (
                <Box
                  key={`${team.id}-${i}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mx: 3,
                    flexShrink: 0,
                  }}
                >
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
                  <Typography
                    sx={{
                      fontSize: { xs: 13.5, md: 15 },
                      fontWeight: 700,
                      color: BLACK,
                      whiteSpace: 'nowrap',
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

      {/* ═══════ STATS ═══════ */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2,
          mb: { xs: 4, md: 5 },
          animation: `${fadeInUp} 0.5s ${SMOOTH} both 0.1s`,
        }}
      >
        {stats.map(s => (
          <Box
            key={s.label}
            sx={{
              p: { xs: 2, md: 2.5 },
              borderRadius: '18px',
              bgcolor: 'white',
              border: '1px solid rgba(17,17,17,0.06)',
              textAlign: 'center',
              transition: `all 0.3s ${SMOOTH}`,
              '&:hover': { borderColor: 'rgba(17,17,17,0.15)' },
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: 24, md: 30 },
                fontWeight: 800,
                letterSpacing: -1,
                color: BLACK,
                fontFamily: '"Instrument Sans", system-ui, sans-serif',
                lineHeight: 1,
              }}
            >
              {s.value}
            </Typography>
            <Typography
              sx={{
                mt: 0.75,
                fontSize: { xs: 10.5, md: 11 },
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                color: 'rgba(17,17,17,0.4)',
              }}
            >
              {s.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ═══════ TORNEOS PÚBLICOS ═══════ */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          mb: 3,
          animation: `${fadeInUp} 0.5s ${SMOOTH} both 0.15s`,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: 24, sm: 28, md: 34 },
              fontWeight: 800,
              letterSpacing: -1,
              color: BLACK,
              fontFamily: '"Instrument Sans", system-ui, sans-serif',
              lineHeight: 1.1,
            }}
          >
            Torneos públicos
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13.5, color: 'rgba(17,17,17,0.5)', fontWeight: 500 }}>
            {publicTournaments.length} {publicTournaments.length === 1 ? 'torneo' : 'torneos'} disponibles
          </Typography>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2.5 }}>
          {[1, 2, 3].map(i => (
            <Skeleton
              key={i}
              variant="rounded"
              height={220}
              sx={{ borderRadius: '24px', bgcolor: 'rgba(17,17,17,0.04)' }}
            />
          ))}
        </Box>
      ) : publicTournaments.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 8, md: 10 },
            borderRadius: '24px',
            bgcolor: 'white',
            border: '1px solid rgba(17,17,17,0.06)',
            animation: `${fadeInUp} 0.5s ${SMOOTH} both 0.2s`,
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
          {user && (
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
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 2.5,
            animation: `${fadeInUp} 0.5s ${SMOOTH} both 0.2s`,
          }}
        >
          {publicTournaments.map(t => (
            <Box
              key={t.id}
              component={Link}
              to={`/t/${t.shareCode}`}
              sx={{
                position: 'relative',
                p: 3,
                borderRadius: '24px',
                bgcolor: 'white',
                border: '1px solid rgba(17,17,17,0.06)',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                transition: `all 0.3s ${SMOOTH}`,
                '&:hover': {
                  borderColor: 'rgba(17,17,17,0.15)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)',
                  '& .arrow-icon': { transform: 'translateX(4px)', opacity: 1 },
                },
              }}
            >
              {/* Cabecera */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '14px',
                    bgcolor: BLACK,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <GroupsIcon sx={{ fontSize: 22, color: 'white' }} />
                </Box>
                <Chip
                  label={t.status === 'active' ? 'En curso' : 'Finalizado'}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 0.3,
                    bgcolor: t.status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(17,17,17,0.06)',
                    color: t.status === 'active' ? '#16A34A' : 'rgba(17,17,17,0.6)',
                  }}
                />
              </Box>

              {/* Nombre y meta */}
              <Typography
                sx={{
                  fontSize: 19,
                  fontWeight: 800,
                  letterSpacing: -0.4,
                  lineHeight: 1.25,
                  color: BLACK,
                  fontFamily: '"Instrument Sans", system-ui, sans-serif',
                  mb: 0.75,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {t.name}
              </Typography>
              <Typography sx={{ fontSize: 13, color: 'rgba(17,17,17,0.5)', fontWeight: 500, mb: 3 }}>
                {formatName(t.format)} · {t._count?.teams || 0} equipos
              </Typography>

              {/* Footer */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mt: 'auto',
                  pt: 2,
                  borderTop: '1px solid rgba(17,17,17,0.06)',
                }}
              >
                <Typography sx={{ fontSize: 12.5, color: 'rgba(17,17,17,0.45)' }}>
                  Por {t.owner?.name || 'Anónimo'}
                </Typography>
                <ArrowForwardIcon
                  className="arrow-icon"
                  sx={{
                    fontSize: 18,
                    color: BLACK,
                    opacity: 0.3,
                    transition: `all 0.25s ${SMOOTH}`,
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}