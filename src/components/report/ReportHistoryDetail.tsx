import { useEffect, useState } from "react";
import { X, Copy, Download, Edit3, Trash2, Info } from "lucide-react";
import { CitizenReport, ReportStatus } from "@/domain/citizen-report";
import { deleteCitizenReport, updateCitizenReportStatus } from "@/lib/repositories/citizen-history";
import styles from "./ReportHistory.module.css";

export function ReportHistoryDetail({ 
  report, 
  onClose, 
  onUpdate,
  onEdit 
}: { 
  report: CitizenReport, 
  onClose: () => void, 
  onUpdate: () => void,
  onEdit: () => void
}) {
  const [imgUrl, setImgUrl] = useState<string>("");
  const [status, setStatus] = useState<ReportStatus>(report.status);

  useEffect(() => {
    const url = URL.createObjectURL(report.imageBlob);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [report.imageBlob]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report.editedDraft);
      alert("Đã sao chép nội dung.");
    } catch {
      alert("Không thể sao chép. Vui lòng chọn và sao chép thủ công.");
    }
  };

  const handleDownload = () => {
    const url = URL.createObjectURL(new Blob([report.editedDraft], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `SnapFix-${report.id.slice(0,6)}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleStatusChange = async (newStatus: ReportStatus) => {
    setStatus(newStatus);
    await updateCitizenReportStatus(report.id, newStatus, "user");
    onUpdate();
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc muốn xóa bản lưu này?\n\nThao tác này chỉ xóa bản lưu trên thiết bị này, không thu hồi phản ánh đã gửi qua kênh khác.")) {
      await deleteCitizenReport(report.id);
      onUpdate();
      onClose();
    }
  };

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <div className={styles.detailOverlay} onClick={onClose}>
      <div className={styles.detailPanel} onClick={e => e.stopPropagation()}>
        <div className={styles.detailHeader}>
          <h2>Chi tiết phản ánh</h2>
          <button className={styles.iconButton} onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className={styles.detailContent}>
          {imgUrl && <img src={imgUrl} className={styles.detailImage} alt="Sự cố" />}
          
          <div className={styles.detailSection}>
            <h3>Mã phản ánh</h3>
            <div className={styles.detailRow}>#{report.id}</div>
          </div>
          
          <div className={styles.detailSection}>
            <h3>Thông tin sự cố</h3>
            <div className={styles.detailRow}>
              <div>
                <strong>{report.category}</strong><br/>
                {report.submission && <p>{report.submission.reportCount} lượt phản ánh · Ưu tiên {report.submission.priority === 'HIGH' ? 'cao' : report.submission.priority === 'MEDIUM' ? 'trung bình' : 'thấp'} (demo)</p>}
                {report.location.text}
              </div>
            </div>
          </div>

          <div className={styles.detailSection}>
            <h3>Thời gian</h3>
            <div className={styles.detailRow}>
              <div>
                Ghi nhận: {formatTime(report.capturedAt)}<br/>
                Chuẩn bị: {formatTime(report.createdAt)}
              </div>
            </div>
          </div>
          
          <div className={styles.detailSection}>
            <h3>Nội dung</h3>
            <div className={styles.draftContent}>{report.editedDraft}</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button className={styles.secondary} style={{flex: 1, minHeight: '40px', fontSize: '13px'}} onClick={handleCopy}><Copy size={16}/> Sao chép</button>
              <button className={styles.secondary} style={{flex: 1, minHeight: '40px', fontSize: '13px'}} onClick={handleDownload}><Download size={16}/> Tải .txt</button>
            </div>
          </div>

          <div className={styles.detailSection}>
            <h3>Đơn vị tiếp nhận</h3>
            <div className={styles.detailRow}>
              {report.receivingDepartment?.name || report.receivingChannel?.name || "Chưa cấu hình đơn vị tiếp nhận"}
            </div>
          </div>

          <div className={styles.detailSection}>
            <h3>Tình trạng theo dõi</h3>
            <select 
              className={styles.statusSelect} 
              value={status} 
              disabled={Boolean(report.submission)}
              onChange={e => handleStatusChange(e.target.value as ReportStatus)}
            >
              <option value="Chờ duyệt">Chờ duyệt</option>
              <option value="Đã chuẩn bị">Đã chuẩn bị</option>
              <option value="Đã mở kênh tiếp nhận">Đã mở kênh tiếp nhận</option>
              <option value="Đang xử lý">Đang xử lý</option>
              <option value="Đã xử lý">Đã xử lý</option>
            </select>
            {report.statusSource === "user" && <span style={{fontSize: '11px', color: '#69776f'}}>* Do bạn cập nhật</span>}
            <div className={styles.disclaimer}>
              <Info size={16} /> SnapFix chưa đồng bộ tình trạng xử lý từ cơ quan tiếp nhận.
            </div>
          </div>

          <div className={styles.detailActions}>
            {!report.submission && <button className={styles.primary} onClick={onEdit}><Edit3 size={18} /> Chỉnh sửa nội dung</button>}
            <button className={styles.deleteButton} onClick={handleDelete}><Trash2 size={18} /> Xóa khỏi lịch sử</button>
          </div>
        </div>
      </div>
    </div>
  );
}
