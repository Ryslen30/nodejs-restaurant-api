// src/repositories/User.repository.js

const BaseRepository = require('./Base.repository');
const UserModel = require('../models/user'); // Assuming path to your User model

class UserRepository extends BaseRepository {
    constructor() {
        super(UserModel); // Inherits CRUD methods for the User model
    }

    // --- Custom Logic for Users ---

    async findByUsername(username) {
        // Used primarily for staff/client login (authentication)
        return this.model.findOne({ username: username })
                         .exec();
    }

    async findStaffByRole(role) {
        // Used by managers (Back Office) to view staff lists
        return this.model.find({ role: role, isActive: true })
                         .exec();
    }
}

module.exports = UserRepository;