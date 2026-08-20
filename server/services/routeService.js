const { distanceKm } = require("./dispatchService");

/**
 * SIMULATION LAYER — clearly marked.
 *
 * Real implementation would call a routing engine (OSRM / Google Directions / Mapbox
 * Directions API) to get multiple candidate routes, then re-rank them using live
 * traffic data. That integration point is `fetchCandidateRoutesFromRoutingEngine()`
 * below — currently mocked, but shaped exactly like what a real response would look
 * like so swapping it in later doesn't require touching the ranking logic.
 */

async function fetchCandidateRoutesFromRoutingEngine(origin, destination) {
  // TODO(real-integration): replace with an OSRM/Mapbox Directions API call.
  // Expected real response shape preserved here so ranking logic below doesn't change.
  const directKm = distanceKm(origin.latitude, origin.longitude, destination.latitude, destination.longitude);

  return [
    {
      routeLabel: "Route A",
      distanceKm: Number((directKm * 1.35).toFixed(1)), // longer, more direct main road
      trafficLevel: "high",
      riskLevel: "high",
      waypoints: [origin, destination], // simplified straight line for demo map rendering
    },
    {
      routeLabel: "Route B",
      distanceKm: Number((directKm * 1.05).toFixed(1)), // slightly longer physically, but clear
      trafficLevel: "low",
      riskLevel: "low",
      waypoints: [origin, destination],
    },
  ];
}

const TRAFFIC_SPEED_KMPH = { low: 45, medium: 28, high: 15 };

function estimateTravelTimeMinutes(distanceKmValue, trafficLevel) {
  const speed = TRAFFIC_SPEED_KMPH[trafficLevel] || 25;
  return Math.round((distanceKmValue / speed) * 60);
}

/**
 * Scores and ranks candidate routes considering distance, traffic, and risk.
 * Returns the recommended route plus a human-readable explanation, matching
 * the "AI Route Analysis" UI in Section 13 of the spec.
 */
async function optimizeRoute({ origin, destination, incidentSeverity = "medium" }) {
  const candidates = await fetchCandidateRoutesFromRoutingEngine(origin, destination);

  const scored = candidates.map((route) => {
    const etaMinutes = estimateTravelTimeMinutes(route.distanceKm, route.trafficLevel);
    const riskPenalty = route.riskLevel === "high" ? 8 : route.riskLevel === "medium" ? 3 : 0;
    // Lower score = better. ETA dominates; risk adds a penalty in minutes-equivalent.
    const score = etaMinutes + riskPenalty;
    return { ...route, etaMinutes, score };
  });

  scored.sort((a, b) => a.score - b.score);
  const recommended = scored[0];
  const alternative = scored[1];

  const timeSavedMinutes = alternative ? Math.max(0, alternative.etaMinutes - recommended.etaMinutes) : 0;

  const reasons = [];
  if (recommended.trafficLevel === "low") reasons.push("lower current traffic density");
  if (recommended.riskLevel === "low") reasons.push("lower incident/road-blockage risk");
  if (alternative && recommended.etaMinutes < alternative.etaMinutes) reasons.push("shorter estimated travel time");
  if (incidentSeverity === "critical" || incidentSeverity === "high") {
    reasons.push("prioritized due to high emergency severity");
  }

  return {
    routes: scored,
    recommended: recommended.routeLabel,
    timeSavedMinutes,
    explanation:
      reasons.length > 0
        ? `${recommended.routeLabel} recommended due to ${reasons.join(", ")}.`
        : `${recommended.routeLabel} recommended based on overall lowest estimated response time.`,
    isSimulated: true,
  };
}

module.exports = { optimizeRoute, estimateTravelTimeMinutes };
