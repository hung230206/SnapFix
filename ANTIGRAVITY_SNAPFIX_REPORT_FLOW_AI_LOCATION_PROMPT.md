# SnapFix CT — Antigravity Coding Prompt
## Reporting Flow, Dynamic Forms, AI Assistance, Location Evidence & Verification

> **Target coding agent:** Antigravity / Gemini Pro 3.1  
> **Project:** SnapFix CT  
> **Goal of this iteration:** upgrade the citizen reporting flow from “take/upload photo → submit” into a professional, evidence-aware service-request workflow inspired by established civic reporting systems, while keeping the existing two-sided Citizen ↔ Officer architecture.

---

# 1. First understand the product

SnapFix CT is **not only a reporting form**.

It is a two-sided urban incident management system:

```text
Citizen Observation
        ↓
Evidence collection / validation
        ↓
Possible duplicate detection
        ↓
Incident
        ↓
Routing / priority / assignment
        ↓
Officer processing
        ↓
Resolution evidence
        ↓
Citizen/community verification
```

Core domain distinction:

- **Observation** = one citizen's report/evidence.
- **Incident** = the real-world issue being managed.
- Multiple Observations may belong to one Incident.

Do not merge these concepts.

---

# 2. Research basis — patterns from existing civic reporting systems

Before implementing, preserve the useful product patterns below.

## 2.1 Vietnam National Public Service Portal — PAKN

The National Public Service Portal's feedback/recommendation form includes structured fields such as:

- submitter type
- ministry/locality
- subordinate unit
- citizen/contact information
- address
- phone
- email
- report title
- report content
- receiving unit
- file attachment

Useful lesson for SnapFix:

> A photo alone is not a complete administrative report. The system should turn the photo into a structured report that still allows the citizen to review and edit the important fields.

Reference:

- https://vpcp.dichvucong.gov.vn/p/phananhkiennghi/pakn-gui-pakn.html

---

## 2.2 SeeClickFix

SeeClickFix uses a location-aware reporting workflow.

Important patterns:

1. First determine location.
2. Request types can depend on location/organization.
3. Each issue type can define its own questions.
4. A pothole can ask a pothole-specific question such as depth.
5. Reports support:
   - latitude
   - longitude
   - address
   - category/request type
   - title
   - description
   - image
6. Issue records have state and can be acknowledged/closed.
7. One service request type can define required/private fields dynamically.

Useful lesson for SnapFix:

> Do not use one giant static form for every problem. Build a **dynamic issue form** driven by `IssueType` / `IssueQuestion` definitions.

References:

- https://dev.seeclickfix.com/v2/issues/reporting/
- https://dev.seeclickfix.com/v2/issues/

---

## 2.3 FixMyStreet

FixMyStreet's workflow emphasizes:

- locate the problem on a map
- see nearby existing reports
- pin the location
- choose/report the problem
- upload supporting photographs
- automatically direct it toward the relevant authority
- allow other people to comment/update a report
- allow users to follow progress

Useful lesson for SnapFix:

> Location selection, existing-incident discovery and routing should happen as part of the reporting experience, not as separate admin work.

Reference:

- https://code.fixmystreet.com/The-FixMyStreet-Platform-DIY-Guide-v1.1.pdf

---

## 2.4 Open311 GeoReport

Open311 is a useful interoperability model for non-emergency civic service requests.

Relevant concepts:

- `service_code`
- service-specific metadata/questions
- `lat` / `long`
- `address_string`
- `description`
- media
- responsible agency
- status
- requested/updated timestamps

Open311 allows either coordinate-based location or a human-readable address/location description.

Useful lesson for SnapFix:

> Separate the core service request schema from additional fields that depend on issue type.

Reference:

- https://wiki.open311.org/GeoReport_v2/

---

# 3. Product decision for SnapFix

The new citizen reporting flow must become:

```text
1. Capture / Upload
2. Evidence extraction
3. AI analysis
4. Citizen completes/reviews information
5. Location consistency check
6. Possible duplicate check
7. Final preview
8. Submit Observation
9. Create or attach to Incident
```

A report must **not** be submitted immediately after taking a photo.

The citizen must see a review form.

---

# 4. Required citizen flow

Implement this exact conceptual flow.

## Step A — Choose image source

Page:

```text
/report/new
```

