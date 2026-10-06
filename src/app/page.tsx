"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Settings, Camera, Image as ImageIcon, MapPin, 
  ArrowLeft, Bot, AlertTriangle, RefreshCcw, ExternalLink, Info,
  MoreHorizontal, ChevronRight, CheckCircle, User, ShieldCheck,
  History, Clock
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useReports, Report, LocationData, AnalysisData } from "@/lib/store/ReportContext";
import { requestGeolocation, readPhotoMeta } from "@/lib/utils/camera";

type AiState = "idle" | "viewing" | "analyzing" | "result" | "error";
type Screen = "login" | "home" | "chat" | "report" | "history";

export default function SnapFixCT() {
  const router = useRouter();
  const { reports, addReport } = useReports();
  
  const [screen, setScreen] = useState<Screen>("login");
  const [aiState, setAiState] = useState<AiState>("idle");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  
  // Current draft report
  const [location, setLocation] = useState<LocationData>({ type: "manual", text: "" });
  const [capturedAt, setCapturedAt] = useState<string>("");
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [draftText, setDraftText] = useState("");
  const [originalDraft, setOriginalDraft] = useState("");
  
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [manualLocationInput, setManualLocationInput] = useState("");
  const [showManualLocation, setShowManualLocation] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (screen === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [screen, aiState, showManualLocation]);

  const mockAiAnalysis = async (file: File, loc: LocationData, time: string): Promise<AnalysisData> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Simulate AI parsing JSON
    const mockJsonString = JSON.stringify({
      category: "Ổ gà, hư mặt đường",
      severity: "high",
      reason: "Mặt đường bị hư hỏng, tạo thành ổ gà, có thể gây nguy hiểm cho phương tiện.",
      confidence: 0.87,
      draft: `Kính gửi cơ quan chức năng,\n\nTôi xin phản ánh tình trạng mặt đường bị hư hỏng, xuất hiện ổ gà tại ${loc.text || (loc.lat ? `tọa độ (${loc.lat.toFixed(4)}, ${loc.lng?.toFixed(4)})` : "khu vực này")}.\n\nTình trạng này gây khó khăn và nguy hiểm cho phương tiện lưu thông.\n\nKính mong cơ quan chức năng xem xét khắc phục.\n\nXin cảm ơn.`
    });
    
    const parsed = JSON.parse(mockJsonString);
    return parsed;
  };

  const processImage = async (file: File, forceGpsCoords?: {lat: number, lng: number}) => {
    setCurrentFile(file);
    setImagePreview(URL.createObjectURL(file));
    setScreen("chat");
    setAiState("viewing");
    
    // Get Metadata (EXIF + File Time)
    const meta = await readPhotoMeta(file);
    let finalLocation = meta.location;
    
    // Override with active GPS if we got it before capturing
    if (forceGpsCoords) {
      finalLocation = { type: "gps", lat: forceGpsCoords.lat, lng: forceGpsCoords.lng, text: "Vị trí GPS hiện tại" };
    }

    setLocation(finalLocation);
    setCapturedAt(meta.capturedAt);

    if (finalLocation.type === "manual" && !finalLocation.text) {
       // Ask for manual location before AI
       setShowManualLocation(true);
       setAiState("idle");
       return;
    }
    
    await runAi(file, finalLocation, meta.capturedAt);
  };
  
  const submitManualLocation = async () => {
    if (!manualLocationInput.trim()) return;
    const loc: LocationData = { type: "manual", text: manualLocationInput };
    setLocation(loc);
    setShowManualLocation(false);
    setAiState("viewing");
    if (currentFile) {
        await runAi(currentFile, loc, capturedAt);
    }
  };

  const runAi = async (file: File, loc: LocationData, time: string) => {
    setAiState("analyzing");
    try {
      const result = await mockAiAnalysis(file, loc, time);
      setAnalysis(result);
      setDraftText(result.draft);
      setOriginalDraft(result.draft);
      setAiState("result");
    } catch (error) {
      setAiState("error");
    }
  };

  const handleCameraCaptureClick = async () => {
    // Try to get GPS first
    const coords = await requestGeolocation();
    
    // Then open camera (handled by a temporary listener or just opening it and saving coords in state)
    // For web input capture, we can't block easily, so we get GPS first then click input.
    // In React, we trigger click after async might be blocked by popup blocker, but let's try.
    
    const input = cameraInputRef.current;
    if (input) {
      // Small trick to pass coords to the next onChange
      (input as any)._gpsCoords = coords; 
      input.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const coords = (e.target as any)._gpsCoords;
    if (file) {
        await processImage(file, coords);
    }
    e.target.value = '';
    (e.target as any)._gpsCoords = null;
  };

  const handleRetake = () => {
    setImagePreview(null);
    setCurrentFile(null);
    setAnalysis(null);
    setAiState("idle");
    setScreen("home");
  };

  const getSeverityBadge = (severity: string) => {
    if (severity === "high") return <span className="bg-[#FEE2E2] text-[#DC2626] px-2.5 py-1 rounded-full text-xs font-semibold">Cảnh báo cao</span>;
    if (severity === "medium") return <span className="bg-[#FEF3C7] text-[#D97706] px-2.5 py-1 rounded-full text-xs font-semibold">Cảnh báo trung bình</span>;
    return <span className="bg-[#DCFCE7] text-[#15803D] px-2.5 py-1 rounded-full text-xs font-semibold">Cảnh báo thấp</span>;
  };

  const handleSubmitReport = () => {
    if (!analysis) return;
    
    const newReport: Report = {
      id: `#SF${Date.now().toString().slice(-6)}`,
      image: { file: currentFile, previewUrl: imagePreview },
      location: location,
      capturedAt: capturedAt,
      analysis: analysis,
      editedDraft: draftText,
      receivingAgency: { name: "UBND Quận Ninh Kiều", reportUrl: "https://example.com" },
      status: "Đã gửi", // Citizen status, will be mapped to "Cần xử lý" in admin
      submittedAt: new Date().toISOString(),
      logs: []
    };
    
    addReport(newReport);
    setShowSuccessPopup(true);
  };

  // ---------------------------------------------------------
  // MÀN 0: LOGIN
  // ---------------------------------------------------------
  if (screen === "login") {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-[#F8FAFC] max-w-md mx-auto shadow-sm relative items-center justify-center p-6">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-[#E8F7EF] rounded-[20px] flex items-center justify-center mb-4">
            <Camera className="w-10 h-10 text-[#0B8F4D]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-center">
            <span className="text-[#0B8F4D]">SnapFix</span>
            <span className="text-[#111827] ml-1.5">CT</span>
          </h1>
          <p className="text-[#6B7280] text-[15px] mt-2 text-center">Nền tảng báo cáo sự cố hạ tầng đô thị</p>
        </div>

        <div className="w-full flex flex-col gap-4">
          <button 
            onClick={() => setScreen("home")}
            className="bg-white border-2 border-[#0B8F4D] active:bg-[#E8F7EF] text-[#0B8F4D] py-4 rounded-[16px] text-[16px] font-bold w-full text-center flex items-center gap-3 px-5 transition-colors shadow-sm"
          >
            <User className="w-6 h-6" />
            <div className="flex flex-col items-start text-left">
              <span>Đăng nhập tư cách Người dân</span>
              <span className="text-[12px] font-medium opacity-80">Gửi và theo dõi phản ánh</span>
            </div>
          </button>

          <button 
            onClick={() => router.push("/officer")}
            className="bg-[#111827] active:bg-gray-800 text-white py-4 rounded-[16px] text-[16px] font-bold w-full text-center flex items-center gap-3 px-5 transition-colors shadow-sm"
          >
            <ShieldCheck className="w-6 h-6" />
            <div className="flex flex-col items-start text-left">
              <span>Đăng nhập tư cách Cán bộ</span>
              <span className="text-[12px] font-medium opacity-80">Tiếp nhận và xử lý sự cố</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // MÀN 1A: HOME
  // ---------------------------------------------------------
  if (screen === "home") {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-[#FFFFFF] max-w-md mx-auto shadow-sm relative">
        <header className="flex justify-between items-center p-4 border-b border-[#E5E7EB]">
          <div className="text-xl font-bold tracking-tight">
            <span className="text-[#0B8F4D]">SnapFix</span>
            <span className="text-[#111827] ml-1">CT</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setScreen("history")} className="p-2 text-[#6B7280] hover:bg-[#F8FAFC] rounded-full">
              <History className="w-5 h-5" />
            </button>
            <button className="p-2 text-[#6B7280] hover:bg-[#F8FAFC] rounded-full">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 flex flex-col gap-6">
          <div className="text-center mt-4">
            <h1 className="text-2xl font-bold text-[#111827] leading-snug mb-3">
              Chụp ảnh sự cố hạ tầng<br/>và nhận hỗ trợ từ AI
            </h1>
            <p className="text-[15px] text-[#6B7280] leading-relaxed px-4">
              Chỉ cần một tấm ảnh, AI sẽ phân tích và soạn sẵn nội dung phản ánh giúp bạn.
            </p>
          </div>

          <div className="bg-[#F8FAFC] rounded-2xl h-48 w-full flex items-center justify-center border border-[#E5E7EB] overflow-hidden">
            <div className="text-[#6B7280] text-sm flex flex-col items-center gap-2 opacity-50">
                <ImageIcon className="w-10 h-10" />
                Ảnh minh họa đường phố
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleCameraCaptureClick}
              className="bg-[#0B8F4D] active:bg-[#08743E] text-white flex items-center justify-center gap-2 py-4 rounded-[16px] text-lg font-semibold transition-colors"
            >
              <Camera className="w-6 h-6" />
              Chụp ảnh
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#F8FAFC] active:bg-gray-100 text-[#111827] border border-[#E5E7EB] flex items-center justify-center gap-2 py-4 rounded-[16px] text-[17px] font-semibold transition-colors"
            >
              <ImageIcon className="w-5 h-5 text-[#0B8F4D]" />
              Thư viện
            </button>
          </div>

          <div className="bg-[#F8FAFC] rounded-[12px] p-3.5 flex gap-3 text-[#6B7280] text-[13px] leading-relaxed mt-auto">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              SnapFix CT chỉ hỗ trợ chuẩn bị nội dung phản ánh. Việc gửi phản ánh sẽ được thực hiện tại trang chính thức của cơ quan chức năng.
            </p>
          </div>
        </main>
        
        <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleFileChange} />
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      </div>
    );
  }

  // ---------------------------------------------------------
  // MÀN LỊCH SỬ (HISTORY)
  // ---------------------------------------------------------
  if (screen === "history") {
    // Get user's submitted reports
    const myReports = reports.filter(r => r.status === "Đã gửi" || r.status === "Cần xử lý" || r.status === "Đang xử lý" || r.status === "Đã xử lý");

    return (
      <div className="flex flex-col min-h-[100dvh] bg-[#F8FAFC] max-w-md mx-auto relative shadow-sm">
        <header className="flex items-center gap-3 p-4 border-b border-[#E5E7EB] bg-white sticky top-0 z-10">
          <button onClick={() => setScreen("home")} className="p-1 -ml-1 text-[#111827]">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-[17px] font-bold text-[#111827]">
            Lịch sử phản ánh
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {myReports.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">Chưa có phản ánh nào.</p>
          ) : (
            myReports.map(r => (
              <div key={r.id} className="bg-white border border-[#E5E7EB] rounded-[16px] p-4 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-[#111827]">{r.analysis?.category || "Sự cố"}</h4>
                    <p className="text-xs text-gray-500 mt-1">{r.id}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold ${r.status === 'Đã xử lý' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {r.status === "Đã gửi" || r.status === "Cần xử lý" ? "Đã tiếp nhận" : r.status}
                  </span>
                </div>
                <div className="flex gap-2 items-start text-xs text-gray-600">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <p className="line-clamp-2">{r.location.text || (r.location.lat ? `${r.location.lat.toFixed(4)}, ${r.location.lng?.toFixed(4)}` : "Không rõ")}</p>
                </div>
                <div className="flex gap-2 items-start text-xs text-gray-600">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <p>{new Date(r.submittedAt || Date.now()).toLocaleString('vi-VN')}</p>
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    );
  }

  // ---------------------------------------------------------
  // MÀN 1B & 1C: CHAT
  // ---------------------------------------------------------
  if (screen === "chat") {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-[#F8FAFC] max-w-md mx-auto relative shadow-sm">
        <header className="flex justify-between items-center p-4 border-b border-[#E5E7EB] bg-white sticky top-0 z-10">
          <button onClick={() => setScreen("home")} className="p-1 -ml-1 text-[#111827]">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-lg font-bold tracking-tight">
            <span className="text-[#0B8F4D]">SnapFix</span>
            <span className="text-[#111827] ml-1">CT</span>
          </div>
          <button className="p-1 text-[#6B7280]">
            <Settings className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 pb-24">
          
          <div className="flex flex-col items-end gap-1">
            <div className="bg-[#E8F7EF] border border-[#bce2c7] rounded-2xl rounded-tr-sm p-2 max-w-[85%] shadow-sm">
              {imagePreview && <img src={imagePreview} alt="Sự cố" className="w-full h-auto max-h-48 object-cover rounded-xl mb-2" />}
              <p className="text-[15px] text-[#111827] px-1 pb-1">Đây là ảnh mình vừa chụp.</p>
            </div>
          </div>

          {(showManualLocation || aiState !== "idle") && (
            <div className="flex items-end gap-2 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-[#0B8F4D] flex items-center justify-center shrink-0 mb-1">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col gap-2">
                
                {showManualLocation && (
                   <div className="bg-white border border-[#E5E7EB] rounded-2xl rounded-tl-sm p-4 text-[15px] text-[#111827] shadow-sm flex flex-col gap-3">
                     <p>Ảnh không có vị trí GPS. Bạn chụp ở đâu?</p>
                     <input 
                       type="text" 
                       placeholder="Số nhà, tên đường..." 
                       value={manualLocationInput}
                       onChange={e => setManualLocationInput(e.target.value)}
                       className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-[#0B8F4D]"
                     />
                     <button onClick={submitManualLocation} className="bg-[#0B8F4D] text-white px-4 py-2 rounded-lg text-sm font-bold self-end">Xác nhận</button>
                   </div>
                )}

                {aiState === "viewing" && (
                  <div className="bg-white border border-[#E5E7EB] rounded-2xl rounded-tl-sm px-4 py-2.5 text-[15px] text-[#111827] shadow-sm">
                    Đang xem ảnh của bạn...
                  </div>
                )}

                {aiState === "analyzing" && (
                  <div className="bg-white border border-[#E5E7EB] rounded-2xl rounded-tl-sm px-4 py-2.5 text-[15px] text-[#111827] shadow-sm flex items-center gap-2">
                    Đang phân tích sự cố
                    <MoreHorizontal className="w-5 h-5 text-[#6B7280] animate-pulse" />
                  </div>
                )}

                {aiState === "error" && (
                  <div className="bg-white border border-red-200 rounded-2xl rounded-tl-sm p-4 text-[15px] text-[#111827] shadow-sm">
                    <p>Phân tích ảnh thất bại. Vui lòng thử lại.</p>
                    <button onClick={() => {if(currentFile) runAi(currentFile, location, capturedAt)}} className="mt-2 text-[#0B8F4D] font-bold">Thử lại</button>
                  </div>
                )}

                {aiState === "result" && analysis && (
                  <>
                    <div className="bg-white border border-[#E5E7EB] rounded-2xl rounded-tl-sm px-4 py-2.5 text-[15px] text-[#111827] shadow-sm">
                      Đây là kết quả phân tích của bạn:
                    </div>
                    
                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm w-[280px] sm:w-[320px] flex flex-col gap-4 mt-1">
                      {imagePreview && <img src={imagePreview} alt="Kết quả phân tích" className="w-full h-32 object-cover rounded-[10px]" />}
                      
                      <div>
                        <h3 className="text-[17px] font-bold text-[#111827] mb-1.5">{analysis.category}</h3>
                        {getSeverityBadge(analysis.severity)}
                      </div>

                      <div>
                        <p className="text-[13px] font-semibold text-[#6B7280] mb-1">Lý do đánh giá</p>
                        <p className="text-[14px] text-[#111827] leading-relaxed">{analysis.reason}</p>
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-[13px] font-semibold text-[#6B7280] mb-1">
                          <span>Độ tin cậy</span>
                          <span className="text-[#0B8F4D]">{analysis.confidence}</span>
                        </div>
                        <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                          <div className="bg-[#0B8F4D] h-2 rounded-full" style={{ width: `${analysis.confidence * 100}%` }}></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-[20px_1fr] gap-2 items-start mt-1">
                        <MapPin className="w-4 h-4 text-[#6B7280] mt-0.5" />
                        <div>
                          <p className="text-[13px] font-semibold text-[#6B7280]">Vị trí</p>
                          <p className="text-[14px] text-[#111827]">{location.text || (location.lat ? `${location.lat.toFixed(4)}, ${location.lng?.toFixed(4)}` : "Không rõ")}</p>
                          <button className="text-[#0B8F4D] text-xs font-semibold mt-0.5">Bấm để sửa</button>
                        </div>
                      </div>

                      <div className="grid grid-cols-[20px_1fr] gap-2 items-start mt-1">
                        <div className="w-4 h-4 text-[#6B7280] mt-0.5 flex items-center justify-center">🗓</div>
                        <div>
                          <p className="text-[13px] font-semibold text-[#6B7280]">Thời gian chụp</p>
                          <p className="text-[14px] text-[#111827]">{new Date(capturedAt).toLocaleString('vi-VN')}</p>
                          <button className="text-[#0B8F4D] text-xs font-semibold mt-0.5">Bấm để sửa</button>
                        </div>
                      </div>
                      
                      {analysis.confidence < 0.6 && (
                        <div className="bg-[#FEF3C7] text-[#D97706] p-3 rounded-[10px] text-[13px] flex items-start gap-2 mt-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <p>⚠ AI chưa chắc chắn. Bạn nên chụp lại hoặc kiểm tra loại sự cố.</p>
                        </div>
                      )}

                      <div className="flex flex-col gap-2 mt-2">
                        <button 
                          onClick={() => setScreen("report")}
                          className="bg-[#0B8F4D] text-white py-3 rounded-[12px] text-[15px] font-semibold w-full text-center"
                        >
                          Tiếp tục soạn phản ánh →
                        </button>
                        <button 
                          onClick={handleRetake}
                          className="bg-[#F8FAFC] text-[#111827] border border-[#E5E7EB] py-3 rounded-[12px] text-[15px] font-semibold w-full text-center"
                        >
                          Chụp lại
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </main>

        <footer className="bg-white border-t border-[#E5E7EB] p-3 fixed bottom-0 left-0 right-0 max-w-md mx-auto">
          <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-full px-4 py-3 flex items-center gap-3">
            <button disabled className="opacity-50"><ImageIcon className="w-5 h-5 text-[#6B7280]" /></button>
            <button disabled className="opacity-50"><Camera className="w-5 h-5 text-[#6B7280]" /></button>
            <div className="flex-1 text-[14px] text-[#9CA3AF] px-2 truncate">
              Bạn có thể chụp ảnh hoặc chọn...
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ---------------------------------------------------------
  // MÀN 2: REPORT
  // ---------------------------------------------------------
  if (screen === "report" && analysis) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-[#F8FAFC] max-w-md mx-auto shadow-sm relative">
        <header className="flex items-center gap-3 p-4 border-b border-[#E5E7EB] bg-white sticky top-0 z-10">
          <button onClick={() => setScreen("chat")} className="p-1 -ml-1 text-[#111827]">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-[17px] font-bold text-[#111827]">Xác nhận và gửi phản ánh</div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 pb-8">
          <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-3 flex gap-4 items-center shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
            {imagePreview ? (
                <img src={imagePreview} alt="Thumbnail" className="w-20 h-20 object-cover rounded-[10px] bg-gray-100" />
            ) : <div className="w-20 h-20 bg-gray-100 rounded-[10px]"></div>}
            <div className="flex-1 min-w-0">
              <h4 className="text-[15px] font-bold text-[#111827] truncate mb-1">{analysis.category}</h4>
              <div className="mb-2">{getSeverityBadge(analysis.severity)}</div>
              <p className="text-[12px] text-[#6B7280] truncate">{location.text || "Có tọa độ"}</p>
              <p className="text-[12px] text-[#6B7280]">{new Date(capturedAt).toLocaleString('vi-VN')}</p>
            </div>
            <button className="text-[#0B8F4D] text-sm font-semibold shrink-0">Sửa</button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-[15px] font-bold text-[#111827]">Nội dung phản ánh</h3>
              <button onClick={() => setDraftText(originalDraft)} className="text-[#0B8F4D] text-[13px] font-semibold flex items-center gap-1">
                <RefreshCcw className="w-3.5 h-3.5" /> Khôi phục bản gốc
              </button>
            </div>
            <textarea 
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              className="w-full bg-white border border-[#E5E7EB] rounded-[16px] p-4 text-[15px] text-[#111827] leading-relaxed shadow-sm min-h-[220px] focus:outline-none focus:ring-2 focus:ring-[#0B8F4D]/20 focus:border-[#0B8F4D] resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-[15px] font-bold text-[#111827] px-1">Cơ quan tiếp nhận phù hợp</h3>
            <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-4 flex gap-3 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
              <div className="text-xl mt-0.5">🏛</div>
              <div className="flex-1">
                <h4 className="text-[15px] font-bold text-[#111827] mb-1">UBND Quận Ninh Kiều</h4>
                <p className="text-[13px] text-[#6B7280] leading-relaxed">Tiếp nhận các phản ánh về hạ tầng giao thông trên địa bàn quận Ninh Kiều.</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#9CA3AF] self-center" />
            </div>
          </div>

          <div className="bg-[#E5E7EB]/40 rounded-[12px] p-4 flex gap-3 text-[#6B7280] text-[13px] leading-relaxed">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p>SnapFix CT chỉ chuẩn bị nội dung phản ánh. Việc gửi phản ánh sẽ được thực hiện tại trang chính thức của cơ quan chức năng.</p>
          </div>
        </main>

        <footer className="bg-white border-t border-[#E5E7EB] p-4 sticky bottom-0 z-10">
          <div className="flex flex-col gap-3">
            <button onClick={handleSubmitReport} className="bg-[#0B8F4D] active:bg-[#08743E] text-white py-3.5 rounded-[16px] text-[16px] font-semibold w-full flex justify-center items-center gap-2">
              Gửi phản ánh <ExternalLink className="w-4 h-4" />
            </button>
            <button onClick={() => setScreen("chat")} className="bg-[#F8FAFC] text-[#111827] border border-[#E5E7EB] py-3.5 rounded-[16px] text-[16px] font-semibold w-full">
              Quay lại
            </button>
          </div>
        </footer>

        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-5 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-[24px] p-6 max-w-[320px] w-full flex flex-col items-center text-center shadow-xl animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-[#15803D]" />
              </div>
              <h3 className="text-[19px] font-bold text-[#111827] mb-2">Gửi thành công!</h3>
              <p className="text-[14px] text-[#6B7280] mb-6 leading-relaxed">Nội dung phản ánh của bạn đã được lưu vào hệ thống.</p>
              <button 
                onClick={() => {
                  setShowSuccessPopup(false);
                  handleRetake(); // Reset everything
                }}
                className="bg-[#0B8F4D] active:bg-[#08743E] text-white py-3.5 rounded-[16px] text-[16px] font-semibold w-full transition-colors"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
