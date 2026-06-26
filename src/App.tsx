import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BoardPage from './pages/BoardPage';
import WorkspaceSettingsPage from './pages/WorkspaceSettingsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import JoinPage from './pages/JoinPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import useAuth from './hooks/useAuth';
import { useEffect } from 'react';

function App() {
  const { subscribeToAuth } = useAuth();

  // Set up global auth listener on mount
  useEffect(() => {
    const unsubscribe = subscribeToAuth();
    return () => unsubscribe();
  }, [subscribeToAuth]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/board/:boardId" element={<BoardPage />} />
        <Route path="/workspace/:workspaceId/settings" element={<WorkspaceSettingsPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
