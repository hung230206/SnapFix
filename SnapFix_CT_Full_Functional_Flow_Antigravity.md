# SnapFix CT — Full Functional Flow & Logic Specification for Antigravity

> Mục tiêu của tài liệu này là để Antigravity **code hoàn chỉnh logic luồng hoạt động** của SnapFix CT, không chỉ dựng giao diện.
>
> Source chính: báo cáo thiết kế SnapFix CT được cung cấp trong project. Báo cáo xác định luồng người dân chụp/chọn ảnh → lấy vị trí/thời gian → AI phân tích → tạo bản nháp phản ánh → xác nhận → mở kênh báo cáo chính thức → lưu Lịch sử; đồng thời xác định các rủi ro về GPS, EXIF, AI, thời gian và quyền riêng tư.

---

# 1. Phạm vi hệ thống

SnapFix CT gồm 2 phía:

## 1.1. Citizen App — Người dân

Mục tiêu:
- Chụp ảnh hoặc chọn ảnh sự cố hạ tầng.
- Lấy vị trí theo thứ tự ưu tiên.
- Lấy thời gian chụp.
- Gửi ảnh + metadata cho AI.
- AI trả:
  - loại sự cố,
  - mức cảnh báo,
  - lý do,
  - độ tin cậy,
  - bản nháp phản ánh.
- Người dùng kiểm tra/chỉnh sửa.
- Mở kênh tiếp nhận chính thức.
- Lưu lại phản ánh vào Lịch sử.

## 1.2. Officer Dashboard — Cán bộ tiếp nhận

Mục tiêu:
- Xem các phản ánh đã được người dùng chuẩn bị/gửi.
- Theo dõi số lượng và trạng thái.
- Xem chi tiết ảnh, vị trí, thời gian, nội dung phản ánh.
- Phân công/xử lý/cập nhật trạng thái nội bộ.
- Theo dõi bản đồ, danh sách và thống kê.

---

# 2. Nguyên tắc chức năng bắt buộc

## 2.1. SnapFix CT không phải kênh tiếp nhận chính thức

SnapFix CT chỉ:

```text
Phân tích
+
Chuẩn bị nội dung
+
Điều hướng sang kênh chính thức
```

Không được hiển thị wording khiến người dùng hiểu rằng:

```text
"Báo cáo của bạn đã được gửi đến cơ quan chức năng"
```

khi thực tế chỉ mới mở trang chính thức.

Wording đúng:

```text
SnapFix CT đã chuẩn bị nội dung phản ánh.
Việc gửi phản ánh được thực hiện tại trang chính thức
của cơ quan chức năng.
```

Điều này phải xuất hiện rõ trên Màn 2.

---

# 3. Tổng flow toàn hệ thống

```text
                    ┌──────────────────────┐
                    │ Người dùng mở app    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Màn 1a - Home       │
                    │ chưa có ảnh          │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴───────────┐
                    │                      │
                    ▼                      ▼
               [Chụp ảnh]              [Thư viện]
                    │                      │
                    ▼                      ▼
             GPS thiết bị?          Đọc EXIF ảnh
                    │                      │
             ┌──────┴──────┐        ┌──────┴──────┐
             │             │        │             │
            Có           Không     Có            Không
             │             │        │             │
             ▼             ▼        ▼             ▼
          dùng GPS       chụp    dùng EXIF     hỏi mô tả
                           │                     vị trí
                           └────────┬────────────┘
                                    │
                                    ▼
                         Có ảnh + metadata cơ bản
                                    │
                                    ▼
                         Màn 1b - Chat loading
                                    │
                                    ▼
                       Gọi AI phân tích + draft
                                    │
                                    ▼
                        Màn 1c - AI result
                                    │
                       ┌────────────┴────────────┐
                       │                         │
                       ▼                         ▼
                  [Chụp lại]        [Tiếp tục soạn phản ánh]
                       │                         │
                       └──────────────┐          ▼
                                      │   Màn 2 - Confirmation
                                      │          │
                                      │          ▼
                                      │   Sửa nội dung nếu cần
                                      │          │
                                      │          ▼
                                      │   [Mở trang báo cáo]
                                      │          │
                                      │          ▼
                                      │   Mở kênh chính thức
                                      │          │
                                      │          ▼
                                      │   Lưu lịch sử / submitted
                                      │
                                      ▼
                                 quay lại chụp
```

---

# 4. State machine của Citizen App

Dùng state machine rõ ràng thay vì điều hướng rời rạc.

