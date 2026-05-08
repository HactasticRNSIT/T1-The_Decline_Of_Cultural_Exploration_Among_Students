const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['festival', 'workshop', 'exhibition', 'performance', 'walk', 'other'],
    default: 'other'
  },
  location: {
    name:    { type: String, default: '' },
    address: { type: String, default: '' },
    city:    { type: String, default: '' },
    coords: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  endDate: {
    type: Date
  },
  image: {
    type: String,
    default: ''
  },
  organizer: {
    type: String,
    default: ''
  },
  price: {
    type: String,
    default: 'Free'
  },
  tags: [{ type: String }],
  savedBy: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],
  xpReward: {
    type: Number,
    default: 50,
    min: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
