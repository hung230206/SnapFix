"use client";

import { useEffect, useState } from 'react';
import type { CitizenReport } from '@/domain/citizen-report';
import { getSubmittedCitizenReports } from '@/services/citizen-submission-service';

export function CitizenInbox() {
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [sort, setSort] = useState('newest');
  useEffect(() => {
    let active = true;
    const load = () => getSubmittedCitizenReports().then(data => {
      if (active) { setReports(data); setError(''); }
    }).catch(() => { if (active) setError('Không đọc được dữ liệu. Hãy thử tải lại trang.'); })
      .finally(() => { if (active) setLoading(false); });
    void load();
    window.addEventListener('focus', load);
    window.addEventListener('snapfix-submitted', load);
    return () => { active = false; window.removeEventListener('focus', load); window.removeEventListener('snapfix-submitted', load); };
  }, []);
  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();
  const rows = reports.filter(report => (!priority || report.submission?.priority === priority) && normalize(`${report.id} ${report.category} ${report.location.text} ${report.editedDraft}`).includes(normalize(search.trim())));
  if (sort === 'priority') rows.sort((a, b) => ({ HIGH: 3, MEDIUM: 2, LOW: 1 }[b.submission!.priority] - { HIGH: 3, MEDIUM: 2, LOW: 1 }[a.submission!.priority]));
  return <section className="rounded-2xl border bg-white p-4 md:p-6 space-y-4">
    <h2 className="text-xl font-bold">Phản ánh từ người dân · MVP</h2>
    <p className="text-sm text-gray-600">Dữ liệu đã gửi trên trình duyệt này. Mỗi báo cáo giữ nguyên ảnh và nội dung; các báo cáo liên quan dùng chung số lượt và ưu tiên. Chưa tích hợp AI hoặc hệ thống tiếp nhận thật.</p>
    <div className="flex flex-wrap gap-3">
      <input className="border rounded-lg p-2 min-w-0 flex-1" aria-label="Tìm phản ánh" placeholder="Tìm mã, loại, địa điểm, nội dung…" value={search} onChange={e => setSearch(e.target.value)} />
      <select className="border rounded-lg p-2" aria-label="Lọc ưu tiên" value={priority} onChange={e => setPriority(e.target.value)}><option value="">Mọi ưu tiên</option><option value="LOW">Thấp</option><option value="MEDIUM">Trung bình</option><option value="HIGH">Cao</option></select>
      <select className="border rounded-lg p-2" aria-label="Sắp xếp" value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Mới nhất</option><option value="priority">Ưu tiên cao trước</option></select>
    </div>
    {loading ? <p role="status">Đang tải phản ánh…</p> : error ? <p role="alert">{error}</p> : !rows.length ? <p>Chưa có phản ánh phù hợp. Bạn có thể gửi thử từ trang người dân.</p> : rows.map(report => <InboxCard key={report.id} report={report} />)}
  </section>;
}

function InboxCard({ report }: { report: CitizenReport }) {
  const [image, setImage] = useState('');
  useEffect(() => {
    const url = URL.createObjectURL(report.imageBlob);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImage(url);
    return () => URL.revokeObjectURL(url);
  }, [report.imageBlob]);
  const data = report.submission!;
  return <article className="border rounded-xl p-4 space-y-3 break-words">
    <div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold">{report.category}</h3><span className="text-sm text-emerald-700">Chờ duyệt · NEW</span></div>
    <p className="text-sm text-gray-600">Báo cáo: {report.id}<br />Sự cố: {data.incidentId}</p>
    <div className="flex flex-wrap gap-2 text-sm"><strong className="rounded-full bg-emerald-50 px-3 py-1">{data.reportCount} lượt phản ánh</strong><strong className="rounded-full bg-amber-50 px-3 py-1">Ưu tiên {data.priority === 'HIGH' ? 'cao' : data.priority === 'MEDIUM' ? 'trung bình' : 'thấp'}</strong></div>
    <p>{report.location.text || 'Vị trí GPS'} {report.location.lat != null && report.location.lng != null ? `(${report.location.lat.toFixed(5)}, ${report.location.lng.toFixed(5)})` : '· Chưa có tọa độ để đối chiếu'}</p>
    <p className="text-sm">{new Date(data.submittedAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} · Loại do người dân chọn · Confidence: chưa có</p>
    <details><summary className="cursor-pointer text-emerald-800 font-semibold">Xem ảnh và nội dung báo cáo</summary>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {image && <img src={image} alt="Ảnh người dân gửi" className="mt-3 max-h-72 w-full object-contain rounded-lg" />}
      <p className="whitespace-pre-wrap my-3">{report.editedDraft}</p><p className="text-sm text-gray-600">{data.priorityReason}</p>
      <p className="text-sm mt-2">Tiến trình dự kiến: Chờ duyệt → Đã tiếp nhận → Đã phân công → Đang xử lý → Chờ xác nhận → Đã hoàn thành. Thao tác xử lý sẽ nối với luồng cán bộ sau.</p>
    </details>
  </article>;
}
