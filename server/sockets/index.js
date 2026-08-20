const { startSimulationLoop, stopSimulationLoop } = require("../services/simulationEngine");

/**
 * All events emitted server-side (from controllers/services) are listed here for reference:
 *   incident:new, incident:updated
 *   vehicle:location, vehicle:status
 *   traffic:update
 *   notification:new
 *   hospital:alert
 *   demo:start, demo:step
 *   camera:analysis
 *
 * Client -> server events handled below:
 *   simulation:start  — begins moving dispatched vehicles along their routes
 *   simulation:stop
 */
module.exports = function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on("simulation:start", () => {
      startSimulationLoop(io);
    });

    socket.on("simulation:stop", () => {
      stopSimulationLoop();
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};
