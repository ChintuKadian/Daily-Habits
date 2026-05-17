import React, { useState, useCallback } from 'react';
import Scoreboard from '../components/dashboard/Scoreboard';
import TaskBoard from '../components/tasks/TaskBoard';
import { usePoints } from '../context/PointsContext';
import { Zap, ZapOff } from 'lucide-react';

const DashboardPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = useCallback(() => setRefreshKey(k => k + 1), []);
  const { pointsEnabled, togglePoints } = usePoints();

  return (
    <div className="max-w-6xl mx-auto">

      {/* Points Mode Toggle Banner */}
      <div className="flex justify-end mb-4">
        <button
          onClick={togglePoints}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all duration-200 shadow-sm ${
            pointsEnabled
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
              : 'bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'
          }`}
          title={pointsEnabled ? 'Click to disable Points Mode' : 'Click to enable Points Mode'}
        >
          {pointsEnabled ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
          <span>{pointsEnabled ? 'Points Mode: ON' : 'Points Mode: OFF'}</span>
        </button>
      </div>

      {/* Scoreboard only shown when points enabled */}
      {pointsEnabled && <Scoreboard refreshKey={refreshKey} />}

      <TaskBoard onTaskAction={triggerRefresh} />
    </div>
  );
};

export default DashboardPage;
