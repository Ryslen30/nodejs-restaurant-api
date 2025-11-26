const express = require('express');
const router = express.Router();
const menuController = require('../../../controllers/backOffice/Menu.controller');
const { authenticateStaff, authorizeRoles } = require('../../../middlewares/Auth.middleware');

// Routes defined here will be mounted under /api/staff/menu

// GET / - Renders the menu management EJS page
// FULL PATH: /api/staff/menu
router.get(
    '/', 
    authenticateStaff, 
    authorizeRoles(['manager', 'admin']), 
    menuController.renderMenuManagement
);

// PUT /availability/:productId - Toggles product availability (JSON)
// FULL PATH: /api/staff/menu/availability/:productId
router.put(
    '/availability/:productId', 
    authenticateStaff, 
    authorizeRoles(['manager', 'admin']), 
    menuController.toggleProductAvailability
);

module.exports = router;