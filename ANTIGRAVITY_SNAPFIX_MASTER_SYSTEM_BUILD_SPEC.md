# SnapFix CT — MASTER SYSTEM BUILD SPEC
## Antigravity / Gemini Pro 3.1 Coding Prompt
### Convert the current web prototype into a coherent, production-shaped civic incident management system

---

# 0. ROLE

You are the lead software architect and implementation agent for **SnapFix CT**.

Your job is not to create disconnected screens.

Your job is to transform the current web application into a **coherent end-to-end prototype system** with:

- a public homepage
- citizen reporting workflow
- citizen personal dashboard
- public incident map
- officer operations dashboard
- manager dashboard
- admin configuration area
- incident lifecycle logic
- observation/evidence logic
- routing logic
- priority logic
- confidence logic
- duplicate matching
- timeline/audit events
- offline reporting
- file/media handling
- authentication and role-aware navigation
- clear domain boundaries
- clean APIs/repositories
- realistic seeded demo data
- extension points for AI modules that will be integrated later

The prototype must be convincing enough to demonstrate the full SnapFix CT product concept without depending on AI APIs.

The system must remain usable when all AI features are disabled.

---

# 1. PRODUCT DEFINITION

SnapFix CT is a two-sided urban incident management system.

It connects:

```text
CITIZENS
   |
   | observations / photos / location / details
   v
SNAPFIX CT
   |
   | validation / matching / prioritization / routing
   v
OFFICERS / DEPARTMENTS
   |
   | assignment / processing / resolution
   v
INCIDENT STATUS + RESOLUTION EVIDENCE
   |
   v
CITIZENS / COMMUNITY
```

SnapFix CT is **not simply a form for submitting complaints**.

Its central data object is an **Incident**.

A citizen creates an **Observation**.

Multiple observations may refer to the same Incident.

Officers manage the Incident.

---

# 2. CORE DOMAIN MODEL

The most important rule in this project:

> **Observation and Incident are different concepts.**

## 2.1 Observation

An Observation represents one submission/evidence package from one citizen.

Example:

```text
Citizen A
Photo of pothole
GPS ±12m
Description
Submitted at 08:30
```

That is one Observation.

## 2.2 Incident

An Incident represents the real-world problem.

Example:

```text
SF-00142
Pothole on Nguyen Van Cu Street

Observation #1
Observation #2
Observation #3

Officer assignment
Status history
Resolution photos
Community confirmation
```

Do not build a system where every citizen report becomes an independent case.

---

# 3. HIGH-LEVEL PRODUCT FLOW

The system should implement the following lifecycle:

```text
Citizen notices problem
        |
        v
Capture / upload photo
        |
        v
Collect evidence
        |
        v
Complete structured report
        |
        v
Location consistency check
        |
        v
Evidence confidence
        |
        v
Duplicate / nearby Incident matching
        |
        +---------------------+
        |                     |
        v                     v
Existing Incident       New Incident
        |                     |
        +----------+----------+
                   |
                   v
             Routing engine
                   |
                   v
              Officer queue
                   |
                   v
                Assign
                   |
                   v
             In progress
                   |
                   v
              Resolution
                   |
                   v
       Citizen/community confirmation
                   |
                   v
                 Closed
```

---

# 4. USER ROLES

Implement these roles.

```ts
type UserRole =
  | "CITIZEN"
  | "OFFICER"
  | "MANAGER"
  | "ADMIN";
```

---

# 5. ROLE PERMISSIONS

## 5.1 Citizen

Can:

- browse homepage
- browse public incident map
- browse public incident detail
- create Observation
- upload/capture photo
- confirm Incident location
- fill dynamic incident form
- edit AI suggestions
- save draft
- submit report
- see possible duplicate Incident
- attach Observation to an existing Incident
- view own reports
- follow Incident progress
- confirm issue still exists
- confirm issue resolved
- add follow-up evidence if permitted

Cannot:

- assign incidents
- edit official statuses
- view private citizen contact information
- modify routing
- access administrative configuration

---

## 5.2 Officer

Can:

- access officer dashboard
- view Incident queue within allowed scope
- inspect Incident evidence
- inspect Observations
- verify Incident
- accept assignment
- update workflow state
- add internal/public notes
- upload resolution evidence
- mark Incident resolved

Cannot by default:

- manage roles
- globally edit routing rules
- access unrelated departments if scoped

---

## 5.3 Manager

Can:

- see department-level dashboard
- view all department Incident queues
- assign / reassign officers
- adjust department routing if permitted
- manage unresolved backlog
- view SLA-like metrics
- reopen Incident if necessary
- see operational analytics

---

## 5.4 Admin

Can:

- manage users
- manage roles
- manage departments
- manage issue types
- manage issue-specific form questions
- manage routing rules
- manage system settings
- view all Incident data
- configure demo/feature flags
- configure future AI adapters

---

# 6. PRIMARY APPLICATION AREAS

The final prototype must feel like one connected system.

Required areas:

```text
PUBLIC
├── Homepage
├── Public Map
├── Incident Detail
├── About / How it works
└── Report CTA

CITIZEN
├── New Report
├── Report Review
├── Location Confirmation
├── Duplicate Check
├── Final Confirmation
├── My Reports
├── My Dashboard
├── Incident Tracking
└── Offline Drafts

OFFICER
├── Operations Dashboard
├── Incident Queue
├── Incident Detail
├── Operations Map
├── Assignments
└── Basic Metrics

MANAGER
├── Department Dashboard
├── Workload
├── Assignment
├── Backlog
├── Performance
└── Routing Overview

ADMIN
├── Users
├── Departments
├── Issue Types
├── Dynamic Questions
├── Routing Rules
└── System Settings
```

---

# 7. GLOBAL APPLICATION SHELL

Build a coherent application shell.

## Public navbar

```text
SnapFix CT

Trang chủ
Bản đồ sự cố
Cách hoạt động
Theo dõi phản ánh

[Đăng nhập]
[+ Phản ánh sự cố]
```

On mobile:

- compact logo
- report CTA remains prominent
- hamburger menu

---

## Citizen navbar after login

```text
SnapFix CT

Trang chủ
Bản đồ
Phản ánh của tôi
Thông báo

[+ Phản ánh mới]

Avatar
```

---

## Officer layout

Use a desktop-oriented sidebar.

```text
SnapFix Operations

Tổng quan
Sự cố
Bản đồ
Việc của tôi
Thống kê

----------------
Tài khoản
Đăng xuất
```

Manager adds:

```text
Phân công
Hiệu suất
Định tuyến
```

Admin adds:

```text
Người dùng
Loại sự cố
Biểu mẫu
Đơn vị
Cấu hình
```

Role-aware navigation must come from permissions, not duplicated hardcoded layouts.

---

# 8. HOMEPAGE

Route:

```text
/
```

The homepage must clearly explain the product.

Do not create a generic startup landing page.

Required sections:

## 8.1 Hero

Headline:

```text
Thấy sự cố.
Chụp ảnh.
Theo dõi đến khi được xử lý.
```

