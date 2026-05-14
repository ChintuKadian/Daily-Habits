import React from 'react';
import Scoreboard from '../components/dashboard/Scoreboard';
import TaskBoard from '../components/tasks/TaskBoard';

const DashboardPage = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <Scoreboard />
      <TaskBoard />
    </div>
  );
};

export default DashboardPage;
