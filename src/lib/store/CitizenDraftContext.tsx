"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { AnalysisData, LocationData } from "./ReportContext";
import type { CitizenReport } from "@/domain/citizen-report";

export interface CitizenDraft {
  imageBlob: Blob;
  source: "camera" | "library";
  location: LocationData;
  time: string;
  timeFromExif: boolean;
  analysis: AnalysisData;
  draft: string;
  originalDraft: string;
  savedReport: CitizenReport | null;
}

const CitizenDraftContext = createContext<{
  savedDraft: CitizenDraft | null;
  keepDraft: (draft: CitizenDraft | null) => void;
} | null>(null);

// Keep unsaved work in memory across app navigation, separate from history records.
export function CitizenDraftProvider({ children }: { children: ReactNode }) {
  const [savedDraft, keepDraft] = useState<CitizenDraft | null>(null);
  return <CitizenDraftContext.Provider value={{ savedDraft, keepDraft }}>{children}</CitizenDraftContext.Provider>;
}

export function useCitizenDraft() {
  const value = useContext(CitizenDraftContext);
  if (!value) throw new Error("CitizenDraftProvider is required");
  return value;
}
