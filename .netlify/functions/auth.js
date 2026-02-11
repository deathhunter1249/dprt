const axios = require('axios');

exports.handler = async (event) => {
    // 1. Setup CORS headers so GitHub can talk to Netlify
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    };

    // 2. Handle the "Handshake" (Preflight)
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "OK" };
    }

    const code = event.queryStringParameters.code;
    if (!code) {
        return { 
            statusCode: 400, 
            headers, 
            body: JSON.stringify({ error: "No code provided" }) 
        };
    }

    const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
    const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
    const REDIRECT_URI = 'https://deathhunter1249.github.io/dprt/'; 

    try {
        // 3. Exchange code for Token
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        // 4. Get User Profile
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
        });

        // 5. Return User Data to the Website
        return {
            statusCode: 200,
            headers, // Crucial: Send headers back here too!
            body: JSON.stringify({ user: userResponse.data })
        };
    } catch (err) {
        console.error("Auth Error:", err.response ? err.response.data : err.message);
        return { 
            statusCode: 500, 
            headers, 
            body: JSON.stringify({ error: "Authentication failed", details: err.message }) 
        };
    }
};
