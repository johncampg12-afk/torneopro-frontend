import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';

// Componente local reutilizable para mostrar el nombre del equipo con su logo o círculo de color
const TeamDisplay = ({ team }: { team: any }) => (
  <div className="flex items-center gap-2">
    {team.logo ? (
      <img src={team.logo} alt={team.name} className="w-5 h-5 md:w-6 md:h-6 rounded-full object-cover" />
    ) : (
      <div className="w-3 h-3 md:w-4 md:h-4 rounded-full" style={{ backgroundColor: team.color || '#666' }}></div>
    )}
    <span className="font-semibold text-sm md:text-base truncate">{team.name}</span>
  </div>
);

export default function PublicTournament() {
  const { shareCode } = useParams();
  const [tournament, setTournament] = useState<any>(null);
  const [tab, setTab] = useState('fixture');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [topScorers, setTopScorers] = useState<any[]>([]);

  // Hook colocado antes de cualquier return
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
    api.get(`/tournaments/public/${shareCode}`)
      .then(res => setTournament(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Torneo no encontrado'))
      .finally(() => setLoading(false));
  }, [shareCode]);

  useEffect(() => {
    if (tournament) {
      api.get(`/tournaments/${tournament.id}/top-scorers`)
        .then(res => setTopScorers(res.data))
        .catch(() => {});
    }
  }, [tournament]);

  if (loading) return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <i className="fas fa-circle-notch fa-spin text-3xl text-primary-500"></i>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="text-center">
        <i className="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
        <h2 className="text-xl font-bold text-slate-300 mb-2">{error}</h2>
        <Link to="/" className="btn-primary mt-4 inline-block">
          <i className="fas fa-home"></i> Volver al inicio
        </Link>
      </div>
    </div>
  );

  if (!tournament) return null;

  // Añadir logo: null a la respuesta por defecto
  const getTeam = (teamId: string) =>
    tournament.teams.find((t: any) => t.id === teamId) || { name: 'Por definir', color: '#666', logo: null };

  const playedMatches = tournament.rounds.reduce((a: number, r: any) => a + r.matches.filter((m: any) => m.played).length, 0);
  const totalMatches = tournament.rounds.reduce((a: number, r: any) => a + r.matches.length, 0);

  return (
    <div className="min-h-screen bg-dark-950 animate-fade-in">
      {/* Public Header */}
      <div className="border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <i className="fas fa-trophy text-white text-sm"></i>
              </div>
              <span className="font-bold text-lg md:text-xl tracking-tight">
                Torneo<span className="gradient-text">Pro</span>
              </span>
            </Link>
            <span className="text-xs text-slate-500">Vista pública · Solo lectura</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Tournament Info */}
        <div className="glass rounded-2xl p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{tournament.name}</h1>
              <p className="text-slate-400 text-sm md:text-base">
                {getSportName(tournament.sport)} · {getFormatName(tournament.format)} · Organizado por {tournament.owner?.name || 'Anónimo'}
              </p>
              {tournament.location && (
                <p className="text-slate-500 text-sm mt-1"><i className="fas fa-map-marker-alt mr-1"></i>{tournament.location}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xl md:text-2xl font-bold gradient-text">{playedMatches}/{totalMatches}</div>
                <div className="text-xs text-slate-500">Partidos jugados</div>
              </div>
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-slate-800 flex items-center justify-center relative">
                <svg className="w-14 h-14 md:w-16 md:h-16 transform -rotate-90">
                  <circle cx="50%" cy="50%" r="26" md:r="28" stroke="#1e293b" strokeWidth="4" fill="none" />
                  <circle cx="50%" cy="50%" r="26" md:r="28" stroke="#3b82f6" strokeWidth="4" fill="none"
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    strokeDashoffset={`${2 * Math.PI * 26 * (1 - Math.round((playedMatches / Math.max(1, totalMatches)) * 100) / 100)}`}
                  />
                </svg>
                <span className="absolute text-xs md:text-sm font-bold">{Math.round((playedMatches / Math.max(1, totalMatches)) * 100)}%</span>
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

        {/* Fixture */}
        {tab === 'fixture' && (
          <div className="space-y-6 animate-fade-in">
            {tournament.rounds.map((round: any) => (
              <div key={round.id} className="glass rounded-2xl p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">
                    {tournament.format === 'eliminatoria' ? round.name : `Jornada ${round.number}`}
                    {round.groupName && <span className="ml-2 text-primary-400">{round.groupName}</span>}
                  </h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {round.matches.map((match: any) => {
                    const home = getTeam(match.homeTeamId);
                    const away = getTeam(match.awayTeamId);
                    return (
                      <div key={match.id} className={`bg-slate-800/50 rounded-xl p-3 md:p-4 border ${match.played ? 'border-primary-500/30' : 'border-slate-800'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                            <TeamDisplay team={home} />
                          </div>
                          <div className="flex items-center gap-2 md:gap-3 px-2 md:px-4">
                            <span className={`text-xl md:text-2xl font-black ${match.played ? 'text-white' : 'text-slate-600'}`}>
                              {match.played ? match.homeScore : '-'}
                            </span>
                            <span className="text-slate-600 font-bold">:</span>
                            <span className={`text-xl md:text-2xl font-black ${match.played ? 'text-white' : 'text-slate-600'}`}>
                              {match.played ? match.awayScore : '-'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 justify-end">
                            <TeamDisplay team={away} />
                          </div>
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
          </div>
        )}

        {/* Standings */}
        {tab === 'standings' && (
          <div className="glass rounded-2xl overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-sm md:text-base">
                <thead>
                  <tr className="bg-slate-800/80 text-left text-slate-400">
                    {['#','Equipo','PJ','PG','PE','PP','GF','GC','DG','Pts'].map(h => (
                      <th key={h} className="px-3 md:px-6 py-3 md:py-4 font-semibold text-center">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team: any, idx: number) => (
                    <tr key={team.id} className={`border-t border-slate-800/50 ${idx < 3 ? 'bg-primary-500/5' : ''}`}>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <span className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center font-bold text-xs md:text-sm ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400' : idx === 1 ? 'bg-slate-400/20 text-slate-300' : idx === 2 ? 'bg-orange-600/20 text-orange-400' : 'text-slate-500'}`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <TeamDisplay team={team} />
                      </td>
                      {['played','wins','draws','losses','gf','ga','gd'].map(field => (
                        <td key={field} className="px-3 md:px-6 py-3 md:py-4 text-center">
                          <span className={field === 'wins' ? 'text-accent-400' : field === 'draws' ? 'text-yellow-400' : field === 'losses' ? 'text-red-400' : ''}>
                            {field === 'gd' ? (team.gd > 0 ? '+' : '') + team.gd : team[field]}
                          </span>
                        </td>
                      ))}
                      <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                        <span className="text-lg md:text-xl font-black text-primary-400">{team.points}</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {tournament.teams.map((team: any) => {
              const teamStats = standings.find((s: any) => s.id === team.id);
              return (
                <div key={team.id} className="glass p-4 md:p-6">
                  <div className="flex items-center gap-4 mb-4">
                    {team.logo ? (
                      <img
                        src={team.logo}
                        alt={team.name}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-xl md:text-2xl"
                        style={{ backgroundColor: team.color + '30', color: team.color }}
                      >
                        <i className="fas fa-shield-alt"></i>
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-base md:text-lg">{team.name}</h4>
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
          <>
            <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
              <div className="glass p-4 md:p-6">
                <h3 className="text-lg font-bold mb-4">Goles por Equipo</h3>
                <div className="space-y-3">
                  {standings.sort((a: any, b: any) => b.gf - a.gf).slice(0, 8).map((team: any) => (
                    <div key={team.id} className="flex items-center gap-3">
                      <TeamDisplay team={team} />
                      <div className="flex-1 min-w-0">
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (team.gf / Math.max(1, standings[0]?.gf)) * 100)}%` }}></div>
                        </div>
                      </div>
                      <span className="text-sm font-bold w-8 text-right">{team.gf}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass p-4 md:p-6">
                <h3 className="text-lg font-bold mb-4">Rendimiento (% victorias)</h3>
                <div className="space-y-3">
                  {standings.filter((s: any) => s.played > 0).sort((a: any, b: any) => (b.wins / b.played) - (a.wins / a.played)).slice(0, 8).map((team: any) => (
                    <div key={team.id} className="flex items-center gap-3">
                      <TeamDisplay team={team} />
                      <div className="flex-1 min-w-0">
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div className="bg-accent-500 h-2 rounded-full transition-all" style={{ width: `${(team.wins / team.played) * 100}%` }}></div>
                        </div>
                      </div>
                      <span className="text-sm font-bold w-12 text-right">{Math.round((team.wins / team.played) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Scorers Table */}
            <div className="mt-6 glass p-4 md:p-6">
              <h3 className="text-lg font-bold mb-4">Máximos Goleadores</h3>
              {topScorers.length === 0 ? (
                <p className="text-sm text-slate-400">Sin datos</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="text-left py-2">Jugador</th>
                        <th className="text-center py-2">Equipo</th>
                        <th className="text-center py-2">Goles</th>
                        <th className="text-center py-2">Asist.</th>
                        <th className="text-center py-2">Amar.</th>
                        <th className="text-center py-2">Rojas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topScorers.map((p: any) => (
                        <tr key={p.id} className="border-b border-slate-800/50">
                          <td className="py-2">{p.name}</td>
                          <td className="text-center py-2 flex justify-center items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.teamColor }}></span>
                            {p.team}
                          </td>
                          <td className="text-center py-2 font-bold">{p.goals}</td>
                          <td className="text-center py-2">{p.assists}</td>
                          <td className="text-center py-2">{p.yellowCards}</td>
                          <td className="text-center py-2">{p.redCards}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-slate-800/50 mt-12 md:mt-20 py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-600 text-sm">
          <p>TorneoPro · Gestor de Torneos 100% Gratuito</p>
          <Link to="/" className="text-primary-400 hover:text-primary-300 mt-2 inline-block">Crea tu propio torneo gratis</Link>
        </div>
      </footer>
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