const express = require('express');
const router = express.Router();
const authController = require('../../controllers/back-office/AuthController');
const userController = require('../../controllers/back-office/UserController');
const { authenticateStaff, authorizeRoles } = require('../../middlewares/auhtenticationMiddleware');

// Routes defined here will be mounted under /api/staff/users

// POST / - Create new staff user (ADMIN ONLY)
// FULL PATH: /api/staff/users
router.post(
    '/', 
    authenticateStaff, 
    authorizeRoles(['admin']), 
    userController.createUser
);

// GET / - List all  users (ADMIN ONLY)
router.get(
    '/', 
    authenticateStaff, 
    authorizeRoles(['admin']), 
    userController.showUsers
);

router.delete(
    '/:id', 
    authenticateStaff, 
    authorizeRoles(['admin']), 
    userController.deleteUser
);
router.put(
    '/:id',  
    userController.updateUser
);


module.exports = router;