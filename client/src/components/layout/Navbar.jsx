import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { LayoutDashboard, BarChart2, LogOut, CheckSquare, Sun, Moon, Trophy, Settings } from 'lucide-react';
import SettingsModal from './SettingsModal';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="bg-white dark:bg-slate-800 shadow-sm border-b dark:border-slate-700 transition-colors duration-300 z-50 relative">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
          <Trophy className="w-6 h-6" />
          <span>Daily Habits</span>
        </Link>
        <div>
          {user ? (
            <div className="flex items-center space-x-6">
              <div className="flex space-x-1 sm:space-x-4">
                <Link 
                  to="/" 
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all font-bold ${
                    isActive('/') 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' 
                      : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="hidden sm:inline">Tasks</span>
                </Link>

                <Link 
                  to="/habits" 
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all font-bold ${
                    isActive('/habits') 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' 
                      : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <CheckSquare className="w-5 h-5" />
                  <span className="hidden sm:inline">Habits</span>
                </Link>

                <Link 
                  to="/analytics" 
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all font-bold ${
                    isActive('/analytics') 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' 
                      : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <BarChart2 className="w-5 h-5" />
                  <span className="hidden sm:inline">Analytics</span>
                </Link>
              </div>
              
              <div className="w-px h-6 bg-gray-200 dark:bg-slate-700"></div>
              
              <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="hidden md:flex items-center justify-center bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-inner px-3 py-1.5 rounded-lg text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono tracking-wide">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>

              <span className="text-gray-800 dark:text-slate-200 font-bold bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full">Hi, {user.name}</span>
              
              <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors">
                <Settings className="w-5 h-5" />
              </button>

              <button onClick={handleLogout} className="text-sm font-bold text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full">
                Logout
              </button>
            </div>
          ) : (
            <div className="space-x-4 flex items-center">
              <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors">Login</Link>
              <Link to="/signup" className="text-sm font-bold bg-indigo-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
      {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
    </>
  );
};

export default Navbar;
