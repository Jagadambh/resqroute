import { useEffect, useState, useCallback } from "react";
import api from "../../services/api.js";
import { useSocket } from "../../context/SocketContext.jsx";

const SEVERITY_COLOR = { critical: "text-emergency", high: "text-emergency", medium: "text-warning", low: "text-success" };

export default function IncidentCenter() {
  const { socket } = useSocket();
  const [incidents, setIncidents] = useState([]);
  const [filters, setFilters] = useState({ severity: "", status: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await api.get("/incidents", { params });
      setIncidents(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onNew = (incident) => setIncidents((prev) => [incident, ...prev]);
    const onUpdated = (incident) => setIncidents((prev) => prev.map((i) => (i._id === incident._id ? incident : i)));
    socket.on("incident:new", onNew);
    socket.on("incident:updated", onUpdated);
    return () => {
      socket.off("incident:new", onNew);
      socket.off("incident:updated", onUpdated);
    };
  }, [socket]);

  async function resolveIncident(id) {
    try {
      await api.patch(`/incidents/${id}`, { status: "resolved" });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="font-display font-semibold text-xl">Incident Center</h1>

      <div className="flex flex-wrap gap-3">
        <FilterSelect
          label="Severity"
          value={filters.severity}
          onChange={(v) => setFilters((f) => ({ ...f, severity: v }))}
          options={["critical", "high", "medium", "low"]}
        />
        <FilterSelect
          label="Status"
          value={filters.status}
          onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
          options={["new", "ai_analysis", "dispatched", "en_route", "at_scene", "resolved"]}
        />
        <FilterSelect
          label="Type"
          value={filters.type}
          onChange={(v) => setFilters((f) => ({ ...f, type: v }))}
          options={["accident", "fire", "medical_emergency", "road_block", "traffic_congestion", "other"]}
        />
      </div>

      {error && <p className="text-emergency text-sm">{error}</p>}

      <div className="bg-surface border border-line rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-muted text-xs uppercase tracking-wide">
            <tr>
              {["ID", "Type", "Location", "Severity", "Detected By", "Time", "Vehicle", "Status", "Action"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-muted">
                  Loading incidents…
                </td>
              </tr>
            ) : incidents.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-muted">
                  No incidents match these filters.
                </td>
              </tr>
            ) : (
              incidents.map((inc) => (
                <tr key={inc._id} className="border-t border-line hover:bg-white/5">
                  <td className="px-4 py-3 font-mono">{inc.incidentId}</td>
                  <td className="px-4 py-3 capitalize">{inc.type.replace("_", " ")}</td>
                  <td className="px-4 py-3">{inc.location}</td>
                  <td className={`px-4 py-3 uppercase text-xs font-mono ${SEVERITY_COLOR[inc.severity]}`}>{inc.severity}</td>
                  <td className="px-4 py-3 capitalize">{inc.source.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-muted">{new Date(inc.createdAt).toLocaleTimeString()}</td>
                  <td className="px-4 py-3">{inc.assignedVehicle?.vehicleId || "—"}</td>
                  <td className="px-4 py-3 capitalize">{inc.status.replace("_", " ")}</td>
                  <td className="px-4 py-3">
                    {inc.status !== "resolved" && (
                      <button onClick={() => resolveIncident(inc._id)} className="text-xs text-primary hover:underline">
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-surface border border-line rounded-lg px-3 py-2 text-sm text-ink"
    >
      <option value="">{label}: All</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}
