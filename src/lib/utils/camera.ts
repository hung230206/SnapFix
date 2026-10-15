import exifr from "exifr";
import type { LocationData } from "../store/ReportContext";

export async function requestGeolocation(): Promise<{ lat: number; lng: number } | null> {
  if (!navigator.geolocation) return null;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => resolve(null), // Timeout, denied, or unavailable
      { timeout: 5000, enableHighAccuracy: true }
    );
  });
}

export async function readPhotoMeta(file: File): Promise<{
  location: LocationData;
  capturedAt: string;
  timeFromExif: boolean;
}> {
  let location: LocationData = { type: "manual", text: "" };
  let capturedAt = new Date(file.lastModified).toISOString();
  let timeFromExif = false;

  try {
    // Read general EXIF data (for time)
    const meta = await exifr.parse(file);
    
    // Read GPS data specifically
    const gpsData = await exifr.gps(file);

    if (gpsData && Number.isFinite(gpsData.latitude) && Number.isFinite(gpsData.longitude)) {
      location = { type: "exif", lat: gpsData.latitude, lng: gpsData.longitude, text: "" };
    }

    if (meta?.DateTimeOriginal && Number.isFinite(new Date(meta.DateTimeOriginal).getTime())) {
      capturedAt = new Date(meta.DateTimeOriginal).toISOString();
      timeFromExif = true;
    }
  } catch (error) {
    console.warn("Failed to parse EXIF data", error);
  }

  return { location, capturedAt, timeFromExif };
}
