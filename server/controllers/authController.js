const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "dev_secret_change_me", {
    expiresIn: "12h",
  });
}

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    const err = new Error("Invalid email or password.");
    err.statusCode = 401;
    throw err;
  }

  const token = signToken(user);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// POST /api/auth/demo-login  — Section 6: "demo accounts if full auth is not implemented"
// Body: { role: "control_center" | "emergency_services" | "hospital" | "citizen" }
exports.demoLogin = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const validRoles = ["control_center", "emergency_services", "hospital", "citizen"];

  if (!validRoles.includes(role)) {
    const err = new Error("Invalid role for demo login.");
    err.statusCode = 400;
    throw err;
  }

  let user = await User.findOne({ role, isDemoAccount: true });
  if (!user) {
    // Auto-provision a demo user on first use so seeding isn't required for this path
    const demoPasswordHash = await bcrypt.hash("demo-password", 10);
    user = await User.create({
      name: `Demo ${role.replace("_", " ")}`,
      email: `demo-${role}@resqroute.app`,
      passwordHash: demoPasswordHash,
      role,
      isDemoAccount: true,
    });
  }

  const token = signToken(user);
  res.json({ token, user: { id: user._id, name: user.name, role: user.role, isDemoAccount: true } });
});
