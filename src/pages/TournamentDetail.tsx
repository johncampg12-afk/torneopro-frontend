import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1'];

const TeamBadge = ({ team, size = 'md' }: { team: any; size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: { img: 'w-5 h-5', dot: 'w-3 h-3' },
    md: { img: 'w-8 h-8', dot: 'w-4 h-4' },
    lg: { img: 'w-12 h-12 md:w-14 md:h-14', dot: 'w-6 h-6 md:w-8 md:h-8' },
  };
  const { img, dot } = sizes[size];
  return (
    <div className="flex items-center gap-2 min-w-0">
      {team.logo ? (
        <img src={team.logo} alt={team.name} className={`${img} rounded-full object-cover flex-shrink-0`} />
      ) : (
        <div className={`${dot} rounded-full flex-shrink-0`} style={{ backgroundColor: team.color || '#666' }}></div>
      )}
      <span className="font-semibold truncate">{team.name}</span>
    </div>
  );
};

const confettiPieces = Array.from({ length: 60 }).map((_, i) => ({
  id: i,
  color: ['#f97316', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'][i % 6],
  left: Math.random() * 100,
  delay: Math.random() * 2,
  duration: 2 + Math.random() * 3,
}));

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tournament, setTournament] = useState<any>(null);
  const [tab, setTab] = useState('fixture');
  const [loading, setLoading] = useState(true);
  const [editMatch, setEditMatch] = useState<any>(null);
  const [editRound, setEditRound] = useState<any>(null);

  const [playersByTeam, setPlayersByTeam] = useState<Record<string, any[]>>({});
  const [addPlayerForTeam, setAddPlayerForTeam] = useState<string | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerNumber, setNewPlayerNumber] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [editingPlayerName, setEditingPlayerName] = useState('');
  const [editingPlayerNumber, setEditingPlayerNumber] = useState('');

  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState('');

  const [matchEvents, setMatchEvents] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState({ playerId: '', type: 'GOAL', minute: '' });
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEventType, setEditEventType] = useState('');
  const [editEventMinute, setEditEventMinute] = useState('');

  const [topScorers, setTopScorers] = useState<any[]>([]);

  const [showChampion, setShowChampion] = useState(false);
  const [championTeam, setChampionTeam] = useState<any>(null);

  const [showAddTeamsModal, setShowAddTeamsModal] = useState(false);
  const [newTeams, setNewTeams] = useState([{ name: '', color: '#3b82f6', logo: null as string | null }]);

  const [showAddMatchModal, setShowAddMatchModal] = useState<string | null>(null);
  const [newMatchData, setNewMatchData] = useState({ homeTeamId: '', awayTeamId: '', date: '', time: '', location: '' });

  const standings = useMemo(() => {
    if (!tournament) return [];
    const standingsMap: Record<string, any> = {};
    tournament.teams.forEach((team: any) => {
      standingsMap[team.id] = { ...team, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, points: 0 };
    });
    tournament.rounds.forEach((round: any) => {
      round.matches.forEach((match: any) => {
        if (!match.played) return;
        const home = standingsMap[match.homeTeamId];
        const away = standingsMap[match.awayTeamId];
        if (!home || !away) return;
        home.played++; away.played++;
        home.gf += match.homeScore; home.ga += match.awayScore;
        away.gf += match.awayScore; away.ga += match.homeScore;
        home.gd = home.gf - home.ga;
        away.gd = away.gf - away.ga;
        if (match.homeScore > match.awayScore) {
          home.wins++; away.losses++;
          home.points += 3;
        } else if (match.homeScore < match.awayScore) {
          away.wins++; home.losses++;
          away.points += 3;
        } else {
          home.draws++; away.draws++;
          home.points += 1; away.points += 1;
        }
      });
    });
    return Object.values(standingsMap).sort((a: any, b: any) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
  }, [tournament]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get(`/tournaments/${id}`)
      .then(res => setTournament(res.data))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  useEffect(() => {
    if (!tournament) return;
    const fetchPlayers = async () => {
      const map: Record<string, any[]> = {};
      for (const team of tournament.teams) {
        try {
          const res = await api.get(`/players/team/${team.id}`);
          map[team.id] = res.data;
        } catch {}
      }
      setPlayersByTeam(map);
    };
    fetchPlayers();
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

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <i className="fas fa-circle-notch fa-spin text-3xl text-primary-500"></i>
    </div>
  );
  if (!tournament) return null;

  const getTeam = (teamId: string) =>
    tournament.teams.find((t: any) => t.id === teamId) || { name: 'Por definir', color: '#666', logo: null };

  const playedMatches = tournament.rounds.reduce((a: number, r: any) => a + r.matches.filter((m: any) => m.played).length, 0);
  const totalMatches = tournament.rounds.reduce((a: number, r: any) => a + r.matches.length, 0);
  const progress = Math.round((playedMatches / Math.max(1, totalMatches)) * 100);

  const saveMatch = async () => {
    if (!editMatch || !editRound) return;
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
      const res = await api.get(`/tournaments/${id}`);
      setTournament(res.data);

      const updatedMatch = res.data.rounds.flatMap((r: any) => r.matches).find((m: any) => m.id === editMatch.id);
      if (updatedMatch?.played && updatedMatch.round?.name === 'Final' && updatedMatch.winnerId) {
        const winner = res.data.teams.find((t: any) => t.id === updatedMatch.winnerId);
        if (winner) {
          setChampionTeam(winner);
          setShowChampion(true);
          setTimeout(() => setShowChampion(false), 10000);
        }
      }
      setEditMatch(null);
    } catch {}
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/t/${tournament.shareCode}`;
    navigator.clipboard.writeText(url);
    alert('Enlace copiado: ' + url);
  };

  const handleTogglePublic = async () => {
    try {
      await api.patch(`/tournaments/${id}`, { isPublic: !tournament.isPublic });
      setTournament({ ...tournament, isPublic: !tournament.isPublic });
    } catch {}
  };

  // ── Jugadores ──
  const handleAddPlayer = async () => {
    if (!addPlayerForTeam || !newPlayerName.trim()) return;
    try {
      await api.post(`/players/team/${addPlayerForTeam}`, { name: newPlayerName, number: newPlayerNumber ? parseInt(newPlayerNumber) : undefined });
      const res = await api.get(`/players/team/${addPlayerForTeam}`);
      setPlayersByTeam(prev => ({ ...prev, [addPlayerForTeam]: res.data }));
      setAddPlayerForTeam(null);
      setNewPlayerName('');
      setNewPlayerNumber('');
    } catch {}
  };
  const handleEditPlayer = (player: any) => { setEditingPlayer(player); setEditingPlayerName(player.name); setEditingPlayerNumber(player.number ?? ''); };
  const saveEditPlayer = async () => {
    if (!editingPlayer || !editingPlayerName.trim()) return;
    try {
      await api.patch(`/players/${editingPlayer.id}`, { name: editingPlayerName, number: editingPlayerNumber ? parseInt(editingPlayerNumber) : null });
      const res = await api.get(`/players/team/${editingPlayer.teamId}`);
      setPlayersByTeam(prev => ({ ...prev, [editingPlayer.teamId]: res.data }));
      setEditingPlayer(null);
    } catch {}
  };
  const deletePlayer = async (playerId: string, teamId: string) => {
    if (!confirm('¿Eliminar este jugador?')) return;
    try {
      await api.delete(`/players/${playerId}`);
      const res = await api.get(`/players/team/${teamId}`);
      setPlayersByTeam(prev => ({ ...prev, [teamId]: res.data }));
    } catch {}
  };

  // ── Equipos ──
  const startEditTeam = (team: any) => { setEditingTeamId(team.id); setEditingTeamName(team.name); };
  const saveEditTeam = async () => {
    if (!editingTeamId || !editingTeamName.trim()) return;
    try {
      await api.patch(`/teams/${editingTeamId}`, { name: editingTeamName });
      const res = await api.get(`/tournaments/${id}`);
      setTournament(res.data);
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
        const res = await api.get(`/tournaments/${id}`);
        setTournament(res.data);
      } catch { alert('Error al subir el escudo'); }
    };
    reader.readAsDataURL(file);
  };
  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('¿Eliminar este equipo? Se borrarán sus jugadores y los partidos no jugados.')) return;
    try {
      await api.delete(`/teams/${teamId}`);
      const res = await api.get(`/tournaments/${id}`);
      setTournament(res.data);
      setPlayersByTeam(prev => { const c = { ...prev }; delete c[teamId]; return c; });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar');
    }
  };

  // ── Eventos ──
  const handleAddEvent = async () => {
    if (!editMatch || !newEvent.playerId) return;
    try {
      await api.post(`/matches/${editMatch.id}/events`, { playerId: newEvent.playerId, type: newEvent.type, minute: newEvent.minute ? parseInt(newEvent.minute) : undefined });
      const res = await api.get(`/matches/${editMatch.id}/events`);
      setMatchEvents(res.data);
      setNewEvent({ playerId: '', type: 'GOAL', minute: '' });
    } catch {}
  };
  const handleSaveEditEvent = async (eventId: string) => {
    if (!editEventType) return;
    try {
      await api.patch(`/matches/events/${eventId}`, { type: editEventType, minute: editEventMinute ? parseInt(editEventMinute) : null });
      const res = await api.get(`/matches/${editMatch.id}/events`);
      setMatchEvents(res.data);
      setEditingEventId(null);
    } catch {}
  };
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('¿Eliminar este evento?')) return;
    try {
      await api.delete(`/matches/events/${eventId}`);
      const res = await api.get(`/matches/${editMatch.id}/events`);
      setMatchEvents(res.data);
    } catch {}
  };

  // ── Añadir equipos ──
  const handleAddTeams = async () => {
    const valid = newTeams.filter(t => t.name.trim()).map(t => ({ name: t.name.trim(), color: t.color, logo: t.logo || null }));
    if (valid.length === 0) return alert('Añade al menos un equipo');
    try {
      await api.post(`/teams/bulk/${id}`, { teams: valid });
      const res = await api.get(`/tournaments/${id}`);
      setTournament(res.data);
      setShowAddTeamsModal(false);
      setNewTeams([{ name: '', color: '#3b82f6', logo: null }]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al añadir equipos');
    }
  };

  // ── Añadir / eliminar partidos ──
  const handleAddMatch = async () => {
    if (!showAddMatchModal) return;
    try {
      await api.post(`/matches/round/${showAddMatchModal}`, newMatchData);
      const res = await api.get(`/tournaments/${id}`);
      setTournament(res.data);
      setShowAddMatchModal(null);
      setNewMatchData({ homeTeamId: '', awayTeamId: '', date: '', time: '', location: '' });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al añadir partido');
    }
  };
  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm('¿Eliminar este partido?')) return;
    try {
      await api.delete(`/matches/${matchId}`);
      const res = await api.get(`/tournaments/${id}`);
      setTournament(res.data);
      if (editMatch?.id === matchId) setEditMatch(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar');
    }
  };

  return (
    <div className="animate-fade-in pb-8">
      {/* Header */}
      <div className="glass rounded-2xl p-4 md:p-6 mb-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <button onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors flex-shrink-0">
              <i className="fas fa-arrow-left"></i>
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-lg md:text-2xl font-bold truncate">{tournament.name}</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold flex-shrink-0 ${tournament.isPublic ? 'bg-accent-500/20 text-accent-400' : 'bg-slate-700 text-slate-400'}`}>
                  {tournament.isPublic ? 'Público' : 'Privado'}
                </span>
              </div>
              <p className="text-slate-400 text-xs md:text-sm">
                {getFormatName(tournament.format)} · {tournament.teams.length} equipos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleCopyLink} className="btn-secondary text-xs md:text-sm flex-1 md:flex-none justify-center">
              <i className="fas fa-link"></i> Compartir
            </button>
            <button onClick={handleTogglePublic} className="btn-secondary text-xs md:text-sm flex-1 md:flex-none justify-center">
              <i className={`fas ${tournament.isPublic ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              {tournament.isPublic ? 'Ocultar' : 'Publicar'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <span className="text-slate-400">Progreso</span>
                <span className="font-semibold text-primary-400">{playedMatches}/{totalMatches}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black gradient-text">{progress}%</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-slate-800/50 p-1 rounded-xl overflow-x-auto">
        {[
          { id: 'fixture', label: 'Partidos', icon: 'fa-calendar-alt' },
          { id: 'standings', label: 'Tabla', icon: 'fa-table' },
          { id: 'teams', label: 'Equipos', icon: 'fa-users' },
          { id: 'stats', label: 'Stats', icon: 'fa-chart-bar' },
        ].map(ta => (
          <button key={ta.id} onClick={() => setTab(ta.id)}
            className={`flex-1 min-w-0 px-3 md:px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1.5 ${tab === ta.id ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <i className={`fas ${ta.icon}`}></i>
            <span className="hidden sm:inline">{ta.label}</span>
          </button>
        ))}
      </div>

      {/* ============ Fixture ============ */}
      {tab === 'fixture' && (
        <div className="space-y-4 animate-fade-in">
          {tournament.rounds.map((round: any) => (
            <div key={round.id} className="glass rounded-2xl p-3 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base md:text-lg font-bold">
                    {tournament.format === 'eliminatoria' ? round.name : `Jornada ${round.number}`}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {round.matches.filter((m: any) => m.played).length}/{round.matches.length} jugados
                  </span>
                </div>
                <button
                  onClick={() => setShowAddMatchModal(round.id)}
                  className="btn-secondary text-xs px-2.5 py-1.5"
                  title="Añadir partido"
                >
                  <i className="fas fa-plus"></i> <span className="hidden sm:inline">Partido</span>
                </button>
              </div>

              <div className="space-y-2">
                {round.matches.map((match: any) => {
                  const home = getTeam(match.homeTeamId);
                  const away = getTeam(match.awayTeamId);
                  const isPlayed = match.played;
                  return (
                    <div key={match.id} className="relative group">
                      <div
                        onClick={() => { setEditMatch(match); setEditRound(round); }}
                        className={`rounded-xl p-3 border cursor-pointer transition-all hover:border-primary-500/50 ${
                          isPlayed ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-800/20 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0 flex items-center justify-end gap-2">
                            <span className="font-semibold text-sm md:text-base truncate text-right">{home.name}</span>
                            {home.logo ? (
                              <img src={home.logo} alt="" className="w-7 h-7 md:w-9 md:h-9 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-7 h-7 md:w-9 md:h-9 rounded-full flex-shrink-0" style={{ backgroundColor: home.color }} />
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-4 flex-shrink-0">
                            {isPlayed ? (
                              <>
                                <span className="text-2xl md:text-3xl font-black text-white w-8 md:w-10 text-center">{match.homeScore}</span>
                                <span className="text-slate-600 text-lg md:text-xl font-bold">-</span>
                                <span className="text-2xl md:text-3xl font-black text-white w-8 md:w-10 text-center">{match.awayScore}</span>
                              </>
                            ) : (
                              <span className="text-xs md:text-sm font-bold text-slate-600 px-2 py-1 bg-slate-800/50 rounded">VS</span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 flex items-center gap-2">
                            {away.logo ? (
                              <img src={away.logo} alt="" className="w-7 h-7 md:w-9 md:h-9 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-7 h-7 md:w-9 md:h-9 rounded-full flex-shrink-0" style={{ backgroundColor: away.color }} />
                            )}
                            <span className="font-semibold text-sm md:text-base truncate">{away.name}</span>
                          </div>
                        </div>

                        {(match.date || match.time || match.location) && (
                          <div className="flex gap-2 mt-2 text-[10px] md:text-xs text-slate-500 justify-center flex-wrap">
                            {match.date && <span><i className="far fa-calendar mr-1"></i>{new Date(match.date).toLocaleDateString('es-ES')}</span>}
                            {match.time && <span><i className="far fa-clock mr-1"></i>{match.time}</span>}
                            {match.location && <span><i className="fas fa-map-marker-alt mr-1"></i>{match.location}</span>}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteMatch(match.id); }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/90 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        title="Eliminar partido"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {showChampion && championTeam && (
            <div className="relative overflow-hidden rounded-2xl p-6 md:p-10 glass animate-champion-appear">
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {confettiPieces.map(p => (
                  <div
                    key={p.id}
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: p.color,
                      left: `${p.left}%`,
                      top: '-10px',
                      animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in infinite`,
                    }}
                  />
                ))}
              </div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="text-5xl md:text-7xl mb-4">🏆</div>
                {championTeam.logo ? (
                  <img src={championTeam.logo} alt={championTeam.name} className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover mx-auto mb-4 border-4 border-yellow-500 shadow-lg shadow-yellow-500/30" />
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl mx-auto mb-4 flex items-center justify-center text-5xl font-black text-white" style={{ backgroundColor: championTeam.color }}>
                    {championTeam.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <h2 className="text-3xl md:text-4xl font-black text-white mb-1">{championTeam.name}</h2>
                <p className="text-slate-400 text-lg">¡Campeón!</p>
                <button onClick={() => setShowChampion(false)} className="mt-6 text-white/60 hover:text-white text-sm">Cerrar</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ Standings ============ */}
      {tab === 'standings' && (
        <div className="glass rounded-2xl overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="bg-slate-800/80 text-slate-400">
                  <th className="px-2 md:px-4 py-3 font-semibold text-center w-10">#</th>
                  <th className="px-2 md:px-4 py-3 font-semibold text-left">Equipo</th>
                  <th className="px-2 md:px-4 py-3 font-semibold text-center">PJ</th>
                  <th className="px-2 md:px-4 py-3 font-semibold text-center">G</th>
                  <th className="px-2 md:px-4 py-3 font-semibold text-center">E</th>
                  <th className="px-2 md:px-4 py-3 font-semibold text-center">P</th>
                  <th className="px-2 md:px-4 py-3 font-semibold text-center hidden sm:table-cell">GF</th>
                  <th className="px-2 md:px-4 py-3 font-semibold text-center hidden sm:table-cell">GC</th>
                  <th className="px-2 md:px-4 py-3 font-semibold text-center">DG</th>
                  <th className="px-2 md:px-4 py-3 font-semibold text-center">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((team: any, idx: number) => (
                  <tr key={team.id} className={`border-t border-slate-800/50 ${idx < 3 ? 'bg-primary-500/5' : ''}`}>
                    <td className="px-2 md:px-4 py-3 text-center">
                      <span className={`inline-flex w-6 h-6 rounded-md items-center justify-center font-bold text-xs ${
                        idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        idx === 1 ? 'bg-slate-400/20 text-slate-300' :
                        idx === 2 ? 'bg-orange-600/20 text-orange-400' :
                        'text-slate-500'
                      }`}>{idx + 1}</span>
                    </td>
                    <td className="px-2 md:px-4 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {team.logo ? (
                          <img src={team.logo} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: team.color }} />
                        )}
                        <span className="font-semibold truncate">{team.name}</span>
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-3 text-center">{team.played}</td>
                    <td className="px-2 md:px-4 py-3 text-center text-accent-400">{team.wins}</td>
                    <td className="px-2 md:px-4 py-3 text-center text-yellow-400">{team.draws}</td>
                    <td className="px-2 md:px-4 py-3 text-center text-red-400">{team.losses}</td>
                    <td className="px-2 md:px-4 py-3 text-center hidden sm:table-cell">{team.gf}</td>
                    <td className="px-2 md:px-4 py-3 text-center hidden sm:table-cell">{team.ga}</td>
                    <td className="px-2 md:px-4 py-3 text-center font-semibold">{team.gd > 0 ? '+' : ''}{team.gd}</td>
                    <td className="px-2 md:px-4 py-3 text-center">
                      <span className="text-base md:text-lg font-black text-primary-400">{team.points}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============ Teams ============ */}
      {tab === 'teams' && (
        <>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold">Equipos <span className="text-slate-500 font-normal text-sm">({tournament.teams.length})</span></h3>
            <button onClick={() => setShowAddTeamsModal(true)} className="btn-primary text-xs md:text-sm">
              <i className="fas fa-plus"></i> Añadir
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in">
            {tournament.teams.map((team: any) => {
              const teamStats = standings.find((s: any) => s.id === team.id);
              const players = playersByTeam[team.id] || [];
              const isEditingThisTeam = editingTeamId === team.id;
              return (
                <div key={team.id} className="glass p-4 rounded-2xl">
                  <div className="flex items-start gap-3 mb-3">
                    {isEditingThisTeam ? (
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <input value={editingTeamName} onChange={e => setEditingTeamName(e.target.value)} className="input-dark flex-1 text-sm py-1.5" autoFocus onKeyDown={e => e.key === 'Enter' && saveEditTeam()} />
                          <button onClick={saveEditTeam} className="btn-primary text-xs px-2"><i className="fas fa-check"></i></button>
                          <button onClick={() => setEditingTeamId(null)} className="btn-secondary text-xs px-2"><i className="fas fa-times"></i></button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="file" accept="image/*" id={`edit-logo-${team.id}`} className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleTeamLogoChange(team.id, e.target.files[0]); }} />
                          <button type="button" onClick={() => document.getElementById(`edit-logo-${team.id}`)?.click()} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                            <i className="fas fa-image"></i> {team.logo ? 'Cambiar escudo' : 'Añadir escudo'}
                          </button>
                          {team.logo && <img src={team.logo} alt="" className="w-6 h-6 rounded object-cover" />}
                        </div>
                      </div>
                    ) : (
                      <>
                        {team.logo ? (
                          <img src={team.logo} alt={team.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: team.color }}>
                            {team.name[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold truncate">{team.name}</h4>
                          <p className="text-xs text-slate-500">{teamStats?.points || 0} pts · {teamStats?.played || 0} PJ</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button onClick={() => startEditTeam(team)} className="w-7 h-7 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white flex items-center justify-center" title="Editar">
                            <i className="fas fa-pen text-xs"></i>
                          </button>
                          <button onClick={() => handleDeleteTeam(team.id)} className="w-7 h-7 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 flex items-center justify-center" title="Eliminar">
                            <i className="fas fa-trash text-xs"></i>
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="bg-slate-800/40 rounded-lg p-2">
                      <div className="text-base font-bold text-accent-400">{teamStats?.wins || 0}</div>
                      <div className="text-[10px] text-slate-500 uppercase">Ganados</div>
                    </div>
                    <div className="bg-slate-800/40 rounded-lg p-2">
                      <div className="text-base font-bold text-yellow-400">{teamStats?.draws || 0}</div>
                      <div className="text-[10px] text-slate-500 uppercase">Empates</div>
                    </div>
                    <div className="bg-slate-800/40 rounded-lg p-2">
                      <div className="text-base font-bold text-red-400">{teamStats?.losses || 0}</div>
                      <div className="text-[10px] text-slate-500 uppercase">Perdidos</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400 font-medium">Jugadores ({players.length})</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={async () => {
                            const dto = {
                              name: team.name, color: team.color, logo: team.logo,
                              players: players.map(p => ({ name: p.name, number: p.number })),
                            };
                            try {
                              await api.post('/team-templates', dto);
                              alert('Plantilla guardada');
                            } catch (err: any) { alert(err.response?.data?.message || 'Error'); }
                          }}
                          className="text-[10px] text-slate-500 hover:text-primary-400"
                          title="Guardar como plantilla"
                        >
                          <i className="fas fa-save"></i>
                        </button>
                        <button onClick={() => setAddPlayerForTeam(team.id)} className="text-xs text-primary-400 hover:text-primary-300 font-medium">+ Añadir</button>
                      </div>
                    </div>
                    {players.length === 0 ? (
                      <p className="text-xs text-slate-600 italic">Sin jugadores</p>
                    ) : (
                      <div className="space-y-0.5 max-h-40 overflow-y-auto">
                        {players.map((player: any) => (
                          <div key={player.id} className="flex items-center justify-between text-sm py-1 group">
                            <span className="truncate text-slate-300">
                              {player.number ? <span className="text-slate-500 mr-1 text-xs">#{player.number}</span> : ''}
                              {player.name}
                            </span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEditPlayer(player)} className="text-slate-500 hover:text-primary-400"><i className="fas fa-pen text-[10px]"></i></button>
                              <button onClick={() => deletePlayer(player.id, team.id)} className="text-slate-500 hover:text-red-400"><i className="fas fa-trash text-[10px]"></i></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ============ Stats ============ */}
      {tab === 'stats' && (
        <>
          <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
            <div className="glass p-4 md:p-6 rounded-2xl">
              <h3 className="text-base md:text-lg font-bold mb-4">Goles a favor</h3>
              <div className="space-y-3">
                {[...standings].sort((a, b) => b.gf - a.gf).slice(0, 8).map(team => (
                  <div key={team.id} className="flex items-center gap-3">
                    {team.logo ? <img src={team.logo} className="w-6 h-6 rounded-full object-cover flex-shrink-0" /> : <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: team.color }} />}
                    <span className="flex-1 text-sm truncate">{team.name}</span>
                    <div className="w-20 md:w-28 bg-slate-800 rounded-full h-1.5">
                      <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (team.gf / Math.max(1, standings[0]?.gf)) * 100)}%` }} />
                    </div>
                    <span className="text-sm font-bold w-6 text-right">{team.gf}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass p-4 md:p-6 rounded-2xl">
              <h3 className="text-base md:text-lg font-bold mb-4">% Victorias</h3>
              <div className="space-y-3">
                {standings.filter(s => s.played > 0).sort((a, b) => (b.wins / b.played) - (a.wins / a.played)).slice(0, 8).map(team => (
                  <div key={team.id} className="flex items-center gap-3">
                    {team.logo ? <img src={team.logo} className="w-6 h-6 rounded-full object-cover flex-shrink-0" /> : <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: team.color }} />}
                    <span className="flex-1 text-sm truncate">{team.name}</span>
                    <div className="w-20 md:w-28 bg-slate-800 rounded-full h-1.5">
                      <div className="bg-accent-500 h-1.5 rounded-full" style={{ width: `${(team.wins / team.played) * 100}%` }} />
                    </div>
                    <span className="text-sm font-bold w-10 text-right">{Math.round((team.wins / team.played) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass p-4 md:p-6 rounded-2xl mt-4">
            <h3 className="text-base md:text-lg font-bold mb-4">Resumen</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-800/40 rounded-xl p-3 text-center">
                <div className="text-xl md:text-2xl font-bold text-primary-400">
                  {tournament.rounds.reduce((a: number, r: any) => a + r.matches.reduce((b: number, m: any) => b + (m.homeScore || 0) + (m.awayScore || 0), 0), 0)}
                </div>
                <div className="text-xs text-slate-500 mt-1">Goles</div>
              </div>
              <div className="bg-slate-800/40 rounded-xl p-3 text-center">
                <div className="text-xl md:text-2xl font-bold text-accent-400">{playedMatches}</div>
                <div className="text-xs text-slate-500 mt-1">Jugados</div>
              </div>
              <div className="bg-slate-800/40 rounded-xl p-3 text-center">
                <div className="text-xl md:text-2xl font-bold text-yellow-400">
                  {tournament.rounds.reduce((a: number, r: any) => a + r.matches.filter((m: any) => m.played && m.homeScore === m.awayScore).length, 0)}
                </div>
                <div className="text-xs text-slate-500 mt-1">Empates</div>
              </div>
              <div className="bg-slate-800/40 rounded-xl p-3 text-center">
                <div className="text-xl md:text-2xl font-bold text-purple-400">{tournament.teams.length}</div>
                <div className="text-xs text-slate-500 mt-1">Equipos</div>
              </div>
            </div>
          </div>

          <div className="glass p-4 md:p-6 rounded-2xl mt-4">
            <h3 className="text-base md:text-lg font-bold mb-4">Máximos goleadores</h3>
            {topScorers.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Sin datos</p>
            ) : (
              <div className="space-y-2">
                {topScorers.filter(p => p.goals > 0).slice(0, 10).map((p: any, i: number) => (
                  <div key={p.id} className="flex items-center gap-3 py-1.5">
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      i === 1 ? 'bg-slate-400/20 text-slate-300' :
                      i === 2 ? 'bg-orange-600/20 text-orange-400' :
                      'text-slate-500'
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{p.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.teamColor }}></span>
                        {p.team}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-white">{p.goals}</div>
                      <div className="text-[10px] text-slate-500 uppercase">goles</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ============ Modal Editar Partido ============ */}
      {editMatch && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
          <div className="relative bg-dark-900 border-t sm:border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto p-4 md:p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Registrar resultado</h3>
              <button onClick={() => setEditMatch(null)} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"><i className="fas fa-times"></i></button>
            </div>

            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="text-center flex-1 min-w-0">
                {getTeam(editMatch.homeTeamId).logo ? (
                  <img src={getTeam(editMatch.homeTeamId).logo} alt="" className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover mx-auto mb-2" />
                ) : (
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl mx-auto mb-2" style={{ backgroundColor: getTeam(editMatch.homeTeamId).color }} />
                )}
                <div className="font-bold text-xs md:text-sm truncate">{getTeam(editMatch.homeTeamId).name}</div>
              </div>
              <div className="text-slate-600 font-black text-lg">VS</div>
              <div className="text-center flex-1 min-w-0">
                {getTeam(editMatch.awayTeamId).logo ? (
                  <img src={getTeam(editMatch.awayTeamId).logo} alt="" className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover mx-auto mb-2" />
                ) : (
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl mx-auto mb-2" style={{ backgroundColor: getTeam(editMatch.awayTeamId).color }} />
                )}
                <div className="font-bold text-xs md:text-sm truncate">{getTeam(editMatch.awayTeamId).name}</div>
              </div>
            </div>

            {!editMatch.played && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Local</label>
                  <select value={editMatch.homeTeamId || ''} onChange={e => setEditMatch({ ...editMatch, homeTeamId: e.target.value || null })} className="input-dark text-sm">
                    {tournament.teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Visitante</label>
                  <select value={editMatch.awayTeamId || ''} onChange={e => setEditMatch({ ...editMatch, awayTeamId: e.target.value || null })} className="input-dark text-sm">
                    {tournament.teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 text-center">Local</label>
                <input type="number" min="0" defaultValue={editMatch.homeScore ?? ''} id="homeScore" className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 text-center text-3xl font-black text-white focus:border-primary-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 text-center">Visitante</label>
                <input type="number" min="0" defaultValue={editMatch.awayScore ?? ''} id="awayScore" className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 text-center text-3xl font-black text-white focus:border-primary-500 focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="block text-xs text-slate-400 mb-1">Fecha</label><input type="date" defaultValue={editMatch.date ? editMatch.date.split('T')[0] : ''} id="matchDate" className="input-dark text-sm" /></div>
              <div><label className="block text-xs text-slate-400 mb-1">Hora</label><input type="time" defaultValue={editMatch.time || ''} id="matchTime" className="input-dark text-sm" /></div>
            </div>
            <div className="mb-5">
              <label className="block text-xs text-slate-400 mb-1">Ubicación</label>
              <input type="text" defaultValue={editMatch.location || ''} id="matchLocation" placeholder="Cancha, estadio..." className="input-dark text-sm" />
            </div>

            <div className="mb-5 pt-4 border-t border-slate-800">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Eventos del partido</h4>
              {matchEvents.length === 0 && <p className="text-xs text-slate-500 italic mb-3">Sin eventos</p>}
              <div className="space-y-1.5 mb-3">
                {matchEvents.map(ev => (
                  editingEventId === ev.id ? (
                    <div key={ev.id} className="flex items-center gap-2 text-xs p-2 bg-slate-800/40 rounded-lg">
                      <input type="number" value={editEventMinute} onChange={e => setEditEventMinute(e.target.value)} placeholder="Min" className="w-14 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs" />
                      <select value={editEventType} onChange={e => setEditEventType(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs">
                        <option value="GOAL">⚽ Gol</option>
                        <option value="ASSIST">🅰️ Asistencia</option>
                        <option value="YELLOW_CARD">🟨 Amarilla</option>
                        <option value="RED_CARD">🟥 Roja</option>
                      </select>
                      <button onClick={() => handleSaveEditEvent(ev.id)} className="text-green-400 px-2"><i className="fas fa-check"></i></button>
                      <button onClick={() => setEditingEventId(null)} className="text-slate-400 px-2"><i className="fas fa-times"></i></button>
                    </div>
                  ) : (
                    <div key={ev.id} className="flex items-center gap-2 text-sm py-1.5 px-2 rounded-lg hover:bg-white/5 group">
                      <span className="text-xs text-slate-500 w-8">{ev.minute ? `${ev.minute}'` : ''}</span>
                      <span className="text-xs font-medium flex-1 truncate">{ev.player.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800">{ev.type}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <button onClick={() => { setEditingEventId(ev.id); setEditEventType(ev.type); setEditEventMinute(ev.minute ?? ''); }} className="text-slate-500 hover:text-primary-400"><i className="fas fa-pen text-[10px]"></i></button>
                        <button onClick={() => handleDeleteEvent(ev.id)} className="text-slate-500 hover:text-red-400"><i className="fas fa-trash text-[10px]"></i></button>
                      </div>
                    </div>
                  )
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                <select value={newEvent.playerId} onChange={e => setNewEvent({ ...newEvent, playerId: e.target.value })} className="input-dark text-sm">
                  <option value="">Seleccionar jugador...</option>
                  {[
                    ...(playersByTeam[editMatch?.homeTeamId] || []).map((p: any) => ({ ...p, _team: getTeam(editMatch.homeTeamId).name })),
                    ...(playersByTeam[editMatch?.awayTeamId] || []).map((p: any) => ({ ...p, _team: getTeam(editMatch.awayTeamId).name })),
                  ].map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name} ({p._team})</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <select value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value })} className="input-dark text-sm">
                    <option value="GOAL">⚽ Gol</option>
                    <option value="ASSIST">🅰️ Asistencia</option>
                    <option value="YELLOW_CARD">🟨 Amarilla</option>
                    <option value="RED_CARD">🟥 Roja</option>
                  </select>
                  <input type="number" placeholder="Minuto" value={newEvent.minute} onChange={e => setNewEvent({ ...newEvent, minute: e.target.value })} className="input-dark text-sm" />
                </div>
                <button onClick={handleAddEvent} disabled={!newEvent.playerId} className="btn-secondary text-xs w-full justify-center disabled:opacity-50">
                  <i className="fas fa-plus"></i> Añadir evento
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setEditMatch(null)} className="flex-1 btn-secondary justify-center">Cancelar</button>
              <button onClick={saveMatch} className="flex-1 btn-primary justify-center"><i className="fas fa-save"></i> Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ Modal Añadir Partido ============ */}
      {showAddMatchModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4" onClick={() => setShowAddMatchModal(null)}>
          <div className="bg-dark-900 p-5 rounded-t-2xl sm:rounded-2xl w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Añadir partido</h3>
              <button onClick={() => setShowAddMatchModal(null)} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"><i className="fas fa-times"></i></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Equipo local</label>
                <select value={newMatchData.homeTeamId} onChange={e => setNewMatchData({ ...newMatchData, homeTeamId: e.target.value })} className="input-dark">
                  <option value="">Seleccionar...</option>
                  {tournament.teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Equipo visitante</label>
                <select value={newMatchData.awayTeamId} onChange={e => setNewMatchData({ ...newMatchData, awayTeamId: e.target.value })} className="input-dark">
                  <option value="">Seleccionar...</option>
                  {tournament.teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-slate-400 mb-1">Fecha</label><input type="date" value={newMatchData.date} onChange={e => setNewMatchData({ ...newMatchData, date: e.target.value })} className="input-dark" /></div>
                <div><label className="block text-xs text-slate-400 mb-1">Hora</label><input type="time" value={newMatchData.time} onChange={e => setNewMatchData({ ...newMatchData, time: e.target.value })} className="input-dark" /></div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Ubicación</label>
                <input type="text" value={newMatchData.location} onChange={e => setNewMatchData({ ...newMatchData, location: e.target.value })} placeholder="Cancha, etc." className="input-dark" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAddMatchModal(null)} className="flex-1 btn-secondary justify-center">Cancelar</button>
              <button onClick={handleAddMatch} className="flex-1 btn-primary justify-center">Añadir</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ Modal Añadir Equipos ============ */}
      {showAddTeamsModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4" onClick={() => setShowAddTeamsModal(false)}>
          <div className="bg-dark-900 p-5 rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Añadir equipos</h3>
              <button onClick={() => setShowAddTeamsModal(false)} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"><i className="fas fa-times"></i></button>
            </div>
            <div className="space-y-3">
              {newTeams.map((team, idx) => (
                <div key={idx} className="bg-slate-800/40 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-3">
                    {team.logo ? (
                      <img src={team.logo} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold" style={{ backgroundColor: team.color }}>
                        {team.name.trim() ? team.name.trim()[0].toUpperCase() : '?'}
                      </div>
                    )}
                    <input
                      value={team.name}
                      onChange={e => { const u = [...newTeams]; u[idx] = { ...u[idx], name: e.target.value }; setNewTeams(u); }}
                      placeholder={`Equipo ${idx + 1}`}
                      className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder-slate-600 text-sm"
                    />
                    {newTeams.length > 1 && (
                      <button onClick={() => setNewTeams(prev => prev.filter((_, i) => i !== idx))} className="w-8 h-8 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 flex items-center justify-center">
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex gap-1 flex-wrap">
                      {colors.slice(0, 8).map(c => (
                        <button key={c} onClick={() => { const u = [...newTeams]; u[idx] = { ...u[idx], color: c }; setNewTeams(u); }} className={`w-6 h-6 rounded-full border-2 transition-all ${team.color === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <div className="flex items-center">
                      <input type="file" accept="image/*" className="hidden" id={`new-logo-${idx}`} onChange={e => { if (e.target.files?.[0]) { const f = e.target.files[0]; if (f.size > 200000) { alert('Máx 200 KB'); return; } const r = new FileReader(); r.onload = () => { const u = [...newTeams]; u[idx] = { ...u[idx], logo: r.result as string }; setNewTeams(u); }; r.readAsDataURL(f); } }} />
                      <button type="button" onClick={() => document.getElementById(`new-logo-${idx}`)?.click()} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-white/5">
                        <i className="fas fa-image"></i> Escudo
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setNewTeams([...newTeams, { name: '', color: colors[newTeams.length % colors.length], logo: null }])} className="mt-3 text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
              <i className="fas fa-plus"></i> Añadir otro
            </button>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAddTeamsModal(false)} className="flex-1 btn-secondary justify-center">Cancelar</button>
              <button onClick={handleAddTeams} className="flex-1 btn-primary justify-center">Añadir equipos</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ Modal Añadir Jugador ============ */}
      {addPlayerForTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setAddPlayerForTeam(null)}>
          <div className="bg-dark-900 p-5 rounded-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Añadir jugador</h3>
            <input value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} placeholder="Nombre" className="input-dark mb-2" autoFocus onKeyDown={e => e.key === 'Enter' && handleAddPlayer()} />
            <input value={newPlayerNumber} onChange={e => setNewPlayerNumber(e.target.value)} placeholder="Número (opcional)" className="input-dark mb-4" />
            <div className="flex gap-2">
              <button onClick={() => setAddPlayerForTeam(null)} className="flex-1 btn-secondary justify-center">Cancelar</button>
              <button onClick={handleAddPlayer} className="flex-1 btn-primary justify-center">Añadir</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ Modal Editar Jugador ============ */}
      {editingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setEditingPlayer(null)}>
          <div className="bg-dark-900 p-5 rounded-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Editar jugador</h3>
            <input value={editingPlayerName} onChange={e => setEditingPlayerName(e.target.value)} placeholder="Nombre" className="input-dark mb-2" autoFocus />
            <input value={editingPlayerNumber} onChange={e => setEditingPlayerNumber(e.target.value)} placeholder="Número" className="input-dark mb-4" />
            <div className="flex gap-2">
              <button onClick={() => setEditingPlayer(null)} className="flex-1 btn-secondary justify-center">Cancelar</button>
              <button onClick={saveEditPlayer} className="flex-1 btn-primary justify-center">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getFormatName(format: string) {
  const map: Record<string, string> = { liga: 'Liga', eliminatoria: 'Eliminación Directa', grupos: 'Grupos + Eliminatoria' };
  return map[format] || format;
}