Options:

```text
[📷 Chụp ảnh ngay]
[🖼️ Chọn ảnh có sẵn]
```

Secondary message:

```text
SnapFix sẽ dùng ảnh, vị trí và thông tin bạn cung cấp
để tạo một phản ánh đầy đủ hơn.
```

If browser is offline and PWA is available:

```text
Bạn đang offline.
Phản ánh có thể được lưu trên thiết bị và gửi sau.
```

---

# 5. Live capture flow

Route:

```text
/report/capture
```

When the camera screen opens:

- request camera permission
- begin geolocation sampling immediately
- do not wait until shutter press to request location

Use:

```ts
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: { ideal: "environment" }
  }
});
```

and:

```ts
navigator.geolocation.watchPosition(...)
```

Store a temporary:

```ts
type CaptureSession = {
  id: string;
  source: "LIVE_CAMERA";
  startedAt: number;
  imageCapturedAt?: number;

  locationSamples: {
    lat: number;
    lng: number;
    accuracyMeters: number;
    timestamp: number;
  }[];

  networkState: "ONLINE" | "OFFLINE";
};
```

UI status:

```text
📍 Đang lấy vị trí...
```

Then:

```text
📍 Vị trí ± 12 m
```

or:

```text
⚠ Vị trí hiện chưa chính xác ± 260 m
```

Do not display raw latitude/longitude as the main UX.

When shutter is pressed:

1. capture Blob
2. store capture timestamp
3. choose the best location sample near capture time
4. continue to `/report/review`

---

# 6. Upload flow

When user uploads a photo:

- parse EXIF using `exifr`
- extract when available:
  - GPS latitude
  - GPS longitude
  - `DateTimeOriginal`
  - orientation
  - camera make/model if useful internally

Create:

```ts
type PhotoEvidence = {
  source: "LIVE_CAMERA" | "FILE_UPLOAD" | "OFFLINE_CAPTURE";

  imageCapturedAt?: string;

  exif: {
    exists: boolean;
    gpsAvailable: boolean;
    lat?: number;
    lng?: number;
    capturedAt?: string;
  };

  liveDeviceLocation?: {
    lat: number;
    lng: number;
    accuracyMeters: number;
    timestamp: number;
  };
};
```

Important:

**EXIF is evidence, not proof.**

Never write UI copy such as:

```text
Ảnh đã được xác thực hoàn toàn.
```

Use:

```text
Ảnh có dữ liệu vị trí.
```

---

# 7. Main report review form

Route:

```text
/report/review
```

This is now one of the most important product screens.

Layout on mobile:

```text
[IMAGE PREVIEW]

AI analysis card

Issue information

Location

Additional questions

Contact / privacy

Evidence summary

[Continue]
```

---

# 8. Fields required after taking/uploading the photo

## 8.1 Issue category

Field:

```text
Loại sự cố *
```

Initial values:

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

AI can suggest this field later.

The citizen must always be able to override AI.

UI:

```text
AI gợi ý: Ổ gà
[Ổ gà ▼]

✓ Bạn có thể thay đổi nếu kết quả chưa đúng.
```

---

## 8.2 Report title

Field:

```text
Tiêu đề phản ánh *
```

Example:

```text
Ổ gà lớn giữa làn đường Nguyễn Văn Cừ
```

Add button:

```text
✨ AI viết tiêu đề
```

AI must use:

- category
- image analysis
- location text
- citizen answers

AI output is editable.

Never overwrite citizen text without confirmation.

---

## 8.3 Description

Field:

```text
Mô tả tình trạng *
```

Textarea.

Add:

```text
✨ AI soạn mô tả
```

Example output:

```text
Tại vị trí gần ..., mặt đường xuất hiện một ổ gà có nước đọng,
nằm gần phần xe lưu thông. Tình trạng có thể gây nguy hiểm cho
xe máy, đặc biệt khi trời tối hoặc mưa.
```

Under AI generated text:

```text
Nội dung do AI đề xuất. Vui lòng kiểm tra trước khi gửi.
```

User can:

- edit
- regenerate
- undo to previous text

---

# 9. Dynamic issue-specific questions

Do not hardcode all questions into React.

