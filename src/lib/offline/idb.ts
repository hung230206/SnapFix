import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface SnapFixDB extends DBSchema {
  pending_observations: {
    key: string;
    value: {
      localId: string;
      imageBlob: Blob;
      imagePreviewUrl?: string;
      source: "OFFLINE_CAPTURE" | "LIVE_CAMERA" | "FILE_UPLOAD";
      capturedAt?: string;

      // Evidence fields
      exifGpsAvailable?: boolean;
      exifLat?: number;
      exifLng?: number;

      captureDeviceLat?: number;
      captureDeviceLng?: number;
      captureDeviceAccuracyMeters?: number;

      // Report fields
      issueTypeCode?: string;
      title?: string;
      description?: string;
      answers?: Record<string, any>;
      
      // Final confirmed location
      reportedLat?: number;
      reportedLng?: number;
      locationSource?: "LIVE_DEVICE" | "EXIF" | "MANUAL_PIN" | "ADDRESS_GEOCODED";
      addressText?: string;
      
      syncStatus: "DRAFT" | "PENDING_SYNC" | "SYNCING" | "SYNCED" | "FAILED";
      errorMessage?: string;
    };
    indexes: { 'by-status': string };
  };
}

let dbPromise: Promise<IDBPDatabase<SnapFixDB>> | null = null;

export function getDB() {
  if (!dbPromise && typeof window !== 'undefined') {
    dbPromise = openDB<SnapFixDB>('snapfix-db', 2, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (oldVersion < 1) {
          const store = db.createObjectStore('pending_observations', {
            keyPath: 'localId',
          });
          store.createIndex('by-status', 'syncStatus');
        }
        if (oldVersion < 2) {
          // Just an example of versioning, schema changed above
        }
      },
    });
  }
  return dbPromise as Promise<IDBPDatabase<SnapFixDB>>;
}

export async function saveDraftObservation(data: any) {
  const db = await getDB();
  await db.put('pending_observations', data);
}

export async function getDraftObservation(localId: string) {
  const db = await getDB();
  return db.get('pending_observations', localId);
}

export async function getPendingSyncObservations() {
  const db = await getDB();
  return db.getAllFromIndex('pending_observations', 'by-status', 'PENDING_SYNC');
}

export async function deleteObservation(localId: string) {
  const db = await getDB();
  await db.delete('pending_observations', localId);
}
