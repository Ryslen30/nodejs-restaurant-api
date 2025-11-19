const express = require("express");
const router = express.Router();
const kitchenController = require("../app/controllers/kitchenController");

router.get("/dashboard", kitchenController.showDashboard);

module.exports = router;
