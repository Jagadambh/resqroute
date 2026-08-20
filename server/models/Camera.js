const mongoose = require("mongoose");

const CameraSchema = new mongoose.Schema(
  {
    cameraId: { type: String, required: true, unique: true }, // e.g. CAM-001
    location: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    status: { type: String, enum: ["online", "offline"], default: "online" },
    feedUrl: { type: String }, // demo video/image path, clearly not a live CCTV feed
    lastAnalysis: {
      vehicles: Number,
      pedestrians: Number,
      accidentProbability: Number, // 0-100
      crowdDensity: { type: String, enum: ["low", "medium", "high"] },
      trafficLevel: { type: String, enum: ["low", "medium", "high"] },
      analyzedAt: Date,
    },
    isSimulated: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Camera", CameraSchema);