```js
const APP_STATES = {
  HOME: "home",
  REQUESTING_LOCATION: "requesting_location",
  OPENING_CAMERA: "opening_camera",
  IMAGE_SELECTED: "image_selected",
  READING_METADATA: "reading_metadata",
  ANALYZING: "analyzing",
  RESULT: "result",
  REPORT_CONFIRMATION: "report_confirmation",
  SAVING_REPORT: "saving_report",
  REPORT_SAVED: "report_saved",
  ERROR: "error"
};
```

Có thể gom một số state vào component nếu project đang dùng router, nhưng logic phải tương đương.

---

# 5. Report object dùng chung

Màn 1 và Màn 2 phải dùng chung một object:

```js
const report = {
  id: null,

  image: {
    file: null,
    previewUrl: null
  },

  location: {
    type: "gps", // gps | exif | manual
    lat: null,
    lng: null,
    text: ""
  },

  capturedAt: null,

  analysis: {
    category: "",
    severity: "",
    reason: "",
    confidence: 0,
    draft: ""
  },

  editedDraft: "",

  receivingAgency: {
    name: "",
    reportUrl: ""
  },

  status: "Đang chuẩn bị",

  submittedAt: null
};
```

## Quan trọng

Không reset object khi:
- chuyển Màn 1 → Màn 2,
- Màn 2 → Màn 1,
- người dùng quay lại sửa,
- người dùng chụp lại.

Chỉ reset khi người dùng chủ động bắt đầu một phản ánh mới.

---

# 6. Flow Màn 1a — Home

## Initial state

```text
state = HOME
report = empty
```

UI:

```text
SnapFix CT
Xin chào!

Chụp ảnh sự cố hạ tầng
và nhận hỗ trợ từ AI

[ Chụp ảnh ]
[ Thư viện ]

Vị trí hiện tại: ...
```

Không hiển thị:
- chat,
- loading AI,
- result card.

---

# 7. Flow Chụp ảnh

Khi click:

```text
Chụp ảnh
```

## Bước 1 — Xin GPS

Theo thiết kế nguồn:

- ảnh chụp mới → ưu tiên GPS thiết bị.
- yêu cầu quyền vị trí đúng lúc người dùng bấm Chụp ảnh.

Logic:

```js
onCaptureClick()
  -> requestGeolocation()
```

## Nếu GPS thành công

Lưu:

```js
report.location = {
  type: "gps",
  lat: position.coords.latitude,
  lng: position.coords.longitude,
  text: null
};
```

Sau đó:

```text
openCamera()
```

## Nếu GPS thất bại / bị từ chối / timeout

Không chặn việc chụp ảnh.

Tiếp tục:

```text
openCamera()
```

Sau khi có ảnh:

```text
readPhotoMeta(file)
```

Nếu EXIF có GPS:

```js
location = {
  type: "exif",
  lat,
  lng
};
```

Nếu EXIF không có GPS:

```js
location = {
  type: "manual",
  text: ""
};
```

sau đó hiển thị:

```text
Bạn chụp ở đâu?
Số nhà, tên đường, gần địa điểm nào...
```

Báo cáo nguồn xác định rõ: GPS → EXIF → manual; EXIF là phương án thử, không được coi là chắc chắn. fileciteturn0file0L138-L157

---

# 8. Flow Thư viện

Khi click:

```text
Thư viện
```

Không dùng geolocation hiện tại để thay thế vị trí của ảnh cũ.

Flow:

```text
select file
   ↓
readPhotoMeta(file)
   ↓
EXIF GPS?
   ├── có → location.type = "exif"
   └── không → location.type = "manual"
```

## Thời gian

Ưu tiên:

```text
EXIF DateTimeOriginal
```

nếu không có:

```text
file.lastModified
```

Nếu dùng `lastModified`, UI phải cho phép:

```text
Bấm để sửa
```

Báo cáo nhấn mạnh rằng ảnh tải về hoặc qua Zalo/Messenger có thể có thời gian file chứ không phải thời gian chụp thực tế. fileciteturn0file0L201-L217

---

# 9. Hàm đọc metadata

Giữ logic tương đương:

```js
async function readPhotoMeta(file) {
  let location = {
    type: "manual",
    text: ""
  };

  let capturedAt = new Date(file.lastModified);
  let timeFromExif = false;

  const meta = await exifr
    .parse(file, {
      gps: true,
      pick: [
        "DateTimeOriginal",
        "latitude",
        "longitude"
      ]
    })
    .catch(() => null);

  if (
    Number.isFinite(meta?.latitude) &&
    Number.isFinite(meta?.longitude)
  ) {
    location = {
      type: "exif",
      lat: meta.latitude,
      lng: meta.longitude
    };
  }

  if (meta?.DateTimeOriginal) {
    capturedAt = meta.DateTimeOriginal;
    timeFromExif = true;
  }

  return {
    location,
    capturedAt,
    timeFromExif
  };
}
```

