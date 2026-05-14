import { useState, useEffect } from 'react';
import axios from '../api/axios';

const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/tasks');
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const createTask = async (taskData) => {
    try {
      const res = await axios.post('/tasks', taskData);
      if (res.data.success) {
        setTasks((prev) => [...prev, res.data.task]);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const completeTask = async (id, timeSpent = 0) => {
    try {
      const res = await axios.patch(`/tasks/${id}/complete`, { timeSpent });
      if (res.data.success) {
        setTasks((prev) => prev.map(t => t._id === id ? res.data.task : t));
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const recoverTask = async (id, recoveryNote = '', timeSpent = 0) => {
    try {
      const res = await axios.patch(`/tasks/${id}/recover`, { recoveryNote, timeSpent });
      if (res.data.success) {
        setTasks((prev) => prev.map(t => t._id === id ? res.data.task : t));
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteTask = async (id) => {
    try {
      const res = await axios.delete(`/tasks/${id}`);
      if (res.data.success) {
        setTasks((prev) => prev.filter(t => t._id !== id));
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { tasks, loading, fetchTasks, createTask, completeTask, recoverTask, deleteTask, setTasks };
};

export default useTasks;
