// File: src/routes/back-office/TableRoutes.js

const express = require('express');
const router = express.Router();

// Import necessary controllers and middleware
const tableController = require('../../controllers/back-office/TableController'); // Assuming the controller is here
const { authenticateStaff, authorizeRoles } = require('../../middlewares/auhtenticationMiddleware');

// Routes defined here will be mounted under /api/staff/tables

// --- CRUD Operations for Tables ---

/**
 * POST / - Create new table (ADMIN/MANAGER ONLY)
 * FULL PATH: /api/staff/tables
 */
router.post(
    '/', 
    authenticateStaff, 
    authorizeRoles(['admin', 'manager']), // Restrict creation to appropriate roles
    tableController.createTable
);

/**
 * GET / - List all tables (STAFF ACCESS)
 * This is often used for the main table status dashboard.
 * FULL PATH: /api/staff/tables
 */
router.get(
    '/', 
    authenticateStaff, 
    authorizeRoles(['admin', 'manager', 'waiter']), // Allow general staff to view table status
    tableController.showTables
);

/**
 * DELETE /:id - Delete a table (ADMIN ONLY)
 * FULL PATH: /api/staff/tables/:id
 */
router.delete(
    '/:id', 
    authenticateStaff, 
    authorizeRoles(['admin']), // Deleting a table configuration is usually admin-level
    tableController.deleteTable
);

/**
 * PUT /:id - Update a table (ADMIN/MANAGER ONLY)
 * FULL PATH: /api/staff/tables/:id
 */
router.put(
    '/:id',  
    authenticateStaff, 
    authorizeRoles(['admin', 'manager']), // Changing table config (number, IP) is usually admin/manager
    tableController.updateTable
);


module.exports = router;