# SnapFix CT — UI Implementation Spec for Antigravity

## 1. Mục tiêu

Code giao diện demo mobile-first cho **SnapFix CT** — ứng dụng cho phép người dân chụp/chọn ảnh sự cố hạ tầng, AI phân tích ảnh, tạo bản nháp phản ánh và đưa người dùng sang kênh báo cáo chính thức.

Tập trung làm đúng flow giao diện sau:

**Màn 1a → Màn 1b → Màn 1c → Màn 2**

- **Màn 1a:** Trang chủ trước khi chụp/chọn ảnh.
- **Màn 1b:** Sau khi người dùng chụp/chọn ảnh, ảnh xuất hiện trong kiểu chat và AI đang xử lý.
- **Màn 1c:** AI trả kết quả phân tích ngay trong cùng luồng chat.
- **Màn 2:** Xác nhận và soạn phản ánh.

Không hiển thị khung chat ở Màn 1a. Khung chat chỉ xuất hiện **sau khi có ảnh**.

---

# 2. Yêu cầu quan trọng

## 2.1. Flow chính

### Trạng thái A — Chưa có ảnh

Chỉ hiển thị:
- Logo/tên `SnapFix CT`
- Icon cài đặt ở góc phải
- Tiêu đề giới thiệu
- Ảnh minh họa đường phố
- Nút lớn `Chụp ảnh`
- Nút `Thư viện`
- Thẻ `Vị trí hiện tại`
- Ghi chú ngắn về vai trò của SnapFix CT

**TUYỆT ĐỐI KHÔNG hiển thị vùng chat ở trạng thái này.**

### Trạng thái B — Đã có ảnh, đang xử lý

Sau khi:
- bấm `Chụp ảnh`, hoặc
- bấm `Thư viện` và chọn ảnh

thì chuyển sang giao diện kiểu chat.

Hiển thị:
1. Ảnh người dùng vừa chụp/chọn như một tin nhắn.
2. Bubble của AI:
   - `Đây là ảnh mình vừa chụp.` hoặc nội dung tương đương.
3. Trạng thái AI:
   - `Đang xem ảnh của bạn...`
   - `Đang phân tích sự cố...`
4. Hiệu ứng 3 dấu chấm/loading.

Không cần animation phức tạp; chỉ cần loading rõ ràng để người dùng hiểu app đang xử lý.

### Trạng thái C — Có kết quả AI

Sau vài giây giả lập loading, hiển thị:
- ảnh sự cố
- tên loại sự cố
- mức cảnh báo
- lý do đánh giá
- độ tin cậy
- vị trí
- thời gian chụp
- cảnh báo khi AI có độ tin cậy thấp
- nút `Chụp lại`
- nút `Tiếp tục soạn phản ánh`

Kết quả AI phải nằm **ngay bên dưới ảnh trong cùng màn chat**, không chuyển sang một màn phân tích riêng.

### Trạng thái D — Xác nhận và soạn phản ánh

Khi bấm `Tiếp tục soạn phản ánh`, chuyển sang Màn 2.

Màn 2 hiển thị:
- ảnh thumbnail
- loại sự cố
- mức cảnh báo
- vị trí
- thời gian
- nội dung phản ánh do AI soạn sẵn
- nút `Khôi phục bản gốc`
- cơ quan/kênh tiếp nhận phù hợp
- ghi chú SnapFix CT chỉ chuẩn bị nội dung
- nút `Quay lại`
- nút `Mở trang báo cáo`

---

# 3. Phong cách giao diện

Thiết kế theo ảnh prototype tham chiếu:

- Mobile-first.
- Giao diện hiện đại, sạch, dễ sử dụng.
- Nền trắng.
- Màu chủ đạo xanh lá.
- Card bo góc lớn.
- Border nhẹ.
- Shadow rất nhẹ.
- Typography rõ ràng, dễ đọc.
- Khoảng cách thoáng.
- Nút hành động chính màu xanh lá.
- Badge cảnh báo màu theo mức độ.
- Icon đơn giản, outline/rounded.
- Ưu tiên khả năng đọc trên màn hình điện thoại.

Không làm giao diện quá nhiều gradient, glassmorphism hoặc hiệu ứng trang trí.

---

# 4. Design tokens

Có thể dùng CSS variables:

```css
:root {
  --green-primary: #0B8F4D;
  --green-dark: #08743E;
  --green-light: #E8F7EF;

  --text-primary: #111827;
  --text-secondary: #6B7280;

  --bg: #FFFFFF;
  --surface: #F8FAFC;
  --border: #E5E7EB;

  --danger-bg: #FEE2E2;
  --danger-text: #DC2626;

  --warning-bg: #FEF3C7;
  --warning-text: #D97706;

  --success-bg: #DCFCE7;
  --success-text: #15803D;

  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 22px;
}
```

