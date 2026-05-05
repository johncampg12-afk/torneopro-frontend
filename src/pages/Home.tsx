import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [publicTournaments, setPublicTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tournaments/public')
      .then(res => setPublicTournaments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Torneos Activos', value: publicTournaments.filter(t => t.status === 'active').length, icon: 'fa-play-circle', color: 'text-primary-400' },
    { label: 'Finalizados', value: publicTournaments.filter(t => t.status === 'finished').length, icon: 'fa-check-circle', color: 'text-accent-400' },
    { label: 'Equipos', value: publicTournaments.reduce((a, t) => a + (t._count?.teams || 0), 0), icon: 'fa-users', color: 'text-purple-400' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl mb-8 p-6 md:p-8 lg:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 via-dark-900 to-accent-900/30"></div>
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59,130,246,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(34,197,94,0.1) 0%, transparent 50%)'}}></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-3">
                <span className="gradient-text">TorneoPro</span>
              </h1>
              <p className="text-slate-400 text-base md:text-lg max-w-xl">
                El gestor de torneos deportivos más completo, moderno y <span className="text-accent-400 font-semibold">100% gratuito</span>. 
                Crea, gestiona y comparte tus campeonatos en segundos.
              </p>
            </div>
            <div className="flex gap-3">
              {user ? (
                <Link to="/tournaments/create" className="btn-primary text-sm md:text-lg px-6 md:px-8 py-3 md:py-4">
                  <i className="fas fa-plus"></i> Crear Torneo
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-sm md:text-lg px-6 md:px-8 py-3 md:py-4">
                    <i className="fas fa-rocket"></i> Empezar Gratis
                  </Link>
                  <Link to="/login" className="btn-secondary text-sm md:text-lg px-4 md:px-6 py-3 md:py-4">
                    Iniciar sesión
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="glass p-3 md:p-5 text-center">
            <i className={`fas ${s.icon} ${s.color} text-lg md:text-2xl mb-2`}></i>
            <div className="text-2xl md:text-3xl font-bold">{s.value}</div>
            <div className="text-xs md:text-sm text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Public Tournaments */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold">Torneos Públicos</h2>
        <span className="text-sm text-slate-500">{publicTournaments.length} torneos</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="glass p-6 h-48 animate-pulse">
              <div className="h-12 w-12 rounded-xl bg-slate-800 mb-4"></div>
              <div className="h-6 w-3/4 bg-slate-800 rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      ) : publicTournaments.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl">
          <i className="fas fa-trophy text-4xl text-slate-700 mb-4"></i>
          <h3 className="text-xl font-bold text-slate-400 mb-2">No hay torneos públicos aún</h3>
          <p className="text-slate-600 mb-6">Sé el primero en crear uno</p>
          <Link to={user ? "/tournaments/create" : "/register"} className="btn-primary">
            <i className="fas fa-plus"></i> Crear Torneo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {publicTournaments.map(t => (
            <Link key={t.id} to={`/t/${t.shareCode}`} className="glass p-4 md:p-6 hover-lift group block">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-lg md:text-xl">
                  <i className={`fas ${getSportIcon(t.sport)} text-white`}></i>
                </div>
                <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-bold ${t.status === 'active' ? 'bg-accent-500/20 text-accent-400' : 'bg-slate-700 text-slate-400'}`}>
                  {t.status === 'active' ? 'En curso' : 'Finalizado'}
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-1 group-hover:text-primary-400 transition-colors">{t.name}</h3>
              <p className="text-slate-500 text-xs md:text-sm mb-4">{getSportName(t.sport)} · {getFormatName(t.format)}</p>
              <div className="flex items-center gap-4 text-xs md:text-sm text-slate-400">
                <span><i className="fas fa-users mr-1"></i> {t._count?.teams || 0} equipos</span>
                <span><i className="fas fa-user mr-1"></i> {t.owner?.name || 'Anónimo'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function getSportIcon(sport: string) {
  const map: Record<string, string> = {
    futbol: 'fa-futbol', futsal: 'fa-futbol', basket: 'fa-basketball',
    voley: 'fa-volleyball', esports: 'fa-gamepad', tenis: 'fa-table-tennis-paddle-ball',
  };
  return map[sport] || 'fa-trophy';
}
function getSportName(sport: string) {
  const map: Record<string, string> = {
    futbol: 'Fútbol', futsal: 'Futsal', basket: 'Baloncesto',
    voley: 'Voleibol', esports: 'eSports', tenis: 'Tenis',
  };
  return map[sport] || sport;
}
function getFormatName(format: string) {
  const map: Record<string, string> = {
    liga: 'Liga', eliminatoria: 'Eliminación Directa', grupos: 'Grupos + Eliminatoria',
  };
  return map[format] || format;
}