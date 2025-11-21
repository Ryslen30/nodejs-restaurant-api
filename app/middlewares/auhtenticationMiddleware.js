
const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET

/**
 * Middleware to authenticate staff using JWT from the Authorization header.
 */
exports.authenticateStaff = (req, res, next) => {
    // 1. Check for Token in Headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    // Extract the token (e.g., "Bearer tokenValue")
    const token = authHeader.split(' ')[1];

    try {
        // 2. Verify and Decode the Token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 3. Attach User Info to Request
        // The decoded payload includes { id, username, role } from the AuthService.generateToken
        req.user = decoded; 
        
        // Proceed to the Controller or next middleware
        next();
    } catch (error) {
        // Token is invalid, expired, or tampered with
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

/**
 * Middleware to check if the authenticated staff user has a specific role (Authorization).
 * @param {Array<string>} roles - Roles allowed to access this route (e.g., ['manager', 'admin']).
 */
exports.authorizeRoles = (roles) => {
    return (req, res, next) => {
        // Ensure authentication has run and user data is attached
        if (!req.user || !req.user.role) {
            return res.status(500).json({ message: 'Authorization error: User data missing.' });
        }

        // Business Rule: Check if the user's role is included in the allowed roles list
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden. Insufficient role permissions.' });
        }

        // Authorization passed
        next();
    };
};