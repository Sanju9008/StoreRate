/**
 * user.service.js
 *
 * User profile queries. Auth-related user operations (lookup by email,
 * password hashing) live in auth.service.js. This service handles
 * profile retrieval used across multiple contexts.
 */

export {
    findUserById,
    findUserByEmail,
    emailExists,
    createUser,
    updateUserPassword,
    getUserHashedPassword,
} from '@/services/auth.service.js';