Subheadline:

```text
SnapFix CT giúp người dân gửi phản ánh có ảnh, vị trí và thông tin đầy đủ,
đồng thời giúp đơn vị xử lý quản lý sự cố trên một hệ thống thống nhất.
```

Primary CTA:

```text
Phản ánh sự cố
```

Secondary CTA:

```text
Xem bản đồ
```

---

## 8.2 Three-step explanation

```text
1. Gửi bằng chứng
Ảnh + vị trí + thông tin

2. SnapFix chuẩn hóa
Kiểm tra vị trí, tìm trùng, tạo Incident

3. Theo dõi xử lý
Cán bộ cập nhật và người dân theo dõi trạng thái
```

---

## 8.3 Public live-style statistics

Use demo data.

Example:

```text
128 sự cố được ghi nhận
37 đang xử lý
76 đã hoàn thành
15 cần xác minh
```

Do not present fake numbers as real production data.

Label seeded data:

```text
Dữ liệu minh họa trong prototype
```

---

## 8.4 Public map preview

Show a small incident map with a CTA:

```text
Xem toàn bộ bản đồ
```

---

## 8.5 Issue categories

Show icons/cards:

- Ổ gà
- Đèn đường
- Rác
- Ngập
- Cây ngã
- Hạ tầng khác

---

## 8.6 System trust explanation

Simple language:

```text
Ảnh và vị trí được ghi nhận như bằng chứng.
Nếu thiếu GPS, người dùng vẫn có thể chọn vị trí trên bản đồ.
SnapFix hiển thị rõ mức độ tin cậy thay vì tự động loại bỏ phản ánh.
```

---

# 9. PUBLIC INCIDENT MAP

Route:

```text
/map
```

Use Leaflet + OpenStreetMap.

Display **Incidents**, not individual Observations.

Filters:

```text
Loại sự cố
Trạng thái
Mức ưu tiên
Khoảng thời gian
```

Map pin popup:

```text
SF-00142
Ổ gà
Đang xử lý

6 người đã báo
Cập nhật 2 giờ trước

[Xem chi tiết]
```

Add list fallback below/side of map.

On mobile:

- map top
- bottom sheet list

---

# 10. PUBLIC INCIDENT DETAIL

Route:

```text
/incidents/[id]
```

Public view shows:

- Incident code
- issue type
- public title
- status
- approximate/appropriate public location
- primary image
- number of independent observations
- created time
- updated time
- public timeline
- resolution image when available

Do not expose:

- citizen phone
- citizen email
- raw private metadata
- officer-only notes
- exact sensitive data if configured private

Buttons:

```text
[Vấn đề này vẫn còn]
[Tôi có ảnh mới]
```

if authenticated/allowed.

---

# 11. CITIZEN DASHBOARD

Route:

```text
/dashboard
```

Citizen dashboard should not copy the officer dashboard.

Required blocks:

## Summary

```text
Phản ánh của tôi
Đang xử lý
Đã hoàn thành
Cần bổ sung thông tin
```

## Recent reports

Cards:

```text
SF-00142
Ổ gà
Đang xử lý
Cập nhật 2 giờ trước
```

## Pending offline drafts

If any:

```text
Bạn có 2 phản ánh chưa gửi
[Tiếp tục]
```

## Nearby incidents

Optional demo widget based on location if permission available.

---

# 12. COMPLETE REPORTING FLOW

This is a critical flow.

Use conceptual stages:

```text
1. Ảnh
2. Thông tin
3. Vị trí
4. Xác nhận
```

---

# 13. REPORT START PAGE

Route:

```text
/report/new
```

UI:

```text
Phản ánh sự cố

Bạn muốn cung cấp ảnh bằng cách nào?

[📷 Chụp ảnh ngay]
[🖼️ Chọn ảnh có sẵn]
```

Explain:

```text
Ảnh giúp cán bộ hiểu hiện trạng.
Bạn vẫn có thể bổ sung hoặc chỉnh sửa thông tin trước khi gửi.
```

---

# 14. LIVE CAMERA

Route or internal step:

```text
/report/capture
```

Use browser camera.

```ts
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: { ideal: "environment" }
  }
});
```

Simultaneously start:

```ts
navigator.geolocation.watchPosition(...)
```

Do not wait until shutter press.

UI states:

```text
Đang lấy vị trí...
```

```text
Vị trí ±12 m
```

```text
Vị trí chưa chính xác ±310 m
```

If permission denied:

```text
Không lấy được vị trí tự động.
Bạn vẫn có thể chọn vị trí trên bản đồ ở bước tiếp theo.
```

Never block capture.

---

# 15. CAPTURE SESSION MODEL

Create:

```ts
type CaptureSession = {
  id: string;
  source: "LIVE_CAMERA" | "OFFLINE_CAPTURE";
  startedAt: number;
  imageCapturedAt?: number;

  locationSamples: LocationSample[];

  networkState: "ONLINE" | "OFFLINE";
};
```

Location sample:

```ts
type LocationSample = {
  lat: number;
  lng: number;
  accuracyMeters: number;
  timestamp: number;
};
```

Select a location sample using:

- time proximity to shutter
- accuracy quality

Do not claim precision beyond the browser-provided `accuracy`.

---

# 16. IMAGE UPLOAD

For gallery upload:

- validate image type
- validate file size
- parse EXIF
- retain preview
- extract metadata

Use `exifr`.

Possible fields:

```text
GPSLatitude
GPSLongitude
DateTimeOriginal
Orientation
Make
Model
```

Do not require metadata.

---

# 17. REPORT REVIEW FORM

After capture/upload, do not submit immediately.

Route:

```text
/report/review
```

Required sections:

```text
Ảnh
Phân tích / gợi ý
Loại sự cố
Tiêu đề
Mô tả
Thông tin theo loại sự cố
Thông tin liên hệ
```

---

# 18. ISSUE TYPE

Initial issue types:

```ts
POTHOLE
STREET_LIGHT
GARBAGE
FLOODING
FALLEN_TREE
EXPOSED_WIRE
SIDEWALK
DRAINAGE
TRAFFIC_SIGN
OTHER
```

User must be able to select manually.

Future AI can suggest.

UI:

```text
Loại sự cố

AI gợi ý: Ổ gà

[Ổ gà ▼]

Bạn có thể sửa nếu gợi ý chưa đúng.
```

If AI disabled:

```text
[Chọn loại sự cố ▼]
```

No fake AI.

---

# 19. TITLE

Field:

```text
Tiêu đề phản ánh
```

Example:

```text
Ổ gà lớn gần giao lộ Nguyễn Văn Cừ
```

Future button:

```text
✨ AI viết tiêu đề
```

AI-generated text must be editable.

---

# 20. DESCRIPTION

Textarea:

```text
Mô tả tình trạng
```

Future button:

```text
✨ AI soạn mô tả
```

Generated content:

- must be editable
- must have undo
- must be marked as suggestion
- must never include private contact info
- must not invent measurements or facts

