const mongoose = require("mongoose");

const IncidentSchema = new mongoose.Schema(
  {
    incidentId: { type: String, required: true, unique: true }, // e.g. INC-204
    type: {
      type: String,
      enum: ["accident", "fire", "medical_emergency", "road_block", "traffic_congestion", "other"],
      required: true,
    },
    location: { type: String, required: true }, // human-readable, e.g. "Gandhi Maidan Road"
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      required: true,
    },
    source: {
      type: String,
      enum: ["ai_camera", "citizen_report", "control_center_manual"],
      required: true,
    },
    aiConfidence: { type: Number, min: 0, max: 100 }, // % confidence, only set when source = ai_camera
    isSimulated: { type: Boolean, default: true }, // ALWAYS true in demo/hackathon mode — never claim real detection
    description: { type: String },
    photoUrl: { type: String },
    videoUrl: { type: String },
    status: {
      type: String,
      enum: ["new", "ai_analysis", "dispatched", "en_route", "at_scene", "resolved"],
      default: "new",
    },
    assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: "EmergencyVehicle" },
    assignedHospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    responseTimeSeconds: { type: Number }, // filled in when resolved, drives analytics
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

IncidentSchema.index({ status: 1, severity: 1, createdAt: -1 });

module.exports = mongoose.model("Incident", IncidentSchema);
