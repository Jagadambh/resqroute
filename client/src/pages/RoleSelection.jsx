import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Siren, Ambulance, Building2, User, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const ROLES = [
  {
    key: "control_center",
    icon: Siren,
    label: "Control Center",
    desc: "Monitor incidents and coordinate emergency response.",
    path: "/control",
    accent: "text-emergency",
  },
  {
    key: "emergency_services",
    icon: Ambulance,
    label: "Emergency Services",
    desc: "Track emergency vehicles and assigned routes.",
    path: "/emergency",
    accent: "text-primary",
  },
  {
    key: "hospital",
    icon: Building2,
    label: "Hospital",
    desc: "Monitor incoming emergency patients.",
    path: "/hospital",
    accent: "text-success",
  },
  {
    key: "citizen",
    icon: User,
    label: "Citizen",
    desc: "Report accidents and emergencies.",
    path: "/citizen",
    accent: "text-warning",
  },
];

export default function RoleSelection() {
  const navigate = useNavigate();
  const { loginWithRole } = useAuth();
  const [loadingKey, setLoadingKey] = useState(null);
  const [error, setError] = useState(null);

  async function handleSelect(role) {
    setError(null);
    setLoadingKey(role.key);
    try {
      await loginWithRole(role.key);
      navigate(role.path);
    } catch (err) {
      setError("Couldn't sign in with the demo account. Please try again.");
    } finally {
      setLoadingKey(null);
    }
  }

  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-10">
          <h1 className="font-display font-semibold text-3xl mb-2">Welcome to ResQRoute</h1>
          <p className="text-muted">Choose how you want to access the platform.</p>
        </div>

        {error && (
          <div className="mb-6 text-sm text-emergency bg-emergency/10 border border-emergency/20 rounded-lg px-4 py-3 text-center">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {ROLES.map((role) => (
            <button
              key={role.key}
              onClick={() => handleSelect(role)}
              disabled={loadingKey !== null}
              className="text-left bg-surface border border-line hover:border-primary/40 rounded-xl p-6 transition-colors disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              <role.icon className={`w-6 h-6 mb-4 ${role.accent}`} />
              <h3 className="font-medium mb-1 flex items-center gap-2">
                {role.label}
                {loadingKey === role.key && <Loader2 className="w-4 h-4 animate-spin text-muted" />}
              </h3>
              <p className="text-sm text-muted leading-relaxed">{role.desc}</p>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-muted mt-8 font-mono">
          Demo accounts — no real credentials required.
        </p>
      </motion.div>
    </div>
  );
}
