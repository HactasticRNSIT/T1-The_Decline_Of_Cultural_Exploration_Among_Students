const mongoose = require('mongoose');

const culturalPlaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Place name is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['heritage', 'museum', 'food', 'festival', 'hidden_gem', 'temple', 'art'],
    default: 'heritage'
  },
  location: {
    address: { type: String, default: '' },
    city:    { type: String, default: '' },
    state:   { type: String, default: '' },
    coords: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  rating: {
    type: Number,
    default: 4.0,
    min: 0,
    max: 5
  },
  images: [{ type: String }],
  openingHours: {
    type: String,
    default: ''
  },
  entryFee: {
    type: String,
    default: 'Free'
  },
  culturalSignificance: {
    type: String,
    default: ''
  },
  tags: [{ type: String }],
  visitCount: {
    type: Number,
    default: 0
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('CulturalPlace', culturalPlaceSchema);
