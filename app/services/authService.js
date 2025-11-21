
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 
const UserRepository = require('../repositories/User.repository');


const JWT_SECRET = process.env.JWT_SECRET 
const SALT_ROUNDS = 10; 

class AuthService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    // --- Helper Methods (Business Logic) ---

    /**
     * Hashes a plain text password for secure storage.
     * @param {string} password - The plain text password.
     */
    async hashPassword(password) {
        return bcrypt.hash(password, SALT_ROUNDS);
    }

    /**
     * Compares a plain text password with a stored hash.
     * @param {string} password - The plain text password from login attempt.
     * @param {string} hash - The hashed password from the database.
     */
    async comparePassword(password, hash) {
        return bcrypt.compare(password, hash);
    }

    /**
     * Creates a secure JWT token containing user info.
     * @param {object} user - The user object from the database.
     */
    generateToken(user) {
        // Business Rule: Only include safe, non-sensitive data in the token payload
        const payload = {
            id: user._id,
            username: user.username,
            role: user.role // Crucial for authorization checks in middleware
        };
        // Token expires in 2 hours for security
        return jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
    }

    // --- Core Business Logic Methods ---

    /**
     * Handles the staff login process.
     * @param {string} username 
     * @param {string} password 
     */
    async staffLogin(username, password) {
        // 1. Data Access (Repository): Find the user by username
        const user = await this.userRepository.findByUsername(username);

        if (!user || user.role === 'client' || !user.isActive) {
            // Business Rule: Deny access if user doesn't exist, is only a client, or is inactive
            throw new Error('Invalid credentials or unauthorized access.');
        }

        // 2. Business Logic: Verify the password
        const isMatch = await this.comparePassword(password, user.password);

        if (!isMatch) {
            throw new Error('Invalid credentials.');
        }

        // 3. Business Logic: Generate the authentication token
        const token = this.generateToken(user);
        
        // Return token and safe user details
        return { token, user: { id: user._id, username: user.username, role: user.role } };
    }

    /**
     * Creates a new staff user (only accessible by managers/admins).
     * @param {object} userData - User details including plain password and role.
     */
    async createStaffUser(userData) {
        // 1. Business Logic: Hash the password before saving
        const hashedPassword = await this.hashPassword(userData.password);
        
        // 2. Prepare Data
        const staffData = {
            ...userData,
            password: hashedPassword,
            isActive: true 
            // Ensures role is one of the allowed staff roles (waiter, cook, manager, admin)
        };
        
        // 3. Data Access (Repository): Create the new user
        return this.userRepository.create(staffData);
    }
}

module.exports = AuthService;