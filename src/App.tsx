import { Routes, Route, Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import TournamentCreate from './pages/TournamentCreate';
import TournamentDetail from './pages/TournamentDetail';
import PublicTournament from './pages/PublicTournament';
import Templates from './pages/Templates';
import MyBets from './pages/MyBets';
import Profile from './pages/Profile';
import Rewards from './pages/Rewards';
import AvisoLegal from './pages/AvisoLegal';
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';
import TerminosCondiciones from './pages/TerminosCondiciones';
import { WelcomePage } from './pages/onboarding/WelcomePage';
import { BasicInfoPage } from './pages/onboarding/BasicInfoPage';
import { AuthPage } from './pages/onboarding/AuthPage';

// Rutas que solo ven los organizadores
const OrganizerRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/welcome" replace />;
  if (user.role !== 'organizer') return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Rutas que solo ven usuarios normales (no organizadores)
const UserRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/welcome" replace />;
  if (user.role === 'organizer') return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Rutas que solo ven usuarios logueados (cualquier rol)
const AuthedRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
};

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
          {/* Onboarding + Auth: sin Layout */}
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/onboarding/basic-info" element={<BasicInfoPage />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* App con Layout */}
          <Route path="/" element={<RootRedirect />}>
            <Route index element={<Home />} />

            {/* Solo organizadores */}
            <Route
              path="dashboard"
              element={
                <OrganizerRoute>
                  <Dashboard />
                </OrganizerRoute>
              }
            />
            <Route
              path="tournaments/create"
              element={
                <OrganizerRoute>
                  <TournamentCreate />
                </OrganizerRoute>
              }
            />
            <Route
              path="templates"
              element={
                <OrganizerRoute>
                  <Templates />
                </OrganizerRoute>
              }
            />

            {/* Solo usuarios normales */}
            <Route
              path="profile"
              element={
                <UserRoute>
                  <Profile />
                </UserRoute>
              }
            />
            <Route
              path="my-bets"
              element={
                <UserRoute>
                  <MyBets />
                </UserRoute>
              }
            />
            <Route
              path="my-rewards"
              element={
                <UserRoute>
                  <MyBets />
                </UserRoute>
              }
            />

            {/* Cualquier usuario logueado */}
            <Route
              path="tournaments/:id"
              element={
                <AuthedRoute>
                  <TournamentDetail />
                </AuthedRoute>
              }
            />

            {/* Público (dentro del Layout) */}
            <Route path="rewards" element={<Rewards />} />
            <Route path="aviso-legal" element={<AvisoLegal />} />
            <Route path="politica-privacidad" element={<PoliticaPrivacidad />} />
            <Route path="terminos-condiciones" element={<TerminosCondiciones />} />
          </Route>

          {/* Vista pública (sin Layout) */}
          <Route path="/t/:shareCode" element={<PublicTournament />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </OnboardingProvider>
    </AuthProvider>
  );
}

export default App;