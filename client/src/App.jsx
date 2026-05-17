import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { AudioProvider } from './context/AudioContext';
import { PointsProvider } from './context/PointsContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import HabitsPage from './pages/HabitsPage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  return (
    <ThemeProvider>
      <AudioProvider>
        <AuthProvider>
          <SocketProvider>
            <PointsProvider>
              <Router>
                <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
                  <Navbar />
                  <main className="flex-grow container mx-auto px-4 py-8">
                    <Routes>
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignupPage />} />
                      <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/habits" element={<HabitsPage />} />
                        <Route path="/analytics" element={<AnalyticsPage />} />
                      </Route>
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              </Router>
            </PointsProvider>
          </SocketProvider>
        </AuthProvider>
      </AudioProvider>
    </ThemeProvider>
  );
}

export default App;
