# 📚 Hệ Thống Quản Lý Thư Viện Sách

> Website quản lý thư viện sách sử dụng **Node.js + Express + EJS + SQLite**

---

## 🚀 Khởi Chạy Nhanh

```bash
cd "c:\Users\NewUser\Downloads\LTW\Project"
node app.js
```

Truy cập: **http://localhost:3000**

---

## 👤 Tài Khoản Mẫu

| Vai trò | Username | Password | Trang sau đăng nhập |
|---------|----------|----------|---------------------|
| **Admin** | `admin` | `1` | http://localhost:3000/admin |
| **User** | `user1` | `1` | http://localhost:3000 |

---

## 🗂️ Cấu Trúc Project

```
Project/
├── app.js                    ← Entry point (Express server)
├── database.js               ← SQLite setup + seed data 8 sách
├── middleware/
│   └── auth.js               ← requireLogin, requireAdmin
├── routes/
│   ├── index.js              ← GET / (Trang chủ)
│   ├── auth.js               ← GET/POST /auth/login, /auth/logout
│   ├── books.js              ← GET /books/:id, POST /books/:id/comment
│   ├── about.js              ← GET/POST /about
│   ├── admin.js              ← GET/POST /admin/** (CRUD sách, bình luận)
│   └── api.js                ← REST API endpoints
├── views/
│   ├── layout/
│   │   ├── header.ejs        ← Navbar responsive
│   │   └── footer.ejs        ← Footer 4 cột
│   ├── index.ejs             ← Trang chủ + popup quảng cáo
│   ├── login.ejs             ← Trang đăng nhập 2 cột
│   ├── book-detail.ejs       ← Chi tiết sách + bình luận + đánh giá sao
│   ├── about.ejs             ← Giới thiệu + form liên hệ
│   ├── 404.ejs               ← Trang 404
│   ├── error.ejs             ← Trang lỗi server
│   └── admin/
│       ├── dashboard.ejs     ← Admin dashboard (sidebar + 4 sections)
│       └── edit-book.ejs     ← Form chỉnh sửa sách + preview ảnh
├── public/
│   ├── css/style.css         ← CSS thuần (màu #1B365D, responsive)
│   ├── js/main.js            ← Menu toggle, popup 60s, filter, star rating
│   └── images/books/
│       └── default.jpg       ← Ảnh placeholder SVG
├── uploads/                  ← Ảnh bìa upload từ admin
└── library.db                ← SQLite database (tự tạo lần đầu)
```

---

## ✅ Chức Năng Đã Triển Khai

### Website (6 chức năng)

#### 1. Đăng nhập / Đăng xuất
- Form nhập Username + Password
- Phân quyền tự động: Admin → `/admin`, User → `/`
- Session-based authentication
- Đăng xuất xóa session hoàn toàn

#### 2. Trang Chủ + Popup Quảng Cáo
- Hiển thị grid sách (ảnh bìa, tên, tác giả, thể loại, số lượng, lượt xem)
- Tìm kiếm realtime theo tên sách / tác giả
- Filter theo thể loại
- **Popup sau 60 giây**: tự động bật giới thiệu Top 3 sách nổi bật
- **Cookie lưu trạng thái**: đóng popup 1 lần → không hiện lại trong 1 ngày

#### 3. Trang Chi Tiết Sách (`/books/:id`)
- Hiển thị đầy đủ: tên, tác giả, thể loại, NXB, mô tả, ảnh bìa, số lượng
- Điểm đánh giá trung bình + hiển thị sao
- Form bình luận: Tên, Email, Điểm 1–5 sao, Nội dung
- Danh sách bình luận hiển thị công khai theo thời gian mới nhất

#### 4. Trang Giới Thiệu & Liên Hệ (`/about`)
- Thông tin thư viện, lịch sử, giờ hoạt động
- Quy định đọc sách và mượn sách
- Form liên hệ: Họ tên, Email, Tiêu đề, Nội dung → lưu DB + thông báo

#### 5. Admin Dashboard (`/admin`)
- **Bảo vệ route**: chỉ Admin mới truy cập được
- **Thống kê**: Tổng lượt xem, Tổng sách, Tổng bình luận, Tổng liên hệ
- **Quản lý sách**: Danh sách đầy đủ, nút Sửa / Xóa
- **Thêm sách mới**: Form với upload ảnh bìa (multer, 5MB)
- **Quản lý bình luận**: Xem toàn bộ + nút Xóa từng bình luận
- **Quản lý liên hệ**: Xem + xóa tin nhắn liên hệ

#### 6. Responsive Layout
- **Mobile (<800px)**: Menu hamburger dọc, danh sách sách 1 cột
- **Tablet (800–1200px)**: Menu ngang, sách 2–3 cột
- **Desktop (>1200px)**: Nội dung căn giữa, sách 3–4 cột

### REST API (Mobile App dùng chung DB)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/books` | Danh sách sách (hỗ trợ filter, search, pagination) |
| GET | `/api/books/:id` | Chi tiết sách + bình luận |
| POST | `/api/books/:id/comments` | Gửi bình luận mới |
| POST | `/api/contact` | Gửi liên hệ |
| POST | `/api/auth/login` | Đăng nhập (trả về session) |
| POST | `/api/auth/logout` | Đăng xuất |

---

## 🗄️ Database (SQLite)

**Bảng `users`**: id, username, password, role (admin/user)  
**Bảng `books`**: id, title, author, genre, publisher, description, cover_image, quantity, views  
**Bảng `comments`**: id, book_id, name, email, rating, content  
**Bảng `contacts`**: id, fullname, email, subject, message  
**Bảng `site_stats`**: id, views (tổng lượt truy cập website)

---

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "ejs": "^3.1.9",
  "express-session": "^1.17.3",
  "cookie-parser": "^1.4.6",
  "better-sqlite3": "^9.4.3",
  "multer": "^1.4.5-lts.1"
}
```

---

## 🖼️ Thêm Ảnh Bìa Sách

Có 3 cách thêm ảnh cho sách:

1. **Upload qua Admin**: Vào `/admin` → Chỉnh sửa sách → Upload ảnh mới
2. **Copy thủ công**: Đặt ảnh vào `public/images/books/` với tên tương ứng
3. **URL ảnh online**: Chỉnh `cover_image` trong database thành URL đầy đủ

---

## ⚙️ Thay Đổi Port

Mở `app.js` và sửa dòng:
```js
const PORT = 3000; // ← đổi thành port bạn muốn
```