---

# 21. DYNAMIC ISSUE FORMS

Do not hardcode form variants into individual React pages.

Create data-driven questions.

```ts
type IssueQuestion = {
  id: string;
  issueTypeCode: string;
  label: string;
  helpText?: string;

  inputType:
    | "TEXT"
    | "TEXTAREA"
    | "NUMBER"
    | "BOOLEAN"
    | "SINGLE_SELECT"
    | "MULTI_SELECT";

  required: boolean;
  visibility: "PUBLIC" | "OFFICER_ONLY";
  options?: IssueQuestionOption[];
  order: number;
};
```

Option:

```ts
type IssueQuestionOption = {
  value: string;
  label: string;
};
```

---

# 22. SAMPLE DYNAMIC QUESTIONS

## POTHOLE

```text
Ổ gà nằm ở đâu?
- Giữa làn xe
- Gần lề
- Giao lộ
- Không rõ
```

```text
Có nước đọng không?
- Có
- Không
- Không rõ
```

---

## STREET_LIGHT

```text
Số đèn bị tắt?
```

```text
Khu vực tối hoàn toàn?
- Có
- Không
```

---

## FLOODING

```text
Mực nước ước lượng?
- Dưới 10 cm
- 10–30 cm
- Trên 30 cm
- Không rõ
```

```text
Xe máy có đi qua được không?
```

---

## FALLEN_TREE / EXPOSED_WIRE

Display safety warning.

```text
Nếu có nguy cơ trực tiếp đến tính mạng, hãy liên hệ dịch vụ khẩn cấp phù hợp.
SnapFix không thay thế dịch vụ cứu hộ.
```

---

# 23. CONTACT INFORMATION

Fields:

```text
Họ tên
Số điện thoại
Email
```

Configurable required/optional.

Add:

```text
[ ] Cho phép hiển thị tên trên phản ánh công khai
```

Never display phone/email publicly.

---

# 24. LOCATION MODEL

The system must distinguish:

```text
capture_location
exif_location
submission_device_location
reported_incident_location
```

These are not interchangeable.

---

# 25. CAPTURE LOCATION

Used when image captured inside SnapFix.

```ts
type GeoEvidence = {
  lat: number;
  lng: number;
  accuracyMeters?: number;
  timestamp?: number;
};
```

---

# 26. EXIF LOCATION

Used only if image metadata contains GPS.

EXIF location is evidence, not absolute truth.

---

# 27. SUBMISSION DEVICE LOCATION

This is where the device is at submission time.

This must **not** be used as the primary validation source for old/uploaded photos.

Example:

```text
Citizen takes photo outside
goes home
uploads at night

Home location != incident location

This is normal.
```

---

# 28. REPORTED INCIDENT LOCATION

This is the citizen-confirmed location.

It becomes the canonical Incident location.

The citizen should confirm it on the map.

---

# 29. LOCATION PAGE

Route:

```text
/report/location
```

Show:

- map
- suggested marker
- address/landmark input
- current evidence source
- location consistency card

Suggested marker priority:

```text
1. live capture GPS
2. EXIF GPS
3. current device location only as convenience
4. configured map center
```

Citizen must confirm.

---

# 30. LOCATION CONSISTENCY SERVICE

Implement as domain logic.

```ts
type LocationConsistencyStatus =
  | "STRONG_MATCH"
  | "ACCEPTABLE_MATCH"
  | "MISMATCH"
  | "INSUFFICIENT_EVIDENCE";
```

Input:

```ts
{
  evidenceLocation?: GeoEvidence;
  reportedLocation: GeoPoint;
}
```

Use Haversine distance.

---

# 31. LOCATION TOLERANCE

Configuration:

```ts
LOCATION_MATCH_STRONG_METERS = 50
LOCATION_MATCH_ACCEPTABLE_METERS = 200
ACCURACY_MULTIPLIER = 1.5
```

Effective tolerance:

```ts
max(
  baseTolerance,
  evidenceAccuracyMeters * ACCURACY_MULTIPLIER
)
```

Do not treat GPS ±300m as if it had ±10m precision.

---

# 32. LOCATION RESULT UI

Strong:

```text
✓ Vị trí phù hợp

Điểm bạn chọn cách vị trí chụp 9 m.
GPS tại thời điểm chụp có sai số ±12 m.
```

Mismatch:

```text
⚠ Vị trí cần kiểm tra

Vị trí trong ảnh cách điểm bạn chọn 2.1 km.

[Chỉnh lại vị trí]
[Vẫn tiếp tục]
```

No evidence:

```text
ℹ Không có GPS trong ảnh

Vị trí phản ánh sẽ dựa trên điểm bạn chọn.
```

Never hard reject solely on mismatch.

---

# 33. EVIDENCE CONFIDENCE

Implement explainable rule-based confidence.

```ts
type EvidenceConfidence = {
  level: "LOW" | "MEDIUM" | "HIGH";
  scoreInternal: number;
  reasons: string[];
  warnings: string[];
};
```

Do not show raw score to users.

---

# 34. CONFIDENCE SIGNALS

Positive:

```text
live capture
accurate capture GPS
EXIF GPS
fresh photo
location match
multiple independent observations
follow-up evidence
```

Weak:

```text
manual pin only
no EXIF
old image
poor GPS accuracy
```

Warning:

```text
large location mismatch
duplicate image hash
stale evidence
```

---

# 35. CONFIDENCE UI

Example:

```text
Độ tin cậy bằng chứng: Cao

✓ Chụp trực tiếp trong SnapFix
✓ GPS ±11 m
✓ Điểm xác nhận cách GPS 8 m
✓ Ảnh được chụp hôm nay
```

Weak:

```text
Độ tin cậy bằng chứng: Thấp

ℹ Ảnh không có GPS
✓ Vị trí đã được chọn thủ công
```

Do not say:

```text
AI verified
100% authentic
verified photo
```

unless deterministic evidence actually supports the exact claim.

---

# 36. STALE PHOTO

Config:

```ts
STALE_EVIDENCE_DAYS = 7;
```

If older:

```text
Ảnh này được chụp 12 ngày trước.

Tình trạng hiện trường có thể đã thay đổi.

Bạn có biết sự cố vẫn còn tồn tại không?

[Vẫn còn]
[Không chắc]
```

Add warning but allow submission.

---

# 37. DUPLICATE MATCHING

Before creating Incident, search nearby unresolved Incidents.

Base rule:

```text
same issue type
AND distance <= configured radius
AND status not CLOSED/CANCELLED
```

Default:

```ts
DUPLICATE_RADIUS_METERS = 30;
```

---

# 38. DUPLICATE CANDIDATE PAGE

Route:

```text
/report/duplicate
```

Example:

```text
Có thể sự cố này đã được báo

SF-00142
Ổ gà
18 m từ vị trí bạn chọn
6 người đã báo
Cập nhật 2 giờ trước

[Đúng là sự cố này]
[Đây là sự cố khác]
```

If same:

