import React, { useState } from 'react';
import useTasks from '../../hooks/useTasks';
import TaskCard from './TaskCard';
import RecoveryModal from './RecoveryModal';
import { usePoints } from '../../context/PointsContext';
import { X, Plus } from 'lucide-react';

// Predefined categories with emoji icons — no more blank text box!
const CATEGORIES = [
  { label: 'Work',      emoji: '💼' },
  { label: 'Study',     emoji: '📚' },
  { label: 'Health',    emoji: '🏃' },
  { label: 'Personal',  emoji: '🌱' },
  { label: 'Finance',   emoji: '💰' },
  { label: 'Creative',  emoji: '🎨' },
  { label: 'Social',    emoji: '👥' },
  { label: 'Home',      emoji: '🏠' },
];

const PRIORITIES = [
  { value: 'high',   label: 'High',   pts: 100, latePts: 50,  color: 'bg-red-500',    ring: 'ring-red-400',    bg: 'bg-red-50 dark:bg-red-900/20',    text: 'text-red-600 dark:text-red-400' },
  { value: 'medium', label: 'Medium', pts: 60,  latePts: 30,  color: 'bg-orange-500', ring: 'ring-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' },
  { value: 'low',    label: 'Low',    pts: 30,  latePts: 15,  color: 'bg-green-500',  ring: 'ring-green-400',  bg: 'bg-green-50 dark:bg-green-900/20',  text: 'text-green-600 dark:text-green-400' },
];

const TaskBoard = ({ onTaskAction }) => {
  const { tasks, loading, completeTask, recoverTask, createTask, deleteTask } = useTasks();
  const { pointsEnabled } = usePoints();
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTask, setNewTask] = useState({ name: '', category: 'Work', priority: 'medium', deadline: '' });

  const handleComplete = async (id, timeSpent = 0) => {
    await completeTask(id, timeSpent);
    if (onTaskAction) onTaskAction();
  };

  const openRecoverModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleRecoverSubmit = async (note) => {
    if (selectedTask) {
      await recoverTask(selectedTask._id, note);
      if (onTaskAction) onTaskAction();
      setIsModalOpen(false);
      setSelectedTask(null);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    await createTask({ ...newTask, deadline: new Date(newTask.deadline).toISOString() });
    setIsCreateOpen(false);
    setNewTask({ name: '', category: 'Work', priority: 'medium', deadline: '' });
  };

  const selectedPriority = PRIORITIES.find(p => p.value === newTask.priority);

  if (loading) return <div className="text-center py-10 dark:text-slate-400">Loading tasks...</div>;

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const completedTasks = tasks.filter(t => {
    if (t.status !== 'completed') return false;
    if (!t.completedAt) return false;
    return new Date(t.completedAt) >= todayStart;
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
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Task</span>
        </button>
      </div>

      {/* ── Create Task Modal ───────────────────────────────────── */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl border dark:border-slate-700 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-7 pt-7 pb-4">
              <div>
                <h2 className="text-2xl font-black text-gray-800 dark:text-slate-100">New Task</h2>
                <p className="text-sm text-gray-400 dark:text-slate-500 mt-0.5">
                  {pointsEnabled ? 'Complete on time to earn full points' : 'Set a deadline and stay organized'}
                </p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-slate-700 rounded-full p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="px-7 pb-7 space-y-5">

              {/* Task Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">Task Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Complete assignment, Go for a run..."
                  value={newTask.name}
                  onChange={e => setNewTask({ ...newTask, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Category chips */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                  Category <span className="font-normal text-gray-400">(helps you organise tasks)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.label}
                      type="button"
                      onClick={() => setNewTask({ ...newTask, category: cat.label })}
                      className={`px-3 py-1.5 rounded-xl text-sm font-bold border transition-all ${
                        newTask.category === cat.label
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                          : 'bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500'
                      }`}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority cards */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
                  {pointsEnabled ? 'Priority & Points' : 'Priority'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRIORITIES.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setNewTask({ ...newTask, priority: p.value })}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        newTask.priority === p.value
                          ? `${p.bg} border-current ${p.text} shadow-md scale-[1.03]`
                          : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${p.color} mb-1.5`} />
                      <div className="text-xs font-bold">{p.label}</div>
                      {pointsEnabled && (
                        <>
                          <div className="text-xs font-black mt-0.5">{p.pts} pts</div>
                          <div className="text-xs text-gray-400 dark:text-slate-500">{p.latePts} if late</div>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">Deadline</label>
                <input
                  type="datetime-local"
                  required
                  value={newTask.deadline}
                  onChange={e => setNewTask({ ...newTask, deadline: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-gray-50 dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent [color-scheme:light] dark:[color-scheme:dark] transition-all"
                />
              </div>

              {/* Footer summary + actions */}
              <div className="flex items-center justify-between pt-2 border-t dark:border-slate-700">
                <p className="text-xs text-gray-400 dark:text-slate-500">
                  {pointsEnabled ? (
                    <>You'll earn <span className={`font-black ${selectedPriority?.text}`}>{selectedPriority?.pts} pts</span> if completed on time</>
                  ) : (
                    <span>Stay disciplined and complete before deadline</span>
                  )}
                </p>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl font-bold text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-md transition-colors"
                  >
                    Create Task
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Pending Tasks ───────────────────────────────────────── */}
      <div className="flex flex-col space-y-3 mb-12">
        {pendingTasks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-400 transition-colors">
            No pending tasks. You're all caught up! 🎉
          </div>
        ) : (
          pendingTasks.map(task => (
            <TaskCard key={task._id} task={task} onComplete={handleComplete} onRecover={openRecoverModal} onDelete={deleteTask} />
          ))
        )}
      </div>

      {/* ── Completed Today ─────────────────────────────────────── */}
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
