const axios = require('axios');

exports.handler = async (event) => {
    // 1. These headers are the "key" to the CORS door
    const headers = {
        "Access-Control-Allow-Origin": "*", // Allows GitHub to talk to Netlify
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    };

    // 2. Handle the browser's "pre-check" (OPTIONS)
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "OK" };
    }

    const code = event.queryStringParameters.code;
    const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
    const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
    const REDIRECT_URI = 'https://deathhunter1249.github.io/dprt/'; 

    try {
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
        });

        return {
            statusCode: 200,
            headers, // YOU MUST SEND HEADERS HERE
            body: JSON.stringify({ user: userResponse.data })
        };
    } catch (err) {
        return { 
            statusCode: 500, 
            headers, // AND HERE
            body: JSON.stringify({ error: err.message }) 
        };
    }
};
