# 🏇 FRONTEND AI RULES — Horse Racing Management System

> **Mục đích:** File này là **luật duy nhất (single source of truth)** cho mọi AI / mọi người code frontend dự án này. Bất kỳ ai (hoặc AI nào) generate code đều **PHẢI đọc và tuân theo** file này để code ra đồng nhất.
>
> **Cách dùng:** Đặt file ở **root repo** với tên `CLAUDE.md` (hoặc copy sang `.github/copilot-instructions.md` / `.cursorrules`). Copilot sẽ tự quét; với Claude/Cursor thì reference file này trước khi nhờ gen code.
>
> **Nguyên tắc vàng:** Nếu một quyết định **CHƯA có** trong file này → **KHÔNG tự chọn**. Hỏi lại người dev, chốt xong thì **bổ sung vào file** rồi mới code. Không bao giờ "đoán" stack, cấu trúc, hay tên field.

---

## 🤖 AI OPERATING PROTOCOL — ĐỌC TRƯỚC TIÊN, MỖI LẦN

> Phần này dành cho AI (Copilot / Claude / Cursor / Gemini). **Mỗi khi nhận yêu cầu làm tính năng mới, BẮT BUỘC chạy đủ 4 bước dưới đây TRƯỚC khi viết dòng code đầu tiên.**

**Bạn (AI) đang đóng vai một senior frontend dev mới join dự án này.** Bạn không được code như thể đây là dự án trống. Trước khi build bất cứ thứ gì:

### Bước 1 — QUÉT (Scan) hiện trạng
Quét toàn bộ `src/` và xác định:
- Đã có những page/role nào trong `pages/<role>/`?
- Đã có service nào trong `services/`? Pattern CRUD đang viết thế nào?
- Đã có component dùng chung nào trong `components/common/` và `components/shared/`?
- Routing đã khai báo ở đâu (`routes/index.jsx`), `ProtectedRoute` dùng ra sao?
- AuthContext / useAuth đang expose gì?
- Tính năng cần làm có **liên quan / phụ thuộc** cái đã có không?

### Bước 2 — BÁO CÁO (Report) ngắn gọn
Trước khi code, in ra cho người dev một bản tóm tắt:
```
📋 ĐÃ CÓ SẴN (tái sử dụng được):
- ...
🆕 SẼ TẠO MỚI:
- file A → đặt ở thư mục nào
- file B → ...
🔗 PHỤ THUỘC / ẢNH HƯỞNG:
- sửa route X, thêm service Y...
⚠️ CHƯA RÕ, CẦN HỎI:
- (nếu có quyết định chưa nằm trong file này)
```

### Bước 3 — PLAN (Đề xuất kế hoạch)
Đưa ra thứ tự file sẽ tạo/sửa, **tái sử dụng tối đa** cái đã có (đừng viết lại `DataTable`, `Loading`, `Pagination` nếu đã tồn tại). Nếu có chỗ "CHƯA RÕ" ở bước 2 → **DỪNG LẠI HỎI**, không tự bịa.

### Bước 4 — CODE
Chỉ code sau khi plan rõ. Code phải:
- Đúng cấu trúc thư mục (Mục 2 & 3)
- Đúng stack (Mục 1) — không thêm lib lạ
- Đúng convention đặt tên (Mục 10)
- Có guard route nếu cần auth (Mục 5)
- Đi qua `services/`, không import axios trong component (Mục 6)
- Có đủ 3 trạng thái Loading / Empty / Error (Mục 14)
- Tôn trọng state machine nghiệp vụ (Mục 15)

> ❌ AI **KHÔNG được** code thẳng vào một feature lớn rồi mới giải thích. Luôn Scan → Report → Plan → Code.

---

## 0. DECISIONS (đã chốt — đổi thì sửa luôn vào đây)

