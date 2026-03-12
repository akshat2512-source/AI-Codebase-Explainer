import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import AnalyzerPage from './pages/AnalyzerPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Navigation placeholder */}
        <header className="bg-slate-800 border-b border-slate-700 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-xl font-bold text-white tracking-tight">AI Codebase Explainer</h1>
          </div>
        </header>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analyzer" element={<AnalyzerPage />} />
          </Routes>
        </main>
        
        <footer className="bg-slate-800 border-t border-slate-700 py-6 text-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} AI Codebase Explainer. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
