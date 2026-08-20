const mongoose = require("mongoose");

const EmergencyVehicleSchema = new mongoose.Schema(
  {
    vehicleId: { type: String, required: true, unique: true }, // e.g. AMB-102
    type: { type: String, enum: ["ambulance", "fire_truck", "police"], required: true },
    driver: { type: String, required: true },
    status: {
      type: String,
      enum: ["available", "dispatched", "en_route", "at_scene", "returning", "offline"],
      default: "available",
    },
    location: {
      name: { type: String }, // human-readable, e.g. "Tatanagar Railway Station"
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    destination: {
      name: { type: String },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    etaMinutes: { type: Number },
    currentIncident: { type: mongoose.Schema.Types.ObjectId, ref: "Incident" },
    // route currently assigned by the route-optimization engine, as an ordered list of waypoints
    activeRoute: [
      {
        latitude: Number,
        longitude: Number,
      },
    ],
    routeProgress: { type: Number, default: 0 }, // 0-1, used by the simulation engine to interpolate position
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmergencyVehicle", EmergencyVehicleSchema);
