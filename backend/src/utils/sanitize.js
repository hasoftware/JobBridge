const sanitizeString = (str) => {
    if (typeof str !== 'string') {
        return str;
    }

    return str
        .trim()
        .replace(/<[^>]*>/g, '')
        .replace(/[<>'"`;]/g, '');
};

const sanitizeRequestBody = (body) => {
    if (!body || typeof body !== 'object') return body;

    const clean = {};

    for (const [key, value] of Object.entries(body)) {
        if (typeof value === 'string') {
            clean[key] = sanitizeString(value);
        } else if (Array.isArray(value)) {
            clean[key] = value.map((item) => {
                return (typeof item === 'string') ? sanitizeString(item) : sanitizeRequestBody(item)
            });
        } else if (typeof value === 'object' && value !== null) {
            clean[key] = sanitizeRequestBody(value);
        } else {
            clean[key] = value;
        }
    }

    return clean;
};

const scrub = (body) => {
    if (!body) {
        return null;
    }

    const safe = { ...body };

    Object.keys(safe).forEach((key) => {
        if (key.toLowerCase().includes('token')    ||
            key.toLowerCase().includes('password') ||
            key.toLowerCase().includes('secret')) {
            safe[key] = '***';
        }
    });

    return safe;
};

module.exports = { sanitizeString, sanitizeRequestBody, scrub };
