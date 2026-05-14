import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

const HabitCard = ({ habit, onToggle, onDelete }) => {
  const [showTimePopup, setShowTimePopup] = useState(false);
  const [timeSpent, setTimeSpent] = useState('');

  const todayDate = new Date();
  const year = todayDate.getFullYear();
  const month = String(todayDate.getMonth() + 1).padStart(2, '0');
  const day = String(todayDate.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  const isCompletedToday = habit.completionLog.some(log => log.date === dateStr);
  const todaysLog = habit.completionLog.find(log => log.date === dateStr);

  const handleCheckboxClick = (e) => {
    e.preventDefault();
    if (isCompletedToday) return; 
    setShowTimePopup(true);
  };

  const handleConfirm = () => {
    const time = Number(timeSpent) || 0;
    onToggle(habit._id, dateStr, time);
    setShowTimePopup(false);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this habit?")) {
      onDelete(habit._id);
    }
  };

  let cardStyle = "group flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 transition-all duration-300 relative ";
  if (isCompletedToday) {
    cardStyle += "opacity-60 bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700";
  } else {
    cardStyle += "hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/50";
  }

  return (
    <div className={cardStyle}>
      {/* Left side: Info */}
      <div className="flex items-center space-x-4">
        <div className="w-1.5 h-10 rounded-full bg-blue-500" />
        <div>
          <h3 className={`font-bold text-lg leading-tight ${isCompletedToday ? 'line-through text-gray-400 dark:text-slate-500' : 'text-gray-800 dark:text-slate-100'}`}>
            {habit.name}
          </h3>
          <div className="flex items-center space-x-3 text-xs font-semibold mt-1">
            <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
              {habit.category}
            </span>
          </div>
        </div>
      </div>

      <button 
        onClick={handleDelete} 
        className="absolute -top-3 -right-2 bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm text-gray-400 hover:text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
        title="Delete Habit"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Right side: Checkbox */}
      <div className="flex items-center space-x-4 relative">
        {isCompletedToday ? (
          <div className="flex flex-col items-end text-xs font-bold text-green-500 dark:text-green-400">
            <span>+ {habit.basePoints} pts</span>
            <span className="text-gray-500 dark:text-slate-400 font-medium">{todaysLog?.timeSpent} mins logged</span>
          </div>
        ) : (
          <div className="flex items-center relative">
            <input 
              type="checkbox" 
              className="w-6 h-6 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all hover:scale-110"
              checked={isCompletedToday}
              onChange={handleCheckboxClick}
            />
            
            {showTimePopup && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 p-2 shadow-xl rounded-xl border border-gray-100 dark:border-slate-600 z-20 flex space-x-2 animate-in fade-in zoom-in duration-200 w-48">
                <input 
                  type="number" 
                  autoFocus
                  min="0"
                  placeholder="Mins" 
                  className="w-20 p-1.5 border dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white" 
                  value={timeSpent} 
                  onChange={(e) => setTimeSpent(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                />
                <button 
                  onClick={handleConfirm} 
                  className="flex-1 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors"
                >
                  Log
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitCard;
