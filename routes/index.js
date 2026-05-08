const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const {
  getPlaces, getPlaceById, seedPlaces,
  getQuests, completeQuest, seedQuests,
  getEvents, saveEvent, seedEvents,
  getStories, seedStories,
  getLeaderboard,
  getAIResponse,
  generateTrivia, translateText, verifyQuestPhoto,
  createEvent, likeEvent, dislikeEvent, addEventComment, getEventComments, getPendingEvents, approveEvent, rejectEvent,
  getAdminStats
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
router.post('/quests/:id/verify-photo', protect, verifyQuestPhoto);
router.post('/quests/seed', seedQuests);

// ✅ Events
router.get('/events', getEvents);
router.post('/events', protect, createEvent);
router.post('/events/:id/save', protect, saveEvent);
router.post('/events/:id/like', protect, likeEvent);
router.post('/events/:id/dislike', protect, dislikeEvent);
router.get('/events/:id/comments', getEventComments);
router.post('/events/:id/comments', protect, addEventComment);
router.post('/events/seed', seedEvents);

// ✅ Admin
router.get('/admin/stats', protect, getAdminStats);
router.get('/admin/events/pending', protect, getPendingEvents);
router.post('/admin/events/:id/approve', protect, approveEvent);
router.post('/admin/events/:id/reject', protect, rejectEvent);

// ✅ Stories
router.get('/stories', getStories);
router.post('/stories/seed', seedStories);

// ✅ Leaderboard
router.get('/leaderboard', getLeaderboard);

// ✅ AI & Features
router.post('/ai/chat', protect, getAIResponse);
router.post('/ai/trivia', protect, generateTrivia);
router.post('/ai/translate', translateText);

module.exports = router;