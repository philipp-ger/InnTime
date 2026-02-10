const express = require('express');
const router = express.Router();
const db = require('../db/database');

// API: Get all employees
router.get('/employees', (req, res) => {
    db.all('SELECT id, name FROM employees ORDER BY name', (err, employees) => {
        if (err) {
            return res.status(500).json({ error: 'Fehler beim Abrufen der Mitarbeiter' });
        }
        res.json(employees);
    });
});

// API: Get employee data by ID
router.get('/employee/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT id, name FROM employees WHERE id = ?', [id], (err, employee) => {
        if (err || !employee) {
            return res.status(404).json({ error: 'Mitarbeiter nicht gefunden' });
        }
        res.json(employee);
    });
});

// API: Get entries for specific date (Query parameters)
router.get('/timesheet', (req, res) => {
    const { employee_id, date } = req.query;

    if (!employee_id || !date) {
        return res.status(400).json({ error: 'employee_id und date sind erforderlich' });
    }

    db.all(
        'SELECT * FROM timesheets WHERE employee_id = ? AND date = ?',
        [employee_id, date],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows || []);
        }
    );
});

// API: Save timesheet entry
router.post('/timesheets', (req, res) => {
    const { employee_id, date, start_time, end_time } = req.body;

    if (!employee_id || !date || !start_time || !end_time) {
        return res.status(400).json({ error: 'Mitarbeiter, Datum, Start- und Endzeit sind erforderlich' });
    }

    // Insert new entry (support for multiple intervals per day)
    db.run(
        'INSERT INTO timesheets (employee_id, date, start_time, end_time) VALUES (?, ?, ?, ?)',
        [employee_id, date, start_time, end_time],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: 'Zeiterfassung gespeichert!', id: this.lastID });
        }
    );
});

// API: Delete timesheet entry
router.delete('/timesheets/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM timesheets WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Eintrag gelöscht' });
    });
});

module.exports = router;
