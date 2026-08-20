import { useEffect, useState, useCallback } from "react";
import { Siren, Ambulance, Car, Clock, Play } from "lucide-react";
import api from "../../services/api.js";
import { useSocket } from "../../context/SocketContext.jsx";
import MapView from "../../components/MapView.jsx";
import KPICard from "../../components/KPICard.jsx";
import DemoRunner from "../../components/DemoRunner.jsx";

export default function ControlDashboard() {
  const { socket } = useSocket();
  const [incidents, setIncidents] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDemo, setShowDemo] = useState(false);

  const loadAll = useCallback(async () => {
    setError(null);
    try {
      const [incRes, vehRes, hospRes, trafRes] = await Promise.all([
        api.get("/incidents"),
        api.get("/vehicles"),
        api.get("/hospitals"),
        api.get("/traffic"),
      ]);
      setIncidents(incRes.data);
      setVehicles(vehRes.data);
      setHospitals(hospRes.data);
      setTraffic(trafRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Live updates over Socket.IO
  useEffect(() => {
    const onNewIncident = (incident) => setIncidents((prev) => [incident, ...prev]);
    const onUpdatedIncident = (incident) =>
      setIncidents((prev) => prev.map((i) => (i._id === incident._id ? incident : i)));
    const onVehicleStatus = (vehicle) =>
      setVehicles((prev) => prev.map((v) => (v._id === vehicle._id ? vehicle : v)));
    const onVehicleLocation = ({ vehicleId, location, etaMinutes }) =>
      setVehicles((prev) =>
        prev.map((v) => (v._id === vehicleId ? { ...v, location, etaMinutes: etaMinutes ?? v.etaMinutes } : v))
      );

    socket.on("incident:new", onNewIncident);
    socket.on("incident:updated", onUpdatedIncident);
    socket.on("vehicle:status", onVehicleStatus);
    socket.on("vehicle:location", onVehicleLocation);

    return () => {
      socket.off("incident:new", onNewIncident);
      socket.off("incident:updated", onUpdatedIncident);
      socket.off("vehicle:status", onVehicleStatus);
      socket.off("vehicle:location", onVehicleLocation);
    };
  }, [socket]);

  const activeIncidents = incidents.filter((i) => i.status !== "resolved");
  const congestedRoads = traffic.filter((t) => t.density === "high").length;
  const estimatedTimeSaved = 127; // placeholder until /api/analytics is wired in on this page

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-surface border border-line rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-[480px] bg-surface border border-line rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-emergency/10 border border-emergency/20 rounded-xl p-6 text-center">
          <p className="text-emergency mb-3">Unable to load control center data. Please try again.</p>
          <button onClick={loadAll} className="text-sm underline text-ink">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-semibold text-xl">Overview</h1>
        <button
          onClick={() => setShowDemo(true)}
          className="inline-flex items-center gap-2 bg-emergency hover:bg-emergency/90 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Play className="w-4 h-4" />
          Start Demo
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard icon={Siren} label="Active Incidents" value={activeIncidents.length} accent="text-emergency" />
        <KPICard icon={Ambulance} label="Emergency Vehicles" value={vehicles.length} accent="text-primary" />
        <KPICard icon={Car} label="Congested Roads" value={congestedRoads} accent="text-warning" />
        <KPICard icon={Clock} label="Est. Time Saved" value={estimatedTimeSaved} suffix=" min" accent="text-success" />
      </div>

      <div className="h-[480px]">
        <MapView incidents={incidents} vehicles={vehicles} hospitals={hospitals} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <ListPanel title="Active Incidents" items={activeIncidents.slice(0, 5)} type="incident" />
        <ListPanel title="Emergency Vehicles" items={vehicles.slice(0, 5)} type="vehicle" />
        <ListPanel title="Traffic" items={traffic.slice(0, 5)} type="traffic" />
      </div>

      {showDemo && <DemoRunner onClose={() => setShowDemo(false)} />}
    </div>
  );
}

function severityColor(sev) {
  return { critical: "text-emergency", high: "text-emergency", medium: "text-warning", low: "text-success" }[sev] || "text-muted";
}

function ListPanel({ title, items, type }) {
  return (
    <div className="bg-surface border border-line rounded-xl p-4">
      <h3 className="text-sm font-medium text-muted mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted italic">Nothing to show right now.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item._id} className="text-sm flex items-center justify-between border-b border-line last:border-0 pb-2 last:pb-0">
              {type === "incident" && (
                <>
                  <span>{item.location}</span>
                  <span className={`text-xs font-mono uppercase ${severityColor(item.severity)}`}>{item.severity}</span>
                </>
              )}
              {type === "vehicle" && (
                <>
                  <span>{item.vehicleId}</span>
                  <span className="text-xs font-mono uppercase text-muted">{item.status.replace("_", " ")}</span>
                </>
              )}
              {type === "traffic" && (
                <>
                  <span>{item.road}</span>
                  <span
                    className={`text-xs font-mono uppercase ${
                      item.density === "high" ? "text-emergency" : item.density === "medium" ? "text-warning" : "text-success"
                    }`}
                  >
                    {item.density}
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
