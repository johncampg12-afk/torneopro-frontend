import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const sports = [
  { id: 'futbol', name: 'Fútbol', icon: 'fa-futbol' },
  { id: 'futsal', name: 'Futsal', icon: 'fa-futbol' },
  { id: 'basket', name: 'Baloncesto', icon: 'fa-basketball' },
  { id: 'voley', name: 'Voleibol', icon: 'fa-volleyball' },
  { id: 'esports', name: 'eSports', icon: 'fa-gamepad' },
  { id: 'tenis', name: 'Tenis', icon: 'fa-table-tennis-paddle-ball' },
];

const formats = [
  { id: 'liga', name: 'Liga (Todos contra todos)', desc: 'Cada equipo juega contra todos. Tabla de posiciones automática.' },
  { id: 'eliminatoria', name: 'Eliminación Directa', desc: 'Bracket de eliminación directa. Un solo perdedor queda fuera.' },
  { id: 'grupos', name: 'Fase de Grupos + Eliminatoria', desc: 'Grupos en round-robin, los mejores avanzan a eliminatoria.' },
];

const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1'];

export default function TournamentCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: '', sport: 'futbol', format: 'liga', doubleRound: false,
    description: '', startDate: '', location: '', isPublic: true,
  });
  const [teams, setTeams] = useState([{ name: '', color: colors[0] }]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const addTeam = () => setTeams([...teams, { name: '', color: colors[teams.length % colors.length] }]);
  const updateTeam = (idx: number, field: string, value: string) => {
    const updated = [...teams];
    updated[idx] = { ...updated[idx], [field]: value };
    setTeams(updated);
  };
  const removeTeam = (idx: number) => {
    if (teams.length > 2) setTeams(teams.filter((_, i) => i !== idx));
  };

  const handleCreate = async () => {
    const validTeams = teams.filter(t => t.name.trim());
    if (validTeams.length < 2) return alert('Mínimo 2 equipos');
    if (!data.name.trim()) return alert('Nombre del torneo requerido');

    setLoading(true);
    try {
      const res = await api.post('/tournaments', { ...data, teams: validTeams });
      navigate(`/tournaments/${res.data.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear torneo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
          <i className="fas fa-arrow-left"></i>
        </button>
        <h2 className="text-2xl font-bold">Crear Nuevo Torneo</h2>
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`flex-1 h-2 rounded-full transition-all ${s <= step ? 'bg-primary-500' : 'bg-slate-800'}`}></div>
        ))}
      </div>

      {step === 1 && (
        <div className="glass p-6 md:p-8 animate-fade-in">
          <h3 className="text-xl font-bold mb-6">Información del Torneo</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Nombre del Torneo *</label>
            <input type="text" value={data.name} onChange={e => setData({...data, name: e.target.value})}
              className="input-dark" placeholder="Ej: Liga de Verano 2026" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-400 mb-2">Deporte</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sports.map(s => (
                <button key={s.id} onClick={() => setData({...data, sport: s.id})}
                  className={`p-3 md:p-4 rounded-xl border transition-all flex flex-col items-center gap-1 md:gap-2 ${data.sport === s.id ? 'border-primary-500 bg-primary-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}>
                  <i className={`fas ${s.icon} text-lg md:text-xl ${data.sport === s.id ? 'text-primary-400' : 'text-slate-500'}`}></i>
                  <span className={`text-xs md:text-sm font-medium ${data.sport === s.id ? 'text-white' : 'text-slate-400'}`}>{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-400 mb-2">Formato</label>
            <div className="space-y-3">
              {formats.map(f => (
                <button key={f.id} onClick={() => setData({...data, format: f.id})}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${data.format === f.id ? 'border-primary-500 bg-primary-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}>
                  <div className={`font-semibold mb-1 ${data.format === f.id ? 'text-white' : 'text-slate-300'}`}>{f.name}</div>
                  <div className="text-sm text-slate-500">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Descripción</label>
            <textarea value={data.description} onChange={e => setData({...data, description: e.target.value})}
              className="input-dark h-24 resize-none" placeholder="Descripción opcional..." />
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Fecha de inicio</label>
              <input type="date" value={data.startDate} onChange={e => setData({...data, startDate: e.target.value})} className="input-dark" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Ubicación</label>
              <input type="text" value={data.location} onChange={e => setData({...data, location: e.target.value})}
                className="input-dark" placeholder="Ej: Cancha Municipal" />
            </div>
          </div>

          {data.format === 'liga' && (
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input type="checkbox" checked={data.doubleRound} onChange={e => setData({...data, doubleRound: e.target.checked})}
                className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-primary-500" />
              <span className="text-slate-300">Ida y vuelta (todos contra todos 2 veces)</span>
            </label>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={data.isPublic} onChange={e => setData({...data, isPublic: e.target.checked})}
              className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-primary-500" />
            <span className="text-slate-300">Torneo público (cualquiera puede verlo)</span>
          </label>

          <div className="mt-8 flex justify-end">
            <button onClick={() => setStep(2)} className="btn-primary">
              <i className="fas fa-arrow-right"></i> Continuar
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="glass p-6 md:p-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Equipos ({teams.filter(t => t.name.trim()).length})</h3>
            <button onClick={addTeam} className="btn-secondary text-sm">
              <i className="fas fa-plus"></i> Agregar Equipo
            </button>
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {teams.map((team, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-3 border border-slate-800">
                <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ backgroundColor: team.color }}></div>
                <input value={team.name} onChange={e => updateTeam(idx, 'name', e.target.value)}
                  placeholder={`Equipo ${idx + 1}`}
                  className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder-slate-600 text-sm md:text-base" />
                <div className="flex gap-1">
                  {colors.slice(0, 5).map(c => (
                    <button key={c} onClick={() => updateTeam(idx, 'color', c)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${team.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}></button>
                  ))}
                </div>
                {teams.length > 2 && (
                  <button onClick={() => removeTeam(idx)} className="w-8 h-8 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 flex items-center justify-center transition-colors">
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-between">
            <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
              <i className="fas fa-arrow-left"></i> Atrás
            </button>
            <button onClick={() => setStep(3)} className="btn-primary">
              <i className="fas fa-arrow-right"></i> Continuar
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="glass p-6 md:p-8 animate-fade-in">
          <h3 className="text-xl font-bold mb-6">Resumen</h3>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between py-3 border-b border-slate-800">
              <span className="text-slate-400">Nombre</span>
              <span className="font-semibold">{data.name}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-800">
              <span className="text-slate-400">Deporte</span>
              <span className="font-semibold">{sports.find(s => s.id === data.sport)?.name}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-800">
              <span className="text-slate-400">Formato</span>
              <span className="font-semibold">{formats.find(f => f.id === data.format)?.name}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-800">
              <span className="text-slate-400">Equipos</span>
              <span className="font-semibold">{teams.filter(t => t.name.trim()).length}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-800">
              <span className="text-slate-400">Visibilidad</span>
              <span className="font-semibold">{data.isPublic ? 'Público' : 'Privado'}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
              <i className="fas fa-arrow-left"></i> Atrás
            </button>
            <button onClick={handleCreate} disabled={loading} className="btn-accent">
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <><i className="fas fa-check"></i> Crear Torneo</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}