Create schema:

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

  options?: {
    value: string;
    label: string;
  }[];

  visibility: "PUBLIC" | "OFFICER_ONLY";
  order: number;
};
```

Examples.

### POTHOLE

```text
Ổ gà nằm ở đâu?
○ Giữa làn xe
○ Gần lề đường
○ Giao lộ
○ Không rõ
```

```text
Có nước đọng che khuất độ sâu không?
○ Có
○ Không
○ Không rõ
```

```text
Theo quan sát, mức ảnh hưởng?
○ Nhẹ
○ Trung bình
○ Nghiêm trọng
```

### STREET_LIGHT

```text
Có bao nhiêu đèn gần nhau bị tắt?
```

```text
Khu vực có tối hoàn toàn không?
```

### FLOODING

```text
Mực nước ước lượng?
○ Dưới mắt cá chân
○ 10–30 cm
○ Trên 30 cm
○ Không rõ
```

```text
Xe máy còn đi qua được không?
```

### FALLEN_TREE / EXPOSED_WIRE

Show safety warning before continuing:

```text
⚠ Nếu có nguy cơ trực tiếp đến tính mạng, hãy liên hệ
đơn vị khẩn cấp phù hợp. SnapFix không thay thế dịch vụ cứu hộ.
```

---

# 10. AI-assisted questions

Future AI capability:

The AI analyzes the photo and the form state.

If essential information is missing, it can ask **at most 1–2 useful questions**, not a conversational interrogation.

Example:

```text
AI cần thêm một thông tin

Ổ gà này nằm giữa làn xe hay sát lề?

[Giữa làn] [Sát lề] [Không rõ]
```

Purpose:

- improve report completeness
- improve severity assessment
- reduce hallucination

The AI must prefer asking the citizen over inventing unknown facts.

---

# 11. Location section

The report must clearly distinguish several locations.

Define:

```ts
type IncidentLocation = {
  lat: number;
  lng: number;

  source:
    | "LIVE_CAPTURE"
    | "EXIF"
    | "MANUAL_PIN"
    | "ADDRESS_GEOCODED";

  accuracyMeters?: number;

  addressText?: string;
  landmarkText?: string;
};
```

The **Incident Location** is the location the citizen says the problem exists.

This is what officers use.

---

# 12. Location evidence sources

Keep these separate.

## A. Capture location

For a photo taken directly inside SnapFix:

```text
capture_device_location
```

This is the browser/device position around shutter time.

---

## B. EXIF photo location

For an uploaded file:

```text
photo_exif_location
```

This represents metadata embedded in the file.

---

## C. Current device location

At submission time:

```text
current_device_location
```

This is **not automatically the incident location**.

A citizen may:

- photograph an issue outside
- go home
- upload it later

Therefore:

> For uploaded gallery photos, do NOT penalize the report simply because current device location differs from the reported incident location.

---

## D. Citizen-confirmed location

```text
reported_incident_location
```

This is the map pin/address the citizen confirms before submission.

This is the canonical location used for the Incident.

---

# 13. Location consistency verification

This is important.

Do not implement “AI guesses exact GPS coordinates from image pixels”.

That is unsafe and unreliable.

Location verification must mainly be **deterministic geospatial evidence checking**.

Use AI only to explain the result in natural language if desired.

---

# 14. Correct comparison logic

## Case 1 — live SnapFix camera

Compare:

```text
capture_device_location
↕
reported_incident_location
```

Use Haversine distance.

Example:

```text
Capture GPS: ± 14m
Citizen pin: 18m away
```

Result:

```text
✓ Vị trí phù hợp với thời điểm chụp
```

---

## Case 2 — uploaded photo WITH EXIF GPS

Compare:

```text
photo_exif_location
↕
reported_incident_location
```

Do NOT primarily compare against current device location.

Result examples:

```text
✓ Vị trí ảnh cách điểm bạn chọn 22 m
```

or:

```text
⚠ Vị trí trong ảnh cách điểm bạn chọn 1.8 km
```

Ask:

```text
Thông tin vị trí trong ảnh không khớp với vị trí bạn chọn.

