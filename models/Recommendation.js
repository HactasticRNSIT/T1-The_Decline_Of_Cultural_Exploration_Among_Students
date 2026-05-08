const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CulturalPlace',
    default: null
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    default: null
  },
  reason: {
    type: String,
    default: ''
  },
  score: {
    type: Number,
    default: 0.8,
    min: 0,
    max: 1
  },
  type: {
    type: String,
    enum: ['place', 'event', 'quest', 'story'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Recommendation', recommendationSchema);
