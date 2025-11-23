# 🏗️ Risk Management System - Hệ Thống Quản Lý Rủi Ro Xây Dựng

Một ứng dụng web **toàn chức năng** để quản lý rủi ro dự án xây dựng với đa người dùng, kiểm toán đầy đủ, cảnh báo thời gian thực, và báo cáo phân tích.

## ✨ Tính Năng Chính

### 1. 🔐 **Xác Thực Multi-User với Phân Quyền**
- **3 vai trò người dùng:**
  - `admin` - Toàn quyền (CRUD tất cả, xóa dự án)
  - `manager` - Quản lý dự án (tạo, sửa rủi ro, không thể xóa dự án)
  - `viewer` - Chỉ xem (read-only)
- **Demo Accounts:**
  ```
  Admin:    admin / admin123
  Manager:  manager / manager123
  Viewer:   viewer / viewer123
  ```
- Chuyển đổi vai trò dễ dàng (admin có thể thử các quyền khác nhau)
- Lưu trữ session trong localStorage

### 2. 📊 **CRUD Dự Án (Projects)**
- **Thông tin dự án:**
  - Tên, mô tả, địa điểm, trạng thái
  - Ngày bắt đầu/kết thúc, quản lý dự án, ngân sách
- **Tính năng:**
  - Tạo dự án mới
  - Chỉnh sửa thông tin
  - Xóa dự án (admin only)
  - Chọn dự án để xem rủi ro

### 3. ⚠️ **CRUD Rủi Ro (Risks) - Cấu Trúc WHAT-WHEN-HOW-SOLUTION**

**5 trường thông tin chính:**
| Trường | Ý Nghĩa | Ví Dụ |
|--------|---------|-------|
| **STT** | Số thứ tự | 1, 2, 3... |
| **WHAT** | Nội dung rủi ro là gì? | "Thiếu lao động để thi công" |
| **WHEN** | Khi nào xảy ra? | "Giai đoạn thi công chính (tháng 3-9)" |
| **HOW** | Nguyên nhân gây ra? | "Nhu cầu nhân công cao, thị trường khan hiếm" |
| **SOLUTION** | Giải pháp giảm thiểu? | "Ký hợp đồng dài hạn, cải thiện điều kiện ăn ở" |

**Thông tin bổ sung:**
- `severity` - Mức độ: low, medium, high, critical
- `probability` - Xác suất xảy ra (0-1)
- `impact` - Tác động (1-10)
- `riskScore` - Điểm rủi ro tính toán
- `status` - Trạng thái: active, monitored, resolved
- `createdAt` - Ngày tạo
- `createdBy` - Người tạo
- `lastUpdated` - Cập nhật lần cuối

**Tính năng:**
- Tạo rủi ro mới
- Chỉnh sửa chi tiết rủi ro
- Xóa rủi ro (ghi log)
- Xem trong 2 chế độ: bảng và thẻ chi tiết
- Xuất CSV để báo cáo

### 4. 📜 **Lịch Sử Kiểm Toán (Audit Log)**

Mỗi thay đổi được ghi lại với:
- **Ai:** Tên người dùng thực hiện
- **Cái gì:** Loại (create/update/delete) và tên entity
- **Khi nào:** Timestamp chính xác
- **Chi tiết:** Các trường bị thay đổi (old value → new value)
- **Dự án:** Dự án nào bị ảnh hưởng

**Ví dụ audit log:**
```
✏️ Cập nhật - Thiếu lao động
Bởi manager • Rủi ro
Thời gian: 23/11/2025 14:30:15

Chi tiết thay đổi:
- when: "Giai đoạn thi công sơ bộ" → "Giai đoạn thi công chính"
- solution: "..." → "Ký kết hợp đồng..."
```

### 5. 🔔 **Hệ Thống Thông Báo (Notifications)**

**Trong ứng dụng (In-app):**
- Bell icon ở header hiển thị số thông báo chưa đọc
- Panel thông báo với danh sách tất cả events
- Đánh dấu là "đã đọc" hoặc xóa từng thông báo
- Auto-refresh mỗi 3 giây

**Tích hợp bên ngoài (Mock):**
- Email notifications
- SMS notifications
- Telegram notifications
- (Hiện tại log to console, có thể tích hợp API thực)