---

# 10. Sau khi có ảnh

Ngay khi file ảnh hợp lệ:

```js
report.image.file = file;
report.image.previewUrl = URL.createObjectURL(file);
```

Tiếp theo chuyển:

```text
IMAGE_SELECTED
→ READING_METADATA
```

Sau metadata:

```text
→ ANALYZING
```

---

# 11. Màn 1b — Chat loading

Đây là điểm cực kỳ quan trọng.

**Chỉ sau khi có ảnh mới hiển thị chat.**

Không có chat trên Home.

Hiển thị:

### User message

```text
[PHOTO]

Đây là ảnh mình vừa chụp.
```

hoặc:

```text
Đây là ảnh mình vừa chọn.
```

### AI message

```text
Đang xem ảnh của bạn...
```

Sau đó:

```text
Đang phân tích sự cố...
```

Có loading animation.

Không được để màn hình đứng im mà không có feedback.

Báo cáo yêu cầu bắt buộc có trạng thái chờ vì AI mất vài giây. fileciteturn0file0L77-L88

---

# 12. AI processing

## 12.1. Thứ tự

Không gọi AI trước khi có vị trí nếu vị trí có thể lấy được.

Flow:

```text
get location
    ↓
read EXIF / manual
    ↓
prepare AI input
    ↓
call AI
```

Báo cáo chọn cách lấy vị trí trước rồi mới gọi AI để draft có địa điểm. fileciteturn0file0L242-L256

---

# 13. AI Input

Input AI gồm tối thiểu:

```text
image
location
capturedAt
```

Location có thể là:

## GPS/EXIF

```text
latitude
longitude
```

## Manual

```text
text
```

Prompt phải yêu cầu AI trả đúng một JSON.

---

# 14. AI Output contract

AI trả JSON:

```json
{
  "category": "ổ gà",
  "severity": "cao",
  "reason": "Ổ gà sâu, nằm giữa làn xe máy, dễ gây tai nạn",
  "confidence": 0.86,
  "draft": "Kính gửi ... Tôi phát hiện một ổ gà tại ... đề nghị xử lý."
}
```

Đây là contract chính giữa frontend và AI. fileciteturn0file0L242-L260

---

# 15. Validate AI response

Không tin mù quáng JSON AI.

Frontend/backend phải kiểm tra:

```text
category      → string
severity      → low | medium | high
reason        → string
confidence    → number 0..1
draft         → string
```

Nếu AI trả:

```text
```json
...
```
```

thì bỏ markdown fence trước khi parse.

Nếu parse thất bại:

```text
AI_ERROR
```

Hiện:

```text
Không thể đọc kết quả phân tích.
Vui lòng thử lại.
```

Nút:

```text
Thử lại
```

Báo cáo yêu cầu xử lý trường hợp AI trả sai định dạng JSON. fileciteturn0file0L257-L260

---

# 16. Category rules

Các category demo:

```js
[
  "ổ gà",
  "ngập nước",
  "đèn đường hỏng",
  "vỉa hè hư hỏng",
  "khác",
  "không nhận diện được"
]
```

Không ép AI chọn một loại nếu ảnh không phải sự cố hạ tầng.

---

# 17. Confidence logic

```js
const LOW_CONFIDENCE_THRESHOLD = 0.6;
```

Nếu:

```text
confidence < 0.6
```

thì result card phải hiện:

```text
AI chưa chắc chắn.
Bạn nên chụp lại hoặc kiểm tra loại sự cố.
```

Không trình bày kết quả như chắc chắn.

Nút:

```text
Chụp lại
```

phải vẫn có.

---

# 18. Severity mapping

UI:

```js
const severityMap = {
  low: {
    label: "Cảnh báo thấp"
  },

  medium: {
    label: "Cảnh báo trung bình"
  },

  high: {
    label: "Cảnh báo cao"
  }
};
```

---

# 19. Màn 1c — AI Result

Result card:

```text
Ảnh

Ổ gà trên đường        [Cảnh báo cao]

Lý do đánh giá
Mặt đường bị hư hỏng,
tạo thành ổ gà...

Độ tin cậy
█████████░ 0,87

Vị trí
Ninh Kiều, Cần Thơ
(10.0452, 105.7469)
Bấm để sửa

Thời gian chụp
05/10/2026 09:12
Bấm để sửa
```

Bottom:

