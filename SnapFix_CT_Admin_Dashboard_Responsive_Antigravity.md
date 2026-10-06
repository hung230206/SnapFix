# SnapFix CT — Admin Dashboard UI/UX Specification for Antigravity

## 1. Mục tiêu

Xây dựng giao diện **Dashboard quản trị dành cho cán bộ tiếp nhận phản ánh** của hệ thống SnapFix CT.

Đây là giao diện web responsive, có 2 trạng thái chính:

- **Desktop:** dashboard quản trị đầy đủ với sidebar, biểu đồ, bản đồ, bảng phản ánh và danh sách cần xử lý.
- **Mobile:** chuyển sang layout mobile với bottom navigation và menu dạng drawer.

Mục tiêu của dashboard là giúp cán bộ:

1. Nhìn nhanh tình hình phản ánh.
2. Theo dõi các phản ánh cần xử lý.
3. Xem vị trí và mức độ sự cố.
4. Mở chi tiết từng phản ánh.
5. Theo dõi thống kê theo loại sự cố/thời gian.

---

# 2. Phong cách thiết kế

Giao diện phải bám sát prototype:

- Tông chính: **xanh lá + trắng + xám rất nhạt**.
- Có thể sử dụng đỏ/vàng/xanh dương cho trạng thái.
- Modern admin dashboard.
- Card bo góc.
- Border mảnh.
- Shadow nhẹ.
- Typography sans-serif rõ ràng.
- Khoảng cách rộng, không quá dày.
- Icon outline đơn giản.
- Không dùng hiệu ứng 3D nặng.
- Không dùng glassmorphism quá mức.
- Ưu tiên khả năng đọc và thao tác nhanh.

Từ khóa visual:

```text
Clean
Modern
Municipal admin
Minimal
Professional
Responsive
Data-driven
```

---

# 3. Layout tổng thể Desktop

Kích thước desktop ưu tiên:

```text
1440 × 900
```

Cấu trúc:

```text
┌─────────────────────────────────────────────────────────────────┐
│ Sidebar │ Top Header                                             │
│         ├─────────────────────────────────────────────────────────┤
│         │                                                        │
│         │ Main Dashboard                                         │
│         │                                                        │
│         │ KPI Cards                                              │
│         │                                                        │
│         │ Charts + Map                                           │
│         │                                                        │
│         │ Report Table + Recent/Need-processing                   │
│         │                                                        │
└─────────┴─────────────────────────────────────────────────────────┘
```

---

# 4. Sidebar Desktop

Sidebar cố định bên trái.

Chiều rộng khoảng:

```text
220–240px
```

Màu nền:
- xanh lá đậm / xanh xanh đậm.

## Logo

Hiển thị:

```text
SnapFix CT
Hệ thống tiếp nhận phản ánh
```

Có icon logo nhỏ.

## Navigation

Các mục:

```text
⌂  Tổng quan
▤  Danh sách phản ánh
⌖  Bản đồ
▥  Thống kê
▣  Quản lý loại sự cố
♙  Quản lý người dùng
▤  Báo cáo
⚙  Cài đặt
```

Mục hiện tại:

```text
Tổng quan
```

phải có background xanh lá sáng hơn và bo góc.

## User area cuối sidebar

Hiển thị:

```text
Nguyễn Văn A
Cán bộ tiếp nhận
⌄
```

Cuối cùng:

```text
↪ Đăng xuất
```

---

# 5. Top Header Desktop

Khu vực trên cùng của content.

Bên trái:
Search box.

Placeholder:

```text
Tìm kiếm phản ánh (mã, địa điểm, loại sự cố, người gửi...)
```

Bên phải:

- icon thông báo.
- badge số thông báo.
- avatar / icon cơ quan.
- tên cơ quan.
- role.
- dropdown.

Ví dụ:

```text
UBND Quận Ninh Kiều
Cán bộ tiếp nhận
⌄
```

---

# 6. Main Header

Tiêu đề:

```text
Tổng quan
```

Subtext:

```text
Tình hình tiếp nhận và xử lý phản ánh sự cố hạ tầng
trên địa bàn quận Ninh Kiều
```

Bên phải có date filter:

```text
Hôm nay (05/10/2026)   ⌄
```

Có thể hỗ trợ:

```text
Hôm nay
7 ngày
30 ngày
Tuỳ chọn
```

---

# 7. KPI Cards

