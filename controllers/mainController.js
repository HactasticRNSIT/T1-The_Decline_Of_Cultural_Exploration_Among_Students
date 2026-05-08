const { Quest, Event, CulturalPlace, Leaderboard, Story } = require('../models/index');
const User = require('../models/User');
const Comment = require('../models/Comment');

// ─── Places ───────────────────────────────────────────────────────────────────
const getPlaces = async (req, res) => {
  try {
    const { category, city, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    const places = await CulturalPlace.find(filter).limit(Number(limit));
    res.json({ success: true, data: places, count: places.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPlaceById = async (req, res) => {
  try {
    const place = await CulturalPlace.findById(req.params.id);
    if (!place) return res.status(404).json({ success: false, message: 'Place not found' });
    res.json({ success: true, data: place });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const seedPlaces = async (req, res) => {
  try {
    const samplePlaces = [
      {
        name: 'Hampi Ruins', description: 'UNESCO World Heritage Site with ancient Vijayanagara Empire ruins.',
        category: 'heritage', location: { city: 'Hampi', state: 'Karnataka', coords: { lat: 15.3350, lng: 76.4600 } },
        rating: 4.8, tags: ['UNESCO', 'ancient', 'temples'], culturalSignificance: 'Capital of the Vijayanagara Empire'
      },
      {
        name: 'National Museum Delhi', description: 'Premier museum housing artifacts spanning 5000 years of Indian civilization.',
        category: 'museum', location: { city: 'New Delhi', state: 'Delhi', coords: { lat: 28.6124, lng: 77.2194 } },
        rating: 4.5, tags: ['history', 'artifacts', 'culture']
      },
      {
        name: 'Purani Dilli Ka Khana', description: 'Old Delhi food trail through Chandni Chowk\'s legendary culinary heritage.',
        category: 'food', location: { city: 'Delhi', state: 'Delhi', coords: { lat: 28.6562, lng: 77.2291 } },
        rating: 4.7, tags: ['food', 'street food', 'Mughal']
      },
      {
        name: 'Durga Puja Pandal Trail', description: 'Kolkata\'s iconic Durga Puja celebration spanning the entire city.',
        category: 'festival', location: { city: 'Kolkata', state: 'West Bengal', coords: { lat: 22.5726, lng: 88.3639 } },
        rating: 4.9, tags: ['festival', 'art', 'celebration']
      },
      {
        name: 'Mysore Palace Light Show', description: 'The magnificent Mysore Palace illuminated by 97,000 bulbs every Sunday evening.',
        category: 'heritage', location: { city: 'Mysore', state: 'Karnataka', coords: { lat: 12.3052, lng: 76.6552 } },
        rating: 4.9, tags: ['palace', 'royalty', 'lights']
      },
      {
        name: 'Chettinad Village Walk', description: 'Heritage walk through the grand mansions and unique cuisine of the Chettinad region.',
        category: 'hidden_gem', location: { city: 'Karaikudi', state: 'Tamil Nadu', coords: { lat: 10.0767, lng: 78.7732 } },
        rating: 4.6, tags: ['architecture', 'cuisine', 'heritage']
      },
      {
        name: 'Warli Art Village', description: 'Experience tribal Warli painting traditions in the villages of Palghar.',
        category: 'art', location: { city: 'Palghar', state: 'Maharashtra', coords: { lat: 19.6967, lng: 72.7652 } },
        rating: 4.4, tags: ['tribal', 'art', 'folk']
      },
      {
        name: 'Golden Temple Langar', description: 'Participate in the world\'s largest free community kitchen at the Harmandir Sahib.',
        category: 'temple', location: { city: 'Amritsar', state: 'Punjab', coords: { lat: 31.6200, lng: 74.8765 } },
        rating: 5.0, tags: ['spiritual', 'community', 'Sikh']
      }
    ];
    await CulturalPlace.deleteMany({});
    const created = await CulturalPlace.insertMany(samplePlaces);
    res.json({ success: true, message: `${created.length} places seeded`, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Quests ───────────────────────────────────────────────────────────────────
const getQuests = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = {};
    if (type) filter.type = type;
    const quests = await Quest.find(filter);
    res.json({ success: true, data: quests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const completeQuest = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    if (!quest) return res.status(404).json({ success: false, message: 'Quest not found' });

    const user = await User.findById(req.user._id);
    if (user.completedQuests.includes(quest._id)) {
      return res.status(400).json({ success: false, message: 'Quest already completed' });
    }

    user.completedQuests.push(quest._id);
    user.xp += quest.xpReward;
    user.calculateLevel();
    await user.save();

    quest.completedBy.push(user._id);
    await quest.save();

    res.json({ success: true, message: `Quest completed! +${quest.xpReward} XP`, data: { xp: user.xp, level: user.level } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const seedQuests = async (req, res) => {
  try {
    const sampleQuests = [
      { title: 'Heritage Hunter', description: 'Visit any heritage site and learn its history.', type: 'daily', xpReward: 150, difficulty: 'easy', category: 'heritage', icon: 'landmark', tasks: [{ title: 'Visit a heritage site', completed: false }, { title: 'Read the cultural significance', completed: false }] },
      { title: 'Food Trail Wanderer', description: 'Try 3 traditional dishes from a different region of India.', type: 'daily', xpReward: 120, difficulty: 'easy', category: 'food', icon: 'utensils' },
      { title: 'Story Collector', description: 'Read 5 cultural stories on EchoRoots this week.', type: 'weekly', xpReward: 400, difficulty: 'medium', category: 'stories', icon: 'book-open' },
      { title: 'Festival Explorer', description: 'Attend or document a local festival in your city.', type: 'weekly', xpReward: 500, difficulty: 'hard', category: 'festivals', icon: 'calendar' },
      { title: 'Map Cartographer', description: 'Discover and mark 10 cultural places on the map.', type: 'special', xpReward: 1000, difficulty: 'hard', category: 'exploration', icon: 'map', badge: 'Cartographer' },
      { title: 'AI Conversationalist', description: 'Have 3 deep conversations with the AI Cultural Guide.', type: 'daily', xpReward: 100, difficulty: 'easy', category: 'ai', icon: 'message-circle' },
    ];
    await Quest.deleteMany({});
    const created = await Quest.insertMany(sampleQuests);
    res.json({ success: true, message: `${created.length} quests seeded`, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Events ───────────────────────────────────────────────────────────────────
const getEvents = async (req, res) => {
  try {
    const { category, city } = req.query;
    const filter = { status: 'approved' };
    if (category) filter.category = category;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    const events = await Event.find(filter).sort({ date: 1 }).populate('organizers', 'name avatar').populate('likes', '_id').populate('dislikes', '_id');
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const saveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    const user = await User.findById(req.user._id);
    if (user.savedEvents.includes(event._id)) {
      user.savedEvents = user.savedEvents.filter(e => e.toString() !== event._id.toString());
      event.savedBy = event.savedBy.filter(u => u.toString() !== user._id.toString());
    } else {
      user.savedEvents.push(event._id);
      event.savedBy.push(user._id);
    }
    await user.save();
    await event.save();
    res.json({ success: true, message: 'Event bookmark toggled', data: { saved: user.savedEvents.includes(event._id) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const seedEvents = async (req, res) => {
  try {
    const sampleEvents = [
      { title: 'Diwali Light & Arts Festival', description: 'Celebrate the festival of lights with art installations, cultural performances, and traditional sweets across the city.', category: 'festival', location: { name: 'Connaught Place', city: 'New Delhi', coords: { lat: 28.6329, lng: 77.2195 } }, date: new Date('2025-11-01'), price: 'Free', tags: ['diwali', 'lights', 'art'], xpReward: 200 },
      { title: 'Kuchipudi Classical Dance Workshop', description: 'Learn the foundations of Kuchipudi, the classical dance form from Andhra Pradesh, with master practitioners.', category: 'workshop', location: { name: 'India Habitat Centre', city: 'New Delhi', coords: { lat: 28.5925, lng: 77.2413 } }, date: new Date('2025-09-15'), price: '₹500', tags: ['dance', 'classical', 'workshop'], xpReward: 150 },
      { title: 'Folk Art & Handicraft Exhibition', description: 'A curated exhibition showcasing tribal and folk art from 15 Indian states.', category: 'exhibition', location: { name: 'National Crafts Museum', city: 'New Delhi', coords: { lat: 28.6177, lng: 77.2428 } }, date: new Date('2025-10-05'), price: '₹200', tags: ['folk art', 'handicraft', 'tribal'], xpReward: 100 },
      { title: 'Old Bengaluru Heritage Walk', description: 'Explore the hidden lanes and colonial architecture of Bengaluru with expert heritage guides.', category: 'walk', location: { name: 'Shivajinagar', city: 'Bengaluru', coords: { lat: 12.9840, lng: 77.6010 } }, date: new Date('2025-09-28'), price: '₹300', tags: ['heritage', 'walk', 'colonial'], xpReward: 180 },
      { title: 'Carnatic Music Utsav', description: 'An evening of classical Carnatic music performances by emerging and established artists.', category: 'performance', location: { name: 'Chowdaiah Memorial Hall', city: 'Bengaluru', coords: { lat: 13.0082, lng: 77.5724 } }, date: new Date('2025-09-20'), price: '₹250', tags: ['music', 'carnatic', 'classical'], xpReward: 120 },
      { title: 'Pongal Food & Culture Fest', description: 'A vibrant celebration of Tamil harvest culture with cooking competitions, kolam art, and folk music.', category: 'festival', location: { name: 'Marina Beach', city: 'Chennai', coords: { lat: 13.0500, lng: 80.2824 } }, date: new Date('2026-01-14'), price: 'Free', tags: ['pongal', 'Tamil', 'food'], xpReward: 250 },
      { title: 'Yakshagana Folk Dance Performance', description: 'Experience the traditional theater form of Karnataka combining dance, music, dialogue, and vibrant costumes.', category: 'performance', location: { name: 'Ravindra Kalakshetra', city: 'Bengaluru', coords: { lat: 12.9647, lng: 77.5848 } }, date: new Date('2025-10-12'), price: '₹150', tags: ['folk dance', 'yakshagana', 'traditional'], xpReward: 180 },
      { title: 'Kadalekai Parishe (Groundnut Fair)', description: 'The historic annual village fair (Jatre) of Bengaluru dedicated to the Bull Temple, celebrating the first harvest of groundnuts.', category: 'festival', location: { name: 'Basavanagudi', city: 'Bengaluru', coords: { lat: 12.9427, lng: 77.5682 } }, date: new Date('2025-11-25'), price: 'Free', tags: ['jatre', 'village fair', 'culture'], xpReward: 200 },
      { title: 'Temple Rathotsava (Chariot Festival)', description: 'Witness the grand traditional temple car festival where the deity is taken out in a massive wooden chariot pulled by devotees.', category: 'festival', location: { name: 'Sri Virupaksha Temple', city: 'Hampi', coords: { lat: 15.3350, lng: 76.4600 } }, date: new Date('2025-04-10'), price: 'Free', tags: ['temple', 'traditional', 'chariot'], xpReward: 250 },
    ].map(e => ({ ...e, status: 'approved' }));
    await Event.deleteMany({});
    const created = await Event.insertMany(sampleEvents);
    res.json({ success: true, message: `${created.length} events seeded`, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Stories ──────────────────────────────────────────────────────────────────
const getStories = async (req, res) => {
  try {
    const stories = await Story.find().populate('place', 'name location').sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, data: stories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const seedStories = async (req, res) => {
  try {
    const sampleStories = [
      { title: 'The Last Weavers of Varanasi', content: 'In the narrow alleys of Varanasi\'s weaving district, the hum of the handloom has been the city\'s heartbeat for over two millennia. The Ansari community, descendants of Persian silk weavers who came with the Mughal courts, still practice the art of Banarasi silk weaving...', summary: 'Meet the families keeping Banarasi silk weaving alive through generations.', author: 'EchoRoots AI', tags: ['craft', 'Varanasi', 'silk', 'Mughal'], duration: 5 },
      { title: 'Hampi: The City That Forgot to Crumble', content: 'Standing among the boulder-strewn landscapes of the Tungabhadra river basin, Hampi whispers of a lost empire. Once the second-largest city in the world, the Vijayanagara Empire\'s capital stretched across 650 square kilometers...', summary: 'The rise, glory, and mysterious fall of the Vijayanagara Empire.', author: 'EchoRoots AI', tags: ['Hampi', 'empire', 'ruins', 'UNESCO'], duration: 7 },
      { title: 'The Kitchen That Feeds 100,000 People Daily', content: 'Every single day, the Golden Temple in Amritsar prepares and serves free meals to 100,000 visitors regardless of faith, caste, or social status. The langar, or community kitchen, is one of humanity\'s most extraordinary acts of collective service...', summary: 'Inside the world\'s largest community kitchen — a 500-year-old tradition.', author: 'EchoRoots AI', tags: ['Golden Temple', 'Sikhism', 'langar', 'community'], duration: 4 },
      { title: 'Warli Dots: A Universe in a Painting', content: 'Long before Instagram stories, the Warli tribe of Maharashtra\'s Sahyadri mountains documented life through their distinctive white dot-and-line paintings on mud walls. Each painting tells a complete story — a wedding, a harvest, a hunt...', summary: 'How a tribal art form from Maharashtra carries centuries of stories.', author: 'EchoRoots AI', tags: ['Warli', 'tribal art', 'Maharashtra', 'folk'], duration: 4 },
    ];
    await Story.deleteMany({});
    const created = await Story.insertMany(sampleStories);
    res.json({ success: true, message: `${created.length} stories seeded`, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Leaderboard ──────────────────────────────────────────────────────────────
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find().select('name xp level streak badges').sort({ xp: -1 }).limit(20);
    const ranked = users.map((u, i) => ({ rank: i + 1, name: u.name, xp: u.xp, level: u.level, streak: u.streak }));
    res.json({ success: true, data: ranked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── AI Guide ─────────────────────────────────────────────────────────────────
const { GoogleGenAI } = require('@google/genai');

const getAIResponse = async (req, res) => {
  try {
    const { message, history } = req.body;
    
    // Add XP for using AI guide
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.xp += 10;
        user.calculateLevel();
        await user.save();
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({ 
        success: true, 
        data: { 
          text: "I am ready to help you explore Indian culture! However, to give you accurate and dynamic answers, please add your `GEMINI_API_KEY` to the `.env` file and restart the server.", 
          suggestions: ["Heritage near me", "Local festivals", "Food culture", "Folk arts"],
          timestamp: new Date() 
        } 
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `You are the EchoRoots AI Cultural Guide. You know India's 5,000+ year cultural history.
Answer the following user question briefly, engagingly, and accurately about Indian culture, heritage, food, or festivals. Keep the response under 100 words.
User: ${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    res.json({ 
      success: true, 
      data: { 
        text: response.text, 
        suggestions: ["Tell me more", "What are some hidden gems?", "What about the local food?"],
        timestamp: new Date() 
      } 
    });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Trivia ───────────────────────────────────────────────────────────────────
const generateTrivia = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ success: false, message: 'Gemini API Key missing' });
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Generate a single multiple-choice trivia question about Indian culture, history, or heritage.
Return ONLY a valid JSON object in this exact format:
{
  "question": "The question text",
  "options": ["A", "B", "C", "D"],
  "correctIndex": 1
}`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    let text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    const trivia = JSON.parse(text);
    res.json({ success: true, data: trivia });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Translate ────────────────────────────────────────────────────────────────
const translateText = async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ success: false, message: 'Gemini API Key missing' });
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Translate the following text to ${targetLang}. Return ONLY the translated text, nothing else.
Text: ${text}`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    res.json({ success: true, data: response.text.trim() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Photo Verification ───────────────────────────────────────────────────────
const verifyQuestPhoto = async (req, res) => {
  try {
    const { imageBase64 } = req.body; // should be base64 string
    const quest = await Quest.findById(req.params.id);
    if (!quest) return res.status(404).json({ success: false, message: 'Quest not found' });
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ success: false, message: 'Gemini API Key missing' });
    }
    
    const user = await User.findById(req.user._id);
    if (user.completedQuests.includes(quest._id)) {
      return res.status(400).json({ success: false, message: 'Quest already completed' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Strip the data:image/jpeg;base64, prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    
    const prompt = `Analyze this image. Does it match the requirements for the following quest?
Quest Title: ${quest.title}
Quest Description: ${quest.description}
Answer with only "YES" or "NO".`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg"
          }
        }
      ]
    });

    const isMatch = response.text.trim().toUpperCase().includes('YES');

    if (isMatch) {
      user.completedQuests.push(quest._id);
      user.xp += quest.xpReward;
      user.calculateLevel();
      await user.save();
      
      quest.completedBy.push(user._id);
      await quest.save();

      return res.json({ success: true, message: `Photo verified! +${quest.xpReward} XP`, data: { xp: user.xp, level: user.level } });
    } else {
      return res.json({ success: false, message: 'Photo verification failed. Try another photo!' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Event Management & Interaction ──────────────────────────────────────────
const createEvent = async (req, res) => {
  try {
    const { title, description, category, location, date, price, tags, xpReward, images, coOrganizers } = req.body;
    let organizers = [req.user._id];
    if (coOrganizers && Array.isArray(coOrganizers)) {
      organizers = [...organizers, ...coOrganizers];
    }
    const newEvent = new Event({
      title, description, category, location, date, price, tags, xpReward, images, organizers,
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    });
    await newEvent.save();
    res.json({ success: true, message: 'Event submitted for approval', data: newEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const likeEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.dislikes.includes(req.user._id)) {
      event.dislikes.pull(req.user._id);
    }
    if (event.likes.includes(req.user._id)) {
      event.likes.pull(req.user._id);
    } else {
      event.likes.push(req.user._id);
    }
    await event.save();
    res.json({ success: true, likes: event.likes.length, dislikes: event.dislikes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const dislikeEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.likes.includes(req.user._id)) {
      event.likes.pull(req.user._id);
    }
    if (event.dislikes.includes(req.user._id)) {
      event.dislikes.pull(req.user._id);
    } else {
      event.dislikes.push(req.user._id);
    }
    await event.save();
    res.json({ success: true, likes: event.likes.length, dislikes: event.dislikes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addEventComment = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (!event.commentsOpen) return res.status(403).json({ success: false, message: 'Comments are locked for this event' });
    
    const { text, image } = req.body;
    const comment = new Comment({ event: event._id, author: req.user._id, text, image });
    await comment.save();
    res.json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEventComments = async (req, res) => {
  try {
    const comments = await Comment.find({ event: req.params.id }).populate('author', 'name avatar').sort({ createdAt: -1 });
    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'pending' }).populate('organizers', 'name');
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    event.status = 'approved';
    await event.save();
    res.json({ success: true, message: 'Event approved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rejectEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    event.status = 'rejected';
    event.rejectionReason = req.body.reason || 'No reason provided';
    await event.save();
    res.json({ success: true, message: 'Event rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalEvents, pendingEvents, approvedEvents, rejectedEvents, totalComments] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Event.countDocuments({ status: 'pending' }),
      Event.countDocuments({ status: 'approved' }),
      Event.countDocuments({ status: 'rejected' }),
      Comment.countDocuments()
    ]);
    res.json({ success: true, data: { totalUsers, totalEvents, pendingEvents, approvedEvents, rejectedEvents, totalComments } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPlaces, getPlaceById, seedPlaces,
  getQuests, completeQuest, seedQuests,
  getEvents, saveEvent, seedEvents,
  getStories, seedStories,
  getLeaderboard,
  getAIResponse,
  generateTrivia, translateText, verifyQuestPhoto,
  createEvent, likeEvent, dislikeEvent, addEventComment, getEventComments, getPendingEvents, approveEvent, rejectEvent,
  getAdminStats
};
