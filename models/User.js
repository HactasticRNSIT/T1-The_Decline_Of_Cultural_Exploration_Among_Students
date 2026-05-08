const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  badges: [{ type: String }],
  completedQuests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quest' }],
  savedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  visitedPlaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CulturalPlace' }],
  interests: [{ type: String }],
  location: {
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    coords: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  isVerified: { type: Boolean, default: false },
  socialLinks: {
    instagram: { type: String, default: '' },
    twitter:   { type: String, default: '' },
    website:   { type: String, default: '' }
  },
  role: { type: String, enum: ['student', 'admin', 'expert'], default: 'student' },
  savedPlaces: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CulturalPlace' }],
  savedStories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    notifications: { type: Boolean, default: true },
    language: { type: String, default: 'en' }
  }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.calculateLevel = function () {
  this.level = Math.floor(this.xp / 500) + 1;
};

module.exports = mongoose.model('User', userSchema);