[Kiểm tra lại vị trí]
[Vẫn tiếp tục]
```

Continuing is allowed but confidence decreases.

---

## Case 3 — uploaded photo WITHOUT EXIF GPS

There is no independent photo location.

Result:

```text
ℹ Ảnh không có dữ liệu GPS.
Vị trí sẽ dựa trên điểm bạn chọn trên bản đồ.
```

Do not claim the image location was verified.

---

## Case 4 — photo captured offline in SnapFix PWA

If offline geolocation was captured:

Compare:

```text
offline_capture_location
↕
reported_incident_location
```

Same logic as live capture.

If offline GPS was unavailable:

manual pin becomes primary location.

---

# 15. Distance threshold logic

Create configuration:

```ts
const LOCATION_MATCH_STRONG_METERS = 50;
const LOCATION_MATCH_ACCEPTABLE_METERS = 200;
```

But also consider geolocation accuracy.

Do not blindly use a fixed 50m mismatch if browser accuracy is ±300m.

Implement a tolerance function.

Conceptually:

```ts
effectiveTolerance =
  max(
    configuredBaseTolerance,
    sourceAccuracyMeters * ACCURACY_MULTIPLIER
  );
```

Example:

```ts
const ACCURACY_MULTIPLIER = 1.5;
```

Return:

```ts
type LocationConsistencyResult = {
  status:
    | "STRONG_MATCH"
    | "ACCEPTABLE_MATCH"
    | "MISMATCH"
    | "INSUFFICIENT_EVIDENCE";

  distanceMeters?: number;
  toleranceMeters?: number;

  reasons: string[];
};
```

Examples:

```text
STRONG_MATCH
- Chụp trực tiếp trong SnapFix
- GPS ± 11m
- Điểm phản ánh cách vị trí chụp 9m
```

```text
MISMATCH
- EXIF có GPS
- Điểm phản ánh cách GPS ảnh 2.1km
```

```text
INSUFFICIENT_EVIDENCE
- Ảnh tải lên không có GPS
- Vị trí do người dùng chọn thủ công
```

---

# 16. Never block solely on mismatch

A GPS mismatch can happen because:

- GPS drift
- wrong EXIF
- edited metadata
- citizen selected wrong pin
- image was taken from across a large site
- upload workflow context differs

Therefore do not automatically reject.

Set:

```text
locationVerificationStatus = NEEDS_REVIEW
```

and let officers see the reason.

---

# 17. Evidence Confidence engine

Extend the current confidence engine.

```ts
type EvidenceConfidenceResult = {
  level: "LOW" | "MEDIUM" | "HIGH";
  scoreInternal: number;
  reasons: string[];
  warnings: string[];
};
```

The internal score may exist, but users should see categorical confidence, not fake precision.

Example signals:

### positive

```text
+ live capture in SnapFix
+ browser GPS with good accuracy
+ reported location matches capture GPS
+ EXIF timestamp is recent
+ independent citizen confirms same Incident
+ later photo confirms same issue
```

### weak/neutral

```text
manual map pin only
uploaded image without metadata
old image
```

### warning

```text
reported location strongly mismatches EXIF
capture time unusually old
same image hash already used elsewhere
```

---

# 18. Evidence summary UI

Before submission show:

```text
ĐỘ TIN CẬY BẰNG CHỨNG

🟢 Cao

✓ Chụp trực tiếp trong SnapFix
✓ GPS tại thời điểm chụp ± 13m
✓ Điểm bạn chọn cách GPS 8m
✓ Ảnh được chụp hôm nay
```

Or:

```text
🟡 Trung bình

✓ Ảnh có thời gian chụp
ℹ Không có GPS trong ảnh
✓ Bạn đã chọn vị trí trên bản đồ
```

Or:

```text
🔴 Cần kiểm tra

⚠ GPS trong ảnh cách vị trí bạn chọn 2.4 km
```

Use wording like:

```text
Độ tin cậy bằng chứng
```

not:

```text
AI xác nhận ảnh là thật
```

---

# 19. AI architecture

Create an AI abstraction.

```ts
interface AIReportAssistant {
  analyzeImage(input: {
    imageUrl: string;
  }): Promise<ImageAnalysis>;

  suggestIssueType(input: {
    imageUrl: string;
  }): Promise<IssueTypeSuggestion>;

  suggestReportTitle(input: ReportDraftContext):
    Promise<string>;

  draftDescription(input: ReportDraftContext):
    Promise<string>;

  suggestFollowUpQuestions(input: ReportDraftContext):
    Promise<FollowUpQuestion[]>;

