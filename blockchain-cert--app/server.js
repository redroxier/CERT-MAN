const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const CryptoJS = require('crypto-js');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize Database
const db = new sqlite3.Database(':memory:'); // Using memory for easy demo cleanup

db.serialize(() => {
    // Table for Certificates
    db.run("CREATE TABLE certificates (id TEXT, recipient TEXT, major TEXT, filename TEXT, hash TEXT)");
    
    // Table for Users (Authentication)
    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password TEXT)");
    
    // Create a default admin user for your demo
    const hashedPass = bcrypt.hashSync('admin123', 10);
    db.run("INSERT INTO users (email, password) VALUES (?, ?)", ['admin@certman.io', hashedPass]);
});

// --- AUTHENTICATION ROUTES ---

// SIGNUP ROUTE
app.post('/api/auth/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashedPassword], (err) => {
            if (err) return res.status(400).json({ error: "User already exists" });
            res.json({ success: true, message: "Profile created successfully" });
        });
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
});

// LOGIN ROUTE
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (err || !user) return res.status(401).json({ error: "User not found" });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            res.json({ success: true, user: { email: user.email } });
        } else {
            res.status(401).json({ error: "Invalid security code" });
        }
    });
});

// --- CERTIFICATE ROUTES ---

app.post('/api/issue', (req, res) => {
    const { recipient, major, filename } = req.body;
    const certId = Math.random().toString(36).substr(2, 6).toUpperCase();
    const hash = CryptoJS.SHA256(certId + recipient + major).toString();

    db.run("INSERT INTO certificates VALUES (?, ?, ?, ?, ?)", [certId, recipient, major, filename, hash]);
    res.json({ success: true, certId, hash });
});

app.get('/api/verify/:id', (req, res) => {
    db.get("SELECT * FROM certificates WHERE id = ?", [req.params.id], (err, row) => {
        if (row) {
            // VULNERABLE: The 'major' field may contain the XSS script injected earlier
            res.json({ 
                status: "AUTHENTIC", 
                message: `Certificate ID <b>${row.id}</b> issued to <u>${row.recipient}</u> for <i>${row.major}</i> is verified on-chain.`,
                data: row 
            });
        } else {
            res.status(404).json({ status: "NOT FOUND", message: "Certificate ID does not exist in our ledger." });
        }
    });
});

app.listen(5000, () => console.log('CERT-MAN Secure Backend: http://localhost:5000'));