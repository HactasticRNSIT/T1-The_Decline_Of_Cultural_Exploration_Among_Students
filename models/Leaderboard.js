const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  xp: {
    type: Number,
    default: 0,
    min: 0
  },
  questsCompleted: {
    type: Number,
    default: 0,
    min: 0
  },
  placesVisited: {
    type: Number,
    default: 0,
    min: 0
  },
  streak: {
    type: Number,
    default: 0,
    min: 0
  },
  rank: {
    type: Number
  },
  period: {
    type: String,
    enum: ['weekly', 'monthly', 'all-time'],
    default: 'all-time'
  }
}, { timestamps: true });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
