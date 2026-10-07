import { Copy, Download, RefreshCcw, ArrowLeft, Info, ExternalLink } from "lucide-react";
import styles from "./ReportConfirmation.module.css";

interface ReportConfirmationProps {
  preview: string | null;
  category: string;
  locationLabel: string;
  timeLabel: string;
  draft: string;
  originalDraft: string;
  setDraft: (value: string) => void;
  onEditInfo: () => void;
  onSetNotice: (msg: string) => void;
  receivingChannel?: {
    name: string;
    reportUrl: string;
  };
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
  receivingChannel,
}: ReportConfirmationProps) {
  const isEdited = draft !== originalDraft;
  const isEmpty = draft.trim().length === 0;

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
      onSetNotice("Đã sao chép nội dung. Bạn có thể dán vào kênh tiếp nhận chính thức.");
    } catch {
      onSetNotice("Trình duyệt chưa cho phép sao chép. Bạn có thể chọn nội dung trong ô bên trên hoặc tải bản nháp.");
    }
  };

  const handleDownload = () => {
    const url = URL.createObjectURL(new Blob([draft], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "SnapFix-CT-phan-anh.txt";
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
        <h2>Kênh tiếp nhận</h2>
        <p className={styles.muted}>
          {receivingChannel ? receivingChannel.name : "Kênh tiếp nhận sẽ được bổ sung sau."}
        </p>
      </section>

      <p className={styles.disclaimer}>
        <Info size={18} />
        <span>SnapFix CT chỉ hỗ trợ chuẩn bị nội dung phản ánh. Việc gửi được thực hiện tại kênh chính thức của cơ quan chức năng.</span>
      </p>

      <div className={styles.actions}>
        <button className={styles.primary} disabled={isEmpty} onClick={handleCopy}>
          <Copy size={19} /> Sao chép nội dung
        </button>
        <button className={styles.secondary} disabled={isEmpty} onClick={handleDownload}>
          <Download size={19} /> Tải bản nháp
        </button>
        <button className={styles.secondary} disabled title="Chưa có kênh tiếp nhận">
          <ExternalLink size={19} /> Mở trang báo cáo
        </button>
        <button className={styles.textButton} onClick={onEditInfo}>
          <ArrowLeft size={17} /> Quay lại
        </button>
      </div>
    </div>
  );
}
