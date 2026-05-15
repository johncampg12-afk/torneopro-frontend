import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TournamentCreate from './pages/TournamentCreate';
import TournamentDetail from './pages/TournamentDetail';
import PublicTournament from './pages/PublicTournament';
import AvisoLegal from './pages/AvisoLegal';
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';
import TerminosCondiciones from './pages/TerminosCondiciones';
import Templates from './pages/Templates';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tournaments/create" element={<TournamentCreate />} />
          <Route path="tournaments/:id" element={<TournamentDetail />} />
          <Route path="t/:shareCode" element={<PublicTournament />} />
          <Route path="aviso-legal" element={<AvisoLegal />} />
          <Route path="politica-privacidad" element={<PoliticaPrivacidad />} />
          <Route path="terminos-condiciones" element={<TerminosCondiciones />} />
          <Route path="templates" element={<Templates />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;