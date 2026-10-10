"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import styles from "@/components/profile/ProfileSettings.module.css";

export default function ProfilePage() {
  const router = useRouter();
  
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <button className={styles.iconButton} aria-label="Quay lại lịch sử" onClick={() => router.push("/history")}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>Cá nhân và cài đặt</h1>
      </header>
      <ProfileSettings />
    </div>
  );
}
