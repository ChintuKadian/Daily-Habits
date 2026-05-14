import React, { useEffect, useState } from 'react';
import useTasks from '../../hooks/useTasks';
import useHabits from '../../hooks/useHabits';

const ReminderManager = () => {
  const { tasks, loading: tasksLoading } = useTasks();
  const { habits, loading: habitsLoading } = useHabits();
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    if (permission === 'default') {
      Notification.requestPermission().then(setPermission);
    }
  }, [permission]);

  useEffect(() => {
    if (permission !== 'granted') return;
    if (tasksLoading || habitsLoading) return;

    // Filter incomplete tasks
    const pendingTasks = tasks.filter(t => t.status !== 'completed');
    
    // Filter incomplete habits for today
    const realToday = new Date();
    const todayLocal = `${realToday.getFullYear()}-${String(realToday.getMonth() + 1).padStart(2, '0')}-${String(realToday.getDate()).padStart(2, '0')}`;
    const incompleteHabits = habits.filter(h => !h.completionLog.some(log => log.date === todayLocal));

    // Guard clause: if everything is done, do not set the reminder
    if (pendingTasks.length === 0 && incompleteHabits.length === 0) {
      return;
    }

    // Fire reminder after 2 hours
    const timeoutId = setTimeout(() => {
      new Notification("Don't break your streak! 🔥", {
        body: `You still have ${pendingTasks.length} tasks and ${incompleteHabits.length} habits to complete today. Keep pushing!`,
        icon: '/favicon.svg'
      });
    }, 2 * 60 * 60 * 1000); // 2 hours in ms

    return () => clearTimeout(timeoutId);
  }, [permission, tasks, habits, tasksLoading, habitsLoading]);

  return null;
};

export default ReminderManager;
