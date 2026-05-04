import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-md">
        <div className="glass p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-2xl mx-auto mb-4">
              <i className="fas fa-trophy text-white"></i>
            </div>
            <h2 className="text-2xl font-bold">Bienvenido de vuelta</h2>
            <p className="text-slate-400 mt-1">Inicia sesión para gestionar tus torneos</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="input-dark" placeholder="tu@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Contraseña</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="input-dark" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full btn-primary justify-center py-3">
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <><i className="fas fa-sign-in-alt"></i> Iniciar sesión</>}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            ¿No tienes cuenta? <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Regístrate gratis</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
