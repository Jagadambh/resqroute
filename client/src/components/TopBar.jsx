import { useEffect, useState } from "react";
import { Bell, Siren } from "lucide-react";
import { useSocket } from "../context/SocketContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function TopBar({ notificationCount = 0, onBellClick }) {
  const [time, setTime] = useState(new Date());
  const { connected } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-16 shrink-0 border-b border-line bg-surface flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <Siren className="w-5 h-5 text-emergency" />
        <span className="font-display font-semibold tracking-tight">ResQRoute</span>
        <span className="flex items-center gap-1.5 text-xs font-mono text-success ml-2">
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-success animate-pulse" : "bg-muted"}`} />
          {connected ? "LIVE" : "OFFLINE"}
        </span>
      </div>

      <div className="flex items-center gap-5">
        <span className="font-mono text-sm text-muted tabular-nums">
          {time.toLocaleTimeString("en-IN", { hour12: false })}
        </span>
        <button onClick={onBellClick} className="relative text-muted hover:text-ink transition-colors">
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emergency text-[10px] flex items-center justify-center text-white font-medium">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </button>
        {user && (
          <span className="text-xs text-muted border border-line rounded-full px-3 py-1 font-mono uppercase tracking-wide">
            {user.role.replace("_", " ")}
          </span>
        )}
      </div>
    </header>
  );
}
