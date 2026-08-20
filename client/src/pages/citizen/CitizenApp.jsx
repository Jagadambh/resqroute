import { useState } from "react";
import { Siren, Flame, HeartPulse, Construction, TrafficCone, CheckCircle2 } from "lucide-react";
import api from "../../services/api.js";

const TYPES = [
  { key: "accident", icon: Siren, label: "Accident" },
  { key: "fire", icon: Flame, label: "Fire" },
  { key: "medical_emergency", icon: HeartPulse, label: "Medical Emergency" },
  { key: "road_block", icon: Construction, label: "Road Block" },
  { key: "traffic_congestion", icon: TrafficCone, label: "Traffic Problem" },
];

export default function CitizenApp() {
  const [selectedType, setSelectedType] = useState(null);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedType || !location.trim()) {
      setError("Please choose an emergency type and enter a location.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      // Demo geocoding stand-in: Jamshedpur center with small jitter, since we don't have
      // a real geocoder wired up. Clearly a simulation, not a real location lookup.
      const res = await api.post("/reports/citizen", {
        type: selectedType,
        location,
        latitude: 22.8046 + (Math.random() - 0.5) * 0.02,
        longitude: 86.2029 + (Math.random() - 0.5) * 0.02,
        description,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center p-6">
        <div className="bg-surface border border-line rounded-2xl p-8 max-w-sm w-full text-center">
          <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-4" />
          <h2 className="font-display font-semibold text-lg mb-1">Report Received</h2>
          <p className="font-mono text-sm text-muted mb-4">{result.incidentId}</p>
          <p className="text-sm text-muted mb-6">{result.message}</p>
          <button
            onClick={() => {
              setResult(null);
              setSelectedType(null);
              setLocation("");
              setDescription("");
            }}
            className="text-sm text-primary hover:underline"
          >
            Report another emergency
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base p-6 max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-8 pt-4">
        <Siren className="w-5 h-5 text-emergency" />
        <span className="font-display font-semibold">ResQRoute</span>
      </div>

      <h1 className="font-display font-semibold text-2xl mb-1 flex items-center gap-2">
        🚨 Report Emergency
      </h1>
      <p className="text-muted text-sm mb-6">Select the type of emergency you're reporting.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {TYPES.map((t) => (
            <button
              type="button"
              key={t.key}
              onClick={() => setSelectedType(t.key)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${
                selectedType === t.key ? "border-emergency bg-emergency/10" : "border-line bg-surface"
              }`}
            >
              <t.icon className={`w-6 h-6 ${selectedType === t.key ? "text-emergency" : "text-muted"}`} />
              <span className="text-xs text-center">{t.label}</span>
            </button>
          ))}
        </div>

        <div>
          <label className="text-sm text-muted block mb-1.5">Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Near Gandhi Maidan Road"
            className="w-full bg-surface border border-line rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="text-sm text-muted block mb-1.5">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What's happening?"
            className="w-full bg-surface border border-line rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary resize-none"
          />
        </div>

        <p className="text-xs text-muted">Photo/video upload isn't wired up in this demo build yet.</p>

        {error && <p className="text-sm text-emergency">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-emergency hover:bg-emergency/90 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit Report"}
        </button>
      </form>
    </div>
  );
}
