const express = require("express");
const router = express.Router();
const { getTraffic } = require("../controllers/trafficController");

router.get("/", getTraffic);

module.exports = router;
