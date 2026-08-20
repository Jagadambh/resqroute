const mongoose = require("mongoose");

const HospitalSchema = new mongoose.Schema(
  {
    hospitalId: { type: String, required: true, unique: true },
    name: { type: String, required: true }, // e.g. "Tata Main Hospital (TMH)"
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    emergencyCapacity: { type: Number, required: true }, // total ER beds
    availableBeds: { type: Number, required: true },
    status: { type: String, enum: ["normal", "busy", "critical"], default: "normal" },
    incomingPatients: [
      {
        incident: { type: mongoose.Schema.Types.ObjectId, ref: "Incident" },
        vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "EmergencyVehicle" },
        etaMinutes: Number,
        severity: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hospital", HospitalSchema);
