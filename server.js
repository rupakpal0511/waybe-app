// --- WAYBE.IN PROFESSIONAL SERVER (UPDATED FOR NEW PLANS) ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Razorpay = require('razorpay');
const path = require('path');
require('dotenv').config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public')); // Serves your index.html

// 1. DATABASE CONNECTION (Real Memory)
// This connects to MongoDB. If you haven't set the MONGO_URI in Render yet, 
// it will just log a warning but keep the site running.
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://admin:admin123@cluster0.mongodb.net/waybe?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to Real Database'))
    .catch(err => console.log('⚠️ Database Config Needed (App running in fallback mode)'));

// Define User Schema (UPDATED FOR BADGES)
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true }, 
    plan: String,
    badge: String, // Stores "gold", "silver", "bronze"
    domain_interest: String,
    revenue_generated: Number, // Stores the exact amount paid (e.g., 4999)
    date: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// 2. PAYMENT CONFIGURATION
const razorpay = new Razorpay({
    key_id: "rzp_test_1DP5mmOlF5G5ag", 
    key_secret: process.env.RAZORPAY_SECRET || "YOUR_SECRET_HERE"
});

// --- API ROUTES ---

// A. Signup & Order Creation (Matches your new index.html)
app.post('/api/signup', async (req, res) => {
    try {
        // Receiving the specific data sent by your new index.html
        const { email, password, plan, badge, domain, revenue } = req.body;
        
        // Save to Real DB
        const newUser = new User({
            email, 
            password, 
            plan, 
            badge, 
            domain_interest: domain,
            revenue_generated: revenue
        });
        
        await newUser.save();
        console.log(`✅ New Customer: ${email} | Plan: ${plan} | Badge: ${badge}`);

        res.json({ status: 'success', message: 'Account created successfully' });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ status: 'error', message: 'Server error' });
    }
});

// Serve Frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Waybe Server Live on Port ${PORT}`));
