import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const isPublicView = location.pathname.startsWith('/t/');

  return (
    <div className="min-h-screen bg-dark-950">
      {!isPublicView && <Navbar />}
      <main className={`max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 ${isPublicView ? 'py-4' : 'py-4 md:py-8'}`}>
        <Outlet />
      </main>
      {!isPublicView && (
        <footer className="border-t border-slate-800/50 mt-12 md:mt-20 py-6 md:py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm space-y-2">
            <div className="flex justify-center gap-4 flex-wrap">
              <Link to="/AvisoLegal" className="hover:text-white transition-colors">Aviso Legal</Link>
              <Link to="/PoliticaPrivacidad" className="hover:text-white transition-colors">Política de Privacidad</Link>
              <Link to="/TerminosCondiciones" className="hover:text-white transition-colors">Términos</Link>
            </div>
            <p>Torneos TrendSport · Gestor de Torneos</p>
          </div>
        </footer>
      )}
    </div>
  );
}
