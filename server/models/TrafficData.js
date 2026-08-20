const mongoose = require("mongoose");

const TrafficDataSchema = new mongoose.Schema(
  {
    road: { type: String, required: true }, // e.g. "Ashok Rajpath"
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    density: { type: String, enum: ["low", "medium", "high"], required: true },
    avgSpeedKmph: { type: Number, required: true },
    isSimulated: { type: Boolean, default: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

TrafficDataSchema.index({ road: 1, timestamp: -1 });

module.exports = mongoose.model("TrafficData", TrafficDataSchema);
