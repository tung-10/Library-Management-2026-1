const express = require('express');
const router = express.Router();
const { getDB } = require('../database');

// GET /api/books - Danh sách sách
router.get('/books', (req, res) => {
  const db = getDB();
  const { genre, search, page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = 'SELECT id, title, author, genre, publisher, cover_image, quantity, views FROM books WHERE 1=1';
  const params = [];

  if (genre) {
    query += ' AND genre = ?';
    params.push(genre);
  }
  if (search) {
    query += ' AND (title LIKE ? OR author LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY views DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  const books = db.prepare(query).all(...params);
  const total = db.prepare('SELECT COUNT(*) as cnt FROM books').get().cnt;

  res.json({
    success: true,
    data: books,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  });
});

// GET /api/books/:id - Chi tiết sách + bình luận
router.get('/books/:id', (req, res) => {
  const db = getDB();
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);

  if (!book) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy sách!' });
  }

  const comments = db.prepare(
    'SELECT id, name, rating, content, created_at FROM comments WHERE book_id = ? ORDER BY created_at DESC'
  ).all(book.id);

  const avgRating = comments.length > 0
    ? parseFloat((comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1))
    : null;

  res.json({
    success: true,
    data: {
      ...book,
      comments,
      avgRating,
      commentCount: comments.length
    }
  });
});

// POST /api/books/:id/comments - Gửi bình luận
router.post('/books/:id/comments', (req, res) => {
  const db = getDB();
  const book = db.prepare('SELECT id FROM books WHERE id = ?').get(req.params.id);

  if (!book) {
    return res.status(404).json({ success: false, message: 'Không tìm thấy sách!' });
  }

  const { name, email, rating, content } = req.body;

  if (!name || !email || !rating || !content) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin!' });
  }

  const ratingNum = parseInt(rating);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ success: false, message: 'Điểm đánh giá phải từ 1 đến 5!' });
  }

  const result = db.prepare(`
    INSERT INTO comments (book_id, name, email, rating, content) VALUES (?, ?, ?, ?, ?)
  `).run(book.id, name.trim(), email.trim(), ratingNum, content.trim());

  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(result.lastInsertRowid);

  res.status(201).json({
    success: true,
    message: 'Bình luận đã được gửi thành công!',
    data: comment
  });
});

// POST /api/contact - Gửi liên hệ
router.post('/contact', (req, res) => {
  const { fullname, email, subject, message } = req.body;

  if (!fullname || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin!' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Email không hợp lệ!' });
  }

  const db = getDB();
  const result = db.prepare(`
    INSERT INTO contacts (fullname, email, subject, message) VALUES (?, ?, ?, ?)
  `).run(fullname.trim(), email.trim(), subject.trim(), message.trim());

  res.status(201).json({
    success: true,
    message: 'Liên hệ của bạn đã được gửi thành công!'
  });
});

// POST /api/auth/login - Đăng nhập
router.post('/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập username và password!' });
  }

  const db = getDB();
  const user = db.prepare('SELECT id, username, role FROM users WHERE username = ? AND password = ?').get(
    username.trim(),
    password
  );

  if (!user) {
    return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng!' });
  }

  req.session.user = { id: user.id, username: user.username, role: user.role };

  res.json({
    success: true,
    message: 'Đăng nhập thành công!',
    data: { id: user.id, username: user.username, role: user.role }
  });
});

// POST /api/auth/logout - Đăng xuất
router.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Lỗi khi đăng xuất!' });
    }
    res.json({ success: true, message: 'Đăng xuất thành công!' });
  });
});

module.exports = router;
