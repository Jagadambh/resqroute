import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const JAMSHEDPUR_CENTER = [22.8046, 86.2029];

// Custom colored dot markers (semantic colors from the design system) rather than
// Leaflet's default blue pin, so severity/type is legible at a glance on the map.
function dotIcon(color, size = 14) {
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:2px solid #0B1120;box-shadow:0 0 0 3px ${color}33;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const ICONS = {
  incidentCritical: dotIcon("#EF4444", 16),
  incidentHigh: dotIcon("#EF4444", 14),
  incidentMedium: dotIcon("#F59E0B", 13),
  incidentLow: dotIcon("#22C55E", 12),
  vehicle: dotIcon("#2563EB", 14),
  hospital: dotIcon("#22C55E", 16),
};

function severityIcon(severity) {
  if (severity === "critical") return ICONS.incidentCritical;
  if (severity === "high") return ICONS.incidentHigh;
  if (severity === "medium") return ICONS.incidentMedium;
  return ICONS.incidentLow;
}

export default function MapView({ incidents = [], vehicles = [], hospitals = [], activeRoute = null, onIncidentClick }) {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-line">
      <MapContainer
        center={JAMSHEDPUR_CENTER}
        zoom={13}
        style={{ width: "100%", height: "100%", background: "#0B1120" }}
        zoomControl={true}
      >
        {/* Dark-friendly OSM tile layer (CARTO dark matter, free, no API key required) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {incidents.map((incident) => (
          <Marker
            key={incident._id}
            position={[incident.latitude, incident.longitude]}
            icon={severityIcon(incident.severity)}
            eventHandlers={{ click: () => onIncidentClick?.(incident) }}
          >
            <Popup>
              <div className="text-sm">
                <strong>{incident.incidentId}</strong> — {incident.type.replace("_", " ")}
                <br />
                {incident.location}
                <br />
                Severity: {incident.severity}
              </div>
            </Popup>
          </Marker>
        ))}

        {vehicles.map((vehicle) => (
          <Marker
            key={vehicle._id}
            position={[vehicle.location.latitude, vehicle.location.longitude]}
            icon={ICONS.vehicle}
          >
            <Popup>
              <div className="text-sm">
                <strong>{vehicle.vehicleId}</strong> ({vehicle.type})
                <br />
                Status: {vehicle.status}
                {vehicle.etaMinutes != null && (
                  <>
                    <br />
                    ETA: {vehicle.etaMinutes} min
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {hospitals.map((hospital) => (
          <Marker key={hospital._id} position={[hospital.latitude, hospital.longitude]} icon={ICONS.hospital}>
            <Popup>
              <div className="text-sm">
                <strong>{hospital.name}</strong>
                <br />
                Beds available: {hospital.availableBeds}/{hospital.emergencyCapacity}
              </div>
            </Popup>
          </Marker>
        ))}

        {activeRoute && (
          <Polyline
            positions={activeRoute.map((p) => [p.latitude, p.longitude])}
            pathOptions={{ color: "#22C55E", weight: 4, opacity: 0.8 }}
          />
        )}
      </MapContainer>
    </div>
  );
}
