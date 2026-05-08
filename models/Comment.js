const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, trim: true },
  image: { type: String, default: '' } // Base64 or URL
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