  explainEvidence(input: EvidenceContext):
    Promise<string>;
}
```

For now create:

```ts
class MockAIReportAssistant
```

or:

```ts
class NoopAIReportAssistant
```

The app must work without a real AI API.

Use deterministic demo suggestions when necessary but clearly label them as demo/mock in developer mode.

---

# 20. Future AI image analysis response schema

Prepare for:

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

Important rule for future prompts:

> The model may describe visible evidence, but must not invent hidden measurements, exact depth, exact dimensions, or exact geographic location unless supported by explicit evidence.

---

# 21. AI report drafting UX

Provide buttons:

```text
[✨ AI viết tiêu đề]
[✨ AI soạn mô tả]
```

When clicked:

- display loading state
- insert proposed text
- keep previous version
- allow undo

AI should use only:

- visible image analysis
- citizen-selected category
- answers to dynamic questions
- incident location/address
- available metadata

Never include:

- citizen phone/email in public description
- exact private personal information
- speculative facts

---

# 22. Dynamic form engine

Build the form from data, not per-page hardcoding.

Tables:

```text
issue_types
issue_questions
issue_question_options
```

Suggested schema:

```ts
IssueType {
  id
  code
  nameVi
  icon
  active
  emergencyWarning?
}
```

```ts
IssueQuestion {
  id
  issueTypeId
  labelVi
  helpTextVi?
  inputType
  required
  visibility
  sortOrder
}
```

```ts
IssueQuestionOption {
  id
  questionId
  value
  labelVi
  sortOrder
}
```

This follows the general pattern used by SeeClickFix and Open311 where different service types can request different metadata.

---

# 23. Contact information section

After issue information:

```text
Thông tin liên hệ
```

Fields:

```text
Họ tên
Số điện thoại
Email
```

Allow configuration of required/optional.

Add privacy setting:

```text
Hiển thị tên công khai?
[ ] Cho phép hiển thị
```

Default public incident UI should not expose phone/email.

Officer-authorized view may access contact details if needed.

---

# 24. Final review page

Route:

```text
/report/confirm
```

Show one clean “service request package”.

Example:

```text
PHẢN ÁNH SẮP GỬI

[photo]

Ổ gà lớn giữa làn đường
Ổ gà

📍 Đường Nguyễn Văn Cừ...
GPS evidence: phù hợp
Độ tin cậy: Cao

Mô tả
...

Thông tin bổ sung
• Nằm giữa làn xe
• Có nước đọng

[Chỉnh sửa]
[Gửi phản ánh]
```

Do not make citizen navigate back through many pages to edit.

Each section should have an inline `Chỉnh sửa`.

---

# 25. Duplicate check before final submission

Before creating a new Incident:

Find candidates by:

```text
distance
+ issue type
+ unresolved status
```

If a likely match exists:

```text
Có vẻ sự cố này đã được báo

SF-00142
Ổ gà
18m từ vị trí bạn chọn
6 người đã báo
Cập nhật 2 giờ trước

[Đúng là sự cố này]
[Đây là sự cố khác]
```

If same:

- create Observation
- attach to existing Incident
- preserve the new image as independent evidence

Do not discard it.

---

# 26. Officer incident detail must show evidence provenance

Officer needs a dedicated section:

```text
Nguồn bằng chứng
```

Per Observation:

```text
Nguồn ảnh: Chụp trực tiếp
Thời gian ảnh: 14:32 06/10/2026
Nguồn vị trí: Browser GPS
Sai số: ±12m
Khoảng cách tới Incident pin: 9m
Location consistency: Strong match
Evidence confidence: High
```

For gallery upload:

```text
Nguồn ảnh: Upload
EXIF GPS: Có
EXIF time: Có
Current device location: Không dùng để xác minh vị trí ảnh
Distance EXIF ↔ report pin: 24m
```

For weak case:

```text
Nguồn ảnh: Upload
EXIF GPS: Không
Vị trí: Người dân chọn thủ công
Evidence confidence: Low
Officer review suggested
```

---

# 27. Officer should never see a magical “AI VERIFIED” badge

Use explicit evidence statuses:

```text
LOCATION MATCH
LOCATION MISMATCH
LOCATION NOT VERIFIABLE

IMAGE QUALITY OK
IMAGE QUALITY LOW

