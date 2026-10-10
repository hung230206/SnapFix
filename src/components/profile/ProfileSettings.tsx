"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Save, History, Trash2, RotateCcw, AlertCircle, UserRound, MapPin, ShieldCheck } from "lucide-react";
import { useUserPreferences } from "@/lib/store/UserPreferencesContext";
import { clearCitizenHistory, countCitizenReports } from "@/lib/repositories/citizen-history";
import styles from "./ProfileSettings.module.css";

export function ProfileSettings() {
  const { isLoaded } = useUserPreferences();
  return isLoaded ? <SettingsForm /> : <main className={styles.content} role="status">Đang tải cài đặt…</main>;
}

function SettingsForm() {
  const { preferences, updatePreferences, resetPreferences, storageError } = useUserPreferences();
  const [name, setName] = useState(preferences.displayName);
  const [reportCount, setReportCount] = useState<number | null>(null);
  const [countError, setCountError] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [gpsStatus, setGpsStatus] = useState("Không xác định được");

  const loadCount = useCallback(async () => {
    setCountError(false);
    try { setReportCount(await countCitizenReports()); }
    catch { setReportCount(null); setCountError(true); }
  }, []);

  useEffect(() => {
    // Fetch only the count, without loading every stored photo into memory.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCount();
  }, [loadCount]);

  useEffect(() => {
    let disposed = false;
    let permission: PermissionStatus | undefined;
    function update() {
      if (disposed || !permission) return;
      setGpsStatus({ granted: "Đã cho phép", prompt: "Chưa cấp quyền", denied: "Đã chặn" }[permission.state]);
    }
    // Querying permission does not request location access.
    navigator.permissions?.query({ name: "geolocation" }).then(result => {
      if (disposed) return;
      permission = result;
      update();
      permission.addEventListener("change", update);
    }).catch(() => { /* Unsupported browsers keep the unknown status. */ });
    return () => { disposed = true; permission?.removeEventListener("change", update); };
  }, []);

  async function clearHistory() {
    if (clearing || !window.confirm("Xóa toàn bộ phản ánh đã lưu trên thiết bị này? Thao tác không thể hoàn tác và không thu hồi phản ánh đã gửi qua kênh khác.")) return;
    setClearing(true);
    setNotice(null);
    try {
      await clearCitizenHistory();
      setReportCount(0);
      setCountError(false);
      setNotice({ type: "success", text: "Đã xóa toàn bộ lịch sử. Bản nháp đang soạn và cài đặt vẫn được giữ nguyên." });
    } catch {
      setNotice({ type: "error", text: "Không thể xóa lịch sử. Vui lòng thử lại." });
    } finally { setClearing(false); }
  }

  function resetSettings() {
    if (!window.confirm("Đặt lại cài đặt về mặc định? Lịch sử phản ánh vẫn sẽ được giữ nguyên.")) return;
    setNotice(null);
    if (resetPreferences()) {
      setName("");
      setNotice({ type: "success", text: "Đã đặt lại cài đặt. Lịch sử phản ánh vẫn được giữ nguyên." });
    }
  }

  return (
    <main className={styles.content}>
      <div className={styles.profileIntro}><div className={styles.avatar}><UserRound size={28} /></div><div><strong>{preferences.displayName || "Người dùng SnapFix"}</strong><p>Đang sử dụng trên thiết bị này</p></div></div>
      {storageError && <p className={`${styles.notice} ${styles.error}`} role="alert">{storageError}</p>}
      {notice && <p className={`${styles.notice} ${notice.type === "error" ? styles.error : ""}`} role={notice.type === "error" ? "alert" : "status"}>{notice.text}</p>}

      <section className={styles.section}>
        <h2><UserRound size={18} /> Thông tin người dùng</h2>
        <form className={styles.section} onSubmit={event => {
          event.preventDefault(); setNotice(null);
          if (updatePreferences({ displayName: name })) {
            setName(name.trim());
            setNotice({ type: "success", text: "Đã lưu thông tin cá nhân." });
          }
        }}>
          <div className={styles.field}><label htmlFor="displayName">Tên hiển thị (không bắt buộc)</label><input id="displayName" autoComplete="nickname" maxLength={80} value={name} onChange={event => setName(event.target.value)} placeholder="Nhập tên của bạn" /></div>
          <p className={styles.muted}>Tên chỉ lưu trên trình duyệt này và không tự thêm vào nội dung phản ánh.</p>
          <button className={styles.primary}><Save size={18} /> Lưu thông tin</button>
        </form>
      </section>

      <section className={styles.section}>
        <h2><MapPin size={18} /> Tùy chọn vị trí</h2>
        <div className={styles.row}>
          <div className={styles.toggleLabel}><label htmlFor="captureGps">Lấy vị trí thiết bị khi chụp ảnh mới</label><span>Quyền trình duyệt: {gpsStatus}</span></div>
          <label className={styles.switch}><input id="captureGps" type="checkbox" role="switch" checked={preferences.useDeviceLocationForCapture} onChange={event => {
            setNotice(null);
            if (updatePreferences({ useDeviceLocationForCapture: event.target.checked })) setNotice({ type: "success", text: event.target.checked ? "Đã bật lấy GPS khi chụp ảnh mới." : "Đã tắt lấy GPS khi chụp ảnh mới." });
          }} /><span className={styles.slider} /></label>
        </div>
        {!preferences.useDeviceLocationForCapture && <p className={styles.muted}>Khi chụp mới, SnapFix sẽ thử vị trí trong ảnh; nếu thiếu, bạn nhập mô tả nơi chụp.</p>}
        <p className={styles.muted}>Ảnh từ thư viện chỉ dùng vị trí trong ảnh hoặc địa điểm bạn nhập, không dùng GPS hiện tại.</p>
        <p className={styles.muted}><AlertCircle size={14} /> Đây là tùy chọn của SnapFix, không thay đổi quyền vị trí trong trình duyệt.</p>
        {gpsStatus === "Đã chặn" && <p className={styles.muted}>Để cấp lại quyền, mở cài đặt quyền của trang web trong trình duyệt và cho phép Vị trí.</p>}
      </section>

      <section className={styles.section}>
        <h2><History size={18} /> Dữ liệu trên thiết bị</h2>
        {countError ? <div className={`${styles.notice} ${styles.error}`} role="alert">Không đọc được số phản ánh đã lưu.<button className={styles.retry} onClick={() => void loadCount()}>Thử lại</button></div> : <p className={styles.stats}><span>{reportCount ?? "…"}</span> phản ánh đã lưu trong lịch sử</p>}
        <div className={styles.actions}>
          <Link className={styles.secondary} href="/history"><History size={18} /> Xem lịch sử</Link>
          <button className={`${styles.secondary} ${styles.danger}`} disabled={clearing || reportCount === null || reportCount === 0} onClick={() => void clearHistory()}><Trash2 size={18} /> {clearing ? "Đang xóa…" : "Xóa toàn bộ lịch sử"}</button>
          <button className={styles.secondary} onClick={resetSettings}><RotateCcw size={18} /> Đặt lại cài đặt</button>
        </div>
        <p className={styles.muted}>Xóa dữ liệu trình duyệt có thể làm mất các bản lưu. Đặt lại cài đặt sẽ giữ nguyên lịch sử.</p>
      </section>

      <section className={styles.section}>
        <h2><ShieldCheck size={18} /> Quyền riêng tư</h2>
        <ul className={styles.infoList}>
          <li>Thông tin cá nhân và lịch sử hiện được lưu trên thiết bị này.</li>
          <li>Ảnh có thể chứa vị trí và giờ chụp trong EXIF. Bạn được xem và sửa vị trí trước khi chuẩn bị phản ánh.</li>
          <li>Ảnh HEIC được chuyển sang JPEG sau khi đọc thông tin từ ảnh gốc.</li>
          <li>SnapFix hỗ trợ ghi nhận sự cố và chuẩn bị phản ánh. Chức năng gửi trực tiếp đang chờ kết nối hệ thống tiếp nhận dành cho cán bộ.</li>
        </ul>
      </section>
      <section className={styles.section}><h2>Thông tin ứng dụng</h2><p className={styles.muted}>SnapFix · Tiếng Việt</p><p className={styles.muted}>Bản demo hỗ trợ chuẩn bị phản ánh sự cố hạ tầng đô thị.</p></section>
    </main>
  );
}
