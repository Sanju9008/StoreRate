import { query } from '@/lib/db.js';

/**
 * Fetch aggregate counts for the admin dashboard metrics card.
 * @returns {Promise<{ totalUsers: number, totalStores: number, totalRatings: number }>}
 */
export async function getDashboardMetrics() {
    const [usersResult, storesResult, ratingsResult] = await Promise.all([
        query(`SELECT COUNT(*) as count FROM users`, []),
        query(`SELECT COUNT(*) as count FROM stores`, []),
        query(`SELECT COUNT(*) as count FROM ratings`, []),
    ]);
    return {
        totalUsers: usersResult[0].count,
        totalStores: storesResult[0].count,
        totalRatings: ratingsResult[0].count,
    };
}

/**
 * Fetch all users with optional search, role filter, and sorting.
 * Includes a subquery for the store owner's average rating.
 * @param {{ search?: string, role?: string, sortBy?: string, order?: string }} opts
 * @returns {Promise<Array>}
 */
export async function getUsers({ search = '', role = '', sortBy = 'created_at', order = 'DESC' } = {}) {
    const allowedSortBy = ['name', 'email', 'address', 'role', 'created_at'];
    if (!allowedSortBy.includes(sortBy)) sortBy = 'created_at';
    order = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const params = [];
    const conditions = [];

    if (search) {
        conditions.push(`(u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ?)`);
        const like = `%${search}%`;
        params.push(like, like, like);
    }

    if (role && ['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'].includes(role)) {
        conditions.push(`u.role = ?`);
        params.push(role);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    return query(`
        SELECT
            u.id, u.name, u.email, u.address, u.role, u.created_at,
            COALESCE(AVG(r.rating), 0) AS storeRating,
            MAX(CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END) AS hasStore
        FROM users u
        LEFT JOIN stores s ON s.owner_id = u.id
        LEFT JOIN ratings r ON r.store_id = s.id
        ${where}
        GROUP BY u.id
        ORDER BY u.${sortBy} ${order}
    `, params);
}

/**
 * Check whether a user email already exists in the users table.
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export async function userEmailExists(email) {
    const results = await query(`SELECT id FROM users WHERE email = ?`, [email]);
    return results.length > 0;
}

/**
 * Insert a new user record.
 */
export async function createUser(id, name, email, hashedPassword, address, role) {
    await query(
        `INSERT INTO users (id, name, email, password, address, role) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, name, email, hashedPassword, address, role]
    );
}

/**
 * Fetch all stores for the admin panel with optional search and sorting.
 * Includes average overall rating via LEFT JOIN.
 * @param {{ search?: string, sortBy?: string, order?: string }} opts
 * @returns {Promise<Array>}
 */
export async function getAdminStores({ search = '', sortBy = 'created_at', order = 'DESC' } = {}) {
    const allowedSortBy = ['name', 'email', 'address', 'rating', 'created_at'];
    if (!allowedSortBy.includes(sortBy)) sortBy = 'created_at';
    order = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const params = [];
    let where = '';

    if (search) {
        where = `WHERE s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ?`;
        const like = `%${search}%`;
        params.push(like, like, like);
    }

    return query(`
        SELECT
            s.id, s.name, s.email, s.address, s.owner_name AS ownerName, s.created_at,
            COALESCE(AVG(r.rating), 0) AS overallRating
        FROM stores s
        LEFT JOIN ratings r ON r.store_id = s.id
        ${where}
        GROUP BY s.id
        ORDER BY ${sortBy === 'rating' ? 'overallRating' : 's.' + sortBy} ${order}
    `, params);
}

/**
 * Check whether a store email is already registered.
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export async function storeEmailExists(email) {
    const results = await query(`SELECT id FROM stores WHERE email = ?`, [email]);
    return results.length > 0;
}

/**
 * Check whether an owner already owns a store.
 * @param {string} ownerId
 * @returns {Promise<boolean>}
 */
export async function ownerHasStore(ownerId) {
    const results = await query(`SELECT id FROM stores WHERE owner_id = ?`, [ownerId]);
    return results.length > 0;
}

/**
 * Insert a new store record.
 */
export async function createStore(id, name, email, address, ownerName, ownerId) {
    await query(
        `INSERT INTO stores (id, name, email, address, owner_name, owner_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, name, email, address, ownerName || null, ownerId || null]
    );
}
