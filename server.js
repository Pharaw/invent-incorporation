const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'invent final')));

// Database setup
const db = new sqlite3.Database('./invent_insurance.db');

// Create tables
db.serialize(() => {
    // Clients table
    db.run(`CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT,
        company TEXT,
        services TEXT,
        bondType TEXT,
        bondAmount TEXT,
        projectDetails TEXT,
        coverageAmount TEXT,
        currentInsurer TEXT,
        renewalDate TEXT,
        additionalInfo TEXT,
        contactMethod TEXT,
        bestTime TEXT,
        submissionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'new'
    )`);

    // Services table
    db.run(`CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        category TEXT,
        active BOOLEAN DEFAULT 1
    )`);

    // Insert default services if not exists
    const defaultServices = [
        { name: 'Motor Insurance', description: 'Comprehensive vehicle insurance coverage', category: 'General' },
        { name: 'Liability Insurance', description: 'Protection against legal claims', category: 'Business' },
        { name: 'Agriculture Insurance', description: 'Farm and crop protection', category: 'Specialized' },
        { name: 'Commercial Insurance', description: 'Business property and liability coverage', category: 'Business' },
        { name: 'Marine Insurance', description: 'Marine cargo and vessel coverage', category: 'Specialized' },
        { name: 'Travel Insurance', description: 'Travel medical and trip protection', category: 'Personal' },
        { name: 'Construction & Engineering', description: 'Construction project insurance', category: 'Specialized' },
        { name: 'Trade Credit, Bonds & Guarantees', description: 'Financial guarantee services', category: 'Financial' },
        { name: 'Life Assurance', description: 'Life insurance and investment products', category: 'Personal' },
        { name: 'Funeral Assurance', description: 'Funeral and burial expense coverage', category: 'Personal' }
    ];

    defaultServices.forEach(service => {
        db.run(`INSERT OR IGNORE INTO services (name, description, category) VALUES (?, ?, ?)`, 
            [service.name, service.description, service.category]);
    });
});

// Routes
// API Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Admin Routes
const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch-all route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'invent final', 'home.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin`);
});

module.exports = app;
