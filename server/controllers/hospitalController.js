const Hospital = require("../models/Hospital");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/hospitals
exports.getHospitals = asyncHandler(async (req, res) => {
  const hospitals = await Hospital.find().populate("incomingPatients.incident").populate("incomingPatients.vehicle");
  res.json(hospitals);
});

// GET /api/hospitals/:id
exports.getHospitalById = asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id)
    .populate("incomingPatients.incident")
    .populate("incomingPatients.vehicle");

  if (!hospital) {
    const err = new Error("Hospital not found.");
    err.statusCode = 404;
    throw err;
  }
  res.json(hospital);
});
