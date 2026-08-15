/**
 * src/lib/api.js
 *
 * Centralized API client for all client-side fetch calls.
 * Automatically attaches the Authorization header from localStorage,
 * sets JSON Content-Type, and dispatches a global 'auth:logout' event
 * on 401 responses so AuthContext can cleanly sign the user out.
 */

/**
 * Core fetch wrapper.
 * @param {string} url - API path (e.g. '/api/stores')
 * @param {RequestInit} options - Standard fetch options
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function apiFetch(url, options = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    // On 401, dispatch a global event — AuthContext listens and triggers logout
    if (response.status === 401) {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('auth:logout'));
        }
    }

    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    }

    return { ok: response.ok, status: response.status, data };
}

/**
 * GET request helper.
 * @param {string} url
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function apiGet(url) {
    return apiFetch(url, { method: 'GET' });
}

/**
 * POST request helper.
 * @param {string} url
 * @param {object} body
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function apiPost(url, body) {
    return apiFetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

/**
 * PUT request helper.
 * @param {string} url
 * @param {object} body
 * @returns {Promise<{ ok: boolean, status: number, data: any }>}
 */
export async function apiPut(url, body) {
    return apiFetch(url, {
        method: 'PUT',
        body: JSON.stringify(body),
    });
}