**Kích hoạt thông báo:**
- ✅ Khi thêm rủi ro mới
- ✅ Khi cập nhật rủi ro
- ✅ Khi xóa rủi ro
- ✅ Dựa trên alert rules (threshold)

### 6. 📈 **Phân Tích & Báo Cáo (Analytics Dashboard)**

**Thẻ Metrics:**
- **Tổng rủi ro** - Số lượng tất cả rủi ro
- **Rủi ro nghiêm trọng** - Đếm critical + % tổng số
- **Điểm rủi ro TB** - Trung bình cộng của tất cả điểm
- **Tỉ lệ giải quyết** - % rủi ro đã resolved

**Biểu đồ Phân bố:**
- **Theo mức độ:** Critical / High / Medium / Low (% bars)
- **Theo trạng thái:** Active / Monitored / Resolved (% bars)

**Xu hướng 30 Ngày:**
- Biểu đồ cột thể hiện số rủi ro qua 30 ngày
- Chỉ số cao nhất, trung bình, điểm rủi ro TB
- Hover để xem chi tiết từng ngày

**Báo Cáo:**
- **CSV Export:** Tải tất cả dữ liệu rủi ro về Excel
  - STT, Tên, WHAT, WHEN, HOW, SOLUTION, Severity, Risk Score, Status
- **PDF Export:** Infrastructure sẵn sàng (có thể bật với jspdf)

### 7. 📱 **Giao Diện Người Dùng**

**3 Tab Chính:**

**Tab 1: Quản Lý Rủi Ro**
```
┌─────────────────────────────────────────────┐
│ Danh sách dự án        │ Bảng rủi ro + form │
│ - Dự án A (5 risk)     │ STT | Tên | WHAT...│
│ - Dự án B (1 risk)     │ 1   | ...│ ...    │
│                        │ Chi tiết từng rủi ro│
└─────────────────────────────────────────────┘
```

**Tab 2: Phân Tích & Báo Cáo**
```
┌─────────────────────────────────────────────┐
│ 4 thẻ metrics (Tổng/Critical/Avg/Rate)      │
│ 2 biểu đồ (Severity & Status distribution)  │
│ Biểu đồ xu hướng 30 ngày                     │
│ Tóm tắt và nút xuất CSV                     │
└─────────────────────────────────────────────┘
```

**Tab 3: Lịch Sử Thay Đổi**
```
┌─────────────────────────────────────────────┐
│ Filter: [Tất cả▼]                           │
│ ├─ ➕ Tạo mới - Rủi ro A (admin)            │
│ ├─ ✏️ Cập nhật - Rủi ro B (manager)         │
│ │  ▶ Chi tiết thay đổi                      │
│ └─ 🗑️ Xóa - Rủi ro C (admin)                │
└─────────────────────────────────────────────┘
```

## 🚀 Bắt Đầu Nhanh

### Cài Đặt

```bash
# Clone hoặc tải dự án
cd hlan-quanlyruiro-xaydung

# Cài đặt dependencies
npm install

# Chạy dev server
npm run dev

# Mở trình duyệt
# http://localhost:3000
```

### Đăng Nhập Demo

1. **Trang đăng nhập** sẽ hiển thị khi khởi động
2. Chọn một trong 3 demo accounts:
   - Admin (full access)
   - Manager (edit permissions)
   - Viewer (read-only)
3. Hoặc nhập thủ công: `admin / admin123`

### Khám Phá Tính Năng

**Với Admin Account:**
```
1. Chuyển sang Tab "Quản lý rủi ro"
2. Chọn "Dự án Xây dựng Cao ốc A"
3. Thêm rủi ro mới bằng nút "+ Thêm rủi ro"
4. Chỉnh sửa rủi ro bằng icon ✏️
5. Xem audit log ở Tab "Lịch sử thay đổi"
6. Xem analytics ở Tab "Phân tích & Báo cáo"
7. Nhấn bell icon để xem notifications
8. Dùng nút "Xuất CSV" để tải report
```

**Chuyển Sang Manager/Viewer Role:**
```
1. Nhấn nút "Admin" ở header → chọn "Manager" hoặc "Viewer"
2. Quan sát giao diện thay đổi (một số nút bị ẩn)
3. Manager: có thể tạo/sửa rủi ro nhưng không xóa dự án
4. Viewer: chỉ có thể xem, không có nút CRUD
```

