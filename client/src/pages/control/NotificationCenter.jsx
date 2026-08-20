import { useEffect, useState, useCallback } from "react";
import { Bell, CheckCheck, Siren, Ambulance, TrafficCone, Building2, CircleCheck } from "lucide-react";
import api from "../../services/api.js";
import { useSocket } from "../../context/SocketContext.jsx";

const TYPE_META = {
  incident_detected: { icon: Siren, color: "text-emergency" },
  vehicle_dispatched: { icon: Ambulance, color: "text-primary" },
  traffic_congestion: { icon: TrafficCone, color: "text-warning" },
  hospital_notified: { icon: Building2, color: "text-primary" },
  incident_resolved: { icon: CircleCheck, color: "text-success" },
};

export default function NotificationCenter() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all | unread

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filter === "unread" ? { unreadOnly: "true" } : {};
      const res = await api.get("/notifications", { params });
      setNotifications(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onNew = (notification) => setNotifications((prev) => [notification, ...prev]);
    socket.on("notification:new", onNew);
    return () => socket.off("notification:new", onNew);
  }, [socket]);

  async function markRead(id) {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function markAllRead() {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setError(err.message);
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;
  const visible = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="p-6 space-y-4 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h1 className="font-display font-semibold text-xl">Notification Center</h1>
          {unreadCount > 0 && (
            <span className="text-xs font-mono bg-emergency/15 text-emergency rounded-full px-2 py-0.5">
              {unreadCount} unread
            </span>
          )}
        </div>
        <button
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          Mark all as read
        </button>
      </div>

      <div className="flex gap-2">
        {["all", "unread"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-colors ${
              filter === f ? "bg-primary/15 border-primary/30 text-primary" : "border-line text-muted hover:text-ink"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <p className="text-emergency text-sm">{error}</p>}

      <div className="bg-surface border border-line rounded-xl divide-y divide-line overflow-hidden">
        {loading ? (
          <p className="px-4 py-8 text-center text-muted text-sm">Loading notifications…</p>
        ) : visible.length === 0 ? (
          <p className="px-4 py-8 text-center text-muted text-sm">
            {filter === "unread" ? "No unread notifications." : "No notifications yet."}
          </p>
        ) : (
          visible.map((n) => {
            const meta = TYPE_META[n.type] || { icon: Bell, color: "text-muted" };
            const Icon = meta.icon;
            return (
              <div
                key={n._id}
                onClick={() => !n.read && markRead(n._id)}
                className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors ${
                  n.read ? "opacity-60" : "hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${meta.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink">{n.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted">{new Date(n.timestamp).toLocaleString()}</span>
                    {n.relatedIncident?.incidentId && (
                      <span className="text-xs font-mono text-primary/80">{n.relatedIncident.incidentId}</span>
                    )}
                  </div>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
