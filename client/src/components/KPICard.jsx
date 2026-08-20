import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Animates a number counting up from 0 to `value` on mount/update.
function useCountUp(value, duration = 800) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const numeric = typeof value === "number" ? value : parseFloat(value);
    if (Number.isNaN(numeric)) {
      setDisplay(value);
      return;
    }
    let start = null;
    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setDisplay(Math.round(progress * numeric));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [value, duration]);

  return display;
}

export default function KPICard({ icon: Icon, label, value, suffix = "", accent = "text-primary" }) {
  const animated = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-line rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted uppercase tracking-wide">{label}</span>
        <Icon className={`w-4 h-4 ${accent}`} />
      </div>
      <div className="font-mono font-semibold text-3xl tabular-nums">
        {animated}
        {suffix}
      </div>
    </motion.div>
  );
}