Hàng đầu tiên gồm 4 card.

## Card 1 — Tổng phản ánh

```text
Tổng phản ánh
128

↑ 12%
so với tuần trước
```

Icon document.

## Card 2 — Cần xử lý

```text
Cần xử lý
32

↑ 8%
đang chờ phân công
```

Icon warning.

## Card 3 — Đang xử lý

```text
Đang xử lý
54

↑ 5%
đã phân công
```

Icon clock.

## Card 4 — Đã xử lý

```text
Đã xử lý
36

↑ 20%
hoàn thành
```

Icon check.

### Behavior

Không hard-code business logic trong component.

Tạo data array:

```js
const kpis = [
  {
    label: "Tổng phản ánh",
    value: 128,
    change: "+12%"
  },
  {
    label: "Cần xử lý",
    value: 32,
    change: "+8%"
  },
  {
    label: "Đang xử lý",
    value: 54,
    change: "+5%"
  },
  {
    label: "Đã xử lý",
    value: 36,
    change: "+20%"
  }
];
```

---

# 8. Khu vực Chart

Desktop chia thành 2 phần chính:

```text
┌─────────────────────────┬──────────────────────────┐
│ Số lượng phản ánh       │ Tỷ lệ theo loại sự cố   │
│ theo ngày               │                          │
└─────────────────────────┴──────────────────────────┘
```

## Chart 1 — Số lượng phản ánh theo ngày

Tiêu đề:

```text
Số lượng phản ánh theo ngày
```

Dropdown:

```text
7 ngày qua
```

Line chart.

Mock data:

```text
29/09 → 8
30/09 → 12
01/10 → 17
02/10 → 22
03/10 → 30
04/10 → 19
05/10 → 34
```

Có:
- line.
- điểm dữ liệu.
- grid nhẹ.
- tooltip khi hover.

## Chart 2 — Tỷ lệ theo loại sự cố

Doughnut chart.

Center:

```text
128
phản ánh
```

Legend:

```text
Ổ gà, hư mặt đường    42 (32,8%)
Ngập nước              28 (21,9%)
Đèn đường hỏng         20 (15,6%)
Vỉa hè hư hỏng         18 (14,1%)
Khác                   20 (15,6%)
```

Dùng chart library hiện có của project nếu có.

Không thêm library mới nếu không cần thiết.

---

# 9. Bản đồ phản ánh

Desktop có panel bản đồ ở bên phải.

Header:

```text
Bản đồ phản ánh
```

Filter:

```text
Tất cả loại sự cố   ⌄
```

Bản đồ centered khu vực:

```text
Ninh Kiều, Cần Thơ
```

Hiển thị marker theo trạng thái.

Ví dụ:

- đỏ → Cần xử lý
- vàng → Đang xử lý
- xanh lá → Đã xử lý
- xanh dương → trạng thái khác

Có zoom controls:

```text
+
−
```

Ở dưới map có legend:

```text
🔴 Cần xử lý
🟡 Đang xử lý
🟢 Đã xử lý
🔵 Khác
```

### Quan trọng

Bản đồ có thể dùng:
- mock map image trong demo, hoặc
- map library hiện có của project.

Không cần backend GIS thật ở bước UI.

---

# 10. Danh sách phản ánh mới nhất

Phía dưới chart.

Header:

```text
Danh sách phản ánh mới nhất
```

Bên phải:

```text
Xem tất cả →
```

Bảng Desktop gồm:

```text
□
Mã phản ánh
Hình ảnh
Loại sự cố
Địa điểm
Ngày gửi
Trạng thái
Độ ưu tiên
Thao tác
```

Mock records:

```text
#SF20261005001
Ổ gà, hư mặt đường
Đường Nguyễn Văn Cừ, P. An Hòa, Q. Ninh Kiều
05/10/2026 09:12
Cần xử lý
Cao

#SF20261005002
Ngập nước
Đường 3/2, P. Hưng Lợi, Q. Ninh Kiều
05/10/2026 08:45
Đang xử lý
Trung bình

#SF20261005003
Vỉa hè hư hỏng
Đường Hai Bà Trưng, P. Tân An, Q. Ninh Kiều
05/10/2026 08:20
Cần xử lý
Trung bình

#SF20261005004
Đèn đường hỏng
Đường Trần Hưng Đạo, P. An Nghiệp, Q. Ninh Kiều
05/10/2026 07:55
Đã xử lý
Thấp
```

