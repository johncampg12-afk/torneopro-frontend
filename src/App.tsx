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
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