| # | Quyết định | Đang chọn | Lý do |
|---|---|---|---|
| D1 | Betting / "Đặt cược" | ❌ KHÔNG (out-of-scope) | ERD không có bảng cược. Cần thì bổ sung DB trước, đừng để AI bịa schema. |
| D2 | Ngôn ngữ | **JavaScript (.jsx)** — KHÔNG TypeScript | Khớp `.jsx` trong README |
| D3 | Router | react-router-dom **v7** | Package đã upgrade lên v7.17.0; API `<Routes>`/`element` vẫn tương thích |
| D4 | Global state | **Context API** (chỉ cho Auth). Business data để local state từng page | Đủ cho đồ án; không thêm Redux/Zustand/React Query |
| D5 | Form | react-hook-form | Logic-only, không đụng UI Bootstrap |
| D6 | Icons | react-bootstrap-icons | Chốt 1 bộ |
| D7 | Toast/Alert | **Component `react-bootstrap` (Toast/Alert)** — KHÔNG thêm react-toastify | Giữ nguyên tắc "ưu tiên Bootstrap có sẵn" |
| D8 | Pagination param | `?page=1&pageSize=10` | Chốt 1 kiểu, AI không đoán (xem Mục 16) |
| D9 | Date/time hiển thị | `DD/MM/YYYY HH:mm` (giờ VN) | Có helper trong `utils/` (xem Mục 17) |
| D10 | Giai đoạn hiện tại | **Mock-data-first** (code UI tĩnh trước, ghép API sau) | Code song song với backend (xem Mục 18) |
| D11 | Workflow nghiệp vụ hiện tại | **Registration không cần duyệt; Race Entry tự tạo sau khi Jockey accept; Staff vận hành invite/entry/result/payout; Admin tạo cấu hình hệ thống** | Đây là workflow đã chốt mới nhất, AI phải ưu tiên hơn mọi flow cũ. |

> ⚠️ **Lưu ý về React Query:** Dự án **KHÔNG dùng** `@tanstack/react-query` ở giai đoạn này (mâu thuẫn D4 + Mục 12). Re-render được giải quyết bằng cách tách Context (chỉ Auth) + để business data ở local state từng page. Nếu sau này thật sự cần → phải sửa D4 và Mục 1 trước khi thêm.

---

## 1. TECH STACK (PINNED — không tự thêm/đổi)

| Thành phần | Công nghệ | Bắt buộc |
|---|---|---|
| Runtime | Node.js 20 LTS | ✅ |
| Framework | ReactJS + Vite | ✅ |
| Ngôn ngữ | JavaScript (`.jsx`, `.js`) — **KHÔNG TypeScript** | ✅ |
| UI | bootstrap 5 + react-bootstrap | ✅ |
| Icons | react-bootstrap-icons | ✅ |
| Routing | react-router-dom v7 | ✅ |
| HTTP | axios (qua instance tập trung) | ✅ |
| Form | react-hook-form | ✅ |
| State | React Context API (chỉ Auth) + local state | ✅ |
| Toast/Alert | react-bootstrap (Toast, Alert) | ✅ |

**CẤM:** Tailwind, Ant Design, MUI, styled-components, react-toastify, react-query, hay bất kỳ UI/state lib nào khác chưa có trong bảng này → gây xung đột giao diện với Bootstrap & lệch convention. CSS dùng class Bootstrap; CSS custom chỉ khi thật cần, để file `.css` cùng component.

Import Bootstrap CSS **một lần duy nhất** ở đầu `src/main.jsx`:
```js
import 'bootstrap/dist/css/bootstrap.min.css';
```

---

## 2. CẤU TRÚC THƯ MỤC

> **Mô hình: ROLE-DRIVEN.** Trang chia theo role trong `pages/<role>/`. Logic API gom vào `services/`. Component nghiệp vụ dùng chung nhiều role vào `components/shared/`.
>
> ❌ **KHÔNG thêm `features/`** — dự án theo role-driven, trộn `features/` vào sẽ thành 2 triết lý tổ chức song song → loạn.

