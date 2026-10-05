# SnapFix CT — Build Brief for Antigravity / Gemini Pro 3.1

## 0. Mission

Build a production-shaped **full-stack web MVP** for **SnapFix CT**, a two-sided urban incident management system:

- **Citizen side:** capture/upload a photo of an urban issue, attach location/time evidence, submit an observation, track status, confirm existing incidents.
- **Officer side:** receive structured incidents, review evidence, assign work, update status, upload resolution evidence, close incidents.
- **Important:** do **not** integrate any external AI API yet. The app must work fully without AI.

The core domain model is:

> **Observation = one person's evidence/report.**  
> **Incident = the real-world issue that may contain many observations.**

Do not collapse these into the same table.

---

## 1. Product principles

1. **No-GPS is not a hard failure.**
   - If live geolocation is unavailable/denied, fall back to EXIF GPS.
   - If EXIF GPS is absent, ask the user to pin the location on a map.
   - If needed, allow address/landmark input and then manual map correction.

2. **Evidence has confidence, not absolute truth.**
   - Never claim that GPS/EXIF proves a photo is genuine.
   - Compute an explainable `LOW | MEDIUM | HIGH` evidence confidence from rules.

3. **Offline must be considered from day one.**
   - The PWA should cache the application shell.
   - Offline captures are stored in IndexedDB as pending observations.
   - When connectivity returns, show a clear pending queue and allow sync.
   - Background sync is optional; manual "Sync now" must work.

4. **Officer workflow is first-class.**
   - This is not just a citizen reporting form.
   - Officers need a queue, map, filters, incident detail, assignment, status transitions and resolution evidence.

5. **The MVP must run without AI.**
   - Citizens manually choose issue type.
   - Use templates/rules for description, duplicate suggestion, confidence and priority.
   - Create a clean `AIAdapter` interface for future integration, but use a `NoopAIAdapter` / mock implementation now.

---

## 2. Recommended stack

Use this stack unless a library is incompatible:

- **Next.js 15+ App Router**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **PostgreSQL / Supabase**
- **Supabase Auth**
- **Supabase Storage**
- **Leaflet + OpenStreetMap**
- **Zod**
- **exifr** for EXIF parsing
- **idb** or Dexie for IndexedDB
- **PWA / Service Worker** via Serwist or an equivalent maintained Next.js-compatible approach
- **React Hook Form**
- **date-fns**

If Supabase environment variables are not configured, the app must still launch in **Demo Mode** with seeded local/mock repositories.

Create repository interfaces so persistence can be swapped:

```ts
interface IncidentRepository {}
interface ObservationRepository {}
interface UserRepository {}
interface AssetRepository {}
```

Provide:

- `Supabase...Repository`
- `Demo...Repository`

---

## 3. Visual direction

Design should feel like a modern civic operations product:

- clean
- accessible
- mobile-first citizen flow
- desktop-first officer dashboard
- neutral palette with severity/status accents
- no flashy "AI" gradients
- clear map/data hierarchy
- large touch targets
- Vietnamese-first UI, structure code so English can be added later

Use a single design system and reusable status/severity chips.

---

## 4. Roles

Implement these roles:

```ts
type UserRole =
  | "CITIZEN"
  | "OFFICER"
  | "MANAGER"
  | "ADMIN";
```

### CITIZEN
Can:

- create observations
- view public incidents
- view their own reports
- confirm "still exists"
- confirm "resolved"
- view incident timeline

### OFFICER
Can:

- view incidents for their assigned department/area
- accept work
- update status
- add notes
- upload resolution photos

### MANAGER
Can additionally:

- assign officer
- reassign department
- see department metrics
- manage backlog

### ADMIN
Can:

- manage users/roles
- manage departments
- manage issue types
- manage routing rules
- access system configuration

---

## 5. Core states

Use these incident statuses:

```ts
type IncidentStatus =
  | "NEW"
  | "VERIFIED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "COMMUNITY_VERIFIED"
  | "CLOSED";
```

Also support:

```ts
"CANCELLED"
"DUPLICATE"
"UNROUTED"
```

where appropriate as flags or exceptional states.

Store every important status change in an event timeline.

---

## 6. Core data model

### User

