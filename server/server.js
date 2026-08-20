require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const incidentRoutes = require("./routes/incidentRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const trafficRoutes = require("./routes/trafficRoutes");
const routeRoutes = require("./routes/routeRoutes");
const reportRoutes = require("./routes/reportRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const cameraRoutes = require("./routes/cameraRoutes");
const demoRoutes = require("./routes/demoRoutes");
const authRoutes = require("./routes/authRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const detectionRoutes = require("./routes/detectionRoutes");

const errorHandler = require("./middleware/errorHandler");
const registerSocketHandlers = require("./sockets");

const app = express();
const server = http.createServer(app);

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN, methods: ["GET", "POST"] },
});

// Make io accessible inside controllers via req.app.get("io")
app.set("io", io);

app.use(helmet());
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: "5mb" })); // allows base64 demo photo/video uploads
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ---------- Routes ----------
app.get("/api/health", (req, res) => res.json({ status: "ok", service: "resqroute-server" }));

app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/traffic", trafficRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/cameras", cameraRoutes);
app.use("/api/demo", demoRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/detection", detectionRoutes);

app.use((req, res) => res.status(404).json({ error: "Route not found" }));
app.use(errorHandler);

// ---------- Socket.IO ----------
registerSocketHandlers(io);

// ---------- DB + boot ----------
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

async function start() {
  try {
    if (!MONGO_URI) {
      console.warn("⚠ MONGO_URI not set — server will start but DB routes will fail until configured.");
    } else {
      await mongoose.connect(MONGO_URI);
      console.log("✅ MongoDB connected");
    }
    server.listen(PORT, () => console.log(`🚑 ResQRoute server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
}

start();

module.exports = { app, server, io };
