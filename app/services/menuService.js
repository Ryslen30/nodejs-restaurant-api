

const CategoryRepository = require('../repositories/categoryRepository');
const ProductRepository = require('../repositories/productRepository');

class MenuService {
    constructor() {
        this.categoryRepository = new CategoryRepository();
        this.productRepository = new ProductRepository();
    }

    // --- Core Business Logic Methods ---

    /**
     * Retrieves the entire filtered menu structure for the Front Office (Client Tablet).
     * @returns {Array} An array of active categories, each containing its active products.
     */
    async getFullActiveMenu() {
        // 1. Business Rule: Fetch only active categories
        const activeCategories = await this.categoryRepository.findActiveCategories();
        
        if (!activeCategories || activeCategories.length === 0) {
            return []; // Return an empty menu if no categories are active
        }

        // Extract the IDs of the active categories for the next query
        const activeCategoryIds = activeCategories.map(cat => cat._id);

        // 2. Business Rule: Fetch only available products within those active categories
        const activeProducts = await this.productRepository.findActiveMenu(activeCategoryIds);

        // 3. Orchestration: Structure the data for the client
        // This is a common service-layer task: restructuring raw database results
        const menuStructure = activeCategories.map(category => {
            const categoryPlain = category.toObject(); // Convert Mongoose document to plain object

            // Filter the master product list for products belonging to this category
            categoryPlain.products = activeProducts
                .filter(product => product.category.toString() === category._id.toString())
                .map(product => {
                    // Remove sensitive or unnecessary fields from the product object sent to the client
                    const productPlain = product.toObject();
                    delete productPlain.isAvailable;
                    delete productPlain.boxComponents;
                    return productPlain;
                });
            
            return categoryPlain;
        });

        return menuStructure;
    }

    /**
     * Toggles the availability status of a single product (used by Back Office/Staff).
     * @param {string} productId 
     * @param {boolean} isAvailable 
     */
    async toggleProductAvailability(productId, isAvailable) {
        // Data Access (Repository): Update the status flag
        const updatedProduct = await this.productRepository.updateById(
            productId,
            { isAvailable: isAvailable }
        );

        if (!updatedProduct) {
            throw new Error('Product not found for status update.');
        }

        return updatedProduct;
    }

    /**
     * Toggles the active status of a single category (used by Back Office/Staff).
     * @param {string} categoryId 
     * @param {boolean} isActive 
     */
    async toggleCategoryActivity(categoryId, isActive) {
        // Data Access (Repository): Update the status flag
        const updatedCategory = await this.categoryRepository.updateById(
            categoryId,
            { isActive: isActive }
        );
        
        // Business Rule: If a category is deactivated, all its products are removed from the menu
        // (This logic is handled implicitly in getFullActiveMenu, but you could add cascading logic here if needed)

        if (!updatedCategory) {
            throw new Error('Category not found for status update.');
        }

        return updatedCategory;
    }
    
    // Other methods would include:
    // - async createProduct(productData)
    // - async updateProduct(productId, productData)
    // - async createCategory(categoryData)
}

module.exports = MenuService;