```text
[Chụp lại]
[Tiếp tục soạn phản ánh →]
```

---

# 20. Sửa vị trí

Khi click:

```text
Bấm để sửa
```

cho location:

Hiển thị form:

```text
Loại vị trí:

(•) Tọa độ
( ) Mô tả bằng chữ

Latitude
Longitude

hoặc

Bạn chụp ở đâu?
________________
```

Sau khi save:

```js
report.location = updatedLocation;
```

Nếu location thay đổi trước khi AI được gọi lại, draft cũ có thể không còn đúng.

Do đó:

```text
location changed
→ đánh dấu draft cần cập nhật
```

Có thể yêu cầu:

```text
Cập nhật nội dung phản ánh
```

hoặc tự generate lại draft bằng mock AI.

---

# 21. Sửa thời gian

Cho phép người dùng sửa:

```text
capturedAt
```

Khi save:

```js
report.capturedAt = newDate;
```

Không thay đổi:

```text
submittedAt
```

vì hai mốc có ý nghĩa khác nhau.

Báo cáo quy định:
- `captured_at`: lúc sự cố được chụp.
- `submitted_at`: lúc gửi phản ánh lên hệ thống. fileciteturn0file0L201-L217

---

# 22. Chụp lại

Click:

```text
Chụp lại
```

Flow:

```text
result
 ↓
reset image
 ↓
giữ location nếu phù hợp
 ↓
open camera
 ↓
new image
 ↓
read metadata
 ↓
analyze lại
```

Không được giữ kết quả AI cũ nếu ảnh mới đã thay đổi.

Reset:

```js
report.analysis = null;
report.editedDraft = "";
```

---

# 23. Tiếp tục soạn phản ánh

Click:

```text
Tiếp tục soạn phản ánh
```

Flow:

```text
RESULT
 ↓
REPORT_CONFIRMATION
```

Pass toàn bộ `report`.

Màn 2 phải hiển thị:
- ảnh,
- location,
- capturedAt,
- category,
- severity,
- draft.

Báo cáo xác định hai màn nối bằng nút này và một object `report` dùng chung. fileciteturn0file0L218-L235

---

# 24. Màn 2 — Confirmation

## Header

```text
← Xác nhận và gửi phản ánh
```

## Incident summary

```text
[thumbnail]

Ổ gà trên đường
Cảnh báo cao

📍 Ninh Kiều, Cần Thơ
🗓 05/10/2026 09:12

Sửa
```

## Draft editor

Textarea chứa:

```text
report.analysis.draft
```

Nhưng khi người dùng bắt đầu chỉnh sửa:

```js
report.editedDraft = userText;
```

Không ghi đè bản gốc.

---

# 25. Khôi phục bản gốc

Lưu:

```js
originalDraft = report.analysis.draft
```

Nút:

```text
Khôi phục bản gốc
```

set:

```js
report.editedDraft = originalDraft;
```

---

# 26. Nếu location là manual

Nếu:

```js
report.location.type === "manual"
```

thì nội dung phản ánh phải có địa điểm người dùng nhập.

Ví dụ:

```text
Tôi xin phản ánh tình trạng ổ gà
trên đường Nguyễn Văn Cừ, gần...
```

Không được gửi draft có:

```text
[địa điểm]
```

nếu user đã có location text.

---

# 27. Receiving agency

Chọn agency theo `category`.

Ví dụ mock:

```js
const agencyRules = {
  "ổ gà": {
    name: "UBND Quận Ninh Kiều",
    reportUrl: "..."
  },

  "ngập nước": {
    name: "UBND Quận Ninh Kiều",
    reportUrl: "..."
  },

  "đèn đường hỏng": {
    name: "Đơn vị quản lý chiếu sáng đô thị",
    reportUrl: "..."
  },

  "vỉa hè hư hỏng": {
    name: "UBND Quận Ninh Kiều",
    reportUrl: "..."
  },

  "khác": {
    name: "Kênh tiếp nhận phù hợp",
    reportUrl: "..."
  }
};
```

**Không hard-code URL thật nếu project chưa xác định nguồn chính thức.**

Có thể dùng:

```text
https://example.com
```

trong mock.

---

# 28. Mở trang báo cáo

Click:

```text
Mở trang báo cáo
```

Phải thực hiện theo thứ tự:

```text
1. Validate report
2. Save report
3. Set submittedAt
4. Set status = "Đã gửi"
5. Open official report URL
```

Tuy nhiên cần phân biệt:

```text
SnapFix database:
    Đã gửi

Cổng chính thức:
    SnapFix không biết kết quả sau khi người dùng rời app
```

