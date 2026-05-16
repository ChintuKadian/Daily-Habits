import React, { useState, useCallback } from 'react';
import Scoreboard from '../components/dashboard/Scoreboard';
import TaskBoard from '../components/tasks/TaskBoard';

const DashboardPage = () => {
  // A counter that increments every time a task action happens,
  // causing Scoreboard to refetch without needing WebSockets.
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = useCallback(() => setRefreshKey(k => k + 1), []);

  return (
    <div className="max-w-6xl mx-auto">
      <Scoreboard refreshKey={refreshKey} />
      <TaskBoard onTaskAction={triggerRefresh} />
    </div>
  );
};

export default DashboardPage;
