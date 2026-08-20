const Incident = require("../models/Incident");
const EmergencyVehicle = require("../models/EmergencyVehicle");
const asyncHandler = require("../utils/asyncHandler");
const { generateId } = require("../utils/idGenerator");
const { findNearestAvailableVehicle } = require("../services/dispatchService");
const { createNotification } = require("../services/notificationService");

// GET /api/incidents  (supports ?severity=&status=&type=&from=&to=)
exports.getIncidents = asyncHandler(async (req, res) => {
  const { severity, status, type, from, to } = req.query;
  const filter = {};
  if (severity) filter.severity = severity;
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const incidents = await Incident.find(filter)
    .populate("assignedVehicle", "vehicleId type status")
    .populate("assignedHospital", "name")
    .sort({ createdAt: -1 })
    .limit(200);

  res.json(incidents);
});

// GET /api/incidents/:id
exports.getIncidentById = asyncHandler(async (req, res) => {
  const incident = await Incident.findById(req.params.id)
    .populate("assignedVehicle")
    .populate("assignedHospital");

  if (!incident) {
    const err = new Error("Incident not found.");
    err.statusCode = 404;
    throw err;
  }
  res.json(incident);
});

// POST /api/incidents
// Used by: control center manual entry, AI detection pipeline, citizen report intake
exports.createIncident = asyncHandler(async (req, res) => {
  const { type, location, latitude, longitude, severity, source, aiConfidence, description, photoUrl, videoUrl, reportedBy } = req.body;

  if (!type || !location || latitude == null || longitude == null || !severity || !source) {
    const err = new Error("Missing required incident fields.");
    err.statusCode = 400;
    throw err;
  }

  const incident = await Incident.create({
    incidentId: generateId("INC"),
    type,
    location,
    latitude,
    longitude,
    severity,
    source,
    aiConfidence,
    description,
    photoUrl,
    videoUrl,
    reportedBy,
    isSimulated: true, // demo/hackathon mode — always explicit
    status: "new",
  });

  const io = req.app.get("io");
  io.emit("incident:new", incident);

  await createNotification(io, {
    recipientRole: "control_center",
    type: "incident_detected",
    message: `New ${severity.toUpperCase()} severity ${type.replace("_", " ")} reported at ${location}.`,
    relatedIncident: incident._id,
  });

  // Auto-suggest nearest vehicle (control center still confirms dispatch manually via PATCH)
  const nearest = await findNearestAvailableVehicle(incident);

  res.status(201).json({ incident, suggestedVehicle: nearest });
});

// PATCH /api/incidents/:id
// Used for status transitions and assignment (e.g. dispatching a vehicle)
exports.updateIncident = asyncHandler(async (req, res) => {
  const updates = req.body;
  const incident = await Incident.findById(req.params.id);

  if (!incident) {
    const err = new Error("Incident not found.");
    err.statusCode = 404;
    throw err;
  }

  Object.assign(incident, updates);

  if (updates.status === "resolved" && !incident.resolvedAt) {
    incident.resolvedAt = new Date();
    incident.responseTimeSeconds = Math.round((incident.resolvedAt - incident.createdAt) / 1000);

    if (incident.assignedVehicle) {
      await EmergencyVehicle.findByIdAndUpdate(incident.assignedVehicle, {
        status: "returning",
        currentIncident: null,
      });
    }
  }

  await incident.save();

  const io = req.app.get("io");
  io.emit("incident:updated", incident);

  if (updates.status === "resolved") {
    await createNotification(io, {
      recipientRole: "control_center",
      type: "incident_resolved",
      message: `Incident ${incident.incidentId} at ${incident.location} has been resolved.`,
      relatedIncident: incident._id,
    });
  }

  res.json(incident);
});
