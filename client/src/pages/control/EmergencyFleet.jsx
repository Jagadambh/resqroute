import { useEffect, useState } from "react";
import { Ambulance, Truck, ShieldAlert } from "lucide-react";
import api from "../../services/api.js";
import { useSocket } from "../../context/SocketContext.jsx";

const TYPE_ICON = { ambulance: Ambulance, fire_truck: Truck, police: ShieldAlert };
const STATUS_COLOR = {
  available: "text-success",
  dispatched: "text-warning",
  en_route: "text-warning",
  at_scene: "text-emergency",
  returning: "text-primary",
  offline: "text-muted",
};

export default function EmergencyFleet() {
  const { socket } = useSocket();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/vehicles")
      .then((res) => setVehicles(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onStatus = (vehicle) => setVehicles((prev) => prev.map((v) => (v._id === vehicle._id ? vehicle : v)));
    const onLocation = ({ vehicleId, location, etaMinutes }) =>
      setVehicles((prev) => prev.map((v) => (v._id === vehicleId ? { ...v, location, etaMinutes } : v)));
    socket.on("vehicle:status", onStatus);
    socket.on("vehicle:location", onLocation);
    return () => {
      socket.off("vehicle:status", onStatus);
      socket.off("vehicle:location", onLocation);
    };
  }, [socket]);

  if (loading) return <div className="p-6 text-muted text-sm">Loading fleet…</div>;
  if (error) return <div className="p-6 text-emergency text-sm">{error}</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="font-display font-semibold text-xl">Emergency Fleet</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {vehicles.map((v) => {
          const Icon = TYPE_ICON[v.type] || Ambulance;
          return (
            <div key={v._id} className="bg-surface border border-line rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="font-mono font-semibold">{v.vehicleId}</span>
                </div>
                <span className={`text-xs font-mono uppercase ${STATUS_COLOR[v.status]}`}>● {v.status.replace("_", " ")}</span>
              </div>
              <dl className="text-sm space-y-1.5 text-muted">
                <div className="flex justify-between">
                  <dt>Driver</dt>
                  <dd className="text-ink">{v.driver}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Location</dt>
                  <dd className="text-ink">{v.location?.name || "—"}</dd>
                </div>
                {v.destination?.name && (
                  <div className="flex justify-between">
                    <dt>Destination</dt>
                    <dd className="text-ink">{v.destination.name}</dd>
                  </div>
                )}
                {v.etaMinutes != null && (
                  <div className="flex justify-between">
                    <dt>ETA</dt>
                    <dd className="text-ink">{v.etaMinutes} min</dd>
                  </div>
                )}
              </dl>
            </div>
          );
        })}
      </div>
    </div>
  );
}
