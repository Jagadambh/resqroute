const express = require("express");
const router = express.Router();
const { getVehicles, getVehicleById, updateVehicle } = require("../controllers/vehicleController");

router.get("/", getVehicles);
router.get("/:id", getVehicleById);
router.patch("/:id", updateVehicle);

module.exports = router;
