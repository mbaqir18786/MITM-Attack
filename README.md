# CNIS MITM Attack Simulation (Advanced Lab)

This is an enhanced educational demonstration of Man-in-the-Middle (MITM) attacks, featuring real-time packet visualization, hashing simulations, and response injection.

## 🚀 "Level 2" Features Added
- **Live Traffic Animation**: Watch data move from Client ➔ Attacker ➔ Server.
- **Packet "Cracker"**: Demonstrates why Base64 encoding is not secure.
- **Phishing Injection**: Modify server responses to show fake security alerts.
- **Hashing Mode**: Shows how SHA-256 protects data in transit.

## 🛠 Usage

### Step 1: Start the Servers
On the **attacker machine**, run:
```bash
npm run start-all
```

### Step 2: Access from Victim Machine
On the **victim machine**, navigate to:
`http://10.0.24.202:5001` (Replace with your current IP if it changes).

### Step 3: Test the Security Features
1. **Insecure Mode**: Plaintext interception.
2. **Secure Mode**: Base64 interception + use the **"CRACK"** button in logs to reveal the password.
3. **Hashing Mode**: Shows cryptographic fingerprints.
4. **Malicious Toggle**: Turn on **"Inject Malicious Script"** to trigger a fake phishing alert on the victim's UI.

## 📁 Components
- `real_server.js`: Legitimate backend (Port 3000).
- `attacker_server.js`: Intercepting proxy with injection logic (Port 4000).
- `ui_server.js`: Serves the lab dashboard (Port 5001).
- `index.html` + `script.js`: The "Cyber Lab" interface.

## 💡 Educational Notes
- **Encoding != Encryption**: Use the cracker tool to prove this.
- **Data Integrity**: Use the injection tool to show how attackers can "change the truth."
- **Hashing**: Explains why modern apps never send plaintext passwords.

---
*Created for CNIS Portfolio | Educational Purposes Only*