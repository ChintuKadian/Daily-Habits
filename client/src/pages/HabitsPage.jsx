import React, { useState } from 'react';
import useHabits from '../hooks/useHabits';
import { useAudio } from '../context/AudioContext';
import { Plus, X, Trash2, CheckCircle2, Flame } from 'lucide-react';

const getLocalDateString = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const HabitsPage = () => {
  const { habits, loading, createHabit, toggleHabit, deleteHabit } = useHabits();
  const { playPop, playError } = useAudio();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', category: 'General' });

  // Real current date for strict locking
  const realToday = new Date();
  const realYear = realToday.getFullYear();
  const realMonth = realToday.getMonth(); 
  const realDay = realToday.getDate();
  const realTodayStr = getLocalDateString(realYear, realMonth, realDay);

  // Viewing date state
  const [viewYear, setViewYear] = useState(realYear);
  const [viewMonth, setViewMonth] = useState(realMonth);
  
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const yearOptions = [viewYear - 1, viewYear, viewYear + 1]; // Continuous 3-year window

  const handleCreate = async (e) => {
    e.preventDefault();
    await createHabit(newHabit);
    setIsCreateOpen(false);
    setNewHabit({ name: '', category: 'General' });
  };

  const handleToggle = (habitId, day) => {
    const targetDateStr = getLocalDateString(viewYear, viewMonth, day);
    if (targetDateStr !== realTodayStr) {
      playError();
      return; // Strict Midnight Lock: can only toggle real today
    }
    toggleHabit(habitId, targetDateStr, 0); // No time tracking
    playPop();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this habit permanently?")) {
      deleteHabit(id);
    }
  };

  const totalPossible = habits.length * daysInMonth;
  let totalCompleted = 0;
  habits.forEach(h => {
    totalCompleted += h.completionLog.filter(log => log.date.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`)).length;
  });
  const overallPercentage = totalPossible === 0 ? 0 : Math.round((totalCompleted / totalPossible) * 100);

  if (loading) return <div className="text-center py-10">Loading habits...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-6">
          <div>
            <h2 className="text-4xl font-black text-gray-800 dark:text-slate-100 tracking-tight">{monthNames[viewMonth]}</h2>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Habit Tracker</p>
          </div>
          <div className="flex flex-col space-y-2 border-l pl-6 dark:border-slate-700">
            <select 
              value={viewMonth} 
              onChange={(e) => setViewMonth(Number(e.target.value))}
              className="bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 text-sm font-bold text-gray-700 dark:text-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {monthNames.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <select 
              value={viewYear} 
              onChange={(e) => setViewYear(Number(e.target.value))}
              className="bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 text-sm font-bold text-gray-700 dark:text-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        
        <div className="flex items-center space-x-8">
          <div className="flex flex-col items-center bg-indigo-50 dark:bg-indigo-900/20 px-6 py-3 rounded-2xl">
            <span className="text-xs font-bold text-indigo-400 uppercase">Monthly Progress</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{overallPercentage}%</span>
          </div>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Habit</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900 border-b dark:border-slate-700">
                <th className="px-6 py-4 font-black text-gray-700 dark:text-slate-200 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-slate-900 z-10">Daily Habits</th>
                {daysArray.map(day => {
                  const isRealToday = viewYear === realYear && viewMonth === realMonth && day === realDay;
                  return (
                    <th key={day} className={`px-2 py-4 font-bold text-center ${isRealToday ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-t-lg border-b-2 border-indigo-500' : 'text-gray-400 dark:text-slate-500'}`}>
                      <div className="flex flex-col items-center">
                        <span>{day}</span>
                      </div>
                    </th>
                  );
                })}
                <th className="px-6 py-4 font-black text-gray-700 dark:text-slate-200 uppercase tracking-wider text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {habits.length === 0 ? (
                <tr>
                  <td colSpan={daysInMonth + 2} className="px-6 py-12 text-center text-gray-500 font-medium">
                    No habits created yet. Click "New Habit" to start building your routine!
                  </td>
                </tr>
              ) : (
                habits.map((habit, index) => {
                  const completedDays = habit.completionLog.filter(log => log.date.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`)).length;
                  const percentage = Math.round((completedDays / daysInMonth) * 100);

                  // Calculate active streak
                  let currentStreak = 0;
                  const todayDateObj = new Date();
                  todayDateObj.setHours(0, 0, 0, 0);

                  for (let i = 0; i <= 365; i++) {
                    const d = new Date(todayDateObj);
                    d.setDate(d.getDate() - i);
                    const dateStr = getLocalDateString(d.getFullYear(), d.getMonth(), d.getDate());
                    const isCompleted = habit.completionLog.some(log => log.date === dateStr);
                    
                    if (i === 0) {
                      if (isCompleted) currentStreak++;
                    } else {
                      if (isCompleted) currentStreak++;
                      else break;
                    }
                  }

                  return (
                    <tr key={habit._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 group transition-colors">
                      <td className="px-6 py-3 font-bold text-gray-800 dark:text-slate-200 sticky left-0 bg-white dark:bg-slate-800 group-hover:bg-gray-50 dark:group-hover:bg-slate-800 z-10 flex items-center justify-between border-r dark:border-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-300 dark:text-slate-600 font-mono text-xs w-4">{index + 1}.</span>
                          <span>{habit.name}</span>
                          {currentStreak > 0 && (
                            <div className="flex items-center space-x-1 text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded-md" title={`${currentStreak} Day Streak!`}>
                              <Flame className="w-3.5 h-3.5" />
                              <span className="text-xs font-black">{currentStreak}</span>
                            </div>
                          )}
                        </div>
                        <button onClick={() => handleDelete(habit._id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 ml-4">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                      
                      {daysArray.map(day => {
                        const isRealToday = viewYear === realYear && viewMonth === realMonth && day === realDay;
                        const dateStr = getLocalDateString(viewYear, viewMonth, day);
                        const isCompleted = habit.completionLog.some(log => log.date === dateStr);
                        
                        return (
                          <td key={day} className={`px-2 py-3 text-center ${isRealToday ? 'bg-indigo-50/20 dark:bg-indigo-900/10' : ''}`}>
                            <button
                              onClick={() => handleToggle(habit._id, day)}
                              disabled={!isRealToday}
                              className={`w-6 h-6 rounded flex items-center justify-center transition-all mx-auto ${
                                isCompleted 
                                  ? 'bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)] scale-110' 
                                  : isRealToday 
                                    ? 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 cursor-pointer border border-gray-200 dark:border-slate-600'
                                    : 'bg-gray-50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-700/50 cursor-not-allowed opacity-40'
                              }`}
                            >
                              {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                            </button>
                          </td>
                        );
                      })}
                      
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <div className="w-24 bg-gray-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden shadow-inner">
                            <div className="bg-gradient-to-r from-emerald-400 to-green-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                          <span className="font-bold text-gray-700 dark:text-slate-300 text-xs w-12">{percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative border dark:border-slate-700">
            <button 
              onClick={() => setIsCreateOpen(false)}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-slate-700 rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-slate-100">Create Daily Habit</h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Habit Name</label>
                <input 
                  type="text" 
                  required
                  autoFocus
                  className="w-full border dark:border-slate-600 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow bg-gray-50 dark:bg-slate-700 dark:text-white"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                  placeholder="e.g. Read 10 pages"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 shadow-md transition-colors"
              >
                Create Habit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitsPage;
