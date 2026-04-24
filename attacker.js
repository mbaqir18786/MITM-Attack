// attacker.js - Logic for the Attacker's Dashboard

const CURRENT_HOST = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'localhost' : '10.0.9.144';
const ATTACKER_URL = `http://${CURRENT_HOST}:4000`;

console.log(`[ATTACKER] Dashboard connected to: ${ATTACKER_URL}`);

async function fetchLogs() {
    try {
        const res = await fetch(`${ATTACKER_URL}/logs`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const logs = await res.json();
        
        const logBody = document.getElementById('log-body');
        if (!logBody) return;

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
        console.error('[ATTACKER] Error fetching logs:', err.message);
        // We don't alert here to avoid annoying popups during polling, 
        // but it will show in the browser console.
    }
}

// Initial fetch and set interval for real-time updates
fetchLogs();
setInterval(fetchLogs, 2500); // Polling every 2.5 seconds
