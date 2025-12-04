

const CategoryService = require('../../services/categoryService'); 

/**
 * GET /api/staff/categories - Renders the category management dashboard.
 */
exports.showCategories = async (req, res) => {
    try {
        // 1. Fetch all categories
        const categoriesData = await CategoryService.getAllCategories(); 
        
        // 2. Render the EJS view (you would need a new 'categories-management.ejs' file)
        res.render('staff/categories', { 
            categories: categoriesData, 
            user: req.user,
            currentPage: 'categories',
            message: req.query.message
        });
    } catch (error) {
        console.error('Error fetching ALL categories:', error);
        
        // Handle errors during data fetching
        res.status(500).render('staff/error', { error: 'Failed to load category data.' });
    }
};

// --- CRUD API Endpoints ---

/**
 * POST /api/staff/categories - Create new category
 */
// File: src/controllers/categoryController.js

/**
 * POST /api/staff/categories - Create new category
 */
exports.createCategory = async (req, res) => {
   try {
        // Explicitly extract ONLY the allowed fields.
        const { name, description, isActive } = req.body;
        
        // Pass only the clean, explicitly selected payload to the service
        const newCategory = await CategoryService.createCategory({ 
            name, 
            description, 
            // Ensure isActive is converted to the correct type if necessary
            isActive: isActive === 'true' || isActive === true
        });
        
    } catch (error) {
        console.error('Category Creation Failed:', error);
        
        // 3. Handle error responses
        let statusCode = error.statusCode || 400; // Use custom status code from service if available
        let message = 'Failed to create category';
        
        // Check 1: MongoDB Duplicate Key Error (Unique Constraint)
        if (error.code === 11000) { 
            message = 'A category with this name already exists.';
            statusCode = 409; // Use 409 Conflict for resource duplication
        } 
        // Check 2: Mongoose Validation Errors (e.g., 'name is required')
        else if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            message = errors.join('; ');
            statusCode = 400; 
        } else {
            // Fallback: Use the specific error message thrown by the Service
            message = error.message; 
        }
        
        // Final response to the client
        res.status(statusCode).json({ 
            message: message, 
            error: error.message 
        });
    }
};

/**
 * PUT /api/staff/categories/:id - Update category
 */
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, isActive } = req.body;
        const updates = { name, description, isActive };

        const updatedCategory = await CategoryService.updateCategory(id, updates);
        
        res.json({ 
            message: `Category '${updatedCategory.name}' updated successfully`, 
            category: updatedCategory 
        });
        
    } catch (error) {
        let statusCode = error.statusCode || 400; 
        let message = 'An unknown error occurred during update.';
        
        if (error.code === 11000) {
            // Duplicate key error (e.g., category name already exists)
            statusCode = 409; 
            message = 'A category with this name already exists. Please choose a different name.';
        } else if (error.name === 'ValidationError') {
            // Mongoose validation error (e.g., missing required field)
            statusCode = 400; 
            message = error.message; 
        } else if (error.message.includes('not found')) {
            // CategoryService might throw an error if the ID doesn't exist
            statusCode = 404; 
            message = 'Category not found.';
        }
        
        // 🚨 CRITICAL: Always return JSON for non-2xx status codes
        // This prevents the server from sending an HTML error page, which causes the SyntaxError on the client.
        res.status(statusCode).json({ 
            message: message, // Human-readable error
            error: error.message // Detailed internal error for logging
        });
    }
};

/**
 * DELETE /api/staff/categories/:id - Delete category
 * Note: Redirects are used here for the full page refresh UX after deletion.
 */
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Controller calls the service function
        const deletedCategory = await CategoryService.deleteCategoryById(id); 
        
        // Redirect to the categories list with a success message
        return res.redirect(`/api/staff/categories?message=Category '${deletedCategory.name}' deleted successfully.`);

    } catch (error) {
        console.error('Failed to delete category:', error.message);
        
        // Handle errors (e.g., 404 Not Found or 409 Conflict if products are linked)
        let message = error.message;
        
        res.redirect(`/api/staff/categories?message=Error deleting category: ${message}`);
    }
};