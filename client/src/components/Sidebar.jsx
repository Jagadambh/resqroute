import { NavLink } from "react-router-dom";
import { LayoutGrid, Siren, Ambulance, Activity, BarChart3, Camera, ScanSearch, Route as RouteIcon, Bell } from "lucide-react";

const NAV_ITEMS = [
  { to: "/control", icon: LayoutGrid, label: "Overview", end: true },
  { to: "/control/incidents", icon: Siren, label: "Incidents" },
  { to: "/control/fleet", icon: Ambulance, label: "Emergency" },
  { to: "/control/traffic", icon: Activity, label: "Traffic" },
  { to: "/control/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/control/cameras", icon: Camera, label: "Cameras" },
  { to: "/control/detection", icon: ScanSearch, label: "AI Detection" },
  { to: "/control/routes", icon: RouteIcon, label: "Route Analysis" },
  { to: "/control/notifications", icon: Bell, label: "Notifications" },
];

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-line bg-surface flex flex-col">
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted hover:text-ink hover:bg-white/5"
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
