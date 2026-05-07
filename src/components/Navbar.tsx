import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 glass border-b border-slate-800/50 mt-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/torneo-trend-sport.png"
              alt="Torneos TrendSport"
              className="w-16 h-16 rounded-lg object-contain"
            />
            <span className="font-bold text-xl tracking-tight">
              Torneos<span className="gradient-text">TrendSport</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-slate-400 hover:text-white transition-colors font-medium">Inicio</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors font-medium">Mis Torneos</Link>
                <Link to="/tournaments/create" className="btn-primary text-sm">
                  <i className="fas fa-plus"></i> Nuevo Torneo
                </Link>
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-700">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <button onClick={() => { logout(); navigate('/'); }} className="text-slate-400 hover:text-red-400 transition-colors text-sm">
                    <i className="fas fa-sign-out-alt"></i>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-400 hover:text-white transition-colors font-medium">Iniciar sesión</Link>
                <Link to="/register" className="btn-primary text-sm">Registrarse</Link>
              </>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-slate-400 hover:text-white">
            <i className={`fas ${mobileOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass border-t border-slate-800/50 px-4 py-4 space-y-1 animate-fade-in">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block text-slate-400 hover:text-white py-3 px-2 rounded-lg">Inicio</Link>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block text-slate-400 hover:text-white py-3 px-2 rounded-lg">Mis Torneos</Link>
              <Link to="/tournaments/create" onClick={() => setMobileOpen(false)} className="block text-white bg-primary-600 py-3 px-2 rounded-lg text-center font-medium">Nuevo Torneo</Link>
              <button onClick={() => { logout(); navigate('/'); setMobileOpen(false); }} className="block w-full text-left text-red-400 py-3 px-2 rounded-lg">Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-slate-400 hover:text-white py-3 px-2 rounded-lg">Iniciar sesión</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="block text-white bg-primary-600 py-3 px-2 rounded-lg text-center font-medium">Registrarse</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
