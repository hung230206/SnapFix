import { Copy, Download, RefreshCcw, ArrowLeft, Info, Send, Building2 } from "lucide-react";
import styles from "./ReportConfirmation.module.css";
import Link from "next/link";
import type { CitizenReport } from "@/domain/citizen-report";

interface ReportConfirmationProps {
  submission?: CitizenReport['submission'];
  onNewReport?: () => void;
  preview: string | null;
  category: string;
  locationLabel: string;
  timeLabel: string;
  draft: string;
  originalDraft: string;
  setDraft: (value: string) => void;
  onEditInfo: () => void;
  onSetNotice: (msg: string) => void;
  onSaveToHistory?: () => void;
  saving?: boolean;
  onViewHistory?: () => void;
  receivingDepartment?: {
    id: string;
    name: string;
  };
  onSubmitReport?: () => void;
  submitting?: boolean;
}

export function ReportConfirmation({
  preview,
  category,
  locationLabel,
  timeLabel,
  draft,
  originalDraft,
  setDraft,
  onEditInfo,
  onSetNotice,
  onSaveToHistory,
  saving = false,
  onViewHistory,
  receivingDepartment,
  onSubmitReport,
  submitting = false,
  submission,
  onNewReport,
}: ReportConfirmationProps) {
  const isEdited = draft !== originalDraft;
  const isEmpty = draft.trim().length === 0;
  const departmentReady = Boolean(receivingDepartment?.id.trim() && receivingDepartment?.name.trim());
  const canSubmit = Boolean(onSubmitReport) && !submission;

  if (submission) return <div className={styles.container}>
    <section className={styles.card} aria-live="polite">
      <h2>Đã gửi phản ánh · Chờ duyệt</h2>
      <p>Báo cáo độc lập của bạn đã được lưu trong bản demo.</p>
      <p><strong>{category}</strong> · {locationLabel}</p>
      <p>Mã sự cố: {submission.incidentId}</p>
      <p><strong>{submission.reportCount} lượt phản ánh</strong> · Ưu tiên: {submission.priority === 'HIGH' ? 'Cao' : submission.priority === 'MEDIUM' ? 'Trung bình' : 'Thấp'}</p>
      <p className={styles.muted}>{submission.priorityReason}</p>
      <p className={styles.muted}>Đã lưu → đối chiếu cùng loại trong 30 m / 7 ngày → cập nhật lượt phản ánh → cập nhật ưu tiên → cán bộ demo nhận báo cáo. Nếu thiếu GPS, báo cáo được giữ riêng để cán bộ đối chiếu.</p>
      <p className={styles.muted}>Số lượt là số báo cáo, chưa xác minh số người khác nhau. Dữ liệu chỉ trên trình duyệt này; chưa gửi tới cơ quan thật.</p>
    </section>
    <Link className={styles.primary} href="/officer/reports">Xem danh sách cán bộ demo</Link>
    <button className={styles.secondary} onClick={onViewHistory}>Theo dõi trong lịch sử</button>
    <button className={styles.secondary} onClick={onNewReport}>Tạo phản ánh mới</button>
  </div>;

  const handleRestore = () => {
    if (isEdited) {
      if (!window.confirm("Bạn có chắc chắn muốn khôi phục bản nháp gốc? Những thay đổi của bạn sẽ bị mất.")) {
        return;
      }
    }
    setDraft(originalDraft);
    onSetNotice("Đã khôi phục bản nháp theo thông tin hiện tại.");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      onSetNotice("Đã sao chép nội dung phản ánh.");
    } catch {
      onSetNotice("Trình duyệt chưa cho phép sao chép. Bạn có thể chọn nội dung trong ô bên trên hoặc tải bản nháp.");
    }
  };

  const handleDownload = () => {
    const url = URL.createObjectURL(new Blob([draft], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "SnapFix-phan-anh.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    onSetNotice("Đã tải bản nháp. Phản ánh chưa được gửi đến cơ quan chức năng.");
  };

  return (
    <div className={styles.container}>
      <section className={styles.summary}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {preview && <img src={preview} alt="Ảnh sự cố đang soạn phản ánh" />}
        <div className={styles.summaryInfo}>
          <h2>{category}</h2>
          <p>{locationLabel}</p>
          <p>{timeLabel}</p>
          <button className={styles.textButton} onClick={onEditInfo}>
            Sửa thông tin
          </button>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeading}>
          <label htmlFor="report-draft">Nội dung phản ánh</label>
          <button className={styles.textButton} onClick={handleRestore}>
            <RefreshCcw size={15} /> Khôi phục bản gốc
          </button>
        </div>
        
        {isEmpty && <p className={styles.warningText}>Vui lòng nhập nội dung phản ánh.</p>}
        {!isEmpty && <p className={styles.muted}>Đây là bản nháp mẫu. Hãy bổ sung tình trạng thực tế trước khi gửi.</p>}
        
        <textarea
          id="report-draft"
          rows={13}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className={styles.textarea}
        />
        <div className={styles.charCount}>{draft.length} ký tự</div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.departmentTitle}><Building2 size={19} /> Đơn vị tiếp nhận</h2>
        <p className={styles.muted}>
          {departmentReady ? receivingDepartment?.name : "Hàng đợi cán bộ demo · Chờ duyệt (NEW)"}
        </p>
        <p className={styles.muted}>Đơn vị phụ trách sẽ được xác định theo loại sự cố và địa bàn trong luồng cán bộ.</p>
      </section>

      <p className={styles.disclaimer}>
        <Info size={18} />
        <span>Mỗi lần gửi tạo một báo cáo độc lập. Bản demo lưu trên trình duyệt, đối chiếu báo cáo cùng loại gần vị trí rồi cập nhật lượt phản ánh và ưu tiên. Chưa có AI hoặc gửi tới cơ quan thật.</span>
      </p>

      <div className={styles.actions}>
        <button
          className={styles.primary}
          disabled={isEmpty || saving || submitting || !canSubmit}
          onClick={onSubmitReport}
          aria-describedby={!canSubmit ? "submission-unavailable" : undefined}
        >
          <Send size={19} /> {submitting ? "Đang lưu và đối chiếu…" : "Gửi báo cáo độc lập (demo)"}
        </button>
        {!canSubmit && <p id="submission-unavailable" className={styles.muted}>Nút gửi sẽ được bật khi đơn vị tiếp nhận và backend được kết nối. Bạn vẫn có thể lưu bản nháp vào lịch sử.</p>}
        {onSaveToHistory && (
          <button className={styles.secondary} disabled={isEmpty || saving || submitting} onClick={onSaveToHistory}>
            {saving ? "Đang lưu…" : "Lưu vào lịch sử"}
          </button>
        )}
        {onViewHistory && (
          <button className={styles.secondary} disabled={saving} onClick={onViewHistory}>
            Xem lịch sử
          </button>
        )}
        <button className={styles.secondary} disabled={isEmpty} onClick={handleCopy}>
          <Copy size={19} /> Sao chép nội dung
        </button>
        <button className={styles.secondary} disabled={isEmpty} onClick={handleDownload}>
          <Download size={19} /> Tải bản nháp
        </button>
        <button className={styles.textButton} onClick={onEditInfo}>
          <ArrowLeft size={17} /> Quay lại
        </button>
      </div>
    </div>
  );
}
