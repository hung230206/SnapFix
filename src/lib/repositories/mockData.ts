import {
  User, Department, IssueType, IssueQuestion, IssueQuestionOption, Observation, Incident, IncidentEvent, Asset, RoutingRule
} from "../../domain/models";
import { subDays, subHours } from "date-fns";

const now = new Date();

export const demoUsers: User[] = [
  { id: "u1", role: "CITIZEN", displayName: "Nguyen Van A", email: "citizen@example.com", createdAt: subDays(now, 30).toISOString() },
  { id: "u2", role: "OFFICER", displayName: "Tran Thi B", email: "officer@example.com", departmentId: "d1", createdAt: subDays(now, 30).toISOString() },
  { id: "u3", role: "MANAGER", displayName: "Le Van C", email: "manager@example.com", departmentId: "d1", createdAt: subDays(now, 30).toISOString() },
  { id: "u4", role: "ADMIN", displayName: "Admin", email: "admin@example.com", createdAt: subDays(now, 30).toISOString() }
];

export const demoDepartments: Department[] = [
  { id: "d1", code: "GTCC", name: "Giao thông công chính", active: true },
  { id: "d2", code: "MTĐT", name: "Môi trường đô thị", active: true },
  { id: "d3", code: "ĐL", name: "Điện lực", active: true }
];

export const demoIssueTypes: IssueType[] = [
  { id: "it1", code: "POTHOLE", nameVi: "Ổ gà, sụt lún", active: true, defaultSeverity: "MEDIUM" },
  { id: "it2", code: "STREET_LIGHT", nameVi: "Hỏng đèn đường", active: true, defaultSeverity: "LOW" },
  { id: "it3", code: "GARBAGE", nameVi: "Rác thải sai quy định", active: true, defaultSeverity: "LOW" },
  { id: "it4", code: "FLOODING", nameVi: "Ngập úng", active: true, defaultSeverity: "HIGH" },
  { id: "it5", code: "FALLEN_TREE", nameVi: "Cây gãy đổ", active: true, defaultSeverity: "HIGH", emergencyWarning: "Cảnh báo an toàn: Nếu cây đổ chắn toàn bộ đường hoặc đè lên nhà dân/dây điện, vui lòng tránh xa và gọi báo cứu hộ ngay lập tức." },
  { id: "it6", code: "EXPOSED_WIRE", nameVi: "Hở dây điện", active: true, defaultSeverity: "HIGH", emergencyWarning: "Cảnh báo an toàn: Giữ khoảng cách an toàn. Không tự ý chạm vào dây điện." },
  { id: "it7", code: "OTHER", nameVi: "Khác", active: true, defaultSeverity: "LOW" }
];

export const demoQuestions: IssueQuestion[] = [
  { id: "q1", issueTypeCode: "POTHOLE", labelVi: "Ổ gà nằm ở đâu?", inputType: "SINGLE_SELECT", required: true, visibility: "PUBLIC", sortOrder: 1 },
  { id: "q2", issueTypeCode: "POTHOLE", labelVi: "Có nước đọng che khuất độ sâu không?", inputType: "SINGLE_SELECT", required: false, visibility: "PUBLIC", sortOrder: 2 },
  { id: "q3", issueTypeCode: "POTHOLE", labelVi: "Mức độ ảnh hưởng giao thông (ước lượng)?", inputType: "SINGLE_SELECT", required: false, visibility: "PUBLIC", sortOrder: 3 },
  { id: "q4", issueTypeCode: "STREET_LIGHT", labelVi: "Có bao nhiêu đèn gần nhau bị tắt?", inputType: "NUMBER", required: false, visibility: "PUBLIC", sortOrder: 1 },
  { id: "q5", issueTypeCode: "FLOODING", labelVi: "Mực nước ngập ước lượng?", inputType: "SINGLE_SELECT", required: true, visibility: "PUBLIC", sortOrder: 1 },
];

