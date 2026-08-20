const express = require("express");
const router = express.Router();
const {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
} = require("../controllers/incidentController");

router.get("/", getIncidents);
router.get("/:id", getIncidentById);
router.post("/", createIncident);
router.patch("/:id", updateIncident);

module.exports = router;
