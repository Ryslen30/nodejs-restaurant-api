// src/repositories/Category.repository.js

const BaseRepository = require('./baseRepository');
const CategoryModel = require('../models/category'); // Assuming path to your Category model

class CategoryRepository extends BaseRepository {
    constructor() {
        super(CategoryModel); // Inherits CRUD methods for the Category model
    }

    // --- Custom Logic for Categories ---

    async findActiveCategories() {
        // Method to fetch categories currently displayed on the menu (Front Office)
        return this.model.find({ isActive: true })
                         .select('name description') // Only fetch necessary fields for display
                         .exec();
    }
}

module.exports = new CategoryRepository;