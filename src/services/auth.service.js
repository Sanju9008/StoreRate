import { query } from '@/lib/db.js';

/**
 * Find a user by their email address.
 * @param {string} email
 * @returns {Promise<Object|null>} The user row or null if not found.
 */
export async function findUserByEmail(email) {
    const results = await query(
        `SELECT id, name, email, password, address, role FROM users WHERE email = ?`,
        [email]
    );
    return results[0] || null;
}

/**
 * Find a user by their ID.
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function findUserById(id) {
    const results = await query(
        `SELECT id, name, email, address, role FROM users WHERE id = ?`,
        [id]
    );
    return results[0] || null;
}

/**
 * Fetch only the hashed password for a given user ID (for password verification).
 * @param {string} id
 * @returns {Promise<string|null>}
 */
export async function getUserHashedPassword(id) {
    const results = await query(
        `SELECT password FROM users WHERE id = ?`,
        [id]
    );
    return results[0]?.password || null;
}

/**
 * Check whether an email is already registered.
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export async function emailExists(email) {
    const results = await query(
        `SELECT id FROM users WHERE email = ?`,
        [email]
    );
    return results.length > 0;
}

/**
 * Insert a new user into the database.
 */
export async function createUser(id, name, email, hashedPassword, address, role) {
    await query(
        `INSERT INTO users (id, name, email, password, address, role) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, name, email, hashedPassword, address, role]
    );
}

/**
 * Update a user's hashed password.
 */
export async function updateUserPassword(id, hashedPassword) {
    await query(
        `UPDATE users SET password = ? WHERE id = ?`,
        [hashedPassword, id]
    );
}
