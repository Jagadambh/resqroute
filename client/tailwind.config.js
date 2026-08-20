/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0B1120",     // page background
        surface: "#111827",  // card background
        primary: "#2563EB",  // system / normal
        emergency: "#EF4444",
        warning: "#F59E0B",
        success: "#22C55E",
        ink: "#F8FAFC",       // primary text
        muted: "#94A3B8",     // secondary text
        line: "#1E293B",      // hairline borders
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(37,99,235,0.15), 0 8px 30px rgba(37,99,235,0.08)",
      },
    },
  },
  plugins: [],
};
