const express = require("express");
const router = express.Router();
const { login, demoLogin } = require("../controllers/authController");

router.post("/login", login);
router.post("/demo-login", demoLogin);

module.exports = router;