```
src/
├── main.jsx                 # entry, import bootstrap css ở đây
├── App.jsx                  # gắn Router + AuthProvider
├── routes/
│   ├── index.jsx            # khai báo TOÀN BỘ route (có cả /forbidden, /not-found, path="*")
│   └── ProtectedRoute.jsx   # guard kiểm tra auth + role
├── layouts/                 # PublicLayout, DashboardLayout, Navbar, Sidebar, Footer
├── components/
│   ├── common/              # UI generic: Button, DataTable, Modal, Input,
│   │                        #   Loading, Pagination, EmptyState, ErrorState, Toaster
│   └── shared/              # component NGHIỆP VỤ dùng chung nhiều role
│                            #   (RegistrationForm, RegistrationTable, EntryTable, RaceResultTable...)
├── pages/                   # CHIA THEO ROLE — chữ thường, khớp giá trị role trong DB
│   ├── auth/                # LoginPage.jsx, RegisterPage.jsx
│   ├── admin/
│   ├── staff/
│   ├── referee/
│   ├── owner/
│   ├── jockey/
│   ├── spectator/
│   └── errors/              # NotFoundPage.jsx, ForbiddenPage.jsx
├── services/                # TẤT CẢ gọi API ở đây, KHÔNG gọi axios trong component
│   ├── api.js               # axios instance + interceptor
│   ├── authService.js
│   ├── horseService.js
│   └── <entity>Service.js
├── context/
│   └── AuthContext.jsx      # user hiện tại + token + login/logout
├── hooks/                   # hook dùng chung (useAuth, useDebounce...)
├── utils/                   # hàm thuần: formatters (date), validators
├── constants/
│   ├── roles.js             # ROLES + map role → trang chủ
│   ├── status.js            # các enum trạng thái nghiệp vụ (Mục 15)
│   └── index.js
├── mocks/                   # 🟡 GIAI ĐOẠN HIỆN TẠI: mock data tách riêng (Mục 18)
│   ├── mockHorses.js
│   └── ...
└── assets/                  # ảnh, logo
```

**Quy tắc đặt file (chống lệch):**
- Trang (page) **luôn** nằm trong `pages/<role>/`. Folder role viết **chữ thường**, đúng giá trị `USER.role`. ❌ KHÔNG có `pages/HorseOwner`.
- Component UI generic → `components/common/`. Component nghiệp vụ dùng ở **≥ 2 role** → `components/shared/` (viết 1 lần, các role import dùng chung — chống lặp).
- Mọi lời gọi API → qua `services/`. Component/hook **KHÔNG** import axios trực tiếp.
- Khung layout → `layouts/` (chỉ **2 shell**: PublicLayout + DashboardLayout; xem Mục 4).

---

## 3. MÀN HÌNH THEO ROLE (map từ ERD)

| Role (`pages/<role>/`) | Màn hình chính | Bảng ERD |
|---|---|---|
| auth | Login, Register | USER |
| admin | Quản lý user, gán role, khoá/mở tài khoản; tạo/quản lý Season, Meeting, Race, Condition, Prize | USER, STAFF, REFEREE, JOCKEY, SEASON, RACE_MEETING, RACE, RACE_CONDITION, PRIZE_STRUCTURES |
| staff | Staff dashboard; theo dõi Race Invitation; chỉnh deadline invitation; loại invitation/entry expired; confirm/edit Race Entry; xem referee review; edit/publish final result; xử lý payout/prize | RACE_INVITATION, RACE_ENTRY, RACE_RESULT, REFEREE_REPORT, PRIZE_STRUCTURES |
| referee | Review/pre-check; nhập kết quả/review race; viết báo cáo vi phạm | RACE_RESULT, REFEREE_REPORT, RACE_ENTRY |
| owner | Quản lý ngựa; đăng ký ngựa vào race; gửi lời mời jockey | HORSE, RACE_REGISTRATION, RACE_INVITATION |
| jockey | Xem & phản hồi lời mời; lịch đua của mình | RACE_INVITATION, RACE_ENTRY |
| spectator | Xem lịch đua, BXH, hồ sơ ngựa (read-only) | (đọc) |

Component dùng chung **≥ 2 role** → `components/shared/` (chống lặp ở luồng xuyên role): `InvitationTable`, `EntryTable`, `RaceResultTable`, `HorseProfileCard`, `RaceInfoCard`.