- create new Observation
- link to Incident
- keep new image
- add IncidentEvent
- recalculate confidence/priority

Do not discard citizen evidence.

---

# 39. FINAL REVIEW

Route:

```text
/report/confirm
```

Show one final service-request package.

```text
Ảnh

Loại:
Ổ gà

Tiêu đề:
Ổ gà lớn giữa làn đường...

Vị trí:
...

Độ tin cậy:
Cao

Mô tả:
...

Thông tin bổ sung:
...

Thông tin liên hệ:
...

[Chỉnh sửa]
[Gửi phản ánh]
```

Allow inline edit navigation.

---

# 40. SUBMISSION

On submit:

```text
Create Observation
        |
        v
Duplicate decision?
        |
   +----+----+
   |         |
   v         v
Attach     Create
existing   Incident
Incident
   |         |
   +----+----+
        |
        v
Recalculate Incident
        |
        v
Routing
        |
        v
Timeline event
```

---

# 41. CLIENT SUBMISSION ID

Use:

```ts
clientSubmissionId: string
```

for idempotency.

This prevents duplicate submissions caused by:

- repeated clicks
- network retries
- offline sync retry

---

# 42. INCIDENT STATUS MODEL

Use:

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

Additional flags/states:

```text
UNROUTED
DUPLICATE
CANCELLED
NEEDS_REVIEW
```

Do not misuse statuses if a flag is more appropriate.

---

# 43. STATUS TRANSITIONS

Default:

```text
NEW
 |
 v
VERIFIED
 |
 v
ASSIGNED
 |
 v
IN_PROGRESS
 |
 v
RESOLVED
 |
 v
COMMUNITY_VERIFIED
 |
 v
CLOSED
```

Allow:

```text
RESOLVED -> IN_PROGRESS
```

if citizen reports unresolved.

Manager/Admin may override with audit event.

---

# 44. INCIDENT EVENT / AUDIT LOG

Every important change creates an event.

```ts
type IncidentEventType =
  | "CREATED"
  | "OBSERVATION_ADDED"
  | "VERIFIED"
  | "ROUTED"
  | "ASSIGNED"
  | "STATUS_CHANGED"
  | "NOTE_ADDED"
  | "PRIORITY_CHANGED"
  | "RESOLUTION_UPLOADED"
  | "COMMUNITY_CONFIRMED"
  | "REOPENED"
  | "CLOSED";
```

Event schema:

```ts
type IncidentEvent = {
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
```

---

# 45. OFFICER DASHBOARD

Route:

```text
/officer
```

Required summary cards:

```text
Sự cố mới
Chưa phân công
Đang xử lý
Quá 7 ngày
Đã xử lý tuần này
```

Charts may be simple.

Do not overinvest in decorative charts.

Priority is operational usability.

---

# 46. OFFICER INCIDENT QUEUE

Route:

```text
/officer/incidents
```

Table columns:

```text
Code
Type
Location
Priority
Confidence
Reports
Age
Department
Assignee
Status
Updated
```

Filters:

```text
Status
Priority
Issue type
Department
Assignee
Area
Date
Search
```

Default sort:

```text
priority desc
age desc
```

---

# 47. OFFICER INCIDENT DETAIL

Route:

```text
/officer/incidents/[id]
```

Required sections:

## Header

```text
SF-00142
Ổ gà
IN_PROGRESS
Priority: HIGH
Confidence: HIGH
```

## Location

- map
- canonical location
- address/landmark

## Evidence

List every Observation.

Per Observation show:

```text
Reporter
Image
Source
Capture time
Location source
GPS accuracy
EXIF status
Location consistency
Evidence confidence
Dynamic answers
```

## Workflow

Actions:

```text
Verify
Assign
Start processing
Mark resolved
Reopen
Close
```

## Notes

Support:

```text
Public note
Internal note
```

Internal notes must not appear publicly.

## Timeline

Chronological IncidentEvent list.

---

# 48. ASSIGNMENT

Officer/manager can assign.

```ts
type Assignment = {
  incidentId: string;
  departmentId: string;
  officerId?: string;
  assignedBy: string;
  assignedAt: string;
};
```

Assignment changes generate events.

---

# 49. ROUTING ENGINE

MVP deterministic.

```text
(issueType, area) -> department
```

Rule:

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

Resolution order:

```text
exact issue + area
issue fallback
unrouted
```

If no match:

```text
UNROUTED
```

Manager/admin handles it.

---

# 50. PRIORITY ENGINE

No accident prediction.

Use transparent operational urgency.

Input factors:

```text
base severity
unresolved age
independent observation count
sensitive location
worsening evidence
```

Example config:

```ts
severity:
LOW = 1
MEDIUM = 3
HIGH = 5

age:
>=3 days +1
>=7 days +2
>=14 days +3

reports:
>=3 +1
>=5 +2
>=10 +3
```

Return:

```ts
type PriorityResult = {
  scoreInternal: number;
  level: "LOW" | "MEDIUM" | "HIGH";
  reasons: string[];
};
```

---

# 51. RESOLUTION FLOW

Officer:

```text
IN_PROGRESS
    |
upload resolution photo
    |
add resolution note
    |
RESOLVED
```

Citizen sees:

```text
Sự cố đã được đánh dấu là đã xử lý.

[Đã xử lý]
[Vẫn còn vấn đề]
```

If citizen confirms:

```text
COMMUNITY_VERIFIED
```

Then officer/manager can:

```text
CLOSED
```

If citizen says still unresolved:

```text
REOPEN -> IN_PROGRESS
```

with audit event.

---

# 52. MANAGER DASHBOARD

Route:

```text
/manager
```

Display:

```text
Backlog
Unassigned
In progress
Overdue
Resolved this week
Average time to assignment
Average time to resolution
```

Also:

- officer workload table
- department queue
- reassignment actions
- unrouted cases
- high priority incidents

Use demo metrics calculated from seeded data.

---

# 53. ADMIN AREA

Routes:

```text
/admin/users
/admin/departments
/admin/issue-types
/admin/questions
/admin/routing
/admin/settings
```

---

# 54. ADMIN — ISSUE TYPES

Admin can:

- add type
- rename
- activate/deactivate
- set default severity
- set icon
- set emergency warning

Do not require code changes to add a category.

---

# 55. ADMIN — DYNAMIC QUESTIONS

Admin UI should allow defining:

```text
Issue type
Question label
Input type
Required
Options
Visibility
Order
```

This makes the prototype demonstrate a configurable civic platform.

---

# 56. ADMIN — ROUTING RULES

Show table:

```text
Issue Type
Area
Department
Priority
Active
```

Allow reorder/edit.

---

# 57. OFFLINE-FIRST

Support PWA.

Use:

- Service Worker
- IndexedDB
- local drafts

Offline report record:

