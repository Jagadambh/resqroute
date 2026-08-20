const Incident = require("../models/Incident");
const EmergencyVehicle = require("../models/EmergencyVehicle");
const Hospital = require("../models/Hospital");
const asyncHandler = require("../utils/asyncHandler");
const { generateId } = require("../utils/idGenerator");
const { findNearestAvailableVehicle } = require("../services/dispatchService");
const { optimizeRoute } = require("../services/routeService");
const { createNotification } = require("../services/notificationService");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// POST /api/demo/start
// Runs the canonical "road accident" scenario end-to-end, emitting demo:step events
// so the frontend can animate the Section 21 workflow in near-real time.
exports.postStartDemo = asyncHandler(async (req, res) => {
  const io = req.app.get("io");

  // Respond immediately; the scenario plays out asynchronously via Socket.IO events
  // so the frontend can show a live animated sequence rather than waiting on one big response.
  res.status(202).json({ message: "Demo scenario started.", isSimulated: true });

  io.emit("demo:start", { step: 0, label: "Demo scenario starting" });

  try {
    // STEP 1 — Accident detected (Bistupur Chowk, Jamshedpur — matches spec example)
    const incident = await Incident.create({
      incidentId: generateId("INC"),
      type: "accident",
      location: "Bistupur Chowk, Jamshedpur",
      latitude: 22.7995,
      longitude: 86.1850,
      severity: "high",
      source: "ai_camera",
      aiConfidence: 94,
      status: "new",
      isSimulated: true,
    });
    io.emit("incident:new", incident);
    io.emit("demo:step", { step: 1, label: "🚨 Accident detected", incident });
    await sleep(1200);

    // STEP 2 — AI analyzes severity (already computed above; emit as its own beat for the UI)
    io.emit("demo:step", { step: 2, label: "🤖 AI analyzing severity", incident });
    await sleep(1200);

    // STEP 3 — Location identified
    io.emit("demo:step", { step: 3, label: "📍 Location identified", location: incident.location });
    await sleep(1000);

    // STEP 4 — Nearest ambulance found
    const nearest = await findNearestAvailableVehicle(incident);
    if (!nearest) {
      io.emit("demo:step", { step: 4, label: "⚠ No available ambulance found", error: true });
      return;
    }
    io.emit("demo:step", { step: 4, label: "🚑 Nearest ambulance found", vehicle: nearest.vehicle, etaMinutes: nearest.etaMinutes });
    await sleep(1200);

    // STEP 5 — AI recommends optimal route
    const hospital = await Hospital.findOne();
    const route = await optimizeRoute({
      origin: nearest.vehicle.location,
      destination: hospital ? { latitude: hospital.latitude, longitude: hospital.longitude } : incident,
      incidentSeverity: incident.severity,
    });
    io.emit("demo:step", { step: 5, label: "🧠 AI recommends optimal route", route });
    await sleep(1200);

    // STEP 6 — Ambulance dispatched
    incident.assignedVehicle = nearest.vehicle._id;
    incident.assignedHospital = hospital?._id;
    incident.status = "dispatched";
    await incident.save();

    nearest.vehicle.status = "dispatched";
    nearest.vehicle.currentIncident = incident._id;
    nearest.vehicle.destination = hospital
      ? { name: hospital.name, latitude: hospital.latitude, longitude: hospital.longitude }
      : undefined;
    nearest.vehicle.etaMinutes = nearest.etaMinutes;
    nearest.vehicle.routeProgress = 0;
    await nearest.vehicle.save();

    io.emit("vehicle:status", nearest.vehicle);
    io.emit("incident:updated", incident);
    io.emit("demo:step", { step: 6, label: "🚑 Ambulance dispatched", vehicle: nearest.vehicle });
    await createNotification(io, {
      recipientRole: "emergency_services",
      type: "vehicle_dispatched",
      message: `${nearest.vehicle.vehicleId} dispatched to ${incident.location}.`,
      relatedIncident: incident._id,
    });
    await sleep(1500);

    // STEP 7 — Hospital notified
    if (hospital) {
      hospital.incomingPatients.push({
        incident: incident._id,
        vehicle: nearest.vehicle._id,
        etaMinutes: nearest.etaMinutes,
        severity: incident.severity,
      });
      await hospital.save();
      io.emit("hospital:alert", { hospital: hospital.name, incident, etaMinutes: nearest.etaMinutes });
      await createNotification(io, {
        recipientRole: "hospital",
        type: "hospital_notified",
        message: `Incoming patient (${incident.severity} severity) — ETA ${nearest.etaMinutes} min.`,
        relatedIncident: incident._id,
      });
    }
    io.emit("demo:step", { step: 7, label: "🏥 Hospital notified", hospital: hospital?.name });
    await sleep(1500);

    // STEP 8 — Emergency resolved
    incident.status = "resolved";
    incident.resolvedAt = new Date();
    incident.responseTimeSeconds = Math.round((incident.resolvedAt - incident.createdAt) / 1000);
    await incident.save();

    nearest.vehicle.status = "returning";
    nearest.vehicle.currentIncident = null;
    await nearest.vehicle.save();

    io.emit("incident:updated", incident);
    io.emit("vehicle:status", nearest.vehicle);
    io.emit("demo:step", {
      step: 8,
      label: "✅ Emergency resolved",
      responseTimeSeconds: incident.responseTimeSeconds,
      timeSavedMinutes: route.timeSavedMinutes,
    });
  } catch (err) {
    console.error("Demo scenario failed:", err);
    io.emit("demo:step", { step: -1, label: "⚠ Demo scenario encountered an error", error: err.message });
  }
});
