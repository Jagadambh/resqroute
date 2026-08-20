const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    recipientRole: {
      type: String,
      enum: ["control_center", "emergency_services", "hospital", "citizen", "all"],
      required: true,
    },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional, for targeted notifications
    type: {
      type: String,
      enum: [
        "incident_detected",
        "vehicle_dispatched",
        "traffic_congestion",
        "hospital_notified",
        "incident_resolved",
      ],
      required: true,
    },
    message: { type: String, required: true },
    relatedIncident: { type: mongoose.Schema.Types.ObjectId, ref: "Incident" },
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Notification", NotificationSchema);
