# ResQRoute — AI-Powered Emergency Traffic Management System

**Every Second Saves a Life.**

A hackathon-ready prototype for AI-assisted emergency detection, dispatch, route optimization, and hospital coordination — built for a smart-city scenario centered on Jamshedpur.

## Status: Phase 1 (Foundation) + Phase 2 (Core) complete

- ✅ Backend: Express + Socket.IO + MongoDB, full REST API, dispatch/route/AI-detection services, simulation engine, demo-mode scenario runner, seed data
- ✅ Frontend: React + Vite + Tailwind command-center theme, routing for all 4 roles, landing page, role selection, Control Center dashboard with live Leaflet map, Incident Center, Emergency Fleet, Traffic Intelligence, Analytics, Camera Monitoring, Citizen report flow, Hospital dashboard, Emergency Services view, live Demo Mode runner
- ⏳ Not yet built: AI-service Python microservice stub (ai-service/ folder is scaffolded but empty — currently the Node backend simulates detection directly), automated tests, production deployment config

## Quick start

### 1. Backend
```bash
cd server
cp ../.env.example .env      # then fill in MONGO_URI (MongoDB Atlas free tier works)
npm install
npm run seed                 # populates demo data (Jamshedpur hospitals, fleet, incidents, cameras)
npm run dev                  # starts on http://localhost:5000
```

### 2. Frontend
```bash
cd client
npm install
npm run dev                  # starts on http://localhost:5173, proxies /api and /socket.io to :5000
```

Open http://localhost:5173, choose a role from the login screen (demo accounts — no real credentials), and explore. From the Control Center, click **Start Demo** to run the full accident → dispatch → resolution scenario live.

## What's real vs. simulated

- **Real**: distance calculations (haversine), route scoring logic, all CRUD/API behavior, Socket.IO live updates, database schema and aggregation queries.
- **Simulated (clearly marked in code and UI)**: AI camera detection results, vehicle GPS movement, traffic density readings, route candidate generation. Every simulated model/service has a comment marking the exact integration point for a real implementation (e.g. `routeService.js`, `aiDetectionService.js`, `simulationEngine.js`).

## Project structure
See `/client`, `/server`, `/ai-service` (scaffolded for future real CV model), and `.env.example` at the root.
