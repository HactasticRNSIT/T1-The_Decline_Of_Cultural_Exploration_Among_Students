const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: false },
  place: { type: mongoose.Schema.Types.ObjectId, ref: 'CulturalPlace', required: false },
  story: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: false },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, trim: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  image: { type: String, default: '' } // Base64 or URL
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
