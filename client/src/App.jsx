import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import AnalyzerPage from './pages/AnalyzerPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { LogOut, LogIn, UserPlus, LayoutDashboard } from 'lucide-react';

/**
 * Navbar component — displays auth-aware navigation links.
 */
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-slate-800 border-b border-slate-700 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-white tracking-tight hover:text-blue-400 transition-colors">
          AI Codebase Explainer
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-700"
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <span className="text-sm text-slate-400 hidden sm:inline">
                Hi, <span className="text-white font-medium">{user.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-700"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-700"
              >
                <LogIn size={16} /> Login
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg transition-colors"
              >
                <UserPlus size={16} /> Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/analyzer" element={<AnalyzerPage />} />
            </Routes>
          </main>

          <footer className="bg-slate-800 border-t border-slate-700 py-6 text-center text-sm text-slate-400">
            <p>&copy; {new Date().getFullYear()} AI Codebase Explainer. All rights reserved.</p>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
