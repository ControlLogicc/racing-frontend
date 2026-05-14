🏇 Horse Racing Management System - Frontend
Dự án Frontend được xây dựng bằng ReactJS và Bootstrap 5, tập trung vào giao diện trực quan, dễ sử dụng cho các đối tượng: Admin, Chủ ngựa, Nài ngựa và Khán giả.

* Tech Stack
Framework: ReactJS (Vite)

UI Framework: Bootstrap 5

React Components: React-Bootstrap (Khuyên dùng để code sạch hơn)

Iconography: Font Awesome / Bootstrap Icons

HTTP Client: Axios (kết nối với Java Backend)

* Hướng dẫn thiết lập (Setup)
1. Cài đặt môi trường
Đảm bảo máy đã cài đặt Node.js (phiên bản 18 trở lên).

Bash
# Clone dự án
git clone https://github.com/ControlLogicc/racing-frontend.git

# Di chuyển vào thư mục dự án
cd racing-frontend

# Cài đặt các thư viện (React-Bootstrap & Bootstrap)
npm install react-bootstrap bootstrap
2. Import Bootstrap vào dự án
Mở file src/main.jsx hoặc src/App.jsx và thêm dòng này vào đầu file:

JavaScript
import 'bootstrap/dist/css/bootstrap.min.css';
3. Chạy dự án ở chế độ Development
Bash
npm run dev
* Cấu trúc thư mục (Project Structure) -- Lưu ý: đây chỉ là mẫu template để tham khảo
Plaintext
src/
 ├── assets/          # Hình ảnh, custom CSS
 ├── components/      # Các component dùng chung
 │    ├── common/     # CustomButton, CustomModal, DataGrid...
 │    └── layout/     # Sidebar, Header (Navbar), Footer...
 ├── features/        # Các module chức năng lớn
 │    ├── dashboard/  # Thống kê tổng quan
 │    ├── horse-mgmt/ # Quản lý ngựa
 │    └── racing/     # Theo dõi cuộc đua & Đặt cược
 ├── services/        # Các file gọi API (Axios instance)
 ├── App.jsx          # Cấu trúc routing chính
 └── main.jsx         # Điểm khởi đầu của ứng dụng
* Quy định code (Coding Conventions)
Để Leader review code nhanh hơn, anh em tuân thủ:

Đặt tên:

Component: PascalCase (VD: RaceTable.jsx)

Folder: kebab-case (VD: user-profile)

Layout & Grid: Luôn sử dụng hệ thống Grid (Container, Row, Col) của Bootstrap để đảm bảo giao diện responsive trên mọi thiết bị.

Git Flow:

Tạo nhánh mới: feature/ten-use-case.

Tag Leader vào duyệt Pull Request trước khi Merge.

* Thành viên thực hiện
Lê Hoàng Quốc Bảo: UI/UX Design & Frontend Developer.

Đặng Đình Danh: Frontend Architect & Logic Developer.

Tạ Vũ Hảo (Leader): Reviewer
