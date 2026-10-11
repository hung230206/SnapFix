"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import type { IncidentStatusTone } from "@/domain/incident/status";
import type { OfficerMapIncident } from "@/services/officer-map-service";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const TONE_CLASSES: Record<IncidentStatusTone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  info: "bg-blue-100 text-blue-700",
  warning: "bg-amber-100 text-amber-700",
  success: "bg-emerald-100 text-emerald-700",
  danger: "bg-red-100 text-red-700",
  muted: "bg-gray-100 text-gray-600",
};

export default function OfficerIncidentMapViewer({
  incidents,
}: {
  incidents: OfficerMapIncident[];
}) {
  const center: [number, number] = incidents[0]
    ? [incidents[0].lat, incidents[0].lng]
    : [10.762622, 106.660172];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {incidents.map((incident) => (
        <Marker
          key={incident.id}
          position={[incident.lat, incident.lng]}
          icon={icon}
        >
          <Popup>
            <div className="min-w-[200px] p-1">
              <div className="mb-1 text-base font-semibold">
                {incident.issueType}
              </div>
              <div className="mb-2 text-xs text-gray-500">
                {incident.publicCode}
              </div>
              <div className="mb-3 flex flex-wrap gap-1">
                <span
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold ${TONE_CLASSES[incident.status.tone]}`}
                >
                  {incident.status.label}
                </span>
                <span
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold ${TONE_CLASSES[incident.priority.tone]}`}
                >
                  {incident.priority.label}
                </span>
              </div>
              <Link
                href={`/officer/incidents/${incident.id}`}
                className="inline-flex min-h-9 w-full items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
              >
                Xem chi tiết
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