Không bắt buộc dùng đúng mã màu trên nếu project đã có design system, nhưng tổng thể phải giữ cảm giác **trắng + xanh lá + cảnh báo màu đỏ/vàng**.

---

# 5. Màn 1a — Trang chủ trước khi chụp

## Header

Trái:
- `SnapFix CT`

Phải:
- icon Settings

Logo text:
- `SnapFix` màu xanh lá
- `CT` màu đen

## Hero

Tiêu đề:

```text
Chụp ảnh sự cố hạ tầng
và nhận hỗ trợ từ AI
```

Mô tả:

```text
Chỉ cần một tấm ảnh, AI sẽ phân tích
và soạn sẵn nội dung phản ánh giúp bạn.
```

Bên dưới là ảnh minh họa đường phố Cần Thơ / đô thị.

## Hai nút lớn

Nút chính:

```text
📷  Chụp ảnh
```

Nút phụ:

```text
🖼  Thư viện
```

Nút `Chụp ảnh` lớn hơn và nổi bật nhất.

## Vị trí

Card:

```text
📍 Vị trí hiện tại
Ninh Kiều, Cần Thơ                       >
```

Dữ liệu chỉ demo.

Không hiển thị bản đồ.

## Disclaimer

Card nền xám rất nhạt:

```text
ⓘ SnapFix CT chỉ hỗ trợ chuẩn bị nội dung phản ánh.
Việc gửi phản ánh sẽ được thực hiện tại trang chính thức
của cơ quan chức năng.
```

---

# 6. Màn 1b — Sau khi chụp/chọn ảnh

Header:
- nút Back
- `SnapFix CT`
- icon Settings

## User message

Ảnh người dùng nằm phía bên phải, dạng bubble/card.

Ví dụ ảnh:
- ổ gà trên đường
- đường nhựa bị hư
- có nước đọng

Bên dưới ảnh:

```text
Đây là ảnh mình vừa chụp.
```

## AI processing

Bubble AI bên trái có icon robot.

Tin nhắn:

```text
Đang xem ảnh của bạn...
```

Sau đó:

```text
Đang phân tích sự cố...
```

Có animated dots:

```text
● ● ●
```

## Bottom input area

Không cho nhập text thật ở demo.

Có thể hiện:

```text
Bạn có thể chụp ảnh hoặc chọn từ thư viện
```

và icon gallery + nút gửi mờ.

---

# 7. Màn 1c — Kết quả AI trong chat

Giữ nguyên header và ảnh user.

AI trả bubble:

```text
Đây là ảnh phân tích của bạn:
```

Sau đó là Result Card.

## Result Card

### Ảnh

Ảnh sự cố chiếm gần toàn bộ chiều rộng card.

### Category

```text
Ổ gà trên đường
```

### Severity

Badge:

```text
Cảnh báo cao
```

Với mức:
- thấp → vàng
- trung bình → cam
- cao → đỏ

### Reason

Label:

```text
Lý do đánh giá
```

Value demo:

```text
Mặt đường bị hư hỏng, tạo thành ổ gà,
có thể gây nguy hiểm cho phương tiện.
```

### Confidence

Hiển thị progress bar:

```text
Độ tin cậy     █████████░  0,87
```

Giá trị demo: `0,87`.

### Location

```text
📍 Vị trí
Ninh Kiều, Cần Thơ
(10.0452, 105.7469)
Bấm để sửa
```

### Captured time

```text
🗓 Thời gian chụp
05/10/2026 09:12
Bấm để sửa
```

### Low confidence warning

Khi confidence < 0.6:

```text
⚠ AI chưa chắc chắn.
Bạn nên chụp lại hoặc kiểm tra loại sự cố.
```

Không được hiển thị kết quả như một kết luận chắc chắn khi confidence thấp.

## Action buttons

Hai nút:

```text
Chụp lại
```

và:

```text
Tiếp tục soạn phản ánh →
```

Nút `Tiếp tục...` là primary button.

---

# 8. Màn 2 — Xác nhận và soạn phản ánh

Header:

```text
←     Xác nhận và gửi phản ánh
```

## Incident summary card

Hiển thị:

- thumbnail
- `Ổ gà trên đường`
- `Cảnh báo cao`
- `Ninh Kiều, Cần Thơ`
- `05/10/2026 09:12`
- link `Sửa`

## Nội dung phản ánh

Section title:

```text
Nội dung phản ánh
```

Bên phải:

```text
↻ Khôi phục bản gốc
```

Text area lớn với nội dung demo:

