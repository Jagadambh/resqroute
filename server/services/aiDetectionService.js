/**
 * SIMULATION LAYER — clearly marked.
 *
 * Real implementation: POST the camera frame/video to the Python ai-service
 * (see /ai-service/api), which runs OpenCV preprocessing + a YOLO-family object
 * detector + a classifier for accident probability. That service returns exactly
 * the shape below, so this function is a drop-in replacement point — swap the
 * body of runSimulatedDetection() for an axios/fetch call to AI_SERVICE_URL.
 */

function randomBetween(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}

function levelFromValue(value, lowMax, medMax) {
  if (value <= lowMax) return "low";
  if (value <= medMax) return "medium";
  return "high";
}

async function runSimulatedDetection() {
  const vehicles = randomBetween(3, 45);
  const pedestrians = randomBetween(0, 60);
  const accidentProbability = randomBetween(2, 97);

  return {
    vehicles,
    pedestrians,
    accidentProbability,
    crowdDensity: levelFromValue(pedestrians, 15, 35),
    trafficLevel: levelFromValue(vehicles, 15, 30),
  };
}

module.exports = { runSimulatedDetection };
