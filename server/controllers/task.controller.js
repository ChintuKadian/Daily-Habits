const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');
const { calculate, getRank } = require('../utils/pointCalculator');

const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ deadline: 1 });
    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { name, category, priority, deadline } = req.body;
    
    // Validation logging
    if (!name || !priority || !deadline) {
      console.error('Missing required fields:', { name, priority, deadline });
      return res.status(400).json({ success: false, message: 'Missing required fields: name, priority, deadline' });
    }

    const task = await Task.create({
      userId: req.user._id,
      name,
      category,
      priority,
      deadline
    });
    res.status(201).json({ success: true, task });
  } catch (error) {
    console.error('Error creating task:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

const completeTask = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid task ID' });
    }
    
    const { timeSpent } = req.body;

    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (!task.deadline) return res.status(400).json({ success: false, message: 'Task deadline is missing' });
    if (task.status === 'completed') return res.status(400).json({ success: false, message: 'Task already completed' });
    if (task.status === 'recovery') return res.status(400).json({ success: false, message: 'Task is in recovery mode, use /recover endpoint' });

    const result = calculate({ priority: task.priority, deadline: task.deadline });
    
    task.completedAt = new Date();
    task.multiplierApplied = result.multiplier;
    task.pointsAwarded = result.pointsAwarded;
    task.status = 'completed';
    task.timeSpent = Number(timeSpent) || 0;
    await task.save();

    // Update User Score
    const user = req.user;
    const todayScore = user.getTodayScore();
    todayScore.totalPoints += task.pointsAwarded;
    todayScore.totalTimeSpent += task.timeSpent;
    todayScore.rank = getRank(todayScore.totalPoints).rank;
    user.totalLifetimePoints += task.pointsAwarded;
    user.totalLifetimeTimeSpent += task.timeSpent;
    user.markModified('dailyScores');
    await user.save();

    // Emit Socket Event
    req.app.get('io').to(user._id.toString()).emit('points_update', {
      taskId: task._id,
      pointsAwarded: task.pointsAwarded,
      totalPoints: todayScore.totalPoints,
      rank: todayScore.rank,
      totalLifetimePoints: user.totalLifetimePoints
    });

    res.json({ success: true, task, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const recoverTask = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid task ID' });
    }

    const { recoveryNote, timeSpent } = req.body;
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (!task.deadline) return res.status(400).json({ success: false, message: 'Task deadline is missing' });
    if (task.status === 'completed') return res.status(400).json({ success: false, message: 'Task already completed' });
    if (task.status !== 'recovery') {
       if (Date.now() > task.deadline.getTime()) {
           task.status = 'recovery';
           task.isRecovery = true;
       } else {
           return res.status(400).json({ success: false, message: 'Task is not in recovery mode' });
       }
    }

    const result = calculate({ priority: task.priority, deadline: task.deadline });
    
    task.completedAt = new Date();
    task.multiplierApplied = result.multiplier;
    task.pointsAwarded = result.pointsAwarded;
    task.status = 'completed';
    task.recoveryDelayMinutes = result.minutesLate;
    task.timeSpent = Number(timeSpent) || 0;
    if (recoveryNote) task.recoveryNote = recoveryNote;
    await task.save();

    // Update User Score
    const user = req.user;
    const todayScore = user.getTodayScore();
    todayScore.totalPoints += task.pointsAwarded;
    todayScore.totalTimeSpent += task.timeSpent;
    todayScore.rank = getRank(todayScore.totalPoints).rank;
    user.totalLifetimePoints += task.pointsAwarded;
    user.totalLifetimeTimeSpent += task.timeSpent;
    user.markModified('dailyScores');
    await user.save();

    // Emit Socket Event
    req.app.get('io').to(user._id.toString()).emit('points_update', {
      taskId: task._id,
      pointsAwarded: task.pointsAwarded,
      totalPoints: todayScore.totalPoints,
      rank: todayScore.rank,
      totalLifetimePoints: user.totalLifetimePoints
    });

    res.json({ success: true, task, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid task ID' });
    }

    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTasks, createTask, completeTask, recoverTask, deleteTask };
