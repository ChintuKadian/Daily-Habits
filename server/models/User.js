const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const DailyScoreSchema = new mongoose.Schema({
  date: { type: String, required: true },
  totalPoints: { type: Number, default: 0 },
  totalTimeSpent: { type: Number, default: 0 },
  rank: { type: String, enum: ['S', 'A', 'B', 'C', 'D'], default: 'D' },
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 60 },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email address'] },
  passwordHash: { type: String, select: false },
  authProvider: { type: String, enum: ['local', 'google', 'github'], default: 'local' },
  authProviderId: { type: String },
  totalLifetimePoints: { type: Number, default: 0 },
  totalLifetimeTimeSpent: { type: Number, default: 0 },
  dailyScores: { type: [DailyScoreSchema], default: [], validate: { validator: (arr) => arr.length <= 365, message: 'dailyScores may not exceed 365 entries' } },
  socketId: { type: String, default: null },
}, { timestamps: true });

UserSchema.methods.matchPassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

UserSchema.methods.getTodayScore = function () {
  const today = new Date().toISOString().split('T')[0];
  let entry = this.dailyScores.find((d) => d.date === today);
  if (!entry) {
    entry = { date: today, totalPoints: 0, totalTimeSpent: 0, rank: 'D' };
    this.dailyScores.push(entry);
  }
  return entry;
};

UserSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

module.exports = mongoose.model('User', UserSchema);
