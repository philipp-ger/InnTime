const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { verifyPassword, signJwt } = require('../auth');
const { requireEmployee } = require('../middleware/authMiddleware');

// API: Employee Login (öffentlich)
router.post('/login', (req, res) => {
    const { password } = req.body;
    db.get("SELECT value FROM settings WHERE key = 'employee_password'", (err, row) => {
        if (err) return res.status(500).json({ error: 'Datenbankfehler' });

        if (row && verifyPassword(password, row.value)) {
            const token = signJwt({ role: 'employee' }, 12 * 60 * 60); // 12 Stunden
            res.json({ success: true, token });
        } else {
            res.status(401).json({ error: 'Falsches Passwort' });
        }
    });
});

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
router.post('/timesheets', requireEmployee, (req, res) => {
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
router.delete('/timesheets/:id', requireEmployee, (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM timesheets WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Eintrag gelöscht' });
    });
});

// API: Get monthly history for one employee (Mitarbeiter-Bereich)
router.get('/employee/:id/history/:year/:month', requireEmployee, (req, res) => {
    const { id, year, month } = req.params;
    const monthStr = String(month).padStart(2, '0');
    const datePattern = `${year}-${monthStr}%`;

    db.all(
        'SELECT id, date, start_time, end_time FROM timesheets WHERE employee_id = ? AND date LIKE ? ORDER BY date DESC, start_time ASC',
        [id, datePattern],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            // Gruppieren nach Datum
            const days = {};
            rows.forEach(row => {
                if (!days[row.date]) days[row.date] = { hours: 0, entries: [] };
                const start = new Date(`2000-01-01 ${row.start_time}`);
                const end = new Date(`2000-01-01 ${row.end_time}`);
                const hours = Math.max(0, (end - start) / (1000 * 60 * 60));
                days[row.date].hours += hours;
                days[row.date].entries.push({ id: row.id, start_time: row.start_time, end_time: row.end_time, hours });
            });

            const totalHours = Object.values(days).reduce((sum, d) => sum + d.hours, 0);
            res.json({ days, totalHours });
        }
    );
});

module.exports = router;
