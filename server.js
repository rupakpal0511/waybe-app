const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// 1. Middleware
app.use(express.static('public'));
app.use(express.json());

// 2. Database Connection
const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;
if (!mongoUri) {
    console.log("⚠️ No Database Key found!");
} else {
    mongoose.connect(mongoUri)
        .then(() => console.log("✅ MongoDB Connected: Brain is Active!"))
        .catch(err => console.error("❌ MongoDB Error:", err));
}

// 3. User Model
const UserSchema = new mongoose.Schema({
    email: String,
    domain: String,
    plan: String,
    date: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// --- APIs ---

// SEARCH DOMAIN
app.post('/api/search-domain', async (req, res) => {
    const { domain } = req.body;
    const isTaken = domain.toLowerCase().includes('google');
    const price = Math.floor(Math.random() * 500) + 199;
    res.json({ available: !isTaken, domain, price });
});

// SIGNUP (SAVE DATA)
app.post('/api/signup', async (req, res) => {
    try {
        const { email, domain, plan } = req.body;
        const newUser = new User({ email, domain, plan });
        await newUser.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// *** NEW: GET USERS (READ DATA) ***
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().sort({ date: -1 }); // Get all users, newest first
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch data" });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