```ts
type PendingObservation = {
  localId: string;
  clientSubmissionId: string;

  imageBlob: Blob;

  capturedAt?: string;

  captureLocation?: GeoEvidence;

  issueTypeCode?: string;
  title?: string;
  description?: string;

  answers?: Record<string, unknown>;

  reportedLocation?: GeoPoint;

  contactDraft?: ContactDraft;

  syncStatus:
    | "DRAFT"
    | "PENDING_SYNC"
    | "SYNCING"
    | "SYNCED"
    | "FAILED";

  errorMessage?: string;
};
```

---

# 58. OFFLINE UX

Page:

```text
/offline
```

Example:

```text
2 phản ánh chưa gửi

Ổ gà
14:32
✓ Có vị trí
[Tiếp tục]

Đèn đường
18:41
⚠ Chưa xác nhận vị trí
[Hoàn tất]
```

When online:

```text
[Đồng bộ tất cả]
```

Manual sync must work even if browser Background Sync is unsupported.

---

# 59. FORM AUTOSAVE

Autosave report draft.

Preserve:

- image blob/reference
- category
- title
- description
- dynamic answers
- location evidence
- reported pin
- contact fields
- AI suggestion history if available

The citizen should be able to recover after:

- refresh
- tab closure
- browser interruption
- temporary network loss

---

# 60. IMAGE STORAGE PIPELINE

Conceptual pipeline:

```text
Original image
      |
      v
Extract required metadata
      |
      v
Persist evidence fields
      |
      v
Create public derivative
      |
      v
Strip EXIF
      |
      v
Public image
```

Original image stays private.

Future:

```text
face blur
license plate blur
```

---

# 61. MEDIA MODEL

```ts
type AssetKind =
  | "ORIGINAL"
  | "PUBLIC_REDACTED"
  | "RESOLUTION";
```

Asset:

```ts
type Asset = {
  id: string;
  kind: AssetKind;
  storagePath: string;
  mimeType: string;
  width?: number;
  height?: number;
  createdAt: string;
};
```

---

# 62. DATABASE MODEL

Minimum entities:

```text
users
departments
issue_types
issue_questions
issue_question_options
observations
observation_answers
observation_evidence
incidents
incident_events
assets
routing_rules
assignments
citizen_confirmations
notifications
```

---

# 63. USER TABLE

```ts
User {
  id
  role
  displayName
  email?
  phone?
  departmentId?
  createdAt
}
```

---

# 64. OBSERVATION

```ts
Observation {
  id
  clientSubmissionId
  incidentId?
  reporterId?

  issueTypeCode
  title
  description

  source
  capturedAt?
  submittedAt

  evidenceConfidence
  staleEvidence

  imageAssetId

  createdAt
}
```

---

# 65. OBSERVATION EVIDENCE

Keep evidence immutable where appropriate.

```ts
ObservationEvidence {
  id
  observationId

  imageSource

  imageCapturedAt?

  exifAvailable
  exifGpsAvailable

  exifLat?
  exifLng?

  captureDeviceLat?
  captureDeviceLng?
  captureDeviceAccuracyMeters?

  submissionDeviceLat?
  submissionDeviceLng?
  submissionDeviceAccuracyMeters?

  reportedLat
  reportedLng

  locationSource

  locationDistanceMeters?
  locationConsistencyStatus

  evidenceConfidence
  evidenceReasonsJson
  evidenceWarningsJson

  createdAt
}
```

Do not overwrite EXIF/capture evidence when user moves a map pin.

---

# 66. INCIDENT

```ts
Incident {
  id
  publicCode

  issueTypeCode

  title

  centroidLat?
  centroidLng?

  addressText?
  landmarkText?

  status

  priorityLevel
  priorityScoreInternal
  priorityReasonsJson

  confidenceLevel

  independentReportCount

  assignedDepartmentId?
  assignedOfficerId?

  createdAt
  updatedAt
  resolvedAt?
  closedAt?
}
```

---

# 67. PUBLIC CODE

Generate user-facing code.

Example:

```text
SF-00142
```

Do not expose raw database UUID as primary identifier.

---

# 68. API DESIGN

Recommended routes:

```text
GET    /api/issue-types
GET    /api/issue-types/:code/questions

POST   /api/uploads
POST   /api/observations
GET    /api/observations/:id

GET    /api/incidents
GET    /api/incidents/:id

POST   /api/incidents/:id/confirm-existing
POST   /api/incidents/:id/confirm-resolved

POST   /api/incidents/:id/verify
POST   /api/incidents/:id/assign
POST   /api/incidents/:id/status
POST   /api/incidents/:id/notes
POST   /api/incidents/:id/resolution

GET    /api/map/incidents

GET    /api/officer/dashboard
GET    /api/manager/dashboard

GET    /api/departments
GET    /api/routing-rules

POST   /api/offline/sync
```

Use Zod.

---

# 69. SERVICE LAYER

Do not put domain logic in route handlers or React components.

Create services.

```text
ObservationService
IncidentService
LocationConsistencyService
EvidenceConfidenceService
DuplicateIncidentService
PriorityService
RoutingService
AssignmentService
IncidentWorkflowService
OfflineSyncService
AssetService
AIReportAssistant
```

---

# 70. REPOSITORY LAYER

Use interfaces.

```ts
interface IncidentRepository {}
interface ObservationRepository {}
interface UserRepository {}
interface DepartmentRepository {}
interface RoutingRuleRepository {}
interface AssetRepository {}
```

Implement:

```text
Demo repositories
Supabase repositories
```

This allows the prototype to run before backend setup.

---

# 71. RECOMMENDED STACK

Use current project stack if already established.

Otherwise prefer:

```text
Next.js 15+
TypeScript
Tailwind CSS
shadcn/ui
PostgreSQL / Supabase
Supabase Auth
Supabase Storage
Leaflet
OpenStreetMap
Zod
React Hook Form
exifr
Dexie or idb
date-fns
Serwist / maintained PWA integration
```

Do not rewrite a working stack unnecessarily.

First inspect the existing repository.

---

# 72. EXISTING PROJECT RULE

Before modifying code:

1. inspect repository
2. understand existing stack
3. identify reusable components
4. identify routes
5. identify current state management
6. identify current API/data layer
7. preserve working code where possible

Do not delete working pages simply to rebuild from scratch.

---

# 73. AI EXTENSION ARCHITECTURE

The system must be AI-ready.

But external AI is optional.

Create:

```ts
interface AIReportAssistant {
  analyzeImage(input: AnalyzeImageInput): Promise<ImageAnalysis>;

  suggestIssueType(
    input: SuggestIssueTypeInput
  ): Promise<IssueTypeSuggestion>;

  suggestTitle(
    input: ReportDraftContext
  ): Promise<TextSuggestion>;

  draftDescription(
    input: ReportDraftContext
  ): Promise<TextSuggestion>;

  suggestFollowUpQuestions(
    input: ReportDraftContext
  ): Promise<FollowUpQuestion[]>;

  compareBeforeAfter(
    input: CompareImagesInput
  ): Promise<BeforeAfterResult>;
}
```

---

# 74. AI IMPLEMENTATIONS

Provide:

```text
NoopAIReportAssistant
MockAIReportAssistant
```

