const EmergencyVehicle = require("../models/EmergencyVehicle");

/**
 * SIMULATION LAYER — clearly marked, powers "▶ Start Live Simulation" (Section 12).
 *
 * Every TICK_MS, any vehicle with status "dispatched" or "en_route" and a destination
 * advances a bit further along a straight-line interpolation toward its destination,
 * and emits its new position over Socket.IO. This stands in for real GPS telemetry —
 * a real deployment would replace this tick with incoming GPS updates from vehicle
 * hardware, published to the same vehicle:location event.
 */

const TICK_MS = 2000;
const PROGRESS_PER_TICK = 0.08; // ~12 ticks (24s) for a vehicle to complete its route in demo mode

let intervalHandle = null;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

async function tick(io) {
  const activeVehicles = await EmergencyVehicle.find({
    status: { $in: ["dispatched", "en_route"] },
    "destination.latitude": { $exists: true },
  });

  for (const vehicle of activeVehicles) {
    const newProgress = Math.min(1, (vehicle.routeProgress || 0) + PROGRESS_PER_TICK);

    vehicle.location.latitude = lerp(vehicle.location.latitude, vehicle.destination.latitude, PROGRESS_PER_TICK);
    vehicle.location.longitude = lerp(vehicle.location.longitude, vehicle.destination.longitude, PROGRESS_PER_TICK);
    vehicle.routeProgress = newProgress;
    vehicle.status = newProgress < 1 ? "en_route" : "at_scene";
    vehicle.etaMinutes = Math.max(0, Math.round((1 - newProgress) * (vehicle.etaMinutes || 10)));

    await vehicle.save();

    io.emit("vehicle:location", {
      vehicleId: vehicle._id,
      location: vehicle.location,
      routeProgress: vehicle.routeProgress,
      etaMinutes: vehicle.etaMinutes,
    });

    if (newProgress >= 1) {
      io.emit("vehicle:status", vehicle);
    }
  }
}

function startSimulationLoop(io) {
  if (intervalHandle) return; // already running
  intervalHandle = setInterval(() => tick(io).catch(console.error), TICK_MS);
  console.log("▶ Simulation loop started");
}

function stopSimulationLoop() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    console.log("⏸ Simulation loop stopped");
  }
}

module.exports = { startSimulationLoop, stopSimulationLoop };
