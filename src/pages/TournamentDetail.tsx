import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tournament, setTournament] = useState<any>(null);
  const [tab, setTab] = useState('fixture');
  const [loading, setLoading] = useState(true);
  const [editMatch, setEditMatch] = useState<any>(null);
  const [editRound, setEditRound] = useState<any>(null);

  // Todos los hooks van aquí, antes de cualquier return
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
        home.played++;
        away.played++;
        home.gf += match.homeScore;
        home.ga += match.awayScore;
        away.gf += match.awayScore;
        away.ga += match.homeScore;
        if (match.homeScore > match.awayScore) {
          home.wins++;
          away.losses++;
          home.points += pts.win;
          away.points += pts.loss;
        } else if (match.homeScore < match.awayScore) {
          away.wins++;
          home.losses++;
          away.points += pts.win;
          home.points += pts.loss;
        } else {
          home.draws++;
          away.draws++;
          home.points += pts.draw;
          away.points += pts.draw;
        }
      });
    });
    Object.values(standingsMap).sort((a: any, b: any) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <i className="fas fa-circle-notch fa-spin text-3xl text-primary-500"></i>
      </div>
    );
  }

  if (!tournament) return null;

  const getTeam = (teamId: string) =>
    tournament.teams.find((t: any) => t.id === teamId) || { name: 'Por definir', color: '#666' };

  const playedMatches = tournament.rounds.reduce(
    (a: number, r: any) => a + r.matches.filter((m: any) => m.played).length,
    0
  );
  const totalMatches = tournament.rounds.reduce(
    (a: number, r: any) => a + r.matches.length,
    0
  );
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
      setEditMatch(null);
    } catch (err) {
      // opcional: mostrar error
    }
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
    } catch (err) {
      // opcional
    }
  };

  // El resto del componente se mantiene exactamente igual que el original…
  // (Pego el JSX completo para evitar omisiones)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
              <i className="fas fa-arrow-left"></i>
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{tournament.name}</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tournament.isPublic ? 'bg-accent-500/20 text-accent-400' : 'bg-slate-700 text-slate-400'}`}>
                  {tournament.isPublic ? 'Público' : 'Privado'}
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                {getSportName(tournament.sport)} · {getFormatName(tournament.format)} · {tournament.teams.length} equipos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleCopyLink} className="btn-secondary text-sm">
              <i className="fas fa-link"></i> Compartir
            </button>
            <button onClick={handleTogglePublic} className="btn-secondary text-sm">
              <i className={`fas ${tournament.isPublic ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              {tournament.isPublic ? 'Privado' : 'Público'}
            </button>
            <div className="text-right ml-4">
              <div className="text-2xl font-bold gradient-text">{playedMatches}/{totalMatches}</div>
              <div className="text-xs text-slate-500">Partidos jugados</div>
            </div>
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center relative">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="4" fill="none" />
                <circle cx="32" cy="32" r="28" stroke="#3b82f6" strokeWidth="4" fill="none"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                  className="transition-all duration-500" />
              </svg>
              <span className="absolute text-sm font-bold">{progress}%</span>
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
            className={`flex-1 min-w-[100px] px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${tab === ta.id ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <i className={`fas ${ta.icon}`}></i> {ta.label}
          </button>
        ))}
      </div>

      {/* Fixture */}
      {tab === 'fixture' && (
        <div className="space-y-6 animate-fade-in">
          {tournament.rounds.map((round: any) => (
            <div key={round.id} className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">
                  {tournament.format === 'eliminatoria' ? round.name : `Jornada ${round.number}`}
                  {round.groupName && <span className="ml-2 text-primary-400">{round.groupName}</span>}
                </h3>
                <span className="text-sm text-slate-500">
                  {round.matches.filter((m: any) => m.played).length}/{round.matches.length} completados
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {round.matches.map((match: any) => {
                  const home = getTeam(match.homeTeamId);
                  const away = getTeam(match.awayTeamId);
                  return (
                    <div key={match.id} onClick={() => { setEditMatch(match); setEditRound(round); }}
                      className={`bg-slate-800/50 rounded-xl p-4 border cursor-pointer transition-all hover:border-primary-500/50 ${match.played ? 'border-primary-500/30' : 'border-slate-800'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: home.color }}></div>
                          <span className="font-semibold truncate">{home.name}</span>
                        </div>
                        <div className="flex items-center gap-3 px-4">
                          <span className={`text-2xl font-black ${match.played ? 'text-white' : 'text-slate-600'}`}>{match.played ? match.homeScore : '-'}</span>
                          <span className="text-slate-600 font-bold">:</span>
                          <span className={`text-2xl font-black ${match.played ? 'text-white' : 'text-slate-600'}`}>{match.played ? match.awayScore : '-'}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-1 justify-end">
                          <span className="font-semibold truncate">{away.name}</span>
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: away.color }}></div>
                        </div>
                      </div>
                      {(match.date || match.time || match.location) && (
                        <div className="flex gap-3 mt-2 text-xs text-slate-500 justify-center">
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
        </div>
      )}

      {/* Standings */}
      {tab === 'standings' && (
        <div className="glass rounded-2xl overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800/80 text-left text-sm text-slate-400">
                  {['#','Equipo','PJ','PG','PE','PP','GF','GC','DG','Pts'].map(h => (
                    <th key={h} className="px-6 py-4 font-semibold text-center">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standings.map((team: any, idx: number) => (
                  <tr key={team.id} className={`border-t border-slate-800/50 hover:bg-white/5 transition-colors ${idx < 3 ? 'bg-primary-500/5' : ''}`}>
                    <td className="px-6 py-4">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400' : idx === 1 ? 'bg-slate-400/20 text-slate-300' : idx === 2 ? 'bg-orange-600/20 text-orange-400' : 'text-slate-500'}`}>{idx + 1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: team.color }}></div>
                        <span className="font-semibold">{team.name}</span>
                      </div>
                    </td>
                    {['played','wins','draws','losses','gf','ga','gd'].map(field => (
                      <td key={field} className="px-6 py-4 text-center">
                        <span className={field === 'wins' ? 'text-accent-400' : field === 'draws' ? 'text-yellow-400' : field === 'losses' ? 'text-red-400' : ''}>
                          {field === 'gd' ? (team.gd > 0 ? '+' : '') + team.gd : team[field]}
                        </span>
                      </td>
                    ))}
                    <td className="px-6 py-4 text-center">
                      <span className="text-xl font-black text-primary-400">{team.points}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Teams */}
      {tab === 'teams' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {tournament.teams.map((team: any) => {
            const teamStats = standings.find((s: any) => s.id === team.id);
            return (
              <div key={team.id} className="glass p-6 hover-lift">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: team.color + '30', color: team.color }}>
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{team.name}</h4>
                    <p className="text-sm text-slate-500">{teamStats?.points || 0} pts · {teamStats?.played || 0} PJ</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-800/50 rounded-lg p-2">
                    <div className="text-lg font-bold text-accent-400">{teamStats?.wins || 0}</div>
                    <div className="text-xs text-slate-500">Victorias</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2">
                    <div className="text-lg font-bold text-yellow-400">{teamStats?.draws || 0}</div>
                    <div className="text-xs text-slate-500">Empates</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2">
                    <div className="text-lg font-bold text-red-400">{teamStats?.losses || 0}</div>
                    <div className="text-xs text-slate-500">Derrotas</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      {tab === 'stats' && (
        <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
          <div className="glass p-6">
            <h3 className="text-lg font-bold mb-4">Goles por Equipo</h3>
            <div className="space-y-3">
              {standings.sort((a: any, b: any) => b.gf - a.gf).slice(0, 8).map((team: any) => (
                <div key={team.id} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }}></div>
                  <span className="flex-1 text-sm truncate">{team.name}</span>
                  <div className="w-32 bg-slate-800 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (team.gf / Math.max(1, standings[0]?.gf)) * 100)}%` }}></div>
                  </div>
                  <span className="text-sm font-bold w-8 text-right">{team.gf}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass p-6">
            <h3 className="text-lg font-bold mb-4">Rendimiento (% victorias)</h3>
            <div className="space-y-3">
              {standings.filter((s: any) => s.played > 0).sort((a: any, b: any) => (b.wins / b.played) - (a.wins / a.played)).slice(0, 8).map((team: any) => (
                <div key={team.id} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }}></div>
                  <span className="flex-1 text-sm truncate">{team.name}</span>
                  <div className="w-32 bg-slate-800 rounded-full h-2">
                    <div className="bg-accent-500 h-2 rounded-full transition-all" style={{ width: `${(team.wins / team.played) * 100}%` }}></div>
                  </div>
                  <span className="text-sm font-bold w-12 text-right">{Math.round((team.wins / team.played) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass p-6 md:col-span-2">
            <h3 className="text-lg font-bold mb-4">Resumen del Torneo</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-primary-400">
                  {tournament.rounds.reduce((a: number, r: any) => a + r.matches.reduce((b: number, m: any) => b + (m.homeScore || 0) + (m.awayScore || 0), 0), 0)}
                </div>
                <div className="text-sm text-slate-500 mt-1">Total goles/puntos</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-accent-400">{playedMatches}</div>
                <div className="text-sm text-slate-500 mt-1">Partidos jugados</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-yellow-400">
                  {tournament.rounds.reduce((a: number, r: any) => a + r.matches.filter((m: any) => m.played && m.homeScore === m.awayScore).length, 0)}
                </div>
                <div className="text-sm text-slate-500 mt-1">Empates</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-purple-400">{tournament.teams.length}</div>
                <div className="text-sm text-slate-500 mt-1">Equipos</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Match Modal */}
      {editMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditMatch(null)}></div>
          <div className="relative bg-dark-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Registrar Resultado</h3>
              <button onClick={() => setEditMatch(null)} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="flex items-center justify-between mb-8">
              <div className="text-center flex-1">
                <div className="w-16 h-16 rounded-xl mx-auto mb-2 flex items-center justify-center text-2xl" style={{ backgroundColor: getTeam(editMatch.homeTeamId).color + '30' }}>
                  <i className="fas fa-shield-alt" style={{ color: getTeam(editMatch.homeTeamId).color }}></i>
                </div>
                <div className="font-bold">{getTeam(editMatch.homeTeamId).name}</div>
              </div>
              <div className="px-4 text-2xl font-black text-slate-500">VS</div>
              <div className="text-center flex-1">
                <div className="w-16 h-16 rounded-xl mx-auto mb-2 flex items-center justify-center text-2xl" style={{ backgroundColor: getTeam(editMatch.awayTeamId).color + '30' }}>
                  <i className="fas fa-shield-alt" style={{ color: getTeam(editMatch.awayTeamId).color }}></i>
                </div>
                <div className="font-bold">{getTeam(editMatch.awayTeamId).name}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2 text-center">Local</label>
                <input type="number" min="0" defaultValue={editMatch.homeScore ?? ''} id="homeScore"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 text-center text-3xl font-black text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2 text-center">Visitante</label>
                <input type="number" min="0" defaultValue={editMatch.awayScore ?? ''} id="awayScore"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 text-center text-3xl font-black text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Fecha</label>
                <input type="date" defaultValue={editMatch.date ? editMatch.date.split('T')[0] : ''} id="matchDate" className="input-dark" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Hora</label>
                <input type="time" defaultValue={editMatch.time || ''} id="matchTime" className="input-dark" />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Ubicación</label>
              <input type="text" defaultValue={editMatch.location || ''} id="matchLocation" placeholder="Cancha, estadio, etc." className="input-dark" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditMatch(null)} className="flex-1 btn-secondary justify-center">Cancelar</button>
              <button onClick={saveMatch} className="flex-1 btn-primary justify-center">
                <i className="fas fa-save"></i> Guardar
              </button>
            </div>
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