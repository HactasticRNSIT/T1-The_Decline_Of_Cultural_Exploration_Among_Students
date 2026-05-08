const mongoose = require('mongoose');

// ─── Quest ────────────────────────────────────────────────────────────────────
const questSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['daily', 'weekly', 'special'], default: 'daily' },
  xpReward: { type: Number, default: 100 },
  badge: { type: String },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  category: { type: String },
  tasks: [{ title: String, completed: Boolean }],
  icon: { type: String },
  expiresAt: { type: Date },
  completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// ─── Achievement ──────────────────────────────────────────────────────────────
const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  icon: { type: String },
  xpRequired: { type: Number, default: 0 },
  badge: { type: String },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
  unlockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// ─── Event ────────────────────────────────────────────────────────────────────
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['festival', 'workshop', 'exhibition', 'performance', 'walk', 'other'] },
  location: {
    name: String,
    address: String,
    city: String,
    coords: { lat: Number, lng: Number }
  },
  date: { type: Date, required: true },
  endDate: { type: Date },
  image: { type: String },
  organizer: { type: String },
  price: { type: String, default: 'Free' },
  tags: [String],
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  xpReward: { type: Number, default: 50 }
}, { timestamps: true });

// ─── CulturalPlace ────────────────────────────────────────────────────────────
const culturalPlaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['heritage', 'museum', 'food', 'festival', 'hidden_gem', 'temple', 'art'] },
  location: {
    address: String,
    city: String,
    state: String,
    coords: { lat: Number, lng: Number }
  },
  rating: { type: Number, default: 4.0, min: 0, max: 5 },
  images: [String],
  openingHours: String,
  entryFee: String,
  culturalSignificance: String,
  tags: [String],
  visitCount: { type: Number, default: 0 },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// ─── Leaderboard ─────────────────────────────────────────────────────────────
const leaderboardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  xp: { type: Number, default: 0 },
  questsCompleted: { type: Number, default: 0 },
  placesVisited: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  rank: { type: Number },
  period: { type: String, enum: ['weekly', 'monthly', 'all-time'], default: 'all-time' }
}, { timestamps: true });

// ─── Recommendation ───────────────────────────────────────────────────────────
const recommendationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  place: { type: mongoose.Schema.Types.ObjectId, ref: 'CulturalPlace' },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  reason: { type: String },
  score: { type: Number, default: 0.8 },
  type: { type: String, enum: ['place', 'event', 'quest', 'story'] }
}, { timestamps: true });

// ─── Story ────────────────────────────────────────────────────────────────────
const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String },
  place: { type: mongoose.Schema.Types.ObjectId, ref: 'CulturalPlace' },
  author: { type: String, default: 'EchoRoots AI' },
  audioUrl: { type: String },
  images: [String],
  tags: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  duration: { type: Number, default: 3 }
}, { timestamps: true });

module.exports = {
  Quest: mongoose.model('Quest', questSchema),
  Achievement: mongoose.model('Achievement', achievementSchema),
  Event: mongoose.model('Event', eventSchema),
  CulturalPlace: mongoose.model('CulturalPlace', culturalPlaceSchema),
  Leaderboard: mongoose.model('Leaderboard', leaderboardSchema),
  Recommendation: mongoose.model('Recommendation', recommendationSchema),
  Story: mongoose.model('Story', storySchema)
};