Future:

```text
GeminiAIReportAssistant
OpenAIReportAssistant
```

Do not couple UI to a vendor.

---

# 75. AI FEATURE FLAGS

Create feature flags.

```ts
ai.imageAnalysis
ai.issueTypeSuggestion
ai.titleSuggestion
ai.descriptionDrafting
ai.followUpQuestions
ai.beforeAfterComparison
```

If disabled:

- UI still works
- no broken buttons
- no fake inference

---

# 76. AI OUTPUT RULES

Future AI:

- suggestions only
- user can edit
- officer can see AI label
- no silent override
- no claim of truth without evidence
- no exact GPS inference from pixels
- no invented dimensions
- no invented severity facts
- no private contact information in public output

---

# 77. FUTURE AI IMAGE ANALYSIS SCHEMA

```ts
type ImageAnalysis = {
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
};
```

Keep it independent from UI.

---

# 78. NOTIFICATIONS

Prepare data model.

Do not require real SMS/email yet.

Notifications may include:

```text
Incident received
Incident assigned
Status updated
Resolved
Need more information
Community confirmation request
```

Prototype can use in-app notifications.

---

# 79. NOTIFICATION CENTER

Citizen:

```text
/notifications
```

Officer may have notification dropdown.

Seed realistic notification data.

---

# 80. SEARCH

Officer/manager search should support:

```text
incident code
title
location text
issue type
```

Citizen public search can at least support code.

---

# 81. DESIGN SYSTEM

Create a coherent design.

Avoid:

- excessive gradients
- neon AI appearance
- random card styles
- overanimation
- dashboard clutter

Use:

- clear typography
- accessible contrast
- neutral civic interface
- severity/status colors used consistently
- responsive layout
- large mobile touch targets

---

# 82. STATUS COLORS

Use semantic tokens.

Example:

```text
NEW                neutral
VERIFIED           blue
ASSIGNED           blue
IN_PROGRESS        amber
RESOLVED           green
COMMUNITY_VERIFIED green
CLOSED             gray
NEEDS_REVIEW       orange
HIGH PRIORITY      red
```

Do not rely only on color.

Always show text label/icon.

---

# 83. REUSABLE COMPONENTS

Create at minimum:

```text
AppShell
RoleSidebar
PublicNavbar
PageHeader

IncidentStatusBadge
PriorityBadge
EvidenceConfidenceBadge
LocationConsistencyBadge

IncidentCard
ObservationCard
IncidentTimeline
IncidentMap
MiniMap

CameraCapture
ImageUpload
PhotoPreview

ReportStepper
DynamicIssueForm
ContactPrivacyForm

LocationPicker
LocationEvidenceCard

DuplicateCandidateCard

FinalReportPreview

OfflineDraftCard

OfficerIncidentTable
IncidentFilters
AssignmentDialog
StatusTransitionDialog
ResolutionUploader

DashboardMetricCard
ActivityFeed
EmptyState
LoadingState
ErrorState
```

---

# 84. DOMAIN COMPONENT RULE

UI components do not calculate:

- Haversine
- confidence
- priority
- routing
- status validity

They only display results returned by domain services.

---

# 85. RESPONSIVENESS

Citizen side:

```text
mobile-first
```

Officer/manager/admin:

```text
desktop-first
responsive fallback
```

Do not make officer table unusable on tablet.

Use responsive cards or horizontal scroll.

---

# 86. ACCESSIBILITY

Implement:

- semantic HTML
- form labels
- visible focus
- keyboard navigation
- status text not color-only
- accessible modals
- image alt text
- textual map fallback
- touch-friendly buttons
- responsive text scaling

---

# 87. AUTHENTICATION

If Supabase Auth exists, use it.

Otherwise provide Demo Mode.

Roles should be enforced server-side when real backend active.

Never trust client localStorage role alone.

---

# 88. DEMO MODE

The prototype must launch without external credentials.

`.env`:

```env
NEXT_PUBLIC_DEMO_MODE=true
```

Provide role selector/login.

Seed accounts:

```text
citizen@snapfix.demo
officer@snapfix.demo
manager@snapfix.demo
admin@snapfix.demo
```

Demo mode clearly labeled.

---

# 89. DEMO DATASET

Seed at least:

```text
4 roles
4 departments
10 issue types
25 incidents
50+ observations
30+ timeline events
multiple assignments
multiple notifications
multiple resolved incidents
multiple duplicates
location mismatch examples
manual pin examples
EXIF examples
offline drafts
```

Use synthetic data only.

---

# 90. DEMO INCIDENT VARIETY

Include examples:

```text
High priority pothole
Street light awaiting assignment
Garbage issue with 8 reports
Flooding issue resolved
Tree issue with emergency warning
Incident with GPS mismatch
Incident with no EXIF
Incident with multiple community confirmations
Closed incident with before/after photos
Unrouted incident
```

---

# 91. DEMO PERSONAS

Citizen example:

```text
Nguyễn Minh
```

Officer:

```text
Cán bộ Nguyễn A
```

Manager:

```text
Quản lý Trần B
```

Use obviously fictional profiles.

---

# 92. PUBLIC DATA PRIVACY

Public output must not expose:

```text
phone
email
exact private notes
raw EXIF metadata
private original file URL
internal officer notes
```

---

# 93. SECURITY

At minimum:

- validate payloads
- validate MIME
- cap file size
- cap number of images
- signed URLs for private files
- sanitize text
- enforce RBAC
- server-side permission checks
- prevent duplicate submissions
- no secrets in client
- no secrets committed

---

# 94. FILE LIMITS

Configurable:

```text
max images per Observation: 3
max image size: 5MB
```

Client-side compression optional.

If implemented, preserve enough resolution for evidence.

---

# 95. ERROR HANDLING

Every major workflow must have graceful errors.

Examples:

```text
camera unavailable
location denied
location timeout
EXIF parse failure
upload failure
offline
API timeout
duplicate submission
unauthorized
incident no longer available
```

Do not show raw stack traces.

---

# 96. EMPTY STATES

Examples:

Citizen:

```text
Bạn chưa có phản ánh nào.
[Phản ánh sự cố đầu tiên]
```

Officer:

```text
Không có sự cố phù hợp bộ lọc.
```

Offline:

```text
Không có phản ánh đang chờ gửi.
```

---

# 97. LOADING STATES

Use skeletons/spinners for:

- map load
- incident list
- incident detail
- photo upload
- submit
- sync
- AI suggestion future hooks

Do not freeze UI.

---

# 98. ROUTE STRUCTURE

Suggested:

```text
app/
├── page.tsx
├── map/
├── incidents/[id]/
├── report/
│   ├── new/
│   ├── capture/
│   ├── review/
│   ├── location/
│   ├── duplicate/
│   └── confirm/
├── dashboard/
├── reports/
├── notifications/
├── offline/
├── officer/
│   ├── page.tsx
│   ├── incidents/
│   ├── map/
│   ├── assignments/
│   └── metrics/
├── manager/
│   ├── page.tsx
│   ├── workload/
│   ├── routing/
│   └── metrics/
└── admin/
    ├── users/
    ├── departments/
    ├── issue-types/
    ├── questions/
    ├── routing/
    └── settings/
```

