const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        // Hashed password (e.g., via bcrypt, handled in Service layer)
        type: String,
        required: true
    },
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null emails (useful if not all users provide one)
    },
    role: {
        // For staff authorization in Back Office
        type: String,
        enum: ['client', 'waiter', 'cook', 'manager', 'admin'],
        default: 'client'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);