import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import TournamentCreate from './pages/TournamentCreate';
import TournamentDetail from './pages/TournamentDetail';
import PublicTournament from './pages/PublicTournament';
import Templates from './pages/Templates';
import AvisoLegal from './pages/AvisoLegal';
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';
import TerminosCondiciones from './pages/TerminosCondiciones';
import { WelcomePage } from './pages/onboarding/WelcomePage';
import { BasicInfoPage } from './pages/onboarding/BasicInfoPage';
import { AuthPage } from './pages/onboarding/AuthPage';

const RootRedirect = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/welcome" replace />;
  return <Layout />;
};

function App() {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <Routes>
          {/* Onboarding + Auth: standalone, sin Layout */}
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/onboarding/basic-info" element={<BasicInfoPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* App con Layout */}
          <Route path="/" element={<RootRedirect />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tournaments/create" element={<TournamentCreate />} />
            <Route path="tournaments/:id" element={<TournamentDetail />} />
            <Route path="templates" element={<Templates />} />
            <Route path="aviso-legal" element={<AvisoLegal />} />
            <Route path="politica-privacidad" element={<PoliticaPrivacidad />} />
            <Route path="terminos-condiciones" element={<TerminosCondiciones />} />
          </Route>

          {/* Vista pública del torneo */}
          <Route path="/t/:shareCode" element={<PublicTournament />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </OnboardingProvider>
    </AuthProvider>
  );
}

export default App;