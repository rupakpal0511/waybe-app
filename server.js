/* * server.js - WAYBE.IN BACKEND (DNS "BULLETPROOF" VERSION) */
const express = require('express');
const path = require('path');
const dns = require('dns'); // Built-in Node tool
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));

// API: DNS Lookup
app.post('/api/search-domain', (req, res) => {
    const { domain } = req.body;
    console.log(`🔍 Checking DNS for: ${domain}...`);

    // 1. Basic cleanup (remove "http://", "www.")
    let cleanDomain = domain.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];

    // 2. Perform DNS Lookup
    dns.resolve(cleanDomain, (err) => {
        let isTaken = false;

        if (!err) {
            // No error means we found an IP address -> Domain is TAKEN
            isTaken = true; 
            console.log(`   👉 Found IP. Domain is TAKEN.`);
        } else if (err.code === 'ENOTFOUND') {
            // ENOTFOUND means no IP exists -> Domain is likely AVAILABLE
            isTaken = false; 
            console.log(`   👉 No IP found. Domain is AVAILABLE.`);
        } else {
            // Some other error (network issue) -> Assume Taken to be safe
            isTaken = true;
            console.log(`   👉 Error checking. Assuming TAKEN.`);
        }

        res.json({
            domain: cleanDomain,
            available: !isTaken, // If taken is true, available is false
            price: 499,
            currency: 'INR',
            period: 'month',
            message: !isTaken ? 'Domain is available!' : 'Domain is taken.'
        });
    });
});

app.listen(PORT, () => {
    console.log(`✅ Waybe DNS Server running on http://localhost:${PORT}`);
});