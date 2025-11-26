const express = require('express');
const router = express.Router();
const authController = require('../../../controllers/backOffice/Auth.controller');
const { authenticateStaff, authorizeRoles } = require('../../../middlewares/Auth.middleware');

// Routes defined here will be mounted under /api/staff/users

// POST / - Create new staff user (ADMIN ONLY)
// FULL PATH: /api/staff/users
router.post(
    '/', 
    authenticateStaff, 
    authorizeRoles(['admin']), 
    authController.createStaffUser
);

module.exports = router;