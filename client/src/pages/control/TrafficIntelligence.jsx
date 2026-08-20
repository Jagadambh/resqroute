import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../services/api.js";

const DENSITY_COLOR = { low: "#22C55E", medium: "#F59E0B", high: "#EF4444" };

export default function TrafficIntelligence() {
  const [traffic, setTraffic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/traffic")
      .then((res) => setTraffic(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-muted text-sm">Loading traffic data…</div>;
  if (error) return <div className="p-6 text-emergency text-sm">{error}</div>;

  const chartData = traffic.map((t) => ({ road: t.road, speed: t.avgSpeedKmph, density: t.density }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-display font-semibold text-xl">Traffic Intelligence</h1>
        <span className="text-xs font-mono text-warning bg-warning/10 border border-warning/20 rounded-full px-3 py-1">
          SIMULATED DEMO DATA
        </span>
      </div>

      <div className="bg-surface border border-line rounded-xl p-5">
        <h3 className="text-sm font-medium text-muted mb-4">Average Speed by Road (km/h)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <XAxis dataKey="road" stroke="#94A3B8" fontSize={12} interval={0} angle={-15} textAnchor="end" height={60} />
            <YAxis stroke="#94A3B8" fontSize={12} />
            <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1E293B", borderRadius: 8 }} />
            <Bar dataKey="speed" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <rect key={i} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {traffic.map((t) => (
          <div key={t._id} className="bg-surface border border-line rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{t.road}</p>
              <p className="text-xs text-muted">{t.avgSpeedKmph} km/h avg</p>
            </div>
            <span
              className="text-xs font-mono uppercase px-2 py-1 rounded-full"
              style={{ color: DENSITY_COLOR[t.density], backgroundColor: `${DENSITY_COLOR[t.density]}1A` }}
            >
              {t.density}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
