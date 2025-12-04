
const productRepository = require('../repositories/productRepository');
const categoryRepository = require('../repositories/categoryRepository'); 
// Assuming a category repository exists for checking category ID validity

class ProductService {

    /**
     * Fetches ALL products and populates the linked Category document.
     * @returns {Promise<Array>} An array of ALL product documents with populated category fields.
     */
    static async getAllProducts() {
        // Define the field to populate: 'category'
        const populateField = 'category';
        return await productRepository.findAll({}, populateField);
    }

    // --- CRUD Operations ---

    /**
     * Fetches a single product by ID and populates the Category document.
     * @param {string} productId - The ID of the product.
     * @returns {Promise<Object>} The product document with populated category.
     */
    static async getProductById(productId) {
        // 1. Define the population path.
        const populateOptions = 'category';

        // 2. Call the repository, passing the populate option
        const product = await productRepository.findOne({ _id: productId }, populateOptions);

        return product;
    }

    /**
     * Constructs and creates a new product document.
     * @param {object} data - Contains name, price, description, category (Category ID), isAvailable, isBox.
     * @returns {Promise<Object>} The new product document.
     * @throws {Error} if the category is not found.
     */
    static async createProduct(data) {
        
        const { category } = data;

        // 1. Business Logic: Category ID must be provided and exist (Referential Integrity)
        if (!category) {
            const error = new Error('Category ID is required to create a product.');
            error.statusCode = 400; // Bad Request
            throw error;
        }

        // 2. Validate existence of the Category ID
        // Ensure the ID exists before Mongoose attempts to save the reference.
        const categoryExists = await categoryRepository.findById(category);

        if (!categoryExists) {
            // Throw a structured error if the category ID is invalid or non-existent
            const error = new Error(`Category ID ${category} does not exist. Cannot assign to product.`);
            error.statusCode = 400; // Bad Request
            throw error;
        }

        // 3. Data Access: Call the Repository's create method
        const newProduct = await productRepository.create(data);

        return newProduct;
    }

    /**
     * Updates an existing product.
     * @param {string} productId 
     * @param {Object} updates - Fields to update (name, price, category, etc.).
     * @returns {Promise<Object>} The updated product document.
     * @throws {Error} if the product is not found or the new category is invalid.
     */
    static async updateProduct(productId, updates) {
        
        const { category } = updates;

        // 1. Business Logic: Validate existence of the new Category ID, if provided
        if (category) {
            const categoryExists = await categoryRepository.findById(category);

            if (!categoryExists) {
                // If the new category ID is invalid, throw a structured error
                const error = new Error(`Category ID ${category} does not exist. Cannot update product.`);
                error.statusCode = 400; // Bad Request
                throw error;
            }
        }

        // 2. Data Access: Call the repository's update method
        // Products usually use a simple update (Mongoose $set default) as the category is required, 
        // unlike the optional ipAddress which needed special $unset logic.
        const updatedProduct = await productRepository.updateById(productId, updates);

        // 3. Business Rule: Check if the product was actually updated (found)
        if (!updatedProduct) {
            const error = new Error('Product not found');
            error.statusCode = 404; // Custom property for the controller
            throw error;
        }

        return updatedProduct;
    }

    /**
     * Deletes a product by ID.
     * @param {string} productId 
     * @returns {Promise<Object>} The deleted product document.
     * @throws {Error} if the product is not found.
     */
    static async deleteProductById(productId) {
        const deletedProduct = await productRepository.deleteById(productId);

        if (!deletedProduct) {
            // Throw a specific error that the controller can translate to a 404
            const error = new Error('Product not found.');
            error.statusCode = 404;
            throw error;
        }

        return deletedProduct;
    }
}

module.exports = ProductService;