const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const events = [
  {
    title: "Bengaluru Heritage Walk: Cubbon Park",
    description: "Explore the colonial history and botanical treasures of Bengaluru's green heart. A 3-hour guided walk through history.",
    category: "walk",
    date: new Date("2025-10-15"),
    location: {
      name: "Cubbon Park",
      city: "Bengaluru",
      coords: { lat: 12.9763, lng: 77.5929 }
    },
    price: "₹300",
    xpReward: 150,
    tags: ["heritage", "nature", "history"],
    status: "approved"
  },
  {
    title: "Hyderabadi Food Trail: Charminar",
    description: "Taste the authentic flavors of Old City Hyderabad. From Irani Chai to the world-famous Biryani.",
    category: "festival",
    date: new Date("2025-11-02"),
    location: {
      name: "Charminar",
      city: "Hyderabad",
      coords: { lat: 17.3616, lng: 78.4747 }
    },
    price: "₹500",
    xpReward: 200,
    tags: ["food", "culture", "streetfood"],
    status: "approved"
  },
  {
    title: "Dilli Haat Craft Mela",
    description: "A celebration of Indian handicrafts and handlooms from across the country. Meet the artisans.",
    category: "exhibition",
    date: new Date("2025-09-28"),
    location: {
      name: "Dilli Haat INA",
      city: "Delhi",
      coords: { lat: 28.5733, lng: 77.2093 }
    },
    price: "₹50",
    xpReward: 100,
    tags: ["art", "crafts", "shopping"],
    status: "approved"
  },
  {
    title: "Kala Ghoda Art Festival",
    description: "Mumbai's premier multicultural festival featuring art, music, and dance in the historic precinct.",
    category: "festival",
    date: new Date("2026-02-05"),
    location: {
      name: "Kala Ghoda",
      city: "Mumbai",
      coords: { lat: 18.9288, lng: 72.8329 }
    },
    price: "Free",
    xpReward: 250,
    tags: ["art", "festival", "mumbai"],
    status: "approved"
  },
  {
    title: "Kathak Performance: Siri Fort",
    description: "An evening of classical dance by renowned artists at the prestigious Siri Fort Auditorium.",
    category: "performance",
    date: new Date("2025-12-10"),
    location: {
      name: "Siri Fort Auditorium",
      city: "Delhi",
      coords: { lat: 28.5524, lng: 77.2185 }
    },
    price: "₹800",
    xpReward: 180,
    tags: ["dance", "classical", "culture"],
    status: "approved"
  },
  {
    title: "Pottery Workshop: Indiranagar",
    description: "Learn the ancient art of pottery from traditional craftsmen in a modern setting.",
    category: "workshop",
    date: new Date("2025-10-20"),
    location: {
      name: "Clay Studio",
      city: "Bengaluru",
      coords: { lat: 12.9784, lng: 77.6408 }
    },
    price: "₹1200",
    xpReward: 200,
    tags: ["craft", "workshop", "creative"],
    status: "approved"
  },
  {
    title: "Qutb Shahi Tombs Night Tour",
    description: "Experience the grandeur of the Deccan sultanate under the stars with expert storytelling.",
    category: "walk",
    date: new Date("2025-11-15"),
    location: {
      name: "Qutb Shahi Tombs",
      city: "Hyderabad",
      coords: { lat: 17.3968, lng: 78.3976 }
    },
    price: "₹450",
    xpReward: 160,
    tags: ["history", "architecture", "nightview"],
    status: "approved"
  },
  {
    title: "Elephanta Caves Ferry Trip",
    description: "A cultural voyage to the UNESCO World Heritage Site featuring stunning rock-cut architecture.",
    category: "walk",
    date: new Date("2025-10-05"),
    location: {
      name: "Gateway of India",
      city: "Mumbai",
      coords: { lat: 18.9220, lng: 72.8347 }
    },
    price: "₹600",
    xpReward: 220,
    tags: ["heritage", "travel", "mumbai"],
    status: "approved"
  },
  {
    title: "Sufi Night: Nizamuddin Dargah",
    description: "Experience the spiritual Qawwali sessions that have echoed for centuries in the heart of Delhi.",
    category: "performance",
    date: new Date("2025-09-30"),
    location: {
      name: "Nizamuddin West",
      city: "Delhi",
      coords: { lat: 28.5888, lng: 77.2435 }
    },
    price: "Free",
    xpReward: 140,
    tags: ["music", "spiritual", "sufi"],
    status: "approved"
  },
  {
    title: "Lalbagh Flower Show",
    description: "The historic botanical garden comes alive with millions of flowers in themed displays.",
    category: "exhibition",
    date: new Date("2026-01-26"),
    location: {
      name: "Lalbagh Botanical Garden",
      city: "Bengaluru",
      coords: { lat: 12.9507, lng: 77.5848 }
    },
    price: "₹80",
    xpReward: 120,
    tags: ["nature", "festival", "bengaluru"],
    status: "approved"
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/echoroots');
    console.log('Connected to DB');

    // Get an admin user to be the organizer
    const admin = await User.findOne({ role: 'admin' });
    const organizerId = admin ? admin._id : null;

    if (organizerId) {
      events.forEach(e => {
        e.organizers = [organizerId];
        e.createdBy = organizerId;
      });
    }

    await Event.deleteMany({ status: 'approved' }); // Clear old approved events to avoid duplicates
    await Event.insertMany(events);

    console.log('Successfully seeded 10 events!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seed();
