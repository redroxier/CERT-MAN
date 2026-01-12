# CERT-MAN | Blockchain-Based Certificate Verification

## Overview
CERT-MAN is a full-stack web application designed to demonstrate real-world web security issues, specifically **Stored Cross-Site Scripting (XSS)** and **Broken Authentication**, within a blockchain-themed environment.

## Security Vulnerabilities (OWASP Top 10)
1. **Stored XSS (A03:2021):** Users can inject malicious scripts into the "Achievement" field.
2. **Broken Authentication (A07:2021):** Demonstrates secure password hashing using Bcrypt vs. potential session issues.

## Tech Stack
- **Frontend:** HTML5, CSS3 (Glassmorphism), JavaScript (Vanilla)
- **Backend:** Node.js, Express.js
- **Database:** SQLite3
- **Security:** Bcryptjs (Hashing), CryptoJS (SHA-256 for Blockchain simulation)

## Setup Instructions
1. Install [Node.js](https://nodejs.org/) if not already installed.
2. Navigate to the project root folder in your terminal.
3. Install dependencies:
   ```bash
   npm install express sqlite3 cors body-parser crypto-js bcryptjs
