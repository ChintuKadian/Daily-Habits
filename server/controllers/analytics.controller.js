const User = require('../models/User');
const Task = require('../models/Task');

const getAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const sortedScores = [...user.dailyScores].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate total lifetime points from daily scores for accuracy
    const calculatedLifetimePoints = sortedScores.reduce((sum, score) => sum + (score.totalPoints || 0), 0);

    // Update user if there's a mismatch (fixes data inconsistency)
    if (calculatedLifetimePoints !== user.totalLifetimePoints) {
      user.totalLifetimePoints = calculatedLifetimePoints;
      await user.save();
    }

    let currentStreak = 0;
    let maxStreak = 0;

    for (const score of sortedScores) {
      if (score.rank === 'S') {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    const chartData = sortedScores.slice(-7).map(score => ({
      name: score.date,
      points: score.totalPoints,
      rank: score.rank,
      timeSpent: score.totalTimeSpent || 0
    }));

    // ── Category Breakdown ────────────────────────────────────────
    const completedTasks = await Task.find({
      userId: req.user._id,
      status: 'completed'
    }).select('category pointsAwarded timeSpent isRecovery');

    const categoryMap = {};
    completedTasks.forEach(task => {
      const cat = task.category || 'General';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, taskCount: 0, totalPoints: 0, totalTime: 0, onTime: 0, late: 0 };
      }
      categoryMap[cat].taskCount++;
      categoryMap[cat].totalPoints += task.pointsAwarded || 0;
      categoryMap[cat].totalTime  += task.timeSpent || 0;
      if (task.isRecovery) categoryMap[cat].late++;
      else categoryMap[cat].onTime++;
    });

    const categoryData = Object.values(categoryMap)
      .sort((a, b) => b.totalPoints - a.totalPoints); // most productive first

    res.json({
      success: true,
      analytics: {
        totalLifetimePoints: calculatedLifetimePoints,
        maxSRankStreak: maxStreak,
        currentSRankStreak: currentStreak,
        chartData,
        heatmapData: sortedScores,
        categoryData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAnalytics };
