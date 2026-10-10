import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SnapFix",
  description: "Hệ thống quản lý sự cố hạ tầng đô thị",
  manifest: "/manifest.json",
};

import { ReportProvider } from "@/lib/store/ReportContext";
import { UserPreferencesProvider } from "@/lib/store/UserPreferencesContext";
import { CitizenDraftProvider } from "@/lib/store/CitizenDraftContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <UserPreferencesProvider>
          <CitizenDraftProvider><ReportProvider>
            {children}
          </ReportProvider></CitizenDraftProvider>
        </UserPreferencesProvider>
      </body>
    </html>
  );
}
