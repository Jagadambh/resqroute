import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import api from "../services/api.js";
import { useSocket } from "../context/SocketContext.jsx";

const STEP_LABELS = [
  "🚨 Accident detected",
  "🤖 AI analyzing severity",
  "📍 Location identified",
  "🚑 Nearest ambulance found",
  "🧠 AI recommends optimal route",
  "🚑 Ambulance dispatched",
  "🏥 Hospital notified",
  "✅ Emergency resolved",
];

export default function DemoRunner({ onClose }) {
  const { socket } = useSocket();
  const [currentStep, setCurrentStep] = useState(0);
  const [started, setStarted] = useState(false);
  const [finalData, setFinalData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const onStep = (payload) => {
      if (payload.step === -1) {
        setError(payload.label);
        return;
      }
      setCurrentStep(payload.step);
      if (payload.step === 8) setFinalData(payload);
    };
    socket.on("demo:step", onStep);

    // Kick off the scenario as soon as the modal mounts
    api.post("/demo/start").then(() => setStarted(true)).catch((err) => setError(err.message));

    return () => socket.off("demo:step", onStep);
  }, [socket]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface border border-line rounded-2xl p-8 max-w-lg w-full relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-ink">
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-display font-semibold text-lg mb-1">Live Demo Scenario</h2>
        <p className="text-sm text-muted mb-6">Road accident at Gandhi Maidan Road — end to end.</p>

        {error && <p className="text-emergency text-sm mb-4">{error}</p>}

        {!started && !error && <p className="text-sm text-muted">Starting scenario…</p>}

        <ol className="space-y-3">
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const isDone = currentStep >= stepNum;
            const isCurrent = currentStep === stepNum;
            return (
              <li key={label} className="flex items-center gap-3">
                <AnimatePresence mode="wait">
                  {isDone ? (
                    <motion.div key="done" initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                    </motion.div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-line shrink-0" />
                  )}
                </AnimatePresence>
                <span className={`text-sm ${isDone ? "text-ink" : "text-muted"} ${isCurrent ? "font-medium" : ""}`}>
                  {label}
                </span>
              </li>
            );
          })}
        </ol>

        {finalData && (
          <div className="mt-6 pt-6 border-t border-line text-sm text-muted">
            Response time: {finalData.responseTimeSeconds}s · Time saved by route AI:{" "}
            {finalData.timeSavedMinutes} min
          </div>
        )}
      </motion.div>
    </div>
  );
}
