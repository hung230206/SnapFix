export type UserRole = "CITIZEN" | "OFFICER" | "MANAGER" | "ADMIN";

export type User = {
  id: string;
  role: UserRole;
  displayName: string;
  email?: string;
  phone?: string;
  departmentId?: string;
  createdAt: string;
};

export type Department = {
  id: string;
  name: string;
  code: string;
  active: boolean;
};

export type IssueType = {
  id: string;
  code: string;
  nameVi: string;
  nameEn?: string;
  icon?: string;
  active: boolean;
  defaultSeverity?: "LOW" | "MEDIUM" | "HIGH";
  emergencyWarning?: string;
};

export type IssueQuestion = {
  id: string;
  issueTypeCode: string;
  labelVi: string;
  helpTextVi?: string;
  inputType: "TEXT" | "TEXTAREA" | "NUMBER" | "BOOLEAN" | "SINGLE_SELECT" | "MULTI_SELECT";
  required: boolean;
  visibility: "PUBLIC" | "OFFICER_ONLY";
  sortOrder: number;
};

export type IssueQuestionOption = {
  id: string;
  questionId: string;
  value: string;
  labelVi: string;
  sortOrder: number;
};

export type ObservationSource = "LIVE_CAMERA" | "FILE_UPLOAD" | "OFFLINE_CAPTURE";
export type LocationSource = "LIVE_DEVICE" | "EXIF" | "MANUAL_PIN" | "ADDRESS_GEOCODED";
export type ConfidenceLevel = "LOW" | "MEDIUM" | "HIGH";
export type LocationConsistencyStatus = "STRONG_MATCH" | "ACCEPTABLE_MATCH" | "MISMATCH" | "INSUFFICIENT_EVIDENCE";

export type ObservationEvidence = {
  id: string;
  observationId: string;
  
  imageSource: ObservationSource;
  imageCapturedAt?: string;
  
  exifAvailable: boolean;
  exifGpsAvailable: boolean;
  exifLat?: number;
  exifLng?: number;

  captureDeviceLat?: number;
  captureDeviceLng?: number;
  captureDeviceAccuracyMeters?: number;

  submissionDeviceLat?: number;
  submissionDeviceLng?: number;
  submissionDeviceAccuracyMeters?: number;

  reportedLat: number;
  reportedLng: number;
  locationSource: LocationSource;

  locationDistanceMeters?: number;
  locationConsistencyStatus: LocationConsistencyStatus;

  evidenceConfidence: ConfidenceLevel;
  evidenceReasonsJson: string; // JSON string of string[]
  evidenceWarningsJson: string; // JSON string of string[]

  createdAt: string;
};

export type Observation = {
  id: string;
  incidentId?: string;
  reporterId?: string;
  source: ObservationSource;
  
  issueTypeCode: string;
  title?: string;
  description?: string;
  answersJson?: string; // JSON string of Record<string, any>
  
  capturedAt?: string;
  submittedAt: string;
  
  lat?: number;
  lng?: number;
  accuracyMeters?: number;
  locationSource: LocationSource;
  locationText?: string;
  
  evidenceId?: string; // Links to ObservationEvidence
  
  imageAssetId: string;
  publicImageAssetId?: string;
  
  staleEvidence: boolean;
  createdAt: string;
};

export type IncidentStatus = 
  | "NEW" 
  | "VERIFIED" 
  | "ASSIGNED" 
  | "IN_PROGRESS" 
  | "RESOLVED" 
  | "COMMUNITY_VERIFIED" 
  | "CLOSED"
  | "CANCELLED"
  | "DUPLICATE"
  | "UNROUTED";

export type Severity = "LOW" | "MEDIUM" | "HIGH";

export type Incident = {
  id: string;
  publicCode: string;
  issueTypeCode: string;
  centroidLat?: number;
  centroidLng?: number;
  status: IncidentStatus;
  baseSeverity: Severity;
  priorityScore: number;
  priorityLevel: Severity;
  priorityReasons: string[];
  confidenceLevel: ConfidenceLevel;
  independentReportCount: number;
  assignedDepartmentId?: string;
  assignedOfficerId?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
};

export type IncidentEventType = 
  | "CREATED"
  | "OBSERVATION_ADDED"
  | "VERIFIED"
  | "ASSIGNED"
  | "STATUS_CHANGED"
  | "NOTE_ADDED"
  | "PRIORITY_CHANGED"
  | "RESOLUTION_UPLOADED"
  | "COMMUNITY_CONFIRMED"
  | "CLOSED";

export type IncidentEvent = {
  id: string;
  incidentId: string;
  actorId?: string;
  type: IncidentEventType;
  oldStatus?: IncidentStatus;
  newStatus?: IncidentStatus;
  note?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type AssetKind = "ORIGINAL" | "PUBLIC_REDACTED" | "RESOLUTION";

export type Asset = {
  id: string;
  kind: AssetKind;
  storagePath: string;
  mimeType: string;
  width?: number;
  height?: number;
  createdAt: string;
};

export type RoutingRule = {
  id: string;
  issueTypeCode: string;
  areaCode?: string;
  departmentId: string;
  priority: number;
  active: boolean;
};
