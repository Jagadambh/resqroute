const TrafficData = require("../models/TrafficData");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/traffic — latest reading per road
exports.getTraffic = asyncHandler(async (req, res) => {
  const traffic = await TrafficData.find().sort({ timestamp: -1 }).limit(50);
  res.json(traffic);
});