Adapt to current project rather than forcing this exact tree if current structure is good.

---

# 99. FOLDER ARCHITECTURE

Suggested:

```text
src/
├── app/
├── components/
│   ├── common/
│   ├── public/
│   ├── citizen/
│   ├── report/
│   ├── incident/
│   ├── officer/
│   ├── manager/
│   ├── admin/
│   └── map/
├── domain/
│   ├── observation/
│   ├── incident/
│   ├── evidence/
│   ├── location/
│   ├── priority/
│   ├── routing/
│   └── workflow/
├── services/
├── repositories/
├── lib/
│   ├── auth/
│   ├── storage/
│   ├── offline/
│   ├── exif/
│   ├── maps/
│   └── ai/
├── hooks/
├── types/
└── config/
```

---

# 100. CONFIGURATION

Centralize thresholds.

```ts
export const SNAPFIX_CONFIG = {
  duplicateRadiusMeters: 30,

  strongLocationMatchMeters: 50,
  acceptableLocationMatchMeters: 200,
  accuracyMultiplier: 1.5,

  staleEvidenceDays: 7,

  maxImagesPerObservation: 3,
  maxImageSizeMB: 5,
};
```

Do not scatter magic numbers.

---

# 101. UNIT TESTS

Test:

```text
Haversine
location consistency
confidence calculation
priority calculation
duplicate matching
routing
status transitions
idempotency
```

---

# 102. E2E TESTS

At minimum:

## Flow 1

```text
Citizen live capture
-> manual form
-> GPS match
-> submit
-> new Incident
```

## Flow 2

```text
Upload with EXIF
-> pin matches EXIF
-> submit
```

## Flow 3

```text
Upload without EXIF
-> manual pin
-> lower confidence
-> submit
```

## Flow 4

```text
Duplicate candidate
-> attach observation to existing Incident
```

## Flow 5

```text
Officer login
-> assign Incident
-> IN_PROGRESS
-> upload resolution
-> RESOLVED
```

## Flow 6

```text
Citizen confirms resolution
-> COMMUNITY_VERIFIED
```

## Flow 7

```text
Offline capture
-> IndexedDB
-> restart
-> draft persists
-> sync
```

---

# 103. ANALYTICS / METRICS

Prototype metrics:

Citizen:

```text
submitted reports
active incidents
resolved incidents
```

Officer:

```text
new
unassigned
in progress
overdue
resolved
```

Manager:

```text
time to assignment
time to resolution
backlog
workload by officer
issue type distribution
```

All metrics computed from data.

No hardcoded KPI values except demo seed data.

---

# 104. SYSTEM LOGIC BETWEEN MODULES

Implement explicit flow.

```text
Observation submitted
        |
        v
Validate input
        |
        v
Store media/evidence
        |
        v
Calculate location consistency
        |
        v
Calculate evidence confidence
        |
        v
Search duplicate candidates
        |
        v
Create/attach Incident
        |
        v
Recalculate Incident confidence
        |
        v
Recalculate priority
        |
        v
Apply routing
        |
        v
Generate IncidentEvent
        |
        v
Notify relevant users
```

This should be orchestrated in an application/domain service.

Do not distribute this logic randomly across UI/API.

---

# 105. INCIDENT RECALCULATION

Whenever Observation added:

```text
independentReportCount
confidence
priority
latest evidence timestamp
centroid / canonical location if policy permits
```

recalculate.

Do not silently move canonical location just because one low-confidence observation has a different coordinate.

---

# 106. INCIDENT LOCATION POLICY

Preferred:

- canonical location created from first accepted report
- manager/officer may correct
- observations preserve individual evidence
- additional observations can flag discrepancy
- canonical location change creates event

---

# 107. CONFIRM STILL EXISTS

Citizen can confirm an Incident.

Button:

```text
Vấn đề này vẫn còn
```

Creates:

```text
CitizenConfirmation
```

Avoid spam:

- one active confirmation per user per period
- or require new evidence when repeated

Prototype can use simple debounce/rule.

---

# 108. CITIZEN FOLLOW-UP PHOTO

Allow:

```text
Tôi có ảnh mới
```

This creates new Observation linked to existing Incident.

Useful for:

- issue worsening
- issue unchanged
- resolution verification

Future AI can compare images.

---

# 109. ACTIVITY FEED

Citizen incident timeline:

```text
08/10 - Phản ánh được tạo
09/10 - Có thêm 2 người xác nhận
10/10 - Đã chuyển đến đơn vị xử lý
11/10 - Cán bộ nhận xử lý
15/10 - Đánh dấu đã xử lý
16/10 - Cộng đồng xác nhận
```

Officer timeline includes more detail.

---

# 110. COPY STYLE

Use concise Vietnamese.

Avoid bureaucratic language where unnecessary.

Examples:

Good:

```text
Chọn vị trí sự cố
```

Bad:

```text
Vui lòng tiến hành xác định tọa độ địa lý của đối tượng phản ánh
```

Good:

```text
Ảnh không có GPS. Bạn vẫn có thể chọn vị trí trên bản đồ.
```

---

# 111. SYSTEM STATES MUST BE EXPLAINABLE

For any:

```text
confidence
priority
routing
location mismatch
duplicate suggestion
```

display reasons.

No opaque score.

---

# 112. AI PLACEHOLDERS IN UI

If AI disabled, either hide feature or display:

```text
AI chưa được bật trong bản prototype
```

Do not show generated-looking fake results as actual AI.

Mock mode can be enabled only by developer/demo flag.

---

# 113. FEATURE FLAGS

Suggested:

```ts
features = {
  aiEnabled: false,
  offlineCapture: true,
  publicMap: true,
  communityConfirmation: true,
  managerAnalytics: true,
  adminConfiguration: true,
};
```

---

# 114. IMPLEMENTATION PLAN

Do not attempt everything in one unstructured edit.

## Stage 1 — inspect current application

Document:

- stack
- current routes
- current UI components
- existing data model
- working features
- broken features

---

## Stage 2 — domain foundation

Implement:

```text
types
domain services
repositories
config
seed data
```

---

## Stage 3 — application shell

Implement:

```text
public navbar
citizen shell
officer sidebar
manager/admin role navigation
```

---

## Stage 4 — homepage + public map

Implement:

```text
/
 /map
 /incidents/[id]
```

---

## Stage 5 — citizen reporting workflow

Implement:

```text
capture
upload
review
dynamic form
location
duplicate
confirm
submit
```

---

## Stage 6 — citizen dashboard

Implement:

```text
/dashboard
/reports
/offline
/notifications
```

---

## Stage 7 — officer workflow

Implement:

```text
dashboard
queue
detail
assignment
status
resolution
```

---

## Stage 8 — manager/admin

Implement:

```text
manager metrics
routing
admin issue types
questions
departments
```

