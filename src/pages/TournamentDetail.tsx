import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

// Componente auxiliar: muestra logo si existe, si no, círculo de color
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

// Animación de confeti
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

  // Jugadores por equipo
  const [playersByTeam, setPlayersByTeam] = useState<Record<string, any[]>>({});
  const [addPlayerForTeam, setAddPlayerForTeam] = useState<string | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerNumber, setNewPlayerNumber] = useState('');
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [editingPlayerName, setEditingPlayerName] = useState('');
  const [editingPlayerNumber, setEditingPlayerNumber] = useState('');

  // Edición de equipos
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState('');

  // Eventos de partido
  const [matchEvents, setMatchEvents] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState({ playerId: '', type: 'GOAL', minute: '' });
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEventType, setEditEventType] = useState('');
  const [editEventMinute, setEditEventMinute] = useState('');

  // Máximos goleadores
  const [topScorers, setTopScorers] = useState<any[]>([]);

  // Animación del campeón
  const [showChampion, setShowChampion] = useState(false);
  const [championTeam, setChampionTeam] = useState<any>(null);

  const standings = useMemo(() => {
    if (!tournament) return [];
    const sportPoints: Record<string, { win: number; draw: number; loss: number }> = {
      futbol: { win: 3, draw: 1, loss: 0 },
      futsal: { win: 3, draw: 1, loss: 0 },
      basket: { win: 2, draw: 0, loss: 0 },
      voley: { win: 2, draw: 1, loss: 0 },
      esports: { win: 3, draw: 1, loss: 0 },
      tenis: { win: 2, draw: 0, loss: 0 },
    };
    const pts = sportPoints[tournament.sport] || { win: 3, draw: 1, loss: 0 };
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
        if (match.homeScore > match.awayScore) {
          home.wins++; away.losses++;
          home.points += pts.win; away.points += pts.loss;
        } else if (match.homeScore < match.awayScore) {
          away.wins++; home.losses++;
          away.points += pts.win; home.points += pts.loss;
        } else {
          home.draws++; away.draws++;
          home.points += pts.draw; away.points += pts.draw;
        }
      });
    });
    return Object.values(standingsMap).sort((a: any, b: any) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
  }, [tournament]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
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
        if (!playersByTeam[teamId]) {
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

  const playedMatches = tournament.rounds.reduce((a, r) => a + r.matches.filter((m: any) => m.played).length, 0);
  const totalMatches = tournament.rounds.reduce((a, r) => a + r.matches.length, 0);
  const progress = Math.round((playedMatches / Math.max(1, totalMatches)) * 100);

  const saveMatch = async () => {
    if (!editMatch || !editRound) return;
    const homeScore = parseInt((document.getElementById('homeScore') as HTMLInputElement).value) || 0;
    const awayScore = parseInt((document.getElementById('awayScore') as HTMLInputElement).value) || 0;
    const date = (document.getElementById('matchDate') as HTMLInputElement).value;
    const time = (document.getElementById('matchTime') as HTMLInputElement).value;
    const location = (document.getElementById('matchLocation') as HTMLInputElement).value;
    try {
      await api.patch(`/matches/${editMatch.id}`, { homeScore, awayScore, date, time, location });
      const res = await api.get(`/tournaments/${id}`);
      setTournament(res.data);

      // Detectar si es la final y hay un ganador para mostrar animación
      const updatedMatch = res.data.rounds
        .flatMap((r: any) => r.matches)
        .find((m: any) => m.id === editMatch.id);
      if (
        updatedMatch &&
        updatedMatch.played &&
        updatedMatch.round?.name === 'Final' &&
        updatedMatch.winnerId
      ) {
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
    alert('Link público copiado: ' + url);
  };

  const handleTogglePublic = async () => {
    try {
      await api.patch(`/tournaments/${id}`, { isPublic: !tournament.isPublic });
      setTournament({ ...tournament, isPublic: !tournament.isPublic });
    } catch {}
  };

  // Jugadores
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

  // Equipos
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
      try { await api.patch(`/teams/${teamId}`, { logo: reader.result as string }); const res = await api.get(`/tournaments/${id}`); setTournament(res.data); } catch { alert('Error al subir el escudo'); }
    };
    reader.readAsDataURL(file);
  };

  // Eventos de partido
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

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="glass rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
              <i className="fas fa-arrow-left"></i>
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl md:text-2xl font-bold">{tournament.name}</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tournament.isPublic ? 'bg-accent-500/20 text-accent-400' : 'bg-slate-700 text-slate-400'}`}>
                  {tournament.isPublic ? 'Público' : 'Privado'}
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                {getSportName(tournament.sport)} · {getFormatName(tournament.format)} · {tournament.teams.length} equipos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={handleCopyLink} className="btn-secondary text-sm">
              <i className="fas fa-link"></i> <span className="hidden sm:inline">Compartir</span>
            </button>
            <button onClick={handleTogglePublic} className="btn-secondary text-sm">
              <i className={`fas ${tournament.isPublic ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              <span className="hidden sm:inline">{tournament.isPublic ? 'Privado' : 'Público'}</span>
            </button>
            <div className="text-right ml-4 flex items-center gap-2">
              <div>
                <div className="text-2xl font-bold gradient-text">{playedMatches}/{totalMatches}</div>
                <div className="text-xs text-slate-500">Partidos jugados</div>
              </div>
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-slate-800 flex items-center justify-center relative">
                <svg className="w-14 h-14 md:w-16 md:h-16 transform -rotate-90">
                  <circle cx="50%" cy="50%" r="28" stroke="#1e293b" strokeWidth="4" fill="none" />
                  <circle cx="50%" cy="50%" r="28" stroke="#3b82f6" strokeWidth="4" fill="none"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                    className="transition-all duration-500" />
                </svg>
                <span className="absolute text-xs md:text-sm font-bold">{progress}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-800/50 p-1 rounded-xl overflow-x-auto">
        {[
          { id: 'fixture', label: 'Fixture', icon: 'fa-calendar-alt' },
          { id: 'standings', label: 'Tabla', icon: 'fa-table' },
          { id: 'teams', label: 'Equipos', icon: 'fa-users' },
          { id: 'stats', label: 'Estadísticas', icon: 'fa-chart-bar' },
        ].map(ta => (
          <button key={ta.id} onClick={() => setTab(ta.id)}
            className={`flex-1 min-w-0 px-2 md:px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-1 md:gap-2 ${tab === ta.id ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <i className={`fas ${ta.icon}`}></i>
            <span className="hidden sm:inline">{ta.label}</span>
          </button>
        ))}
      </div>

      {/* Fixture con padding mejorado y contenedor de campeón */}
      {tab === 'fixture' && (
        <div className="space-y-6 animate-fade-in">
          {tournament.rounds.map((round: any) => (
            <div key={round.id} className="glass rounded-2xl p-3 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">
                  {tournament.format === 'eliminatoria' ? round.name : `Jornada ${round.number}`}
                  {round.groupName && <span className="ml-2 text-primary-400">{round.groupName}</span>}
                </h3>
                <span className="text-sm text-slate-500">
                  {round.matches.filter((m: any) => m.played).length}/{round.matches.length} completados
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {round.matches.map((match: any) => {
                  const home = getTeam(match.homeTeamId);
                  const away = getTeam(match.awayTeamId);
                  return (
                    <div key={match.id} onClick={() => { setEditMatch(match); setEditRound(round); }}
                      className={`bg-slate-800/50 rounded-xl p-2.5 md:p-4 border cursor-pointer transition-all hover:border-primary-500/50 ${match.played ? 'border-primary-500/30' : 'border-slate-800'}`}>
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex-1 min-w-0"><TeamBadge team={home} size="sm" /></div>
                        <div className="flex items-center gap-1 md:gap-3 px-1 md:px-4">
                          <span className={`text-lg md:text-2xl font-black ${match.played ? 'text-white' : 'text-slate-600'}`}>{match.played ? match.homeScore : '-'}</span>
                          <span className="text-slate-600 font-bold">:</span>
                          <span className={`text-lg md:text-2xl font-black ${match.played ? 'text-white' : 'text-slate-600'}`}>{match.played ? match.awayScore : '-'}</span>
                        </div>
                        <div className="flex-1 min-w-0 flex justify-end"><TeamBadge team={away} size="sm" /></div>
                      </div>
                      {(match.date || match.time || match.location) && (
                        <div className="flex gap-3 mt-2 text-xs text-slate-500 justify-center flex-wrap">
                          {match.date && <span><i className="far fa-calendar mr-1"></i>{new Date(match.date).toLocaleDateString('es-ES')}</span>}
                          {match.time && <span><i className="far fa-clock mr-1"></i>{match.time}</span>}
                          {match.location && <span><i className="fas fa-map-marker-alt mr-1"></i>{match.location}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {/* Contenedor de campeón justo debajo del fixture */}
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

      {/* Standings con padding mejorado */}
      {tab === 'standings' && (
        <div className="glass rounded-2xl overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-base">
              <thead>
                <tr className="bg-slate-800/80 text-left text-slate-400">
                  {['#','Equipo','PJ','PG','PE','PP','GF','GC','DG','Pts'].map(h => (
                    <th key={h} className="px-2 md:px-6 py-3 md:py-4 font-semibold text-center">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standings.map((team: any, idx: number) => (
                  <tr key={team.id} className={`border-t border-slate-800/50 hover:bg-white/5 transition-colors ${idx < 3 ? 'bg-primary-500/5' : ''}`}>
                    <td className="px-2 md:px-6 py-3 md:py-4">
                      <span className={`w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center font-bold text-xs md:text-sm ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400' : idx === 1 ? 'bg-slate-400/20 text-slate-300' : idx === 2 ? 'bg-orange-600/20 text-orange-400' : 'text-slate-500'}`}>{idx + 1}</span>
                    </td>
                    <td className="px-2 md:px-6 py-3 md:py-4"><TeamBadge team={team} size="sm" /></td>
                    {['played','wins','draws','losses','gf','ga','gd'].map(field => (
                      <td key={field} className="px-2 md:px-6 py-3 md:py-4 text-center">
                        <span className={field === 'wins' ? 'text-accent-400' : field === 'draws' ? 'text-yellow-400' : field === 'losses' ? 'text-red-400' : ''}>
                          {field === 'gd' ? (team.gd > 0 ? '+' : '') + team.gd : team[field]}
                        </span>
                      </td>
                    ))}
                    <td className="px-2 md:px-6 py-3 md:py-4 text-center">
                      <span className="text-lg md:text-xl font-black text-primary-400">{team.points}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Teams (editar equipos, escudo y jugadores) */}
      {tab === 'teams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {tournament.teams.map((team: any) => {
            const teamStats = standings.find((s: any) => s.id === team.id);
            const players = playersByTeam[team.id] || [];
            const isEditingThisTeam = editingTeamId === team.id;
            return (
              <div key={team.id} className="glass p-4 md:p-6 hover-lift">
                <div className="flex items-center gap-2 mb-4">
                  {isEditingThisTeam ? (
                    <div className="flex-1 space-y-3">
                      <div className="flex gap-2">
                        <input value={editingTeamName} onChange={e => setEditingTeamName(e.target.value)} className="input-dark flex-1 text-sm py-1" autoFocus onKeyDown={e => e.key === 'Enter' && saveEditTeam()} />
                        <button onClick={saveEditTeam} className="btn-primary text-xs px-2 py-1"><i className="fas fa-check"></i></button>
                        <button onClick={() => setEditingTeamId(null)} className="btn-secondary text-xs px-2 py-1"><i className="fas fa-times"></i></button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="file" accept="image/*" id={`edit-logo-${team.id}`} className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleTeamLogoChange(team.id, e.target.files[0]); }} />
                        <button type="button" onClick={() => document.getElementById(`edit-logo-${team.id}`)?.click()} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                          <i className="fas fa-image"></i> {team.logo ? 'Cambiar escudo' : 'Añadir escudo'}
                        </button>
                        {team.logo && <img src={team.logo} alt="Vista previa" className="w-6 h-6 rounded object-cover border border-slate-700" />}
                      </div>
                    </div>
                  ) : (
                    <>
                      <TeamBadge team={team} size="lg" />
                      <button onClick={() => startEditTeam(team)} className="text-slate-500 hover:text-slate-300 ml-auto" title="Editar nombre"><i className="fas fa-pen text-xs"></i></button>
                    </>
                  )}
                </div>
                <p className="text-sm text-slate-500 mb-4">{teamStats?.points || 0} pts · {teamStats?.played || 0} PJ</p>
                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div className="bg-slate-800/50 rounded-lg p-2"><div className="text-lg font-bold text-accent-400">{teamStats?.wins || 0}</div><div className="text-xs text-slate-500">Victorias</div></div>
                  <div className="bg-slate-800/50 rounded-lg p-2"><div className="text-lg font-bold text-yellow-400">{teamStats?.draws || 0}</div><div className="text-xs text-slate-500">Empates</div></div>
                  <div className="bg-slate-800/50 rounded-lg p-2"><div className="text-lg font-bold text-red-400">{teamStats?.losses || 0}</div><div className="text-xs text-slate-500">Derrotas</div></div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400 font-medium">Jugadores ({players.length})</span>
                    <button onClick={() => setAddPlayerForTeam(team.id)} className="text-xs text-primary-400 hover:text-primary-300">+ Añadir</button>
                  </div>
                  {players.length === 0 && <p className="text-xs text-slate-500">Sin jugadores</p>}
                  {players.map((player: any) => (
                    <div key={player.id} className="flex items-center justify-between text-sm py-1 group">
                      <span className="truncate">{player.number ? <span className="text-slate-500 mr-1">#{player.number}</span> : ''}{player.name}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditPlayer(player)} className="text-slate-500 hover:text-primary-400" title="Editar"><i className="fas fa-pen text-xs"></i></button>
                        <button onClick={() => deletePlayer(player.id, team.id)} className="text-slate-500 hover:text-red-400" title="Eliminar"><i className="fas fa-trash text-xs"></i></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      {tab === 'stats' && (
        <>
          <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
            <div className="glass p-4 md:p-6">
              <h3 className="text-lg font-bold mb-4">Goles por Equipo</h3>
              <div className="space-y-3">
                {standings.sort((a, b) => b.gf - a.gf).slice(0, 8).map(team => (
                  <div key={team.id} className="flex items-center gap-3">
                    <TeamBadge team={team} size="sm" />
                    <div className="flex-1 min-w-0"><div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-primary-500 h-2 rounded-full" style={{ width: `${Math.min(100, (team.gf / Math.max(1, standings[0]?.gf)) * 100)}%` }}></div></div></div>
                    <span className="text-sm font-bold w-8 text-right">{team.gf}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass p-4 md:p-6">
              <h3 className="text-lg font-bold mb-4">Rendimiento (% victorias)</h3>
              <div className="space-y-3">
                {standings.filter(s => s.played > 0).sort((a, b) => (b.wins / b.played) - (a.wins / a.played)).slice(0, 8).map(team => (
                  <div key={team.id} className="flex items-center gap-3">
                    <TeamBadge team={team} size="sm" />
                    <div className="flex-1 min-w-0"><div className="w-full bg-slate-800 rounded-full h-2"><div className="bg-accent-500 h-2 rounded-full" style={{ width: `${(team.wins / team.played) * 100}%` }}></div></div></div>
                    <span className="text-sm font-bold w-12 text-right">{Math.round((team.wins / team.played) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="glass p-4 md:p-6 mt-6">
            <h3 className="text-lg font-bold mb-4">Resumen del Torneo</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4 text-center"><div className="text-2xl md:text-3xl font-bold text-primary-400">{tournament.rounds.reduce((a, r) => a + r.matches.reduce((b, m) => b + (m.homeScore || 0) + (m.awayScore || 0), 0), 0)}</div><div className="text-sm text-slate-500 mt-1">Total goles/puntos</div></div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center"><div className="text-2xl md:text-3xl font-bold text-accent-400">{playedMatches}</div><div className="text-sm text-slate-500 mt-1">Partidos jugados</div></div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center"><div className="text-2xl md:text-3xl font-bold text-yellow-400">{tournament.rounds.reduce((a, r) => a + r.matches.filter(m => m.played && m.homeScore === m.awayScore).length, 0)}</div><div className="text-sm text-slate-500 mt-1">Empates</div></div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center"><div className="text-2xl md:text-3xl font-bold text-purple-400">{tournament.teams.length}</div><div className="text-sm text-slate-500 mt-1">Equipos</div></div>
            </div>
          </div>
          <div className="glass p-4 md:p-6 mt-6">
            <h3 className="text-lg font-bold mb-4">Máximos Goleadores</h3>
            {topScorers.length === 0 ? <p className="text-sm text-slate-400">Sin datos</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-slate-400 border-b border-slate-800"><th className="text-left py-2">Jugador</th><th className="text-center py-2">Equipo</th><th className="text-center py-2">Goles</th><th className="text-center py-2">Asist.</th><th className="text-center py-2">Amar.</th><th className="text-center py-2">Rojas</th></tr></thead>
                  <tbody>
                    {topScorers.map(p => (
                      <tr key={p.id} className="border-b border-slate-800/50"><td className="py-2">{p.name}</td><td className="text-center py-2 flex justify-center items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.teamColor }}></span>{p.team}</td><td className="text-center py-2 font-bold">{p.goals}</td><td className="text-center py-2">{p.assists}</td><td className="text-center py-2">{p.yellowCards}</td><td className="text-center py-2">{p.redCards}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal Editar Partido con edición/eliminación de eventos */}
      {editMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditMatch(null)}></div>
          <div className="relative bg-dark-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto animate-slide-up p-4 md:p-6 mx-2">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-bold">Registrar Resultado</h3>
              <button onClick={() => setEditMatch(null)} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"><i className="fas fa-times"></i></button>
            </div>
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div className="text-center flex-1">
                {getTeam(editMatch.homeTeamId).logo ? <img src={getTeam(editMatch.homeTeamId).logo} alt="" className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover mx-auto mb-2" /> : <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl mx-auto mb-2 flex items-center justify-center text-xl md:text-2xl" style={{ backgroundColor: getTeam(editMatch.homeTeamId).color + '30', color: getTeam(editMatch.homeTeamId).color }}><i className="fas fa-shield-alt"></i></div>}
                <div className="font-bold text-sm md:text-base">{getTeam(editMatch.homeTeamId).name}</div>
              </div>
              <div className="px-3 md:px-4 text-xl md:text-2xl font-black text-slate-500">VS</div>
              <div className="text-center flex-1">
                {getTeam(editMatch.awayTeamId).logo ? <img src={getTeam(editMatch.awayTeamId).logo} alt="" className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover mx-auto mb-2" /> : <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl mx-auto mb-2 flex items-center justify-center text-xl md:text-2xl" style={{ backgroundColor: getTeam(editMatch.awayTeamId).color + '30', color: getTeam(editMatch.awayTeamId).color }}><i className="fas fa-shield-alt"></i></div>}
                <div className="font-bold text-sm md:text-base">{getTeam(editMatch.awayTeamId).name}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div><label className="block text-sm text-slate-400 mb-2 text-center">Local</label><input type="number" min="0" defaultValue={editMatch.homeScore ?? ''} id="homeScore" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 md:px-4 md:py-4 text-center text-2xl md:text-3xl font-black text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" /></div>
              <div><label className="block text-sm text-slate-400 mb-2 text-center">Visitante</label><input type="number" min="0" defaultValue={editMatch.awayScore ?? ''} id="awayScore" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 md:px-4 md:py-4 text-center text-2xl md:text-3xl font-black text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className="block text-sm font-medium text-slate-400 mb-1.5">Fecha</label><input type="date" defaultValue={editMatch.date ? editMatch.date.split('T')[0] : ''} id="matchDate" className="input-dark" /></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1.5">Hora</label><input type="time" defaultValue={editMatch.time || ''} id="matchTime" className="input-dark" /></div>
            </div>
            <div className="mb-6"><label className="block text-sm font-medium text-slate-400 mb-1.5">Ubicación</label><input type="text" defaultValue={editMatch.location || ''} id="matchLocation" placeholder="Cancha, estadio, etc." className="input-dark" /></div>
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-400 mb-2">Eventos</h4>
              {matchEvents.length === 0 && <p className="text-xs text-slate-500">Sin eventos registrados</p>}
              {matchEvents.map(ev => (
                editingEventId === ev.id ? (
                  <div key={ev.id} className="flex items-center gap-2 text-xs py-1">
                    <input type="number" value={editEventMinute} onChange={e => setEditEventMinute(e.target.value)} placeholder="Min." className="w-12 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-white" />
                    <select value={editEventType} onChange={e => setEditEventType(e.target.value)} className="bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-white"><option value="GOAL">⚽ Gol</option><option value="ASSIST">🅰️ Asist.</option><option value="YELLOW_CARD">🟨 Amar.</option><option value="RED_CARD">🟥 Roja</option></select>
                    <button onClick={() => handleSaveEditEvent(ev.id)} className="text-green-400 hover:text-green-300"><i className="fas fa-check"></i></button>
                    <button onClick={() => setEditingEventId(null)} className="text-slate-400 hover:text-white"><i className="fas fa-times"></i></button>
                  </div>
                ) : (
                  <div key={ev.id} className="flex items-center gap-2 text-sm py-1 group">
                    <span className="text-xs text-slate-500">{ev.minute ? `${ev.minute}'` : ''}</span>
                    <span className="text-xs font-medium">{ev.player.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800">{ev.type}</span>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button onClick={() => { setEditingEventId(ev.id); setEditEventType(ev.type); setEditEventMinute(ev.minute ?? ''); }} className="text-slate-500 hover:text-primary-400" title="Editar"><i className="fas fa-pen text-xs"></i></button>
                      <button onClick={() => handleDeleteEvent(ev.id)} className="text-slate-500 hover:text-red-400" title="Eliminar"><i className="fas fa-trash text-xs"></i></button>
                    </div>
                  </div>
                )
              ))}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <select value={newEvent.playerId} onChange={e => setNewEvent({...newEvent, playerId: e.target.value})} className="input-dark text-xs">
                  <option value="">Jugador</option>
                  {[...(playersByTeam[editMatch?.homeTeamId] || []), ...(playersByTeam[editMatch?.awayTeamId] || [])].map((p: any) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                </select>
                <select value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})} className="input-dark text-xs"><option value="GOAL">⚽ Gol</option><option value="ASSIST">🅰️ Asistencia</option><option value="YELLOW_CARD">🟨 Amarilla</option><option value="RED_CARD">🟥 Roja</option></select>
                <input type="number" placeholder="Minuto" value={newEvent.minute} onChange={e => setNewEvent({...newEvent, minute: e.target.value})} className="input-dark text-xs" />
              </div>
              <button onClick={handleAddEvent} className="mt-2 btn-secondary text-xs">Añadir evento</button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditMatch(null)} className="flex-1 btn-secondary justify-center">Cancelar</button>
              <button onClick={saveMatch} className="flex-1 btn-primary justify-center"><i className="fas fa-save"></i> Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Añadir Jugador */}
      {addPlayerForTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setAddPlayerForTeam(null)}>
          <div className="bg-dark-900 p-4 rounded-xl" onClick={e => e.stopPropagation()}>
            <input value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} placeholder="Nombre" className="input-dark mb-2" />
            <input value={newPlayerNumber} onChange={e => setNewPlayerNumber(e.target.value)} placeholder="Número (opcional)" className="input-dark mb-2" />
            <button onClick={handleAddPlayer} className="btn-primary text-sm w-full">Añadir</button>
          </div>
        </div>
      )}

      {/* Modal Editar Jugador */}
      {editingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditingPlayer(null)}>
          <div className="bg-dark-900 p-4 rounded-xl" onClick={e => e.stopPropagation()}>
            <h4 className="text-sm font-bold mb-2">Editar jugador</h4>
            <input value={editingPlayerName} onChange={e => setEditingPlayerName(e.target.value)} placeholder="Nombre" className="input-dark mb-2" />
            <input value={editingPlayerNumber} onChange={e => setEditingPlayerNumber(e.target.value)} placeholder="Número" className="input-dark mb-2" />
            <button onClick={saveEditPlayer} className="btn-primary text-sm w-full">Guardar cambios</button>
          </div>
        </div>
      )}
    </div>
  );
}

function getSportName(sport: string) {
  const map: Record<string, string> = { futbol: 'Fútbol', futsal: 'Futsal', basket: 'Baloncesto', voley: 'Voleibol', esports: 'eSports', tenis: 'Tenis' };
  return map[sport] || sport;
}
function getFormatName(format: string) {
  const map: Record<string, string> = { liga: 'Liga', eliminatoria: 'Eliminación Directa', grupos: 'Grupos + Eliminatoria' };
  return map[format] || format;
}