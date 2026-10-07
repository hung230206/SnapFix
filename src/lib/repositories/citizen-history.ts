import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { CitizenReport } from '@/domain/citizen-report';

interface CitizenHistoryDB extends DBSchema {
  citizen_reports: {
    key: string;
    value: CitizenReport;
    indexes: { 'by-createdAt': string };
  };
}

let dbPromise: Promise<IDBPDatabase<CitizenHistoryDB>> | null = null;

export function getCitizenHistoryDB() {
  if (!dbPromise && typeof window !== 'undefined') {
    dbPromise = openDB<CitizenHistoryDB>('snapfix-citizen-history-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('citizen_reports', {
          keyPath: 'id',
        });
        store.createIndex('by-createdAt', 'createdAt');
      },
    });
  }
  return dbPromise as Promise<IDBPDatabase<CitizenHistoryDB>>;
}

export async function saveCitizenReport(report: CitizenReport): Promise<void> {
  const db = await getCitizenHistoryDB();
  await db.put('citizen_reports', report);
}

export async function getCitizenReport(id: string): Promise<CitizenReport | undefined> {
  const db = await getCitizenHistoryDB();
  return db.get('citizen_reports', id);
}

export async function getAllCitizenReports(): Promise<CitizenReport[]> {
  const db = await getCitizenHistoryDB();
  return db.getAllFromIndex('citizen_reports', 'by-createdAt'); // Ascending order
}

export async function deleteCitizenReport(id: string): Promise<void> {
  const db = await getCitizenHistoryDB();
  await db.delete('citizen_reports', id);
}

export async function updateCitizenReportStatus(
  id: string, 
  status: CitizenReport['status'], 
  statusSource: CitizenReport['statusSource']
): Promise<void> {
  const db = await getCitizenHistoryDB();
  const report = await db.get('citizen_reports', id);
  if (report) {
    report.status = status;
    report.statusSource = statusSource;
    report.updatedAt = new Date().toISOString();
    await db.put('citizen_reports', report);
  }
}
