import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const formats = [
  {
    id: 'liga',
    name: 'Liga',
    desc: 'Todos contra todos. Tabla de posiciones automática.',
    icon: 'fa-list-ol',
  },
  {
    id: 'eliminatoria',
    name: 'Eliminación Directa',
    desc: 'Bracket de eliminación. Un perdedor queda fuera.',
    icon: 'fa-sitemap',
  },
  {
    id: 'grupos',
    name: 'Grupos + Eliminatoria',
    desc: 'Fase de grupos y luego los mejores avanzan.',
    icon: 'fa-layer-group',
  },
];

const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1'];

const steps = [
  { n: 1, label: 'Info' },
  { n: 2, label: 'Equipos' },
  { n: 3, label: 'Resumen' },
];

export default function TournamentCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: '', format: 'liga', doubleRound: false,
    description: '', startDate: '', location: '', isPublic: true,
  });
  const [teams, setTeams] = useState([{ name: '', color: colors[0], logo: null as string | null }]);
  const [importTemplates, setImportTemplates] = useState<Record<string, string>>({});

  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [userTemplates, setUserTemplates] = useState<any[]>([]);

  if (!user) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    if (showTemplatesModal) {
      api.get('/team-templates')
        .then(res => setUserTemplates(res.data))
        .catch(() => alert('Error al cargar las plantillas.'));
    }
  }, [showTemplatesModal]);

  const addTeam = () => setTeams([...teams, { name: '', color: colors[teams.length % colors.length], logo: null }]);
  const updateTeam = (idx: number, field: string, value: string) => {
    const updated = [...teams];
    updated[idx] = { ...updated[idx], [field]: value };
    setTeams(updated);
  };
  const removeTeam = (idx: number) => {
    if (teams.length > 2) setTeams(teams.filter((_, i) => i !== idx));
  };

  const handleLogoChange = (idx: number, file: File) => {
    if (!file) return;
    if (file.size > 200000) {
      alert('La imagen no debe superar los 200 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateTeam(idx, 'logo', reader.result as string);
    reader.readAsDataURL(file);
  };

  const canContinueStep1 = data.name.trim().length > 0;
  const validTeamsCount = teams.filter(t => t.name.trim()).length;
  const canContinueStep2 = validTeamsCount >= 2;

  const handleCreate = async () => {
    const validTeams = teams
      .filter(t => t.name.trim())
      .map(t => ({ name: t.name.trim(), color: t.color, logo: t.logo || null }));

    if (validTeams.length < 2) return alert('Mínimo 2 equipos');
    if (!data.name.trim()) return alert('Nombre del torneo requerido');

    setLoading(true);
    try {
      const res = await api.post('/tournaments', { ...data, sport: 'futbol', teams: validTeams });
      const created = res.data;

      for (const [indexStr, templateId] of Object.entries(importTemplates)) {
        const teamIndex = parseInt(indexStr);
        if (teamIndex < created.teams.length) {
          try {
            await api.post(`/team-templates/${templateId}/import-to-team/${created.teams[teamIndex].id}`);
          } catch { /* silencioso */ }
        }
      }

      navigate(`/tournaments/${created.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear torneo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
          <i className="fas fa-arrow-left"></i>
        </button>
        <h2 className="text-2xl font-bold">Crear Torneo</h2>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-between mb-8 px-2">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step > s.n ? 'bg-accent-500 text-white' :
                step === s.n ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' :
                'bg-slate-800 text-slate-500'
              }`}>
                {step > s.n ? <i className="fas fa-check"></i> : s.n}
              </div>
              <span className={`text-xs mt-2 font-medium ${step >= s.n ? 'text-white' : 'text-slate-500'}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 transition-all ${step > s.n ? 'bg-accent-500' : 'bg-slate-800'}`}></div>
            )}
          </div>
        ))}
      </div>

      {/* Paso 1: Información */}
      {step === 1 && (
        <div className="glass p-5 md:p-8 rounded-2xl animate-fade-in space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Nombre del torneo *</label>
            <input
              type="text"
              value={data.name}
              onChange={e => setData({ ...data, name: e.target.value })}
              className="input-dark text-lg"
              placeholder="Ej: Liga de Verano 2026"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Formato</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {formats.map(f => (
                <button
                  key={f.id}
                  onClick={() => setData({ ...data, format: f.id })}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    data.format === f.id
                      ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/10'
                      : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                  }`}
                >
                  <i className={`fas ${f.icon} text-xl mb-2 ${data.format === f.id ? 'text-primary-400' : 'text-slate-500'}`}></i>
                  <div className={`font-semibold text-sm mb-1 ${data.format === f.id ? 'text-white' : 'text-slate-300'}`}>{f.name}</div>
                  <div className="text-xs text-slate-500 leading-snug">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {data.format === 'liga' && (
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <input
                type="checkbox"
                checked={data.doubleRound}
                onChange={e => setData({ ...data, doubleRound: e.target.checked })}
                className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-primary-500"
              />
              <div>
                <div className="text-slate-200 text-sm font-medium">Ida y vuelta</div>
                <div className="text-xs text-slate-500">Cada equipo juega contra todos dos veces</div>
              </div>
            </label>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Fecha de inicio</label>
              <input
                type="date"
                value={data.startDate}
                onChange={e => setData({ ...data, startDate: e.target.value })}
                className="input-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Ubicación</label>
              <input
                type="text"
                value={data.location}
                onChange={e => setData({ ...data, location: e.target.value })}
                className="input-dark"
                placeholder="Cancha Municipal"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Descripción <span className="text-slate-500">(opcional)</span></label>
            <textarea
              value={data.description}
              onChange={e => setData({ ...data, description: e.target.value })}
              className="input-dark h-20 resize-none"
              placeholder="Ej: Torneo entre amigos del barrio"
            />
          </div>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800 cursor-pointer">
            <div>
              <div className="text-slate-200 text-sm font-medium">Torneo público</div>
              <div className="text-xs text-slate-500">Cualquiera con el enlace podrá verlo</div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={data.isPublic}
                onChange={e => setData({ ...data, isPublic: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 rounded-full peer-checked:bg-accent-500 transition-colors"></div>
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </div>
          </label>
        </div>
      )}

      {/* Paso 2: Equipos */}
      {step === 2 && (
        <div className="glass p-5 md:p-8 rounded-2xl animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h3 className="text-xl font-bold">Equipos</h3>
              <p className="text-sm text-slate-500">{validTeamsCount} de mínimo 2</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    const res = await api.get('/team-templates');
                    if (res.data.length === 0) {
                      alert('No tienes plantillas guardadas. Guarda un equipo desde un torneo primero.');
                      return;
                    }
                    setShowTemplatesModal(true);
                  } catch { alert('Error al cargar plantillas'); }
                }}
                className="btn-secondary text-sm"
              >
                <i className="fas fa-folder-open"></i> Plantilla
              </button>
              <button onClick={addTeam} className="btn-primary text-sm">
                <i className="fas fa-plus"></i> Añadir equipo
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {teams.map((team, idx) => (
              <div key={idx} className="bg-slate-800/40 rounded-xl p-3 border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  {team.logo ? (
                    <img src={team.logo} alt="escudo" className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-slate-700" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: team.color }}>
                      {team.name.trim() ? team.name.trim()[0].toUpperCase() : '?'}
                    </div>
                  )}
                  <input
                    value={team.name}
                    onChange={e => updateTeam(idx, 'name', e.target.value)}
                    placeholder={`Equipo ${idx + 1}`}
                    className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder-slate-600 text-base font-medium"
                  />
                  {teams.length > 2 && (
                    <button onClick={() => removeTeam(idx)} className="w-9 h-9 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 flex items-center justify-center transition-colors flex-shrink-0">
                      <i className="fas fa-trash text-sm"></i>
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex gap-1.5 flex-wrap">
                    {colors.slice(0, 8).map(c => (
                      <button
                        key={c}
                        onClick={() => updateTeam(idx, 'color', c)}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${team.color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id={`logo-${idx}`}
                      onChange={(e) => { if (e.target.files?.[0]) handleLogoChange(idx, e.target.files[0]); }}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById(`logo-${idx}`)?.click()}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/5"
                    >
                      <i className="fas fa-image"></i>
                      {team.logo ? 'Cambiar' : 'Escudo'}
                    </button>
                    {team.logo && (
                      <button
                        type="button"
                        onClick={() => updateTeam(idx, 'logo', '')}
                        className="text-xs text-slate-500 hover:text-red-400"
                        title="Quitar escudo"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paso 3: Resumen */}
      {step === 3 && (
        <div className="glass p-5 md:p-8 rounded-2xl animate-fade-in space-y-6">
          <h3 className="text-xl font-bold">Resumen</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-slate-800">
              <span className="text-sm text-slate-400">Nombre</span>
              <span className="font-semibold text-right">{data.name}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-800">
              <span className="text-sm text-slate-400">Formato</span>
              <span className="font-semibold">{formats.find(f => f.id === data.format)?.name}{data.format === 'liga' && data.doubleRound ? ' · Ida y vuelta' : ''}</span>
            </div>
            {data.startDate && (
              <div className="flex items-center justify-between py-3 border-b border-slate-800">
                <span className="text-sm text-slate-400">Inicio</span>
                <span className="font-semibold">{new Date(data.startDate).toLocaleDateString('es-ES')}</span>
              </div>
            )}
            {data.location && (
              <div className="flex items-center justify-between py-3 border-b border-slate-800">
                <span className="text-sm text-slate-400">Ubicación</span>
                <span className="font-semibold">{data.location}</span>
              </div>
            )}
            <div className="flex items-center justify-between py-3 border-b border-slate-800">
              <span className="text-sm text-slate-400">Visibilidad</span>
              <span className={`font-semibold ${data.isPublic ? 'text-accent-400' : 'text-slate-400'}`}>{data.isPublic ? 'Público' : 'Privado'}</span>
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-400 mb-3">Equipos ({validTeamsCount})</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {teams.filter(t => t.name.trim()).map((team, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/40 border border-slate-800 min-w-0">
                  {team.logo ? (
                    <img src={team.logo} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full flex-shrink-0" style={{ backgroundColor: team.color }} />
                  )}
                  <span className="text-sm font-medium truncate">{team.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navegación fija abajo */}
      <div className="fixed bottom-0 left-0 right-0 md:sticky md:bottom-auto bg-dark-950/95 md:bg-transparent backdrop-blur-lg md:backdrop-blur-none border-t border-slate-800 md:border-0 p-4 md:p-0 md:mt-6 z-30">
        <div className="max-w-3xl mx-auto flex justify-between gap-3">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="btn-secondary">
              <i className="fas fa-arrow-left"></i> Atrás
            </button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={(step === 1 && !canContinueStep1) || (step === 2 && !canContinueStep2)}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar <i className="fas fa-arrow-right"></i>
            </button>
          ) : (
            <button onClick={handleCreate} disabled={loading} className="btn-accent">
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <><i className="fas fa-check"></i> Crear torneo</>}
            </button>
          )}
        </div>
      </div>

      {/* Modal plantillas */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" onClick={() => setShowTemplatesModal(false)}>
          <div className="bg-dark-900 p-5 rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Tus plantillas</h3>
              <button onClick={() => setShowTemplatesModal(false)} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center">
                <i className="fas fa-times"></i>
              </button>
            </div>
            {userTemplates.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No tienes plantillas guardadas.</p>
            ) : (
              <div className="space-y-2">
                {userTemplates.map(template => (
                  <button
                    key={template.id}
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-800 rounded-xl transition-colors text-left"
                    onClick={() => {
                      const newIndex = teams.length;
                      setTeams([...teams, { name: template.name, color: template.color || colors[newIndex % colors.length], logo: template.logo || null }]);
                      setImportTemplates(prev => ({ ...prev, [newIndex]: template.id }));
                      setShowTemplatesModal(false);
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {template.logo ? (
                        <img src={template.logo} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full flex-shrink-0" style={{ backgroundColor: template.color || '#3b82f6' }} />
                      )}
                      <div className="min-w-0">
                        <div className="font-medium truncate">{template.name}</div>
                        <div className="text-xs text-slate-500">{template.players?.length || 0} jugadores</div>
                      </div>
                    </div>
                    <i className="fas fa-plus text-primary-400"></i>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}