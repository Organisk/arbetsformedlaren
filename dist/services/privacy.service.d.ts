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
export interface PrivacyConfig {
    /** Whether to enable extra privacy protections */
    enabled: boolean;
    /** Hash salt for user data */
    hashSalt?: string;
}
/**
 * Hash sensitive data using Node.js crypto
 */
export declare function hashSensitiveData(data: string, salt?: string): string;
/**
 * Pseudonymize user email - returns a deterministic but anonymized identifier
 */
export declare function pseudonymizeEmail(email: string): string;
/**
 * Sanitize CV text before storage or logging
 * Remove or mask potentially sensitive information
 */
export declare function sanitizeCVText(cvText: string): string;
/**
 * Check if CV contains sensitive data
 */
export declare function detectSensitiveData(cvText: string): {
    hasPersonnummer: boolean;
    hasEmail: boolean;
    hasPhone: boolean;
    hasAddress: boolean;
    hasBankAccount: boolean;
};
/**
 * Database query helper - prevents SQL injection
 */
export declare class DatabaseHelper {
    private db;
    constructor(db: any);
    safeInsert(table: string, data: Record<string, any>): any;
    safeSelect(table: string, where: Record<string, any>): any;
    safeUpdate(table: string, data: Record<string, any>, where: Record<string, any>): any;
    safeDelete(table: string, where: Record<string, any>): any;
}
declare const _default: {
    hashSensitiveData: typeof hashSensitiveData;
    pseudonymizeEmail: typeof pseudonymizeEmail;
    sanitizeCVText: typeof sanitizeCVText;
    detectSensitiveData: typeof detectSensitiveData;
    DatabaseHelper: typeof DatabaseHelper;
};
export default _default;