COMMUNITY CORROBORATED
```

If AI assessed something:

```text
AI SUGGESTION
```

not:

```text
VERIFIED BY AI
```

unless there is a real deterministic verification behind it.

---

# 28. Database additions

Add or adapt these models.

## observation_evidence

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

---

# 29. Keep canonical and evidence location separate

Do not overwrite evidence location fields when user drags the incident pin.

Bad:

```ts
observation.lat = newUserPin
```

if that destroys original GPS evidence.

Instead:

```text
reported_location
capture_location
exif_location
submission_location
```

are separate immutable evidence concepts.

The citizen-confirmed incident location may change before submission.

Raw evidence remains unchanged for auditability.

---

# 30. Photo age / freshness

Implement:

```ts
const STALE_EVIDENCE_DAYS = 7;
```

If metadata/capture timestamp is older:

```text
Ảnh này được chụp 12 ngày trước.

Tình trạng hiện trường có thể đã thay đổi.
Bạn có biết sự cố vẫn còn tồn tại không?

[ Vẫn còn ]
[ Không chắc ]
```

Do not hard reject.

Add evidence warning.

---

# 31. Image quality check placeholder

Prepare UI for future AI:

```text
Chất lượng ảnh
```

Possible result:

```text
✓ Sự cố nhìn thấy rõ
```

or:

```text
⚠ Ảnh hơi tối, AI có thể khó phân tích.
Bạn có muốn chụp lại?
```

For now a mock or basic resolution/file validation is enough.

---

# 32. Offline case

Support two separate cases.

## A. Camera app → later upload

Citizen takes normal phone photo while offline.

Later uploads.

Use:

- EXIF if available
- manual map pin otherwise

Do not compare against current home location as primary location verification.

---

## B. SnapFix PWA offline capture

If PWA is installed/cached:

store locally:

```ts
PendingObservation {
  localId
  imageBlob
  capturedAt

  captureDeviceLocation?
  issueTypeCode?
  draftTitle?
  draftDescription?
  answers?

  reportedLocation?

  syncStatus
}
```

Use IndexedDB.

When online:

```text
Bạn có 3 phản ánh chưa gửi
```

The user should review them before sync if required information is missing.

---

# 33. Form autosave

The reporting form must autosave as a local draft.

Reason:

- camera reload
- mobile browser interruption
- network loss
- accidental back navigation

Draft should preserve:

- image reference/blob
- form values
- pin
- dynamic answers
- AI generated draft text
- evidence metadata

---

# 34. Submission idempotency

Prevent duplicate Observation creation during:

- offline sync
- repeated taps
- network retries

Use:

```text
clientSubmissionId
```

unique per citizen draft.

Backend must treat retries with same ID as idempotent.

---

# 35. Submission API

Example:

```http
POST /api/observations
```

Payload concept:

```ts
{
  clientSubmissionId,

  issueTypeCode,

  title,
  description,

  answers,

  reportedLocation: {
    lat,
    lng,
    addressText?,
    landmarkText?,
    source
  },

  evidence: {
    imageSource,
    imageCapturedAt?,

    exifGps?,
    captureDeviceLocation?,
    submissionDeviceLocation?,

    locationConsistencyResult
  },

  contact: {
    name?,
    phone?,
    email?,
    publicNameConsent
  },

  duplicateCandidateDecision?: {
    incidentId,
    decision: "SAME_INCIDENT" | "DIFFERENT_INCIDENT"
  }
}
```

Validate with Zod.

---

# 36. Suggested page architecture

```text
/report/new
       ↓
/report/capture
       OR
/upload
       ↓
/report/review
  - AI suggestion
  - category
  - title
  - description
  - issue questions
       ↓
/report/location
  - map
  - location evidence
  - consistency
       ↓
/report/duplicate
       ↓
/report/confirm
       ↓