```ts
type User = {
  id: string;
  role: UserRole;
  displayName: string;
  email?: string;
  phone?: string;
  departmentId?: string;
  createdAt: string;
};
```

### Department

```ts
type Department = {
  id: string;
  name: string;
  code: string;
  active: boolean;
};
```

### IssueType

Seed:

- POTHOLE
- STREET_LIGHT
- GARBAGE
- FLOODING
- FALLEN_TREE
- EXPOSED_WIRE
- OTHER

Schema:

```ts
type IssueType = {
  id: string;
  code: string;
  nameVi: string;
  nameEn?: string;
  active: boolean;
  defaultSeverity?: "LOW" | "MEDIUM" | "HIGH";
};
```

### Observation

```ts
type Observation = {
  id: string;
  incidentId?: string;
  reporterId?: string;

  source:
    | "LIVE_CAMERA"
    | "FILE_UPLOAD"
    | "OFFLINE_CAPTURE";

  issueTypeCode: string;
  description?: string;

  capturedAt?: string;
  submittedAt: string;

  lat?: number;
  lng?: number;
  accuracyMeters?: number;

  locationSource:
    | "LIVE_DEVICE"
    | "EXIF"
    | "MANUAL_PIN"
    | "TEXT_ONLY"
    | "UNKNOWN";

  locationText?: string;

  exifAvailable: boolean;
  exifCapturedAt?: string;

  evidenceConfidence: "LOW" | "MEDIUM" | "HIGH";
  evidenceReasons: string[];

  imageAssetId: string;
  publicImageAssetId?: string;

  staleEvidence: boolean;

  createdAt: string;
};
```

### Incident

```ts
type Incident = {
  id: string;
  publicCode: string; // e.g. SF-00142
  issueTypeCode: string;

  centroidLat?: number;
  centroidLng?: number;

  status: IncidentStatus;

  baseSeverity: "LOW" | "MEDIUM" | "HIGH";
  priorityScore: number;
  priorityLevel: "LOW" | "MEDIUM" | "HIGH";
  priorityReasons: string[];

  confidenceLevel: "LOW" | "MEDIUM" | "HIGH";

  independentReportCount: number;

  assignedDepartmentId?: string;
  assignedOfficerId?: string;

  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
};
```

### IncidentEvent

```ts
type IncidentEvent = {
  id: string;
  incidentId: string;
  actorId?: string;

  type:
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

  oldStatus?: IncidentStatus;
  newStatus?: IncidentStatus;
  note?: string;
  metadata?: Record<string, unknown>;

  createdAt: string;
};
```

### Asset

```ts
type Asset = {
  id: string;
  kind: "ORIGINAL" | "PUBLIC_REDACTED" | "RESOLUTION";
  storagePath: string;
  mimeType: string;
  width?: number;
  height?: number;
  createdAt: string;
};
```

### RoutingRule

```ts
type RoutingRule = {
  id: string;
  issueTypeCode: string;
  areaCode?: string;
  departmentId: string;
  priority: number;
  active: boolean;
};
```

---

## 7. Citizen routes

Create these routes:

```txt
/
  public landing + public incident map

/report/new
  choose live camera or upload

/report/capture
  live camera + geolocation capture

/report/review
  preview image + metadata + issue type + location

/report/location
  manual map picker fallback

/report/duplicate
  show possible nearby incident

/report/confirm
  final submission summary

/reports
  citizen's submitted observations/incidents

/incidents/[id]
  public/citizen incident detail + timeline

/offline
  pending offline queue
```

---

## 8. Officer routes

```txt
/officer/login
/officer
  dashboard

/officer/incidents
  queue/table

/officer/incidents/[id]
  incident detail

/officer/map
  operations map

/officer/metrics
  simple KPI dashboard

/manager/routing
  routing rules

/admin/*
  minimal admin screens if time permits
```

---

## 9. Citizen capture flow

### 9.1 Live camera mode

Use:

```ts
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: { ideal: "environment" }
  }
});
```

At the same time, call:

```ts
navigator.geolocation.watchPosition(...)
```

Store multiple samples in a temporary `CaptureSession`.

Example:

```ts
type LocationSample = {
  lat: number;
  lng: number;
  accuracyMeters: number;
  capturedAt: number;
};

type CaptureSession = {
  id: string;
  startedAt: number;
  source: "LIVE_CAMERA" | "OFFLINE_CAPTURE";
  locationSamples: LocationSample[];
  imageCapturedAt?: number;
  networkState: "ONLINE" | "OFFLINE";
};
```

When the shutter is pressed:

1. capture image Blob
2. set `imageCapturedAt`
3. choose the best location sample close to the capture time
4. go to review

Selection heuristic:

- discard very old samples
- prefer samples nearest to `imageCapturedAt`
- prefer lower `accuracyMeters`
- do not pretend poor accuracy is precise

UI should show:

```txt
📍 Đang xác định vị trí...
📍 Vị trí tốt ± 12 m
⚠ Vị trí chưa chính xác ± 320 m
```

### 9.2 Permission denied

Do **not** block submission.

Show:

```txt
SnapFix chưa lấy được vị trí.
Bạn có thể chọn vị trí sự cố trên bản đồ.
```

CTA:

- `Chọn trên bản đồ`
- `Thử lại vị trí`

### 9.3 File upload

Accept image files.

Parse EXIF with `exifr`.

Try:

- GPS coordinates
- DateTimeOriginal
- orientation

Never assume EXIF is trustworthy enough to "verify" the photo.

If EXIF GPS exists:
- prefill the map with it
- label source as `EXIF`

If absent:
- request manual pin

If the photo is old:
- show a stale evidence warning

Use a configurable rule, default:

```ts
const STALE_EVIDENCE_DAYS = 7;
```

Copy:

```txt
Ảnh này được chụp hơn 7 ngày trước.
Tình trạng hiện trường có thể đã thay đổi.
```

---

## 10. Offline PWA

Implement:

- app shell caching
- offline route availability
- IndexedDB store for pending observations
- image Blob stored locally
- explicit sync queue

Suggested IndexedDB record:

```ts
type PendingObservation = {
  localId: string;
  imageBlob: Blob;
  imagePreviewUrl?: string;

  source: "OFFLINE_CAPTURE";

  capturedAt: string;

  lat?: number;
  lng?: number;
  accuracyMeters?: number;

  issueTypeCode?: string;
  manualLocationText?: string;

  syncStatus:
    | "PENDING_SYNC"
    | "SYNCING"
    | "SYNCED"
    | "FAILED";

  errorMessage?: string;
};
```

Offline page should show cards:

```txt
3 phản ánh chưa gửi

Ổ gà
14:31
✓ Đã có vị trí
[Chỉnh sửa] [Gửi khi có mạng]

Đèn đường
18:51
⚠ Chưa có vị trí
[Chọn vị trí]
```

When connection returns:

- show online indicator
- enable `Đồng bộ tất cả`
- retry failures safely
- avoid duplicate submissions by using an idempotency key based on `localId`

Do not require automatic Background Sync support. Manual sync must be reliable.

---

## 11. Map behavior

Use Leaflet + OpenStreetMap.

### Public map

Show incident pins, not every observation.

Pin displays:

- type
- status
- priority
- number of independent reports
- days unresolved

### Manual location picker

- center on current device location if available
- otherwise center on configured default city
- allow tap/click to place marker
- allow marker drag
- optionally reverse geocode only if a free provider is available and rate-limit friendly
- app must work without reverse geocoding

### Officer map

Filters:

- status
- issue type
- priority
- department
- unresolved only
- date range

---

## 12. Duplicate / incident matching without AI

Implement a deterministic candidate search.

Candidate criteria:

```ts
same issueType
AND distanceMeters <= DUPLICATE_RADIUS_METERS
AND incident not CLOSED/CANCELLED
```

Default:

```ts
const DUPLICATE_RADIUS_METERS = 30;
```

Use Haversine distance.

If candidate exists, citizen sees:

```txt
Có thể sự cố này đã được báo

Ổ gà • cách vị trí bạn 18 m
5 người đã báo
Cập nhật gần nhất: 2 giờ trước

[Đúng là sự cố này]
[Tạo sự cố mới]
```

If they choose same incident:
- create a new Observation
- attach it to that Incident
- increment independent report count
- add IncidentEvent `OBSERVATION_ADDED`

Do not simply discard the new report.

---

## 13. Evidence confidence rules

Implement an explainable rule engine.

Example scoring:

```ts
let score = 0;

// Location
if (source === "LIVE_CAMERA" && accuracy <= 30) score += 4;
else if (source === "LIVE_CAMERA" && accuracy <= 100) score += 3;
else if (locationSource === "EXIF") score += 2;
else if (locationSource === "MANUAL_PIN") score += 1;

// Provenance
if (source === "LIVE_CAMERA" || source === "OFFLINE_CAPTURE") score += 2;
else if (source === "FILE_UPLOAD") score += 1;

// Freshness
if (photoAgeHours <= 24) score += 2;
else if (photoAgeDays <= 7) score += 1;

// Corroboration can be added at incident level
```

Map to:

```ts
0..2 => LOW
3..5 => MEDIUM
6+   => HIGH
```

Important:

- keep thresholds in config
- always return `reasons[]`
- do not expose false precision to users

Example:

```ts
{
  level: "HIGH",
  reasons: [
    "Chụp trực tiếp trong SnapFix",
    "Vị trí thiết bị ± 11 m",
    "Ảnh được chụp trong 24 giờ gần nhất"
  ]
}
```

---

## 14. Priority rules

Do not call this "accident prediction".

Implement a transparent priority score.

Example:

```ts
score =
  severityWeight
  + unresolvedAgeWeight
  + reportCountWeight
  + sensitiveLocationWeight
```

For MVP:

```ts
severity:
LOW=1
MEDIUM=3
HIGH=5

age:
>= 3 days +1
>= 7 days +2
>= 14 days +3

independent reports:
>= 3 +1
>= 5 +2
>= 10 +3
```

Sensitive location can be a manual/admin flag for now.

Return:

```ts
{
  score,
  level: "LOW" | "MEDIUM" | "HIGH",
  reasons: string[]
}
```

Every score change should create an incident event if it changes materially.

---

## 15. Officer dashboard

### Summary cards

- Incident mới hôm nay
- Chưa phân công
- Đang xử lý
- Quá 7 ngày
- Đã xử lý tuần này

### Queue table

Columns:

- code
- type
- area/location
- priority
- confidence
- reports count
- age
- assignee
- status

Filters:

- status
- priority
- issue type
- department
- assignee
- date
- keyword

Sort default:

1. highest priority
2. oldest unresolved

### Incident detail

Layout:

**Header**
- SF-00142
- status
- priority
- confidence
- type
- location

**Evidence**
- observation cards
- photos
- source labels
- GPS/EXIF/manual source
- accuracy
- capture time
- confidence reasons

**Actions**
- verify
- assign
- change status
- add note
- upload resolution image

**Timeline**
- all IncidentEvents

---

## 16. Resolution flow

Officer:

1. opens Incident
2. sets `IN_PROGRESS`
3. optionally adds note
4. uploads after-photo
5. selects `RESOLVED`

Citizen sees:

```txt
Sự cố đã được đơn vị xử lý.
Bạn có thể xác nhận tình trạng hiện tại.

[Đã xử lý]
[Vẫn còn vấn đề]
```

If community confirms:
- create `COMMUNITY_CONFIRMED`
- status -> `COMMUNITY_VERIFIED`

Manager/officer can then close:
- status -> `CLOSED`

---

## 17. Routing engine

No AI.

Use database rules:

```txt
(issueTypeCode, areaCode?) -> departmentId
```

Rules are ordered by priority.

Algorithm:

1. exact issue + area match
2. issue-only fallback
3. else `UNROUTED`

Show `UNROUTED` queue to manager/admin.

---

## 18. Image and privacy pipeline

For MVP, implement the architecture even if some redaction is stubbed.

Pipeline:

1. receive original
2. extract EXIF fields needed
3. persist only required metadata fields
4. create public derivative without EXIF
5. original stays private
6. public derivative is used on public pages

Future:
- face blur
- license plate blur

Never expose raw GPS metadata through public image downloads.

---

## 19. AI adapter — future-proof but disabled

Create:

```ts
interface AIAdapter {
  classifyIssue(input: {
    imageUrl: string;
  }): Promise<{
    issueTypeCode: string;
    confidence: number;
  }>;

  assessSeverity(input: {
    imageUrl: string;
    context?: Record<string, unknown>;
  }): Promise<{
    severity: "LOW" | "MEDIUM" | "HIGH";
    reasons: string[];
  }>;

  draftReport(input: {
    issueTypeCode: string;
    locationText?: string;
  }): Promise<{
    text: string;
  }>;
}
```