Không tự đổi thành:

```text
Đang xử lý
Đã xử lý
```

---

# 29. Save logic

## Trước khi mở trang chính thức

Persist:

```js
{
  image,
  location,
  capturedAt,
  analysis,
  editedDraft,
  receivingAgency,
  submittedAt
}
```

Ở prototype có thể lưu database/local persistence tùy project.

Báo cáo ban đầu cho phép giữ `report` trong state chung ở demo và chỉ ghi database khi người dùng bấm gửi. fileciteturn0file0L236-L241

---

# 30. Image storage

Nếu backend chưa có storage:

- demo frontend giữ object URL.
- database không nên lưu File object trực tiếp.

Khi backend đã có:

```text
upload image
→ receive imageUrl
→ save imageUrl
```

Không gửi EXIF GPS ra ngoài nếu không cần.

---

# 31. Privacy / EXIF

Khi xuất hoặc gửi ảnh đi:

```text
remove GPS EXIF
```

và chỉ giữ:

```text
location mà user đã xác nhận
```

Báo cáo yêu cầu xóa EXIF GPS khi xuất PDF/gửi ảnh để tránh lộ vị trí ngoài ý muốn. fileciteturn0file0L197-L199

---

# 32. Lưu thời gian

Dữ liệu:

```js
capturedAt
submittedAt
```

## capturedAt

Nguồn:

```text
new photo:
  lúc camera trả ảnh

library:
  DateTimeOriginal
  fallback → file.lastModified
```

## submittedAt

Phải do server ghi:

```text
server timestamp
```

Không tin tuyệt đối giờ client.

Báo cáo cũng xác định lưu UTC, chỉ chuyển sang giờ Việt Nam khi hiển thị. fileciteturn0file0L201-L217

---

# 33. Citizen History

Màn Lịch sử hiển thị:

```text
thumbnail
category
severity
location
date
status
```

## Status tự động

Chỉ dùng:

```text
Đã chuẩn bị
Đã gửi
```

Sau đó user có thể tự cập nhật:

```text
Đang xử lý
Đã xử lý
```

nhưng SnapFix không được giả định đây là trạng thái thật từ cơ quan.

Báo cáo quy định rõ điều này. fileciteturn0file0L103-L110

---

# 34. History detail

Click item:

```text
History
 ↓
Report Detail
```

Không cần tạo route riêng nếu project muốn mở modal/drawer.

Hiển thị:

```text
Ảnh
Loại sự cố
Mức độ
Lý do AI
Độ tin cậy
Vị trí
Thời gian chụp
Nội dung phản ánh
Trạng thái
Ngày gửi
```

---

# 35. Officer Dashboard — Luồng xử lý

Khi cán bộ đăng nhập:

```text
Login
 ↓
Dashboard
```

Dashboard lấy dữ liệu từ report records.

KPI:

```text
Tổng phản ánh
Cần xử lý
Đang xử lý
Đã xử lý
```

Charts:

```text
Theo ngày
Theo loại sự cố
```

Map:

```text
markers theo location
```

List:

```text
latest reports
reports needing processing
```

---

# 36. Officer report lifecycle

Đề xuất trạng thái nội bộ:

```text
Cần xử lý
    ↓
Đã phân công
    ↓
Đang xử lý
    ↓
Đã xử lý
```

Lưu ý:

Citizen-facing status và Officer internal status phải được tách logic nếu project có nhu cầu.

Không dùng status nội bộ để khẳng định rằng cơ quan thật sự đã xử lý nếu hệ thống chưa nhận được dữ liệu chính thức.

---

# 37. Officer Dashboard KPI logic

Không hard-code:

```text
128 / 32 / 54 / 36
```

Các số này chỉ là mock data.

Khi có backend:

```text
totalReports
pendingReports
processingReports
resolvedReports
```

tính từ database.

---

# 38. Officer report list

API logic:

```text
GET /reports
```

Có filter:

```text
status
severity
category
dateFrom
dateTo
district
search
```

Ví dụ:

```text
GET /reports?status=pending
GET /reports?category=flood
GET /reports?severity=high
```

Nếu backend chưa có thì frontend filter trên mock array.

---

# 39. Officer report detail

Click:

```text
Xem
```

mở:

```text
Chi tiết phản ánh
```

Thông tin:

```text
Report ID
Ảnh
Category
Severity
Confidence
Reason
Location
CapturedAt
SubmittedAt
Draft
Edited content
Agency
Current status
Sender
```

Nếu sender anonymous:

```text
Người dùng (ẩn danh)
```

---

# 40. Officer assignment

Nút:

