import { LocationConsistencyStatus } from "../models";

const LOCATION_MATCH_STRONG_METERS = 50;
const LOCATION_MATCH_ACCEPTABLE_METERS = 200;
const ACCURACY_MULTIPLIER = 1.5;

function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

export function calculateLocationConsistency(
  evidenceLat?: number,
  evidenceLng?: number,
  evidenceAccuracyMeters?: number,
  reportedLat?: number,
  reportedLng?: number
): { status: LocationConsistencyStatus, distanceMeters?: number, toleranceMeters?: number } {
  
  if (!evidenceLat || !evidenceLng || !reportedLat || !reportedLng) {
    return { status: "INSUFFICIENT_EVIDENCE" };
  }

  const distanceMeters = haversineDistanceMeters(evidenceLat, evidenceLng, reportedLat, reportedLng);
  
  const strongTolerance = Math.max(
    LOCATION_MATCH_STRONG_METERS,
    (evidenceAccuracyMeters || 0) * ACCURACY_MULTIPLIER
  );
  
  const acceptableTolerance = Math.max(
    LOCATION_MATCH_ACCEPTABLE_METERS,
    (evidenceAccuracyMeters || 0) * ACCURACY_MULTIPLIER
  );

  if (distanceMeters <= strongTolerance) {
    return { status: "STRONG_MATCH", distanceMeters, toleranceMeters: strongTolerance };
  } else if (distanceMeters <= acceptableTolerance) {
    return { status: "ACCEPTABLE_MATCH", distanceMeters, toleranceMeters: acceptableTolerance };
  } else {
    return { status: "MISMATCH", distanceMeters, toleranceMeters: acceptableTolerance };
  }
}
