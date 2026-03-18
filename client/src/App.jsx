import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import AnalyzerPage from './pages/AnalyzerPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SharedAnalysisPage from './pages/SharedAnalysisPage';
import Navbar from './components/Navbar';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
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
        <Route path="/share/:shareId" element={<SharedAnalysisPage />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-[#0a0f1a]">
          <Toaster 
            position="top-right" 
            toastOptions={{ 
              className: '!bg-[#0a0f1a]/80 !text-slate-100 !border !border-white/10 !backdrop-blur-md',
            }} 
          />
          <Navbar />

          <main className="flex-grow relative">
            <AnimatedRoutes />
          </main>

          <footer className="bg-[#0a0f1a] border-t border-white/5 py-6 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                &copy; {new Date().getFullYear()} CodeSage. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-300 transition-colors"
                >
                  GitHub
                </a>
                <span className="text-slate-700">·</span>
                <span>The Premium AI Codebase Explainer</span>
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