success
```

On mobile, this may be implemented as a stepper inside one route if state restoration is robust.

Do not sacrifice state reliability for visual stepper purity.

---

# 37. Step indicator

Citizen should see:

```text
1 Ảnh
2 Thông tin
3 Vị trí
4 Xác nhận
```

Keep it to roughly four conceptual stages even if internal routes are more granular.

---

# 38. AI prompt behavior requirements

When a real model is integrated later, enforce:

### Image classification system behavior

```text
Only identify an issue type when supported by visible evidence.
If ambiguous, return OTHER or low confidence.
Do not infer exact geographic location from appearance.
Do not invent measurements.
Separate visible observations from assumptions.
```

### Description drafting behavior

```text
Write a concise Vietnamese civic service request.
Use facts supplied by the citizen and visible evidence only.
Mention uncertainty explicitly when needed.
Do not include private contact information.
Do not accuse individuals or organizations.
Do not exaggerate severity.
```

---

# 39. Emergency handling

Certain issue categories need safety routing.

Examples:

```text
EXPOSED_WIRE
FALLEN_TREE_BLOCKING_ROAD
SERIOUS_FLOODING
```

Show:

```text
⚠ Đây có thể là tình huống nguy hiểm.

SnapFix không thay thế dịch vụ khẩn cấp.
Nếu có nguy cơ trực tiếp đến tính mạng, hãy liên hệ
đơn vị khẩn cấp phù hợp trước.
```

Still allow report submission afterwards.

---

# 40. UI component additions

Create reusable components:

```text
ReportStepper
PhotoEvidenceCard
AIAnalysisCard
AISuggestButton
AIEditableDraft
DynamicIssueForm
LocationEvidenceCard
LocationConsistencyBadge
LocationMismatchDialog
EvidenceConfidenceCard
StalePhotoWarning
DuplicateIncidentCandidate
ContactPrivacyForm
ReportFinalPreview
DraftAutosaveIndicator
OfflineDraftBadge
```

Do not put evidence logic directly inside the components.

---

# 41. Domain services

Create:

```text
PhotoEvidenceService
LocationConsistencyService
EvidenceConfidenceService
DynamicQuestionService
ReportDraftService
DuplicateIncidentService
OfflineDraftService
```

Example:

```ts
LocationConsistencyService.compare({
  evidenceLocation,
  evidenceAccuracyMeters,
  reportedLocation
});
```

---

# 42. Acceptance criteria — citizen flow

Must pass all:

- [ ] Citizen takes live photo.
- [ ] Location sampling starts while camera is open.
- [ ] Citizen reaches a structured information form after photo.
- [ ] Citizen chooses/edits issue category.
- [ ] Citizen can edit title.
- [ ] Citizen can edit description.
- [ ] AI assist buttons exist behind an adapter.
- [ ] Dynamic questions change with issue type.
- [ ] GPS denial does not stop report.
- [ ] Manual map pin works.
- [ ] EXIF GPS is parsed on upload if present.
- [ ] EXIF timestamp is parsed if present.
- [ ] EXIF ↔ user pin consistency is calculated.
- [ ] Live capture GPS ↔ user pin consistency is calculated.
- [ ] Current device location is not incorrectly used to reject a later gallery upload.
- [ ] Strong mismatch creates a warning, not hard rejection.
- [ ] Evidence confidence reasons are visible.
- [ ] Old-photo warning works.
- [ ] Possible duplicate appears before new Incident creation.
- [ ] Citizen can attach Observation to existing Incident.
- [ ] Final preview contains all report data.
- [ ] Draft autosave works.
- [ ] Offline draft survives reload.
- [ ] Sync/retry is idempotent.

---

# 43. Acceptance criteria — officer flow

- [ ] Officer sees title + structured description.
- [ ] Officer sees issue-specific answers.
- [ ] Officer sees canonical incident location.
- [ ] Officer sees map.
- [ ] Officer sees original location evidence separately.
- [ ] Officer sees location consistency status.
- [ ] Officer sees confidence reasons/warnings.
- [ ] Officer can identify manual-only location cases.
- [ ] Officer sees all Observations attached to Incident.
- [ ] Officer sees provenance for every image.
- [ ] Officer can process Incident without trusting opaque AI output.

---

# 44. Test scenarios

Implement fixture/E2E tests for these exact scenarios.

## Scenario 1 — ideal live report

```text
Citizen captures pothole in SnapFix
GPS ±10m
pins incident 8m away
fills questions
AI drafts description
submit

