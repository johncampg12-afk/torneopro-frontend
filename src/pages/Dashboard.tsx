import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      api.get('/tournaments')
        .then(res => setTournaments(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, isLoading, navigate]);

  if (isLoading) return <div className="flex items-center justify-center h-96"><i className="fas fa-circle-notch fa-spin text-3xl text-primary-500"></i></div>;

  const filtered = tournaments.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: tournaments.length,
    active: tournaments.filter(t => t.status === 'active').length,
    finished: tournaments.filter(t => t.status === 'finished').length,
    teams: tournaments.reduce((a, t) => a + (t._count?.teams || 0), 0),
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este torneo permanentemente?')) return;
    try {
      await api.delete(`/tournaments/${id}`);
      setTournaments(tournaments.filter(t => t.id !== id));
    } catch {}
  };

  const handleCopyLink = (code: string) => {
    const url = `${window.location.origin}/t/${code}`;
    navigator.clipboard.writeText(url);
    alert('Link copiado al portapapeles: ' + url);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold">Mis Torneos</h2>
          <p className="text-slate-400">Gestiona todos tus campeonatos</p>
        </div>
        <Link to="/tournaments/create" className="btn-primary">
          <i className="fas fa-plus"></i> Nuevo Torneo
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total, icon: 'fa-trophy', color: 'text-yellow-400' },
          { label: 'Activos', value: stats.active, icon: 'fa-play-circle', color: 'text-primary-400' },
          { label: 'Finalizados', value: stats.finished, icon: 'fa-check-circle', color: 'text-accent-400' },
          { label: 'Equipos', value: stats.teams, icon: 'fa-users', color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="glass p-5 text-center">
            <i className={`fas ${s.icon} ${s.color} text-2xl mb-2`}></i>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[{id:'all',label:'Todos'},{id:'active',label:'En curso'},{id:'finished',label:'Finalizados'},{id:'draft',label:'Borradores'}].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${filter === f.id ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar torneo..."
              className="input-dark pl-11" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="glass p-6 h-48 animate-pulse bg-slate-800/50"></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl">
          <i className="fas fa-trophy text-4xl text-slate-700 mb-4"></i>
          <h3 className="text-xl font-bold text-slate-400 mb-2">No hay torneos {filter !== 'all' ? 'en esta categoría' : ''}</h3>
          <p className="text-slate-600 mb-6">Crea tu primer torneo y empieza a gestionar</p>
          <Link to="/tournaments/create" className="btn-primary"><i className="fas fa-plus"></i> Crear Torneo</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(t => {
            const progress = t.rounds ? Math.round((t.rounds.reduce((a: number, r: any) => a + r.matches.filter((m: any) => m.played).length, 0) / Math.max(1, t.rounds.reduce((a: number, r: any) => a + r.matches.length, 0))) * 100) : 0;
            return (
              <div key={t.id} className="glass p-6 hover-lift group relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-xl">
                    <i className={`fas ${getSportIcon(t.sport)} text-white`}></i>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleCopyLink(t.shareCode)}
                      className="w-8 h-8 rounded-lg hover:bg-primary-500/20 hover:text-primary-400 flex items-center justify-center transition-colors text-slate-400"
                      title="Copiar link público">
                      <i className="fas fa-link"></i>
                    </button>
                    <button onClick={() => handleDelete(t.id)}
                      className="w-8 h-8 rounded-lg hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-colors text-slate-400">
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <Link to={`/tournaments/${t.id}`} className="block">
                  <h3 className="text-xl font-bold mb-1 group-hover:text-primary-400 transition-colors">{t.name}</h3>
                  <p className="text-slate-500 text-sm mb-4">{getSportName(t.sport)} · {getFormatName(t.format)}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                    <span><i className="fas fa-users mr-1"></i> {t._count?.teams || 0} equipos</span>
                    <span><i className="fas fa-calendar mr-1"></i> {t.rounds?.reduce((a: number, r: any) => a + r.matches.length, 0) || 0} partidos</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
                    <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all" style={{width: `${progress}%`}}></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Progreso</span>
                    <span>{progress}%</span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getSportIcon(sport: string) {
  const map: Record<string, string> = { futbol: 'fa-futbol', futsal: 'fa-futbol', basket: 'fa-basketball', voley: 'fa-volleyball', esports: 'fa-gamepad', tenis: 'fa-table-tennis-paddle-ball' };
  return map[sport] || 'fa-trophy';
}
function getSportName(sport: string) {
  const map: Record<string, string> = { futbol: 'Fútbol', futsal: 'Futsal', basket: 'Baloncesto', voley: 'Voleibol', esports: 'eSports', tenis: 'Tenis' };
  return map[sport] || sport;
}
function getFormatName(format: string) {
  const map: Record<string, string> = { liga: 'Liga', eliminatoria: 'Eliminación Directa', grupos: 'Grupos + Eliminatoria' };
  return map[format] || format;
}
