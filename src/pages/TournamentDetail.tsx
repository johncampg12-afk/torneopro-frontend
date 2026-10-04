import { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Button, IconButton, Stack, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, keyframes, useMediaQuery,
  Chip, Tooltip, Collapse, CircularProgress,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LinkIcon from '@mui/icons-material/Link';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TableChartIcon from '@mui/icons-material/TableChart';
import GroupsIcon from '@mui/icons-material/Groups';
import BarChartIcon from '@mui/icons-material/BarChart';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CloseIcon from '@mui/icons-material/Close';
import ViewListIcon from '@mui/icons-material/ViewList';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PaidIcon from '@mui/icons-material/Paid';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { BracketView } from '../components/BracketView';
import { SMOOTH, SPRING, BLACK } from '../theme';

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;
const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;
const confettiFall = keyframes`
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
`;

const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1'];

const confettiPieces = Array.from({ length: 60 }).map((_, i) => ({
  id: i,
  color: colors[i % colors.length],
  left: Math.random() * 100,
  delay: Math.random() * 2,
  duration: 2 + Math.random() * 3,
}));

const formatName = (f: string) =>
  ({
    liga: 'Liga',
    eliminatoria: 'Eliminación Directa',
    grupos: 'Grupos + Eliminatoria',
    'dos-ligas': '2 Ligas + Eliminatoria',
  }[f] || f);

// ═══════════ Cálculo de clasificación (reutilizable) ═══════════
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

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDesktop = useMediaQuery('(min-width: 900px)');

  const [tournament, setTournament] = useState<any>(null);
  const [tab, setTab] = useState('fixture');
  const [view, setView] = useState<'list' | 'bracket'>('list');
  const [loading, setLoading] = useState(true);

  const [editMatch, setEditMatch] = useState<any>(null);
  const [editRound, setEditRound] = useState<any>(null);
  const [savingMatch, setSavingMatch] = useState(false);
  const [matchEvents, setMatchEvents] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState({ playerId: '', type: 'GOAL', minute: '' });
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEventType, setEditEventType] = useState('');
  const [editEventMinute, setEditEventMinute] = useState('');

  const [playersByTeam, setPlayersByTeam] = useState<Record<string, any[]>>({});

  const [addPlayerForTeam, setAddPlayerForTeam] = useState<string | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerNumber, setNewPlayerNumber] = useState('');

  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [editingPlayerName, setEditingPlayerName] = useState('');
  const [editingPlayerNumber, setEditingPlayerNumber] = useState('');

  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState('');

  const [topScorers, setTopScorers] = useState<any[]>([]);

  const [showChampion, setShowChampion] = useState(false);
  const [championTeam, setChampionTeam] = useState<any>(null);

  const [addTeamsDialog, setAddTeamsDialog] = useState(false);
  const [newTeams, setNewTeams] = useState([{ name: '', color: colors[0], logo: null as string | null }]);

  const [addMatchDialog, setAddMatchDialog] = useState<string | null>(null);
  const [newMatchData, setNewMatchData] = useState({ homeTeamId: '', awayTeamId: '', date: '', time: '', location: '' });

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'match' | 'team' | 'player'; id: string; teamId?: string; name?: string } | null>(null);

  // Estado de desplegables
  const [openRounds, setOpenRounds] = useState<Record<string, boolean>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    liga: true,
    'liga-a': true,
    'liga-b': true,
    eliminatorias: true,
  });

  // Estado de apuestas
  const [betsStatus, setBetsStatus] = useState<Record<string, { hasPending: boolean; count: number }>>({});
  const [resolvingBets, setResolvingBets] = useState(false);

  // ── Standings general (todos los equipos) ──
  const standings = useMemo(() => {
    if (!tournament) return [];
    return computeStandings(tournament.teams, tournament.rounds);
  }, [tournament]);

  // ── Standings Liga A ──
  const standingsA = useMemo(() => {
    if (!tournament || tournament.format !== 'dos-ligas') return [];
    const roundsA = tournament.rounds.filter((r: any) => r.groupName === 'Liga A');
    const teamIds = new Set<string>();
    roundsA.forEach((r: any) => r.matches.forEach((m: any) => {
      if (m.homeTeamId) teamIds.add(m.homeTeamId);
      if (m.awayTeamId) teamIds.add(m.awayTeamId);
    }));
    const teams = tournament.teams.filter((t: any) => teamIds.has(t.id));
    return computeStandings(teams, roundsA);
  }, [tournament]);

  // ── Standings Liga B ──
  const standingsB = useMemo(() => {
    if (!tournament || tournament.format !== 'dos-ligas') return [];
    const roundsB = tournament.rounds.filter((r: any) => r.groupName === 'Liga B');
    const teamIds = new Set<string>();
    roundsB.forEach((r: any) => r.matches.forEach((m: any) => {
      if (m.homeTeamId) teamIds.add(m.homeTeamId);
      if (m.awayTeamId) teamIds.add(m.awayTeamId);
    }));
    const teams = tournament.teams.filter((t: any) => teamIds.has(t.id));
    return computeStandings(teams, roundsB);
  }, [tournament]);

  // ── Carga inicial ──
  useEffect(() => {
    if (!user) { navigate('/welcome'); return; }
    api.get(`/tournaments/${id}`)
      .then(res => setTournament(res.data))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  useEffect(() => {
    if (!tournament) return;
    const fetch = async () => {
      const map: Record<string, any[]> = {};
      for (const team of tournament.teams) {
        try {
          const res = await api.get(`/players/team/${team.id}`);
          map[team.id] = res.data;
        } catch {}
      }
      setPlayersByTeam(map);
    };
    fetch();
  }, [tournament]);

  useEffect(() => {
    if (editMatch) {
      api.get(`/matches/${editMatch.id}/events`)
        .then(res => setMatchEvents(res.data))
        .catch(() => setMatchEvents([]));
      [editMatch.homeTeamId, editMatch.awayTeamId].forEach(async teamId => {
        if (teamId && !playersByTeam[teamId]) {
          const res = await api.get(`/players/team/${teamId}`);
          setPlayersByTeam(prev => ({ ...prev, [teamId]: res.data }));
        }
      });
    } else {
      setMatchEvents([]);
    }
  }, [editMatch]);

  useEffect(() => {
    if (tournament) {
      api.get(`/tournaments/${tournament.id}/top-scorers`)
        .then(res => setTopScorers(res.data))
        .catch(() => {});
    }
  }, [tournament]);

  // ── Cargar estado de apuestas del torneo ──
  useEffect(() => {
    if (!tournament) return;
    const loadBetsStatus = async () => {
      const map: Record<string, { hasPending: boolean; count: number }> = {};
      for (const round of tournament.rounds) {
        for (const m of round.matches) {
          if (!m.played) continue;
          try {
            const res = await api.get(`/matches/${m.id}/bets-status`);
            if (res.data.count > 0) map[m.id] = res.data;
          } catch {}
        }
      }
      setBetsStatus(map);
    };
    loadBetsStatus();
  }, [tournament]);

  if (loading) return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60dvh' }}>
      <Box sx={{
        width: 32, height: 32,
        border: '3px solid rgba(17,17,17,0.1)',
        borderTopColor: BLACK, borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
      }} />
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

  // ── Handlers ──

  const toggleRound = (key: string) =>
    setOpenRounds(prev => ({ ...prev, [key]: prev[key] === false ? true : false }));

  const toggleSection = (key: string) =>
    setOpenSections(prev => ({ ...prev, [key]: prev[key] === false ? true : false }));

  const handleCopyLink = () => {
    const url = `${window.location.origin}/t/${tournament.shareCode}`;
    navigator.clipboard.writeText(url);
    const el = document.createElement('div');
    el.textContent = 'Enlace copiado';
    el.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0A0A0A;color:white;padding:10px 20px;border-radius:999px;font-size:13px;font-weight:600;z-index:9999;font-family:inherit;box-shadow:0 8px 24px rgba(0,0,0,0.2);`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  };

  const handleTogglePublic = async () => {
    try {
      await api.patch(`/tournaments/${id}`, { isPublic: !tournament.isPublic });
      setTournament({ ...tournament, isPublic: !tournament.isPublic });
    } catch {}
  };

  const reloadTournament = async () => {
    const res = await api.get(`/tournaments/${id}`);
    setTournament(res.data);
    return res.data;
  };

  const saveMatch = async () => {
    if (!editMatch || !editRound) return;
    setSavingMatch(true);
    const homeScore = parseInt((document.getElementById('homeScore') as HTMLInputElement).value) || 0;
    const awayScore = parseInt((document.getElementById('awayScore') as HTMLInputElement).value) || 0;
    const date = (document.getElementById('matchDate') as HTMLInputElement).value;
    const time = (document.getElementById('matchTime') as HTMLInputElement).value;
    const location = (document.getElementById('matchLocation') as HTMLInputElement).value;
    const body: any = { homeScore, awayScore, date, time, location };
    if (!editMatch.played) {
      body.homeTeamId = editMatch.homeTeamId;
      body.awayTeamId = editMatch.awayTeamId;
    }
    try {
      await api.patch(`/matches/${editMatch.id}`, body);
      const fresh = await reloadTournament();
      const updated = fresh.rounds.flatMap((r: any) => r.matches).find((m: any) => m.id === editMatch.id);
      if (updated?.played && updated.round?.name === 'Final' && updated.winnerId) {
        const winner = fresh.teams.find((t: any) => t.id === updated.winnerId);
        if (winner) {
          setChampionTeam(winner);
          setShowChampion(true);
          setTimeout(() => setShowChampion(false), 10000);
        }
      }

      try {
        const betsRes = await api.get(`/matches/${editMatch.id}/bets-status`);
        setBetsStatus(prev => {
          const copy = { ...prev };
          if (betsRes.data.count > 0) copy[editMatch.id] = betsRes.data;
          else delete copy[editMatch.id];
          return copy;
        });
      } catch {}

      setEditMatch(null);
    } catch {
      // silencioso
    } finally {
      setSavingMatch(false);
    }
  };

  const handleResolveBets = async () => {
    if (!editMatch) return;
    if (!confirm('¿Repartir los premios de este partido? Esta acción no se puede deshacer.')) return;
    setResolvingBets(true);
    try {
      await api.post(`/matches/${editMatch.id}/resolve-bets`);
      const el = document.createElement('div');
      el.textContent = '✅ Premios repartidos';
      el.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0A0A0A;color:white;padding:10px 20px;border-radius:999px;font-size:13px;font-weight:600;z-index:9999;font-family:inherit;box-shadow:0 8px 24px rgba(0,0,0,0.2);`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2200);
      const res = await api.get(`/matches/${editMatch.id}/bets-status`);
      setBetsStatus(prev => {
        const copy = { ...prev };
        if (res.data.count > 0) copy[editMatch.id] = res.data;
        else delete copy[editMatch.id];
        return copy;
      });
      setEditMatch(null);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error al repartir premios');
    } finally {
      setResolvingBets(false);
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    setDeleteConfirm({ type: 'match', id: matchId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'match') {
        await api.delete(`/matches/${deleteConfirm.id}`);
        await reloadTournament();
        if (editMatch?.id === deleteConfirm.id) setEditMatch(null);
      } else if (deleteConfirm.type === 'team') {
        await api.delete(`/teams/${deleteConfirm.id}`);
        await reloadTournament();
        setPlayersByTeam(prev => { const c = { ...prev }; delete c[deleteConfirm.id]; return c; });
      } else if (deleteConfirm.type === 'player') {
        await api.delete(`/players/${deleteConfirm.id}`);
        const res = await api.get(`/players/team/${deleteConfirm.teamId}`);
        setPlayersByTeam(prev => ({ ...prev, [deleteConfirm.teamId!]: res.data }));
      }
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar');
      setDeleteConfirm(null);
    }
  };

  // ── Jugadores ──
  const handleAddPlayer = async () => {
    if (!addPlayerForTeam || !newPlayerName.trim()) return;
    try {
      await api.post(`/players/team/${addPlayerForTeam}`, {
        name: newPlayerName,
        number: newPlayerNumber ? parseInt(newPlayerNumber) : undefined,
      });
      const res = await api.get(`/players/team/${addPlayerForTeam}`);
      setPlayersByTeam(prev => ({ ...prev, [addPlayerForTeam]: res.data }));
      setAddPlayerForTeam(null);
      setNewPlayerName('');
      setNewPlayerNumber('');
    } catch {}
  };

  const saveEditPlayer = async () => {
    if (!editingPlayer || !editingPlayerName.trim()) return;
    try {
      await api.patch(`/players/${editingPlayer.id}`, {
        name: editingPlayerName,
        number: editingPlayerNumber ? parseInt(editingPlayerNumber) : null,
      });
      const res = await api.get(`/players/team/${editingPlayer.teamId}`);
      setPlayersByTeam(prev => ({ ...prev, [editingPlayer.teamId]: res.data }));
      setEditingPlayer(null);
    } catch {}
  };

  // ── Equipos ──
  const saveEditTeam = async () => {
    if (!editingTeamId || !editingTeamName.trim()) return;
    try {
      await api.patch(`/teams/${editingTeamId}`, { name: editingTeamName });
      await reloadTournament();
      setEditingTeamId(null);
    } catch {}
  };

  const handleTeamLogoChange = async (teamId: string, file: File) => {
    if (!file) return;
    if (file.size > 200000) { alert('La imagen no debe superar 200 KB'); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await api.patch(`/teams/${teamId}`, { logo: reader.result as string });
        await reloadTournament();
      } catch { alert('Error al subir el escudo'); }
    };
    reader.readAsDataURL(file);
  };

  const saveTeamAsTemplate = async (team: any) => {
    const players = playersByTeam[team.id] || [];
    try {
      await api.post('/team-templates', {
        name: team.name,
        color: team.color,
        logo: team.logo,
        players: players.map(p => ({ name: p.name, number: p.number })),
      });
      const el = document.createElement('div');
      el.textContent = 'Plantilla guardada';
      el.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0A0A0A;color:white;padding:10px 20px;border-radius:999px;font-size:13px;font-weight:600;z-index:9999;font-family:inherit;box-shadow:0 8px 24px rgba(0,0,0,0.2);`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1800);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar plantilla');
    }
  };

  // ── Eventos ──
  const handleAddEvent = async () => {
    if (!editMatch || !newEvent.playerId) return;
    try {
      await api.post(`/matches/${editMatch.id}/events`, {
        playerId: newEvent.playerId,
        type: newEvent.type,
        minute: newEvent.minute ? parseInt(newEvent.minute) : undefined,
      });
      const res = await api.get(`/matches/${editMatch.id}/events`);
      setMatchEvents(res.data);
      setNewEvent({ playerId: '', type: 'GOAL', minute: '' });
    } catch {}
  };

  const handleSaveEditEvent = async (eventId: string) => {
    if (!editEventType) return;
    try {
      await api.patch(`/matches/events/${eventId}`, {
        type: editEventType,
        minute: editEventMinute ? parseInt(editEventMinute) : null,
      });
      const res = await api.get(`/matches/${editMatch.id}/events`);
      setMatchEvents(res.data);
      setEditingEventId(null);
    } catch {}
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await api.delete(`/matches/events/${eventId}`);
      const res = await api.get(`/matches/${editMatch.id}/events`);
      setMatchEvents(res.data);
    } catch {}
  };

  // ── Añadir equipos ──
  const handleAddTeams = async () => {
    const valid = newTeams.filter(t => t.name.trim()).map(t => ({
      name: t.name.trim(), color: t.color, logo: t.logo || null,
    }));
    if (valid.length === 0) return;
    try {
      await api.post(`/teams/bulk/${id}`, { teams: valid });
      await reloadTournament();
      setAddTeamsDialog(false);
      setNewTeams([{ name: '', color: colors[0], logo: null }]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al añadir equipos');
    }
  };

  // ── Añadir partido ──
  const handleAddMatch = async () => {
    if (!addMatchDialog) return;
    try {
      await api.post(`/matches/round/${addMatchDialog}`, newMatchData);
      await reloadTournament();
      setAddMatchDialog(null);
      setNewMatchData({ homeTeamId: '', awayTeamId: '', date: '', time: '', location: '' });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al añadir partido');
    }
  };

  // ── Estilos comunes ──
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '14px',
      bgcolor: 'white',
      minHeight: 50,
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
          color: 'white',
          fontWeight: 800,
          fontSize: fs,
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

  // ── Render helpers para el fixture ──
  const renderMatchCard = (match: any, round: any) => {
    const home = getTeam(match.homeTeamId);
    const away = getTeam(match.awayTeamId);
    const pendingBets = betsStatus[match.id];

    return (
      <Box
        key={match.id}
        sx={{
          position: 'relative',
          // ⬇️ COMPACTO
          p: { xs: 1, sm: 1.25 },
          borderRadius: '14px',
          bgcolor: match.played ? 'rgba(17,17,17,0.02)' : '#FAFAF8',
          border: '1px solid',
          borderColor: match.played ? 'rgba(17,17,17,0.08)' : 'rgba(17,17,17,0.04)',
          cursor: 'pointer',
          transition: `all 0.2s ${SMOOTH}`,
          '&:hover': {
            borderColor: 'rgba(17,17,17,0.2)',
            '& .delete-btn': { opacity: 1 },
          },
        }}
        onClick={() => { setEditMatch(match); setEditRound(round); }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}>
            <TeamBadge team={home} size="sm" reverse />
          </Box>

          <Box
            sx={{
              // ⬇️ COMPACTO
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
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>
                  –
                </Typography>
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

          <IconButton
            className="delete-btn"
            size="small"
            onClick={(e) => { e.stopPropagation(); handleDeleteMatch(match.id); }}
            sx={{
              position: 'absolute',
              top: 6, right: 6,
              width: 26, height: 26,
              opacity: 0,
              transition: `opacity 0.2s ${SMOOTH}`,
              color: 'rgba(17,17,17,0.4)',
              bgcolor: 'white',
              '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' },
            }}
          >
            <DeleteOutlinedIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>

        {pendingBets?.hasPending && (
          // ⬇️ COMPACTO: mt 1.25 → 0.75
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.75 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.25,
                py: 0.4,
                borderRadius: '999px',
                bgcolor: 'rgba(220,38,38,0.1)',
                color: '#DC2626',
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: 0.3,
              }}
            >
              <PaidIcon sx={{ fontSize: 12 }} />
              {pendingBets.count} sin repartir
            </Box>
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

  const renderCollapsibleRound = (round: any, keyPrefix = '') => {
    const key = `${keyPrefix}${round.id}`;
    const isOpen = openRounds[key] !== false;
    return (
      <Box
        key={key}
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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              onClick={(e) => { e.stopPropagation(); setAddMatchDialog(round.id); }}
              startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              sx={{
                // ⬇️ COMPACTO: height 34 → 30, px 1.75 → 1.5, fontSize 12.5 → 12
                height: 30,
                borderRadius: '999px',
                px: 1.5,
                fontWeight: 600,
                fontSize: 12,
                color: BLACK,
                border: '1px solid rgba(17,17,17,0.1)',
                '&:hover': { borderColor: 'rgba(17,17,17,0.3)', bgcolor: 'transparent' },
              }}
            >
              Partido
            </Button>
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
        </Box>

        <Collapse in={isOpen} timeout={250}>
          {/* ⬇️ COMPACTO: px 2/2.5 → 1.5/2, pb 2/2.5 → 1.5/2, gap 1 → 0.75 */}
          <Box sx={{ px: { xs: 1.5, md: 2 }, pb: { xs: 1.5, md: 2 }, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {round.matches.map((m: any) => renderMatchCard(m, round))}
          </Box>
        </Collapse>
      </Box>
    );
  };

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
            transition: `background-color 0.2s ${SMOOTH}`,
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
          <Box sx={{ px: { xs: 1.75, md: 2.25 }, pb: { xs: 1.75, md: 2.25 }, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {content}
          </Box>
        </Collapse>
      </Box>
    );
  };

  // ── Tabla de posiciones reutilizable (para 1 o 2 tablas) ──
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
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
          <Box component="thead">
            <Box component="tr" sx={{ bgcolor: 'rgba(17,17,17,0.02)' }}>
              {['#', 'Equipo', 'PJ', 'G', 'E', 'P', 'GF', 'GC', 'DG', 'Pts'].map((h, i) => (
                <Box
                  component="th"
                  key={h}
                  sx={{
                    px: { xs: 1, md: 2 },
                    // ⬇️ COMPACTO: 1.75 → 1.25
                    py: 1.25,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                    color: 'rgba(17,17,17,0.45)',
                    textAlign: i === 1 ? 'left' : 'center',
                    display: { xs: (h === 'GF' || h === 'GC') ? 'none' : 'table-cell', sm: 'table-cell' },
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
                  bgcolor: idx < 2 ? 'rgba(34,197,94,0.05)' : 'transparent',
                  transition: `background-color 0.2s ${SMOOTH}`,
                  '&:hover': { bgcolor: 'rgba(17,17,17,0.02)' },
                }}
              >
                {/* ⬇️ COMPACTO: py 1.5 → 0.9 */}
                <Box component="td" sx={{ px: { xs: 1, md: 2 }, py: 0.9, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 26, height: 26,
                      borderRadius: '8px',
                      display: 'inline-grid',
                      placeItems: 'center',
                      fontWeight: 800,
                      fontSize: 12,
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
                {/* ⬇️ COMPACTO: py 1.5 → 0.9 */}
                <Box component="td" sx={{ px: { xs: 1, md: 2 }, py: 0.9 }}>
                  <TeamBadge team={team} size="sm" />
                </Box>
                {['played', 'wins', 'draws', 'losses', 'gf', 'ga', 'gd'].map((field) => (
                  <Box
                    component="td"
                    key={field}
                    sx={{
                      px: { xs: 1, md: 2 },
                      // ⬇️ COMPACTO: py 1.5 → 0.9
                      py: 0.9,
                      textAlign: 'center',
                      fontSize: 13.5,
                      fontWeight: field === 'wins' ? 700 : 500,
                      color: field === 'wins' ? '#16A34A'
                        : field === 'draws' ? '#D97706'
                        : field === 'losses' ? '#DC2626'
                        : BLACK,
                      display: { xs: (field === 'gf' || field === 'ga') ? 'none' : 'table-cell', sm: 'table-cell' },
                    }}
                  >
                    {field === 'gd' ? (team.gd > 0 ? '+' : '') + team.gd : team[field]}
                  </Box>
                ))}
                {/* ⬇️ COMPACTO: py 1.5 → 0.9 */}
                <Box component="td" sx={{ px: { xs: 1, md: 2 }, py: 0.9, textAlign: 'center' }}>
                  <Typography
                    sx={{
                      fontSize: 16,
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
      <Box
        sx={{
          maxWidth: 1280,
          mx: 'auto',
          width: '100%',
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 3, md: 5 },
        }}
      >
        {/* ═══════════ HEADER ═══════════ */}
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
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2.5 }}>
            <IconButton
              onClick={() => navigate('/dashboard')}
              sx={{
                width: 40, height: 40, flexShrink: 0,
                bgcolor: 'rgba(17,17,17,0.04)',
                color: 'rgba(17,17,17,0.7)',
                '&:hover': { bgcolor: 'rgba(17,17,17,0.08)' },
                '&:active': { transform: 'scale(0.94)' },
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </IconButton>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 20, md: 26 },
                    fontWeight: 800,
                    letterSpacing: -0.8,
                    lineHeight: 1.15,
                    color: BLACK,
                    fontFamily: '"Instrument Sans", system-ui, sans-serif',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {tournament.name}
                </Typography>
                <Chip
                  label={tournament.isPublic ? 'Público' : 'Privado'}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: 0.3,
                    bgcolor: tournament.isPublic ? 'rgba(34,197,94,0.12)' : 'rgba(17,17,17,0.06)',
                    color: tournament.isPublic ? '#16A34A' : 'rgba(17,17,17,0.6)',
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: 13.5, color: 'rgba(17,17,17,0.5)', fontWeight: 500 }}>
                {formatName(tournament.format)} · {tournament.teams.length} equipos
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
            <Button
              onClick={handleCopyLink}
              startIcon={<LinkIcon sx={{ fontSize: 16 }} />}
              sx={{
                height: 40,
                borderRadius: '999px',
                px: 2.5,
                fontWeight: 600,
                fontSize: 13.5,
                color: BLACK,
                bgcolor: 'white',
                border: '1.5px solid rgba(17,17,17,0.1)',
                '&:hover': { borderColor: 'rgba(17,17,17,0.3)', bgcolor: 'white' },
              }}
            >
              Compartir
            </Button>
            <Button
              onClick={handleTogglePublic}
              startIcon={tournament.isPublic ? <VisibilityOffIcon sx={{ fontSize: 16 }} /> : <VisibilityIcon sx={{ fontSize: 16 }} />}
              sx={{
                height: 40,
                borderRadius: '999px',
                px: 2.5,
                fontWeight: 600,
                fontSize: 13.5,
                color: BLACK,
                bgcolor: 'white',
                border: '1.5px solid rgba(17,17,17,0.1)',
                '&:hover': { borderColor: 'rgba(17,17,17,0.3)', bgcolor: 'white' },
              }}
            >
              {tournament.isPublic ? 'Ocultar' : 'Publicar'}
            </Button>
          </Box>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(17,17,17,0.4)' }}>
                Progreso
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: BLACK }}>
                  {playedMatches}/{totalMatches}
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'rgba(17,17,17,0.5)' }}>partidos</Typography>
              </Box>
            </Box>
            <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(17,17,17,0.06)', overflow: 'hidden' }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${progress}%`,
                  bgcolor: BLACK,
                  borderRadius: 3,
                  transition: `width 0.6s ${SMOOTH}`,
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* ═══════════ TABS ═══════════ */}
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
                height: 34,
                borderRadius: '999px',
                px: { xs: 1, sm: 2 },
                gap: 0.75,
                fontWeight: 700,
                fontSize: 13,
                color: tab === t.id ? 'white' : 'rgba(17,17,17,0.6)',
                bgcolor: tab === t.id ? BLACK : 'transparent',
                transition: `all 0.25s ${SMOOTH}`,
                '&:hover': { bgcolor: tab === t.id ? BLACK : 'rgba(17,17,17,0.04)' },
                '& .MuiButton-startIcon': { display: 'none' },
              }}
            >
              <t.Icon sx={{ fontSize: 18, flexShrink: 0 }} />
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{t.label}</Box>
            </Button>
          ))}
        </Box>

        {/* ═══════════ FIXTURE ═══════════ */}
        {tab === 'fixture' && (
          // ⬇️ COMPACTO: gap 2.5 → 1.75
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, animation: `${fadeInUp} 0.4s ${SMOOTH} both` }}>

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
                      transition: `all 0.25s ${SMOOTH}`,
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
                      transition: `all 0.25s ${SMOOTH}`,
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
              /* ═══ 2 LIGAS + ELIMINATORIA ═══ */
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
                      {/* Liga A y Liga B en paralelo */}
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                          // ⬇️ COMPACTO: gap 2.5 → 1.75
                          gap: 1.75,
                          alignItems: 'flex-start',
                        }}
                      >
                        {ligaARounds.length > 0 && (
                          <Box sx={{ minWidth: 0 }}>
                            {renderSection(
                              'liga-a',
                              'Liga A',
                              `${aPlayed}/${aTotal} partidos jugados`,
                              ligaARounds.map((r: any) => renderCollapsibleRound(r, 'liga-a-'))
                            )}
                          </Box>
                        )}
                        {ligaBRounds.length > 0 && (
                          <Box sx={{ minWidth: 0 }}>
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
            ) : tournament.format === 'grupos' ? (
              /* ═══ GRUPOS (una sola liga) ═══ */
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
              /* ═══ LIGA PURA O ELIMINATORIA PURA ═══ */
              <>
                {tournament.rounds.map((round: any) => renderCollapsibleRound(round))}
              </>
            )}

            {/* ── Campeón ── */}
            {showChampion && championTeam && (
              <Box
                sx={{
                  position: 'relative',
                  p: { xs: 4, md: 6 },
                  borderRadius: '24px',
                  bgcolor: BLACK,
                  overflow: 'hidden',
                  animation: `${scaleIn} 0.6s ${SPRING} both`,
                }}
              >
                <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                  {confettiPieces.map(p => (
                    <Box
                      key={p.id}
                      sx={{
                        position: 'absolute',
                        width: 10, height: 10,
                        borderRadius: '50%',
                        bgcolor: p.color,
                        left: `${p.left}%`,
                        top: -10,
                        animation: `${confettiFall} ${p.duration}s ${p.delay}s ease-in infinite`,
                      }}
                    />
                  ))}
                </Box>

                <Stack alignItems="center" spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
                  <EmojiEventsIcon sx={{ fontSize: 56, color: '#FBBF24' }} />
                  {championTeam.logo ? (
                    <Box
                      component="img"
                      src={championTeam.logo}
                      alt={championTeam.name}
                      sx={{
                        width: { xs: 128, md: 160 },
                        height: { xs: 128, md: 160 },
                        borderRadius: '32px',
                        objectFit: 'cover',
                        border: '4px solid #FBBF24',
                        boxShadow: '0 20px 60px rgba(251,191,36,0.3)',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: { xs: 128, md: 160 },
                        height: { xs: 128, md: 160 },
                        borderRadius: '32px',
                        bgcolor: championTeam.color,
                        display: 'grid',
                        placeItems: 'center',
                        color: 'white',
                        fontWeight: 900,
                        fontSize: 56,
                        border: '4px solid #FBBF24',
                        fontFamily: '"Instrument Sans", system-ui, sans-serif',
                      }}
                    >
                      {championTeam.name.substring(0, 2).toUpperCase()}
                    </Box>
                  )}
                  <Typography
                    sx={{
                      fontSize: { xs: 28, md: 40 },
                      fontWeight: 900,
                      color: 'white',
                      letterSpacing: -1,
                      textAlign: 'center',
                      fontFamily: '"Instrument Sans", system-ui, sans-serif',
                    }}
                  >
                    {championTeam.name}
                  </Typography>
                  <Typography sx={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                    ¡Campeón!
                  </Typography>
                  <Button
                    onClick={() => setShowChampion(false)}
                    sx={{
                      mt: 2,
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: 13,
                      '&:hover': { color: 'white', bgcolor: 'transparent' },
                    }}
                  >
                    Cerrar
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        )}

        {/* ═══════════ STANDINGS ═══════════ */}
        {tab === 'standings' && (
          tournament.format === 'dos-ligas' ? (
            /* ═══ 2 TABLAS EN PARALELO ═══ */
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                // ⬇️ COMPACTO: gap 2.5 → 1.75
                gap: 1.75,
                alignItems: 'flex-start',
                animation: `${fadeInUp} 0.4s ${SMOOTH} both`,
              }}
            >
              {renderStandingsTable(standingsA, 'Liga A')}
              {renderStandingsTable(standingsB, 'Liga B')}
            </Box>
          ) : (
            /* ═══ TABLA ÚNICA ═══ */
            <Box sx={{ animation: `${fadeInUp} 0.4s ${SMOOTH} both` }}>
              {renderStandingsTable(standings)}
            </Box>
          )
        )}

        {/* ═══════════ TEAMS ═══════════ */}
        {tab === 'teams' && (
          <Box sx={{ animation: `${fadeInUp} 0.4s ${SMOOTH} both` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: BLACK }}>
                {tournament.teams.length} equipos
              </Typography>
              <Button
                onClick={() => setAddTeamsDialog(true)}
                startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                sx={{
                  height: 36,
                  borderRadius: '999px',
                  px: 2,
                  fontWeight: 700,
                  fontSize: 13,
                  color: BLACK,
                  border: '1.5px solid rgba(17,17,17,0.1)',
                  '&:hover': { borderColor: 'rgba(17,17,17,0.3)', bgcolor: 'transparent' },
                }}
              >
                Añadir equipos
              </Button>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
              {tournament.teams.map((team: any) => {
                const teamStats = standings.find((s: any) => s.id === team.id);
                const players = playersByTeam[team.id] || [];
                const isEditing = editingTeamId === team.id;
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
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                      {isEditing ? (
                        <Stack spacing={1.5} sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              value={editingTeamName}
                              onChange={e => setEditingTeamName(e.target.value)}
                              size="small"
                              autoFocus
                              fullWidth
                              onKeyDown={e => e.key === 'Enter' && saveEditTeam()}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  height: 40, borderRadius: '10px', bgcolor: 'white',
                                  '& fieldset': { borderColor: 'rgba(17,17,17,0.08)' },
                                  '&.Mui-focused fieldset': { borderColor: BLACK },
                                },
                                '& input': { fontSize: 14, fontWeight: 600, py: 0 },
                              }}
                            />
                            <IconButton
                              onClick={saveEditTeam}
                              size="small"
                              sx={{ bgcolor: BLACK, color: 'white', '&:hover': { bgcolor: '#1a1a1a' } }}
                            >
                              <SaveOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <input
                              type="file"
                              accept="image/*"
                              id={`edit-logo-${team.id}`}
                              hidden
                              onChange={(e) => { if (e.target.files?.[0]) handleTeamLogoChange(team.id, e.target.files[0]); }}
                            />
                            <Box
                              component="label"
                              htmlFor={`edit-logo-${team.id}`}
                              sx={{
                                display: 'flex', alignItems: 'center', gap: 0.75,
                                px: 1.5, py: 0.75, borderRadius: '999px',
                                cursor: 'pointer',
                                fontSize: 12, fontWeight: 600,
                                color: 'rgba(17,17,17,0.6)',
                                '&:hover': { bgcolor: 'rgba(17,17,17,0.04)' },
                              }}
                            >
                              <ImageOutlinedIcon sx={{ fontSize: 14 }} />
                              {team.logo ? 'Cambiar escudo' : 'Añadir escudo'}
                            </Box>
                            <IconButton
                              onClick={() => setEditingTeamId(null)}
                              size="small"
                              sx={{ color: 'rgba(17,17,17,0.4)' }}
                            >
                              <CloseIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        </Stack>
                      ) : (
                        <>
                          <TeamBadge team={team} size="md" />
                          <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Guardar como plantilla">
                              <IconButton
                                size="small"
                                onClick={() => saveTeamAsTemplate(team)}
                                sx={{ color: 'rgba(17,17,17,0.4)', '&:hover': { color: BLACK } }}
                              >
                                <SaveOutlinedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => { setEditingTeamId(team.id); setEditingTeamName(team.name); }}
                                sx={{ color: 'rgba(17,17,17,0.4)', '&:hover': { color: BLACK } }}
                              >
                                <EditOutlinedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton
                                size="small"
                                onClick={() => setDeleteConfirm({ type: 'team', id: team.id, name: team.name })}
                                sx={{ color: 'rgba(17,17,17,0.4)', '&:hover': { color: '#DC2626' } }}
                              >
                                <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </>
                      )}
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 2 }}>
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
                          <Typography sx={{ fontSize: 16, fontWeight: 800, color: s.color, fontFamily: '"Instrument Sans", system-ui, sans-serif', lineHeight: 1 }}>
                            {s.value}
                          </Typography>
                          <Typography sx={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(17,17,17,0.4)', mt: 0.5 }}>
                            {s.label}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <Box sx={{ pt: 2, borderTop: '1px solid rgba(17,17,17,0.06)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography sx={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', color: 'rgba(17,17,17,0.45)' }}>
                          Jugadores ({players.length})
                        </Typography>
                        <Button
                          onClick={() => setAddPlayerForTeam(team.id)}
                          sx={{
                            minWidth: 0,
                            p: '2px 8px',
                            fontSize: 11.5,
                            fontWeight: 700,
                            color: BLACK,
                            borderRadius: '999px',
                            '&:hover': { bgcolor: 'rgba(17,17,17,0.04)' },
                          }}
                        >
                          + Añadir
                        </Button>
                      </Box>
                      {players.length === 0 ? (
                        <Typography sx={{ fontSize: 12, color: 'rgba(17,17,17,0.35)', fontStyle: 'italic' }}>
                          Sin jugadores
                        </Typography>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 160, overflowY: 'auto' }}>
                          {players.map((player: any) => (
                            <Box
                              key={player.id}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                py: 0.75,
                                px: 0.5,
                                borderRadius: '8px',
                                transition: `all 0.15s ${SMOOTH}`,
                                '&:hover': {
                                  bgcolor: 'rgba(17,17,17,0.03)',
                                  '& .player-actions': { opacity: 1 },
                                },
                              }}
                            >
                              <Typography sx={{ fontSize: 13.5, fontWeight: 500, color: BLACK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {player.number && (
                                  <Box component="span" sx={{ color: 'rgba(17,17,17,0.4)', fontWeight: 700, mr: 0.75 }}>
                                    #{player.number}
                                  </Box>
                                )}
                                {player.name}
                              </Typography>
                              <Box className="player-actions" sx={{ display: 'flex', gap: 0.25, opacity: 0, transition: `opacity 0.15s ${SMOOTH}` }}>
                                <IconButton
                                  size="small"
                                  onClick={() => { setEditingPlayer(player); setEditingPlayerName(player.name); setEditingPlayerNumber(player.number ?? ''); }}
                                  sx={{ width: 24, height: 24, color: 'rgba(17,17,17,0.4)' }}
                                >
                                  <EditOutlinedIcon sx={{ fontSize: 13 }} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => setDeleteConfirm({ type: 'player', id: player.id, teamId: team.id, name: player.name })}
                                  sx={{ width: 24, height: 24, color: 'rgba(17,17,17,0.4)', '&:hover': { color: '#DC2626' } }}
                                >
                                  <DeleteOutlinedIcon sx={{ fontSize: 13 }} />
                                </IconButton>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* ═══════════ STATS ═══════════ */}
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
                        <Box sx={{ height: '100%', width: `${Math.min(100, (team.gf / Math.max(1, standings[0]?.gf)) * 100)}%`, bgcolor: BLACK, borderRadius: 3 }} />
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
                    .slice(0, 8).map((team: any) => (
                    <Box key={team.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <TeamBadge team={team} size="sm" />
                      <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'rgba(17,17,17,0.06)', overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', width: `${(team.wins / team.played) * 100}%`, bgcolor: '#16A34A', borderRadius: 3 }} />
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
                    <Typography sx={{ fontSize: 26, fontWeight: 900, color: BLACK, fontFamily: '"Instrument Sans", system-ui, sans-serif', lineHeight: 1 }}>
                      {s.value}
                    </Typography>
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(17,17,17,0.4)', mt: 0.75 }}>
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
                        <Typography sx={{ fontSize: 14, fontWeight: 600, color: BLACK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.teamColor }} />
                          <Typography sx={{ fontSize: 11.5, color: 'rgba(17,17,17,0.5)' }}>
                            {p.team}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontSize: 20, fontWeight: 900, color: BLACK, lineHeight: 1, fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
                          {p.goals}
                        </Typography>
                        <Typography sx={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'rgba(17,17,17,0.4)' }}>
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
      </Box>

      {/* ═══════════ MODAL EDITAR PARTIDO ═══════════ */}
      <Dialog
        open={Boolean(editMatch)}
        onClose={() => setEditMatch(null)}
        maxWidth="sm"
        fullWidth
        fullScreen={!isDesktop}
        slotProps={{
          backdrop: { sx: { bgcolor: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(6px)' } },
          paper: {
            sx: {
              borderRadius: { xs: 0, md: '24px' },
              bgcolor: '#FAFAF8',
              backgroundImage: 'none',
              p: { xs: 2.5, md: 3.5 },
              maxHeight: '95dvh',
              animation: isDesktop ? `${scaleIn} 0.3s ${SPRING} both` : 'none',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography sx={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, color: BLACK, fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
            {editMatch?.played ? 'Editar resultado' : 'Registrar resultado'}
          </Typography>
          <IconButton onClick={() => setEditMatch(null)} sx={{ color: 'rgba(17,17,17,0.5)' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {editMatch && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
              <Stack alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                {getTeam(editMatch.homeTeamId).logo ? (
                  <Box component="img" src={getTeam(editMatch.homeTeamId).logo} sx={{ width: 56, height: 56, borderRadius: '16px', objectFit: 'cover' }} />
                ) : (
                  <Box sx={{ width: 56, height: 56, borderRadius: '16px', bgcolor: getTeam(editMatch.homeTeamId).color }} />
                )}
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: BLACK, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                  {getTeam(editMatch.homeTeamId).name}
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: 16, fontWeight: 900, color: 'rgba(17,17,17,0.2)', fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
                VS
              </Typography>
              <Stack alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                {getTeam(editMatch.awayTeamId).logo ? (
                  <Box component="img" src={getTeam(editMatch.awayTeamId).logo} sx={{ width: 56, height: 56, borderRadius: '16px', objectFit: 'cover' }} />
                ) : (
                  <Box sx={{ width: 56, height: 56, borderRadius: '16px', bgcolor: getTeam(editMatch.awayTeamId).color }} />
                )}
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: BLACK, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                  {getTeam(editMatch.awayTeamId).name}
                </Typography>
              </Stack>
            </Box>

            {!editMatch.played && (
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2.5 }}>
                <Box>
                  <Typography sx={labelSx}>Local</Typography>
                  <TextField
                    select
                    fullWidth
                    value={editMatch.homeTeamId || ''}
                    onChange={e => setEditMatch({ ...editMatch, homeTeamId: e.target.value || null })}
                    SelectProps={{ native: true }}
                    sx={{ ...inputSx, '& .MuiOutlinedInput-root': { ...inputSx['& .MuiOutlinedInput-root'], minHeight: 44 } }}
                  >
                    {tournament.teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </TextField>
                </Box>
                <Box>
                  <Typography sx={labelSx}>Visitante</Typography>
                  <TextField
                    select
                    fullWidth
                    value={editMatch.awayTeamId || ''}
                    onChange={e => setEditMatch({ ...editMatch, awayTeamId: e.target.value || null })}
                    SelectProps={{ native: true }}
                    sx={{ ...inputSx, '& .MuiOutlinedInput-root': { ...inputSx['& .MuiOutlinedInput-root'], minHeight: 44 } }}
                  >
                    {tournament.teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </TextField>
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 1.5, alignItems: 'center', mb: 2.5 }}>
              <Box>
                <Typography sx={{ ...labelSx, textAlign: 'center' }}>Local</Typography>
                <TextField
                  id="homeScore"
                  type="number"
                  defaultValue={editMatch.homeScore ?? ''}
                  fullWidth
                  inputProps={{ min: 0, style: { textAlign: 'center', fontSize: 28, fontWeight: 900, fontFamily: '"Instrument Sans", system-ui, sans-serif', padding: '12px 0' } }}
                  sx={inputSx}
                />
              </Box>
              <Typography sx={{ fontSize: 20, fontWeight: 900, color: 'rgba(17,17,17,0.2)', mt: 3 }}>–</Typography>
              <Box>
                <Typography sx={{ ...labelSx, textAlign: 'center' }}>Visitante</Typography>
                <TextField
                  id="awayScore"
                  type="number"
                  defaultValue={editMatch.awayScore ?? ''}
                  fullWidth
                  inputProps={{ min: 0, style: { textAlign: 'center', fontSize: 28, fontWeight: 900, fontFamily: '"Instrument Sans", system-ui, sans-serif', padding: '12px 0' } }}
                  sx={inputSx}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 2fr' }, gap: 1.5, mb: 2.5 }}>
              <Box>
                <Typography sx={labelSx}>Fecha</Typography>
                <TextField
                  id="matchDate"
                  type="date"
                  defaultValue={editMatch.date ? editMatch.date.split('T')[0] : ''}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{ ...inputSx, '& .MuiOutlinedInput-root': { ...inputSx['& .MuiOutlinedInput-root'], minHeight: 44 } }}
                />
              </Box>
              <Box>
                <Typography sx={labelSx}>Hora</Typography>
                <TextField
                  id="matchTime"
                  type="time"
                  defaultValue={editMatch.time || ''}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{ ...inputSx, '& .MuiOutlinedInput-root': { ...inputSx['& .MuiOutlinedInput-root'], minHeight: 44 } }}
                />
              </Box>
              <Box sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}>
                <Typography sx={labelSx}>Ubicación</Typography>
                <TextField
                  id="matchLocation"
                  defaultValue={editMatch.location || ''}
                  placeholder="Cancha, estadio…"
                  fullWidth
                  sx={{ ...inputSx, '& .MuiOutlinedInput-root': { ...inputSx['& .MuiOutlinedInput-root'], minHeight: 44 } }}
                />
              </Box>
            </Box>

            <Box sx={{ pt: 2, borderTop: '1px solid rgba(17,17,17,0.08)' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: BLACK, mb: 1.5 }}>
                Eventos del partido
              </Typography>

              {matchEvents.length === 0 ? (
                <Typography sx={{ fontSize: 12.5, color: 'rgba(17,17,17,0.4)', fontStyle: 'italic', mb: 1.5 }}>
                  Sin eventos registrados
                </Typography>
              ) : (
                <Stack spacing={0.75} sx={{ mb: 1.5 }}>
                  {matchEvents.map((ev: any) => (
                    editingEventId === ev.id ? (
                      <Box key={ev.id} sx={{ display: 'flex', gap: 1, alignItems: 'center', p: 1, borderRadius: '10px', bgcolor: 'rgba(17,17,17,0.03)' }}>
                        <TextField
                          type="number"
                          value={editEventMinute}
                          onChange={e => setEditEventMinute(e.target.value)}
                          placeholder="Min"
                          sx={{ width: 60, '& .MuiOutlinedInput-root': { height: 32, borderRadius: '8px', bgcolor: 'white' }, '& input': { fontSize: 12, py: 0.5, px: 1 } }}
                        />
                        <TextField
                          select
                          value={editEventType}
                          onChange={e => setEditEventType(e.target.value)}
                          fullWidth
                          SelectProps={{ native: true }}
                          sx={{ '& .MuiOutlinedInput-root': { height: 32, borderRadius: '8px', bgcolor: 'white' }, '& select': { fontSize: 12, py: 0.5, px: 1 } }}
                        >
                          <option value="GOAL">⚽ Gol</option>
                          <option value="ASSIST">🅰️ Asistencia</option>
                          <option value="YELLOW_CARD">🟨 Amarilla</option>
                          <option value="RED_CARD">🟥 Roja</option>
                        </TextField>
                        <IconButton size="small" onClick={() => handleSaveEditEvent(ev.id)} sx={{ color: '#16A34A' }}>
                          <SaveOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => setEditingEventId(null)}>
                          <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box
                        key={ev.id}
                        sx={{
                          display: 'flex', alignItems: 'center', gap: 1.5,
                          py: 0.75, px: 1, borderRadius: '8px',
                          '&:hover': { bgcolor: 'rgba(17,17,17,0.03)', '& .ev-actions': { opacity: 1 } },
                        }}
                      >
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'rgba(17,17,17,0.4)', minWidth: 28 }}>
                          {ev.minute ? `${ev.minute}'` : ''}
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: BLACK, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ev.player.name}
                        </Typography>
                        <Chip
                          label={ev.type === 'GOAL' ? '⚽' : ev.type === 'ASSIST' ? '🅰️' : ev.type === 'YELLOW_CARD' ? '🟨' : '🟥'}
                          size="small"
                          sx={{ height: 20, fontSize: 12, bgcolor: 'rgba(17,17,17,0.05)' }}
                        />
                        <Box className="ev-actions" sx={{ display: 'flex', gap: 0.25, opacity: 0, transition: 'opacity 0.15s' }}>
                          <IconButton
                            size="small"
                            onClick={() => { setEditingEventId(ev.id); setEditEventType(ev.type); setEditEventMinute(ev.minute ?? ''); }}
                            sx={{ width: 24, height: 24 }}
                          >
                            <EditOutlinedIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteEvent(ev.id)}
                            sx={{ width: 24, height: 24, '&:hover': { color: '#DC2626' } }}
                          >
                            <DeleteOutlinedIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                        </Box>
                      </Box>
                    )
                  ))}
                </Stack>
              )}

              <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(17,17,17,0.03)' }}>
                <Stack spacing={1}>
                  <TextField
                    select
                    value={newEvent.playerId}
                    onChange={e => setNewEvent({ ...newEvent, playerId: e.target.value })}
                    fullWidth
                    SelectProps={{ native: true }}
                    sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '10px', bgcolor: 'white' }, '& select': { fontSize: 13, py: 0.75, px: 1.5 } }}
                  >
                    <option value="">Seleccionar jugador…</option>
                    {[
                      ...(playersByTeam[editMatch.homeTeamId] || []).map((p: any) => ({ ...p, _t: getTeam(editMatch.homeTeamId).name })),
                      ...(playersByTeam[editMatch.awayTeamId] || []).map((p: any) => ({ ...p, _t: getTeam(editMatch.awayTeamId).name })),
                    ].map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name} ({p._t})</option>
                    ))}
                  </TextField>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 1 }}>
                    <TextField
                      select
                      value={newEvent.type}
                      onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
                      SelectProps={{ native: true }}
                      sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '10px', bgcolor: 'white' }, '& select': { fontSize: 13, py: 0.75, px: 1.5 } }}
                    >
                      <option value="GOAL">⚽ Gol</option>
                      <option value="ASSIST">🅰️ Asistencia</option>
                      <option value="YELLOW_CARD">🟨 Amarilla</option>
                      <option value="RED_CARD">🟥 Roja</option>
                    </TextField>
                    <TextField
                      type="number"
                      placeholder="Min"
                      value={newEvent.minute}
                      onChange={e => setNewEvent({ ...newEvent, minute: e.target.value })}
                      sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '10px', bgcolor: 'white' }, '& input': { fontSize: 13, py: 0.75, px: 1.5 } }}
                    />
                  </Box>
                  <Button
                    onClick={handleAddEvent}
                    disabled={!newEvent.playerId}
                    startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      height: 38, borderRadius: '999px', fontWeight: 700, fontSize: 13,
                      bgcolor: BLACK, color: 'white',
                      '&:disabled': { bgcolor: 'rgba(17,17,17,0.06)', color: 'rgba(17,17,17,0.3)' },
                      '&:hover': { bgcolor: '#1a1a1a' },
                    }}
                  >
                    Añadir evento
                  </Button>
                </Stack>
              </Box>
            </Box>

            {editMatch.played && betsStatus[editMatch.id]?.hasPending && (
              <Box
                sx={{
                  mt: 3,
                  p: 2.5,
                  borderRadius: '16px',
                  bgcolor: 'rgba(220,38,38,0.06)',
                  border: '1.5px solid rgba(220,38,38,0.2)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 32, height: 32,
                      borderRadius: '10px',
                      bgcolor: 'rgba(220,38,38,0.12)',
                      display: 'grid', placeItems: 'center',
                      color: '#DC2626',
                      flexShrink: 0,
                    }}
                  >
                    <PaidIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#DC2626', fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
                      Apuestas pendientes
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: 'rgba(220,38,38,0.75)', mt: 0.25 }}>
                      {betsStatus[editMatch.id]?.count} apuesta{betsStatus[editMatch.id]?.count === 1 ? '' : 's'} sin repartir
                    </Typography>
                  </Box>
                </Box>
                <Button
                  fullWidth
                  disabled={resolvingBets}
                  onClick={handleResolveBets}
                  startIcon={resolvingBets ? <CircularProgress size={14} sx={{ color: 'white' }} /> : <PaidIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    height: 44,
                    borderRadius: '999px',
                    fontWeight: 700,
                    fontSize: 14,
                    bgcolor: '#DC2626',
                    color: 'white',
                    gap: 0.75,
                    '&:hover': { bgcolor: '#B91C1C' },
                    '&:disabled': { bgcolor: 'rgba(220,38,38,0.4)', color: 'white' },
                  }}
                >
                  {resolvingBets ? 'Repartiendo…' : 'Repartir premios ahora'}
                </Button>
                <Typography sx={{ fontSize: 11, color: 'rgba(220,38,38,0.7)', mt: 1.25, textAlign: 'center', lineHeight: 1.4 }}>
                  Asegúrate de que el marcador es correcto antes de repartir.
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
              <Button
                onClick={() => setEditMatch(null)}
                disabled={savingMatch}
                sx={{
                  flex: 1, height: 48, borderRadius: '999px',
                  fontWeight: 700, fontSize: 14,
                  color: BLACK, bgcolor: 'white',
                  border: '1.5px solid rgba(17,17,17,0.1)',
                  '&:hover': { borderColor: 'rgba(17,17,17,0.3)', bgcolor: 'white' },
                  '&:disabled': { opacity: 0.5 },
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={saveMatch}
                disabled={savingMatch}
                startIcon={savingMatch ? <CircularProgress size={14} sx={{ color: 'white' }} /> : <SaveOutlinedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  flex: 1, height: 48, borderRadius: '999px',
                  fontWeight: 700, fontSize: 14,
                  bgcolor: BLACK, color: 'white',
                  gap: 0.75,
                  '&:hover': { bgcolor: '#1a1a1a' },
                  '&:disabled': { bgcolor: BLACK, color: 'white', opacity: 0.85 },
                }}
              >
                {savingMatch ? 'Guardando…' : 'Guardar'}
              </Button>
            </Box>
          </>
        )}
      </Dialog>

      {/* ═══════════ MODAL AÑADIR PARTIDO ═══════════ */}
      <Dialog
        open={Boolean(addMatchDialog)}
        onClose={() => setAddMatchDialog(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          backdrop: { sx: { bgcolor: 'rgba(10,10,10,0.5)', backdropFilter: 'blur(6px)' } },
          paper: { sx: { borderRadius: '24px', bgcolor: '#FAFAF8', p: 3, backgroundImage: 'none' } },
        }}
      >
        <Typography sx={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, color: BLACK, mb: 3, fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
          Añadir partido
        </Typography>

        <Stack spacing={2}>
          <Box>
            <Typography sx={labelSx}>Local</Typography>
            <TextField
              select fullWidth value={newMatchData.homeTeamId}
              onChange={e => setNewMatchData({ ...newMatchData, homeTeamId: e.target.value })}
              SelectProps={{ native: true }} sx={inputSx}
            >
              <option value="">Seleccionar…</option>
              {tournament.teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </TextField>
          </Box>
          <Box>
            <Typography sx={labelSx}>Visitante</Typography>
            <TextField
              select fullWidth value={newMatchData.awayTeamId}
              onChange={e => setNewMatchData({ ...newMatchData, awayTeamId: e.target.value })}
              SelectProps={{ native: true }} sx={inputSx}
            >
              <option value="">Seleccionar…</option>
              {tournament.teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </TextField>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <Box>
              <Typography sx={labelSx}>Fecha</Typography>
              <TextField
                type="date" fullWidth value={newMatchData.date}
                onChange={e => setNewMatchData({ ...newMatchData, date: e.target.value })}
                InputLabelProps={{ shrink: true }} sx={inputSx}
              />
            </Box>
            <Box>
              <Typography sx={labelSx}>Hora</Typography>
              <TextField
                type="time" fullWidth value={newMatchData.time}
                onChange={e => setNewMatchData({ ...newMatchData, time: e.target.value })}
                InputLabelProps={{ shrink: true }} sx={inputSx}
              />
            </Box>
          </Box>
          <Box>
            <Typography sx={labelSx}>Ubicación</Typography>
            <TextField
              fullWidth value={newMatchData.location}
              onChange={e => setNewMatchData({ ...newMatchData, location: e.target.value })}
              placeholder="Cancha, etc." sx={inputSx}
            />
          </Box>
        </Stack>

        <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
          <Button
            onClick={() => setAddMatchDialog(null)}
            sx={{
              flex: 1, height: 46, borderRadius: '999px',
              fontWeight: 600, fontSize: 14,
              color: BLACK, bgcolor: 'white',
              border: '1.5px solid rgba(17,17,17,0.1)',
              '&:hover': { borderColor: 'rgba(17,17,17,0.3)', bgcolor: 'white' },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAddMatch}
            sx={{
              flex: 1, height: 46, borderRadius: '999px',
              fontWeight: 700, fontSize: 14,
              bgcolor: BLACK, color: 'white',
              '&:hover': { bgcolor: '#1a1a1a' },
            }}
          >
            Añadir
          </Button>
        </Box>
      </Dialog>

      {/* ═══════════ MODAL AÑADIR EQUIPOS ═══════════ */}
      <Dialog
        open={addTeamsDialog}
        onClose={() => setAddTeamsDialog(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={!isDesktop}
        slotProps={{
          backdrop: { sx: { bgcolor: 'rgba(10,10,10,0.5)', backdropFilter: 'blur(6px)' } },
          paper: {
            sx: {
              borderRadius: { xs: 0, md: '24px' },
              bgcolor: '#FAFAF8',
              p: 3,
              backgroundImage: 'none',
              maxHeight: '85dvh',
            },
          },
        }}
      >
        <Typography sx={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, color: BLACK, mb: 3, fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
          Añadir equipos
        </Typography>

        <Stack spacing={1.5} sx={{ maxHeight: '50dvh', overflowY: 'auto', mb: 2 }}>
          {newTeams.map((team, idx) => (
            <Box key={idx} sx={{ p: 2, borderRadius: '14px', bgcolor: 'white', border: '1.5px solid rgba(17,17,17,0.08)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                {team.logo ? (
                  <Box component="img" src={team.logo} sx={{ width: 40, height: 40, borderRadius: '12px', objectFit: 'cover' }} />
                ) : (
                  <Box sx={{ width: 40, height: 40, borderRadius: '12px', bgcolor: team.color, display: 'grid', placeItems: 'center', color: 'white', fontWeight: 800, fontSize: 16 }}>
                    {team.name.trim() ? team.name.trim()[0].toUpperCase() : '?'}
                  </Box>
                )}
                <TextField
                  value={team.name}
                  onChange={e => { const u = [...newTeams]; u[idx] = { ...u[idx], name: e.target.value }; setNewTeams(u); }}
                  placeholder={`Equipo ${idx + 1}`}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px', bgcolor: 'transparent', minHeight: 40,
                      '& fieldset': { borderColor: 'transparent' },
                      '&:hover fieldset': { borderColor: 'transparent' },
                      '&.Mui-focused fieldset': { borderColor: 'rgba(17,17,17,0.15)' },
                    },
                    '& input': { fontSize: 14, fontWeight: 600, color: BLACK },
                  }}
                />
                {newTeams.length > 1 && (
                  <IconButton
                    size="small"
                    onClick={() => setNewTeams(prev => prev.filter((_, i) => i !== idx))}
                    sx={{ color: 'rgba(17,17,17,0.4)', '&:hover': { color: '#DC2626' } }}
                  >
                    <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                  {colors.slice(0, 8).map(c => (
                    <Box
                      key={c}
                      onClick={() => { const u = [...newTeams]; u[idx] = { ...u[idx], color: c }; setNewTeams(u); }}
                      sx={{
                        width: 22, height: 22, borderRadius: '50%', bgcolor: c,
                        cursor: 'pointer',
                        border: team.color === c ? '2px solid white' : '2px solid transparent',
                        boxShadow: team.color === c ? `0 0 0 2px ${BLACK}` : 'none',
                        transition: `all 0.15s ${SMOOTH}`,
                        '&:hover': { transform: 'scale(1.1)' },
                      }}
                    />
                  ))}
                </Box>
                <Box>
                  <input
                    type="file"
                    accept="image/*"
                    id={`new-logo-${idx}`}
                    hidden
                    onChange={e => {
                      if (e.target.files?.[0]) {
                        const f = e.target.files[0];
                        if (f.size > 200000) { alert('Máx 200 KB'); return; }
                        const r = new FileReader();
                        r.onload = () => { const u = [...newTeams]; u[idx] = { ...u[idx], logo: r.result as string }; setNewTeams(u); };
                        r.readAsDataURL(f);
                      }
                    }}
                  />
                  <Box
                    component="label"
                    htmlFor={`new-logo-${idx}`}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 0.75,
                      px: 1.5, py: 0.75, borderRadius: '999px',
                      cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      color: 'rgba(17,17,17,0.6)',
                      '&:hover': { bgcolor: 'rgba(17,17,17,0.04)' },
                    }}
                  >
                    <ImageOutlinedIcon sx={{ fontSize: 14 }} />
                    Escudo
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>

        <Button
          onClick={() => setNewTeams([...newTeams, { name: '', color: colors[newTeams.length % colors.length], logo: null }])}
          startIcon={<AddIcon sx={{ fontSize: 16 }} />}
          sx={{
            height: 42, borderRadius: '999px', fontWeight: 700, fontSize: 13.5,
            color: BLACK, bgcolor: 'white',
            border: '1.5px dashed rgba(17,17,17,0.15)',
            '&:hover': { borderColor: 'rgba(17,17,17,0.35)', bgcolor: 'white' },
          }}
        >
          Añadir otro
        </Button>

        <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
          <Button
            onClick={() => setAddTeamsDialog(false)}
            sx={{
              flex: 1, height: 48, borderRadius: '999px',
              fontWeight: 600, fontSize: 14,
              color: BLACK, bgcolor: 'white',
              border: '1.5px solid rgba(17,17,17,0.1)',
              '&:hover': { borderColor: 'rgba(17,17,17,0.3)', bgcolor: 'white' },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAddTeams}
            sx={{
              flex: 1, height: 48, borderRadius: '999px',
              fontWeight: 700, fontSize: 14,
              bgcolor: BLACK, color: 'white',
              '&:hover': { bgcolor: '#1a1a1a' },
            }}
          >
            Añadir equipos
          </Button>
        </Box>
      </Dialog>

      {/* ═══════════ MODAL AÑADIR JUGADOR ═══════════ */}
      <Dialog
        open={Boolean(addPlayerForTeam)}
        onClose={() => setAddPlayerForTeam(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          backdrop: { sx: { bgcolor: 'rgba(10,10,10,0.5)', backdropFilter: 'blur(6px)' } },
          paper: { sx: { borderRadius: '24px', bgcolor: '#FAFAF8', p: 3, backgroundImage: 'none' } },
        }}
      >
        <Typography sx={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, color: BLACK, mb: 3, fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
          Añadir jugador
        </Typography>
        <Stack spacing={2}>
          <TextField
            value={newPlayerName}
            onChange={e => setNewPlayerName(e.target.value)}
            placeholder="Nombre"
            fullWidth
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
            sx={inputSx}
          />
          <TextField
            value={newPlayerNumber}
            onChange={e => setNewPlayerNumber(e.target.value)}
            placeholder="Número (opcional)"
            type="number"
            fullWidth
            sx={inputSx}
          />
        </Stack>
        <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
          <Button
            onClick={() => setAddPlayerForTeam(null)}
            sx={{
              flex: 1, height: 46, borderRadius: '999px',
              fontWeight: 600, fontSize: 14,
              color: BLACK, bgcolor: 'white',
              border: '1.5px solid rgba(17,17,17,0.1)',
              '&:hover': { borderColor: 'rgba(17,17,17,0.3)', bgcolor: 'white' },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAddPlayer}
            sx={{
              flex: 1, height: 46, borderRadius: '999px',
              fontWeight: 700, fontSize: 14,
              bgcolor: BLACK, color: 'white',
              '&:hover': { bgcolor: '#1a1a1a' },
            }}
          >
            Añadir
          </Button>
        </Box>
      </Dialog>

      {/* ═══════════ MODAL EDITAR JUGADOR ═══════════ */}
      <Dialog
        open={Boolean(editingPlayer)}
        onClose={() => setEditingPlayer(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          backdrop: { sx: { bgcolor: 'rgba(10,10,10,0.5)', backdropFilter: 'blur(6px)' } },
          paper: { sx: { borderRadius: '24px', bgcolor: '#FAFAF8', p: 3, backgroundImage: 'none' } },
        }}
      >
        <Typography sx={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, color: BLACK, mb: 3, fontFamily: '"Instrument Sans", system-ui, sans-serif' }}>
          Editar jugador
        </Typography>
        <Stack spacing={2}>
          <TextField
            value={editingPlayerName}
            onChange={e => setEditingPlayerName(e.target.value)}
            placeholder="Nombre"
            fullWidth
            autoFocus
            sx={inputSx}
          />
          <TextField
            value={editingPlayerNumber}
            onChange={e => setEditingPlayerNumber(e.target.value)}
            placeholder="Número"
            type="number"
            fullWidth
            sx={inputSx}
          />
        </Stack>
        <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
          <Button
            onClick={() => setEditingPlayer(null)}
            sx={{
              flex: 1, height: 46, borderRadius: '999px',
              fontWeight: 600, fontSize: 14,
              color: BLACK, bgcolor: 'white',
              border: '1.5px solid rgba(17,17,17,0.1)',
              '&:hover': { borderColor: 'rgba(17,17,17,0.3)', bgcolor: 'white' },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={saveEditPlayer}
            sx={{
              flex: 1, height: 46, borderRadius: '999px',
              fontWeight: 700, fontSize: 14,
              bgcolor: BLACK, color: 'white',
              '&:hover': { bgcolor: '#1a1a1a' },
            }}
          >
            Guardar
          </Button>
        </Box>
      </Dialog>

      {/* ═══════════ CONFIRMACIÓN DE BORRADO ═══════════ */}
      <Dialog
        open={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          backdrop: { sx: { bgcolor: 'rgba(10,10,10,0.5)', backdropFilter: 'blur(6px)' } },
          paper: { sx: { borderRadius: '24px', bgcolor: '#FAFAF8', p: 1, backgroundImage: 'none' } },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 20, letterSpacing: -0.5, fontFamily: '"Instrument Sans", system-ui, sans-serif', pt: 3 }}>
          {deleteConfirm?.type === 'match' && '¿Eliminar partido?'}
          {deleteConfirm?.type === 'team' && '¿Eliminar equipo?'}
          {deleteConfirm?.type === 'player' && '¿Eliminar jugador?'}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14, color: 'rgba(17,17,17,0.6)' }}>
            {deleteConfirm?.type === 'match' && 'Se eliminará este partido con sus eventos asociados.'}
            {deleteConfirm?.type === 'team' && `Se eliminará ${deleteConfirm?.name} con sus jugadores y los partidos no jugados donde aparezca.`}
            {deleteConfirm?.type === 'player' && `Se eliminará ${deleteConfirm?.name} de este equipo.`}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteConfirm(null)}
            sx={{
              flex: 1, height: 46, borderRadius: '999px',
              fontWeight: 600, fontSize: 14,
              color: 'rgba(17,17,17,0.7)',
              border: '1px solid rgba(17,17,17,0.1)',
              '&:hover': { borderColor: 'rgba(17,17,17,0.25)', bgcolor: 'transparent' },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmDelete}
            sx={{
              flex: 1, height: 46, borderRadius: '999px',
              fontWeight: 700, fontSize: 14,
              bgcolor: '#DC2626', color: 'white',
              '&:hover': { bgcolor: '#B91C1C' },
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}