import React, { useState } from 'react';

const RecoveryModal = ({ isOpen, onClose, onSubmit, task }) => {
  const [note, setNote] = useState('');

  if (!isOpen || !task) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(note);
    setNote('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transition-colors">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 border-b border-red-100 dark:border-red-900/50">
          <h2 className="text-2xl font-black text-red-600 dark:text-red-400 mb-1">Recovery Mode</h2>
          <p className="text-red-500 dark:text-red-400 text-sm font-medium">This task is past its deadline. Completing it now yields 50% points.</p>
        </div>
        <div className="p-6">
          <p className="font-bold text-gray-800 dark:text-slate-100 mb-4">{task.name}</p>
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">
              Reflection Note (Optional)
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-red-500 focus:border-red-500 dark:bg-slate-700 dark:text-white outline-none resize-none transition-colors"
              rows="3"
              placeholder="Why was this late? What will you do differently?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            ></textarea>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-5 py-2.5 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 hover:-translate-y-0.5 transition-all active:scale-95"
              >
                Recover Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecoveryModal;
