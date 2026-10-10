import type { CitizenReport } from '@/domain/citizen-report';
import { currentSubmission, prepareSubmission } from '@/domain/citizen-mvp';
import { getCitizenHistoryDB } from '@/lib/repositories/citizen-history';

export async function submitCitizenReport(report: CitizenReport) {
  if (!report.imageBlob.size || !report.editedDraft.trim() || !report.category.trim()) throw new Error('Thiếu ảnh hoặc nội dung phản ánh.');
  const { lat, lng, text } = report.location;
  if (!text.trim() && !(typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180)) throw new Error('Vui lòng xác nhận vị trí.');
  const db = await getCitizenHistoryDB();
  // One transaction serializes submissions across tabs and prevents double counting.
  const tx = db.transaction(['citizen_reports', 'citizen_submissions'], 'readwrite');
  const submitted = await tx.objectStore('citizen_submissions').getAll();
  const result = prepareSubmission(report, submitted);
  await tx.objectStore('citizen_submissions').put(result);
  await tx.objectStore('citizen_reports').put(result);
  await tx.done;
  window.dispatchEvent(new Event('snapfix-submitted'));
  return currentSubmission(result, [...submitted.filter(item => item.id !== result.id), result]);
}

export async function getSubmittedCitizenReports() {
  const db = await getCitizenHistoryDB();
  const reports = await db.getAll('citizen_submissions');
  return reports.map(report => currentSubmission(report, reports)).sort((a, b) => b.submission!.submittedAt.localeCompare(a.submission!.submittedAt));
}
