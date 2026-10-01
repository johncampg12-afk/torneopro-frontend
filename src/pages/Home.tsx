import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Skeleton, keyframes, IconButton,
} from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GroupsIcon from '@mui/icons-material/Groups';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { OrangeLinesBackground } from '../components/OrangeLinesBackground';
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
    image: '/sponsors/dental-fresh-plus-hrz.jpeg',
    cta: 'Reservar cita',
    link: '#',
    title: 'Tu sonrisa, nuestra victoria.',
    shortTitle: 'Dental Fresh Plus',
    description: 'Revisión gratuita para jugadores de TrendSport este mes. Clínica oficial del torneo.',
  },
  {
    id: 2,
    name: 'Trend Sport',
    tier: 'Oficial',
    image: '/sponsors/trend-sport-hrz.png',
    cta: 'Ver colección',
    link: '#',
    title: 'Trend Sport',
    shortTitle: 'Trend Sport',
    description: 'Atrévete a vestir diferente. Nueva colección deportiva disponible.',
  },
  {
    id: 3,
    name: 'Emprende Conmigo',
    tier: 'Colaborador',
    image: '/sponsors/EMPRENDE-CONMIGO-TREND-SPORT.png',
    cta: 'Apuntarme',
    link: '#',
    title: 'Emprende Conmigo',
    shortTitle: 'Emprende',
    description: 'Descubre nuevas oportunidades de negocio.',
  },
];

const formatName = (f: string) =>
  ({ liga: 'Liga', eliminatoria: 'Eliminación Directa', grupos: 'Grupos + Eliminatoria' }[f] || f);

// ── Tile publicitario compacto ──
function AdTile({
  image, title, description, cta, tier, link,
}: {
  image: string; title: string; description: string; cta: string; tier: string; link: string;
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
        overflow: 'hidden',
        borderRadius: '20px',
        aspectRatio: '2/1',
        bgcolor: 'white',
        border: '1px solid rgba(17,17,17,0.06)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
        textDecoration: 'none',
        transition: `all 0.3s ${SMOOTH}`,
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)',
          '& .ad-image': { transform: 'scale(1.05)' },
          '& .ad-overlay': { opacity: 1 },
        },
      }}
    >
      <Box
        className="ad-image"
        component="img"
        src={image}
        alt={title}
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: `transform 0.6s ${SMOOTH}`,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '55%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ position: 'absolute', left: 18, right: 18, bottom: 16, zIndex: 2 }}>
        <Typography
          sx={{
            fontSize: { xs: 16, md: 18 },
            fontWeight: 800,
            color: 'white',
            fontFamily: '"Instrument Sans", system-ui, sans-serif',
            textDecoration: 'underline',
            textDecorationColor: 'rgba(255,255,255,0.45)',
            textUnderlineOffset: '6px',
            textShadow: '0 2px 14px rgba(0,0,0,0.7), 0 0 28px rgba(0,0,0,0.5)',
            letterSpacing: -0.4,
            lineHeight: 1.15,
          }}
        >
          {title}
        </Typography>
      </Box>

      <Box
        className="ad-overlay"
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: 'rgba(10,10,10,0.88)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          p: { xs: 2, md: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          opacity: 0,
          transition: `opacity 0.3s ${SMOOTH}`,
          zIndex: 3,
        }}
      >
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)',
            mb: 0.75,
          }}
        >
          {tier}
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: 17, md: 19 },
            fontWeight: 800,
            color: 'white',
            fontFamily: '"Instrument Sans", system-ui, sans-serif',
            lineHeight: 1.1,
            letterSpacing: -0.5,
            mb: 1,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontSize: 12.5,
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.45,
            mb: 1.75,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {description}
        </Typography>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            alignSelf: 'flex-start',
            px: 1.75,
            height: 32,
            borderRadius: '999px',
            bgcolor: 'white',
            color: BLACK,
            fontSize: 12.5,
            fontWeight: 700,
          }}
        >
          {cta}
          <ArrowForwardIcon sx={{ fontSize: 14 }} />
        </Box>
      </Box>
    </Box>
  );
}

