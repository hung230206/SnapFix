export interface ReportDraftContext {
  imageUrl?: string;
  issueTypeCode?: string;
  locationText?: string;
  answers?: Record<string, any>;
}

export interface ImageAnalysis {
  issueType?: {
    code: string;
    confidence: number;
  };
  visibleFacts: {
    key: string;
    value: string;
    confidence: number;
  }[];
  possibleHazards: {
    label: string;
    confidence: number;
  }[];
  imageQuality: {
    usable: boolean;
    problems: string[];
  };
  uncertaintyNotes: string[];
}

export interface AIReportAssistant {
  analyzeImage(input: { imageUrl: string }): Promise<ImageAnalysis>;
  
  suggestIssueType(input: { imageUrl: string }): Promise<{ code: string; confidence: number }>;
  
  suggestReportTitle(input: ReportDraftContext): Promise<string>;
  
  draftDescription(input: ReportDraftContext): Promise<string>;
  
  suggestFollowUpQuestions(input: ReportDraftContext): Promise<any[]>;
  
  explainEvidence(input: any): Promise<string>;
}

export class MockAIReportAssistant implements AIReportAssistant {
  async analyzeImage(input: { imageUrl: string }): Promise<ImageAnalysis> {
    return {
      issueType: { code: "POTHOLE", confidence: 0.85 },
      visibleFacts: [
        { key: "Tình trạng", value: "Có ổ gà", confidence: 0.9 },
        { key: "Nước đọng", value: "Có", confidence: 0.7 }
      ],
      possibleHazards: [
        { label: "Trơn trượt", confidence: 0.8 }
      ],
      imageQuality: { usable: true, problems: [] },
      uncertaintyNotes: ["Không rõ độ sâu"]
    };
  }

  async suggestIssueType(input: { imageUrl: string }) {
    return { code: "POTHOLE", confidence: 0.85 };
  }

  async suggestReportTitle(input: ReportDraftContext) {
    const codeMap: Record<string, string> = {
      POTHOLE: "Ổ gà sụt lún gây nguy hiểm",
      STREET_LIGHT: "Đèn đường không sáng",
      GARBAGE: "Rác thải ùn ứ",
      FLOODING: "Ngập nước cục bộ",
      FALLEN_TREE: "Cây gãy đổ chắn đường",
      EXPOSED_WIRE: "Dây điện hở nguy hiểm"
    };
    return codeMap[input.issueTypeCode || "OTHER"] || "Sự cố hạ tầng (AI đề xuất)";
  }

  async draftDescription(input: ReportDraftContext) {
    return `Qua hình ảnh và thông tin, đây là sự cố liên quan đến ${input.issueTypeCode || "hạ tầng"}. Tình trạng cần được kiểm tra sớm để đảm bảo an toàn. (Nội dung do AI đề xuất)`;
  }

  async suggestFollowUpQuestions(input: ReportDraftContext) {
    return [];
  }

  async explainEvidence(input: any) {
    return "Dựa trên metadata, bằng chứng có độ tin cậy cao.";
  }
}

export const aiAssistant = new MockAIReportAssistant();
