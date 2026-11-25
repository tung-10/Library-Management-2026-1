const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDB } = require('../database');
const { requireAdmin } = require('../middleware/auth');

// Cấu hình multer upload ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'book-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)!'));
    }
  }
});

// Áp dụng middleware admin cho tất cả routes
router.use(requireAdmin);

// GET /admin - Dashboard
router.get('/', (req, res) => {
  const db = getDB();
  const stats = {
    totalViews: db.prepare('SELECT views FROM site_stats WHERE id = 1').get()?.views || 0,
    totalBooks: db.prepare('SELECT COUNT(*) as cnt FROM books').get().cnt,
    totalComments: db.prepare('SELECT COUNT(*) as cnt FROM comments').get().cnt,
    totalContacts: db.prepare('SELECT COUNT(*) as cnt FROM contacts').get().cnt
  };
  const books = db.prepare('SELECT * FROM books ORDER BY created_at DESC').all();
  const comments = db.prepare(`
    SELECT c.*, b.title as book_title 
    FROM comments c 
    JOIN books b ON c.book_id = b.id 
    ORDER BY c.created_at DESC
  `).all();
  const contacts = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();

  res.render('admin/dashboard', {
    title: 'Admin Dashboard - Thư Viện Sách',
    stats,
    books,
    comments,
    contacts
  });
});

// GET /admin/books/:id/edit - Form chỉnh sửa sách
router.get('/books/:id/edit', (req, res) => {
  const db = getDB();
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  if (!book) return res.redirect('/admin');

  res.render('admin/edit-book', {
    title: `Chỉnh sửa: ${book.title} - Admin`,
    book,
    error: null,
    success: null
  });
});

// POST /admin/books/:id/edit - Cập nhật sách
router.post('/books/:id/edit', upload.single('cover_image'), (req, res) => {
  const db = getDB();
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  if (!book) return res.redirect('/admin');

  const { title, author, genre, publisher, description, quantity } = req.body;

  if (!title || !author || !genre || !publisher) {
    return res.render('admin/edit-book', {
      title: `Chỉnh sửa: ${book.title} - Admin`,
      book,
      error: 'Vui lòng điền đầy đủ các trường bắt buộc!',
      success: null
    });
  }

  let coverImage = book.cover_image;
  if (req.file) {
    coverImage = '/uploads/' + req.file.filename;
  }

  db.prepare(`
    UPDATE books SET title=?, author=?, genre=?, publisher=?, description=?, cover_image=?, quantity=?
    WHERE id=?
  `).run(
    title.trim(),
    author.trim(),
    genre.trim(),
    publisher.trim(),
    description?.trim() || '',
    coverImage,
    parseInt(quantity) || 1,
    book.id
  );

  const updatedBook = db.prepare('SELECT * FROM books WHERE id = ?').get(book.id);
  res.render('admin/edit-book', {
    title: `Chỉnh sửa: ${updatedBook.title} - Admin`,
    book: updatedBook,
    error: null,
    success: 'Cập nhật thông tin sách thành công!'
  });
});

// POST /admin/books - Thêm sách mới
router.post('/books/add', upload.single('cover_image'), (req, res) => {
  const db = getDB();
  const { title, author, genre, publisher, description, quantity } = req.body;

  if (!title || !author || !genre || !publisher) {
    return res.redirect('/admin?error=missing_fields');
  }

  let coverImage = '/images/books/default.jpg';
  if (req.file) {
    coverImage = '/uploads/' + req.file.filename;
  }

  db.prepare(`
    INSERT INTO books (title, author, genre, publisher, description, cover_image, quantity)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    title.trim(),
    author.trim(),
    genre.trim(),
    publisher.trim(),
    description?.trim() || '',
    coverImage,
    parseInt(quantity) || 1
  );

  res.redirect('/admin?success=book_added');
});

// POST /admin/books/:id/delete - Xóa sách
router.post('/books/:id/delete', (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
  res.redirect('/admin?success=book_deleted');
});

// POST /admin/comments/:id/delete - Xóa bình luận
router.post('/comments/:id/delete', (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
  res.redirect('/admin?success=comment_deleted#comments');
});

// POST /admin/contacts/:id/delete - Xóa liên hệ
router.post('/contacts/:id/delete', (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
  res.redirect('/admin?success=contact_deleted#contacts');
});

module.exports = router;
