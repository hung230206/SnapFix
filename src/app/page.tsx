"use client";

import { Suspense, useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Camera, Check, Image as ImageIcon, Info, LoaderCircle, MapPin, RefreshCcw, Sparkles, Clock, AlertTriangle } from "lucide-react";
import type { LocationData, AnalysisData } from "@/lib/store/ReportContext";
import { readPhotoMeta, requestGeolocation } from "@/lib/utils/camera";
import { prepareImageFile, imageDisplayError, isHeicFile, toDisplayable } from "@/lib/utils/image-file";
import { ReportConfirmation } from "@/components/report/ReportConfirmation";
import { getCitizenReport, saveCitizenReport } from "@/lib/repositories/citizen-history";
import { useUserPreferences } from "@/lib/store/UserPreferencesContext";
import { useCitizenDraft } from "@/lib/store/CitizenDraftContext";
import type { CitizenReport } from "@/domain/citizen-report";
import styles from "./home.module.css";
import { submitCitizenReport } from "@/services/citizen-submission-service";

type Screen = "home" | "analysis" | "report";
type Phase = "reading" | "converting" | "location" | "analyzing" | "ready" | "error";
const categories = ["Ổ gà, hư mặt đường", "Ngập nước", "Đèn đường hỏng", "Rác thải", "Khác / không nhận diện được"];
const disclaimer = "MVP thử nghiệm: phản ánh được lưu trên trình duyệt và hiển thị trong danh sách cán bộ demo. Chưa kết nối AI hay cơ quan tiếp nhận thật.";

function locationLabel(location: LocationData) {
  return location.text || (location.lat != null && location.lng != null ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : "Chưa có vị trí");
}

function formatTime(value: string) {
  return new Date(value).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
}

function draftFor(category: string, location: LocationData, time: string) {
  return `Kính gửi cơ quan chức năng,\n\nTôi xin phản ánh sự cố ${category.toLowerCase()} tại ${locationLabel(location)}. Sự cố được ghi nhận lúc ${formatTime(time)} (giờ Việt Nam).\n\n[Mô tả thêm tình trạng thực tế và ảnh hưởng tại đây.]\n\nKính mong cơ quan chức năng kiểm tra và có phương án xử lý phù hợp.\n\nXin cảm ơn.`;
}

function vietnamTimeInput(value: string) {
  return new Date(new Date(value).getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 16);
}

export default function SnapFix() {
  return <Suspense fallback={<div role="status">Đang tải SnapFix…</div>}><CitizenHome /></Suspense>;
}

