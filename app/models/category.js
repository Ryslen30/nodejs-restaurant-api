const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true,
        default: " No description provided."
    },
    isActive: {
        type: Boolean,
        default: true // Used to quickly hide a category from the menu
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', CategorySchema);