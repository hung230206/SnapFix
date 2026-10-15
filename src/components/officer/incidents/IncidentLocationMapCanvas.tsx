"use client";

import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function IncidentLocationMapCanvas({
  lat,
  lng,
  label,
}: {
  lat: number;
  lng: number;
  label: string;
}) {
  return (
    <div className="h-[260px] overflow-hidden rounded-[12px]" aria-label={`Bản đồ vị trí ${label}`}>
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CircleMarker
          center={[lat, lng]}
          radius={10}
          pathOptions={{ color: "#FFFFFF", fillColor: "#087F46", fillOpacity: 1, weight: 4 }}
        >
          <Popup>{label}</Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}
