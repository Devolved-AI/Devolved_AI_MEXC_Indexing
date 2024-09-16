const STATUS_CODES = {
    OK: { code: 200, message: 'Success' },
    CREATED: { code: 201, message: 'Created' },
    MISSING_REQUIRED_FIELDS: { code: 400, message: 'Missing Required Fields' },
    UNAUTHORIZED: { code: 401, message: 'Unauthorized' },
    INVALID_TOKEN: { code: 403, message: 'Invalid Token' },
    NOT_FOUND: { code: 404, message: 'Not Found' },
    METHOD_NOT_ALLOWED: { code: 405, message: 'Method Not Allowed' },
    REQUEST_FORMAT_NOT_ALLOWED: { code: 406, message: 'Request Format Not Allowed' },
    REQUEST_CONFLICT: { code: 409, message: 'Request Conflict' },
    FILE_FORMAT_NOT_ALLOWED: { code: 415, message: 'File Format Not Allowed' },
    TOO_MANY_REQUESTS: { code: 429, message: 'Too Many Requests' },
    INTERNAL_SERVER_ERROR: { code: 500, message: 'Internal Server Error' }
};

module.exports = STATUS_CODES;