```text
Phân công
```

Mở form:

```text
Chọn cán bộ
Ghi chú
[Xác nhận]
```

Sau save:

```text
status = "Đã phân công"
assignee = selectedOfficer
```

Nếu chưa cần backend thật, cập nhật state/mock data.

---

# 41. Update status

Nút:

```text
Cập nhật trạng thái
```

Options:

```text
Cần xử lý
Đã phân công
Đang xử lý
Đã xử lý
```

Khi cập nhật:

```js
status
updatedAt
updatedBy
```

phải được lưu.

---

# 42. Activity / Processing log

Mỗi report nên có log:

```js
{
  action: "Cập nhật trạng thái",
  from: "Cần xử lý",
  to: "Đang xử lý",
  actor: "Nguyễn Văn A",
  createdAt: "..."
}
```

Hiển thị ở tab:

```text
Nhật ký xử lý
```

Nếu backend chưa làm phần này, dùng mock log.

---

# 43. Officer Map

Map markers lấy từ:

```text
report.location.lat
report.location.lng
```

Chỉ render marker nếu report có tọa độ.

Nếu:

```text
location.type === "manual"
```

thì không có marker tọa độ.

Thay bằng:

```text
📍 Địa điểm mô tả:
Đường Nguyễn Văn Cừ...
```

---

# 44. Statistics

Tính từ reports:

```text
count by category
count by status
count by severity
count by day
```

Ví dụ:

```js
const byCategory = groupBy(reports, "category");
const byStatus = groupBy(reports, "status");
```

Không lưu các số thống kê riêng nếu có thể tính từ report records.

---

# 45. Dashboard Search

Search theo:

```text
report ID
category
location text
sender
```

Ví dụ:

```text
#SF20261005001
Nguyễn Văn Cừ
Ổ gà
```

Search phải update list.

---

# 46. Frontend routes đề xuất

## Citizen

```text
/
    Home / Chat

/history
    Lịch sử

/history/:id
    Chi tiết phản ánh

/profile
    Cá nhân
```

## Officer

```text
/admin
    Dashboard

/admin/reports
    Danh sách phản ánh

/admin/reports/:id
    Chi tiết

/admin/map
    Bản đồ

/admin/statistics
    Thống kê

/admin/settings
    Cài đặt
```

Nếu project dùng SPA state thay vì router, vẫn phải có logic tương đương.

---

# 47. API contract đề xuất

Nếu project có backend, chuẩn hóa API:

## Create/prepare report

```http
POST /api/reports
```

Body:

```json
{
  "imageUrl": "...",
  "location": {
    "type": "gps",
    "lat": 10.0452,
    "lng": 105.7469
  },
  "capturedAt": "2026-10-05T02:12:00Z",
  "analysis": {
    "category": "Ổ gà",
    "severity": "cao",
    "reason": "...",
    "confidence": 0.87
  },
  "draft": "...",
  "editedDraft": "...",
  "agencyId": "..."
}
```

## Submit

```http
POST /api/reports/:id/submit
```

Server tạo:

```text
submittedAt
```

và cập nhật:

```text
status = Đã gửi
```

## List

```http
GET /api/reports
```

## Detail

```http
GET /api/reports/:id
```

## Update status

```http
PATCH /api/reports/:id/status
```

## Assign

```http
PATCH /api/reports/:id/assignment
```

---

# 48. Error handling

Mọi async flow đều phải có:

```text
loading
success
error
retry
```

## Camera error

```text
Không thể mở camera.
Bạn có thể chọn ảnh từ thư viện.
```

## Permission denied

```text
Không lấy được vị trí.
Bạn vẫn có thể chụp ảnh và nhập địa điểm bằng chữ.
```

## EXIF error

```text
Không đọc được thông tin ảnh.
Bạn có thể nhập địa điểm thủ công.
```

## AI error

```text
Phân tích ảnh thất bại.
Vui lòng thử lại.
```

## Save error

```text
Không thể lưu phản ánh.
Kiểm tra kết nối và thử lại.
```

## Report URL missing

```text
Chưa cấu hình kênh báo cáo cho loại sự cố này.
```

---

# 49. Network handling

Khi backend/API thất bại:

- không mất dữ liệu form.
- không reset report.
- giữ ảnh và draft hiện tại.
- cho nút Retry.

Ví dụ:

```text
AI failed
 ↓
Retry
 ↓
reuse same image + metadata
```

Không bắt user chụp lại ảnh nếu chỉ API thất bại.

---

# 50. Validation trước khi submit

Trước khi mở official channel:

```js
validateReport(report)
```

Check:

