const express = require('express');
const router = express.Router();
const paymentController = require('../../../controllers/backOffice/Payment.controller');
const { authenticateStaff, authorizeRoles } = require('../../../middlewares/Auth.middleware');

// Routes defined here will be mounted under /api/staff/orders

// POST /:orderId/pay/cash - Mark as paid cash (JSON)
// FULL PATH: /api/staff/orders/:orderId/pay/cash
router.post(
    '/:orderId/pay/cash',
    authenticateStaff,
    authorizeRoles(['waiter', 'manager', 'admin']),
    paymentController.payWithCash
);

// POST /:orderId/pay/card - Initiate card payment (JSON)
// FULL PATH: /api/staff/orders/:orderId/pay/card
router.post(
    '/:orderId/pay/card',
    authenticateStaff,
    authorizeRoles(['waiter', 'manager', 'admin']),
    paymentController.initiateCardPayment
);

module.exports = router;