Implement:

```ts
class NoopAIAdapter implements AIAdapter
```

It must never call an external API.

UI may show:

```txt
Phân tích AI: Chưa bật trong bản demo
```

Do not fake AI results and do not label rule-based outputs as AI.

---

## 20. API routes

Implement at least:

```txt
POST   /api/observations
GET    /api/observations/:id

GET    /api/incidents
GET    /api/incidents/:id
POST   /api/incidents/:id/confirm
POST   /api/incidents/:id/assign
POST   /api/incidents/:id/status
POST   /api/incidents/:id/resolution

GET    /api/map/incidents
GET    /api/dashboard/summary

POST   /api/offline/sync

GET    /api/departments
GET    /api/issue-types
```

Use Zod for all mutation payloads.

---

## 21. Security requirements

- never trust role claims from client-only state
- enforce RBAC server-side
- private storage for original images
- public/read-limited storage for sanitized images
- validate MIME and file size
- limit images per observation
- rate-limit report creation if infrastructure allows
- use signed URLs for private media
- sanitize user text
- do not log raw sensitive metadata unnecessarily
- support anonymous citizen draft/submission if practical; otherwise guest demo mode is acceptable

---

## 22. Demo mode

The repository must run without external accounts.

Provide:

```bash
npm install
npm run dev
```

with seeded demo data.

Demo users:

```txt
citizen@example.com
officer@example.com
manager@example.com
admin@example.com
```

For Demo Mode, a simple role selector is acceptable if auth is not configured.

Seed at least:

- 12 incidents
- mixed statuses
- 5 issue types
- 3 departments
- 20 observations
- several duplicate observations attached to one incident
- at least 2 resolved incidents
- timeline events
- map coordinates around a configurable default demo area

Use obviously synthetic data.

---

## 23. Environment configuration

Create `.env.example`.

Suggested variables:

```env
NEXT_PUBLIC_APP_NAME=SnapFix CT

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_DEFAULT_MAP_LAT=
NEXT_PUBLIC_DEFAULT_MAP_LNG=
NEXT_PUBLIC_DEFAULT_MAP_ZOOM=13

NEXT_PUBLIC_DEMO_MODE=true
```

Do not hardcode secrets.

---

## 24. Folder structure

Suggested:

```txt
src/
  app/
    (public)/
    report/
    reports/
    incidents/
    officer/
    manager/
    admin/
    api/

  components/
    map/
    camera/
    incident/
    observation/
    officer/
    common/

  domain/
    incident/
    observation/
    confidence/
    priority/
    routing/

  lib/
    auth/
    db/
    storage/
    exif/
    geolocation/
    offline/
    repositories/
    ai/

  services/
    incident-service.ts
    observation-service.ts
    sync-service.ts

  types/
```

Keep domain logic out of React components.

---

## 25. Key reusable components

Build:

```txt
CameraCapture
GeolocationStatus
ImageUpload
ExifSummary
ManualLocationPicker
EvidenceConfidenceBadge
EvidenceReasonList
PriorityBadge
IncidentStatusBadge
IncidentMap
IncidentTimeline
ObservationCard
PossibleDuplicateCard
OfflineQueueCard
OfficerIncidentTable
AssignmentDialog
StatusUpdateDialog
ResolutionUploader
```

---

## 26. UX copy examples

### Geolocation denied

```txt
Không lấy được vị trí tự động

Bạn vẫn có thể gửi phản ánh.
Hãy chọn vị trí sự cố trên bản đồ.

[Chọn trên bản đồ]
[Thử lại]
```

### Offline

```txt
Bạn đang offline

Ảnh sẽ được lưu trên thiết bị và có thể gửi khi có mạng.
```

### Duplicate candidate

```txt
Có thể sự cố này đã được báo

5 người đã báo cùng vị trí.
Nếu đúng, phản ánh của bạn sẽ được thêm làm bằng chứng mới.

[Đúng là sự cố này]
[Tạo sự cố mới]
```

### Low confidence

