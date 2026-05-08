import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

// Datos del carrusel de publicidad (solo imágenes)
const ads = [
  { id: 1, image: '/sponsors/dental-fresh-plus-hrz.jpeg', link: '' },
  { id: 2, image: '/sponsors/trend-sport-hrz.png', link: '' },
  { id: 3, image: '/sponsors/igana.png', link: 'https://www.igpro-analyzer.com/' },
  { id: 4, image: '/sponsors/anentBanner.png', link: '' },
  { id: 5, image: '/sponsors/dental.jpeg', link: '' },
  { id: 6, image: '/sponsors/EMPRENDE-CONMIGO-TREND-SPORT.png', link: '' },
  { id: 7, image: '/sponsors/trend-sport-logo.jpeg', link: '' },
  { id: 8, image: '/sponsors/ig.png', link: 'https://www.igpro-analyzer.com/' },
];

export default function Home() {
  const { user } = useAuth();
  const [publicTournaments, setPublicTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAd, setCurrentAd] = useState(0);
  const [allTeams, setAllTeams] = useState<any[]>([]);

  // Rotación de publicidad
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ads.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    api.get('/tournaments/public')
      .then(res => {
        setPublicTournaments(res.data);
        // Extraer todos los equipos de torneos públicos
        const teams = res.data.flatMap((t: any) =>
          (t.teams || []).map((team: any) => ({
            ...team,
            tournamentName: t.name,
          }))
        );
        // Eliminar duplicados por id (si un mismo equipo está en varios torneos)
        const unique = teams.filter((v: any, i: number, a: any[]) =>
          a.findIndex((t: any) => t.id === v.id) === i
        );
        setAllTeams(unique);
      })
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
            className={`absolute inset-0 transition-opacity duration-700 overflow-hidden rounded-3xl bg-gray-900 ${
              index === currentAd ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={ad.image}
              alt="Anuncio patrocinador"
              className="absolute inset-0 w-full h-full object-contain md:object-cover"
            />
          </a>
        ))}
      </div>

      {/* Carrusel de equipos estilo pasarela */}
      {allTeams.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider text-center">
            Equipos participantes
          </h3>
          <div className="relative overflow-hidden glass py-3 rounded-2xl">
            <div className="flex animate-marquee">
              {/* Primera copia de los equipos */}
              {allTeams.map(team => (
                <div key={team.id} className="flex items-center gap-3 mx-6 flex-shrink-0">
                  {team.logo ? (
                    <img src={team.logo} alt={team.name} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-slate-700" />
                  ) : (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full" style={{ backgroundColor: team.color || '#3b82f6' }}></div>
                  )}
                  <span className="text-sm md:text-base font-semibold whitespace-nowrap">{team.name}</span>
                </div>
              ))}
              {/* Segunda copia para continuidad infinita */}
              {allTeams.map(team => (
                <div key={`dup-${team.id}`} className="flex items-center gap-3 mx-6 flex-shrink-0">
                  {team.logo ? (
                    <img src={team.logo} alt={team.name} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border border-slate-700" />
                  ) : (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full" style={{ backgroundColor: team.color || '#3b82f6' }}></div>
                  )}
                  <span className="text-sm md:text-base font-semibold whitespace-nowrap">{team.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="glass p-3 md:p-5 text-center">
            <i className={`fas ${s.icon} ${s.color} text-lg md:text-2xl mb-2`}></i>
            <div className="text-2xl md:text-3xl font-bold">{s.value}</div>
            <div className="text-xs md:text-sm text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Torneos Públicos */}
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
          <img src="/torneo-trend-sport.png" alt="Escudo" className="w-16 h-16 mx-auto mb-4 object-contain" />
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