const express = require('express');
const router = express.Router();
const userController = require('../../controllers/back-office/UserController');


router.post(
    '/', 
    userController.createUser
);