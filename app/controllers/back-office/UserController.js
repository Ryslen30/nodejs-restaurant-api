const User = require('../../models/user'); // Your User model
const bcrypt = require('bcrypt');
const userService = require('../../services/user');
const userRepository = require('../../repositories/userRepository');
const UserService = require('../../services/user');

/**
 * POST /api/staff/users - Create new user
 */
exports.createUser = async (req, res) => {
    try {
        // 🛑 FIX: Controller destructures and prepares the exact payload
        const { username, email, password, role, isActive, firstName, lastName } = req.body;
        
        // 🛑 Call the Service with the prepared, raw data (excluding sensitive model details)
        const newUser = await userService.createUser({ 
            username, 
            email, 
            password, 
            role, 
            isActive, 
            firstName, 
            lastName 
        });
        
        // Respond with success message
        res.status(201).json({ 
            message: 'User created successfully', 
            user: newUser 
        });
        
    } catch (error) {
        // Handle error responses
        let statusCode = 400;
        if (error.code === 11000) { 
            error.message = 'Username or email already exists.';
        }
        
        res.status(statusCode).json({ 
            message: 'Failed to create user', 
            error: error.message 
        });
    }
};

/**
 * PUT /api/staff/users/:id - Update user
 */
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // 1. Call the Service layer with the raw data
        const updatedUser = await UserService.updateUser(id, updates);
        
        // The service should handle the "not found" check. 
        // If the service succeeds, we respond with 200/201.
        res.json({ 
            message: 'User updated successfully', 
            user: updatedUser 
        });
        
    } catch (error) {
        // 2. Handle errors thrown by the Service layer
        
        // Check for custom statusCode thrown by the service (e.g., 404 for 'User not found')
        const statusCode = error.statusCode || 400; 

        res.status(statusCode).json({ 
            message: error.statusCode === 404 ? 'User not found' : 'Failed to update user',
            error: error.message 
        });
    }
};

/**
 * DELETE /api/staff/users/:id - Delete user
 */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Controller calls the service function instead of the model directly
        const deletedUser = await userService.deleteUserById(id); 
        
        if (!deletedUser) {
            // Use redirect instead of JSON response if your front-end expects a full page load after deletion
            // If you keep the JSON response, the front-end will need an AJAX call.
            return res.status(404).json({ message: 'User not found' });
        }
        
        // OPTION 1: JSON response (for AJAX/fetch)
        // res.json({ message: 'User deleted successfully', userId: id });

        // OPTION 2: Redirect to the users list with a success message (for form submission)
        return res.redirect('/api/staff/users?message=User deleted successfully.');

    } catch (error) {
        console.error('Failed to delete user:', error.message);
        
        // OPTION 1: JSON response (for AJAX/fetch)
        // res.status(400).json({ message: 'Failed to delete user', error: error.message });

        // OPTION 2: Redirect back to the users list with an error message
        res.redirect('/api/staff/users?message=Error deleting user: ' + error.message);
    }
};

// Example showUsers controller function
exports.showUsers = async (req, res) => {
    try {
        // CALL THE NEW FUNCTION: getAllUsers()
        const usersData = await userService.getAllUsers(); 
        
        // Render the full users view
        res.render('staff/users', {
            users: usersData, 
            user: req.user, 
            currentPage: 'users',
            message: 'All system users loaded successfully.' // Updated message
        });
    } catch (error) {
        console.error('Error fetching ALL users:', error);
        
        // Ensure you have staff/error.ejs or change this to a redirect
        res.status(500).render('staff/error', { error: 'Failed to load user data.' });
    }
};