## 📁 Cấu Trúc Thư Mục

```
hlan-quanlyruiro-xaydung/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main dashboard (tab system + demo data)
│   │   ├── layout.tsx            # Root layout + AuthProvider
│   │   └── globals.css           # Global styles
│   │
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   │       ├── User, UserRole
│   │       ├── Project
│   │       ├── Risk (5 fields)
│   │       ├── AuditLog
│   │       ├── AlertRule
│   │       └── AppNotification
│   │
│   ├── context/
│   │   └── AuthContext.tsx       # Multi-user auth + role switching
│   │
│   ├── services/
│   │   ├── AuditLogService.ts    # Audit log CRUD
│   │   ├── NotificationService.ts# In-app + mock external notifications
│   │   └── AnalyticsService.ts   # Metrics + trends + CSV export
│   │
│   └── components/
│       ├── LoginPage.tsx          # Login form + demo buttons
│       ├── ProjectList.tsx        # Project CRUD component
│       ├── RiskDashboard.tsx      # Risk CRUD + audit integration
│       ├── NotificationCenter.tsx # Bell icon + notification panel
│       ├── AuditLogViewer.tsx     # Audit history viewer
│       └── AnalyticsDashboard.tsx # Analytics + charts
│
├── public/
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── README.md (tệp này)
```

## 🗄️ Cấu Trúc Dữ Liệu

### Risk Object
```typescript
{
  id: 1,
  projectId: "1",
  stt: 1,                           // Số thứ tự
  name: "Thiếu lao động",           // Tên rủi ro
  what: "Không đủ nhân công...",    // WHAT
  when: "Giai đoạn thi công...",    // WHEN
  how: "Nhu cầu nhân công cao...",  // HOW
  solution: "Ký hợp đồng lâu dài...",// SOLUTION
  severity: "high",                 // low|medium|high|critical
  probability: 0.7,                 // 0-1
  impact: 8,                        // 1-10
  riskScore: 5.6,                   // probability * impact
  status: "active",                 // active|monitored|resolved
  createdAt: "2025-11-23T10:00:00Z",
  createdBy: "admin",
  lastUpdated: "2025-11-23T14:30:00Z"
}
```

### AuditLog Object
```typescript
{
  id: "audit_1234",
  projectId: "1",
  riskId: 1,
  userId: "1",
  username: "admin",
  action: "update",                 // create|update|delete
  entityType: "risk",               // risk|project
  entityName: "Thiếu lao động",
  changes: [
    {
      field: "when",
      oldValue: "Giai đoạn sơ bộ",
      newValue: "Giai đoạn chính"
    }
  ],
  timestamp: "2025-11-23T14:30:15Z"
}
```

### AppNotification Object
```typescript
{
  id: "notif_123",
  userId: "1",
  title: "Rủi ro mới được thêm",
  message: "admin vừa thêm rủi ro: Thiếu lao động",
  type: "info",                     // info|warning|alert|error
  read: false,
  riskId: 1,
  projectId: "1",
  timestamp: "2025-11-23T14:30:15Z"
}
```

## 💾 Lưu Trữ Dữ Liệu

**localStorage keys:**
- `currentUser` - User hiện tại (JSON)
- `projects` - Danh sách dự án (JSON array)
- `risks` - Danh sách rủi ro (JSON array)
- `selectedProject` - ID dự án được chọn
- `auditLogs` - Lịch sử kiểm toán (JSON array)
- `appNotifications` - Danh sách thông báo (JSON array)
- `alertRules` - Quy tắc cảnh báo (JSON array)

**Tất cả dữ liệu được lưu tự động khi thay đổi.**

## 🔧 Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
|-----------|-----------|
| **Framework** | Next.js 16.0.3 |
| **UI Library** | React 19.2.0 |
| **Type Safety** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Icons** | lucide-react |
| **Storage** | Browser localStorage |
| **State Mgmt** | React Context API |

## 📋 Demo Data

