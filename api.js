const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Submit client form
router.post('/submit-form', (req, res) => {
    const {
        fullName,
        email,
        phone,
        address,
        company,
        services,
        bondType,
        bondAmount,
        projectDetails,
        coverageAmount,
        currentInsurer,
        renewalDate,
        additionalInfo,
        contactMethod,
        bestTime
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !services || !contactMethod) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Convert services array to string
    const servicesString = Array.isArray(services) ? services.join(', ') : services;

    const query = `INSERT INTO clients (
        fullName, email, phone, address, company, services, bondType, bondAmount,
        projectDetails, coverageAmount, currentInsurer, renewalDate, additionalInfo,
        contactMethod, bestTime
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
        fullName, email, phone, address, company, servicesString, bondType, bondAmount,
        projectDetails, coverageAmount, currentInsurer, renewalDate, additionalInfo,
        contactMethod, bestTime
    ];

    db.run(query, values, function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to save submission' });
        }

        res.json({ 
            success: true, 
            id: this.lastID,
            message: 'Thank you for your submission! We will contact you within 24 hours.'
        });
    });
});

// Get all services
router.get('/services', (req, res) => {
    db.all('SELECT * FROM services WHERE active = 1 ORDER BY name', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch services' });
        }
        res.json(rows);
    });
});

// Get service by ID
router.get('/services/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM services WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch service' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.json(row);
    });
});

// Get service statistics
router.get('/stats', (req, res) => {
    const stats = {};
    
    // Total submissions
    db.get('SELECT COUNT(*) as total FROM clients', (err, row) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch stats' });
        stats.totalSubmissions = row.total;

        // Submissions by status
        db.all('SELECT status, COUNT(*) as count FROM clients GROUP BY status', (err, rows) => {
            if (err) return res.status(500).json({ error: 'Failed to fetch stats' });
            stats.byStatus = rows;

            // Submissions by service
            db.all(`SELECT 
                services, 
                COUNT(*) as count 
                FROM clients 
                GROUP BY services 
                ORDER BY count DESC 
                LIMIT 10`, (err, rows) => {
                if (err) return res.status(500).json({ error: 'Failed to fetch stats' });
                stats.byService = rows;

                res.json(stats);
            });
        });
    });
});

module.exports = router;
