/**
 * InnTime Auth Utilities
 * Passwort-Hashing via Node.js crypto (scrypt) + einfaches JWT via HMAC-SHA256
 */

const crypto = require('crypto');

// ── JWT Secret ────────────────────────────────────────────────────────────────
// Wird beim ersten Start zufällig generiert und in der DB gespeichert.
// Hier als Modul-Variable zwischengespeichert.
let JWT_SECRET = null;

function setJwtSecret(secret) {
    JWT_SECRET = secret;
}

// ── Password Hashing (scrypt) ─────────────────────────────────────────────────

/**
 * Passwort hashen → Format: "salt:hash" (beide hex-kodiert)
 */
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

/**
 * Passwort gegen gespeicherten Hash prüfen.
 * Unterstützt auch Klartext-Passwörter (Legacy, für einmalige Migration).
 */
function verifyPassword(password, stored) {
    if (!stored) return false;

    // Neues Format: "salt:hash"
    if (stored.includes(':')) {
        const [salt, hash] = stored.split(':');
        const attempt = crypto.scryptSync(password, salt, 64).toString('hex');
        return crypto.timingSafeEqual(Buffer.from(attempt, 'hex'), Buffer.from(hash, 'hex'));
    }

    // Legacy: Klartext-Vergleich (wird nach erstem Login automatisch gehasht)
    return password === stored;
}

/**
 * Prüft ob ein gespeichertes Passwort noch im Klartext vorliegt.
 */
function isLegacyPassword(stored) {
    return stored && !stored.includes(':');
}

// ── JWT (HMAC-SHA256, ohne externe Pakete) ────────────────────────────────────

function b64url(obj) {
    return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

/**
 * JWT ausstellen.
 * @param {object} payload  z.B. { role: 'admin' }
 * @param {number} expiresInSeconds  Standard: 8 Stunden
 */
function signJwt(payload, expiresInSeconds = 8 * 60 * 60) {
    if (!JWT_SECRET) throw new Error('JWT_SECRET nicht gesetzt');

    const header = b64url({ alg: 'HS256', typ: 'JWT' });
    const fullPayload = b64url({
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + expiresInSeconds
    });

    const sig = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${header}.${fullPayload}`)
        .digest('base64url');

    return `${header}.${fullPayload}.${sig}`;
}

/**
 * JWT verifizieren und Payload zurückgeben.
 * Wirft einen Fehler wenn ungültig oder abgelaufen.
 */
function verifyJwt(token) {
    if (!JWT_SECRET) throw new Error('JWT_SECRET nicht gesetzt');
    if (!token) throw new Error('Kein Token');

    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Ungültiges Token-Format');

    const [header, payload, sig] = parts;

    const expectedSig = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${header}.${payload}`)
        .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
        throw new Error('Ungültige Signatur');
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());

    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token abgelaufen');
    }

    return decoded;
}

module.exports = { hashPassword, verifyPassword, isLegacyPassword, signJwt, verifyJwt, setJwtSecret };
