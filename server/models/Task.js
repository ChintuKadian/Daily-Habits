const mongoose = require('mongoose');

const PRIORITY_POINTS = { high: 100, medium: 50, low: 20 };

const TaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: [true, 'Task name is required'], trim: true, maxlength: 120 },
  category: { type: String, trim: true, default: 'General', maxlength: 40 },
  priority: { type: String, enum: ['high', 'medium', 'low'], required: [true, 'Priority is required'] },
  deadline: { type: Date, required: [true, 'Deadline is required'] },
  status: { type: String, enum: ['pending', 'recovery', 'completed'], default: 'pending', index: true },
  completedAt: { type: Date, default: null },
  basePoints: { type: Number, default: function () { return PRIORITY_POINTS[this.priority] ?? 20; } },
  multiplierApplied: { type: Number, default: null },
  pointsAwarded: { type: Number, default: null },
  isRecovery: { type: Boolean, default: false },
  recoveryDelayMinutes: { type: Number, default: null },
  recoveryNote: { type: String, default: '', maxlength: 280 },
  timeSpent: { type: Number, default: null },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

TaskSchema.virtual('msRemaining').get(function () { return this.deadline - Date.now(); });
TaskSchema.virtual('isOverdue').get(function () { return Date.now() > this.deadline.getTime(); });
TaskSchema.virtual('urgencyTier').get(function () {
  const ms = this.deadline - Date.now();
  if (ms <= 0) return 'overdue';
  if (ms <= 15 * 60_000) return 'critical';
  if (ms <= 60 * 60_000) return 'warning';
  return 'safe';
});

TaskSchema.pre('save', function () {
  if (this.status === 'pending' && Date.now() > this.deadline.getTime()) {
    this.status = 'recovery';
    this.isRecovery = true;
  }
});

TaskSchema.statics.BASE_POINTS = PRIORITY_POINTS;
TaskSchema.index({ userId: 1, status: 1, deadline: 1 });
module.exports = mongoose.model('Task', TaskSchema);
