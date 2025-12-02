const express = require('express');
const router = express.Router();

// --- FRONT OFFICE IMPORTS ---
const clientMenuRoutes = require('./front-office/MenuRoutes');
const clientOrderRoutes = require('./front-office/OrderRoutes');

// --- BACK OFFICE IMPORTS ---
const staffAuthRoutes = require('./back-office/AuthRoutes');
const staffUserRoutes = require('./back-office/UserRoutes');
const staffKitchenRoutes = require('./back-office/kitchenOrderRoutes');
const staffMenuRoutes = require('./back-office/MenuRoutes');



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
staffRouter.use('/', staffAuthRoutes);

// Auth uses /login directly off /staff
// /staff/users
staffRouter.use('/users', staffUserRoutes);
// /staff/kitchen
staffRouter.use('/kitchen', staffKitchenRoutes); 
// /staff/menu
staffRouter.use('/menu', staffMenuRoutes); 



// --- 3. MOUNT OFFICE SUB-ROUTERS ONTO MAIN ROUTER ---

// Main Route: /api/client
router.use('/client', clientRouter); 
// Main Route: /api/staff
router.use('/staff', staffRouter); 




module.exports = router;