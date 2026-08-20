import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import RoleSelection from "./pages/RoleSelection.jsx";
import ControlCenterLayout from "./layouts/ControlCenterLayout.jsx";
import ControlDashboard from "./pages/control/ControlDashboard.jsx";
import IncidentCenter from "./pages/control/IncidentCenter.jsx";
import EmergencyFleet from "./pages/control/EmergencyFleet.jsx";
import TrafficIntelligence from "./pages/control/TrafficIntelligence.jsx";
import Analytics from "./pages/control/Analytics.jsx";
import CameraMonitoring from "./pages/control/CameraMonitoring.jsx";
import AIDetection from "./pages/control/AIDetection.jsx";
import RouteAnalysis from "./pages/control/RouteAnalysis.jsx";
import NotificationCenter from "./pages/control/NotificationCenter.jsx";
import CitizenApp from "./pages/citizen/CitizenApp.jsx";
import HospitalDashboard from "./pages/hospital/HospitalDashboard.jsx";
import EmergencyServicesView from "./pages/emergency/EmergencyServicesView.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<RoleSelection />} />

      <Route
        path="/control"
        element={
          <ProtectedRoute role="control_center">
            <ControlCenterLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ControlDashboard />} />
        <Route path="incidents" element={<IncidentCenter />} />
        <Route path="fleet" element={<EmergencyFleet />} />
        <Route path="traffic" element={<TrafficIntelligence />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="cameras" element={<CameraMonitoring />} />
        <Route path="detection" element={<AIDetection />} />
        <Route path="routes" element={<RouteAnalysis />} />
        <Route path="notifications" element={<NotificationCenter />} />
      </Route>

      <Route
        path="/emergency"
        element={
          <ProtectedRoute role="emergency_services">
            <EmergencyServicesView />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hospital"
        element={
          <ProtectedRoute role="hospital">
            <HospitalDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/citizen"
        element={
          <ProtectedRoute role="citizen">
            <CitizenApp />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
