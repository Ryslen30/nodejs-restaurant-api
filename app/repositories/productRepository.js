// src/repositories/Product.repository.js

const BaseRepository = require('./baseRepository');
const ProductModel = require('../models/product');

class ProductRepository extends BaseRepository {
    constructor() {
        super(ProductModel); // Pass the Mongoose Product model to the BaseRepository
    }

    // --- Custom Logic for Products ---

    async findActiveMenu(categoryIds) {
        // Method needed by the Front Office to display the menu
        return this.model.find({
            isAvailable: true, // Only show items marked as available
            category: { $in: categoryIds } // Only show items in active categories
        })
        .populate('category', 'name') // Populate the category reference but only fetch the name
        .exec();
    }

    async findBoxComponents(boxProductIds) {
        // Method to fetch details for items included in a box/combo
        return this.model.find({
            _id: { $in: boxProductIds }
        });
    }

    // Note: The basic findById, create, updateById are inherited from BaseRepository
}

module.exports = ProductRepository;