```text
Kính gửi cơ quan chức năng,

Tôi xin phản ánh tình trạng mặt đường bị hư hỏng,
xuất hiện ổ gà tại khu vực Ninh Kiều, Cần Thơ
(tọa độ: 10.0452, 105.7469).

Tình trạng này gây khó khăn và nguy hiểm
cho các phương tiện lưu thông, đặc biệt là xe máy.

Kính mong cơ quan chức năng xem xét
và sớm có biện pháp khắc phục.

Xin cảm ơn.
```

Text area phải editable.

## Cơ quan tiếp nhận

Title:

```text
Cơ quan tiếp nhận phù hợp
```

Card:

```text
🏛  UBND Quận Ninh Kiều
     Tiếp nhận các phản ánh về hạ tầng giao thông
     trên địa bàn quận Ninh Kiều.                 >
```

Có thể dùng mock data, chưa cần backend.

## Disclaimer

Card:

```text
ⓘ SnapFix CT chỉ chuẩn bị nội dung phản ánh.
Việc gửi phản ánh sẽ được thực hiện tại trang chính thức
của cơ quan chức năng.
```

## Bottom actions

```text
Quay lại
Mở trang báo cáo ↗
```

`Mở trang báo cáo` là primary button.

---

# 9. Interaction requirements

## Chụp ảnh

Khi bấm `Chụp ảnh`:
- mở camera bằng input capture nếu project dùng web.
- sau khi có file → chuyển sang trạng thái Màn 1b.

Ví dụ:

```html
<input
  type="file"
  accept="image/*"
  capture="environment"
/>
```

Không xây một trang camera riêng.

## Thư viện

Khi bấm `Thư viện`:
- mở file picker.
- chọn ảnh xong → chuyển sang Màn 1b.

## AI loading

Demo frontend:
- không cần API thật.
- dùng timeout khoảng 1.5–2.5 giây.
- sau loading chuyển sang Màn 1c.

Flow:

```text
idle
  ↓
image selected
  ↓
analyzing
  ↓
result
```

## Tiếp tục soạn phản ánh

Chuyển từ result state → report confirmation.

Phải giữ nguyên toàn bộ dữ liệu:

```js
{
  image,
  location,
  capturedAt,
  analysis: {
    category,
    severity,
    reason,
    confidence,
    draft
  }
}
```

## Quay lại

Khi quay lại Màn 1:
- không được mất ảnh.
- không reset report state.

---

# 10. Location UX

Có 3 kiểu location:

```text
gps
exif
manual
```

## GPS

Ưu tiên đầu tiên khi chụp ảnh mới.

Hiển thị:

```text
Vị trí hiện tại
Ninh Kiều, Cần Thơ
```

## EXIF

Nếu ảnh thư viện có GPS:

```text
Vị trí lấy từ ảnh, bấm để sửa
```

Không dùng geolocation hiện tại để thay thế vị trí ảnh cũ.

## Manual

Nếu không có GPS/EXIF:

```text
Bạn chụp ở đâu?

Số nhà, tên đường, gần địa điểm nào...
```

Cho phép người dùng sửa.

Không làm màn bản đồ.

---

# 11. Time UX

Lưu và hiển thị:
- `capturedAt`
- `submittedAt`

Màn 1 và Màn 2 tập trung vào `capturedAt`.

Màn Lịch sử về sau dùng `submittedAt` cho cột ngày gửi.

Demo format:

```text
05/10/2026 09:12
```

---

# 12. Responsive

Ưu tiên mobile:

- width khoảng 360–430px.
- nội dung không tràn ngang.
- button chạm dễ.
- text không quá nhỏ.
- card có khoảng cách đều.

Desktop:
- đặt app trong mobile frame hoặc centered container.
- không kéo UI thành dashboard desktop.

Nên test:
- 360px
- 390px
- 414px
- desktop >= 1024px

---

# 13. Component structure đề xuất

Tùy stack hiện tại, có thể chia:

```text
App
 ├── HomeScreen
 │    ├── Header
 │    ├── Hero
 │    ├── CaptureButtons
 │    ├── CurrentLocationCard
 │    └── DisclaimerCard
 │
 ├── ChatScreen
 │    ├── Header
 │    ├── UserImageMessage
 │    ├── AiMessage
 │    ├── LoadingMessage
 │    └── AnalysisResultCard
 │
 └── ReportScreen
      ├── Header
      ├── IncidentSummaryCard
      ├── ReportEditor
      ├── AgencyCard
      ├── DisclaimerCard
      └── ReportActions
```

Có thể gộp `HomeScreen` và `ChatScreen` thành một component nếu project đang quản lý bằng state.

---

# 14. State model

Ví dụ:

```js
const [screenState, setScreenState] = useState("home");
// home | analyzing | result | report
```

