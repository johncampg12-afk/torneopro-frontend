import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Templates() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/team-templates')
      .then(res => setTemplates(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta plantilla?')) return;
    await api.delete(`/team-templates/${id}`);
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  if (loading) return <div className="flex items-center justify-center h-96"><i className="fas fa-circle-notch fa-spin text-3xl text-primary-500"></i></div>;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Mis Plantillas de Equipos</h2>
        <Link to="/tournaments/create" className="btn-primary text-sm">Nuevo Torneo</Link>
      </div>
      {templates.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl">
          <i className="fas fa-layer-group text-4xl text-slate-700 mb-4"></i>
          <h3 className="text-xl font-bold text-slate-400 mb-2">No tienes plantillas</h3>
          <p className="text-slate-600">Guarda un equipo desde un torneo para reutilizarlo aquí.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map(t => (
            <div key={t.id} className="glass p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {t.logo ? <img src={t.logo} alt="" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full" style={{ backgroundColor: t.color || '#3b82f6' }}></div>}
                <div>
                  <h4 className="font-bold text-lg">{t.name}</h4>
                  <p className="text-sm text-slate-400">{t.players?.length || 0} jugadores</p>
                </div>
              </div>
              <button onClick={() => handleDelete(t.id)} className="btn-secondary text-xs self-end md:self-center">
                <i className="fas fa-trash"></i> Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}