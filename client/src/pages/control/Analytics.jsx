import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import api from "../../services/api.js";

const COLORS = ["#2563EB", "#EF4444", "#F59E0B", "#22C55E", "#94A3B8", "#8B5CF6"];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/analytics")
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-muted text-sm">Loading analytics…</div>;
  if (error) return <div className="p-6 text-emergency text-sm">{error}</div>;

  const byType = data.incidentsByType.map((d) => ({ name: d._id.replace("_", " "), value: d.count }));
  const bySeverity = data.incidentsBySeverity.map((d) => ({ name: d._id, value: d.count }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="font-display font-semibold text-xl">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Incidents" value={data.activeIncidents} />
        <StatCard label="Resolved" value={data.resolvedCount} />
        <StatCard
          label="Avg Response Time"
          value={data.avgResponseTimeSeconds != null ? `${Math.round(data.avgResponseTimeSeconds / 60)}m` : "—"}
        />
        <StatCard label="Est. Time Saved" value={`${data.estimatedTimeSavedMinutes}m`} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <ChartCard title="Incidents by Type" data={byType} />
        <ChartCard title="Incidents by Severity" data={bySeverity} />
      </div>

      <p className="text-xs text-muted italic">{data.note}</p>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-surface border border-line rounded-xl p-5">
      <p className="text-xs text-muted uppercase tracking-wide mb-2">{label}</p>
      <p className="font-mono font-semibold text-2xl">{value}</p>
    </div>
  );
}

function ChartCard({ title, data }) {
  if (!data.length) {
    return (
      <div className="bg-surface border border-line rounded-xl p-5">
        <h3 className="text-sm font-medium text-muted mb-4">{title}</h3>
        <p className="text-sm text-muted italic">Not enough data yet.</p>
      </div>
    );
  }
  return (
    <div className="bg-surface border border-line rounded-xl p-5">
      <h3 className="text-sm font-medium text-muted mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1E293B", borderRadius: 8 }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
