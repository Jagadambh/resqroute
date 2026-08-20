import { useEffect, useState } from "react";
import { Route, Navigation, Clock, ShieldAlert, Sparkles } from "lucide-react";
import api from "../../services/api.js";

const TRAFFIC_COLOR = { low: "text-success", medium: "text-warning", high: "text-emergency" };
const RISK_COLOR = { low: "text-success", medium: "text-warning", high: "text-emergency" };

export default function RouteAnalysis() {
  const [incidents, setIncidents] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [incidentId, setIncidentId] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.get("/incidents", { params: { status: "new" } }), api.get("/hospitals")])
      .then(([incRes, hospRes]) => {
        setIncidents(incRes.data);
        setHospitals(hospRes.data);
        if (incRes.data[0]) setIncidentId(incRes.data[0]._id);
        if (hospRes.data[0]) setHospitalId(hospRes.data[0]._id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function analyze() {
    const incident = incidents.find((i) => i._id === incidentId);
    const hospital = hospitals.find((h) => h._id === hospitalId);
    if (!incident || !hospital) return;

    setAnalyzing(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post("/routes/optimize", {
        origin: { latitude: incident.latitude, longitude: incident.longitude },
        destination: { latitude: hospital.latitude, longitude: hospital.longitude },
        incidentSeverity: incident.severity,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) return <div className="p-6 text-muted text-sm">Loading incidents and hospitals…</div>;

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Route className="w-5 h-5 text-primary" />
          <h1 className="font-display font-semibold text-xl">AI Route Analysis</h1>
        </div>
        <span className="text-xs font-mono text-warning bg-warning/10 border border-warning/20 rounded-full px-3 py-1">
          CANDIDATE ROUTES SIMULATED
        </span>
      </div>
      <p className="text-sm text-muted -mt-3">
        Compares candidate routes from an incident to a hospital by estimated traffic, risk, and ETA, and recommends
        the fastest safe option. Candidate-route generation is simulated here — the seam for a real routing engine
        (OSRM / Mapbox Directions) is marked in <code className="text-xs">routeService.js</code>.
      </p>

      <div className="bg-surface border border-line rounded-xl p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-xs text-muted space-y-1 block">
            Incident (origin)
            <select
              value={incidentId}
              onChange={(e) => setIncidentId(e.target.value)}
              className="w-full bg-base border border-line rounded-lg px-3 py-2 text-sm text-ink"
            >
              {incidents.length === 0 && <option value="">No open incidents</option>}
              {incidents.map((i) => (
                <option key={i._id} value={i._id}>
                  {i.incidentId} — {i.location} ({i.severity})
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-muted space-y-1 block">
            Hospital (destination)
            <select
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
              className="w-full bg-base border border-line rounded-lg px-3 py-2 text-sm text-ink"
            >
              {hospitals.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          onClick={analyze}
          disabled={analyzing || !incidentId || !hospitalId}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm font-medium rounded-lg py-2.5 transition-colors flex items-center justify-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          {analyzing ? "Analyzing routes…" : "Analyze Routes"}
        </button>
      </div>

      {error && <p className="text-emergency text-sm">{error}</p>}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{result.explanation}</span>
          </div>

          {result.timeSavedMinutes > 0 && (
            <p className="text-sm text-muted">
              Recommended route saves an estimated{" "}
              <span className="text-success font-mono">{result.timeSavedMinutes} min</span> versus the alternative.
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {result.routes.map((route) => {
              const isRecommended = route.routeLabel === result.recommended;
              return (
                <div
                  key={route.routeLabel}
                  className={`rounded-xl p-5 border space-y-3 ${
                    isRecommended ? "border-primary/40 bg-primary/5 shadow-glow" : "border-line bg-surface"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-semibold">{route.routeLabel}</span>
                    {isRecommended && (
                      <span className="text-[10px] uppercase font-mono tracking-wide bg-primary text-white rounded-full px-2 py-0.5">
                        Recommended
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-ink">
                    <Clock className="w-4 h-4 text-muted" />
                    {route.etaMinutes} min ETA · {route.distanceKm} km
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <ShieldAlert className="w-4 h-4 text-muted" />
                    <span className={RISK_COLOR[route.riskLevel]}>Risk: {route.riskLevel}</span>
                  </div>

                  <div className="text-sm">
                    <span className="text-muted">Traffic: </span>
                    <span className={TRAFFIC_COLOR[route.trafficLevel]}>{route.trafficLevel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