```text
image exists
category exists
severity exists
confidence exists
capturedAt exists
location valid
draft exists
agency.reportUrl exists
```

Nếu manual:

```text
location.text must not be empty
```

Nếu thiếu:

hiển thị lỗi ngay tại field.

---

# 51. Persistence

Tối thiểu phải có state persistence cho:

```text
report currently being edited
```

Nếu browser reload giữa Màn 1 → Màn 2:

- nếu project có backend/session, load lại draft.
- nếu demo frontend-only, dùng localStorage cho report nháp.

Không bắt buộc localStorage nếu backend đã có draft endpoint.

---

# 52. Security / privacy logic

Không lưu:
- EXIF GPS nguyên bản nếu không cần.
- API key AI ở frontend.
- token bí mật trong JS bundle.

AI key phải nằm ở backend/environment.

Không gửi toàn bộ EXIF nếu chỉ cần:

```text
lat
lng
DateTimeOriginal
```

---

# 53. Role logic

## Citizen

Có quyền:

```text
create report
view own reports
edit own draft before submit
open official channel
```

Không có quyền:

```text
manage officer
assign
change internal processing state
```

## Officer

Có quyền:

```text
view reports
filter
view detail
assign
update processing status
view statistics
view map
```

---

# 54. Mobile officer logic

Mobile không phải chỉ là desktop thu nhỏ.

Navigation:

```text
Tổng quan
Danh sách
Bản đồ
Thêm
```

Menu drawer:

```text
Tổng quan
Danh sách phản ánh
Bản đồ
Thống kê
Quản lý loại sự cố
Quản lý người dùng
Báo cáo
Cài đặt
```

Các action quan trọng phải dùng touch target lớn.

---

# 55. Complete end-to-end example

## Case: ổ gà

```text
1. User mở SnapFix CT
2. Thấy Home, chưa có chat
3. Bấm Chụp ảnh
4. Browser xin quyền location
5. User Cho phép
6. Lưu GPS
7. Mở camera
8. User chụp ảnh
9. Ảnh xuất hiện
10. Chat xuất hiện
11. UI "Đang xem ảnh của bạn..."
12. UI "Đang phân tích sự cố..."
13. Backend gọi AI
14. AI trả JSON
15. Validate JSON
16. Result card xuất hiện
17. category = ổ gà
18. severity = cao
19. confidence = 0.87
20. Draft được hiển thị
21. User kiểm tra
22. Bấm Tiếp tục soạn phản ánh
23. Màn 2 mở
24. Draft được fill vào textarea
25. Agency được chọn
26. User chỉnh text nếu cần
27. User bấm Mở trang báo cáo
28. Frontend validate
29. Lưu report
30. Server ghi submittedAt
31. status = Đã gửi
32. Mở official URL
33. History hiển thị report
```

---

# 56. Complete edge cases

## Case A — từ chối GPS

```text
Chụp ảnh
→ permission denied
→ vẫn mở camera
→ đọc EXIF
→ nếu không có EXIF
→ hỏi manual location
→ tiếp tục AI
```

## Case B — ảnh thư viện không có EXIF

```text
Library
→ readPhotoMeta
→ no GPS
→ no DateTimeOriginal
→ location = manual
→ capturedAt = file.lastModified
→ hiển thị "Bấm để sửa"
→ AI
```

## Case C — AI confidence thấp

```text
AI
→ confidence = 0.42
→ result vẫn hiện
→ warning
→ cho Chụp lại
→ cho kiểm tra loại sự cố
```

## Case D — ảnh không phải hạ tầng

```text
AI
→ category = không nhận diện được
→ không ép severity cao/thấp giả tạo
→ hiện thông báo
→ cho Chụp lại
```

## Case E — AI API lỗi

```text
AI request
→ error
→ giữ image
→ giữ location
→ giữ capturedAt
→ Retry
```

## Case F — save lỗi

```text
Mở trang báo cáo
→ save error
→ KHÔNG reset form
→ hiện Retry
```

## Case G — quay lại Màn 1

```text
Màn 2
→ Quay lại
→ vẫn còn image
→ vẫn còn analysis
→ vẫn còn draft
```

## Case H — user sửa location

```text
location changed
→ update report.location
→ draft cần sync location
```

---

# 57. Data model tối thiểu

Nếu backend dùng SQL/PostgreSQL, concept:

```text
users
reports
report_analysis
report_locations
agencies
report_assignments
report_status_history
```

Nếu demo đơn giản hơn có thể gộp trường.

Tuy nhiên logic object phải vẫn giữ:

