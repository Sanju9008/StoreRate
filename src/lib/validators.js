export function validateName(name) {
    if (typeof name !== 'string') return false;
    const trimmed = name.trim();
    return trimmed.length > 0 && trimmed.length <= 60;
}

export function validateEmail(email) {
    if (typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

export function validatePassword(password) {
    if (typeof password !== 'string') return false;
    return password.length >= 6;
}

export function validateAddress(address) {
    if (typeof address !== 'string') return false;
    const trimmed = address.trim();
    return trimmed.length > 0 && trimmed.length <= 400;
}

export function validateRating(rating) {
    return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

export function validateSignup(body) {
    const errors = {};
    if (!validateName(body.name)) errors.name = 'Name must be between 1 and 60 characters.';
    if (!validateEmail(body.email)) errors.email = 'Invalid email format.';
    if (!validatePassword(body.password)) errors.password = 'Password must be at least 6 characters.';
    if (!validateAddress(body.address)) errors.address = 'Address must be between 1 and 400 characters.';
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

export function validateLogin(body) {
    const errors = {};
    if (!validateEmail(body.email)) errors.email = 'Invalid email format.';
    if (typeof body.password !== 'string' || body.password.length === 0) errors.password = 'Password is required.';
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}
