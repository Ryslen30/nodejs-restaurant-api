const express = require('express');
const router = express.Router();

// --- FRONT OFFICE IMPORTS ---
const clientMenuRoutes = require('./frontOffice/Menu.routes');
const clientOrderRoutes = require('./frontOffice/Order.routes');

// --- BACK OFFICE IMPORTS ---
const staffAuthRoutes = require('./backOffice/Auth.routes');
const staffUserRoutes = require('./backOffice/User.routes');
const staffKitchenRoutes = require('./backOffice/Kitchen.routes');
const staffMenuRoutes = require('./backOffice/Menu.routes');
const staffTableRoutes = require('./backOffice/Table.routes');
const staffPaymentRoutes = require('./backOffice/Payment.routes');


// --- 1. SETUP SUB-ROUTERS FOR OFFICE SEGMENTATION ---

const clientRouter = express.Router();
const staffRouter = express.Router();


// --- 2. MOUNT GRANULAR MODULES ONTO OFFICE SUB-ROUTERS ---

// FRONT OFFICE MODULES (Prefixes applied here)
// /client/menu
clientRouter.use('/menu', clientMenuRoutes); 
// /client/orders
clientRouter.use('/orders', clientOrderRoutes); 


// BACK OFFICE MODULES (Prefixes applied here)
// /staff/login
staffRouter.use('/', staffAuthRoutes); // Auth uses /login directly off /staff
// /staff/users
staffRouter.use('/users', staffUserRoutes);
// /staff/kitchen
staffRouter.use('/kitchen', staffKitchenRoutes); 
// /staff/menu
staffRouter.use('/menu', staffMenuRoutes); 
// /staff/tables
staffRouter.use('/tables', staffTableRoutes); 
// /staff/orders/pay (Payment routes are nested under /orders)
staffRouter.use('/orders', staffPaymentRoutes);


// --- 3. MOUNT OFFICE SUB-ROUTERS ONTO MAIN ROUTER ---

// Main Route: /api/client
router.use('/client', clientRouter); 
// Main Route: /api/staff
router.use('/staff', staffRouter); 


module.exports = router;