---

## Stage 9 — offline

Implement:

```text
PWA
IndexedDB
draft recovery
sync
```

---

## Stage 10 — AI adapters

Implement interfaces, no required external integration.

---

## Stage 11 — polish

- error states
- loading states
- accessibility
- responsive behavior
- realistic demo seed
- tests

---

# 115. DO NOT REBUILD NEEDLESSLY

If current web already has:

```text
landing page
report form
map
dashboard
components
```

reuse/refactor them.

Do not delete good work.

---

# 116. DO NOT IMPLEMENT AS STATIC MOCKUP

The final prototype must have working state.

For example:

```text
Citizen submits Observation
```

must actually cause:

```text
Incident appears in officer queue
```

When officer updates:

```text
IN_PROGRESS
```

citizen view must reflect it.

Demo repositories may be in-memory/local persistence, but the logical connection must exist.

---

# 117. DEMO DATA PERSISTENCE

If no backend:

prefer:

```text
localStorage / IndexedDB
```

or a coherent demo data store so updates persist across navigation.

Do not make every route use separate hardcoded JSON.

---

# 118. SERVER / CLIENT STATE

If backend active:

prefer query/mutation pattern.

If demo mode:

create centralized store/repository.

Avoid duplicated state.

---

# 119. README

Update README with:

```text
Project overview
Architecture
Observation vs Incident
Role model
How demo mode works
How to run
Environment setup
AI adapter architecture
Offline behavior
Location evidence model
Routes
Testing
Future integrations
```

---

# 120. ENV EXAMPLE

Create:

```env
NEXT_PUBLIC_APP_NAME=SnapFix CT

NEXT_PUBLIC_DEMO_MODE=true

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_DEFAULT_MAP_LAT=
NEXT_PUBLIC_DEFAULT_MAP_LNG=
NEXT_PUBLIC_DEFAULT_MAP_ZOOM=13

AI_PROVIDER=none
AI_API_KEY=
```

Do not require AI key.

---

# 121. ACCEPTANCE CRITERIA — WHOLE SYSTEM

The system is acceptable only if:

- [ ] Public homepage exists.
- [ ] Public map exists.
- [ ] Public incident detail exists.
- [ ] Citizen can create a report.
- [ ] Citizen can capture a photo.
- [ ] Citizen can upload a photo.
- [ ] Citizen sees a form after the image.
- [ ] Dynamic questions depend on issue type.
- [ ] Citizen can confirm location.
- [ ] GPS permission denial does not block reporting.
- [ ] EXIF is parsed when available.
- [ ] Location consistency is calculated.
- [ ] Evidence confidence is calculated.
- [ ] Duplicate matching works.
- [ ] Observation can attach to existing Incident.
- [ ] New Incident can be created.
- [ ] Routing occurs.
- [ ] Priority is calculated.
- [ ] Officer sees Incident in queue.
- [ ] Officer can assign.
- [ ] Officer can change status.
- [ ] Officer can upload resolution evidence.
- [ ] Citizen sees changed status.
- [ ] Citizen can confirm resolution.
- [ ] Incident timeline updates.
- [ ] Citizen dashboard exists.
- [ ] Officer dashboard exists.
- [ ] Manager dashboard exists.
- [ ] Admin configuration exists.
- [ ] Offline draft works.
- [ ] Demo data persists.
- [ ] Role navigation works.
- [ ] Server-side/central permissions are represented correctly.
- [ ] AI integration points exist.
- [ ] App works with AI disabled.
- [ ] App builds successfully.

---

# 122. PROTOTYPE DEMO SCRIPT

The prototype should support this exact demonstration.

## Scene 1 — citizen

Open homepage.

Click:

```text
Phản ánh sự cố
```

Take/upload pothole image.

Select:

```text
Ổ gà
```

Fill dynamic questions.

Confirm location.

System displays:

```text
Vị trí phù hợp
Độ tin cậy: Cao
```

Submit.

Result:

```text
SF-00142
Đã tiếp nhận
```

---

## Scene 2 — officer

Open officer dashboard.

New Incident appears.

Open:

```text
SF-00142
```

See:

```text
image
location
evidence
answers
confidence
priority
```

Assign officer.

Status:

```text
IN_PROGRESS
```

---

## Scene 3 — citizen

Citizen dashboard updates.

```text
Đang xử lý
```

---

## Scene 4 — officer resolution

Officer uploads after-photo.

Marks:

```text
RESOLVED
```

---

## Scene 5 — citizen confirmation

Citizen sees:

```text
Sự cố đã được đánh dấu là đã xử lý.

[Đã xử lý]
[Vẫn còn vấn đề]
```

Citizen confirms.

Incident becomes:

```text
COMMUNITY_VERIFIED
```

This is the main demo story.

---

# 123. CODE QUALITY

Requirements:

- TypeScript strict enough to catch domain mistakes
- no giant single-file components
- no `any` unless justified
- domain logic separated
- reusable components
- documented service boundaries
- consistent naming
- minimal technical debt
- no secret keys
- no dead placeholder routes

---

# 124. FINAL QUALITY CHECK

Before declaring completion:

```bash
npm install
npm run lint
npm run test
npm run build
```

If Playwright exists:

```bash
npm run test:e2e
```

Fix blocking errors.

---

# 125. FINAL DELIVERABLES

The coding agent must leave the repository with:

1. coherent application architecture
2. public homepage
3. public incident map
4. public incident detail
5. citizen report flow
6. citizen dashboard
7. offline draft flow
8. officer dashboard
9. incident operations
10. manager dashboard
11. admin configuration
12. domain logic
13. demo data
14. demo login / roles
15. repository abstraction
16. optional Supabase implementation
17. AI adapter architecture
18. README
19. `.env.example`
20. tests
21. successful production build

---

# 126. FINAL PRODUCT PRINCIPLE

Do not optimize for the number of screens.

Optimize for a believable system.

Every major screen should connect to shared domain data.

Every user action should have a clear effect.

The prototype should demonstrate:

```text
Citizen evidence
      |
      v
Structured Observation
      |
      v
Incident management
      |
      v
Officer action
      |
      v
Transparent status
      |
      v
Community confirmation
```

SnapFix CT should feel like one integrated civic incident management platform, not a collection of UI mockups.

---

# 127. FINAL INSTRUCTION TO ANTIGRAVITY

Start by inspecting the current repository.

Then write a short implementation plan based on the actual codebase.

After that, implement the system incrementally.

Do not stop after producing plans or mockups.

Modify the project until the main demo flow works end-to-end.

Preserve current working code when useful.

Use deterministic domain logic for core workflow.

Keep AI behind adapters.

The final prototype must remain fully functional when:

```text
AI_PROVIDER=none
```

The most important architectural boundary is:

```text
Observation != Incident
```

The most important product flow is:

```text
Citizen submits evidence
        ->
SnapFix creates or updates Incident
        ->
Officer processes Incident
        ->
Citizen sees and verifies the result
```

That is the system to build.
