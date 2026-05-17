import React, { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../../context/SocketContext';
import { AuthContext } from '../../context/AuthContext';
import PointsCounter from './PointsCounter';
import axios from '../../api/axios';
import { Info } from 'lucide-react';

const Scoreboard = ({ refreshKey = 0 }) => {
  const socket = useContext(SocketContext);
  const { user, setUser } = useContext(AuthContext);
  const [todayScore, setTodayScore] = useState({ totalPoints: 0, rank: 'D' });

  // Fetch today's score from analytics on mount AND whenever a task action fires
  useEffect(() => {
    const fetchTodayScore = async () => {
      try {
        const res = await axios.get('/analytics');
        if (res.data.success && res.data.analytics.chartData.length > 0) {
          const today = res.data.analytics.chartData[res.data.analytics.chartData.length - 1];
          setTodayScore({ totalPoints: today.points, rank: today.rank });
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      }
    };

    fetchTodayScore();
  }, [refreshKey]);

  // Update from user dailyScores if available
  useEffect(() => {
    if (user && user.dailyScores) {
      const today = new Date().toISOString().split('T')[0];
      const entry = user.dailyScores.find(d => d.date === today);
      if (entry) setTodayScore({ totalPoints: entry.totalPoints, rank: entry.rank });
    }
  }, [user]);

  // Listen for real-time updates via socket
  useEffect(() => {
    if (!socket) return;
    
    socket.on('points_update', (data) => {
      setTodayScore({ totalPoints: data.totalPoints, rank: data.rank });
      setUser(prev => ({ ...prev, totalLifetimePoints: data.totalLifetimePoints }));
    });

    return () => {
      socket.off('points_update');
    };
  }, [socket, setUser]);

  const getRankColor = (rank) => {
    switch(rank) {
      case 'S': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-600 shadow-yellow-100 dark:shadow-none';
      case 'A': return 'text-purple-500 bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600 shadow-purple-100 dark:shadow-none';
      case 'B': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 shadow-blue-100 dark:shadow-none';
      case 'C': return 'text-green-500 bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600 shadow-green-100 dark:shadow-none';
      default: return 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600 shadow-gray-100 dark:shadow-none';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border dark:border-slate-700 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 transition-colors duration-300">
      <div>
        <h2 className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1">Today's Points</h2>
        <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
          <PointsCounter value={todayScore.totalPoints} />
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="flex items-center space-x-2 mb-2">
          <h2 className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Current Rank</h2>
          <div className="relative group cursor-help">
            <Info className="w-4 h-4 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors" />
            
            {/* Hover Tooltip */}
            <div className="absolute right-0 top-6 w-56 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xl rounded-xl p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-10 text-sm">
              <p className="font-bold text-gray-800 dark:text-slate-100 mb-2 border-b dark:border-slate-700 pb-1">Daily Rank Guide</p>
              <ul className="space-y-1 text-gray-600 dark:text-slate-300 text-xs">
                <li className="flex justify-between"><span className="font-bold text-yellow-500">⭐ S-Rank</span><span>1000+ pts</span></li>
                <li className="flex justify-between"><span className="font-bold text-purple-500">💜 A-Rank</span><span>700+ pts</span></li>
                <li className="flex justify-between"><span className="font-bold text-blue-500">💙 B-Rank</span><span>400+ pts</span></li>
                <li className="flex justify-between"><span className="font-bold text-green-500">💚 C-Rank</span><span>200+ pts</span></li>
                <li className="flex justify-between"><span className="font-bold text-gray-500">🩶 D-Rank</span><span>0–199 pts</span></li>
              </ul>
              <p className="mt-2 pt-2 border-t dark:border-slate-700 text-xs text-gray-400">Points reset each day. Complete tasks before their deadline for full points. Late = 50% penalty.</p>
            </div>
          </div>
        </div>
        {todayScore.totalPoints > 0 ? (
          <div className={`px-6 py-2 text-3xl font-black rounded-xl border shadow-lg ${getRankColor(todayScore.rank)} transition-all duration-500`}>
            {todayScore.rank} RANK
          </div>
        ) : (
          <div className="px-6 py-2 text-lg font-bold text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
            Start your day!
          </div>
        )}
      </div>
    </div>
  );
};

export default Scoreboard;
