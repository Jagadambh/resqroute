const express = require("express");
const router = express.Router();
const { getCameras, getCameraById, postAnalyzeCamera } = require("../controllers/cameraController");

router.get("/", getCameras);
router.get("/:id", getCameraById);
router.post("/:id/analyze", postAnalyzeCamera);

module.exports = router;
