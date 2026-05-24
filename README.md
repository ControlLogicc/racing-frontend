# 🏇 Horse Racing Management System — Frontend

Phân hệ giao diện người dùng và quản trị hệ thống đua ngựa.  
Dự án được xây dựng trên nền tảng **ReactJS** và **Bootstrap 5**.

---

##  Tech Stack

| Thành phần | Công nghệ |
|---|---|
| Framework | ReactJS (Vite) |
| UI Library | [Bootstrap 5](https://getbootstrap.com/) & [React-Bootstrap](https://react-bootstrap.github.io/) |
| Icons | Font Awesome / Bootstrap Icons |
| HTTP Client | Axios |

---

##  Hướng dẫn cài đặt

### 1. Yêu cầu môi trường

- Node.js **>= 18.0**

### 2. Cài đặt thư viện

```bash
npm install
npm install react-bootstrap bootstrap
```

### 3. Cấu hình Bootstrap

Mở file `src/main.jsx` (hoặc `src/App.jsx`) và thêm dòng import sau vào **đầu file**:

```js
import 'bootstrap/dist/css/bootstrap.min.css';
```

### 4. Chạy dự án

```bash
npm run dev
```

---

##  Cấu trúc thư mục

```
src/
├── components/
│   ├── common/       # Các component dùng chung (Button, Table, Modal, Input)
│   └── layout/       # Các thành phần khung (Sidebar, Navbar, Footer)
├── features/         # Module theo chức năng (Quản lý ngựa, Đặt cược, Lịch đua)
└── services/         # Gọi API bằng Axios kết nối với Backend
```

---

##  Quy tắc chung (Convention)

### Đặt tên

| Loại | Quy tắc | Ví dụ |
|---|---|---|
| Component | `PascalCase` | `HorseCard.jsx`, `RaceResult.jsx` |
| Hàm & Biến | `camelCase` | `handleLogin`, `horseList` |

### Git Flow

-  **Tuyệt đối không** push trực tiếp lên `main` hoặc `develop`.
-  Tạo nhánh mới theo cú pháp: `feature/ten-tinh-nang`
-  Tạo **Pull Request (PR)** và chờ Leader review trước khi Merge.

---

##  Thành viên Frontend

| Tên | Vai trò |
|---|---|
| Tạ Vũ Hảo (Leader)| Devops |
| Lê Hoàng Quốc Bảo | UI/UX Design & Frontend Developer |
| Đặng Đình Danh | Frontend Architect & Logic |
