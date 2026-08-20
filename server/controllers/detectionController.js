const asyncHandler = require("../utils/asyncHandler");
const { runSimulatedDetection } = require("../services/aiDetectionService");

/**
 * Standalone AI detection endpoint (Section 10 — AI Incident Detection page).
 *
 * Distinct from /api/cameras/:id/analyze: that route re-analyzes a fixed demo
 * camera feed already stored in the DB. This route powers the dedicated
 * upload/video UI, where an operator submits an arbitrary image/video (or, in
 * demo mode, just clicks "Run Detection") and gets back a fresh analysis not
 * tied to any single camera record.
 *
 * SIMULATION LAYER — clearly marked. Real implementation: forward the
 * uploaded frame/video to the Python ai-service (see /ai-service/api), which
 * would run OpenCV preprocessing + a detection/classification model and
 * return this same shape.
 */

// POST /api/detection/analyze
// Body (optional): { fileName, sourceLabel } — metadata only in demo mode, no real file processing
exports.postAnalyzeUpload = asyncHandler(async (req, res) => {
  const { fileName, sourceLabel } = req.body || {};

  const analysis = await runSimulatedDetection();

  res.json({
    analysis,
    sourceLabel: sourceLabel || fileName || "Uploaded feed",
    analyzedAt: new Date(),
    isSimulated: true,
  });
});
