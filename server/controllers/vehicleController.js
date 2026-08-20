const EmergencyVehicle = require("../models/EmergencyVehicle");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/vehicles  (supports ?type=&status=)
exports.getVehicles = asyncHandler(async (req, res) => {
  const { type, status } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;

  const vehicles = await EmergencyVehicle.find(filter).populate("currentIncident", "incidentId type severity");
  res.json(vehicles);
});

// GET /api/vehicles/:id
exports.getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await EmergencyVehicle.findById(req.params.id).populate("currentIncident");
  if (!vehicle) {
    const err = new Error("Vehicle not found.");
    err.statusCode = 404;
    throw err;
  }
  res.json(vehicle);
});

// PATCH /api/vehicles/:id  (status changes, dispatch assignment, location updates)
exports.updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await EmergencyVehicle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!vehicle) {
    const err = new Error("Vehicle not found.");
    err.statusCode = 404;
    throw err;
  }

  const io = req.app.get("io");
  io.emit("vehicle:status", vehicle);
  if (req.body.location) io.emit("vehicle:location", { vehicleId: vehicle._id, location: vehicle.location });

  res.json(vehicle);
});
