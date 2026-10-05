"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

interface ManualLocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onSelect: (lat: number, lng: number) => void;
}

export default function ManualLocationPicker({ initialLat, initialLng, onSelect }: ManualLocationPickerProps) {
  const defaultCenter: [number, number] = [10.762622, 106.660172]; // HCM City
  const center: [number, number] = initialLat && initialLng ? [initialLat, initialLng] : defaultCenter;

  const [position, setPosition] = useState<[number, number]>(center);

  const handleSelect = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onSelect(lat, lng);
  };

  return (
    <div className="h-[50vh] w-full rounded-md overflow-hidden border">
      <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onLocationSelect={handleSelect} />
        <Marker position={position} icon={icon} />
      </MapContainer>
    </div>
  );
}
