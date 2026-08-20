import { useEffect, useState } from "react";
import { Building2, Ambulance, Clock } from "lucide-react";
import api from "../../services/api.js";
import { useSocket } from "../../context/SocketContext.jsx";

export default function HospitalDashboard() {
  const { socket } = useSocket();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    api
      .get("/hospitals")
      .then((res) => setHospitals(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onAlert = (payload) => {
      setAlert(payload);
      setTimeout(() => setAlert(null), 8000);
    };
    socket.on("hospital:alert", onAlert);
    return () => socket.off("hospital:alert", onAlert);
  }, [socket]);

  if (loading) return <div className="p-6 text-muted text-sm">Loading hospital data…</div>;
  if (error) return <div className="p-6 text-emergency text-sm">{error}</div>;

  const hospital = hospitals[0]; // demo: showing the first hospital as "this hospital"
  const incoming = hospital?.incomingPatients || [];

  return (
    <div className="min-h-screen bg-base p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-8 pt-4">
        <Building2 className="w-5 h-5 text-success" />
        <span className="font-display font-semibold">ResQRoute — Hospital</span>
      </div>

      {alert && (
        <div className="mb-6 bg-success/10 border border-success/20 rounded-xl p-4 text-sm">
          🚑 New incoming patient — ETA {alert.etaMinutes} min ({hospital?.name})
        </div>
      )}

      <h1 className="font-display font-semibold text-xl mb-1">{hospital?.name || "Hospital"}</h1>
      <p className="text-muted text-sm mb-6">
        {hospital?.availableBeds}/{hospital?.emergencyCapacity} emergency beds available
      </p>

      <h2 className="text-sm font-medium text-muted mb-3">Incoming Patients</h2>
      {incoming.length === 0 ? (
        <p className="text-sm text-muted italic">No incoming patients right now.</p>
      ) : (
        <div className="space-y-3">
          {incoming.map((p, i) => (
            <div key={i} className="bg-surface border border-line rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Ambulance className="w-4 h-4 text-primary" />
                  <span className="font-mono font-semibold">{p.vehicle?.vehicleId || "Ambulance"}</span>
                </div>
                <span className="flex items-center gap-1 text-xs text-warning font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {p.etaMinutes} min
                </span>
              </div>
              <dl className="text-sm space-y-1.5 text-muted mb-4">
                <div className="flex justify-between">
                  <dt>Emergency</dt>
                  <dd className="text-ink capitalize">{p.incident?.type?.replace("_", " ") || "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Severity</dt>
                  <dd className="text-ink capitalize">{p.severity}</dd>
                </div>
              </dl>
              <div className="flex gap-2">
                <button className="text-xs bg-primary/15 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/25 transition-colors">
                  Prepare Emergency Unit
                </button>
                <button className="text-xs border border-line px-3 py-1.5 rounded-lg hover:border-muted transition-colors">
                  View Patient Info
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
