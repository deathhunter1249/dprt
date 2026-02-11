require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// IMPORTANT: Set these in a .env file or your hosting provider settings
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1323365609777528962';
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET; // GET THIS FROM DISCORD DEV PORTAL
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://deathhunter1249.github.io/dprt/';

app.get('/discord/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).json({ success: false });

    try {
        // Exchange code for Access Token
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
        }).toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        // Get User Data using the token
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
        });

        res.json({ success: true, user: userResponse.data });

    } catch (error) {
        console.error("Auth Error:", error.response?.data || error.message);
        res.status(500).json({ success: false });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`DPRT Server running on port ${PORT}`));