### Dự Án
```
1. Dự án Xây dựng Cao ốc A
   - Địa điểm: Quận Thanh Xuân, Hà Nội
   - Trạng thái: Active (đang thi công)
   - Ngân sách: 500 tỷ đồng
   - Rủi ro: 5 cái

2. Dự án Khu Công Nghiệp B
   - Địa điểm: Hưng Yên
   - Trạng thái: Planning (lập kế hoạch)
   - Ngân sách: 800 tỷ đồng
   - Rủi ro: 1 cái
```

### Rủi Ro Mẫu
| # | Tên | Severity | Status |
|---|-----|----------|--------|
| 1 | Thiếu lao động | 🔴 High | Active |
| 2 | Vật liệu giá cao | 🟡 Medium | Monitored |
| 3 | Sự cố an toàn | 🔴 Critical | Active |
| 4 | Vấn đề môi trường | 🟡 Medium | ✅ Resolved |
| 5 | Thiết kế không phù hợp | 🔴 High | Active |
| 6 | Điều kiện thời tiết | 🟡 Medium | Active |

## ✅ Kiểm Tra Danh Sách (Checklist)

- ✅ **Multi-user authentication** với 3 vai trò
- ✅ **CRUD Projects** - tạo/sửa/xóa dự án
- ✅ **CRUD Risks** - quản lý rủi ro với 5 trường WHAT-WHEN-HOW-SOLUTION
- ✅ **Audit History** - ghi lại mỗi thay đổi với user + timestamp
- ✅ **Notifications** - thông báo in-app + mock external channels
- ✅ **Analytics Dashboard** - metrics, charts, trends, CSV export
- ✅ **Role-Based Access Control** - admin/manager/viewer permissions
- ✅ **Demo Data** - 2 dự án + 6 rủi ro
- ✅ **Responsive Design** - mobile-friendly UI
- ✅ **Real-time Updates** - notification auto-refresh

## 🚀 Triển Khai (Deployment)

### Vercel (Recommended)

```bash
# 1. Đảm bảo code không có lỗi
npm run build
npm run lint

# 2. Push lên GitHub
git add .
git commit -m "Complete risk management system"
git push origin main

# 3. Deploy to Vercel
# https://vercel.com/new
# Chọn dự án, kết nối GitHub, deploy!
```

### Environment Variables
Không cần biến môi trường (dùng localStorage locally)

### Build Command
```bash
npm run build
```

### Start Command
```bash
npm run start
```

## 📝 Ghi Chú Phát Triển

### Mở Rộng Tính Năng

**Thêm PDF Export:**
```bash
npm install jspdf pdfkit
# Uncomment function in AnalyticsService.ts
```

**Kết Nối Backend API:**
```typescript
// Replace localStorage với API calls
// src/services/RiskService.ts
// POST /api/risks
// GET /api/risks?projectId=X
// PUT /api/risks/:id
// DELETE /api/risks/:id
```

**Tích Hợp Email/SMS/Telegram:**
```typescript
// NotificationService.ts
// sendEmail() → call SendGrid API
// sendSMS() → call Twilio API
// sendTelegram() → call Telegram Bot API
```

**Thêm Database:**
```typescript
// Thay thế localStorage bằng:
// - PostgreSQL + Prisma ORM
// - MongoDB + Mongoose
// - Firebase Firestore
```

## 🐛 Troubleshooting

**Q: Dữ liệu bị mất khi refresh?**
A: Kiểm tra browser console xem localStorage có lỗi không. Clear cache và thử lại.

**Q: Notification panel không cập nhật?**
A: Check component.tsx xem interval có bị clear không. DevTools → Application → localStorage

**Q: CSV file không tải?**
A: Kiểm tra browser allows downloads. Try khác browser nếu vẫn lỗi.

**Q: Audit log không ghi lại?**
A: Chắc chắn rằng user được authenticate. Check localStorage key 'currentUser'.

## 📞 Support

**Các tính năng cần debug:**
1. Mở DevTools (F12)
2. Tab Console - xem error messages
3. Tab Application → localStorage - kiểm tra dữ liệu
4. Tab Network - xem requests

## 📄 License

MIT License - Sử dụng tự do trong dự án của bạn.

---

**Phiên bản:** 1.0.0  
**Cập nhật lần cuối:** November 23, 2025  
**Status:** ✅ Production Ready