const express = require('express');
const router = express.Router();

// Import necessary controllers and middleware
const orderController = require('../../controllers/back-office/OrderController'); 
const { authenticateStaff, authorizeRoles } = require('../../middlewares/auhtenticationMiddleware');


/**
 * GET / - List all recent orders (STAFF ACCESS)
 * Viewing and monitoring orders is essential for all back-office staff.
 * FULL PATH: /api/staff/orders
 */
router.get(
    '/',
    authenticateStaff,
    authorizeRoles(['admin', 'manager', 'waiter', 'kitchen']), // Kitchen staff also need to see the main order list
    orderController.showOrders
);

/**
 * GET /:id - View detailed information for a single order (STAFF ACCESS)
 * FULL PATH: /api/staff/orders/:id
 */
router.get(
    '/:id',
    authenticateStaff,
    authorizeRoles(['admin', 'manager', 'waiter']), 
    orderController.getOrderDetails // You'll need to implement this method in OrderController.js
);

/**
 * PUT /:id/status - Update order status (KITCHEN/MANAGER/ADMIN ACCESS)
 * This is used to move the order through the workflow (e.g., Pending -> Processing -> Ready).
 * FULL PATH: /api/staff/orders/:id/status
 */
router.put(
    '/:id/status',
    authenticateStaff,
    authorizeRoles(['admin', 'manager', 'kitchen']), // Kitchen staff typically update the status to 'Ready'
    orderController.updateOrderStatus
);

/**
 * DELETE /:id - Cancel/Void an order (ADMIN/MANAGER ONLY)
 * Deleting or voiding completed/incorrect orders should be restricted.
 * FULL PATH: /api/staff/orders/:id
 */
router.delete(
    '/:id',
    authenticateStaff,
    authorizeRoles(['admin', 'manager']), 
    orderController.deleteOrder // You'll need to implement this method in OrderController.js
);

module.exports = router;