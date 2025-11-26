const express = require('express');
const router = express.Router();
const orderController = require('../../../controllers/frontOffice/Order.controller');
const { identifyTable } = require('../../../middlewares/IP.middleware');

// Routes defined here will be mounted under /api/client/orders

// POST / - Submits a new order from a tablet (JSON)
// FULL PATH: /api/client/orders
router.post('/', identifyTable, orderController.createOrder);

// GET /current - Allows the client to view their current open order (JSON)
// FULL PATH: /api/client/orders/current
router.get('/current', identifyTable, orderController.getCurrentOrder);


module.exports = router;