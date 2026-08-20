const Incident = require("../models/Incident");
const EmergencyVehicle = require("../models/EmergencyVehicle");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/analytics
// All numbers here are computed from actual stored documents (demo data or real data alike) —
// this endpoint itself does no simulation, it just aggregates whatever is in the DB.
exports.getAnalytics = asyncHandler(async (req, res) => {
  const [incidentsByType, incidentsBySeverity, resolvedIncidents, vehicleUtilization, activeIncidents] =
    await Promise.all([
      Incident.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]),
      Incident.aggregate([{ $group: { _id: "$severity", count: { $sum: 1 } } }]),
      Incident.find({ status: "resolved" }).select("responseTimeSeconds createdAt"),
      EmergencyVehicle.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Incident.countDocuments({ status: { $ne: "resolved" } }),
    ]);

  const avgResponseTimeSeconds = resolvedIncidents.length
    ? Math.round(
        resolvedIncidents.reduce((sum, i) => sum + (i.responseTimeSeconds || 0), 0) / resolvedIncidents.length
      )
    : null;

  // Estimated time saved = sum of (naive-route ETA - optimized-route ETA) across resolved incidents.
  // In demo mode this is approximated as a fixed average saved-per-incident figure (6 min, matching
  // the route optimization example in the product spec) until real route-comparison logs are stored.
  const AVG_MINUTES_SAVED_PER_INCIDENT_DEMO = 6;
  const estimatedTimeSavedMinutes = resolvedIncidents.length * AVG_MINUTES_SAVED_PER_INCIDENT_DEMO;

  res.json({
    incidentsByType,
    incidentsBySeverity,
    avgResponseTimeSeconds,
    vehicleUtilization,
    activeIncidents,
    resolvedCount: resolvedIncidents.length,
    estimatedTimeSavedMinutes,
    note: "estimatedTimeSavedMinutes uses a demo-average-per-incident figure until per-route logging is implemented.",
  });
});
