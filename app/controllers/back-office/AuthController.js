const AuthService = require('../../services/authService');

const authService = new AuthService();

/**
 * Handles POST /api/staff/login - Staff Login (JSON)
 */
exports.staffLogin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const result = await authService.staffLogin(username, password);

        // Output: JSON for the Staff Portal's login handler
        res.status(200).json({
            message: 'Login successful.',
            token: result.token,
            user: result.user
        });
    } catch (error) {
        res.status(401).json({ message: 'Login failed: ' + error.message });
    }
};

/**
 * Handles POST /api/staff/users - Creates a new staff user (JSON)
 */
exports.createStaffUser = async (req, res) => {
    try {
        const newUser = await authService.createStaffUser(req.body);

        res.status(201).json({
            message: 'New staff user created successfully.',
            userId: newUser._id
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};