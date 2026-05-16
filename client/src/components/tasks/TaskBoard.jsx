import React, { useState } from 'react';
import useTasks from '../../hooks/useTasks';
import TaskCard from './TaskCard';
import RecoveryModal from './RecoveryModal';

const TaskBoard = ({ onTaskAction }) => {
  const { tasks, loading, completeTask, recoverTask, createTask, deleteTask } = useTasks();
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newTask, setNewTask] = useState({ name: '', category: 'General', priority: 'medium', deadline: '' });
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleComplete = async (id, timeSpent = 0) => {
    await completeTask(id, timeSpent);
    if (onTaskAction) onTaskAction(); // trigger scoreboard refresh
  };

  const openRecoverModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleRecoverSubmit = async (note) => {
    if (selectedTask) {
      await recoverTask(selectedTask._id, note);
      if (onTaskAction) onTaskAction(); // trigger scoreboard refresh
      setIsModalOpen(false);
      setSelectedTask(null);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    await createTask({ ...newTask, deadline: new Date(newTask.deadline).toISOString() });
    setIsCreateOpen(false);
    setNewTask({ name: '', category: 'General', priority: 'medium', deadline: '' });
  };

  if (loading) return <div className="text-center py-10 dark:text-slate-400">Loading tasks...</div>;

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const completedTasks = tasks.filter(t => {
    if (t.status !== 'completed') return false;
    if (!t.completedAt) return false; // Fallback
    const completedDate = new Date(t.completedAt);
    return completedDate >= todayStart;
  });

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Your Checklist</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 font-bold">
            {completedTasks.length} completed • {pendingTasks.length} remaining
          </p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          + Task
        </button>
      </div>

      {isCreateOpen && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border dark:border-slate-700 mb-8 transition-colors">
          <h3 className="text-lg font-bold mb-4 dark:text-slate-100">Create New Task</h3>
          <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Task Name</label>
              <input type="text" required value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})} className="w-full p-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Category</label>
              <input type="text" value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})} className="w-full p-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Priority</label>
              <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})} className="w-full p-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white">
                <option value="high">High (100 pts)</option>
                <option value="medium">Medium (50 pts)</option>
                <option value="low">Low (20 pts)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Deadline</label>
              <input type="datetime-local" required value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} className="w-full p-2 border dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3 mt-2">
              <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg font-medium">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-sm">Create</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col space-y-3 mb-12">
        {pendingTasks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-400 transition-colors">
            No pending tasks. You're all caught up!
          </div>
        ) : (
          pendingTasks.map(task => (
            <TaskCard key={task._id} task={task} onComplete={handleComplete} onRecover={openRecoverModal} onDelete={deleteTask} />
          ))
        )}
      </div>

      {completedTasks.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-6">Completed Today</h2>
          <div className="flex flex-col space-y-3 opacity-80">
            {completedTasks.map(task => (
              <TaskCard key={task._id} task={task} onComplete={handleComplete} onRecover={openRecoverModal} onDelete={deleteTask} />
            ))}
          </div>
        </>
      )}

      <RecoveryModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedTask(null); }}
        onSubmit={handleRecoverSubmit}
        task={selectedTask}
      />
    </div>
  );
};

export default TaskBoard;
