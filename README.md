# T1 - The Decline Of Cultural Exploration Among Students
# EchoRoutes - We connect with Culture

# EchoRoots 🌏

**The Decline of Cultural Exploration Among Students** is a real problem. We spend more time on our screens than exploring the heritage that's literally right outside our door. 

EchoRoots was built to change that. It’s a gamified cultural exploration platform that turns your city into a playground for heritage discovery.

---

### Why we built this
Students often find "culture" and "history" boring because it's usually presented in a dry, academic way. We wanted to bridge the gap between digital habits (gaming, social media) and real-world exploration. 

### The Core Loop
1. **Discover**: Find hidden gems and local events on the interactive map.
2. **Explore**: Head to the location, complete a quest, or attend an event.
3. **Earn**: Get XP, badges, and level up your "Cultural Explorer" profile.
4. **Connect**: Share stories, chat with the AI Guide, and see what the community is up to.

---

### What's inside?
- **🗺️ Heritage Map**: An interactive map powered by Leaflet to find cultural landmarks and secret spots near you.
- **🤖 AI Guide**: A smart companion that answers your cultural questions and generates local trivia.
- **🏆 Quest System**: Daily and weekly challenges that reward you for visiting heritage sites.
- **📅 Event Management**: A place for the community to host and join cultural workshops, festivals, and walks.
- **📊 Leaderboards**: Compete with other students and climb the ranks of global explorers.

---

### Tech Stack
- **Frontend**: Clean HTML5, Vanilla CSS, and JavaScript.
- **Backend**: Node.js & Express.
- **Database**: MongoDB (Mongoose).
- **Maps**: Leaflet.js with OpenStreetMap.
- **AI**: Gemini API (for the guide and trivia).

---

### Getting it running locally

**1. Prerequisites**
You'll need Node.js and a MongoDB instance (local or Atlas).

**2. Setup**
```bash
git clone <this-repo-url>
cd EchoRoots
npm install
```

**3. Environment Variables**
Create a `.env` file in the root:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=something_strong
GEMINI_API_KEY=your_google_ai_key
```

**4. Run it**
```bash
npm run dev
```
Open `http://localhost:5000` and start exploring.

---

### The Mission
Our goal is to turn culture from a subject you study into an experience you live. If you want to contribute, feel free to open a PR or suggest a feature.

**EchoRoots — Reconnecting with our Roots.**
