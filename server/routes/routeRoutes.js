const express = require("express");
const router = express.Router();
const { postOptimizeRoute } = require("../controllers/routeController");

router.post("/optimize", postOptimizeRoute);

module.exports = router;
