const Camera = require("../models/Camera");
const asyncHandler = require("../utils/asyncHandler");
const { runSimulatedDetection } = require("../services/aiDetectionService");

// GET /api/cameras
exports.getCameras = asyncHandler(async (req, res) => {
  const cameras = await Camera.find();
  res.json(cameras);
});

// GET /api/cameras/:id
exports.getCameraById = asyncHandler(async (req, res) => {
  const camera = await Camera.findById(req.params.id);
  if (!camera) {
    const err = new Error("Camera not found.");
    err.statusCode = 404;
    throw err;
  }
  res.json(camera);
});

// POST /api/cameras/:id/analyze
// Triggers a (simulated) AI analysis pass on the selected camera's demo feed.
// Real implementation swaps runSimulatedDetection() for a call to the ai-service.
exports.postAnalyzeCamera = asyncHandler(async (req, res) => {
  const camera = await Camera.findById(req.params.id);
  if (!camera) {
    const err = new Error("Camera not found.");
    err.statusCode = 404;
    throw err;
  }

  const analysis = await runSimulatedDetection();
  camera.lastAnalysis = { ...analysis, analyzedAt: new Date() };
  await camera.save();

  const io = req.app.get("io");
  io.emit("camera:analysis", { cameraId: camera._id, analysis: camera.lastAnalysis });

  res.json({ camera: camera.cameraId, analysis: camera.lastAnalysis, isSimulated: true });
});
