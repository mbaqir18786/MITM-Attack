const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/real-login', (req, res) => {
    const { username, password } = req.body;

    console.log(`[REAL SERVER] Received login for user: ${username}`);

    res.json({
        status: "success",
        message: "Login received by real server",
        user: username
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏢 Real Server (Target) running on http://10.0.9.144:${PORT}`);
});
