const Habit = require('../models/Habit');
const User = require('../models/User');
const { getRank } = require('../utils/pointCalculator');

const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id });
    res.json({ success: true, habits });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createHabit = async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Missing habit name' });

    const habit = await Habit.create({
      userId: req.user._id,
      name,
      category,
      basePoints: 50
    });
    res.status(201).json({ success: true, habit });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const toggleHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, timeSpent } = req.body;

    if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

    const habit = await Habit.findOne({ _id: id, userId: req.user._id });
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });

    const user = req.user;
    let todayScore = user.dailyScores.find(d => d.date === date);
    if (!todayScore) {
      todayScore = { date, totalPoints: 0, totalTimeSpent: 0, rank: 'D' };
      user.dailyScores.push(todayScore);
      if (user.dailyScores.length > 365) user.dailyScores.shift();
    }

    const logIndex = habit.completionLog.findIndex(log => log.date === date);
    let isCompleted = false;

    if (logIndex !== -1) {
      // Untoggle: remove from log and deduct points
      const removedLog = habit.completionLog.splice(logIndex, 1)[0];
      todayScore.totalPoints = Math.max(0, todayScore.totalPoints - habit.basePoints);
      todayScore.totalTimeSpent = Math.max(0, todayScore.totalTimeSpent - (removedLog.timeSpent || 0));
      user.totalLifetimePoints = Math.max(0, user.totalLifetimePoints - habit.basePoints);
      user.totalLifetimeTimeSpent = Math.max(0, user.totalLifetimeTimeSpent - (removedLog.timeSpent || 0));
    } else {
      // Toggle on: add to log and grant points
      habit.completionLog.push({ date, timeSpent: Number(timeSpent) || 0 });
      isCompleted = true;
      todayScore.totalPoints += habit.basePoints;
      todayScore.totalTimeSpent += (Number(timeSpent) || 0);
      user.totalLifetimePoints += habit.basePoints;
      user.totalLifetimeTimeSpent += (Number(timeSpent) || 0);
    }

    await habit.save();
    
    todayScore.rank = getRank(todayScore.totalPoints).rank;
    user.markModified('dailyScores');
    await user.save();

    req.app.get('io').to(user._id.toString()).emit('points_update', {
      habitId: habit._id,
      pointsAwarded: habit.basePoints,
      totalPoints: todayScore.totalPoints,
      rank: todayScore.rank,
      totalLifetimePoints: user.totalLifetimePoints
    });

    res.json({ success: true, habit, isCompleted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
    
    res.json({ success: true, message: 'Habit deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getHabits, createHabit, toggleHabit, deleteHabit };
