const AuthService = require('../../services/authService');

const authService = new AuthService();

// 

/**
 * Handles POST /api/staff/login - Staff Login (Renders EJS)
 */
/**
 * Handles POST /api/staff/login - Staff Login (Returns JSON)
 */
// staffLogin Controller function
exports.staffLogin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        // Render EJS on failure (standard for server-side forms)
        return res.status(400).render('staff/login', { error: 'Username and password are required.', username: username || '' });
    }

    try {
        const result = await authService.staffLogin(username, password);
        
        // 1. SET HTTP-ONLY COOKIE: The browser will automatically attach this to all future requests.
        res.cookie('staffToken', result.token, {
            httpOnly: true,         // ESSENTIAL: Secure, client JS cannot access it
            secure: process.env.NODE_ENV === 'production', // Use 'true' in production (HTTPS required)
            maxAge: 3600000,        // 1 hour expiry (adjust as needed)
            sameSite: 'strict'
        });

        // 2. REDIRECT: Go to the protected dashboard route. The cookie is sent automatically.
        res.redirect('/api/staff/dashboard'); 
        
    } catch (error) {
        // Render EJS on failure
        res.status(401).render('staff/login', { 
            error: 'Login failed: Invalid credentials.',
            username: username || ''
        });
    }
};

// Define this function in your StaffDashboardController.js (or similar file)

exports.showDashboard = async (req, res) => {
    try {
        // req.user contains the decoded JWT payload (id, role, username) 
        // because it was attached by the 'authenticateStaff' middleware 
        // after successfully reading the token from the HTTP-Only Cookie.
        const user = req.user; 
        
        // Render your EJS dashboard view
        res.render('staff/dashboard', {
            message: 'Login successful! Welcome to the Dashboard.',
            user: user,
            currentPage: 'dashboard'
        });

    } catch (error) {
        // This catch block is generally unnecessary if middleware is robust, 
        // but included for completeness.
        console.error('Error rendering dashboard:', error);
        res.redirect('/api/staff/login');
    }
};

/**
 * Handles GET /api/staff/login - Show Login Form
 */
exports.showLoginForm = (req, res) => {
    res.render('staff/login', { 
        error: null,
        username: ''
    });
};

