const EmergencyVehicle = require("../models/EmergencyVehicle");

// Haversine distance in km between two lat/lng points.
// This is a REAL calculation (not simulated) — only the vehicle positions themselves are demo data.
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Maps incident type -> preferred vehicle type
const VEHICLE_FOR_INCIDENT = {
  accident: "ambulance",
  medical_emergency: "ambulance",
  fire: "fire_truck",
  road_block: "police",
  traffic_congestion: "police",
  other: "ambulance",
};

async function findNearestAvailableVehicle(incident) {
  const preferredType = VEHICLE_FOR_INCIDENT[incident.type] || "ambulance";

  const candidates = await EmergencyVehicle.find({
    status: "available",
    type: preferredType,
  });

  if (candidates.length === 0) return null;

  let nearest = null;
  let minDist = Infinity;

  for (const v of candidates) {
    const d = distanceKm(incident.latitude, incident.longitude, v.location.latitude, v.location.longitude);
    if (d < minDist) {
      minDist = d;
      nearest = v;
    }
  }

  // Rough ETA assuming average 30 km/h urban emergency speed — a stand-in until
  // the real route-optimization engine (routeService.js) refines this.
  const etaMinutes = Math.max(1, Math.round((minDist / 30) * 60));

  return { vehicle: nearest, distanceKm: Number(minDist.toFixed(2)), etaMinutes };
}

module.exports = { findNearestAvailableVehicle, distanceKm };
