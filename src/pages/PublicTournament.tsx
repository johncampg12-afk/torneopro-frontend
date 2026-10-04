import { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Button, Stack, Chip, keyframes, Collapse, IconButton,
} from '@mui/material';
import { useParams, Link } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TableChartIcon from '@mui/icons-material/TableChart';
import GroupsIcon from '@mui/icons-material/Groups';
import BarChartIcon from '@mui/icons-material/BarChart';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ViewListIcon from '@mui/icons-material/ViewList';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { BracketView } from '../components/BracketView';
import { BetModal } from '../components/BetModal';
import { BLACK, SMOOTH } from '../theme';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const MAX_WIDTH = 1280;

const formatName = (f: string) =>
  ({
    liga: 'Liga',
    eliminatoria: 'Eliminación Directa',
    grupos: 'Grupos + Eliminatoria',
    'dos-ligas': '2 Ligas + Eliminatoria',
  }[f] || f);

const TeamBadge = ({ team, size = 'md', reverse = false }: { team: any; size?: 'sm' | 'md' | 'lg'; reverse?: boolean }) => {
  // ⬇️ COMPACTO: dimensiones reducidas
  const dim = size === 'sm' ? 16 : size === 'md' ? 28 : 44;
  const fs = size === 'sm' ? 8 : size === 'md' ? 12 : 18;

  const crest = team.logo ? (
    <Box
      component="img"
      src={team.logo}
      alt={team.name}
      sx={{ width: dim, height: dim, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
    />
  ) : (
    <Box
      sx={{
        width: dim, height: dim,
        borderRadius: '50%',
        bgcolor: team.color || '#666',
        display: 'grid', placeItems: 'center',
        color: 'white', fontWeight: 800, fontSize: fs,
        fontFamily: '"Instrument Sans", system-ui, sans-serif',
        flexShrink: 0,
      }}
    >
      {team.name?.[0]?.toUpperCase() || '?'}
    </Box>
  );

  const name = (
    <Typography
      sx={{
        // ⬇️ COMPACTO
        fontSize: size === 'sm' ? 12 : size === 'md' ? 13.5 : 15,
        fontWeight: 600,
        color: BLACK,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        minWidth: 0,
      }}
    >
      {team.name}
    </Typography>
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
      {reverse ? <>{name}{crest}</> : <>{crest}{name}</>}
    </Box>
  );
};

// ── Cálculo de clasificación reutilizable ──
const computeStandings = (teams: any[], rounds: any[]) => {
  const map: Record<string, any> = {};
  teams.forEach((team: any) => {
    map[team.id] = { ...team, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 };
  });
  rounds.forEach((round: any) => {
    round.matches.forEach((match: any) => {
      if (!match.played) return;
      const home = map[match.homeTeamId];
      const away = map[match.awayTeamId];
      if (!home || !away) return;
      home.played++; away.played++;
      home.gf += match.homeScore; home.ga += match.awayScore;
      away.gf += match.awayScore; away.ga += match.homeScore;
      home.gd = home.gf - home.ga;
      away.gd = away.gf - away.ga;
      if (match.homeScore > match.awayScore) {
        home.wins++; away.losses++; home.points += 3;
      } else if (match.homeScore < match.awayScore) {
        away.wins++; home.losses++; away.points += 3;
      } else {
        home.draws++; away.draws++; home.points += 1; away.points += 1;
      }
    });
  });
  return Object.values(map).sort((a: any, b: any) =>
    b.points - a.points || b.gd - a.gd || b.gf - a.gf
  );
};

export default function PublicTournament() {
  const { shareCode } = useParams();
  const { user } = useAuth();
  const [tournament, setTournament] = useState<any>(null);
  const [tab, setTab] = useState('fixture');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [topScorers, setTopScorers] = useState<any[]>([]);
  const [view, setView] = useState<'list' | 'bracket'>('list');
  const [openRounds, setOpenRounds] = useState<Record<string, boolean>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    liga: true,
    'liga-a': true,
    'liga-b': true,
    eliminatorias: true,
  });

  // ── Apuestas ──
  const [betMatch, setBetMatch] = useState<any>(null);
  const [myBets, setMyBets] = useState<Record<string, any>>({});
  const [matchStats, setMatchStats] = useState<Record<string, any>>({});

  // ── Standings generales ──
  const standings = useMemo(() => {
    if (!tournament) return [];
    return computeStandings(tournament.teams, tournament.rounds);
  }, [tournament]);

  // ── Standings Liga A (para dos-ligas) ──
  const standingsA = useMemo(() => {
    if (!tournament || tournament.format !== 'dos-ligas') return [];
    const rounds = tournament.rounds.filter((r: any) => r.groupName === 'Liga A');
    const teamIds = new Set<string>();
    rounds.forEach((r: any) => r.matches.forEach((m: any) => {
      if (m.homeTeamId) teamIds.add(m.homeTeamId);
      if (m.awayTeamId) teamIds.add(m.awayTeamId);
    }));
    const teams = tournament.teams.filter((t: any) => teamIds.has(t.id));
    return computeStandings(teams, rounds);
  }, [tournament]);

  // ── Standings Liga B (para dos-ligas) ──
  const standingsB = useMemo(() => {
    if (!tournament || tournament.format !== 'dos-ligas') return [];
    const rounds = tournament.rounds.filter((r: any) => r.groupName === 'Liga B');
    const teamIds = new Set<string>();
    rounds.forEach((r: any) => r.matches.forEach((m: any) => {
      if (m.homeTeamId) teamIds.add(m.homeTeamId);
      if (m.awayTeamId) teamIds.add(m.awayTeamId);
    }));
    const teams = tournament.teams.filter((t: any) => teamIds.has(t.id));
    return computeStandings(teams, rounds);
  }, [tournament]);

  useEffect(() => {
    api.get(`/tournaments/public/${shareCode}`)
      .then(res => setTournament(res.data))
      .catch(err => setError(err.response?.data?.message || 'Torneo no encontrado'))
      .finally(() => setLoading(false));
  }, [shareCode]);

  useEffect(() => {
    if (tournament) {
      api.get(`/tournaments/${tournament.id}/top-scorers`)
        .then(res => setTopScorers(res.data))
        .catch(() => {});
    }
  }, [tournament]);

  const loadBetsData = () => {
    if (!user || !tournament) return;

    api.get('/bets/my')
      .then(res => {
        const map: Record<string, any> = {};
        res.data.forEach((b: any) => { map[b.matchId] = b; });
        setMyBets(map);
      })
      .catch(() => {});

    const pendingMatches = tournament.rounds
      .flatMap((r: any) => r.matches)
      .filter((m: any) => !m.played && m.homeTeamId && m.awayTeamId);

    Promise.all(
      pendingMatches.map((m: any) =>
        api.get(`/bets/match/${m.id}/stats`)
          .then(res => ({ id: m.id, stats: res.data }))
          .catch(() => ({ id: m.id, stats: null }))
      )
    ).then(results => {
      const map: Record<string, any> = {};
      results.forEach(r => { if (r.stats) map[r.id] = r.stats; });
      setMatchStats(map);
    });
  };

  useEffect(() => {
    loadBetsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, tournament]);

  if (loading) return (
    <Box sx={{ minHeight: '100dvh', bgcolor: '#FAFAF8', display: 'grid', placeItems: 'center' }}>
      <Box sx={{
        width: 32, height: 32,
        border: '3px solid rgba(17,17,17,0.1)',
        borderTopColor: BLACK, borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
      }} />
    </Box>
  );

  if (error) return (
    <Box sx={{ minHeight: '100dvh', bgcolor: '#FAFAF8', display: 'grid', placeItems: 'center', px: 2 }}>
      <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
        <Box
          sx={{
            width: 64, height: 64, borderRadius: '20px',
            bgcolor: 'rgba(220,38,38,0.08)',
            display: 'grid', placeItems: 'center',
            mx: 'auto', mb: 2.5,
          }}
        >
          <EmojiEventsIcon sx={{ fontSize: 30, color: '#DC2626' }} />
        </Box>
        <Typography
          sx={{
            fontSize: 20, fontWeight: 800, letterSpacing: -0.4,
            color: BLACK, fontFamily: '"Instrument Sans", system-ui, sans-serif', mb: 1,
          }}
        >
          {error}
        </Typography>
        <Typography sx={{ fontSize: 14, color: 'rgba(17,17,17,0.5)', mb: 3 }}>
          El enlace puede haber caducado o el torneo ya no es público.
        </Typography>
        <Button
          component={Link}
          to="/"
          sx={{
            height: 48, borderRadius: '999px', px: 3,
            fontWeight: 700, fontSize: 14,
            bgcolor: BLACK, color: 'white',
            '&:hover': { bgcolor: '#1a1a1a' },
          }}
        >
          Ir a Torneos TrendSport
        </Button>
      </Box>
    </Box>
  );

  if (!tournament) return null;

  const getTeam = (teamId: string) =>
    tournament.teams.find((t: any) => t.id === teamId) || { name: 'Por definir', color: '#666', logo: null };

  const playedMatches = tournament.rounds.reduce((a: number, r: any) => a + r.matches.filter((m: any) => m.played).length, 0);
  const totalMatches = tournament.rounds.reduce((a: number, r: any) => a + r.matches.length, 0);
  const progress = Math.round((playedMatches / Math.max(1, totalMatches)) * 100);

  const eliminationRounds = tournament.format === 'eliminatoria'
    ? tournament.rounds
    : tournament.rounds.filter((r: any) => r.phase === 'elimination');
  const hasEliminationView = eliminationRounds.length > 0;

  // ── Toggle helpers ──
  const toggleRound = (key: string) =>
    setOpenRounds(prev => ({ ...prev, [key]: prev[key] === false ? true : false }));

  const toggleSection = (key: string) =>
    setOpenSections(prev => ({ ...prev, [key]: prev[key] === false ? true : false }));

  // ── Render tabla de posiciones ──
  const renderStandingsTable = (data: any[], title?: string) => (
    <Box
      sx={{
        borderRadius: '20px',
        bgcolor: 'white',
        border: '1px solid rgba(17,17,17,0.06)',
        overflow: 'hidden',
        flex: 1,
        minWidth: 0,
      }}
    >
      {title && (
        // ⬇️ COMPACTO: pt 2.5 → 2, pb 1 → 0.75
        <Box sx={{ px: { xs: 2, md: 2.5 }, pt: 2, pb: 0.75 }}>
          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: -0.3,
              color: BLACK,
              fontFamily: '"Instrument Sans", system-ui, sans-serif',
            }}
          >
            {title}
          </Typography>
        </Box>
      )}
      <Box sx={{ overflowX: 'auto' }}>
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <Box component="thead">
            <Box component="tr" sx={{ bgcolor: 'rgba(17,17,17,0.02)' }}>
              {['#', 'Equipo', 'PJ', 'G', 'E', 'P', 'DG', 'Pts'].map((h, i) => (
                <Box
                  component="th"
                  key={h}
                  sx={{
                    px: { xs: 1, md: 1.5 },
                    // ⬇️ COMPACTO: 1.5 → 1.1
                    py: 1.1,
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                    color: 'rgba(17,17,17,0.45)',
                    textAlign: i === 1 ? 'left' : 'center',
                    borderBottom: '1px solid rgba(17,17,17,0.06)',
                  }}
                >
                  {h}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {data.map((team: any, idx: number) => (
              <Box
                component="tr"
                key={team.id}
                sx={{
                  borderBottom: '1px solid rgba(17,17,17,0.04)',
                  bgcolor: idx < 2 ? 'rgba(34,197,94,0.04)' : 'transparent',
                }}
              >
                {/* ⬇️ COMPACTO: py 1.5 → 0.8 */}
                <Box component="td" sx={{ px: { xs: 1, md: 1.5 }, py: 0.8, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 22, height: 22,
                      borderRadius: '6px',
                      display: 'inline-grid',
                      placeItems: 'center',
                      fontWeight: 800,
                      fontSize: 11,
                      bgcolor: idx === 0 ? 'rgba(251,191,36,0.15)'
                        : idx === 1 ? 'rgba(148,163,184,0.15)'
                        : 'transparent',
                      color: idx === 0 ? '#D97706'
                        : idx === 1 ? '#64748B'
                        : 'rgba(17,17,17,0.5)',
                    }}
                  >
                    {idx + 1}
                  </Box>
                </Box>
                {/* ⬇️ COMPACTO: py 1.5 → 0.8 */}
                <Box component="td" sx={{ px: { xs: 1, md: 1.5 }, py: 0.8 }}>
                  <TeamBadge team={team} size="sm" />
                </Box>
                {['played', 'wins', 'draws', 'losses'].map(field => (
                  <Box
                    component="td"
                    key={field}
                    sx={{
                      px: { xs: 1, md: 1.5 },
                      // ⬇️ COMPACTO: 1.5 → 0.8
                      py: 0.8,
                      textAlign: 'center',
                      fontSize: 13,
                      fontWeight: field === 'wins' ? 700 : 500,
                      color: field === 'wins' ? '#16A34A'
                        : field === 'draws' ? '#D97706'
                        : field === 'losses' ? '#DC2626'
                        : BLACK,
                    }}
                  >
                    {team[field]}
                  </Box>
                ))}
                {/* ⬇️ COMPACTO: py 1.5 → 0.8 */}
                <Box
                  component="td"
                  sx={{
                    px: { xs: 1, md: 1.5 },
                    py: 0.8,
                    textAlign: 'center',
                    fontSize: 13,
                    fontWeight: 600,
                    color: BLACK,
                  }}
                >
                  {team.gd > 0 ? '+' : ''}{team.gd}
                </Box>
                {/* ⬇️ COMPACTO: py 1.5 → 0.8 */}
                <Box component="td" sx={{ px: { xs: 1, md: 1.5 }, py: 0.8, textAlign: 'center' }}>
                  <Typography
                    sx={{
                      fontSize: 15,
                      fontWeight: 900,
                      color: BLACK,
                      fontFamily: '"Instrument Sans", system-ui, sans-serif',
                    }}
                  >
                    {team.points}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );

  // ── Render partido ──
  const renderMatch = (match: any) => {
    const home = getTeam(match.homeTeamId);
    const away = getTeam(match.awayTeamId);
    const myBet = myBets[match.id];
    const stats = matchStats[match.id];
    const canBet = !match.played && user && match.homeTeamId && match.awayTeamId;

    return (
      <Box
        key={match.id}
        sx={{
          // ⬇️ COMPACTO: p 1.5/2 → 1/1.25
          p: { xs: 1, sm: 1.25 },
          borderRadius: '14px',
          bgcolor: match.played ? 'rgba(17,17,17,0.02)' : '#FAFAF8',
          border: '1px solid',
          borderColor: match.played ? 'rgba(17,17,17,0.08)' : 'rgba(17,17,17,0.04)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}>
            <TeamBadge team={home} size="sm" reverse />
          </Box>

          <Box
            sx={{
              // ⬇️ COMPACTO: px 2 → 1.5, py 0.75 → 0.5
              px: 1.5,
              py: 0.5,
              borderRadius: '10px',
              bgcolor: match.played ? BLACK : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexShrink: 0,
            }}
          >
            {match.played ? (
              <>
                {/* ⬇️ COMPACTO: 22 → 18 */}
                <Typography sx={{ fontSize: 18, fontWeight: 900, color: 'white', fontFamily: '"Instrument Sans", system-ui, sans-serif', lineHeight: 1 }}>
                  {match.homeScore}
                </Typography>
                {/* ⬇️ COMPACTO: 16 → 13 */}
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>–</Typography>
                {/* ⬇️ COMPACTO: 22 → 18 */}
                <Typography sx={{ fontSize: 18, fontWeight: 900, color: 'white', fontFamily: '"Instrument Sans", system-ui, sans-serif', lineHeight: 1 }}>
                  {match.awayScore}
                </Typography>
              </>
            ) : (
              // ⬇️ COMPACTO: 12 → 11
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'rgba(17,17,17,0.4)', letterSpacing: 0.5 }}>
                VS
              </Typography>
            )}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TeamBadge team={away} size="sm" />
          </Box>
        </Box>

        {/* Barra de distribución de apuestas */}
        {canBet && stats && stats.total > 0 && (
          // ⬇️ COMPACTO: mt 1.5 → 1
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', height: 5, borderRadius: 3, overflow: 'hidden', bgcolor: 'rgba(17,17,17,0.06)' }}>
              <Box sx={{ width: `${stats.homePct}%`, bgcolor: BLACK }} />
              <Box sx={{ width: `${stats.awayPct}%`, bgcolor: 'rgba(17,17,17,0.35)' }} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.4 }}>
              <Typography sx={{ fontSize: 10, color: 'rgba(17,17,17,0.5)', fontWeight: 600 }}>
                {stats.homePct}%
              </Typography>
              <Typography sx={{ fontSize: 10, color: 'rgba(17,17,17,0.5)', fontWeight: 600 }}>
                {stats.awayPct}%
              </Typography>
            </Box>
          </Box>
        )}

        {/* Botón de apuesta o chip de mi apuesta */}
        {!match.played && user && (
          // ⬇️ COMPACTO: mt 1.5 → 1
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
            {myBet && !myBet.resolved ? (
              <Chip
                label={`🪙 Apostaste ${myBet.amount} a ${myBet.prediction === 'home' ? home.name : away.name}`}
                size="small"
                sx={{
                  // ⬇️ COMPACTO: height 26 → 22, fontSize 11 → 10.5
                  height: 22,
                  fontSize: 10.5,
                  fontWeight: 700,
                  bgcolor: 'rgba(251,191,36,0.15)',
                  color: '#92400E',
                  maxWidth: '100%',
                }}
              />
            ) : (
              <Button
                onClick={(e) => { e.stopPropagation(); setBetMatch(match); }}
                sx={{
                  // ⬇️ COMPACTO: height 32 → 28, px 2 → 1.75, fontSize 12 → 11.5
                  height: 28,
                  borderRadius: '999px',
                  px: 1.75,
                  fontWeight: 700,
                  fontSize: 11.5,
                  color: BLACK,
                  bgcolor: 'rgba(17,17,17,0.04)',
                  '&:hover': { bgcolor: 'rgba(17,17,17,0.08)' },
                }}
              >
                🪙 Apostar
              </Button>
            )}
          </Box>
        )}

        {(match.date || match.time || match.location) && (
          // ⬇️ COMPACTO: gap 2 → 1.25, mt 1.25 → 0.75
          <Box sx={{ display: 'flex', gap: 1.25, mt: 0.75, justifyContent: 'center', flexWrap: 'wrap' }}>
            {match.date && (
              <Typography sx={{ fontSize: 11, color: 'rgba(17,17,17,0.45)' }}>
                {new Date(match.date).toLocaleDateString('es-ES')}
              </Typography>
            )}
            {match.time && (
              <Typography sx={{ fontSize: 11, color: 'rgba(17,17,17,0.45)' }}>{match.time}</Typography>
            )}
            {match.location && (
              <Typography sx={{ fontSize: 11, color: 'rgba(17,17,17,0.45)' }}>{match.location}</Typography>
            )}
          </Box>
        )}
      </Box>
    );
  };

  // ── Render ronda colapsable ──
  const renderCollapsibleRound = (round: any, keyPrefix = '') => {
    const key = `${keyPrefix}${round.id}`;
    const isOpen = openRounds[key] !== false;
    return (
      <Box
        key={round.id}
        sx={{
          borderRadius: '20px',
          bgcolor: 'white',
          border: '1px solid rgba(17,17,17,0.06)',
          overflow: 'hidden',
        }}
      >
        <Box
          onClick={() => toggleRound(key)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            // ⬇️ COMPACTO: p 2/2.5 → py 1.25/1.5 + px 1.75/2.25
            py: { xs: 1.25, md: 1.5 },
            px: { xs: 1.75, md: 2.25 },
            cursor: 'pointer',
            transition: `background-color 0.2s ${SMOOTH}`,
            '&:hover': { bgcolor: 'rgba(17,17,17,0.015)' },
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              sx={{
                // ⬇️ COMPACTO: 15.5 → 14
                fontSize: 14,
                fontWeight: 800,
                color: BLACK,
                letterSpacing: -0.3,
                fontFamily: '"Instrument Sans", system-ui, sans-serif',
              }}
            >
              {round.name || (tournament.format === 'eliminatoria' || round.phase === 'elimination'
                ? round.name
                : `Jornada ${round.number}`)}
            </Typography>
            {/* ⬇️ COMPACTO: fontSize 12 → 11.5, mt 0.25 → 0.15 */}
            <Typography sx={{ fontSize: 11.5, color: 'rgba(17,17,17,0.5)', mt: 0.15 }}>
              {round.matches.filter((m: any) => m.played).length}/{round.matches.length} jugados
            </Typography>
          </Box>
          <ExpandMoreIcon
            sx={{
              // ⬇️ COMPACTO: 22 → 20
              fontSize: 20,
              color: 'rgba(17,17,17,0.4)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: `transform 0.25s ${SMOOTH}`,
            }}
          />
        </Box>

        <Collapse in={isOpen} timeout={250}>
          {/* ⬇️ COMPACTO: px 2/2.5 → 1.5/2, pb 2/2.5 → 1.5/2, gap 1 → 0.75 */}
          <Box sx={{ px: { xs: 1.5, md: 2 }, pb: { xs: 1.5, md: 2 }, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {round.matches.map((m: any) => renderMatch(m))}
          </Box>
        </Collapse>
      </Box>
    );
  };

  // ── Render sección ──
  const renderSection = (sectionKey: string, title: string, subtitle: string, content: React.ReactNode) => {
    const isOpen = openSections[sectionKey] !== false;
    return (
      <Box
        sx={{
          borderRadius: '20px',
          bgcolor: 'white',
          border: '1px solid rgba(17,17,17,0.06)',
          overflow: 'hidden',
        }}
      >
        <Box
          onClick={() => toggleSection(sectionKey)}
          sx={{
            // ⬇️ COMPACTO: p 2/2.5 → py 1.5/1.75 + px 1.75/2.25
            py: { xs: 1.5, md: 1.75 },
            px: { xs: 1.75, md: 2.25 },
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            '&:hover': { bgcolor: 'rgba(17,17,17,0.015)' },
          }}
        >
          <Box>
            <Typography
              sx={{
                // ⬇️ COMPACTO: 17 → 15.5
                fontSize: 15.5,
                fontWeight: 800,
                color: BLACK,
                letterSpacing: -0.4,
                fontFamily: '"Instrument Sans", system-ui, sans-serif',
              }}
            >
              {title}
            </Typography>
            {/* ⬇️ COMPACTO: fontSize 12 → 11.5, mt 0.25 → 0.15 */}
            <Typography sx={{ fontSize: 11.5, color: 'rgba(17,17,17,0.5)', mt: 0.15 }}>
              {subtitle}
            </Typography>
          </Box>
          <ExpandMoreIcon
            sx={{
              // ⬇️ COMPACTO: 22 → 20
              fontSize: 20,
              color: 'rgba(17,17,17,0.4)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: `transform 0.25s ${SMOOTH}`,
            }}
          />
        </Box>

        <Collapse in={isOpen} timeout={250}>
          {/* ⬇️ COMPACTO: px 2/2.5 → 1.75/2.25, pb 2/2.5 → 1.75/2.25, gap 1.5 → 1 */}
          <Box sx={{ px: { xs: 1.75, md: 2.25 }, pb: { xs: 1.75, md: 2.25 }, pt: 0.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {content}
          </Box>
        </Collapse>
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: '#FAFAF8' }}>

      {/* ═══════ HEADER PÚBLICO ═══════ */}
      <Box
        sx={{
          borderBottom: '1px solid rgba(17,17,17,0.06)',
          bgcolor: 'rgba(250,250,248,0.9)',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Box
          sx={{
            maxWidth: MAX_WIDTH,
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 4 },
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
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
            }}
          >
            <Box
              sx={{
                width: 36, height: 36,
                borderRadius: '10px',
                bgcolor: 'white',
                p: 0.25,
                border: '1px solid rgba(17,17,17,0.06)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
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
                fontSize: { xs: 14, sm: 16 },
                fontWeight: 800,
                letterSpacing: -0.5,
                color: BLACK,
                fontFamily: '"Instrument Sans", system-ui, sans-serif',
              }}
            >
              Torneos TrendSport
            </Typography>
          </Box>

          <Chip
            label="Vista pública"
            size="small"
            sx={{
              height: 24,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.3,
              bgcolor: 'rgba(17,17,17,0.05)',
              color: 'rgba(17,17,17,0.6)',
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          maxWidth: MAX_WIDTH,
          mx: 'auto',
          width: '100%',
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 3, md: 5 },
        }}
      >
        {/* ═══════ INFO DEL TORNEO ═══════ */}
        <Box
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: '24px',
            bgcolor: 'white',
            border: '1px solid rgba(17,17,17,0.06)',
            mb: 3,
            animation: `${fadeInUp} 0.5s ${SMOOTH} both`,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2.5 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: { xs: 26, md: 34 },
                  fontWeight: 800,
                  letterSpacing: -1,
                  lineHeight: 1.15,
                  color: BLACK,
                  fontFamily: '"Instrument Sans", system-ui, sans-serif',
                  mb: 1,
                }}
              >
                {tournament.name}
              </Typography>
              <Typography sx={{ fontSize: 14.5, color: 'rgba(17,17,17,0.55)', fontWeight: 500 }}>
                {formatName(tournament.format)} · {tournament.teams.length} equipos · Por {tournament.owner?.name || 'Anónimo'}
              </Typography>
              {tournament.location && (
                <Typography sx={{ mt: 0.75, fontSize: 13.5, color: 'rgba(17,17,17,0.5)' }}>
                  📍 {tournament.location}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography
                  sx={{
                    fontSize: { xs: 26, md: 32 },
                    fontWeight: 900,
                    color: BLACK,
                    fontFamily: '"Instrument Sans", system-ui, sans-serif',
                    lineHeight: 1,
                  }}
                >
                  {playedMatches}/{totalMatches}
                </Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(17,17,17,0.4)', mt: 0.5 }}>
                  Partidos
                </Typography>
              </Box>
              <Box
                sx={{
                  width: { xs: 64, md: 72 },
                  height: { xs: 64, md: 72 },
                  borderRadius: '50%',
                  position: 'relative',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'rgba(17,17,17,0.03)',
                }}
              >
                <Box
                  component="svg"
                  sx={{ position: 'absolute', width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
                  viewBox="0 0 100 100"
                >
                  <circle cx="50" cy="50" r="42" stroke="rgba(17,17,17,0.06)" strokeWidth="6" fill="none" />
                  <circle
                    cx="50" cy="50" r="42"
                    stroke={BLACK} strokeWidth="6" fill="none"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontSize: { xs: 16, md: 18 },
                    fontWeight: 900,
                    color: BLACK,
                    fontFamily: '"Instrument Sans", system-ui, sans-serif',
                  }}
                >
                  {progress}%
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ═══════ TABS ═══════ */}
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            p: 0.5,
            borderRadius: '999px',
            bgcolor: 'white',
            border: '1px solid rgba(17,17,17,0.06)',
            mb: 3,
            overflowX: 'auto',
            animation: `${fadeInUp} 0.5s ${SMOOTH} both 0.05s`,
          }}
        >
          {[
            { id: 'fixture', label: 'Partidos', Icon: CalendarMonthIcon },
            { id: 'standings', label: 'Tabla', Icon: TableChartIcon },
            { id: 'teams', label: 'Equipos', Icon: GroupsIcon },
            { id: 'stats', label: 'Stats', Icon: BarChartIcon },
          ].map(t => (
            <Button
              key={t.id}
              onClick={() => setTab(t.id)}
              sx={{
                flex: 1,
                minWidth: 0,
                height: 40,
                borderRadius: '999px',
                px: { xs: 1, sm: 2 },
                gap: 0.75,
                fontWeight: 700,
                fontSize: 13.5,
                color: tab === t.id ? 'white' : 'rgba(17,17,17,0.6)',
                bgcolor: tab === t.id ? BLACK : 'transparent',
                transition: `all 0.25s ${SMOOTH}`,
                '&:hover': { bgcolor: tab === t.id ? BLACK : 'rgba(17,17,17,0.04)' },
              }}
            >
              <t.Icon sx={{ fontSize: 18, flexShrink: 0 }} />
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{t.label}</Box>
            </Button>
          ))}
        </Box>

        {/* ═══════ FIXTURE ═══════ */}
        {tab === 'fixture' && (
          // ⬇️ COMPACTO: gap 2 → 1.5
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, animation: `${fadeInUp} 0.4s ${SMOOTH} both` }}>

            {/* Toggle Lista / Árbol */}
            {hasEliminationView && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    p: 0.5,
                    borderRadius: '999px',
                    bgcolor: 'white',
                    border: '1px solid rgba(17,17,17,0.06)',
                  }}
                >
                  <Button
                    onClick={() => setView('list')}
                    sx={{
                      height: 32,
                      borderRadius: '999px',
                      px: 1.75,
                      gap: 0.5,
                      fontWeight: 700,
                      fontSize: 12.5,
                      color: view === 'list' ? 'white' : 'rgba(17,17,17,0.6)',
                      bgcolor: view === 'list' ? BLACK : 'transparent',
                      '&:hover': { bgcolor: view === 'list' ? BLACK : 'rgba(17,17,17,0.04)' },
                    }}
                  >
                    <ViewListIcon sx={{ fontSize: 16 }} />
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Lista</Box>
                  </Button>
                  <Button
                    onClick={() => setView('bracket')}
                    sx={{
                      height: 32,
                      borderRadius: '999px',
                      px: 1.75,
                      gap: 0.5,
                      fontWeight: 700,
                      fontSize: 12.5,
                      color: view === 'bracket' ? 'white' : 'rgba(17,17,17,0.6)',
                      bgcolor: view === 'bracket' ? BLACK : 'transparent',
                      '&:hover': { bgcolor: view === 'bracket' ? BLACK : 'rgba(17,17,17,0.04)' },
                    }}
                  >
                    <AccountTreeIcon sx={{ fontSize: 16 }} />
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Árbol</Box>
                  </Button>
                </Box>
              </Box>
            )}

            {view === 'bracket' && hasEliminationView ? (
              <Box
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderRadius: '20px',
                  bgcolor: 'white',
                  border: '1px solid rgba(17,17,17,0.06)',
                }}
              >
                <BracketView rounds={eliminationRounds} getTeam={getTeam} />
              </Box>
            ) : tournament.format === 'dos-ligas' ? (
              /* ═══════ 2 LIGAS: paralelo en desktop, apilado en móvil ═══════ */
              <>
                {(() => {
                  const ligaARounds = tournament.rounds.filter((r: any) => r.groupName === 'Liga A');
                  const ligaBRounds = tournament.rounds.filter((r: any) => r.groupName === 'Liga B');
                  const elimRounds = tournament.rounds.filter((r: any) => r.phase === 'elimination');

                  const aPlayed = ligaARounds.reduce((a: number, r: any) => a + r.matches.filter((m: any) => m.played).length, 0);
                  const aTotal = ligaARounds.reduce((a: number, r: any) => a + r.matches.length, 0);
                  const bPlayed = ligaBRounds.reduce((a: number, r: any) => a + r.matches.filter((m: any) => m.played).length, 0);
                  const bTotal = ligaBRounds.reduce((a: number, r: any) => a + r.matches.length, 0);
                  const ePlayed = elimRounds.reduce((a: number, r: any) => a + r.matches.filter((m: any) => m.played).length, 0);
                  const eTotal = elimRounds.reduce((a: number, r: any) => a + r.matches.length, 0);

                  return (
                    <>
                      {/* Dos ligas en paralelo */}
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                          // ⬇️ COMPACTO: gap 2 → 1.5
                          gap: 1.5,
                          alignItems: 'flex-start',
                        }}
                      >
                        {ligaARounds.length > 0 && (
                          <Box>
                            {renderSection(
                              'liga-a',
                              'Liga A',
                              `${aPlayed}/${aTotal} partidos jugados`,
                              ligaARounds.map((r: any) => renderCollapsibleRound(r, 'liga-a-'))
                            )}
                          </Box>
                        )}
                        {ligaBRounds.length > 0 && (
                          <Box>
                            {renderSection(
                              'liga-b',
                              'Liga B',
                              `${bPlayed}/${bTotal} partidos jugados`,
                              ligaBRounds.map((r: any) => renderCollapsibleRound(r, 'liga-b-'))
                            )}
                          </Box>
                        )}
                      </Box>

                      {/* Eliminatorias a ancho completo */}
                      {elimRounds.length > 0 &&
                        renderSection(
                          'eliminatorias',
                          'Eliminatorias',
                          `${ePlayed}/${eTotal} partidos jugados`,
                          elimRounds.map((r: any) => renderCollapsibleRound(r, 'elim-'))
                        )}
                    </>
                  );
                })()}
              </>
            ) : ['grupos'].includes(tournament.format) ? (
              /* ═══════ GRUPOS (una sola liga) ═══════ */
              <>
                {(() => {
                  const leagueRounds = tournament.rounds.filter((r: any) => r.phase === 'league');
                  const elimRounds = tournament.rounds.filter((r: any) => r.phase === 'elimination');
                  const leaguePlayed = leagueRounds.reduce((a: number, r: any) => a + r.matches.filter((m: any) => m.played).length, 0);
                  const leagueTotal = leagueRounds.reduce((a: number, r: any) => a + r.matches.length, 0);
                  const elimPlayed = elimRounds.reduce((a: number, r: any) => a + r.matches.filter((m: any) => m.played).length, 0);
                  const elimTotal = elimRounds.reduce((a: number, r: any) => a + r.matches.length, 0);

                  return (
                    <>
                      {leagueRounds.length > 0 &&
                        renderSection(
                          'liga',
                          'Liga',
                          `${leaguePlayed}/${leagueTotal} partidos jugados`,
                          leagueRounds.map((r: any) => renderCollapsibleRound(r, 'liga-'))
                        )}

                      {elimRounds.length > 0 &&
                        renderSection(
                          'eliminatorias',
                          'Eliminatorias',
                          `${elimPlayed}/${elimTotal} partidos jugados`,
                          elimRounds.map((r: any) => renderCollapsibleRound(r, 'elim-'))
                        )}
                    </>
                  );
                })()}
              </>
            ) : (
              <>
                {tournament.rounds.map((round: any) => renderCollapsibleRound(round))}
              </>
            )}
          </Box>
        )}

        {/* ═══════ STANDINGS ═══════ */}
        {tab === 'standings' && (
          tournament.format === 'dos-ligas' ? (
            /* ═══════ 2 TABLAS EN PARALELO ═══════ */
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                // ⬇️ COMPACTO: gap 2 → 1.5
                gap: 1.5,
                animation: `${fadeInUp} 0.4s ${SMOOTH} both`,
              }}
            >
              {renderStandingsTable(standingsA, 'Liga A')}
              {renderStandingsTable(standingsB, 'Liga B')}
            </Box>
          ) : (
            /* ═══════ TABLA ÚNICA ═══════ */
            <Box sx={{ animation: `${fadeInUp} 0.4s ${SMOOTH} both` }}>
              {renderStandingsTable(standings)}
            </Box>
          )
        )}

        {/* ═══════ TEAMS ═══════ */}
        {tab === 'teams' && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: 2.5,
              animation: `${fadeInUp} 0.4s ${SMOOTH} both`,
            }}
          >
            {tournament.teams.map((team: any) => {
              const teamStats = standings.find((s: any) => s.id === team.id);
              return (
                <Box
                  key={team.id}
                  sx={{
                    p: 2.5,
                    borderRadius: '20px',
                    bgcolor: 'white',
                    border: '1px solid rgba(17,17,17,0.06)',
                    transition: `all 0.25s ${SMOOTH}`,
                    '&:hover': { borderColor: 'rgba(17,17,17,0.15)' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <TeamBadge team={team} size="md" />
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                    {[
                      { label: 'G', value: teamStats?.wins || 0, color: '#16A34A' },
                      { label: 'E', value: teamStats?.draws || 0, color: '#D97706' },
                      { label: 'P', value: teamStats?.losses || 0, color: '#DC2626' },
                    ].map(s => (
                      <Box
                        key={s.label}
                        sx={{
                          py: 1,
                          borderRadius: '10px',
                          bgcolor: 'rgba(17,17,17,0.03)',
                          textAlign: 'center',
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: s.color,
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
                            letterSpacing: 0.6,
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
              );
            })}
          </Box>
        )}

        {/* ═══════ STATS ═══════ */}
        {tab === 'stats' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, animation: `${fadeInUp} 0.4s ${SMOOTH} both` }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2.5 }}>

              <Box sx={{ p: 2.5, borderRadius: '20px', bgcolor: 'white', border: '1px solid rgba(17,17,17,0.06)' }}>
                <Typography sx={{ fontSize: 15, fontWeight: 800, color: BLACK, mb: 2, fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
                  Goles a favor
                </Typography>
                <Stack spacing={1.5}>
                  {[...standings].sort((a: any, b: any) => b.gf - a.gf).slice(0, 8).map((team: any) => (
                    <Box key={team.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <TeamBadge team={team} size="sm" />
                      <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'rgba(17,17,17,0.06)', overflow: 'hidden' }}>
                        <Box
                          sx={{
                            height: '100%',
                            width: `${Math.min(100, (team.gf / Math.max(1, standings[0]?.gf)) * 100)}%`,
                            bgcolor: BLACK,
                            borderRadius: 3,
                          }}
                        />
                      </Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 800, color: BLACK, minWidth: 20, textAlign: 'right' }}>
                        {team.gf}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Box sx={{ p: 2.5, borderRadius: '20px', bgcolor: 'white', border: '1px solid rgba(17,17,17,0.06)' }}>
                <Typography sx={{ fontSize: 15, fontWeight: 800, color: BLACK, mb: 2, fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
                  % Victorias
                </Typography>
                <Stack spacing={1.5}>
                  {standings.filter((s: any) => s.played > 0)
                    .sort((a: any, b: any) => (b.wins / b.played) - (a.wins / a.played))
                    .slice(0, 8)
                    .map((team: any) => (
                      <Box key={team.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <TeamBadge team={team} size="sm" />
                        <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'rgba(17,17,17,0.06)', overflow: 'hidden' }}>
                          <Box
                            sx={{
                              height: '100%',
                              width: `${(team.wins / team.played) * 100}%`,
                              bgcolor: '#16A34A',
                              borderRadius: 3,
                            }}
                          />
                        </Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 800, color: BLACK, minWidth: 36, textAlign: 'right' }}>
                          {Math.round((team.wins / team.played) * 100)}%
                        </Typography>
                      </Box>
                    ))}
                </Stack>
              </Box>
            </Box>

            <Box sx={{ p: 2.5, borderRadius: '20px', bgcolor: 'white', border: '1px solid rgba(17,17,17,0.06)' }}>
              <Typography sx={{ fontSize: 15, fontWeight: 800, color: BLACK, mb: 2, fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
                Resumen
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
                {[
                  { label: 'Goles', value: tournament.rounds.reduce((a: number, r: any) => a + r.matches.reduce((b: number, m: any) => b + (m.homeScore || 0) + (m.awayScore || 0), 0), 0) },
                  { label: 'Jugados', value: playedMatches },
                  { label: 'Empates', value: tournament.rounds.reduce((a: number, r: any) => a + r.matches.filter((m: any) => m.played && m.homeScore === m.awayScore).length, 0) },
                  { label: 'Equipos', value: tournament.teams.length },
                ].map(s => (
                  <Box key={s.label} sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(17,17,17,0.03)', textAlign: 'center' }}>
                    <Typography
                      sx={{
                        fontSize: 26,
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
                        fontSize: 10.5,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        textTransform: 'uppercase',
                        color: 'rgba(17,17,17,0.4)',
                        mt: 0.75,
                      }}
                    >
                      {s.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box sx={{ p: 2.5, borderRadius: '20px', bgcolor: 'white', border: '1px solid rgba(17,17,17,0.06)' }}>
              <Typography sx={{ fontSize: 15, fontWeight: 800, color: BLACK, mb: 2, fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
                Máximos goleadores
              </Typography>
              {topScorers.filter(p => p.goals > 0).length === 0 ? (
                <Typography sx={{ fontSize: 13, color: 'rgba(17,17,17,0.45)', fontStyle: 'italic' }}>
                  Sin datos todavía
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {topScorers.filter(p => p.goals > 0).slice(0, 10).map((p: any, i: number) => (
                    <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                      <Box
                        sx={{
                          width: 26, height: 26, borderRadius: '8px',
                          display: 'grid', placeItems: 'center',
                          fontSize: 12, fontWeight: 800,
                          bgcolor: i === 0 ? 'rgba(251,191,36,0.15)'
                            : i === 1 ? 'rgba(148,163,184,0.15)'
                            : i === 2 ? 'rgba(234,88,12,0.15)'
                            : 'transparent',
                          color: i === 0 ? '#D97706'
                            : i === 1 ? '#64748B'
                            : i === 2 ? '#EA580C'
                            : 'rgba(17,17,17,0.5)',
                        }}
                      >
                        {i + 1}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: BLACK,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {p.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.teamColor }} />
                          <Typography sx={{ fontSize: 11.5, color: 'rgba(17,17,17,0.5)' }}>{p.team}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography
                          sx={{
                            fontSize: 20,
                            fontWeight: 900,
                            color: BLACK,
                            lineHeight: 1,
                            fontFamily: '"Instrument Sans", system-ui, sans-serif',
                          }}
                        >
                          {p.goals}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 9.5,
                            fontWeight: 700,
                            letterSpacing: 0.5,
                            textTransform: 'uppercase',
                            color: 'rgba(17,17,17,0.4)',
                          }}
                        >
                          goles
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Box>
        )}

        {/* ═══════ FOOTER ═══════ */}
        <Box
          sx={{
            mt: { xs: 6, md: 8 },
            py: { xs: 4, md: 5 },
            borderTop: '1px solid rgba(17,17,17,0.06)',
            textAlign: 'center',
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              color: 'rgba(17,17,17,0.4)',
              fontFamily: '"Fragment Mono", monospace',
              mb: 1.5,
            }}
          >
            Torneos TrendSport · Gestor de Torneos
          </Typography>
          <Button
            component={Link}
            to="/"
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: BLACK,
              textTransform: 'none',
              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
            }}
          >
            Crea tu propio torneo gratis
          </Button>
        </Box>
      </Box>

      {/* ═══════ MODAL DE APUESTA ═══════ */}
      <BetModal
        open={Boolean(betMatch)}
        onClose={() => setBetMatch(null)}
        match={betMatch}
        getTeam={getTeam}
        onPlaced={() => loadBetsData()}
      />
    </Box>
  );
}