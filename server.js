// ===== DISCORD OAUTH BACKEND SERVER =====
// Deploy this to Netlify, Vercel, or any Node.js hosting
// Make sure to set the environment variables in your hosting dashboard

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Allow requests from your GitHub Pages site
app.use(cors({
    origin: 'https://deathhunter1249.github.io'
}));

app.use(express.json());

// ===== CONFIGURATION FROM ENVIRONMENT VARIABLES =====
// These should be set in your Netlify/Vercel dashboard
// NEVER put these directly in the code if it's public!
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: 'DPRT Discord OAuth Server Running',
        configured: !!(DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET && REDIRECT_URI)
    });
});

// ===== EXCHANGE CODE FOR TOKEN =====
app.get('/discord/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ error: 'No code provided' });
    }

    // Check if environment variables are set
    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !REDIRECT_URI) {
        return res.status(500).json({ 
            error: 'Server not configured properly',
            message: 'Please set environment variables: DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, REDIRECT_URI'
        });
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

        // Get user info from Discord
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
                email: userData.email, // Only if you requested email scope
            },
            // Don't send the access_token back unless you need it for further API calls
            // access_token: access_token,
        });

    } catch (error) {
        console.error('Discord OAuth error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to authenticate with Discord',
            details: error.response?.data?.error_description || 'Unknown error'
        });
    }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ DPRT Discord OAuth server running on port ${PORT}`);
    console.log(`✅ Environment variables configured: ${!!(DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET && REDIRECT_URI)}`);
});
