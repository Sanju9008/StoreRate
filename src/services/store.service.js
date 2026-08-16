import { query } from '@/lib/db.js';

/**
 * Fetch all public stores with overall average ratings and the current user's submitted rating.
 * @param {{ userId: string, search?: string, sortBy?: string, order?: string }} opts
 * @returns {Promise<Array>}
 */
export async function getStoresWithUserRating({ userId, search = '', sortBy = 'created_at', order = 'DESC' } = {}) {
    const allowedSortBy = ['name', 'address', 'rating', 'created_at'];
    if (!allowedSortBy.includes(sortBy)) sortBy = 'created_at';
    order = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const params = [userId]; // First param is for the user rating subquery
    let where = '';

    if (search) {
        where = `WHERE s.name LIKE ? OR s.address LIKE ?`;
        const like = `%${search}%`;
        params.push(like, like);
    }

    return query(`
        SELECT
            s.id, s.name, s.email, s.address,
            ROUND(COALESCE(AVG(r.rating), 0), 1) AS overallRating,
            COUNT(r.id) AS totalRatings,
            MAX(CASE WHEN r.user_id = ? THEN r.rating ELSE NULL END) AS userSubmittedRating
        FROM stores s
        LEFT JOIN ratings r ON r.store_id = s.id
        ${where}
        GROUP BY s.id
        ORDER BY ${sortBy === 'rating' ? 'overallRating' : 's.' + sortBy} ${order}
    `, params);
}

/**
 * Fetch the store and its reviewer list for a store owner dashboard.
 * @param {{ ownerId: string, sortBy?: string, order?: string }} opts
 * @returns {Promise<{ store: Object|null, ratings: Array }>}
 */
export async function getOwnerDashboardData({ ownerId, sortBy = 'created_at', order = 'DESC' } = {}) {
    const allowedSortBy = ['name', 'rating', 'created_at'];
    if (!allowedSortBy.includes(sortBy)) sortBy = 'created_at';
    order = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const storeResults = await query(`
        SELECT s.id, s.name, s.email, s.address, s.created_at,
               COALESCE(AVG(r.rating), 0) AS averageRating,
               COUNT(r.id) AS totalRatings
        FROM stores s
        LEFT JOIN ratings r ON r.store_id = s.id
        WHERE s.owner_id = ?
        GROUP BY s.id
    `, [ownerId]);

    if (storeResults.length === 0) {
        return { store: null, ratings: [] };
    }

    const store = storeResults[0];

    let sortColumn = `r.${sortBy}`;
    if (sortBy === 'name') sortColumn = `u.name`;

    const reviewers = await query(`
        SELECT u.name, u.email, u.address, r.rating, r.created_at, r.updated_at
        FROM ratings r
        JOIN users u ON r.user_id = u.id
        WHERE r.store_id = ?
        ORDER BY ${sortColumn} ${order}
    `, [store.id]);

    return {
        store: {
            id: store.id,
            name: store.name,
            email: store.email,
            address: store.address,
            created_at: store.created_at,
            averageRating: Number(store.averageRating).toFixed(1),
            totalRatings: store.totalRatings,
        },
        ratings: reviewers,
    };
}
