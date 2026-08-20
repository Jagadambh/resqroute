// Run with: npm run seed  (from /server)
// Populates the database with realistic Jamshedpur-based demo data so the app looks
// alive immediately, per Section 29 of the product spec. All records marked isSimulated: true.

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Incident = require("../models/Incident");
const EmergencyVehicle = require("../models/EmergencyVehicle");
const Hospital = require("../models/Hospital");
const TrafficData = require("../models/TrafficData");
const Camera = require("../models/Camera");
const Notification = require("../models/Notification");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Clearing existing demo collections...");

  await Promise.all([
    Incident.deleteMany({}),
    EmergencyVehicle.deleteMany({}),
    Hospital.deleteMany({}),
    TrafficData.deleteMany({}),
    Camera.deleteMany({}),
    Notification.deleteMany({}),
    User.deleteMany({ isDemoAccount: true }),
  ]);

  // ---------- Demo users (one per role) ----------
  const demoPasswordHash = await bcrypt.hash("demo-password", 10);
  const roles = ["control_center", "emergency_services", "hospital", "citizen"];
  await User.insertMany(
    roles.map((role) => ({
      name: `Demo ${role.replace("_", " ")}`,
      email: `demo-${role}@resqroute.app`,
      passwordHash: demoPasswordHash,
      role,
      isDemoAccount: true,
    }))
  );

  // ---------- Hospitals (real Jamshedpur hospital names/approx coordinates) ----------
  const hospitals = await Hospital.insertMany([
    {
      hospitalId: "HOSP-01",
      name: "Tata Main Hospital (TMH)",
      latitude: 22.8095,
      longitude: 86.1875,
      emergencyCapacity: 40,
      availableBeds: 12,
      status: "normal",
    },
    {
      hospitalId: "HOSP-02",
      name: "MGM Medical College & Hospital",
      latitude: 22.8320,
      longitude: 86.1930,
      emergencyCapacity: 60,
      availableBeds: 25,
      status: "normal",
    },
    {
      hospitalId: "HOSP-03",
      name: "Jamshedpur Sadar Hospital",
      latitude: 22.8038,
      longitude: 86.2027,
      emergencyCapacity: 35,
      availableBeds: 8,
      status: "busy",
    },
  ]);

  // ---------- Emergency vehicle fleet ----------
  const vehicles = await EmergencyVehicle.insertMany([
    {
      vehicleId: "AMB-101",
      type: "ambulance",
      driver: "Ramesh Kumar",
      status: "available",
      location: { name: "Tatanagar Railway Station", latitude: 22.8093, longitude: 86.2018 },
    },
    {
      vehicleId: "AMB-102",
      type: "ambulance",
      driver: "Suresh Yadav",
      status: "available",
      location: { name: "Bistupur Main Road", latitude: 22.7996, longitude: 86.1836 },
    },
    {
      vehicleId: "AMB-103",
      type: "ambulance",
      driver: "Anita Devi",
      status: "offline",
      location: { name: "Kadma", latitude: 22.7934, longitude: 86.2154 },
    },
    {
      vehicleId: "FIRE-201",
      type: "fire_truck",
      driver: "Vikram Singh",
      status: "available",
      location: { name: "Sonari", latitude: 22.8140, longitude: 86.1990 },
    },
    {
      vehicleId: "POL-301",
      type: "police",
      driver: "Constable Manoj Tiwari",
      status: "available",
      location: { name: "Bistupur Circle", latitude: 22.7995, longitude: 86.1850 },
    },
  ]);

  // ---------- Traffic zones ----------
  await TrafficData.insertMany([
    { road: "Sakchi Main Road", latitude: 22.8038, longitude: 86.2027, density: "high", avgSpeedKmph: 14 },
    { road: "Golmuri Road", latitude: 22.7870, longitude: 86.2085, density: "medium", avgSpeedKmph: 26 },
    { road: "Bistupur Main Road", latitude: 22.7996, longitude: 86.1836, density: "low", avgSpeedKmph: 42 },
    { road: "Tatanagar Station Road", latitude: 22.8093, longitude: 86.2018, density: "medium", avgSpeedKmph: 24 },
    { road: "Kadma Chowk", latitude: 22.7934, longitude: 86.2154, density: "high", avgSpeedKmph: 12 },
  ]);

  // ---------- Cameras ----------
  await Camera.insertMany([
    {
      cameraId: "CAM-001",
      location: "Bistupur Chowk",
      latitude: 22.7995,
      longitude: 86.1850,
      status: "online",
      lastAnalysis: {
        vehicles: 42,
        pedestrians: 18,
        accidentProbability: 8,
        crowdDensity: "medium",
        trafficLevel: "high",
        analyzedAt: new Date(),
      },
    },
    {
      cameraId: "CAM-002",
      location: "Sakchi Main Road Junction",
      latitude: 22.8038,
      longitude: 86.2027,
      status: "online",
      lastAnalysis: {
        vehicles: 31,
        pedestrians: 9,
        accidentProbability: 94,
        crowdDensity: "high",
        trafficLevel: "high",
        analyzedAt: new Date(),
      },
    },
    {
      cameraId: "CAM-003",
      location: "Bistupur Main Road",
      latitude: 22.7996,
      longitude: 86.1836,
      status: "online",
      lastAnalysis: {
        vehicles: 12,
        pedestrians: 4,
        accidentProbability: 3,
        crowdDensity: "low",
        trafficLevel: "low",
        analyzedAt: new Date(),
      },
    },
    { cameraId: "CAM-004", location: "Kadma Chowk", latitude: 22.7934, longitude: 86.2154, status: "offline" },
  ]);

  // ---------- Historical / active incidents ----------
  const incidents = await Incident.insertMany([
    {
      incidentId: "INC-101",
      type: "accident",
      location: "Sakchi Main Road Junction",
      latitude: 22.8038,
      longitude: 86.2027,
      severity: "critical",
      source: "ai_camera",
      aiConfidence: 94,
      status: "en_route",
      assignedVehicle: vehicles[0]._id,
      assignedHospital: hospitals[0]._id,
      isSimulated: true,
    },
    {
      incidentId: "INC-102",
      type: "traffic_congestion",
      location: "Kadma Chowk",
      latitude: 22.7934,
      longitude: 86.2154,
      severity: "medium",
      source: "citizen_report",
      status: "new",
      isSimulated: true,
    },
    {
      incidentId: "INC-103",
      type: "medical_emergency",
      location: "Bistupur Main Road",
      latitude: 22.7996,
      longitude: 86.1836,
      severity: "high",
      source: "citizen_report",
      status: "resolved",
      responseTimeSeconds: 640,
      resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      isSimulated: true,
    },
    {
      incidentId: "INC-104",
      type: "road_block",
      location: "Golmuri Road",
      latitude: 22.7870,
      longitude: 86.2085,
      severity: "low",
      source: "control_center_manual",
      status: "resolved",
      responseTimeSeconds: 900,
      resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 10),
      isSimulated: true,
    },
  ]);

  // link vehicle 101 to its active incident
  vehicles[0].status = "en_route";
  vehicles[0].currentIncident = incidents[0]._id;
  vehicles[0].destination = { name: hospitals[0].name, latitude: hospitals[0].latitude, longitude: hospitals[0].longitude };
  vehicles[0].etaMinutes = 6;
  vehicles[0].routeProgress = 0.4;
  await vehicles[0].save();

  console.log("✅ Demo data seeded successfully (Jamshedpur, all records marked isSimulated: true).");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
