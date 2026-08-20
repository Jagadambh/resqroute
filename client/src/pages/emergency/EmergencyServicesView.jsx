import { useEffect, useState } from "react";
import { Ambulance, Navigation } from "lucide-react";
import api from "../../services/api.js";
import { useSocket } from "../../context/SocketContext.jsx";

export default function EmergencyServicesView() {
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

  if (loading) return <div className="p-6 text-muted text-sm">Loading assigned vehicles…</div>;
  if (error) return <div className="p-6 text-emergency text-sm">{error}</div>;

  const active = vehicles.filter((v) => v.status !== "offline");

  return (
    <div className="min-h-screen bg-base p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-8 pt-4">
        <Ambulance className="w-5 h-5 text-primary" />
        <span className="font-display font-semibold">ResQRoute — Emergency Services</span>
      </div>

      <h1 className="font-display font-semibold text-xl mb-6">Fleet Status</h1>

      <div className="space-y-4">
        {active.map((v) => (
          <div key={v._id} className="bg-surface border border-line rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono font-semibold">{v.vehicleId}</span>
              <span className="text-xs font-mono uppercase text-primary">{v.status.replace("_", " ")}</span>
            </div>
            <p className="text-sm text-muted mb-1">Driver: {v.driver}</p>
            <p className="text-sm text-muted mb-1">Location: {v.location?.name || "En route"}</p>
            {v.destination?.name && (
              <p className="text-sm text-muted flex items-center gap-1.5 mt-2">
                <Navigation className="w-3.5 h-3.5 text-primary" />
                To {v.destination.name} · ETA {v.etaMinutes ?? "—"} min
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
