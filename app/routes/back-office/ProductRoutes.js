const express = require('express');
const router = express.Router();

// Import necessary controllers and middleware
const productController = require('../../controllers/back-office/ProductController'); // Assuming the controller is here
const { authenticateStaff, authorizeRoles } = require('../../middlewares/auhtenticationMiddleware');



/**
 * POST / - Create new product (ADMIN/MANAGER ONLY)
 * FULL PATH: /api/staff/products
 */
router.post(
    '/', 
    authenticateStaff, 
    authorizeRoles(['admin', 'manager']), // Restrict creation to appropriate roles
    productController.createProduct
);

/**
 * GET / - List all products (STAFF ACCESS)
 * Viewing the product list is essential for all staff, especially for order taking.
 * FULL PATH: /api/staff/products
 */
router.get(
    '/', 
    authenticateStaff, 
    authorizeRoles(['admin', 'manager', 'waiter']), // Allow general staff (waiters) to view products
    productController.showProducts
);

/**
 * DELETE /:id - Delete a product (ADMIN ONLY)
 * FULL PATH: /api/staff/products/:id
 */
router.delete(
    '/:id', 
    authenticateStaff, 
    authorizeRoles(['admin']), // Deleting inventory items is usually an admin-only action
    productController.deleteProduct
);

/**
 * PUT /:id - Update a product (ADMIN/MANAGER ONLY)
 * FULL PATH: /api/staff/products/:id
 */
router.put(
    '/:id',  
    authenticateStaff, 
    authorizeRoles(['admin', 'manager']), // Updating pricing, category, or availability
    productController.updateProduct
);


module.exports = router;