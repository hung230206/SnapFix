"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Incident } from "@/domain/models";
import { demoIssueTypes } from "@/lib/repositories/mockData";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { Button } from "../ui/button";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function IncidentMapViewer({ incidents }: { incidents: Incident[] }) {
  const center: [number, number] = [10.762622, 106.660172]; // HCM City

  return (
    <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {incidents.filter(i => i.centroidLat && i.centroidLng).map(inc => {
        const issueName = demoIssueTypes.find(it => it.code === inc.issueTypeCode)?.nameVi || inc.issueTypeCode;
        return (
          <Marker key={inc.id} position={[inc.centroidLat!, inc.centroidLng!]} icon={icon}>
            <Popup>
              <div className="p-1 min-w-[200px]">
                <div className="font-semibold text-base mb-1">{issueName}</div>
                <div className="text-xs text-gray-500 mb-2">{inc.publicCode}</div>
                <div className="flex gap-1 mb-3">
                  <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold">{inc.status}</span>
                  <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">{inc.priorityLevel}</span>
                </div>
                <Link href={`/incidents/${inc.id}`}>
                  <Button size="sm" className="w-full">Xem chi tiết</Button>
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
