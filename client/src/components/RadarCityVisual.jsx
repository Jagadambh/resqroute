import { motion } from "framer-motion";

// Signature element: a radar-sweep visualization over a schematic road grid,
// with pulsing markers for an incident, an ambulance, and a hospital — a visual
// shorthand for "detect → respond" that's specific to this product, not a stock graphic.
export default function RadarCityVisual() {
  const roads = [
    "M40,80 H460", "M40,160 H460", "M40,240 H460", "M40,320 H460",
    "M100,20 V380", "M200,20 V380", "M300,20 V380", "M400,20 V380",
  ];

  return (
    <div className="relative w-full max-w-xl mx-auto aspect-[5/4]">
      <svg viewBox="0 0 500 400" className="w-full h-full">
        <defs>
          <radialGradient id="sweepGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* road grid */}
        <g stroke="#1E293B" strokeWidth="1.5" fill="none">
          {roads.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* rotating radar sweep, clipped to a circle at the grid center */}
        <g style={{ transformOrigin: "250px 200px" }}>
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "250px 200px" }}
          >
            <path d="M250,200 L250,40 A160,160 0 0,1 388,280 Z" fill="url(#sweepGradient)" />
          </motion.g>
          <circle cx="250" cy="200" r="160" fill="none" stroke="#1E293B" strokeWidth="1" />
          <circle cx="250" cy="200" r="100" fill="none" stroke="#1E293B" strokeWidth="1" />
        </g>

        {/* incident marker (emergency) */}
        <g filter="url(#glow)">
          <circle cx="300" cy="160" r="6" fill="#EF4444" />
          <motion.circle
            cx="300" cy="160" r="6" fill="none" stroke="#EF4444" strokeWidth="2"
            animate={{ r: [6, 22], opacity: [0.8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        </g>

        {/* ambulance marker (system) */}
        <g filter="url(#glow)">
          <circle cx="150" cy="240" r="5" fill="#2563EB" />
        </g>
        <motion.circle
          cx="150" cy="240" r="5" fill="#2563EB"
          animate={{ cx: [150, 300], cy: [240, 160] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.4, ease: "easeInOut" }}
        />

        {/* hospital marker (success) */}
        <g filter="url(#glow)">
          <rect x="392" y="70" width="12" height="12" rx="2" fill="#22C55E" />
        </g>
      </svg>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[11px] font-mono text-muted tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        SIMULATED LIVE FEED — JAMSHEDPUR
      </div>
    </div>
  );
}
