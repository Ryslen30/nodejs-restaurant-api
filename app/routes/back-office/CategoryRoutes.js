// File: src/routes/back-office/CategoryRoutes.js

const express = require('express');
const router = express.Router();

// Import necessary controllers and middleware
const categoryController = require('../../controllers/back-office/CategoryController'); // Assuming the controller is here
const { authenticateStaff, authorizeRoles } = require('../../middlewares/auhtenticationMiddleware');

// Routes defined here will be mounted under /api/staff/categories

// --- CRUD Operations for Categories ---

/**
 * POST / - Create new category (ADMIN/MANAGER ONLY)
 * FULL PATH: /api/staff/categories
 */
router.post(
    '/', 
    authenticateStaff, 
    authorizeRoles(['admin', 'manager']), // Only authorized roles can create new categories
    categoryController.createCategory
);

/**
 * GET / - List all categories (STAFF ACCESS)
 * All staff need to see categories for product context and ordering.
 * FULL PATH: /api/staff/categories
 */
router.get(
    '/', 
    authenticateStaff, 
    authorizeRoles(['admin', 'manager', 'waiter']), // Allow general staff to view categories
    categoryController.showCategories
);

/**
 * DELETE /:id - Delete a category (ADMIN ONLY)
 * FULL PATH: /api/staff/categories/:id
 */
router.delete(
    '/:id', 
    authenticateStaff, 
    authorizeRoles(['admin']), // Deleting categories is usually an admin-only action due to impact on products
    categoryController.deleteCategory
);

/**
 * PUT /:id - Update a category (ADMIN/MANAGER ONLY)
 * FULL PATH: /api/staff/categories/:id
 */
router.put(
    '/:id',  
    authenticateStaff, 
    authorizeRoles(['admin', 'manager']), // Changing category configuration (name, active status)
    categoryController.updateCategory
);


module.exports = router;