export const demoQuestionOptions: IssueQuestionOption[] = [
  { id: "o1", questionId: "q1", value: "Giữa làn xe", labelVi: "Giữa làn xe", sortOrder: 1 },
  { id: "o2", questionId: "q1", value: "Gần lề đường", labelVi: "Gần lề đường", sortOrder: 2 },
  { id: "o3", questionId: "q1", value: "Giao lộ", labelVi: "Giao lộ", sortOrder: 3 },
  { id: "o4", questionId: "q1", value: "Không rõ", labelVi: "Không rõ", sortOrder: 4 },
  
  { id: "o5", questionId: "q2", value: "Có", labelVi: "Có", sortOrder: 1 },
  { id: "o6", questionId: "q2", value: "Không", labelVi: "Không", sortOrder: 2 },
  { id: "o7", questionId: "q2", value: "Không rõ", labelVi: "Không rõ", sortOrder: 3 },
  
  { id: "o8", questionId: "q3", value: "Nhẹ", labelVi: "Nhẹ", sortOrder: 1 },
  { id: "o9", questionId: "q3", value: "Trung bình", labelVi: "Trung bình", sortOrder: 2 },
  { id: "o10", questionId: "q3", value: "Nghiêm trọng", labelVi: "Nghiêm trọng", sortOrder: 3 },
  
  { id: "o11", questionId: "q5", value: "Dưới mắt cá chân", labelVi: "Dưới mắt cá chân", sortOrder: 1 },
  { id: "o12", questionId: "q5", value: "10-30 cm", labelVi: "10-30 cm", sortOrder: 2 },
  { id: "o13", questionId: "q5", value: "Trên 30 cm", labelVi: "Trên 30 cm", sortOrder: 3 },
  { id: "o14", questionId: "q5", value: "Không rõ", labelVi: "Không rõ", sortOrder: 4 },
];

export const demoIncidents: Incident[] = [
  {
    id: "inc1",
    publicCode: "SF-00101",
    issueTypeCode: "POTHOLE",
    centroidLat: 10.762622,
    centroidLng: 106.660172,
    status: "NEW",
    baseSeverity: "MEDIUM",
    priorityScore: 3,
    priorityLevel: "MEDIUM",
    priorityReasons: ["Mức độ nghiêm trọng trung bình"],
    confidenceLevel: "HIGH",
    independentReportCount: 1,
    createdAt: subHours(now, 2).toISOString(),
    updatedAt: subHours(now, 2).toISOString()
  },
  {
    id: "inc2",
    publicCode: "SF-00102",
    issueTypeCode: "GARBAGE",
    centroidLat: 10.772622,
    centroidLng: 106.670172,
    status: "IN_PROGRESS",
    baseSeverity: "LOW",
    priorityScore: 4,
    priorityLevel: "MEDIUM",
    priorityReasons: ["Mức độ nghiêm trọng thấp", "Nhiều người báo cáo (+1)"],
    confidenceLevel: "HIGH",
    independentReportCount: 3,
    assignedDepartmentId: "d2",
    assignedOfficerId: "u2",
    createdAt: subDays(now, 2).toISOString(),
    updatedAt: subDays(now, 1).toISOString()
  }
];

export const demoObservations: Observation[] = [
  {
    id: "obs1",
    incidentId: "inc1",
    reporterId: "u1",
    source: "LIVE_CAMERA",
    issueTypeCode: "POTHOLE",
    title: "Ổ gà giữa đường lớn",
    description: "Có một ổ gà lớn, bị đọng nước nguy hiểm cho xe máy.",
    answersJson: JSON.stringify({ q1: "Giữa làn xe", q2: "Có" }),
    capturedAt: subHours(now, 2).toISOString(),
    submittedAt: subHours(now, 2).toISOString(),
    lat: 10.762622,
    lng: 106.660172,
    accuracyMeters: 10,
    locationSource: "LIVE_DEVICE",
    imageAssetId: "asset1",
    staleEvidence: false,
    createdAt: subHours(now, 2).toISOString()
  }
];

export const demoAssets: Asset[] = [
  {
    id: "asset1",
    kind: "ORIGINAL",
    storagePath: "/demo-images/placeholder.jpg",
    mimeType: "image/jpeg",
    createdAt: subHours(now, 2).toISOString()
  }
];

export const demoEvents: IncidentEvent[] = [
  {
    id: "evt1",
    incidentId: "inc1",
    type: "CREATED",
    newStatus: "NEW",
    createdAt: subHours(now, 2).toISOString()
  }
];

export const demoRoutingRules: RoutingRule[] = [
  { id: "rr1", issueTypeCode: "POTHOLE", departmentId: "d1", priority: 1, active: true },
  { id: "rr2", issueTypeCode: "GARBAGE", departmentId: "d2", priority: 1, active: true },
  { id: "rr3", issueTypeCode: "EXPOSED_WIRE", departmentId: "d3", priority: 1, active: true },
];
