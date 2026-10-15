import { useEffect, useState, useMemo } from "react";
import { Search, Filter, AlertCircle, X } from "lucide-react";
import { CitizenReport, ReportStatus } from "@/domain/citizen-report";
import { getAllCitizenReports } from "@/lib/repositories/citizen-history";
import { ReportHistoryDetail } from "./ReportHistoryDetail";
import styles from "./ReportHistory.module.css";

const statusFilters: (ReportStatus | "Tất cả")[] = [
  "Tất cả", "Đã chuẩn bị", "Chờ duyệt", "Đã mở kênh tiếp nhận", "Đang xử lý", "Đã xử lý"
];

export function ReportHistoryList({ onBack, onNewReport, onEditReport }: { onBack: () => void, onNewReport: () => void, onEditReport: (id: string) => void }) {
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ReportStatus | "Tất cả">("Tất cả");
  const [selectedReport, setSelectedReport] = useState<CitizenReport | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllCitizenReports();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReports(data.reverse()); // Mới nhất ở trên
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("Không thể tải dữ liệu lịch sử.");
    } finally {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (filter !== "Tất cả" && r.status !== filter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!r.id.toLowerCase().includes(q) && 
            !r.category.toLowerCase().includes(q) && 
            !r.location.text.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [reports, search, filter]);

  if (loading) {
    return <div className={styles.content}>Đang tải dữ liệu...</div>;
  }

  if (error) {
    return (
      <div className={styles.content}>
        <p className={styles.errorText}>{error}</p>
        <button className={styles.primary} onClick={loadData}>Thử lại</button>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>Bạn chưa lưu phản ánh nào.</p>
        <button className={styles.primary} onClick={onNewReport}>Tạo phản ánh</button>
      </div>
    );
  }

  return (
    <>
      <div className={styles.content}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input 
            placeholder="Tìm theo mã, loại hoặc địa điểm..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        
        <div className={styles.filters}>
          {statusFilters.map(f => (
            <button 
              key={f}
              className={styles.filterChip}
              data-active={filter === f}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {filteredReports.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Không có kết quả nào phù hợp.</p>
            <button className={styles.secondary} onClick={() => { setSearch(""); setFilter("Tất cả"); }}>Bỏ bộ lọc</button>
          </div>
        ) : (
          <div className={styles.list}>
            {filteredReports.map(report => (
              <ReportCard key={report.id} report={report} onClick={() => setSelectedReport(report)} />
            ))}
          </div>
        )}
      </div>
      
      {selectedReport && (
        <ReportHistoryDetail 
          report={selectedReport} 
          onClose={() => setSelectedReport(null)}
          onUpdate={loadData}
          onEdit={() => onEditReport(selectedReport.id)}
        />
      )}
    </>
  );
}

function ReportCard({ report, onClick }: { report: CitizenReport, onClick: () => void }) {
  const [imgUrl, setImgUrl] = useState<string>("");

  useEffect(() => {
    const url = URL.createObjectURL(report.imageBlob);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [report.imageBlob]);

  const date = new Date(report.createdAt).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric"
  });

  return (
    <div className={styles.card} onClick={onClick}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {imgUrl ? <img src={imgUrl} className={styles.cardImg} alt="" /> : <div className={styles.cardImg} />}
      <div className={styles.cardInfo}>
        <div className={styles.cardHeader}>
          <span className={styles.cardId}>#{report.id.slice(0,6)}</span>
          <span className={styles.statusBadge} data-status={report.status}>{report.status}</span>
        </div>
        <h3 className={styles.cardCategory}>{report.category}</h3>
        <p className={styles.cardLocation}>{report.location.text || (report.location.lat != null && report.location.lng != null ? `${report.location.lat.toFixed(5)}, ${report.location.lng.toFixed(5)}` : "Chưa có địa điểm")}</p>
        {report.submission && <p className={styles.cardLocation}>{report.submission.reportCount} lượt phản ánh · Ưu tiên {report.submission.priority === 'HIGH' ? 'cao' : report.submission.priority === 'MEDIUM' ? 'trung bình' : 'thấp'}</p>}
        <div className={styles.cardFooter}>
          <span className={styles.cardDate}>{date}</span>
        </div>
      </div>
    </div>
  );
}