Thao tác:

```text
Xem
...
```

---

# 11. Panel "Phản ánh cần xử lý"

Desktop có card bên phải bảng.

Header:

```text
Phản ánh cần xử lý
```

Bên phải:

```text
Xem tất cả →
```

Mỗi item:

```text
[thumbnail]  Ổ gà trên đường
             📍 Đường Nguyễn Văn Cừ, Ninh Kiều
             🗓 05/10/2026 09:12
                                      Cao
```

Các item mock:

```text
Ổ gà trên đường       Cao
Ngập nước             Trung bình
Đèn đường hỏng        Thấp
Vỉa hè hư hỏng        Trung bình
```

---

# 12. Responsive Mobile

Breakpoint đề xuất:

```css
@media (max-width: 768px)
```

Ở mobile:

- Ẩn sidebar desktop.
- Top header thu gọn.
- Content full width.
- Card xếp dọc.
- Bảng chuyển thành card list.
- Chart full width.
- Map full width.
- Bottom navigation cố định.

Kích thước test:

```text
360px
390px
414px
```

---

# 13. Mobile Header

Header gồm:

Trái:
- logo SnapFix CT.

Phải:
- notification.
- menu/avatar.

Search box có thể chuyển thành nút/icon để tiết kiệm không gian.

Nếu cần search:

```text
🔍 Tìm kiếm
```

thay vì full-width desktop search.

---

# 14. Mobile Dashboard

Sau header:

```text
Tổng quan
```

Date:

```text
05/10/2026
```

## KPI

Không giữ 4 card theo hàng ngang.

Hiển thị grid 2 cột:

```text
┌─────────────┬─────────────┐
│ Tổng        │ Cần xử lý   │
│ 128         │ 32          │
├─────────────┼─────────────┤
│ Đang xử lý  │ Đã xử lý    │
│ 54          │ 36          │
└─────────────┴─────────────┘
```

---

# 15. Mobile Chart

Chart line:

```text
Số lượng phản ánh theo ngày
```

full width.

Doughnut chart:

```text
Tỷ lệ theo loại sự cố
```

full width.

Legend nằm phía dưới hoặc bên cạnh tùy chiều rộng.

---

# 16. Mobile Report List

Thay bảng bằng card list.

Ví dụ:

```text
┌────────────────────────────┐
│ [image]  Ổ gà, hư mặt đường│
│          #SF20261005001    │
│          📍 Nguyễn Văn Cừ  │
│          🗓 05/10 09:12    │
│          [Cần xử lý] [Cao] │
│                        >   │
└────────────────────────────┘
```

Có filter chips:

```text
Tất cả
Cần xử lý
Đang xử lý
Đã xử lý
```

---

# 17. Mobile Chi tiết phản ánh

Khi bấm vào một phản ánh:

Header:

```text
←   Chi tiết phản ánh
```

Body:

### Ảnh sự cố

Ảnh lớn.

### Thông tin

```text
Ổ gà, hư mặt đường
#SF20261005001

📍 Đường Nguyễn Văn Cừ,
P. An Hòa, Q. Ninh Kiều

🗓 05/10/2026 09:12

👤 Người gửi
Người dùng (ẩn danh)
```

### Status

```text
Cao
Cần xử lý
```

Tabs:

```text
Thông tin
Nhật ký xử lý
```

Bottom buttons:

```text
Phân công
Cập nhật trạng thái
```

---

# 18. Mobile Bản đồ

Header:

```text
←  Bản đồ phản ánh       ☰
```

Filter:

```text
Tất cả loại sự cố
```

Map full width.

Marker giống desktop.

Bottom navigation vẫn cố định.

---

# 19. Mobile Thống kê

Header:

```text
←  Thống kê
```

Tabs:

```text
Theo loại sự cố
Theo thời gian
```

Hiển thị doughnut chart:

```text
128
phản ánh
```

Legend:

```text
Ổ gà, hư mặt đường  42
Ngập nước            28
Đèn đường hỏng       20
Vỉa hè hư hỏng       18
Khác                 20
```

---

# 20. Bottom Navigation Mobile

Fixed ở cuối màn hình.

Khoảng 4 mục chính:

```text
⌂
Tổng quan

▤
Danh sách

⌖
Bản đồ

+
Thêm
```

Active tab:
- xanh lá.
- icon và text xanh lá.

