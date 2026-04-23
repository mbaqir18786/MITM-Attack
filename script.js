// client/script.js

let currentMode = 'insecure';
const isFileProtocol = window.location.protocol === 'file:';

// PRESERVING YOUR IP ADDRESS
const ATTACKER_URL = isFileProtocol
    ? null
    : `${window.location.protocol}//${window.location.hostname}:4000`;

const attackerUrlEl = document.getElementById('attacker-url');

// Animation Elements
const packetDot = document.getElementById('packet-dot');
const nodes = {
    client: document.getElementById('node-client'),
    attacker: document.getElementById('node-attacker'),
    server: document.getElementById('node-server')
};

function updateAttackerInfo() {
    if (!ATTACKER_URL) {
        attackerUrlEl.textContent = 'SYSTEM_ERROR: MUST RUN VIA UI_SERVER (PORT 5001)';
        attackerUrlEl.style.color = '#ff0055';
    } else {
        attackerUrlEl.textContent = `PROXY_LISTENING: ${ATTACKER_URL}`;
    }
}

updateAttackerInfo();

// 1. MODE SELECTION LOGIC
const modes = {
    insecure: document.getElementById('insecure-mode'),
    secure: document.getElementById('secure-mode'),
    hash: document.getElementById('hash-mode')
};
const modeDesc = document.getElementById('mode-desc');

Object.keys(modes).forEach(mode => {
    modes[mode].addEventListener('click', () => {
        currentMode = mode;
        // Update Buttons
        Object.values(modes).forEach(b => b.classList.remove('active'));
        modes[mode].classList.add('active');
        
        // Update Description
        let desc = '';
        if (mode === 'insecure') desc = 'Mode: <strong style="color: var(--attacker);">Insecure</strong>. Data is sent as raw strings.';
        if (mode === 'secure') desc = 'Mode: <strong style="color: var(--primary);">Secure (Sim)</strong>. Password is Base64 encoded.';
        if (mode === 'hash') desc = 'Mode: <strong style="color: var(--server);">Hashing</strong>. Password is transformed into a cryptographic hash.';
        modeDesc.innerHTML = desc;
        
        updatePacketView();
    });
});

// 2. REAL-TIME PACKET SIMULATION VIEW
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const packetContent = document.getElementById('packet-content');

async function getHashedPassword(pass) {
    if (!pass) return '...';
    
    // Check if browser supports SubtleCrypto (Secure Context check)
    if (window.crypto && crypto.subtle) {
        try {
            const msgUint8 = new TextEncoder().encode(pass);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32) + '...';
        } catch (e) {
            console.warn("SubtleCrypto failed, using fallback.");
        }
    }

    // FALLBACK: Simple Hash (For non-secure HTTP contexts)
    let hash = 0;
    for (let i = 0; i < pass.length; i++) {
        const char = pass.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const fakeHash = Math.abs(hash).toString(16).repeat(4);
    return '0x' + fakeHash.substring(0, 32).toUpperCase() + '...';
}

async function updatePacketView() {
    const user = usernameInput.value || '...';
    let pass = passwordInput.value || '...';

    if (passwordInput.value) {
        if (currentMode === 'secure') {
            pass = btoa(pass);
        } else if (currentMode === 'hash') {
            pass = await getHashedPassword(pass);
        }
    }

    packetContent.textContent = `POST /login { "usr": "${user}", "sec": "${pass}" }`;
}

usernameInput.addEventListener('input', updatePacketView);
passwordInput.addEventListener('input', updatePacketView);

// 3. ANIMATION LOGIC
async function animatePacket() {
    return new Promise(resolve => {
        packetDot.style.display = 'block';
        packetDot.style.transition = 'none';
        packetDot.style.left = '0%';
        packetDot.style.background = 'var(--primary)';
        
        packetDot.offsetHeight;

        packetDot.style.transition = 'left 0.8s cubic-bezier(0.45, 0, 0.55, 1)';
        packetDot.style.left = '45%';
        
        setTimeout(() => {
            nodes.attacker.classList.add('active');
            packetDot.style.background = 'var(--attacker)';
            packetDot.style.boxShadow = '0 0 20px var(--attacker)';
            
            setTimeout(() => {
                nodes.attacker.classList.remove('active');
                packetDot.style.left = '100%';
                
                setTimeout(() => {
                    nodes.server.classList.add('active');
                    setTimeout(() => {
                        nodes.server.classList.remove('active');
                        packetDot.style.display = 'none';
                        resolve();
                    }, 500);
                }, 800);
            }, 600);
        }, 800);
    });
}

