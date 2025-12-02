
const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET

/**
 * Middleware to authenticate staff using JWT from the Authorization header.
 */
/**
 * Middleware to authenticate staff using JWT from the HTTP-Only Cookie.
 */
exports.authenticateStaff = (req, res, next) => {
    // 1. Check for Token in Cookies
    const token = req.cookies.staffToken; 

    if (!token) {
        // No token found. Clear any stale cookie and redirect to login.
        res.clearCookie('staffToken'); 
        // Redirect to your login view (adjust the path if needed)
        return res.status(401).redirect('/api/staff/login?error=Session required.'); 
    }

    try {
        // 2. Verify and Decode the Token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 3. Attach User Info to Request
        req.user = decoded; 
        
        next(); // Token is valid, proceed to controller (e.g., showUsers)
    } catch (error) {
        // Token is invalid or expired - clear cookie and redirect
        res.clearCookie('staffToken');
        return res.status(401).redirect('/api/staff/login?error=Session expired.');
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