Background:
- trắng.
- border top nhẹ.
- shadow nhẹ.

---

# 21. Mobile Drawer / Menu

Khi bấm menu, mở drawer từ phải hoặc trái.

Header:

```text
SnapFix CT
UBND Quận Ninh Kiều
```

Menu:

```text
⌂ Tổng quan
▤ Danh sách phản ánh
⌖ Bản đồ
▥ Thống kê
▣ Quản lý loại sự cố
♙ Quản lý người dùng
▤ Báo cáo
⚙ Cài đặt
```

Cuối menu:

```text
Nguyễn Văn A
Cán bộ tiếp nhận

↪ Đăng xuất
```

---

# 22. Màu trạng thái

```css
/* Cần xử lý */
--status-danger-bg: #FEE2E2;
--status-danger-text: #DC2626;

/* Đang xử lý */
--status-warning-bg: #FEF3C7;
--status-warning-text: #D97706;

/* Đã xử lý */
--status-success-bg: #DCFCE7;
--status-success-text: #15803D;

/* Khác */
--status-info-bg: #DBEAFE;
--status-info-text: #2563EB;
```

Độ ưu tiên:

```text
Cao       → đỏ
Trung bình → vàng/cam
Thấp      → xanh lá
```

---

# 23. Design Tokens

```css
:root {
  --primary: #087F46;
  --primary-dark: #056638;
  --primary-light: #E8F7EF;

  --background: #F5F7F8;
  --surface: #FFFFFF;

  --text: #111827;
  --text-secondary: #6B7280;
  --muted: #9CA3AF;

  --border: #E5E7EB;

  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 18px;
  --radius-xl: 22px;

  --shadow-card:
    0 2px 10px rgba(15, 23, 42, 0.05);
}
```

---

# 24. Component Structure

Đề xuất:

```text
src/
├── components/
│   ├── layout/
│   │   ├── AdminLayout
│   │   ├── Sidebar
│   │   ├── TopHeader
│   │   ├── MobileBottomNav
│   │   └── MobileDrawer
│   │
│   ├── dashboard/
│   │   ├── DashboardHeader
│   │   ├── KpiCard
│   │   ├── ReportsLineChart
│   │   ├── IncidentTypeChart
│   │   ├── ReportMap
│   │   ├── RecentReports
│   │   └── ProcessingReports
│   │
│   └── reports/
│       ├── ReportList
│       ├── ReportCard
│       ├── ReportTable
│       ├── ReportDetail
│       └── StatusBadge
│
├── pages/
│   ├── Dashboard
│   ├── Reports
│   ├── ReportDetail
│   ├── Map
│   └── Statistics
│
└── data/
    └── mockReports.js
```

Nếu project hiện tại đã có cấu trúc khác, **giữ nguyên cấu trúc hiện tại**.

---

# 25. Mock Data

Tạo:

```js
const reports = [
  {
    id: "#SF20261005001",
    image: "/images/pothole.jpg",
    category: "Ổ gà, hư mặt đường",
    address: "Đường Nguyễn Văn Cừ, P. An Hòa, Q. Ninh Kiều",
    date: "05/10/2026 09:12",
    status: "Cần xử lý",
    priority: "Cao"
  },
  {
    id: "#SF20261005002",
    image: "/images/flood.jpg",
    category: "Ngập nước",
    address: "Đường 3/2, P. Hưng Lợi, Q. Ninh Kiều",
    date: "05/10/2026 08:45",
    status: "Đang xử lý",
    priority: "Trung bình"
  },
  {
    id: "#SF20261005003",
    image: "/images/sidewalk.jpg",
    category: "Vỉa hè hư hỏng",
    address: "Đường Hai Bà Trưng, P. Tân An, Q. Ninh Kiều",
    date: "05/10/2026 08:20",
    status: "Cần xử lý",
    priority: "Trung bình"
  },
  {
    id: "#SF20261005004",
    image: "/images/streetlight.jpg",
    category: "Đèn đường hỏng",
    address: "Đường Trần Hưng Đạo, P. An Nghiệp, Q. Ninh Kiều",
    date: "05/10/2026 07:55",
    status: "Đã xử lý",
    priority: "Thấp"
  }
];
```

Ảnh có thể thay bằng ảnh placeholder trong quá trình code.

---

# 26. Interaction

## Sidebar

Click menu → đổi route/page.