**Core workflow đã chốt — AI phải tôn trọng tuyệt đối:**
```
Admin tạo Season/Meeting/Race/Condition/Prize
→ Owner đăng ký ngựa vào Race
→ Owner gửi Race Invitation cho Jockey
→ Staff chỉnh deadline invitation nếu cần
→ Jockey ACCEPT/DECLINE invitation
→ Nếu Jockey ACCEPT: hệ thống tự tạo Race Entry
→ Staff confirm/edit/remove Race Entry
→ Referee review/pre-check/result/report
→ Staff edit final result nếu cần
→ Staff publish final result + xử lý payout/prize
```

**Điểm khác workflow cũ:**
- `RACE_REGISTRATION` **KHÔNG cần Staff duyệt**. AI không được tạo nút `Approve registration` / `Reject registration` cho Staff nữa.
- `RACE_INVITATION` không do Staff tạo. Staff chỉ xem thông tin Owner mời Jockey và chỉnh deadline.
- Hết deadline thì invitation chuyển `EXPIRED`; Staff loại expired khỏi race thủ công.
- `RACE_ENTRY` **tự động tạo sau khi Jockey accept**. Staff không tạo Entry từ registration approved như flow cũ.
- Admin, không phải Staff, tạo/quản lý Season, Meeting, Race, Condition, Prize, Account, Role/Permission.

Vì luồng này đi xuyên nhiều role, UI/logic chung phải ở `components/shared/` + `services/`, **KHÔNG copy-paste** vào từng `pages/<role>/`.

---

## 4. ROLES & PHÂN QUYỀN

`USER.role` là **GIÁ TRỊ ĐƠN** — 1 user có **đúng 1 role**. ❌ KHÔNG dùng mảng nhiều role.

`src/constants/roles.js`:
```js
export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  REFEREE: 'referee',
  OWNER: 'owner',
  JOCKEY: 'jockey',
  SPECTATOR: 'spectator',
};

// Trang chủ sau khi đăng nhập theo role
export const HOME_ROUTE_BY_ROLE = {
  [ROLES.ADMIN]: '/admin/users',
  [ROLES.STAFF]: '/staff',
  [ROLES.REFEREE]: '/referee/reports',
  [ROLES.OWNER]: '/owner/horses',
  [ROLES.JOCKEY]: '/jockey/invitations',
  [ROLES.SPECTATOR]: '/',
};
```

**Layout strategy (KHÔNG làm 6 layout riêng):**
- `PublicLayout` — spectator + khách: read-only (lịch đua, BXH, hồ sơ ngựa).
- `DashboardLayout` — admin/staff/referee/owner/jockey: chung khung Sidebar+Navbar, chỉ **lọc menu item theo role**.

**Profile:** chỉ staff/referee/jockey có bảng profile riêng. admin/owner/spectator chỉ dùng field trong USER. Owner nhận diện qua `HORSE.owner_id` — KHÔNG có bảng OWNER.


**Phân quyền đã chốt:**
- Admin: quản lý account/user/role/permission; tạo và quản lý Season, Meeting, Race, Condition, Prize.
- Staff: không quản lý user/role; không tạo cấu hình giải đấu chính. Staff vận hành race sau khi cấu hình đã có: invitation deadline, expired removal, entry confirmation/edit, result publishing, payout.
- Referee: review/pre-check/result/report; không publish final result và không payout.
- Owner: quản lý horse, đăng ký race, mời jockey.
- Jockey: nhận/từ chối lời mời và xem lịch đua.

---

## 5. ROUTING

Dùng `createBrowserRouter` hoặc `<Routes>` của react-router-dom **v7** (`element={<Page/>}`).

Mọi route cần đăng nhập → bọc bằng `ProtectedRoute`. **Phải khai báo đủ** route lỗi:
```jsx
<Route path="/forbidden" element={<ForbiddenPage />} />
<Route path="/not-found" element={<NotFoundPage />} />
<Route path="*" element={<NotFoundPage />} />
```

`ProtectedRoute.jsx`:
```jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }
  return <Outlet />;
}
```

---

## 6. SERVICES / GỌI API

**Luật:** Component **KHÔNG** import axios. Mọi request đi qua `services/`.

`src/services/api.js`:
```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // cấu hình trong .env — KHÔNG hardcode localhost
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

Mỗi entity 1 file `<entity>Service.js`, export object chứa hàm CRUD. **API URL dùng số nhiều (plural):** `/horses`, `/races`, `/meetings` — KHÔNG `/horse`.
```js
import api from './api';

