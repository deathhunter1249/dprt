// ===== DISCORD OAUTH BACKEND SERVER =====
// This needs to run on a server (NOT GitHub Pages)
// You can use: Vercel, Netlify, Heroku, Railway, etc.

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ===== CONFIGURATION =====
const DISCORD_CLIENT_ID = '1323365609777528962';
const DISCORD_CLIENT_SECRET = 'uRiAE9S6GpeabZptLcdh-cDQh6xcG0sH'; // From Discord Developer Portal
const REDIRECT_URI = 'https://deathhunter1249.github.io/dprt/';

// ===== EXCHANGE CODE FOR TOKEN =====
app.get('/discord/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ error: 'No code provided' });
    }

    try {
        // Exchange code for access token
        const tokenResponse = await axios.post(
            'https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const { access_token } = tokenResponse.data;

        // Get user info
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const userData = userResponse.data;

        // Return user data to frontend
        res.json({
            success: true,
            user: {
                id: userData.id,
                username: userData.username,
                discriminator: userData.discriminator,
                avatar: userData.avatar,
            },
            access_token: access_token,
        });

    } catch (error) {
        console.error('Discord OAuth error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to authenticate with Discord',
            details: error.response?.data 
        });
    }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Discord OAuth server running on port ${PORT}`);
});
