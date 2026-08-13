/**
 * Privacy & Security Service - Data minimization and protection
 *
 * Principles:
 * 1. Minimize data collection - only store what's needed
 * 2. Never store raw CV text in logs
 * 3. Hash/pseudonymize sensitive data
 * 4. Never store API keys in frontend or git
 * 5. Use parameterized queries to prevent SQL injection
 * 6. Encrypt sensitive data at rest
 */
/**
 * Hash sensitive data using Node.js crypto
 */
export function hashSensitiveData(data, salt) {
    const saltValue = salt || 'arbetsformedlaren-default-salt-2024';
    const crypto = require('crypto');
    const hashed = crypto.createHash('sha256').update(data + saltValue).digest('hex');
    return hashed;
}
/**
 * Pseudonymize user email - returns a deterministic but anonymized identifier
 */
export function pseudonymizeEmail(email) {
    if (!email)
        return 'anonymous';
    const crypto = require('crypto');
    const hashed = crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
    return `user_${hashed.substring(0, 8)}`;
}
/**
 * Sanitize CV text before storage or logging
 * Remove or mask potentially sensitive information
 */
export function sanitizeCVText(cvText) {
    if (!cvText)
        return '';
    let sanitized = cvText;
    // Remove Swedish personal identity numbers (personnummer) - format: YYYYMMDD-XXXX
    sanitized = sanitized.replace(/\d{6}-\d{4}/g, '[REDACTED-PERSONNUMMER]');
    // Remove bank account numbers (16 digits)
    sanitized = sanitized.replace(/\d{16}/g, '[REDACTED-BANKKONTO]');
    // Remove phone numbers (Swedish mobile format: 07X-XXX XXX)
    sanitized = sanitized.replace(/07[0-9]-\d{3} \d{3}/g, '[REDACTED-PHONE]');
    sanitized = sanitized.replace(/07[0-9]-\d{2} \d{3} \d{2}/g, '[REDACTED-PHONE]');
    // Remove email addresses (mask all but first 3 chars of local part)
    sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (match, localPart) => '[REDACTED-EMAIL:' + localPart.substring(0, 3) + '****]');
    // Remove full names - replace with initials
    sanitized = sanitized.replace(/\b([A-ZÄÖ][a-zäö]+)\s+([A-ZÄÖ][a-zäö]+)\b/g, (match, first, last) => first.charAt(0) + '. ' + last.charAt(0) + '.');
    // Remove addresses (street name with number)
    sanitized = sanitized.replace(/\d+\s+[A-Za-zäöÅå\s]+(?:gata|väg|gård|vägen)/gi, '[REDACTED-ADDRESS]');
    // Remove birth dates
    sanitized = sanitized.replace(/\b\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}\b/g, '[REDACTED-DATE]');
    return sanitized;
}
/**
 * Check if CV contains sensitive data
 */
export function detectSensitiveData(cvText) {
    const text = cvText || '';
    return {
        hasPersonnummer: /\d{6}-\d{4}/.test(text),
        hasEmail: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text),
        hasPhone: /07[0-9]-\d{3} \d{3}/.test(text) || /07[0-9]-\d{2} \d{3} \d{2}/.test(text),
        hasAddress: /\d+\s+[A-Za-zäöÅå\s]+(?:gata|väg|gård)/i.test(text),
        hasBankAccount: /\d{16}/.test(text),
    };
}
/**
 * Database query helper - prevents SQL injection
 */
export class DatabaseHelper {
    constructor(db) {
        this.db = db;
    }
    safeInsert(table, data) {
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);
        const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
        return this.db.run(sql, values);
    }
    safeSelect(table, where) {
        const conditions = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
        const values = Object.values(where);
        const sql = `SELECT * FROM ${table} WHERE ${conditions}`;
        return this.db.get(sql, values);
    }
    safeUpdate(table, data, where) {
        const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const setValues = Object.values(data);
        const whereClause = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
        const whereValues = Object.values(where);
        const allValues = [...setValues, ...whereValues];
        const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
        return this.db.run(sql, allValues);
    }
    safeDelete(table, where) {
        const conditions = Object.keys(where).map(key => `${key} = ?`).join(' AND ');
        const values = Object.values(where);
        const sql = `DELETE FROM ${table} WHERE ${conditions}`;
        return this.db.run(sql, values);
    }
}
export default {
    hashSensitiveData,
    pseudonymizeEmail,
    sanitizeCVText,
    detectSensitiveData,
    DatabaseHelper
};
