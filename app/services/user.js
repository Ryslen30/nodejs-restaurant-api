const { updateUser } = require('../controllers/back-office/UserController');
const UserRepository = require('../repositories/userRepository');
bcrypt = require('bcrypt');



class UserService {

    /**
     * Fetches ALL users, ensuring sensitive data like passwords are excluded.
     * @returns {Promise<Array>} An array of ALL user documents.
     */
    static async getAllUsers() { 
        // Call the specific repository method that handles safety (password exclusion)
        return await UserRepository.findAll();
    }

    /**
     * Deletes a user by ID using the inherited method.
     * @param {string} userId 
     * @returns {Promise<Object|null>} The deleted user or null.
     */
    static async deleteUserById(userId) {
        // Call the inherited deleteById method
        const deletedUser = await UserRepository.deleteById(userId);
        
        if (!deletedUser) {
            throw new Error('User not found.'); 
        }

        return deletedUser;
    }
    
    /**
     * Example: Get a user by ID using the inherited findById method.
     */
    static async getUserById(userId) {
        // We exclude the password here in the service layer if the repository's findById returns all fields
        const user = await UserRepository.findById(userId);
        
        if (user && user.password) {
            // OPTIONAL: Manually remove the password field if you retrieve all fields
            user.password = undefined;
        }
        
        return user;
    }

/**
     * Hashes the password and constructs the final user object for the repository.
     */
    static async createUser({ username, email, password, role, isActive, firstName, lastName }) {
        // 1. Business Logic: Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. Prepare the clean data structure for the Repository
        const userToCreate = {
            username,
            email,
            password: hashedPassword, // Store the hash under the 'password' field
            role,
            isActive,
            firstName,
            lastName,
        };

        // 3. Data Access: Call the Repository's inherited create method
        const newUser = await UserRepository.create(userToCreate);

        // Remove the hash before returning
        const userObject = newUser.toObject ? newUser.toObject() : newUser;
        delete userObject.password;
        
        return userObject;
    }

static async updateUser(userId, updates) {
        // Create a copy of updates to avoid modifying the original req.body directly
        const updatesToApply = { ...updates }; 

        // 1. Business Logic: If password is provided, hash it
        if (updatesToApply.password) {
            updatesToApply.password = await bcrypt.hash(updatesToApply.password, 10);
        }

        // 2. Data Access: Call the repository/model to perform the update
        const updatedUser = await UserRepository.updateById(userId, updatesToApply);
        
        // 3. Business Rule: Check if the user was actually updated (found)
        if (!updatedUser) {
             // Throw a specific error that the controller can translate to a 404
             const error = new Error('User not found');
             error.statusCode = 404; // Custom property for the controller
             throw error; 
        }
        
        return updatedUser;
    }
}

module.exports = UserService;