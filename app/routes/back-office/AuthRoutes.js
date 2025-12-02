const { authenticateStaff }= require ('../../middlewares/auhtenticationMiddleware');

const express = require('express');
const router = express.Router();
const authController = require('../../controllers/back-office/AuthController');

// GET /login - Show login form
router.get('/login', authController.showLoginForm);

// POST /login - Process login
router.post('/login', authController.staffLogin);

router.get('/dashboard', authenticateStaff, authController.showDashboard);

module.exports = router;