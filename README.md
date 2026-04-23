# CNIS MITM Attack Simulation

An educational demonstration of Man-in-the-Middle (MITM) attacks for Computer Networks and Information Security (CNIS) coursework.

## Overview

This project simulates a MITM attack where an attacker intercepts login credentials between a victim client and a legitimate server. It demonstrates the dangers of unencrypted HTTP communication and the importance of HTTPS/TLS encryption.

### Components

- **Real Server** (`real_server.js`): The legitimate backend server that receives login requests.
- **Attacker Proxy** (`attacker_server.js`): Intercepts and logs all traffic before forwarding to the real server.
- **Victim UI** (`index.html` + `script.js`): A web interface that simulates user login, sending data through the attacker proxy.

## Prerequisites

- Node.js (v14 or higher)
- npm
- Two devices on the same local network (one for attacker, one for victim)

## Installation

1. Clone or download this repository.
2. Navigate to the project directory:
   ```bash
   cd MITM-Attack
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Step 1: Start the Attacker Setup

On the **attacker machine**, run all servers simultaneously:

```bash
npm run start-all
```

This starts:
- Real Server on `http://0.0.0.0:3000`
- Attacker Proxy on `http://0.0.0.0:4000`
- UI Server on `http://0.0.0.0:5001`

### Step 2: Access from Victim Machine

On the **victim machine**, open a web browser and navigate to:

```
http://10.0.24.202:5001
```

Replace `<ATTACKER_IP>` with the actual IP address of the attacker machine on your local network.

### Step 3: Demonstrate the Attack

1. On the victim browser, enter a username and password.
2. Select "Insecure Mode" (HTTP) to see plaintext interception.
3. Click "Dispatch to Server".
4. Observe the intercepted credentials on the attacker machine:
   - Console logs in the attacker terminal
   - Web dashboard at `http://<ATTACKER_IP>:4000/logs`

### Step 4: Compare with "Secure Mode"

- Switch to "Secure Mode" (HTTPS Sim) to see Base64 encoding (not real encryption).
- Note that even "secure" mode in this demo is vulnerable to MITM attacks without proper TLS.

## How It Works

1. **Victim** submits login form → sends POST request to attacker proxy.
2. **Attacker Proxy** intercepts the request, logs username/password, forwards to real server.
3. **Real Server** processes the request and responds.
4. **Attacker Proxy** returns the response to the victim.
5. **Attacker** can view all intercepted data in real-time.

### Network Flow

```
Victim Browser → Attacker Proxy (Port 4000) → Real Server (Port 3000)
                    ↓
               Logs Credentials
```

## Finding Your IP Address

### On macOS/Linux:
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
```
or
```bash
ifconfig | grep inet
```

### On Windows:
```cmd
ipconfig
```

Look for the local network IP (e.g., 192.168.x.x or 10.x.x.x).

## Educational Notes

- **This is a simulation only** - designed for classroom demonstrations.
- **Never use this on unauthorized networks** or against real systems.
- **Real MITM attacks** require network-level access (e.g., ARP spoofing, DNS poisoning).
- **HTTPS prevents this** by encrypting data in transit using TLS/SSL.

## Troubleshooting

- **Cannot connect?** Ensure both machines are on the same network and firewalls allow the ports.
- **Page not loading?** Verify the attacker IP address and that all servers are running.
- **No logs appearing?** Check browser console for errors and ensure the victim is using the UI server (not opening index.html as a file).

## License

This project is for educational purposes only. Use responsibly and ethically.