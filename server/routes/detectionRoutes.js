const express = require("express");
const router = express.Router();
const { postAnalyzeUpload } = require("../controllers/detectionController");

router.post("/analyze", postAnalyzeUpload);

module.exports = router;
