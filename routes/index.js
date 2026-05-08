const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const {
  getPlaces, getPlaceById, seedPlaces, addPlaceFeedback, getPlaceFeedback, savePlace, saveStory,
  getQuests, completeQuest, seedQuests,
  getEvents, saveEvent, seedEvents,
    getStories, seedStories, createStory,
    getLeaderboard,
    getAIResponse,
    getHomeDashboard,
    generateTrivia, translateText, verifyQuestPhoto,
  createEvent, likeEvent, dislikeEvent, addEventComment, getEventComments, getPendingEvents, approveEvent, rejectEvent,
  getAdminStats, getFilteredAdminData, deleteEntityWithRemark,
  getUserProfile, getOtherUserProfile, updateUserProfile, toggleFollow, updateStreak, getUserTimeline
} = require('../controllers/mainController');

const { protect, optionalProtect } = require('../middleware/auth');

// ✅ Auth
router.use('/auth', authRoutes);

// ✅ Places
router.get('/places', optionalProtect, getPlaces);
router.get('/places/:id', optionalProtect, getPlaceById);
router.post('/places/:id/feedback', protect, addPlaceFeedback);
router.get('/places/:id/feedback', optionalProtect, getPlaceFeedback);
router.post('/places/:id/save', protect, savePlace);
router.post('/places/seed', seedPlaces);

// ✅ Quests
router.get('/quests', optionalProtect, getQuests);
router.post('/quests/:id/complete', protect, completeQuest);
router.post('/quests/:id/verify-photo', protect, verifyQuestPhoto);
router.post('/quests/seed', seedQuests);

// ✅ Events
router.get('/events', optionalProtect, getEvents);
router.post('/events', protect, createEvent);
router.post('/events/:id/save', protect, saveEvent);
router.post('/events/:id/like', protect, likeEvent);
router.post('/events/:id/dislike', protect, dislikeEvent);
router.get('/events/:id/comments', optionalProtect, getEventComments);
router.post('/events/:id/comments', protect, addEventComment);
router.post('/events/seed', seedEvents);

// ✅ Stories
router.get('/stories', optionalProtect, getStories);
router.post('/stories', protect, createStory);
router.post('/stories/:id/save', protect, saveStory);
router.post('/stories/seed', seedStories);

// ✅ Home Dashboard (Logged In)
router.get('/home/dashboard', protect, getHomeDashboard);

// ✅ User Profile & Social
router.get('/user/profile', protect, getUserProfile);
router.get('/user/profile/:id', optionalProtect, getOtherUserProfile);
router.put('/user/profile', protect, updateUserProfile);
router.post('/user/follow/:id', protect, toggleFollow);
router.post('/user/streak', protect, updateStreak);
router.get('/user/timeline', optionalProtect, getUserTimeline);

// ✅ Admin
router.get('/admin/stats', protect, getAdminStats);
router.get('/admin/events/pending', protect, getPendingEvents);
router.post('/admin/events/:id/approve', protect, approveEvent);
router.post('/admin/events/:id/reject', protect, rejectEvent);
router.get('/admin/data', protect, getFilteredAdminData);
router.post('/admin/delete', protect, deleteEntityWithRemark);

// ✅ Leaderboard
router.get('/leaderboard', optionalProtect, getLeaderboard);

// ✅ AI & Features
router.post('/ai/chat', optionalProtect, getAIResponse);
router.post('/ai/trivia', protect, generateTrivia);
router.post('/ai/translate', optionalProtect, translateText);

module.exports = router;