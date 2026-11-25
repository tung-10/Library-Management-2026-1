const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const { initDB, getDB } = require('./database');

const app = express();
const PORT = 3000;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'thu-vien-sach-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Middleware: truyền user vào tất cả views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Middleware: đếm lượt xem (chỉ cho web pages)
app.use((req, res, next) => {
  if (
    req.method === 'GET' &&
    !req.path.startsWith('/api') &&
    !req.path.startsWith('/uploads') &&
    !req.path.startsWith('/css') &&
    !req.path.startsWith('/js') &&
    !req.path.startsWith('/images') &&
    !req.path.startsWith('/favicon')
  ) {
    try {
      const db = getDB();
      db.prepare('UPDATE site_stats SET views = views + 1 WHERE id = 1').run();
    } catch (e) {
      // Bỏ qua lỗi đếm view
    }
  }
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/books', require('./routes/books'));
app.use('/about', require('./routes/about'));
app.use('/admin', require('./routes/admin'));
app.use('/api', require('./routes/api'));

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: 'Trang không tồn tại' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'Lỗi server', error: err });
});

// Init DB rồi start server
initDB();
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  console.log(`Thư viện Sách - Hệ thống quản lý`);
  console.log(`Admin: admin/admin123 | User: user1/user123`);
});