Expected:
HIGH evidence confidence
STRONG_MATCH
```

---

## Scenario 2 — location permission denied

```text
Citizen captures image
browser location denied
citizen manually pins location
```

Expected:

```text
submission allowed
location source = MANUAL_PIN
not labelled GPS verified
```

---

## Scenario 3 — gallery upload at home

```text
Photo EXIF says location A
Citizen currently located 5km away at home
Citizen pins A
```

Expected:

```text
compare EXIF ↔ pin
not current device ↔ pin
location match succeeds
```

---

## Scenario 4 — EXIF mismatch

```text
EXIF location A
Citizen pins B 2km away
```

Expected:

```text
warning
MISMATCH
citizen can correct pin or continue
officer can see warning
```

---

## Scenario 5 — image from chat app

```text
image has no EXIF
citizen manually pins location
```

Expected:

```text
INSUFFICIENT_EVIDENCE for independent location verification
report still allowed
```

---

## Scenario 6 — stale photo

```text
EXIF timestamp is 15 days old
```

Expected:

```text
stale warning
ask if issue still exists
confidence warning
```

---

## Scenario 7 — duplicate

```text
existing unresolved POTHOLE Incident
new POTHOLE report within 15m
```

Expected:

```text
show candidate
citizen confirms same incident
new Observation attaches to existing Incident
```

---

## Scenario 8 — offline SnapFix capture

```text
PWA cached
network offline
photo captured
GPS captured
draft saved to IndexedDB
browser closed
opened again
```

Expected:

```text
draft remains
user can complete and sync later
```

---

# 45. Research-informed UX rules

Use these product rules consistently:

1. Like Open311/SeeClickFix, support **service-type-specific fields**.
2. Like FixMyStreet, location selection and nearby reports should be part of reporting.
3. Like formal public-service forms, provide a structured title, description and contact layer.
4. Unlike traditional forms, SnapFix should use image/metadata and AI to prefill as much as possible.
5. The citizen must retain final control.
6. Do not reduce a complex service request to a photo-only submit button.

---

# 46. Do not do these things

Do not:

- submit immediately after photo capture
- claim AI can prove where a photo was taken from pixels alone
- equate EXIF with authenticity
- overwrite original GPS evidence when citizen moves a map pin
- reject gallery upload because current device is elsewhere
- force GPS permission
- make every issue use identical questions
- let AI silently change citizen content
- hide the reason for confidence/mismatch
- mix public contact information into public descriptions
- create duplicate Incident records when citizen confirms an existing issue
- make officer trust a single opaque confidence number

---

# 47. Implementation sequence for this iteration

## Phase 1
Refactor report domain models.

## Phase 2
Build `/report/review` structured form.

## Phase 3
Implement dynamic issue questions.

## Phase 4
Implement EXIF evidence extraction.

## Phase 5
Implement capture geolocation evidence.

## Phase 6
Implement canonical incident map pin.

## Phase 7
Implement `LocationConsistencyService`.

## Phase 8
Extend evidence confidence engine.

## Phase 9
Add AI adapter + mock UI actions.

## Phase 10
Add duplicate step.

## Phase 11
Add final review.

## Phase 12
Add autosave/offline state.

## Phase 13
Expose evidence provenance in officer detail.

## Phase 14
Add unit and E2E tests.

---

# 48. Final product experience

The desired citizen experience should feel like:

```text
I see a problem
       ↓
I take one photo
       ↓
SnapFix extracts what it can
       ↓
AI prepares the boring parts
       ↓
I answer only what is missing
       ↓
I confirm the place
       ↓
SnapFix tells me how strong the evidence is
       ↓
I review one clean report
       ↓
Submit
```

The desired officer experience:

```text
I do not receive a vague photo.

I receive:
- issue type
- title
- structured description
- issue-specific answers
- confirmed map location
- evidence provenance
- location consistency
- confidence reasons
- related observations
- incident priority
```

This is the product distinction.

---

# 49. Final instruction to the coding agent

Do not merely produce mock screens.

Implement the underlying domain logic and state model.

Before finishing:

```bash
npm run lint
npm run test
npm run build
```

Fix blocking errors.

Document in README:

- location evidence model
- EXIF limitations
- difference between current device location and image location
- location consistency algorithm
- dynamic form architecture
- AI adapter
- offline behavior

The resulting SnapFix CT web app should demonstrate this core promise:

> **Take one photo, let SnapFix assemble the evidence and report, let the citizen verify it, and give officers a structured Incident they can actually act on.**
