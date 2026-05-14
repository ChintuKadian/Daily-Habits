import React, { useState } from 'react';
import useCountdown from '../../hooks/useCountdown';
import { useAudio } from '../../context/AudioContext';
import { Clock, AlertCircle, Trash2 } from 'lucide-react';

const TaskCard = ({ task, onComplete, onRecover, onDelete }) => {
  const { hours, mins, secs, isOverdue } = useCountdown(task.deadline);
  const { playPop, playError } = useAudio();
  const [showTimePopup, setShowTimePopup] = useState(false);
  const [timeSpent, setTimeSpent] = useState('');
  
  const getPriorityColor = () => {
    switch(task.priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const isCompleted = task.status === 'completed';
  const isRecovery = task.status === 'recovery';

  // Check if task is from a previous day (Locked)
  const isLocked = (() => {
    if (isCompleted) return false; // Already completed, not locked in the sense of disabled actions
    const deadlineDate = new Date(task.deadline);
    deadlineDate.setHours(0,0,0,0);
    const today = new Date();
    today.setHours(0,0,0,0);
    return deadlineDate.getTime() < today.getTime();
  })();

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      onDelete(task._id);
    }
  };

  let cardStyle = "group flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 transition-all duration-300 relative ";
  if (isCompleted) {
    cardStyle += "opacity-60 bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700";
  } else if (isLocked) {
    cardStyle += "opacity-50 grayscale";
  } else if (isOverdue || isRecovery) {
    cardStyle += "border-red-200 dark:border-red-900/50 bg-red-50/20 dark:bg-red-900/10 shadow-sm";
  } else {
    cardStyle += "hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/50";
  }

  const handleCheckboxClick = (e) => {
    e.preventDefault(); // Prevent native check until time is logged
    if (isCompleted) return;
    if (isLocked) {
      playError();
      return;
    }
    setShowTimePopup(true);
  };

  const handleConfirm = () => {
    const time = Number(timeSpent) || 0;
    if (isRecovery || isOverdue) {
      onRecover(task, time);
    } else {
      onComplete(task._id, time);
    }
    playPop();
    setShowTimePopup(false);
  };

  return (
    <div className={cardStyle}>
      {/* Left side: Info */}
      <div className="flex items-center space-x-4">
        <div className={`w-1.5 h-10 rounded-full ${getPriorityColor()}`} />
        <div>
          <h3 className={`font-bold text-lg leading-tight ${isCompleted ? 'line-through text-gray-400 dark:text-slate-500' : 'text-gray-800 dark:text-slate-100'}`}>
            {task.name}
          </h3>
          <div className="flex items-center space-x-3 text-xs font-semibold mt-1">
            <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
              {task.category}
            </span>
            
            {!isCompleted && !isLocked && (
              <div className={`flex items-center space-x-1 ${isOverdue || isRecovery ? 'text-red-500 animate-pulse' : 'text-emerald-500 dark:text-emerald-400'}`}>
                {isOverdue || isRecovery ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                <span>
                  {isOverdue || isRecovery 
                    ? `LATE: ${hours}h ${mins}m ${secs}s` 
                    : `${hours}h ${mins}m ${secs}s left`}
                </span>
              </div>
            )}
            
            {isLocked && !isCompleted && (
              <span className="text-gray-500 dark:text-slate-400">Locked at Midnight</span>
            )}
          </div>
        </div>
      </div>

      <button 
        onClick={handleDelete} 
        className="absolute -top-3 -right-2 bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm text-gray-400 hover:text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
        title="Delete Task"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Right side: Checkbox & Actions */}
      <div className="flex items-center space-x-4 relative">
        {isLocked && !isCompleted ? (
          <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 text-xs font-bold rounded-lg border border-gray-200 dark:border-slate-600">
            LOCKED
          </span>
        ) : isCompleted ? (
          <div className="flex flex-col items-end text-xs font-bold text-green-500 dark:text-green-400">
            <span>+ {task.pointsAwarded} pts</span>
            <span className="text-gray-500 dark:text-slate-400 font-medium">{task.timeSpent} mins logged</span>
          </div>
        ) : (
          <div className="flex items-center relative">
            <input 
              type="checkbox" 
              className="w-6 h-6 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all hover:scale-110"
              checked={isCompleted}
              onChange={handleCheckboxClick}
            />
            
            {/* Time Spent Popup */}
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

export default TaskCard;
