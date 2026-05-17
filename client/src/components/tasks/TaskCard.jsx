import React, { useState } from 'react';
import useCountdown from '../../hooks/useCountdown';
import { useAudio } from '../../context/AudioContext';
import { usePoints } from '../../context/PointsContext';
import { Clock, AlertCircle, Trash2, Zap } from 'lucide-react';

// Mirror the server point values here for preview (no import needed)
const POINTS_PREVIEW = {
  high:   { onTime: 100, late: 50  },
  medium: { onTime: 60,  late: 30  },
  low:    { onTime: 30,  late: 15  },
};

const TaskCard = ({ task, onComplete, onRecover, onDelete }) => {
  const { hours, mins, secs, isOverdue } = useCountdown(task.deadline);
  const { playPop, playError } = useAudio();
  const { pointsEnabled } = usePoints();
  const [showTimePopup, setShowTimePopup] = useState(false);
  const [timeSpent, setTimeSpent] = useState('');

  const getPriorityColor = () => {
    switch(task.priority) {
      case 'high':   return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low':    return 'bg-green-500';
      default:       return 'bg-gray-400';
    }
  };

  const getPriorityLabel = () => {
    switch(task.priority) {
      case 'high':   return 'High';
      case 'medium': return 'Medium';
      case 'low':    return 'Low';
      default:       return task.priority;
    }
  };

  const isCompleted = task.status === 'completed';
  const isRecovery  = task.status === 'recovery';

  // Check if task is from a previous day (Locked)
  const isLocked = (() => {
    if (isCompleted) return false;
    const deadlineDate = new Date(task.deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return deadlineDate.getTime() < today.getTime();
  })();

  const preview = POINTS_PREVIEW[task.priority] || { onTime: 0, late: 0 };
  const isLate  = isOverdue || isRecovery;

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
  } else if (isLate) {
    cardStyle += "border-red-200 dark:border-red-900/50 bg-red-50/20 dark:bg-red-900/10 shadow-sm";
  } else {
    cardStyle += "hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/50";
  }

  const handleCheckboxClick = (e) => {
    e.preventDefault();
    if (isCompleted) return;
    if (isLocked) { playError(); return; }
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
      <div className="flex items-center space-x-4 min-w-0 flex-1">
        <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${getPriorityColor()}`} />
        <div className="min-w-0">
          <h3 className={`font-bold text-lg leading-tight truncate ${isCompleted ? 'line-through text-gray-400 dark:text-slate-500' : 'text-gray-800 dark:text-slate-100'}`}>
            {task.name}
          </h3>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs font-semibold mt-1">
            {/* Category */}
            <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">
              {task.category}
            </span>

            {/* Priority + Points Preview — only show when pending */}
            {pointsEnabled && !isCompleted && !isLocked && (
              <span className={`flex items-center space-x-1 px-2 py-0.5 rounded-md font-bold ${
                isLate
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400'
                  : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
              }`}>
                <Zap className="w-3 h-3" />
                <span>
                  {isLate
                    ? `${preview.late} pts (late penalty)`
                    : `${preview.onTime} pts`}
                </span>
              </span>
            )}

            {/* Countdown timer */}
            {!isCompleted && !isLocked && (
              <div className={`flex items-center space-x-1 ${isLate ? 'text-red-500 animate-pulse' : 'text-gray-400 dark:text-slate-500'}`}>
                {isLate ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                <span>
                  {isLate
                    ? `LATE ${hours}h ${mins}m ${secs}s`
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

      {/* Right side: Points earned OR checkbox */}
      <div className="flex items-center space-x-4 relative flex-shrink-0 ml-4">
        {isLocked && !isCompleted ? (
          <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 text-xs font-bold rounded-lg border border-gray-200 dark:border-slate-600">
            LOCKED
          </span>
        ) : isCompleted ? (
          <div className="flex flex-col items-end text-xs font-bold">
            {pointsEnabled && (
              <span className={`${task.multiplierApplied < 1 ? 'text-orange-500' : 'text-green-500 dark:text-green-400'}`}>
                + {task.pointsAwarded} pts {task.multiplierApplied < 1 ? '(late)' : '✓'}
              </span>
            )}
            <span className="text-gray-400 dark:text-slate-500 font-medium">{task.timeSpent} mins logged</span>
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
              <div className="absolute right-8 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 p-3 shadow-xl rounded-xl border border-gray-100 dark:border-slate-600 z-20 animate-in fade-in zoom-in duration-200 w-52">
                <p className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-2">
                  How long did this take?
                </p>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    autoFocus
                    min="0"
                    placeholder="Minutes"
                    className="w-24 p-1.5 border dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                    value={timeSpent}
                    onChange={(e) => setTimeSpent(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                  />
                  <button
                    onClick={handleConfirm}
                    className="flex-1 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors"
                  >
                    Save Time
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">
                  {pointsEnabled && <>You'll earn <span className="font-bold text-indigo-500">{isLate ? preview.late : preview.onTime} pts</span></>}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
