const express = require('express');
const router = express.Router();
const menuController = require('../../../controllers/frontOffice/Menu.controller');

// Routes defined here will be mounted under /api/client/menu

// GET / - Retrieves the structured menu (JSON)
// FULL PATH: /api/client/menu
router.get('/', menuController.getMenu);

module.exports = router;