const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/back-office/OrderController');
const { authenticateStaff, authorizeRoles } = require('../../../app/middlewares/auhtenticationMiddleware');

// Routes defined here will be mounted under /api/staff/kitchen

// GET /pending - Kitchen View Dashboard (JSON)
// FULL PATH: /api/staff/kitchen/pending
router.get(
    '/pending', 
    authenticateStaff, 
    authorizeRoles(['cook', 'manager', 'admin']), 
    orderController.getPendingOrders
);

// PUT /orders/:orderId/status - Update order status (Staff Action)
// Note: We use the orders prefix here, but it's mounted under /staff/kitchen
// FULL PATH: /api/staff/kitchen/orders/:orderId/status
router.put(
    '/orders/:orderId/status', 
    authenticateStaff, 
    authorizeRoles(['cook', 'manager', 'waiter', 'admin']), 
    orderController.updateOrderStatus
);

module.exports = router;