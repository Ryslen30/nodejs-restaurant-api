// File: src/controllers/productController.js

const ProductService = require('../../services/productService');
const CategoryService = require('../../services/categoryService'); // Assuming this service exists
const Category = require('../../models/category'); // Assuming Mongoose model for Category

/**
 * GET /api/staff/products - Renders the product management dashboard.
 * Fetches all products (with populated categories) and all available categories for dropdowns.
 */
/**
 * Renders the products management view.
 */


exports.showProducts = async (req, res) => {
    try {
        const products = await ProductService.getAllProducts(); 
        const categories = await Category.find({ isActive: true }).sort('name'); 

        // Renders the page normally on success
        res.render('staff/products', {
            currentPage: 'products',
            products: products,
            categories: categories, 
            message: '' // Set initial message to empty string
        });

    } catch (error) {
        console.error("Error loading products page:", error);
        
        // ⚡ FIX: Render the 'products' view again, but with an explicit error message
        // You still need to fetch categories to avoid the "categories is not defined" error in the EJS template
        try {
            const categories = await Category.find({ isActive: true }).sort('name');
            const products = []; // No products loaded due to error
            
            res.status(500).render('staff/products', {
                currentPage: 'products',
                products: products,
                categories: categories, // Must pass categories to populate the dropdowns
                message: 'Error: Failed to load product data from the server. Please try again.' // Pass the error message
            });
        } catch (innerError) {
             // If categories fails too, fall back to a simple text response
             res.status(500).send('Critical Server Error: Cannot load necessary data.');
        }
    }
};

// --- CRUD API Endpoints ---

/**
 * POST /api/staff/products - Create new product
 */
exports.createProduct = async (req, res) => {
    try {
        // 1. Controller destructures the required payload
        // The EJS form passes: name, price, category, description, isAvailable, isBox
        const newProduct = await ProductService.createProduct(req.body); 
        
        // 2. Respond with success message (201 Created)
        res.status(201).json({ 
            message: 'Product created successfully', 
            product: newProduct 
        });
        
    } catch (error) {
        console.error('Product Creation Failed:', error);
        
        // 3. Handle error responses
        let statusCode = error.statusCode || 400; // Use custom status code from service (e.g., 400 for bad category ID)
        let message = 'Failed to create product';
        
        // Check for MongoDB duplicate key error (if name is unique)
        if (error.code === 11000) { 
            message = 'Product name already exists.';
            statusCode = 409; 
        } 
        // Handle Mongoose Validation Errors
        else if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            message = errors.join('; ');
            statusCode = 400; 
        } else {
            // Use the specific error message thrown by the Service
            message = error.message; 
        }
        
        res.status(statusCode).json({ 
            message: message, 
            error: error.message 
        });
    }
};

/**
 * PUT /api/staff/products/:id - Update product
 */
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // 1. Call the Service layer with the ID and raw data
        const updatedProduct = await ProductService.updateProduct(id, updates);
        
        // 2. Respond with success
        res.json({ 
            message: `Product ${updatedProduct.name} updated successfully`, 
            product: updatedProduct 
        });
        
    } catch (error) {
        // 3. Handle errors thrown by the Service layer
        let statusCode = error.statusCode || 400; 
        let message = 'Failed to update product';

        // Check for MongoDB duplicate key error
        if (error.code === 11000) { 
            message = 'Product name already exists.';
            statusCode = 409; 
        } else if (error.statusCode === 404) {
            message = 'Product not found';
        } else {
            message = error.message; 
        }
        
        res.status(statusCode).json({ 
            message: message,
            error: error.message 
        });
    }
};

/**
 * DELETE /api/staff/products/:id - Delete product
 */
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Controller calls the service function
        const deletedProduct = await ProductService.deleteProductById(id); 
        
        // Redirect to the products list with a success message
        return res.redirect(`/api/staff/products?message=Product ${deletedProduct.name} deleted successfully.`);

    } catch (error) {
        console.error('Failed to delete product:', error.message);
        
        // If the service threw an error (e.g., 404), redirect with an error message
        const message = error.statusCode === 404 ? 'Product not found.' : `Error deleting product: ${error.message}`;

        res.redirect(`/api/staff/products?message=${message}`);
    }
};