const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Database Connection
const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;
if (!mongoUri) console.log("⚠️ No Database Key found!");
else mongoose.connect(mongoUri).then(() => console.log("✅ MongoDB Connected"));

// UPGRADED User Model (Now tracks Status and Revenue)
const UserSchema = new mongoose.Schema({
    email: String,
    domain: String,
    plan: String,
    status: { type: String, default: 'Active' }, // New: Active/Suspended
    revenue: { type: Number, default: 0 },       // New: Money value
    date: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// --- APIs ---

app.post('/api/search-domain', async (req, res) => {
    const { domain } = req.body;
    const isTaken = domain.toLowerCase().includes('google');
    res.json({ available: !isTaken, domain, price: Math.floor(Math.random() * 500) + 199 });
});

// SIGNUP (Auto-calculates Revenue)
app.post('/api/signup', async (req, res) => {
    try {
        const { email, domain, plan } = req.body;
        
        // Assign fake revenue based on plan for the admin panel demo
        let rev = 0;
        if(plan === 'Starter') rev = 499;
        if(plan === 'Pro') rev = 999;
        
        await new User({ email, domain, plan, revenue: rev }).save();
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false }); }
});

// READ (Get all users)
app.get('/api/users', async (req, res) => {
    const users = await User.find().sort({ date: -1 });
    res.json(users);
});

// DELETE USER
app.delete('/api/users/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// UPDATE STATUS (Suspend/Activate)
app.put('/api/users/:id', async (req, res) => {
    const { status } = req.body;
    await User.findByIdAndUpdate(req.params.id, { status: status });
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
