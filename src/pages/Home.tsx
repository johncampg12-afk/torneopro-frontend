import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

// Datos del carrusel de publicidad
const ads = [
  {
    id: 1,
    title: 'Patrocinador Oficial',
    subtitle: 'Tienda Deportiva «El Crack»',
    description: '10% de descuento para participantes del torneo',
    image: '/sponsors/sponsor1.png',  // ← Cambia por la ruta real de tu imagen
    color: '#f97316',
    link: '#',
  },
  {
    id: 2,
    title: 'Bar Restaurante «La Goleta»',
    subtitle: 'Comida y bebida para equipos',
    description: 'Reserva tu mesa para después del partido',
    image: '/sponsors/sponsor2.png',
    color: '#10b981',
    link: '#',
  },
  {
    id: 3,
    title: 'Clínica Deportiva «FisioSport»',
    subtitle: 'Recuperación y masajes',
    description: 'Primera sesión gratuita mostrando este anuncio',
    image: '/sponsors/sponsor3.png',
    color: '#3b82f6',
    link: '#',
  },
];

export default function Home() {
  const { user } = useAuth();
  const [publicTournaments, setPublicTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAd, setCurrentAd] = useState(0);

  // Rotación automática cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ads.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
      {/* Carrusel de publicidad */}
      <div className="relative overflow-hidden rounded-3xl mb-8 h-64 md:h-72 lg:h-80">
        {ads.map((ad, index) => (
          <a
            key={ad.id}
            href={ad.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentAd ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div
              className="w-full h-full rounded-3xl p-6 md:p-8 lg:p-12 flex flex-col justify-center"
              style={{
                background: `linear-gradient(135deg, ${ad.color}22 0%, #0f172a 80%)`,
                border: `1px solid ${ad.color}44`,
                boxShadow: `0 0 30px ${ad.color}22`,
              }}
            >
              <div className="flex items-start gap-4 md:gap-6">
                {/* Imagen del anuncio */}
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden flex-shrink-0"
                  style={{ boxShadow: `0 0 20px ${ad.color}66` }}
                >
                  <img
                    src={ad.image}
                    alt={ad.subtitle}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs md:text-sm font-bold tracking-wider uppercase mb-1"
                    style={{ color: ad.color }}
                  >
                    {ad.title}
                  </p>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 truncate">
                    {ad.subtitle}
                  </h2>
                  <p className="text-slate-400 text-sm md:text-base max-w-lg">
                    {ad.description}
                  </p>
                </div>

                {/* Flecha discreta para indicar que es clicable */}
                <div className="hidden sm:flex items-center flex-shrink-0">
                  <i className="fas fa-arrow-right text-slate-600 text-2xl"></i>
                </div>
              </div>
            </div>
          </a>
        ))}

        {/* Indicadores de slide */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {ads.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentAd(idx)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                idx === currentAd
                  ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)] scale-125'
                  : 'bg-slate-600 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Stats (sin cambios) */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="glass p-3 md:p-5 text-center">
            <i className={`fas ${s.icon} ${s.color} text-lg md:text-2xl mb-2`}></i>
            <div className="text-2xl md:text-3xl font-bold">{s.value}</div>
            <div className="text-xs md:text-sm text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Torneos Públicos (sin cambios) */}
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