## KPI

Có thể click:

```text
Cần xử lý
Đang xử lý
Đã xử lý
```

để chuyển sang danh sách đã filter.

## Xem

Click `Xem`:

```text
Dashboard
→ Chi tiết phản ánh
```

## Xem tất cả

```text
Danh sách phản ánh
```

## Marker map

Click marker → popup:

```text
Ổ gà, hư mặt đường
Cao
05/10/2026 09:12

Xem chi tiết →
```

## Filter

Các filter phải thay đổi mock data hiển thị trên UI.

---

# 27. Responsive Rules

## Desktop ≥ 1200px

```text
Sidebar fixed
Charts 2 cột
Map hiển thị cùng dashboard
Table đầy đủ
Processing list bên phải
```

## Tablet 768–1199px

```text
Sidebar thu nhỏ hoặc collapse
KPI 2 × 2
Charts xếp lại
Map full width hoặc 1 cột
Bảng có horizontal scroll nếu cần
```

## Mobile < 768px

```text
Sidebar → Drawer
Top header compact
KPI 2 × 2
Charts 1 cột
Table → Cards
Map 1 cột
Bottom navigation fixed
```

Không được để:
- horizontal overflow toàn trang.
- chữ bị cắt.
- button quá nhỏ.
- bảng tràn màn hình.

---

# 28. Accessibility

Bắt buộc:

- Button có accessible label.
- Icon button có `aria-label`.
- Images có `alt`.
- Keyboard focus.
- Contrast rõ.
- Không chỉ dùng màu để phân biệt trạng thái.
- Font tối thiểu khoảng 14px cho nội dung thông thường.
- Touch target mobile tối thiểu khoảng 44px.

---

# 29. Không cần triển khai ở bản UI demo

Không cần:

- authentication backend.
- database thật.
- phân quyền thật.
- API báo cáo thật.
- GIS backend.
- real-time notification.
- AI.
- xử lý trạng thái thật.

Có thể mock toàn bộ dữ liệu.

---

# 30. Tiêu chí hoàn thành

### Desktop

Phải có:

```text
[x] Sidebar
[x] Top header
[x] Search
[x] User profile
[x] Date filter
[x] 4 KPI cards
[x] Line chart
[x] Doughnut chart
[x] Map
[x] Recent reports table
[x] Processing reports panel
```

### Mobile

Phải có:

```text
[x] Compact header
[x] KPI 2×2
[x] Charts responsive
[x] Report cards
[x] Report detail
[x] Mobile map
[x] Mobile statistics
[x] Bottom navigation
[x] Drawer menu
```

---

# 31. Instruction trực tiếp cho Antigravity

**Hãy triển khai giao diện Dashboard quản trị SnapFix CT dựa trên specification này và prototype tham chiếu.**

Ưu tiên độ giống prototype hơn việc tạo thêm chức năng.

Quan trọng:

1. Giữ nguyên stack hiện tại.
2. Không thay backend/API không cần thiết.
3. Tập trung frontend.
4. Dùng mock data.
5. Desktop và mobile phải là cùng một hệ thống responsive.
6. Không chỉ thu nhỏ desktop xuống mobile; phải thiết kế lại layout mobile.
7. Desktop dùng sidebar.
8. Mobile dùng bottom navigation + drawer.
9. Bảng desktop phải trở thành card list trên mobile.
10. Map/chart phải responsive.
11. Không có horizontal overflow.
12. Các màu trạng thái phải nhất quán.
13. Các trang phải có navigation thật ở frontend.
14. Click `Xem` phải mở được chi tiết.
15. Click marker trên map phải mở popup/chi tiết.
16. Filter phải hoạt động với mock data.
17. Tạo component tái sử dụng thay vì copy UI.
18. Ưu tiên giao diện giống mockup: xanh lá, trắng, card bo góc, khoảng trắng thoáng.

Sau khi code xong hãy chạy project và kiểm tra:

```text
Desktop Dashboard
→ Danh sách phản ánh
→ Chi tiết phản ánh
→ Bản đồ
→ Thống kê
```

Sau đó kiểm tra lại ở:

```text
360px
390px
414px
768px
1024px
1440px
```

Mục tiêu cuối cùng là một **responsive municipal admin dashboard hoàn chỉnh cho SnapFix CT**, trong đó desktop và mobile đều có flow sử dụng rõ ràng.
