# 🚀 Hướng Dẫn Cài Đặt & Chạy Project

## ✅ Yêu Cầu Hệ Thống

| Công cụ | Phiên bản tối thiểu | Kiểm tra |
|---------|---------------------|----------|
| **Node.js** | v18+ (khuyến nghị v20) | `node --version` |
| **npm** | v8+ | `npm --version` |
| **Git** | Bất kỳ | `git --version` |

> 💡 Tải Node.js (đã bao gồm npm) tại: https://nodejs.org → Chọn bản **LTS**

---

## Bước 1 — Clone Repository

```bash
git clone <URL_REPOSITORY> thu-vien-sach
cd thu-vien-sach
```

---

## Bước 2 — Cài Đặt Thư Viện

```bash
npm install
```

Lệnh này sẽ tự động đọc `package.json` và tải các thư viện sau vào thư mục `node_modules/`:

| Thư viện | Công dụng |
|----------|-----------|
| `express` | Web framework |
| `ejs` | Template engine (render HTML) |
| `express-session` | Quản lý phiên đăng nhập |
| `cookie-parser` | Đọc/ghi cookie |
| `better-sqlite3` | Database SQLite (không cần cài thêm server) |
| `multer` | Upload file ảnh bìa sách |

## Bước 3 — Chạy Server

```bash
node app.js
```

> **Lần đầu chạy**: file `library.db` sẽ tự tạo kèm 8 sách mẫu, 2 tài khoản và 5 bình luận mẫu.

---

## 🌐 Bước 4 — Mở Trình Duyệt

Truy cập: **http://localhost:3000**

| Trang | URL |
|-------|-----|
| Trang chủ | http://localhost:3000 |
| Đăng nhập | http://localhost:3000/auth/login |
| Chi tiết sách | http://localhost:3000/books/1 |
| Giới thiệu | http://localhost:3000/about |
| Admin | http://localhost:3000/admin |

**Tài khoản mẫu:**

| Vai trò | Username | Password |
|---------|----------|----------|
| Admin | `admin` | `1` |
| User | `user1` | `1` |

---

## 🔄 Chạy Có Auto-Reload (Khuyến Nghị Khi Dev)

Cài `nodemon` một lần duy nhất (toàn cục):

```bash
npm install -g nodemon
```

Sau đó chạy:

```bash
nodemon app.js
```

> Server sẽ tự khởi động lại mỗi khi bạn lưu file — không cần tắt/bật thủ công.

---

## 🌿 Quy Trình Git Cho Nhóm 3 Người

### Lần đầu — Tạo branch của mình

```bash
# Người 1 (Backend)
git checkout -b feature/backend

# Người 2 (User UI)
git checkout -b feature/user-ui

# Người 3 (Admin UI + CSS)
git checkout -b feature/admin-ui
```

```bash
# Xem file nào đã thay đổi
git status

# Thêm file vào commit
git add .

# Tạo commit
git commit -m "Mô tả những gì bạn đã làm"

# Đẩy lên GitHub
git push origin feature/ten-branch-cua-ban
```

### Cập nhật code mới nhất từ nhóm

```bash
# Về nhánh main
git checkout main

# Lấy code mới nhất
git pull origin main

# Quay lại branch của mình và merge
git checkout feature/ten-branch-cua-ban
git merge main
```

---

## ❓ Xử Lý Lỗi Thường Gặp

### Lỗi: `Cannot find module 'express'`
```bash
# Chưa cài thư viện → chạy lại:
npm install
```

### Lỗi: `EADDRINUSE: address already in use :::3000`
```bash
# Port 3000 đang bị chiếm bởi tiến trình khác
# Windows — tìm và kill tiến trình:
netstat -ano | findstr :3000
taskkill /PID <số_PID> /F

# Hoặc đổi port trong app.js:
# const PORT = 3001;
```

### Lỗi: `Error: SQLITE_CANTOPEN`
```bash
# Xóa DB cũ và tạo lại
del library.db
node app.js
```

### Lỗi khi build `better-sqlite3` trên Windows
```bash
# Cài công cụ build của Windows:
npm install -g windows-build-tools
# Sau đó chạy lại:
npm install
```

---

## 📁 Cấu Trúc Thư Mục

```
thu-vien-sach/
├── app.js              ← Khởi động server tại đây
├── database.js         ← Cấu hình database
├── package.json        ← Danh sách thư viện
├── .gitignore          ← File/thư mục không commit Git
├── middleware/
├── routes/
├── views/
├── public/             ← CSS, JS, ảnh tĩnh
├── uploads/            ← Ảnh upload bởi Admin (không commit)
└── library.db          ← Database SQLite (không commit)
```

---
