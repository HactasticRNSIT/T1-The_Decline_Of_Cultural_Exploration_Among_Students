const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quest title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Quest description is required']
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'special'],
    default: 'daily'
  },
  xpReward: {
    type: Number,
    default: 100,
    min: 0
  },
  badge: {
    type: String,
    default: ''
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  category: {
    type: String,
    default: 'general'
  },
  tasks: [
    {
      title: { type: String, required: true },
      completed: { type: Boolean, default: false }
    }
  ],
  icon: {
    type: String,
    default: 'trophy'
  },
  expiresAt: {
    type: Date
  },
  completedBy: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Quest', questSchema);
