const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: [true, 'Habit name is required'], trim: true, maxlength: 120 },
  category: { type: String, trim: true, default: 'General', maxlength: 40 },
  basePoints: { type: Number, default: 50 }, // Fixed points for habits
  completionLog: [{
    date: { type: String, required: true }, // Format: YYYY-MM-DD local
    timeSpent: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Habit', HabitSchema);