export const horseService = {
  getAll: (params) => api.get('/horses', { params }).then((r) => r.data),
  getById: (id) => api.get(`/horses/${id}`).then((r) => r.data),
  create: (payload) => api.post('/horses', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/horses/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/horses/${id}`).then((r) => r.data),
};
```

---

## 7. STATE — AUTH CONTEXT

Auth state để trong `context/AuthContext.jsx`, expose qua hook `useAuth`. Token lưu `localStorage`. Business data (danh sách ngựa, race, filter, pagination...) **để local state trong page**, KHÔNG nhét vào Context (tránh re-render toàn app). Chưa dùng Redux/Zustand/React Query (sửa file này trước nếu muốn đổi).

---

## 8. FORM

- Dùng `react-hook-form` cho mọi form có **> 2 field**.
- UI vẫn dùng component `react-bootstrap` (`Form.Control`, `Form.Group`...), RHF chỉ lo logic/validate.
- Hiển thị lỗi validate bằng `<Form.Control.Feedback>` của Bootstrap.

---

## 9. COMPONENT CONVENTION

- 1 component / 1 file, **default export**.
- Mặc định: `export default function ComponentName() {}` (giữ nhất quán cả repo).
- **Ưu tiên component có sẵn của react-bootstrap** (Button, Table, Modal, Card, Form...) trước khi tự viết. Không viết lại cái Bootstrap đã có.
- Bảng dữ liệu lặp nhiều nơi → dùng `components/common/DataTable.jsx` chung.

---

## 10. QUY TẮC ĐẶT TÊN

| Loại | Quy tắc | Ví dụ |
|---|---|---|
| Component / Page | PascalCase | `HorseCard.jsx`, `LoginPage.jsx` |
| Hook | camelCase, prefix `use` | `useAuth.js`, `useDebounce.js` |
| Service | camelCase + `Service` | `horseService.js` |
| Context | PascalCase + `Context` | `AuthContext.jsx` |
| Util / hàm / biến | camelCase | `formatDate`, `horseList` |
| Hằng số | UPPER_SNAKE_CASE | `ROLES`, `HOME_ROUTE_BY_ROLE` |
| Folder | kebab-case hoặc 1 từ thường | `pages/owner/` |
| API URL | **plural, chữ thường** | `/horses`, `/race-meetings` |

---

## 11. GIT FLOW

- ❌ KHÔNG push thẳng lên `main` / `develop`.
- Nhánh mới: `feature/ten-tinh-nang`.
- Tạo Pull Request, chờ Leader review trước khi merge.

---

## 12. ❌ DO-NOT LIST

- KHÔNG thêm thư viện ngoài Mục 1 mà chưa cập nhật file này.
- Page nằm trong `pages/<role>/` (role chữ thường). KHÔNG folder role PascalCase, KHÔNG copy-paste màn hình xuyên role — dùng `components/shared/`.
- KHÔNG import axios trong component — luôn qua `services/`.
- KHÔNG dùng TypeScript.
- KHÔNG dùng Tailwind/AntD/MUI/styled-components/react-toastify/react-query.
- KHÔNG thiết kế role kiểu mảng nhiều quyền — 1 user = 1 role.
- KHÔNG cho Staff duyệt registration hoặc tạo Season/Meeting/Race/Condition/Prize nếu workflow hiện tại không yêu cầu.
- KHÔNG cho Staff tạo Race Invitation; invitation là do Owner gửi.
- KHÔNG cho Staff tạo Race Entry thủ công từ registration; entry tự tạo sau khi Jockey accept.
- KHÔNG cho Referee publish final result hoặc xử lý payout.
- KHÔNG bịa bảng DB không có trong ERD (vd bảng cược).
- KHÔNG dùng `localStorage` trừ token auth.
- KHÔNG tạo 6 layout riêng — chỉ Public + Dashboard.
- KHÔNG thêm `features/` folder.
- KHÔNG hardcode `VITE_API_BASE_URL` (vd `http://localhost:8080`) trong code — luôn đọc từ `.env`.

---

## 13. ENVIRONMENT (.env)

Tạo các file ở root:
```
.env                 # chung (commit .env.example, KHÔNG commit .env thật)
.env.development
.env.production
```
Biến (Vite bắt buộc prefix `VITE_`):
```
VITE_API_BASE_URL=
```
Đọc trong code bằng `import.meta.env.VITE_API_BASE_URL`. Thêm `.env*` vào `.gitignore` (giữ lại `.env.example`).

---

## 14. LOADING / EMPTY / ERROR CONVENTION

❌ KHÔNG viết `if (loading) return <div>Loading...</div>` rải rác mỗi page. Dùng 3 component chung trong `components/common/`:
- `Loading.jsx` — spinner (react-bootstrap `<Spinner>`)
- `EmptyState.jsx` — khi list rỗng
- `ErrorState.jsx` — khi gọi API lỗi

Pattern chuẩn trong mọi page có data:
```jsx
if (loading) return <Loading />;
if (error)   return <ErrorState onRetry={fetchData} />;
if (!data?.length) return <EmptyState message="Chưa có dữ liệu" />;
return <DataTable rows={data} />;
```
Báo thành công/lỗi hành động (create/update/delete) → dùng **Toast/Alert của react-bootstrap** (gom vào `components/common/Toaster.jsx`), KHÔNG dùng `alert()` trình duyệt.

---

## 15. BUSINESS STATE MACHINE (chốt nghiệp vụ — AI phải tôn trọng)

`src/constants/status.js` định nghĩa enum trạng thái. **AI KHÔNG được cho phép hành động sai trạng thái.**

```
RACE_REGISTRATION:  SUBMITTED | ACTIVE | CANCELLED
RACE_INVITATION:    SENT → ACCEPTED | DECLINED | EXPIRED | REMOVED
RACE_ENTRY:         AUTO_CREATED → PENDING_CONFIRMATION → CONFIRMED | REMOVED
RACE_RESULT:        DRAFT → REVIEWED_BY_REFEREE → FINAL_EDITED_BY_STAFF → PUBLISHED
RACE:               UPCOMING → ONGOING → COMPLETED
PAYOUT:             PENDING → PROCESSED | FAILED
```

Quy tắc bắt buộc:
- ❌ Staff **KHÔNG** approve/reject `RACE_REGISTRATION`. Registration không cần duyệt.
- ❌ Staff **KHÔNG** tạo Race Invitation. Invitation do Owner gửi cho Jockey.
- ✅ Staff **CHỈ** được chỉnh `deadline` của Race Invitation và loại invitation/entry đã `EXPIRED` khỏi race thủ công.
- ✅ Khi Jockey `ACCEPTED` invitation, hệ thống/API tự tạo `RACE_ENTRY` ở trạng thái `AUTO_CREATED` hoặc `PENDING_CONFIRMATION`.
- ❌ Staff **KHÔNG** tạo Entry từ registration approved như flow cũ.
- ✅ Staff được confirm/edit/remove Race Entry sau khi entry đã được tạo tự động.
- ❌ Referee **KHÔNG** publish final result và **KHÔNG** payout. Referee chỉ review/pre-check/result/report.
- ✅ Staff được edit final result sau referee review, publish final result, và xử lý payout/prize.
- ❌ Admin **KHÔNG** làm việc vận hành race như confirm entry/publish result/payout, trừ khi có yêu cầu riêng.
- ✅ Admin tạo/quản lý Season, Meeting, Race, Condition, Prize, Account, Role/Permission.
- UI phải **disable / ẩn** nút hành động khi chưa đủ điều kiện trạng thái.

> **✅ ĐÃ CHỐT:** Một `RACE_REGISTRATION` mời được **nhiều** jockey (`RACE_INVITATION`) — 1-n.
> UI owner: danh sách lời mời đã gửi cho 1 registration, có thể gửi thêm hoặc huỷ lời mời còn `SENT` nếu nghiệp vụ cho phép.
> UI jockey: danh sách invitation nhận được. Accept invitation sẽ áp dụng cho registration đó và tạo `RACE_ENTRY` tự động.

---

## 16. PAGINATION CONVENTION

- Backend pagination param thống nhất: **`?page=1&pageSize=10`** (page bắt đầu từ 1).
- Response giả định shape:
```json
{ "items": [...], "page": 1, "pageSize": 10, "total": 123 }
```
- Component phân trang dùng chung: `components/common/Pagination.jsx`.
- Các bảng cần phân trang: Horse, Race, User, Meeting, Registration...

> Nếu backend trả khác (`pageIndex`, `data`, `totalCount`...) → cập nhật lại mục này cho khớp **trước** khi code.

---

## 17. DATE / TIME CONVENTION

- Hiển thị: `DD/MM/YYYY HH:mm` (giờ VN). Helper trong `utils/formatDate.js`.
- KHÔNG format ngày rải rác mỗi component bằng tay → luôn gọi helper chung.
```js
// utils/formatDate.js
export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—';
```

---

## 18. 🟡 GIAI ĐOẠN HIỆN TẠI: MOCK-DATA-FIRST (code song song backend)

> Đang code **UI tĩnh trước để review giao diện**, ghép API thật sau. Mục tiêu: **bản cứng KHÔNG phải viết lại JSX** khi có API — chỉ đổi nguồn data.

**3 quy tắc bắt buộc cho giai đoạn này:**

1. **Data giả tách ra `src/mocks/`**, KHÔNG gõ thẳng vào JSX.
   ```js
   // src/mocks/mockHorses.js
   export const MOCK_HORSES = [
     { id: 1, name: 'Thần Mã', age: 5, ownerId: 10 },
     { id: 2, name: 'Phi Long', age: 4, ownerId: 11 },
   ];
   ```

2. **Render bằng `.map()`** (đúng shape như API thật), KHÔNG gõ tay từng dòng `<tr>`.

3. **Vẫn đi qua `services/`** — service tạm trả mock, sau chỉ sửa 1 dòng:
   ```js
   // services/horseService.js — giai đoạn mock
   import { MOCK_HORSES } from '../mocks/mockHorses';
   export const horseService = {
     getAll: () => Promise.resolve(MOCK_HORSES),       // 🟡 mock
     // getAll: (params) => api.get('/horses', { params }).then(r => r.data), // ✅ khi có API
   };
   ```

**Khi backend xong:** chỉ đổi service từ `Promise.resolve(MOCK)` → `api.get(...)`. Page **không động vào**.

**Lưu ý quan trọng:** Tên field trong mock nên hỏi backend chốt trước (`name` hay `horseName`? `ownerId` hay `owner_id`?). Chưa chốt được thì cứ tự đặt, sau find-replace — nhưng **bắt buộc** đã tách mock + dùng `.map()` thì sửa mới nhanh.

Giai đoạn mock cũng phải render thử **Loading / Empty / Error** (Mục 14) để review luôn, đừng để page lúc nào cũng có data rồi quên các state này.

---

## 19. ✅ CHECKLIST AI TỰ KIỂM TRƯỚC KHI XUẤT CODE

- [ ] Đã chạy **AI Operating Protocol** (Scan → Report → Plan → Code)?
- [ ] File đặt đúng thư mục theo Mục 2 & 3?
- [ ] Gọi API qua `services/`, không lỡ import axios trong component?
- [ ] Tên file/biến/URL đúng quy ước Mục 10?
- [ ] Route có guard (`ProtectedRoute` + `allowedRoles`) nếu cần auth?
- [ ] Chỉ dùng stack Mục 1, không thêm lib lạ?
- [ ] Có đủ Loading / Empty / Error (Mục 14)?
- [ ] Tôn trọng state machine nghiệp vụ mới nhất (Mục 15)?
- [ ] Không còn flow cũ `Staff duyệt registration` hoặc `Staff tạo entry từ approved registration`?
- [ ] Pagination dùng `?page=&pageSize=` (Mục 16)?
- [ ] Date format qua helper chung (Mục 17)?
- [ ] Nếu đang mock: data tách `src/mocks/`, render `.map()`, đi qua service (Mục 18)?
- [ ] Không đụng bảng/feature ngoài ERD (vd betting)?
- [ ] Gặp quyết định CHƯA có trong file này → đã DỪNG và HỎI thay vì tự đoán?
```