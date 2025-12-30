const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// 1. Middleware
app.use(express.static('public'));
app.use(express.json());

// 2. Connect to MongoDB (Matches your Render Key 'MONGO_URI')
const mongoUri = process.env.MONGO_URI; 

if (!mongoUri) {
    console.log("⚠️ No Database Key found! Check Render Environment Variables.");
} else {
    mongoose.connect(mongoUri)
        .then(() => console.log("✅ MongoDB Connected: Brain is Active!"))
        .catch(err => console.error("❌ MongoDB Error:", err));
}

// 3. Define the User Model
const UserSchema = new mongoose.Schema({
    email: String,
    domain: String,
    plan: String,
    date: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// 4. API: Search Domain
app.post('/api/search-domain', async (req, res) => {
    const { domain } = req.body;
    const isTaken = domain.toLowerCase().includes('google') || 
                    domain.toLowerCase().includes('facebook');
    const price = Math.floor(Math.random() * 500) + 199;

    if (isTaken) {
        res.json({ available: false, domain: domain });
    } else {
        res.json({ available: true, domain: domain, price: price });
    }
});

// 5. API: Signup (Save to Database)
app.post('/api/signup', async (req, res) => {
    try {
        console.log("Received signup data:", req.body);
        const { email, domain, plan } = req.body;
        
        const newUser = new User({
            email: email,
            domain: domain,
            plan: plan
        });

        await newUser.save();
        console.log("🎉 New User Saved:", email);
        res.json({ success: true, message: "Account created successfully!" });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 6. Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
