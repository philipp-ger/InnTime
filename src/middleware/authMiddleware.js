const { verifyJwt } = require('../auth');

/**
 * Schützt Admin-Routen.
 * Erwartet: Authorization: Bearer <token>
 */
function requireAdmin(req, res, next) {
    const header = req.headers['authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    try {
        const payload = verifyJwt(token);
        if (payload.role !== 'admin') throw new Error('Keine Admin-Rechte');
        req.admin = payload;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Nicht autorisiert: ' + err.message });
    }
}

/**
 * Schützt Mitarbeiter-Schreibrouten.
 * Erwartet: Authorization: Bearer <token>
 */
function requireEmployee(req, res, next) {
    const header = req.headers['authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    try {
        const payload = verifyJwt(token);
        if (payload.role !== 'employee' && payload.role !== 'admin') {
            throw new Error('Kein Zugriff');
        }
        req.user = payload;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Nicht autorisiert: ' + err.message });
    }
}

module.exports = { requireAdmin, requireEmployee };
