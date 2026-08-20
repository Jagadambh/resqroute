const Incident = require("../models/Incident");
const asyncHandler = require("../utils/asyncHandler");
const { generateId } = require("../utils/idGenerator");
const { createNotification } = require("../services/notificationService");

// POST /api/reports/citizen
// Citizen-submitted emergency report -> becomes an Incident with source "citizen_report"
exports.postCitizenReport = asyncHandler(async (req, res) => {
  const { type, location, latitude, longitude, description, photoUrl, videoUrl, reportedBy } = req.body;

  if (!type || !location || latitude == null || longitude == null) {
    const err = new Error("type, location, latitude, and longitude are required.");
    err.statusCode = 400;
    throw err;
  }

  const incident = await Incident.create({
    incidentId: generateId("INC"),
    type,
    location,
    latitude,
    longitude,
    severity: "medium", // default until control center or AI triage updates it
    source: "citizen_report",
    description,
    photoUrl,
    videoUrl,
    reportedBy,
    status: "new",
    isSimulated: true,
  });

  const io = req.app.get("io");
  io.emit("incident:new", incident);

  await createNotification(io, {
    recipientRole: "control_center",
    type: "incident_detected",
    message: `Citizen report received: ${type.replace("_", " ")} at ${location}.`,
    relatedIncident: incident._id,
  });

  res.status(201).json({
    incidentId: incident.incidentId,
    status: "AI_ANALYSIS",
    message: "Your report has been forwarded to the ResQRoute control center.",
  });
});
