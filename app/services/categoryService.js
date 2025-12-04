// File: src/services/CategoryService.js

// Assuming CategoryRepository is implemented to handle data access for the Category model
const categoryRepository = require('../repositories/categoryRepository'); 
// NOTE: ProductRepository is not needed here, but you may need it 
// later for deletion logic (i.e., preventing deletion if products exist).

class CategoryService {

    /**
     * Fetches ALL categories.
     * @returns {Promise<Array>} An array of ALL category documents.
     */
    static async getAllCategories() { 
        // No population needed for Category, as it has no outward references.
        return await categoryRepository.findAll({});
    }
    
    /**
     * Fetches a single category by ID.
     * @param {string} categoryId - The ID of the category.
     * @returns {Promise<Object>} The category document.
     */
    static async getCategoryById(categoryId) {
        // Simple find by ID
        const category = await categoryRepository.findById(categoryId);
        return category;
    }

    /**
     * Creates a new category document.
     * @param {object} data - Contains name, description, isActive.
     * @returns {Promise<Object>} The new category document.
     */
    static async createCategory(data) {
    // data must be clean here: { name: '...', description: '...', isActive: true }
    // Mongoose handles the validation based on its schema and then calls the repository.
    try {
        const newCategory = await categoryRepository.create(data); 
        return newCategory;
    } catch (error) {
        // If the repository uses the base model's .create, 
        // the error is coming from Mongoose trying to insert into the validated collection.
        throw error; // Let the controller handle the Mongoose/MongoServerError
    }
}

    /**
     * Updates an existing category.
     * @param {string} categoryId 
     * @param {Object} updates - Fields to update.
     * @returns {Promise<Object>} The updated category document.
     * @throws {Error} if the category is not found.
     */
    static async updateCategory(categoryId, updates) {
        
        // 1. Data Access: Call the repository's update method
        // Use updates to handle fields like name, description, or isActive.
        const updatedCategory = await categoryRepository.updateById(categoryId, updates);

        // 2. Business Rule: Check if the category was actually updated (found)
        if (!updatedCategory) {
            const error = new Error('Category not found');
            error.statusCode = 404; // Custom property for the controller
            throw error;
        }

        return updatedCategory;
    }

    /**
     * Deletes a category by ID.
     * * NOTE: A robust implementation should check if any Products still reference this Category ID 
     * before deletion (preventing orphaned product documents or violating referential integrity).
     * * @param {string} categoryId 
     * @returns {Promise<Object>} The deleted category document.
     * @throws {Error} if the category is not found or has existing products.
     */
    static async deleteCategoryById(categoryId) {
        
        // --- Optional Robustness Check (Recommended) ---
        /*
        // Assuming you have access to productRepository here:
        const ProductRepository = require('../repositories/productRepository');
        const productsCount = await ProductRepository.countDocuments({ category: categoryId });
        
        if (productsCount > 0) {
            const error = new Error(`Cannot delete category: ${productsCount} products still belong to this category.`);
            error.statusCode = 409; // Conflict
            throw error;
        }
        */
        // -----------------------------------------------

        const deletedCategory = await categoryRepository.deleteById(categoryId);

        if (!deletedCategory) {
            // Throw a specific error that the controller can translate to a 404
            const error = new Error('Category not found.');
            error.statusCode = 404;
            throw error;
        }

        return deletedCategory;
    }
}

module.exports = CategoryService;