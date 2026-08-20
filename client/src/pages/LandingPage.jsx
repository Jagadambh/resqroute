import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Radio, MapPinned, Route as RouteIcon, Activity, Siren, Building2, ArrowRight } from "lucide-react";
import RadarCityVisual from "../components/RadarCityVisual.jsx";

const STEPS = [
  { icon: Radio, title: "Detect", desc: "AI cameras and citizen reports surface incidents the moment they happen." },
  { icon: Activity, title: "Analyze", desc: "Severity, confidence, and crowd context are scored automatically." },
  { icon: RouteIcon, title: "Optimize", desc: "The routing engine compares live paths and picks the fastest safe one." },
  { icon: Siren, title: "Respond", desc: "The nearest unit is dispatched and tracked to the hospital in real time." },
];

const CAPABILITIES = [
  { icon: Radio, title: "AI Incident Detection", desc: "Camera-fed analysis flags accidents and hazards as they occur." },
  { icon: Siren, title: "Emergency Vehicle Tracking", desc: "Live position, status, and ETA for every unit in the fleet." },
  { icon: RouteIcon, title: "Intelligent Route Optimization", desc: "Multi-factor routing weighing traffic, distance, and risk." },
  { icon: Activity, title: "Real-Time Traffic Monitoring", desc: "Congestion and density surfaced across the road network." },
  { icon: MapPinned, title: "Citizen Emergency Reporting", desc: "Anyone can report an incident straight into the response pipeline." },
  { icon: Building2, title: "Hospital Coordination", desc: "ERs get advance notice with severity and ETA before arrival." },
];

const IMPACT = [
  { value: "24", label: "Incidents Handled" },
  { value: "18", label: "Emergency Vehicles" },
  { value: "312", label: "Routes Optimized" },
  { value: "127 min", label: "Est. Time Saved" },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base">
      {/* ---------- NAV ---------- */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-line">
        <div className="flex items-center gap-2">
          <Siren className="w-5 h-5 text-emergency" />
          <span className="font-display font-semibold tracking-tight text-lg">ResQRoute</span>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="text-sm text-muted hover:text-ink transition-colors"
        >
          Sign in
        </button>
      </nav>

      {/* ---------- HERO ---------- */}
      <section className="px-6 md:px-12 pt-16 md:pt-20 pb-12 grid md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            SMART VEHICLES · TRANSPORTATION & LOGISTICS
          </span>

          <h1 className="font-display font-semibold text-4xl md:text-6xl tracking-tight leading-[1.05] mb-4">
            RESQROUTE
          </h1>
          <p className="text-xl md:text-2xl text-primary font-display font-medium mb-5">
            Every Second Saves a Life.
          </p>
          <p className="text-muted text-base md:text-lg max-w-md mb-8 leading-relaxed">
            AI-powered emergency traffic management for faster, smarter, and safer cities.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium px-5 py-3 rounded-lg transition-colors shadow-glow"
            >
              Launch Control Center
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 border border-line hover:border-muted text-ink font-medium px-5 py-3 rounded-lg transition-colors"
            >
              See How It Works
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <RadarCityVisual />
        </motion.div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section id="how-it-works" className="px-6 md:px-12 py-20 border-t border-line max-w-7xl mx-auto">
        <h2 className="font-display font-semibold text-2xl md:text-3xl mb-2">How ResQRoute Works</h2>
        <p className="text-muted mb-10">A fixed pipeline from first signal to resolved emergency.</p>

        <div className="grid md:grid-cols-4 gap-px bg-line rounded-xl overflow-hidden">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-surface p-6"
            >
              <span className="font-mono text-xs text-muted">0{i + 1}</span>
              <step.icon className="w-5 h-5 text-primary my-3" />
              <h3 className="font-display font-semibold text-lg mb-1">{step.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- CAPABILITIES ---------- */}
      <section className="px-6 md:px-12 py-20 border-t border-line max-w-7xl mx-auto">
        <h2 className="font-display font-semibold text-2xl md:text-3xl mb-2">Key Capabilities</h2>
        <p className="text-muted mb-10">Everything the control center needs in one platform.</p>

        <div className="grid md:grid-cols-3 gap-4">
          {CAPABILITIES.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-surface border border-line rounded-xl p-6 hover:border-primary/40 transition-colors"
            >
              <cap.icon className="w-5 h-5 text-primary mb-4" />
              <h3 className="font-medium mb-1.5">{cap.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{cap.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- IMPACT ---------- */}
      <section className="px-6 md:px-12 py-20 border-t border-line max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-2">
          <div>
            <h2 className="font-display font-semibold text-2xl md:text-3xl mb-2">Impact</h2>
            <p className="text-muted">Simulated demo figures — not connected to live city infrastructure.</p>
          </div>
          <span className="text-xs font-mono text-warning bg-warning/10 border border-warning/20 rounded-full px-3 py-1">
            DEMO DATA
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {IMPACT.map((stat) => (
            <div key={stat.label} className="bg-surface border border-line rounded-xl p-6 text-center">
              <div className="font-mono font-semibold text-3xl md:text-4xl text-ink mb-1">{stat.value}</div>
              <div className="text-xs text-muted uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-6 md:px-12 py-8 border-t border-line text-center text-xs text-muted">
        ResQRoute — a hackathon prototype. AI detection, live traffic, and routing shown here are simulated for demonstration.
      </footer>
    </div>
  );
}
