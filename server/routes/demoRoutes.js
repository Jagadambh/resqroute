const express = require("express");
const router = express.Router();
const { postStartDemo } = require("../controllers/demoController");

router.post("/start", postStartDemo);

module.exports = router;
