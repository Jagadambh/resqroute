const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["control_center", "emergency_services", "hospital", "citizen"],
      required: true,
    },
    // Optional links to the entity this user represents (e.g. a hospital admin)
    linkedHospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
    linkedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: "EmergencyVehicle" },
    isDemoAccount: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