// 4. LOGIN FORM SUBMISSION
const loginForm = document.getElementById('login-form');
const phishToggle = document.getElementById('phish-toggle');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value;
    let password = passwordInput.value;
    const injectPhishing = phishToggle.checked;

    if (currentMode === 'secure') {
        password = btoa(password);
    } else if (currentMode === 'hash') {
        password = await getHashedPassword(password);
    }

    if (!ATTACKER_URL) {
        alert('SYSTEM_ERROR: Run via ui_server.js');
        return;
    }

    await animatePacket();

    try {
        const response = await fetch(`${ATTACKER_URL}/proxy-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                password,
                mode: currentMode,
                injectPhishing
            })
        });

        const data = await response.json();
        
        packetContent.style.color = data.status === 'warning' ? 'var(--attacker)' : 'var(--server)';
        packetContent.textContent = `${data.status === 'warning' ? 'XSS_INJECTED' : 'HTTP/1.1 200 OK'} | ${data.message}`;
        
        if (data.phished) {
            showPhishingAlert(data.message);
        }

        setTimeout(() => {
            packetContent.style.color = '';
            updatePacketView();
        }, 5000);

        fetchLogs();
    } catch (err) {
        console.error('Error dispatching request:', err);
        packetContent.style.color = 'var(--attacker)';
        packetContent.textContent = `CRITICAL_FAILURE: ${err.message}`;
    }
});

function showPhishingAlert(msg) {
    const alertBox = document.createElement('div');
    alertBox.style = `
        position: fixed; top: 20%; left: 50%; transform: translateX(-50%);
        background: #ff0055; color: white; padding: 2rem; border-radius: 12px;
        box-shadow: 0 0 50px rgba(255,0,85,0.5); z-index: 1000; text-align: center;
        border: 2px solid white; font-weight: bold;
    `;
    alertBox.innerHTML = `
        <h2 style="margin-bottom: 1rem;">⚠️ SYSTEM ALERT ⚠️</h2>
        <p>${msg}</p>
        <button onclick="this.parentElement.remove()" style="margin-top: 1.5rem; padding: 0.5rem 2rem; cursor: pointer; background: white; border: none; border-radius: 4px; font-weight: bold;">DISMISS</button>
    `;
    document.body.appendChild(alertBox);
}

// 5. PACKET CRACKER LOGIC
async function crackBase64(element, encodedValue) {
    if (element.getAttribute('data-cracking') === 'true') return;
    element.setAttribute('data-cracking', 'true');
    element.style.color = 'var(--server)';
    
    const decodedText = atob(encodedValue);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    
    for (let i = 0; i < 15; i++) {
        let scramble = '';
        for (let j = 0; j < decodedText.length; j++) {
            scramble += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        element.textContent = scramble;
        await new Promise(r => setTimeout(r, 60));
    }
    
    element.textContent = decodedText;
    element.style.color = 'var(--server)';
    element.style.fontWeight = 'bold';
    element.setAttribute('data-cracked', 'true');
}

// 6. FETCH LOGS
async function fetchLogs() {
    try {
        const res = await fetch(`${ATTACKER_URL}/logs`);
        const logs = await res.json();
        
        const logBody = document.getElementById('log-body');
        logBody.innerHTML = ''; 

        logs.reverse().forEach((log) => {
            const modeClass = log.mode === 'insecure' ? 'status-insecure' : 'status-secure';
            const isBase64 = log.mode === 'secure';
            
            const crackBtn = isBase64 ? `<button onclick="crackBase64(this.previousElementSibling, '${log.password}')" style="margin-left: 5px; font-size: 0.6rem; background: var(--attacker); color: white; border: none; padding: 2px 5px; cursor: pointer; border-radius: 3px;">CRACK</button>` : '';

            const row = `
                <tr>
                    <td>${log.timestamp.split(', ')[1]}</td>
                    <td><span class="status-tag ${modeClass}">${log.mode.toUpperCase()}</span></td>
                    <td>${log.username}</td>
                    <td><code style="color: var(--attacker)">${log.password}</code>${crackBtn}</td>
                    <td><code>${log.rawRequest.substring(0, 30)}...</code></td>
                </tr>
            `;
            logBody.innerHTML += row;
        });
    } catch (err) {
        console.error('Error fetching logs:', err);
    }
}

fetchLogs();
setInterval(fetchLogs, 5000);
updatePacketView();
