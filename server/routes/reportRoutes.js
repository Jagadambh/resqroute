const express = require("express");
const router = express.Router();
const { postCitizenReport } = require("../controllers/reportController");

router.post("/citizen", postCitizenReport);

module.exports = router;