```txt
Độ tin cậy: Thấp

Vị trí được chọn thủ công và ảnh không có metadata GPS.
Phản ánh vẫn được tiếp nhận.
```

---

## 27. Accessibility

Meet sensible WCAG practices:

- semantic labels
- keyboard usable desktop dashboard
- visible focus
- status not encoded by color alone
- image alt text
- map has textual fallback list
- buttons at least comfortable mobile size
- support system font scaling

---

## 28. Testing

Add unit tests for domain rules:

- Haversine distance
- duplicate candidate matching
- evidence confidence
- priority calculation
- routing
- status transition validation

Add at least a few Playwright/E2E flows if possible:

1. Citizen live/manual report flow
2. Upload without EXIF -> manual pin
3. Offline queue -> later sync
4. Officer receives incident -> assigns -> resolves
5. Citizen confirms resolution

---

## 29. Status transition validation

Do not allow arbitrary transitions.

Example:

```ts
NEW -> VERIFIED | ASSIGNED
VERIFIED -> ASSIGNED
ASSIGNED -> IN_PROGRESS
IN_PROGRESS -> RESOLVED
RESOLVED -> COMMUNITY_VERIFIED | IN_PROGRESS
COMMUNITY_VERIFIED -> CLOSED
```

Manager/Admin may have override powers with audit events.

---

## 30. Implementation order

Build in this order:

### Phase 1 — foundation
- Next.js project
- UI system
- Demo repositories
- domain types
- seed data

### Phase 2 — incident operations
- incident list
- incident detail
- timeline
- status updates
- assignment

### Phase 3 — citizen reporting
- upload
- manual map
- live geolocation
- live camera
- review + submit

### Phase 4 — incident matching
- Haversine
- duplicate candidate flow
- add observation to existing incident

### Phase 5 — offline
- PWA shell
- IndexedDB pending queue
- manual sync

### Phase 6 — real backend
- Supabase schema
- auth
- storage
- repository implementation

### Phase 7 — polish
- responsive design
- accessibility
- filters
- demo scenarios
- tests

---

## 31. Definition of done

The MVP is complete when all of these work:

- [ ] Citizen can capture photo from mobile browser.
- [ ] Browser starts geolocation collection during capture.
- [ ] GPS denial does not block report.
- [ ] Manual map pin works.
- [ ] Upload reads EXIF when present.
- [ ] Old photo warning works.
- [ ] Offline capture can be saved locally.
- [ ] Pending offline observation can sync later.
- [ ] New observation can create a new incident.
- [ ] Nearby same-type incident can be suggested as a duplicate.
- [ ] Citizen can attach a new observation to an existing incident.
- [ ] Confidence level and reasons are visible.
- [ ] Officer sees incident queue.
- [ ] Officer can assign and update status.
- [ ] Officer can upload resolution evidence.
- [ ] Citizen sees incident timeline.
- [ ] Citizen can confirm resolution.
- [ ] Public map displays incidents.
- [ ] RBAC is enforced.
- [ ] App works in Demo Mode without AI or Supabase.
- [ ] No external AI API is called anywhere.

---

## 32. Do not do these things

- Do not build a single `reports` table and call it done.
- Do not require GPS to submit.
- Do not use IP geolocation as precise incident location.
- Do not call EXIF "verification".
- Do not expose EXIF GPS in public image files.
- Do not fake AI.
- Do not make the citizen flow desktop-first.
- Do not make officer dashboard a simple read-only map.
- Do not silently merge reports without citizen confirmation.
- Do not store offline images only in React state.
- Do not put domain scoring logic inside UI components.
- Do not require external services for the app to boot.

---

## 33. Final deliverables from the coding agent

Produce:

1. working repository
2. README with setup instructions
3. `.env.example`
4. database migration/schema
5. seeded demo mode
6. responsive citizen UI
7. officer dashboard
8. PWA offline queue
9. tests for key domain rules
10. architecture notes explaining:
   - Observation vs Incident
   - confidence engine
   - priority engine
   - offline sync
   - routing
   - AI adapter placeholder

Before finishing, run:

```bash
npm run lint
npm run test
npm run build
```

Fix all errors that block build.

The final web demo should communicate this core story clearly:

> **Citizen provides evidence → SnapFix creates/updates an Incident → Officer processes the Incident → Citizen sees and verifies the outcome.**
