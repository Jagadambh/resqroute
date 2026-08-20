import { useEffect, useState } from "react";
import { Camera as CameraIcon, AlertTriangle } from "lucide-react";
import api from "../../services/api.js";
import { useSocket } from "../../context/SocketContext.jsx";

export default function CameraMonitoring() {
  const { socket } = useSocket();
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(null);

  useEffect(() => {
    api
      .get("/cameras")
      .then((res) => setCameras(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onAnalysis = ({ cameraId, analysis }) =>
      setCameras((prev) => prev.map((c) => (c._id === cameraId ? { ...c, lastAnalysis: analysis } : c)));
    socket.on("camera:analysis", onAnalysis);
    return () => socket.off("camera:analysis", onAnalysis);
  }, [socket]);

  async function analyze(id) {
    setAnalyzing(id);
    try {
      await api.post(`/cameras/${id}/analyze`);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(null);
    }
  }

  if (loading) return <div className="p-6 text-muted text-sm">Loading cameras…</div>;
  if (error) return <div className="p-6 text-emergency text-sm">{error}</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-display font-semibold text-xl">Camera Monitoring</h1>
        <span className="text-xs font-mono text-warning bg-warning/10 border border-warning/20 rounded-full px-3 py-1">
          DEMO FEEDS — AI ANALYSIS SIMULATED
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {cameras.map((cam) => {
          const hasAccident = cam.lastAnalysis?.accidentProbability >= 70;
          return (
            <div key={cam._id} className="bg-surface border border-line rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CameraIcon className="w-4 h-4 text-primary" />
                  <span className="font-mono font-semibold">{cam.cameraId}</span>
                </div>
                <span className={`text-xs font-mono uppercase ${cam.status === "online" ? "text-success" : "text-muted"}`}>
                  ● {cam.status}
                </span>
              </div>
              <p className="text-sm text-muted mb-3">{cam.location}</p>

              {cam.lastAnalysis ? (
                <dl className="text-sm space-y-1.5 mb-4">
                  <Row label="Vehicles" value={cam.lastAnalysis.vehicles} />
                  <Row label="Pedestrians" value={cam.lastAnalysis.pedestrians} />
                  <Row label="Accident Probability" value={`${cam.lastAnalysis.accidentProbability}%`} />
                  <Row label="Crowd Density" value={cam.lastAnalysis.crowdDensity} />
                  <Row label="Traffic Level" value={cam.lastAnalysis.trafficLevel} />
                </dl>
              ) : (
                <p className="text-sm text-muted italic mb-4">No analysis yet.</p>
              )}

              {hasAccident && (
                <div className="flex items-center gap-2 text-xs text-emergency bg-emergency/10 border border-emergency/20 rounded-lg px-3 py-2 mb-3">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  High accident probability detected
                </div>
              )}

              <button
                onClick={() => analyze(cam._id)}
                disabled={analyzing === cam._id || cam.status === "offline"}
                className="text-xs text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analyzing === cam._id ? "Analyzing…" : "Run AI Analysis"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-muted">
      <dt>{label}</dt>
      <dd className="text-ink capitalize">{value}</dd>
    </div>
  );
}
