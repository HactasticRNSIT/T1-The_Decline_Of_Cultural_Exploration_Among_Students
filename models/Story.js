const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Story title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Story content is required']
  },
  summary: {
    type: String,
    default: ''
  },
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CulturalPlace',
    default: null
  },
  author: {
    type: String,
    default: 'EchoRoots AI'
  },
  authorUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  audioUrl: {
    type: String,
    default: ''
  },
  images: [{ type: String }],
  tags:   [{ type: String }],
  likes: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],
  readBy: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],
  shareCount: { type: Number, default: 0 },
  duration: {
    type: Number,
    default: 3,
    comment: 'Estimated reading time in minutes'
  }
}, { timestamps: true });

module.exports = mongoose.model('Story', storySchema);
