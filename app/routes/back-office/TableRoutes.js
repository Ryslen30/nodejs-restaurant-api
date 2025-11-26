const express = require('express');
const router = express.Router();
const tableController = require('../../../controllers/backOffice/Table.controller');
const { authenticateStaff, authorizeRoles } = require('../../../middlewares/Auth.middleware');

// Routes defined here will be mounted under /api/staff/tables

// GET / - Renders the table management EJS page
// FULL PATH: /api/staff/tables
router.get(
    '/', 
    authenticateStaff, 
    authorizeRoles(['manager', 'admin']), 
    tableController.renderTableManagement
);

// PUT /:tableId/reset - Reset table status (JSON)
// FULL PATH: /api/staff/tables/:tableId/reset
router.put(
    '/:tableId/reset', 
    authenticateStaff, 
    authorizeRoles(['manager', 'admin']), 
    tableController.resetTable
);

// POST / - Create new table (JSON)
// FULL PATH: /api/staff/tables
router.post(
    '/', 
    authenticateStaff, 
    authorizeRoles(['manager', 'admin']), 
    tableController.createTable
);

module.exports = router;