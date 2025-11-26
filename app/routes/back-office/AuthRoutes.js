const express = require('express');
const router = express.Router();
const authController = require('../../../controllers/backOffice/Auth.controller');

// Routes defined here will be mounted under /api/staff

// POST /login - Staff logs in to get a JWT token (PUBLIC)
// FULL PATH: /api/staff/login
router.post('/login', authController.staffLogin);

module.exports = router;