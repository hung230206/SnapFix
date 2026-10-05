import { Incident } from "../models";

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

export function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export const DUPLICATE_RADIUS_METERS = 30;

export function findDuplicateCandidate(
  incidents: Incident[],
  lat: number,
  lng: number,
  issueTypeCode: string
): { incidentId: string; distanceMeters: number } | null {
  const openIncidents = incidents.filter(i => 
    i.issueTypeCode === issueTypeCode && 
    i.status !== "CLOSED" && 
    i.status !== "CANCELLED"
  );

  let closestId: string | null = null;
  let minDistance = DUPLICATE_RADIUS_METERS;

  for (const incident of openIncidents) {
    if (incident.centroidLat && incident.centroidLng) {
      const distance = haversineDistanceMeters(lat, lng, incident.centroidLat, incident.centroidLng);
      if (distance <= minDistance) {
        minDistance = distance;
        closestId = incident.id;
      }
    }
  }

  return closestId ? { incidentId: closestId, distanceMeters: minDistance } : null;
}
