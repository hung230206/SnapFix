"use client";

import { useRouter } from "next/navigation";
import { ReportHistoryList } from "@/components/report/ReportHistoryList";
import styles from "@/components/report/ReportHistory.module.css";
import { ArrowLeft, Info, Settings } from "lucide-react";

export default function HistoryPage() {
  const router = useRouter();
  
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <button className={styles.iconButton} aria-label="Quay lại" onClick={() => router.push("/")}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title} style={{flex: 1}}>Lịch sử phản ánh</h1>
        <button className={styles.iconButton} aria-label="Cá nhân và cài đặt" onClick={() => router.push("/profile")}>
          <Settings size={24} />
        </button>
      </header>
      <div style={{padding: '12px 26px 0', fontSize: '12px', color: '#69776f', display: 'flex', gap: '8px', lineHeight: '1.5'}}>
        <Info size={16} style={{flexShrink: 0, marginTop: '2px'}} /> 
        Lịch sử được lưu trên thiết bị này. Xóa dữ liệu trình duyệt có thể làm mất các bản lưu.
      </div>
      <ReportHistoryList 
        onBack={() => router.push("/")}
        onNewReport={() => router.push("/")}
        onEditReport={(id) => router.push(`/?edit=${id}`)}
      />
    </div>
  );
}
