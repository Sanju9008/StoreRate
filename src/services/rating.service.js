import { query } from '@/lib/db.js';

/**
 * Check whether a store exists by its ID.
 * @param {string} storeId
 * @returns {Promise<boolean>}
 */
export async function storeExists(storeId) {
    const results = await query(`SELECT id FROM stores WHERE id = ?`, [storeId]);
    return results.length > 0;
}

/**
 * Atomically insert or update a rating using ON DUPLICATE KEY UPDATE.
 * The UNIQUE constraint on (user_id, store_id) ensures idempotency.
 * @param {string} id - UUID for a new insert (ignored on update)
 * @param {number} rating - Integer 1–5
 * @param {string} userId
 * @param {string} storeId
 */
export async function upsertRating(id, rating, userId, storeId) {
    await query(`
        INSERT INTO ratings (id, rating, user_id, store_id)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            rating = VALUES(rating),
            updated_at = CURRENT_TIMESTAMP
    `, [id, rating, userId, storeId]);
}