```text
report
  image
  location
  capturedAt
  analysis
  draft
  agency
  status
  submittedAt
```

---

# 58. Không được làm

Antigravity **không được**:

- Hiện chat ngay trên Home trước khi có ảnh.
- Tạo trang camera custom riêng.
- Dùng bản đồ cho người dân để chọn vị trí.
- Dùng geolocation hiện tại thay cho vị trí của ảnh thư viện.
- Ép AI chọn một category khi ảnh không phù hợp.
- Hiển thị confidence thấp như kết luận chắc chắn.
- Tự nói phản ánh đã được cơ quan xử lý.
- Mất dữ liệu khi bấm Quay lại.
- Ghi `submittedAt` từ client thay vì server khi có backend.
- Expose API key AI ở frontend.
- Gửi nguyên EXIF GPS ra ngoài khi không cần.
- Hard-code KPI dashboard khi backend đã có dữ liệu.
- Chỉ scale desktop xuống mobile.

---

# 59. Tiêu chí hoàn thành chức năng

## Citizen

```text
[ ] Home không có chat khi chưa có ảnh
[ ] Chụp ảnh hoạt động
[ ] Thư viện hoạt động
[ ] GPS permission flow hoạt động
[ ] GPS fallback hoạt động
[ ] EXIF fallback hoạt động
[ ] Manual location hoạt động
[ ] capturedAt hoạt động
[ ] AI loading hoạt động
[ ] AI JSON parse/validate hoạt động
[ ] Confidence threshold hoạt động
[ ] Result card hoạt động
[ ] Chụp lại hoạt động
[ ] Sửa location hoạt động
[ ] Sửa time hoạt động
[ ] Màn 2 nhận đúng report
[ ] Edit draft hoạt động
[ ] Restore draft hoạt động
[ ] Agency mapping hoạt động
[ ] Validate submit hoạt động
[ ] Save report hoạt động
[ ] submittedAt được tạo đúng
[ ] Mở official channel hoạt động
[ ] History hiển thị đúng
[ ] Quay lại không mất dữ liệu
```

## Officer

```text
[ ] Dashboard KPI hoạt động
[ ] Search hoạt động
[ ] Filter hoạt động
[ ] Report list hoạt động
[ ] Report detail hoạt động
[ ] Assignment hoạt động
[ ] Update status hoạt động
[ ] Activity log hoạt động
[ ] Map markers hoạt động
[ ] Statistics hoạt động
[ ] Mobile navigation hoạt động
[ ] Mobile drawer hoạt động
```

---

# 60. Cách Antigravity nên triển khai

## Phase 1 — Audit project

Trước tiên:

```text
- đọc cấu trúc project
- xác định frontend framework
- xác định backend
- xác định router
- xác định state management
- xác định API hiện có
- xác định database hiện có
```

**Không tự đổi stack nếu project hiện tại đã có stack phù hợp.**

## Phase 2 — Data contract

Tạo:

```text
Report
Location
Analysis
Agency
StatusHistory
User
```

và mock data nếu backend chưa sẵn.

## Phase 3 — Citizen flow

Code hoàn chỉnh:

```text
Home
→ Capture/Library
→ Metadata
→ Chat Loading
→ AI Result
→ Confirmation
→ Save
→ Official URL
→ History
```

## Phase 4 — Officer flow

Code:

```text
Dashboard
→ Reports
→ Detail
→ Assignment
→ Status
→ Map
→ Statistics
```

## Phase 5 — Error handling

Test toàn bộ fallback:

```text
GPS denied
GPS timeout
EXIF missing
AI error
JSON invalid
save error
network error
missing agency
```

## Phase 6 — Responsive

Test:

```text
360
390
414
768
1024
1440
```

## Phase 7 — Final integration

Test end-to-end:

```text
Citizen creates report
→ report appears in History
→ report appears in Officer Dashboard
→ officer opens detail
→ officer assigns
→ officer updates status
→ history/detail reflects appropriate data
```

---

# 61. Definition of Done

Project chỉ được xem là hoàn thành khi:

```text
Người dân
    ↓
chụp/chọn ảnh
    ↓
vị trí + thời gian
    ↓
AI
    ↓
kết quả
    ↓
draft
    ↓
xác nhận
    ↓
save
    ↓
official channel
    ↓
History

                    ↘

                  Backend
                    ↓
              Officer Dashboard
                    ↓
                Detail
                    ↓
               Assignment
                    ↓
              Status update
                    ↓
              Statistics / Map
```

Toàn bộ flow phải giữ cùng một `report` identity và không tạo dữ liệu mâu thuẫn giữa Citizen App và Officer Dashboard.

