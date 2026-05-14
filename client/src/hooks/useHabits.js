import { useState, useEffect } from 'react';
import axios from '../api/axios';

const useHabits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/habits');
      if (res.data.success) {
        setHabits(res.data.habits);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const createHabit = async (habitData) => {
    try {
      const res = await axios.post('/habits', habitData);
      if (res.data.success) {
        setHabits((prev) => [...prev, res.data.habit]);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const toggleHabit = async (id, date, timeSpent = 0) => {
    try {
      const res = await axios.patch(`/habits/${id}/toggle`, { date, timeSpent });
      if (res.data.success) {
        setHabits((prev) => prev.map(h => h._id === id ? res.data.habit : h));
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteHabit = async (id) => {
    try {
      const res = await axios.delete(`/habits/${id}`);
      if (res.data.success) {
        setHabits((prev) => prev.filter(h => h._id !== id));
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { habits, loading, fetchHabits, createHabit, toggleHabit, deleteHabit };
};

export default useHabits;
