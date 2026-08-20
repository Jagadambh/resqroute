const asyncHandler = require("../utils/asyncHandler");
const { optimizeRoute } = require("../services/routeService");

// POST /api/routes/optimize
// Body: { origin: {latitude, longitude}, destination: {latitude, longitude}, incidentSeverity }
exports.postOptimizeRoute = asyncHandler(async (req, res) => {
  const { origin, destination, incidentSeverity } = req.body;

  if (!origin?.latitude || !origin?.longitude || !destination?.latitude || !destination?.longitude) {
    const err = new Error("origin and destination (with latitude/longitude) are required.");
    err.statusCode = 400;
    throw err;
  }

  const result = await optimizeRoute({ origin, destination, incidentSeverity });
  res.json(result);
});