// ── Mini tile cuadrado para spotlight (2x2) ──
function MiniAdTile({
  image, title, cta, link,
}: {
  image: string; title: string; cta: string; link: string;
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
        overflow: 'hidden',
        borderRadius: '14px',
        aspectRatio: '1/1',
        bgcolor: 'white',
        border: '1px solid rgba(17,17,17,0.06)',
        textDecoration: 'none',
        transition: `all 0.25s ${SMOOTH}`,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 24px -8px rgba(0,0,0,0.15)',
          '& .mini-image': { transform: 'scale(1.06)' },
          '& .mini-overlay': { opacity: 1 },
        },
      }}
    >
      <Box
        className="mini-image"
        component="img"
        src={image}
        alt={title}
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: `transform 0.5s ${SMOOTH}`,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '65%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      <Typography
        sx={{
          position: 'absolute',
          left: 10,
          right: 10,
          bottom: 10,
          zIndex: 2,
          fontSize: 11,
          fontWeight: 800,
          color: 'white',
          fontFamily: '"Instrument Sans", system-ui, sans-serif',
          textDecoration: 'underline',
          textDecorationColor: 'rgba(255,255,255,0.45)',
          textUnderlineOffset: '4px',
          textShadow: '0 2px 10px rgba(0,0,0,0.75)',
          letterSpacing: -0.3,
          lineHeight: 1.15,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </Typography>

      <Box
        className="mini-overlay"
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: 'rgba(10,10,10,0.85)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          p: 1.25,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 0.5,
          opacity: 0,
          transition: `opacity 0.25s ${SMOOTH}`,
          zIndex: 3,
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 800,
            color: 'white',
            fontFamily: '"Instrument Sans", system-ui, sans-serif',
            lineHeight: 1.15,
            letterSpacing: -0.3,
          }}
        >
          {title}
        </Typography>
        <Typography sx={{ fontSize: 9.5, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>
          {cta}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Banner horizontal inferior ──
function BottomBanner({
  image, title, description, cta, tier, link,
}: {
  image: string; title: string; description: string; cta: string; tier: string; link: string;
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
        overflow: 'hidden',
        borderRadius: '24px',
        height: { xs: 180, md: 200 },
        textDecoration: 'none',
        border: '1px solid rgba(17,17,17,0.06)',
        transition: `all 0.3s ${SMOOTH}`,
        '&:hover': {
          '& .banner-image': { transform: 'scale(1.04)' },
          '& .banner-overlay': { opacity: 1 },
        },
      }}
    >
      <Box
        className="banner-image"
        component="img"
        src={image}
        alt={title}
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: `transform 0.6s ${SMOOTH}`,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          left: { xs: 20, md: 28 },
          right: { xs: 20, md: 28 },
          bottom: { xs: 18, md: 24 },
          zIndex: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: 22, md: 28 },
            fontWeight: 800,
            color: 'white',
            fontFamily: '"Instrument Sans", system-ui, sans-serif',
            textDecoration: 'underline',
            textDecorationColor: 'rgba(255,255,255,0.45)',
            textUnderlineOffset: '8px',
            textShadow: '0 2px 16px rgba(0,0,0,0.75), 0 0 32px rgba(0,0,0,0.5)',
            letterSpacing: -0.6,
            lineHeight: 1.1,
          }}
        >
          {title}
        </Typography>
      </Box>

      <Box
        className="banner-overlay"
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: 'rgba(10,10,10,0.88)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          p: { xs: 3, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          opacity: 0,
          transition: `opacity 0.3s ${SMOOTH}`,
          zIndex: 3,
        }}
      >
        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)',
            mb: 1,
          }}
        >
          {tier}
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: 22, md: 26 },
            fontWeight: 800,
            color: 'white',
            fontFamily: '"Instrument Sans", system-ui, sans-serif',
            lineHeight: 1.1,
            letterSpacing: -0.6,
            mb: 1.5,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: 13, md: 14 },
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.5,
            mb: 2.5,
            maxWidth: 500,
          }}
        >
          {description}
        </Typography>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            alignSelf: 'flex-start',
            px: 2.5,
            height: 38,
            borderRadius: '999px',
            bgcolor: 'white',
            color: BLACK,
            fontSize: 13.5,
            fontWeight: 700,
          }}
        >
          {cta}
          <ArrowForwardIcon sx={{ fontSize: 16 }} />
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

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'clip',
        bgcolor: '#FAFAF8',
        pb: { xs: showBottomAd ? '72px' : 0, md: 0 },
        position: 'relative',
      }}
    >
      <OrangeLinesBackground opacity={0.35} />

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
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* ═══════════ HERO AD ═══════════ */}
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
          {/* Imagen cubriendo todo el panel */}
          <Box
            sx={{
              flex: 1.2,
              minWidth: 0,
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '20px',
              aspectRatio: { xs: '16/9', md: '16/7' },
              bgcolor: '#FAFAF8',
            }}
          >
            <Box
              component="img"
              src={sponsors[0].image}
              alt={sponsors[0].name}
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1.5 }}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: 'rgba(17,17,17,0.4)',
              }}
            >
              {sponsors[0].tier}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: 24, md: 30 },
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: -1,
                fontFamily: '"Instrument Sans", system-ui, sans-serif',
                textTransform: 'uppercase',
                color: BLACK,
              }}
            >
              Tu sonrisa,
              <br />
              nuestra victoria.
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
                bgcolor: '#f97316',
                color: 'white',
                px: 2.5,
                fontWeight: 700,
                fontSize: 13,
                boxShadow: '0 8px 24px rgba(249,115,22,0.25)',
                transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                '&:hover': {
                  bgcolor: '#ea580c',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 12px 32px rgba(249,115,22,0.35)',
                },
                '&:active': { transform: 'scale(0.98)' },
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

        {/* ═══════════ TRIPACK DE IMÁGENES ═══════════ */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: 2,
            animation: `${fadeInUp} 0.5s ${SMOOTH} both 0.1s`,
          }}
        >
          <AdTile
            image={sponsors[1].image}
            title={sponsors[1].shortTitle}
            description={sponsors[1].description}
            cta={sponsors[1].cta}
            tier={sponsors[1].tier}
            link={sponsors[1].link}
          />
          <AdTile
            image={sponsors[2].image}
            title={sponsors[2].shortTitle}
            description={sponsors[2].description}
            cta={sponsors[2].cta}
            tier={sponsors[2].tier}
            link={sponsors[2].link}
          />
          <AdTile
            image={sponsors[0].image}
            title="Próximamente"
            description="Este espacio puede ser tuyo. Contacta para patrocinar el torneo."
            cta="Contactar"
            tier="Disponible"
            link="#"
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
          {/* Columna torneos */}
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography
              sx={{
                fontSize: { xs: 24, sm: 28, md: 34 },
                fontWeight: 800,
                letterSpacing: -1,
                color: BLACK,
                fontFamily: '"Instrument Sans", system-ui, sans-serif',
                lineHeight: 1.1,
                mb: 1,
              }}
            >
              Torneos públicos
            </Typography>

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
              publicTournaments.map(t => (
                <Box
                  key={t.id}
                  component={Link}
                  to={`/t/${t.shareCode}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    p: { xs: 1.75, md: 2 }
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
                      <Box
                        sx={{
                          px: 1,
                          py: 0.15,
                          borderRadius: '6px',
                          bgcolor: t.status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(17,17,17,0.06)',
                          color: t.status === 'active' ? '#16A34A' : 'rgba(17,17,17,0.6)',
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: 0.3,
                          flexShrink: 0,
                        }}
                      >
                        {t.status === 'active' ? 'EN CURSO' : 'FINALIZADO'}
                      </Box>
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
                      bgcolor: '#f97316',
                      display: 'grid',
                      placeItems: 'center',
                      color: 'white',
                      flexShrink: 0,
                      transition: `all 0.3s ${SMOOTH}`,
                      '&:hover': { bgcolor: '#ea580c' },
                    }}
                  >
                    <ArrowForwardIcon
                      className="arrow-icon"
                      sx={{ fontSize: 18, transition: `transform 0.25s ${SMOOTH}` }}
                    />
                  </Box>
                </Box>
              ))
            )}
          </Box>

          {/* Sidebar sticky */}
          <Box
            sx={{
              width: { xs: '100%', lg: 340 },
              flexShrink: 0,
              position: { lg: 'sticky' },
              top: { lg: 24 },
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {/* Spotlight del mes (2x2) */}
            <Box
              sx={{
                p: 2,
                borderRadius: '20px',
                bgcolor: 'white',
                border: '1px solid rgba(17,17,17,0.06)',
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.4,
                  textTransform: 'uppercase',
                  color: 'rgba(17,17,17,0.4)',
                  mb: 1.5,
                }}
              >
                Spotlight del mes
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 1,
                }}
              >
                <MiniAdTile
                  image={sponsors[0].image}
                  title="Dental Fresh"
                  cta="Pedir cita →"
                  link={sponsors[0].link}
                />
                <MiniAdTile
                  image={sponsors[1].image}
                  title="Trend Sport"
                  cta="Ver colección →"
                  link={sponsors[1].link}
                />
                <MiniAdTile
                  image={sponsors[2].image}
                  title="Emprende"
                  cta="Apuntarme →"
                  link={sponsors[2].link}
                />
                <MiniAdTile
                  image={sponsors[0].image}
                  title="Tu marca"
                  cta="Contactar →"
                  link="#"
                />
              </Box>
            </Box>

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
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.4,
                  textTransform: 'uppercase',
                  color: 'rgba(17,17,17,0.4)',
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
                    sx={{ height: 26, objectFit: 'contain', opacity: 0.6, transition: `opacity 0.2s ${SMOOTH}`, '&:hover': { opacity: 1 } }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ═══════════ BOTTOM BANNER HORIZONTAL ═══════════ */}
        <Box sx={{ animation: `${fadeInUp} 0.5s ${SMOOTH} both 0.2s`, display: { xs: 'none', md: 'block' } }}>
          <BottomBanner
            image={sponsors[0].image}
            title="Dental Fresh Plus"
            description="Clínica dental oficial del torneo. Revisión gratuita para todos los jugadores registrados este mes."
            cta="Reservar cita"
            tier="Patrocinador principal"
            link={sponsors[0].link}
          />
        </Box>
      </Box>

      {/* ═══════════ BOTTOM STICKY (solo móvil) ═══════════ */}
      {showBottomAd && (
        <Box
          component="a"
          href={sponsors[0].link}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 60,
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            height: 64,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderTop: '1px solid rgba(17,17,17,0.08)',
            pb: 'env(safe-area-inset-bottom)',
            textDecoration: 'none',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              overflow: 'hidden',
              flexShrink: 0,
              border: '1px solid rgba(17,17,17,0.06)',
              bgcolor: 'white',
            }}
          >
            <Box
              component="img"
              src={sponsors[0].image}
              alt={sponsors[0].name}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 13.5,
                fontWeight: 800,
                color: BLACK,
                fontFamily: '"Instrument Sans", system-ui, sans-serif',
                textDecoration: 'underline',
                textDecorationColor: 'rgba(17,17,17,0.3)',
                textUnderlineOffset: '4px',
                letterSpacing: -0.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {sponsors[0].shortTitle}
            </Typography>
            <Typography
              sx={{
                fontSize: 11,
                color: 'rgba(17,17,17,0.5)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                mt: 0.25,
              }}
            >
              {sponsors[0].description}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
            <Box
              sx={{
                height: 32,
                borderRadius: '999px',
                bgcolor: BLACK,
                color: 'white',
                fontSize: 12,
                fontWeight: 700,
                px: 2,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              Ver
            </Box>
            <IconButton
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowBottomAd(false); }}
              size="small"
              sx={{
                width: 32,
                height: 32,
                color: 'rgba(17,17,17,0.5)',
                '&:hover': { bgcolor: 'rgba(17,17,17,0.04)', color: BLACK },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
}