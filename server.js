// --- WAYBE.IN REAL-TIME SERVER ---
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// 1. EMAIL CONFIGURATION (Real Gmail Sender)
// ⚠️ REPLACE THESE WITH YOUR REAL DETAILS
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rupakpal602@gmail.com', // Put your GMAIL address here
        pass: 'lmopxjygkyhqrsfm'    // Put your 16-digit App Password here
    }
});

// Temporary OTP Storage (In memory)
const otpStore = {}; 

// 2. DATABASE CONNECTION
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://admin:admin123@cluster0.mongodb.net/waybe?retryWrites=true&w=majority";
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Real Database Connected'))
    .catch(err => console.log('⚠️ Database Config Needed'));

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true },
    plan: String,
    date: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// --- API ROUTES ---

// A. SEND REAL EMAIL OTP
app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit code
    otpStore[email] = otp; // Save code

    const mailOptions = {
        from: 'Waybe Security <no-reply@waybe.in>',
        to: email,
        subject: 'Your Login Verification Code',
        text: `Your Waybe Secure Login Code is: ${otp}. Do not share this code.`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${email}`);
        res.json({ status: 'success', message: 'OTP Sent' });
    } catch (error) {
        console.error("Email Error:", error);
        res.status(500).json({ status: 'error', message: 'Failed to send email' });
    }
});

// B. VERIFY OTP
app.post('/api/verify-otp', async (req, res) => {
    const { email, code } = req.body;
    
    if (otpStore[email] === code) {
        delete otpStore[email]; // Clear used code
        res.json({ status: 'success', message: 'Verified' });
    } else {
        res.status(400).json({ status: 'error', message: 'Invalid Code' });
    }
});

// Serve Frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server Live on Port ${PORT}`));