function CitizenHome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { savedDraft, keepDraft } = useCitizenDraft();
  const [initialDraft] = useState(savedDraft);
  const [screen, setScreen] = useState<Screen>(initialDraft ? "report" : "home");
  const [phase, setPhase] = useState<Phase>(initialDraft ? "ready" : "reading");
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(initialDraft?.imageBlob ?? null);
  const [savedReport, setSavedReport] = useState<CitizenReport | null>(initialDraft?.savedReport ?? null);
  const savingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [imageMime, setImageMime] = useState("");
  const [source, setSource] = useState<"camera" | "library">(initialDraft?.source ?? "library");
  const [location, setLocation] = useState<LocationData>(initialDraft?.location ?? { type: "manual", text: "" });
  const [time, setTime] = useState(initialDraft?.time ?? "");
  const [timeFromExif, setTimeFromExif] = useState(initialDraft?.timeFromExif ?? false);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(initialDraft?.analysis ?? null);
  const [draft, setDraft] = useState(initialDraft?.draft ?? "");
  const [originalDraft, setOriginalDraft] = useState(initialDraft?.originalDraft ?? "");
  const [locationInput, setLocationInput] = useState("");
  const [latitudeInput, setLatitudeInput] = useState("");
  const [longitudeInput, setLongitudeInput] = useState("");
  const [locating, setLocating] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [editingTime, setEditingTime] = useState(false);
  const [timeInput, setTimeInput] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const cameraInput = useRef<HTMLInputElement>(null);
  const libraryInput = useRef<HTMLInputElement>(null);
  const gpsRequest = useRef<ReturnType<typeof requestGeolocation> | null>(null);
  const generation = useRef(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const { preferences, isLoaded } = useUserPreferences();

  useEffect(() => {
    if (initialDraft) {
      // Recreate the temporary URL from the retained Blob after route navigation.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreview(URL.createObjectURL(initialDraft.imageBlob));
    }
  }, [initialDraft]);

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  useEffect(() => {
    heading.current?.focus();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [screen]);

  useEffect(() => () => { generation.current += 1; }, []);

  useEffect(() => {
    const editId = searchParams?.get("edit");
    let cancelled = false;
    if (editId && initialDraft?.savedReport?.id !== editId) {
      getCitizenReport(editId).then(report => {
        if (cancelled) return;
        if (report) {
          setSavedReport(report);
          setScreen("report");
          setPhase("ready");
          setAnalysis({
            category: report.category,
            severity: report.severity,
            reason: "Đang xem lại báo cáo đã lưu",
            confidence: 0,
            draft: report.originalDraft
          });
          setImageBlob(report.imageBlob);
          setImageMime(report.imageBlob.type);
          setPreview(URL.createObjectURL(report.imageBlob));
          setLocation({
            type: report.location.type,
            lat: report.location.lat,
            lng: report.location.lng,
            text: report.location.text,
          });
          setTime(report.capturedAt);
          setDraft(report.editedDraft);
          setOriginalDraft(report.originalDraft);
        } else setError("Không tìm thấy phản ánh đã lưu.");
      }).catch(() => { if (!cancelled) setError("Không đọc được phản ánh đã lưu. Vui lòng thử lại từ Lịch sử."); });
    }
    return () => { cancelled = true; };
  }, [searchParams, initialDraft]);

  function reset() {
    generation.current += 1;
    setScreen("home");
    setPreview(null);
    setAnalysis(null);
    setLocation({ type: "manual", text: "" });
    setLocationInput("");
    setLatitudeInput("");
    setLongitudeInput("");
    setEditingLocation(false);
    setEditingTime(false);
    setError("");
    setNotice("");
    setDraft("");
    setOriginalDraft("");
    setSavedReport(null);
    setImageBlob(null);
    keepDraft(null);
    if (searchParams.has("edit")) router.replace("/");
  }

  async function analyze(loc: LocationData, capturedAt: string, token = generation.current) {
    setPhase("analyzing");
    setError("");
    try {
      // Demo only: no image recognition service is configured yet.
      await new Promise(resolve => setTimeout(resolve, 1200));
      if (token !== generation.current) return;
      const category = categories[4];
      const text = draftFor(category, loc, capturedAt);
      setAnalysis({ category, severity: "low", reason: "YOLO chưa kết nối. Loại sự cố do bạn xác nhận; confidence chưa có. Ưu tiên chỉ được cập nhật sau khi gửi dựa trên số lượt phản ánh.", confidence: 0, draft: text });
      setDraft(text);
      setOriginalDraft(text);
      setPhase("ready");
    } catch {
      if (token !== generation.current) return;
      setPhase("error");
      setError("Chưa thể phân tích ảnh. Vui lòng thử lại.");
    }
  }

  function openCamera() {
    if (!isLoaded) return;
    if (preferences.useDeviceLocationForCapture) {
      gpsRequest.current = requestGeolocation();
    } else {
      gpsRequest.current = null;
    }
    cameraInput.current?.click();
  }

  async function selectImage(event: ChangeEvent<HTMLInputElement>, imageSource: "camera" | "library") {
    const selectedFile = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!selectedFile) return;
    const capturedNow = new Date().toISOString();
    const token = ++generation.current;
    let file: File;
    try {
      file = await prepareImageFile(selectedFile);
    } catch (error) {
      if (token !== generation.current) return;
      setError(error instanceof Error ? error.message : "Không đọc được tệp ảnh. Vui lòng chọn lại.");
      return;
    }
    if (token !== generation.current) return;
    const pendingGps = imageSource === "camera" ? gpsRequest.current : null;
    setSource(imageSource);
    setLatitudeInput("");
    setLongitudeInput("");
    setPreview(null);
    setScreen("analysis");
    setPhase("reading");
    setAnalysis(null);
    setSavedReport(null);
    keepDraft(null);
    setEditingLocation(false);
    setEditingTime(false);
    setLocationInput("");
    setError("");
    setNotice("");
    try {
      const meta = await readPhotoMeta(file);
      if (token !== generation.current) return;
      // Read GPS/time from the original bytes before conversion strips EXIF.
      if (isHeicFile(file)) setPhase("converting");
      const displayFile = await toDisplayable(file);
      if (token !== generation.current) return;
      setImageMime(displayFile.type);
      setImageBlob(displayFile);
      setPreview(URL.createObjectURL(displayFile));
      setPhase("reading");
      const coords = pendingGps ? await pendingGps : null;
      if (token !== generation.current) return;
      const loc: LocationData = coords ? { type: "gps", ...coords, text: "" } : meta.location;
      const capturedAt = imageSource === "camera" ? capturedNow : meta.capturedAt;
      setLocation(loc);
      setTime(capturedAt);
      setTimeFromExif(imageSource === "library" && meta.timeFromExif);
      if (loc.type === "manual" && !loc.text) setPhase("location");
      else await analyze(loc, capturedAt, token);
    } catch (error) {
      if (token !== generation.current) return;
      setPhase("error");
      setError(error instanceof Error ? error.message : "Không đọc được ảnh này. Hãy chọn ảnh JPG, PNG hoặc chụp lại.");
    }
  }

  function updateDetails(loc: LocationData, capturedAt: string, category = analysis?.category) {
    if (!category || !analysis) return;
    const text = draftFor(category, loc, capturedAt);
    setOriginalDraft(text);
    // Preserve writing already edited on the confirmation screen.
    if (draft === originalDraft) setDraft(text);
    else setNotice("Thông tin đã đổi. Hãy kiểm tra lại địa điểm và thời gian trong nội dung bạn đã sửa.");
    setAnalysis({ ...analysis, category, draft: text });
  }

  function saveLocation() {
    if (!locationInput.trim()) return;
    const lat = latitudeInput.trim() ? Number(latitudeInput) : undefined;
    const lng = longitudeInput.trim() ? Number(longitudeInput) : undefined;
    if ((lat !== undefined || lng !== undefined) && (lat === undefined || lng === undefined || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180)) {
      setNotice("Nhập đủ vĩ độ (-90 đến 90) và kinh độ (-180 đến 180).");
      return;
    }
    const loc: LocationData = { type: "manual", text: locationInput.trim(), lat, lng };
    setLocation(loc);
    setEditingLocation(false);
    if (phase === "location") void analyze(loc, time);
    else updateDetails(loc, time);
  }

  async function requestCurrentLocation() {
    if (locating) return;
    const token = generation.current;
    setLocating(true);
    const coords = await requestGeolocation();
    setLocating(false);
    if (token !== generation.current) return;
    if (!coords) { setNotice("Không lấy được GPS. Bạn có thể nhập địa chỉ và tọa độ bên dưới."); return; }
    const loc: LocationData = { type: "gps", ...coords, text: "" };
    setLocation(loc);
    setEditingLocation(false);
    if (phase === "location") await analyze(loc, time);
    else updateDetails(loc, time);
  }

  async function saveToHistory(submit = false) {
    if (savingRef.current) return;
    if (!draft.trim() || !analysis || !imageBlob) {
      setNotice("Chưa thể lưu. Vui lòng kiểm tra lại thông tin.");
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      const id = savedReport?.id || crypto.randomUUID();
      const now = new Date().toISOString();
      const report: CitizenReport = {
        ...savedReport,
        id,
        category: analysis.category,
        severity: analysis.severity,
        imageBlob,
        location: { ...location, lat: location.lat ?? undefined, lng: location.lng ?? undefined },
        capturedAt: time,
        originalDraft,
        editedDraft: draft,
        status: savedReport?.status ?? "Đã chuẩn bị",
        statusSource: savedReport?.statusSource ?? "system",
        createdAt: savedReport?.createdAt || now,
        updatedAt: now,
      };
      if (submit) {
        const result = await submitCitizenReport(report);
        setSavedReport(result);
        keepDraft(null);
        setNotice("Đã gửi báo cáo độc lập vào danh sách cán bộ demo. Chưa gửi tới cơ quan thật.");
      } else {
        await saveCitizenReport(report);
        setSavedReport(report);
        setNotice("Đã lưu bản nháp vào lịch sử phản ánh.");
      }
    } catch {
      setNotice("Không thể lưu phản ánh. Vui lòng kiểm tra dung lượng trình duyệt.");
    } finally { savingRef.current = false; setSaving(false); }
  }

  function viewHistory() {
    if (imageBlob && analysis) keepDraft({ imageBlob, source, location, time, timeFromExif, analysis, draft, originalDraft, savedReport });
    router.push("/history");
  }

  const busy = phase === "reading" || phase === "converting" || phase === "analyzing";
  const locationEditor = (
    <form className={styles.editor} onSubmit={event => { event.preventDefault(); saveLocation(); }}>
      <label htmlFor="incident-location">{phase === "location" ? "Bạn chụp ở đâu?" : "Nơi xảy ra sự cố"}</label>
      <p>Ghi số nhà, tên đường hoặc địa điểm gần đó để dễ tìm đúng nơi.</p>
      <button type="button" className={styles.secondary} disabled={locating} onClick={() => void requestCurrentLocation()}>{locating ? "Đang lấy GPS…" : "Dùng GPS hiện tại"}</button>
      <p>Chỉ dùng GPS hiện tại nếu bạn đang ở nơi xảy ra sự cố. Không có tọa độ thì báo cáo vẫn được gửi riêng.</p>
      <input id="incident-location" autoFocus required maxLength={300} value={locationInput} onChange={event => setLocationInput(event.target.value)} placeholder="Ví dụ: trước số 12 đường Nguyễn Văn Cừ…" />
      <label htmlFor="incident-lat">Vĩ độ (tùy chọn)</label>
      <input id="incident-lat" type="number" step="any" min="-90" max="90" value={latitudeInput} onChange={e => setLatitudeInput(e.target.value)} />
      <label htmlFor="incident-lng">Kinh độ (tùy chọn)</label>
      <input id="incident-lng" type="number" step="any" min="-180" max="180" value={longitudeInput} onChange={e => setLongitudeInput(e.target.value)} />
      <div className={styles.row}>
        {editingLocation && <button type="button" className={styles.textButton} onClick={() => setEditingLocation(false)}>Hủy</button>}
        <button className={styles.primary} disabled={!locationInput.trim()}><Check size={18} /> Xác nhận vị trí</button>
      </div>
    </form>
  );

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        {screen !== "home" && <button className={styles.iconButton} aria-label={screen === "report" ? "Quay lại kết quả" : "Về trang chủ"} onClick={() => { setScreen(screen === "report" ? "analysis" : "home"); setNotice(""); }}><ArrowLeft size={22} /></button>}
        <div className={styles.brand}><span>SnapFix</span></div>
        <span className={styles.headerNote}>Một tấm ảnh, một thay đổi</span>
      </header>

      {screen === "home" ? (
        <main className={styles.home}>
          <div className={styles.intro}>
            <span className={styles.eyebrow}>CÙNG CHĂM SÓC THÀNH PHỐ</span>
            <h1 ref={heading} tabIndex={-1}>Ghi nhận sự cố hạ tầng<br />gửi phản ánh của bạn</h1>
            <p>Ảnh + vị trí → xác nhận loại sự cố → gửi báo cáo.<br />Mỗi phản ánh là một ghi nhận độc lập.</p>
          </div>
          <div className={styles.illustration} aria-hidden="true">
            <svg viewBox="0 0 480 200" fill="none">
              <circle cx="355" cy="40" r="21" fill="#F0DB9D" />
              <path d="M0 144h480v56H0z" fill="#E3EDE6" />
              <path d="M0 166h480v34H0z" fill="#CADBD0" />
              <path d="M25 183h70m35 0h70m35 0h70m35 0h70" stroke="white" strokeWidth="3" strokeDasharray="18 12" />
              <path d="M75 145V57h66v88M88 57V41h40v16" fill="#DBE9DE" stroke="#96B9A2" strokeWidth="2" />
              <path d="M87 74h12m18 0h12M87 93h12m18 0h12M87 112h12m18 0h12" stroke="#96B9A2" strokeWidth="5" />
              <path d="M160 145V86l35-26 35 26v59" fill="#F8FAF5" stroke="#96B9A2" strokeWidth="2" />
              <path d="M186 145v-29h18v29M174 91h13m14 0h13" stroke="#96B9A2" strokeWidth="3" />
              <path d="M359 144V86m0 21-19-15m19 28 15-12" stroke="#789F87" strokeWidth="4" strokeLinecap="round" />
              <path d="M337 91c-24-5-19-35 2-36-2-27 38-31 44-6 24-1 29 34 5 42-14 11-38 11-51 0Z" fill="#B4D2BB" />
              <path d="M294 143V62q0-13 13-13h17" stroke="#789F87" strokeWidth="3" />
              <path d="M314 50h16" stroke="#789F87" strokeWidth="7" strokeLinecap="round" />
              <ellipse cx="264" cy="166" rx="19" ry="5" fill="#97AD9F" />
              <rect x="238" y="74" width="46" height="53" rx="15" fill="#008E53" />
              <path d="m254 126 7 9 7-9" fill="#008E53" />
              <rect x="247" y="88" width="28" height="20" rx="5" stroke="white" strokeWidth="2" />
              <circle cx="261" cy="98" r="5" stroke="white" strokeWidth="2" />
              <path d="m254 88 3-4h8l3 4" stroke="white" strokeWidth="2" />
            </svg>
            <span>Ghi nhận điều cần được quan tâm</span>
          </div>
          <div className={styles.actions}>
            <button className={styles.primary} disabled={!isLoaded} onClick={openCamera}><Camera size={24} /> Chụp ảnh</button>
            <button className={styles.secondary} onClick={() => libraryInput.current?.click()}><ImageIcon size={23} /> Tải ảnh lên <span className={styles.buttonHint}>Từ thư viện</span></button>
          </div>
          <p className={styles.photoHint}>Chụp rõ sự cố và một phần khung cảnh xung quanh.</p>
          {error && <p className={styles.warning} role="alert">{error}</p>}
          <div className={styles.locationHint}><MapPin size={18} /><span>Vị trí sẽ được xác nhận sau khi bạn chọn ảnh.</span></div>
          <p className={styles.disclaimer}><Info size={18} /><span>{disclaimer}</span></p>
        </main>
      ) : (
        <main className={styles.flow}>
          <div className={styles.step}><span>01 · Ảnh & thông tin</span><ArrowRight size={14} /><span data-active={screen === "report"}>02 · Soạn phản ánh</span></div>
          <h1 ref={heading} tabIndex={-1}>{screen === "analysis" ? "Cùng xem ảnh của bạn" : "Kiểm tra nội dung phản ánh"}</h1>
          {screen === "analysis" ? (
            <>
              <div className={styles.photoMessage}>
                {/* Local object URLs are temporary user-selected images. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {preview && <img src={preview} alt="Ảnh sự cố bạn đã chọn" onError={() => { generation.current += 1; setPhase("error"); setError(imageDisplayError(imageMime)); }} />}
                <span>{source === "camera" ? "Ảnh vừa chụp của bạn" : "Ảnh bạn chọn từ thư viện"}</span>
              </div>
              <div className={styles.assistantLabel}><Sparkles size={18} /> Trợ lý SnapFix <span>Bản demo</span></div>
              <div aria-live="polite">
                {busy && <div className={styles.loading}><LoaderCircle className={styles.spinner} size={22} /><div><strong>{phase === "converting" ? "Đang xử lý ảnh…" : phase === "reading" ? "Đang xem ảnh của bạn…" : "Đang chuẩn bị kết quả minh họa…"}</strong><p>{phase === "converting" ? "Đang chuyển HEIC sang JPEG. Quá trình này có thể mất vài giây." : phase === "reading" ? "Kiểm tra thông tin vị trí và thời gian trong ảnh." : "AI chưa được kết nối. Bạn sẽ tự xác nhận thông tin sự cố."}</p></div></div>}
                {phase === "location" && locationEditor}
                {phase === "error" && <div className={styles.warning} role="alert"><p>{error}</p><button className={styles.secondary} onClick={reset}>Chọn ảnh khác</button></div>}
              </div>
              {phase === "ready" && analysis && <section className={styles.card}>
                <div className={styles.cardHeading}><h2>Thông tin sự cố</h2><span className={styles.demoTag}>Cần xác nhận</span></div>
                <p className={styles.warning}><AlertTriangle size={18} /><span>AI chưa được kết nối nên chưa thể nhận diện ảnh hoặc đánh giá mức độ. Bạn hãy kiểm tra các thông tin bên dưới.</span></p>
                <label className={styles.field}>Loại sự cố<select value={analysis.category} onChange={event => updateDetails(location, time, event.target.value)}>{categories.map(category => <option key={category}>{category}</option>)}</select></label>
                <div className={styles.detail}><Sparkles size={18} /><div><strong>Độ tin cậy AI: chưa có</strong><p>{analysis.reason}</p></div></div>
                <div className={styles.detail}><MapPin size={18} /><div><strong>{locationLabel(location)}</strong><p>{location.type === "exif" ? "Vị trí lấy từ ảnh" : location.type === "gps" ? "Vị trí GPS thiết bị" : "Vị trí do bạn cung cấp"}</p><button className={styles.textButton} onClick={() => { setLocationInput(locationLabel(location)); setLatitudeInput(location.lat?.toString() ?? ""); setLongitudeInput(location.lng?.toString() ?? ""); setEditingLocation(true); }}>Bấm để sửa vị trí</button></div></div>
                {editingLocation && locationEditor}
                <div className={styles.detail}><Clock size={18} /><div><strong>{formatTime(time)}</strong><p>{source === "camera" ? "Thời điểm chụp ảnh" : timeFromExif ? "Thời gian lấy từ ảnh" : "Giờ của tệp ảnh; có thể khác giờ chụp"} · Giờ Việt Nam</p><button className={styles.textButton} onClick={() => { setTimeInput(vietnamTimeInput(time)); setEditingTime(true); }}>Bấm để sửa thời gian</button></div></div>
                {editingTime && <form className={styles.editor} onSubmit={event => { event.preventDefault(); const value = new Date(`${timeInput}:00+07:00`); if (!Number.isFinite(value.getTime())) return; const nextTime = value.toISOString(); setTime(nextTime); updateDetails(location, nextTime); setEditingTime(false); }}><label htmlFor="capture-time">Thời gian chụp (giờ Việt Nam)</label><input id="capture-time" type="datetime-local" required value={timeInput} onChange={event => setTimeInput(event.target.value)} /><div className={styles.row}><button type="button" className={styles.textButton} onClick={() => setEditingTime(false)}>Hủy</button><button className={styles.primary}>Lưu thời gian</button></div></form>}
                <button className={styles.primary} disabled={editingLocation || editingTime} onClick={() => setScreen("report")}>Tiếp tục soạn phản ánh <ArrowRight size={19} /></button>
                <button className={styles.secondary} onClick={reset}><RefreshCcw size={18} /> Chụp lại / chọn ảnh khác</button>
              </section>}
            </>
          ) : analysis && (
            <ReportConfirmation
              preview={preview}
              category={analysis.category}
              locationLabel={locationLabel(location)}
              timeLabel={formatTime(time)}
              receivingDepartment={savedReport?.receivingDepartment}
              draft={draft}
              originalDraft={originalDraft}
              setDraft={setDraft}
              onEditInfo={() => setScreen("analysis")}
              onSetNotice={setNotice}
              onSaveToHistory={savedReport?.submission ? undefined : () => void saveToHistory()}
              onSubmitReport={() => void saveToHistory(true)}
              submitting={saving}
              submission={savedReport?.submission}
              onNewReport={reset}
              saving={saving}
              onViewHistory={viewHistory}
            />
          )}
          {notice && <p className={styles.notice} role="status">{notice}</p>}
        </main>
      )}
      <input aria-label="Chụp ảnh bằng camera" type="file" accept="image/*" capture="environment" hidden ref={cameraInput} onChange={event => void selectImage(event, "camera")} />
      <input aria-label="Chọn ảnh từ thư viện" type="file" accept="image/*" hidden ref={libraryInput} onChange={event => void selectImage(event, "library")} />
    </div>
  );
}