Data:

```js
const [report, setReport] = useState({
  image: null,
  location: {
    type: "gps",
    text: "Ninh Kiều, Cần Thơ",
    lat: 10.0452,
    lng: 105.7469
  },
  capturedAt: "2026-10-05T09:12:00+07:00",
  analysis: {
    category: "Ổ gà trên đường",
    severity: "cao",
    reason:
      "Mặt đường bị hư hỏng, tạo thành ổ gà, có thể gây nguy hiểm cho phương tiện.",
    confidence: 0.87,
    draft: "Kính gửi cơ quan chức năng,..."
  }
});
```

Không cần backend cho bản demo UI.

---

# 15. Mock data cho các loại sự cố

Có thể chuẩn bị:

```js
const mockIncidents = [
  {
    category: "Ổ gà trên đường",
    severity: "cao"
  },
  {
    category: "Ngập nước",
    severity: "trung bình"
  },
  {
    category: "Đèn đường hỏng",
    severity: "thấp"
  },
  {
    category: "Vỉa hè hư hỏng",
    severity: "trung bình"
  }
];
```

Ảnh demo ưu tiên:
- ổ gà
- ngập nước
- đèn đường hỏng

---

# 16. Accessibility

Phải có:
- `alt` cho ảnh.
- label/aria-label cho icon button.
- contrast đủ cao.
- focus state.
- button có vùng bấm đủ lớn.
- không chỉ dùng màu để biểu đạt severity.

---

# 17. Những thứ KHÔNG cần làm

Đây là demo UI, không cần triển khai:

- bản đồ.
- hệ thống gửi phản ánh thật.
- đăng nhập thật.
- database thật.
- AI API thật.
- camera UI custom.
- trang camera riêng.
- tracking trạng thái cơ quan chức năng.
- notification thật.

Có thể mock những phần trên.

---

# 18. Màn hình phụ có thể làm sau

Theo flow tổng thể, có thêm:

## Màn 3 — Lịch sử phản ánh

Danh sách card:
- thumbnail
- loại sự cố
- mức độ
- vị trí
- ngày
- trạng thái

Trạng thái tự động chỉ:
- `Đã chuẩn bị`
- `Đã gửi`

Không tự giả định `Đang xử lý` hoặc `Đã xử lý`.

## Màn 4 — Cá nhân

Các mục đơn giản:

```text
Thông tin cá nhân
Cài đặt
Quyền riêng tư
Ngôn ngữ
Giới thiệu ứng dụng
Đăng xuất
```

Hai màn này ưu tiên sau khi Màn 1 và Màn 2 hoàn thiện.

---

# 19. Tiêu chí hoàn thành

UI được xem là đạt khi:

1. Mở app → chỉ thấy trang chủ, **không thấy chat**.
2. Bấm `Chụp ảnh`/`Thư viện` → sau khi có ảnh mới mở luồng chat.
3. Có trạng thái `Đang xem ảnh...` và `Đang phân tích...`.
4. Sau loading → hiện result card AI.
5. Result card có category, severity, reason, confidence, location, captured time.
6. Có `Chụp lại`.
7. Có `Tiếp tục soạn phản ánh`.
8. Màn 2 tự điền dữ liệu từ Màn 1.
9. Nội dung phản ánh có thể sửa.
10. Có `Khôi phục bản gốc`.
11. Có cơ quan tiếp nhận phù hợp.
12. Có disclaimer rằng SnapFix CT chỉ chuẩn bị nội dung.
13. `Quay lại` không làm mất dữ liệu.
14. Giao diện responsive tốt trên mobile.
15. Không thêm bản đồ hoặc trang camera riêng.

---

# 20. Instruction cho Antigravity

**Hãy triển khai đúng UI/UX specification này trên project hiện tại.**

Ưu tiên:
1. Giữ nguyên stack và cấu trúc project hiện có nếu đã có.
2. Không thay đổi backend/API không cần thiết.
3. Tập trung frontend.
4. Dùng mock data cho AI.
5. Làm flow thật giữa các trạng thái bằng state.
6. UI phải gần prototype: trắng, xanh lá, rounded cards, rõ ràng, tối giản.
7. Quan trọng nhất: **chat chỉ xuất hiện SAU KHI người dùng đã chụp/chọn ảnh.**
8. Không tạo màn camera riêng.
9. Không tạo bản đồ.
10. Không biến ứng dụng thành dashboard desktop.

Sau khi code xong, chạy project và tự kiểm tra toàn bộ flow:

```text
Home
→ Chụp ảnh
→ Loading chat
→ AI Result
→ Tiếp tục soạn phản ánh
→ Report Confirmation
→ Quay lại
→ Dữ liệu vẫn còn
```

