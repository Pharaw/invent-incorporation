const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Admin dashboard - get all submissions
router.get('/', (req, res) => {
    const query = `
        SELECT id, fullName, email, phone, company, services, submissionDate, status
        FROM clients
        ORDER BY submissionDate DESC
    `;

    db.all(query, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch submissions' });
        }
        res.json(rows);
    });
});

// Get submission details
router.get('/submission/:id', (req, res) => {
    const id = req.params.id;
    const query = 'SELECT * FROM clients WHERE id = ?';

    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch submission' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        res.json(row);
    });
});

// Update submission status
router.put('/submission/:id/status', (req, res) => {
    const id = req.params.id;
    const { status } = req.body;

    if (!['new', 'contacted', 'quoted', 'converted', 'closed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    const query = 'UPDATE clients SET status = ? WHERE id = ?';
    db.run(query, [status, id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to update status' });
        }
        res.json({ success: true, message: 'Status updated successfully' });
    });
});

// Delete submission
router.delete('/submission/:id', (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM clients WHERE id = ?';

    db.run(query, [id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete submission' });
        }
        res.json({ success: true, message: 'Submission deleted successfully' });
    });
});

// Get dashboard statistics
router.get('/dashboard', (req, res) => {
    const stats = {};

    // Total submissions
    db.get('SELECT COUNT(*) as total FROM clients', (err, row) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch stats' });
        stats.total = row.total;

        // New submissions (today)
        db.get(`SELECT COUNT(*) as newToday FROM clients 
                WHERE DATE(submissionDate) = DATE('now')`, (err, row) => {
            if (err) return res.status(500).json({ error: 'Failed to fetch stats' });
            stats.newToday = row.newToday;

            // Submissions by status
            db.all('SELECT status, COUNT(*) as count FROM clients GROUP BY status', (err, rows) => {
                if (err) return res.status(500).json({ error: 'Failed to fetch stats' });
                stats.byStatus = rows;

                // Recent submissions (last 7 days)
                db.all(`SELECT * FROM clients 
                        WHERE submissionDate >= datetime('now', '-7 days') 
                        ORDER BY submissionDate DESC`, (err, rows) => {
                    if (err) return res.status(500).json({ error: 'Failed to fetch stats' });
                    stats.recent = rows;

                    res.json(stats);
                });
            });
        });
    });
});

module.exports = router;
