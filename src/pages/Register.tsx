import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-md">
        <div className="glass p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-600 to-primary-600 flex items-center justify-center text-2xl mx-auto mb-4">
              <i className="fas fa-user-plus text-white"></i>
            </div>
            <h2 className="text-2xl font-bold">Crea tu cuenta</h2>
            <p className="text-slate-400 mt-1">Empieza a gestionar torneos gratis</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Nombre completo</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                className="input-dark" placeholder="Juan Pérez" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="input-dark" placeholder="tu@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Contraseña</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="input-dark" placeholder="Mínimo 6 caracteres" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Confirmar contraseña</label>
              <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className="input-dark" placeholder="Repite tu contraseña" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full btn-accent justify-center py-3">
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <><i className="fas fa-user-plus"></i> Crear cuenta</>}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta? <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Inicia sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
