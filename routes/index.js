const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const {
  getPlaces, getPlaceById, seedPlaces,
  getQuests, completeQuest, seedQuests,
  getEvents, saveEvent, seedEvents,
  getStories, seedStories,
  getLeaderboard,
  getAIResponse
} = require('../controllers/mainController');

const { protect } = require('../middleware/auth');

// ✅ Auth
router.use('/auth', authRoutes);

// ✅ Places
router.get('/places', getPlaces);
router.get('/places/:id', getPlaceById);
router.post('/places/seed', seedPlaces);

// ✅ Quests
router.get('/quests', getQuests);
router.post('/quests/:id/complete', protect, completeQuest);
router.post('/quests/seed', seedQuests);

// ✅ Events
router.get('/events', getEvents);
router.post('/events/:id/save', protect, saveEvent);
router.post('/events/seed', seedEvents);

// ✅ Stories
router.get('/stories', getStories);
router.post('/stories/seed', seedStories);

// ✅ Leaderboard
router.get('/leaderboard', getLeaderboard);

// ✅ AI Guide (protect is optional — works with or without token)
router.post('/ai/chat', getAIResponse);

module.exports = router;