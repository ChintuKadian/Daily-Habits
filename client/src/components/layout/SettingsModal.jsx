import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from '../../api/axios';
import { X, KeyRound, CheckCircle2 } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match');
    }

    setLoading(true);
    try {
      const res = await axios.put('/auth/password', { oldPassword, newPassword });
      if (res.data.success) {
        setSuccess('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const isOAuth = user?.authProvider && user.authProvider !== 'local';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative border dark:border-slate-700">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-slate-700 rounded-full p-2"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Account Settings</h2>
        </div>

        {isOAuth ? (
          <div className="bg-gray-50 dark:bg-slate-700/50 p-6 rounded-2xl text-center border dark:border-slate-600">
            <p className="text-gray-600 dark:text-gray-300 font-medium">
              You are signed in securely with <span className="font-bold capitalize text-indigo-600 dark:text-indigo-400">{user.authProvider}</span>.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Password changes are managed by your OAuth provider.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100 font-bold">{error}</div>}
            {success && <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm border border-green-100 font-bold flex items-center space-x-2"><CheckCircle2 className="w-4 h-4"/><span>{success}</span></div>}
            
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Current Password</label>
              <input 
                type="password" 
                required
                className="w-full border dark:border-slate-600 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow bg-gray-50 dark:bg-slate-700 dark:text-white"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">New Password</label>
              <input 
                type="password" 
                required
                minLength="6"
                className="w-full border dark:border-slate-600 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow bg-gray-50 dark:bg-slate-700 dark:text-white"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Confirm New Password</label>
              <input 
                type="password" 
                required
                minLength="6"
                className="w-full border dark:border-slate-600 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow bg-gray-50 dark:bg-slate-700 dark:text-white"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 shadow-md transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;
