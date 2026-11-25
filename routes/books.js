const express = require('express');
const router = express.Router();
const { getDB } = require('../database');

// GET /books/:id - Chi tiết sách
router.get('/:id', (req, res) => {
  const db = getDB();
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);

  if (!book) {
    return res.status(404).render('404', { title: 'Không tìm thấy sách' });
  }

  // Tăng lượt xem
  db.prepare('UPDATE books SET views = views + 1 WHERE id = ?').run(book.id);

  const comments = db.prepare(
    'SELECT * FROM comments WHERE book_id = ? ORDER BY created_at DESC'
  ).all(book.id);

  const avgRating = comments.length > 0
    ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
    : null;

  res.render('book-detail', {
    title: `${book.title} - Thư Viện Sách`,
    book,
    comments,
    avgRating,
    success: null,
    error: null
  });
});

// POST /books/:id/comment - Gửi bình luận
router.post('/:id/comment', (req, res) => {
  const db = getDB();
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);

  if (!book) {
    return res.status(404).render('404', { title: 'Không tìm thấy sách' });
  }

  const { name, email, rating, content } = req.body;

  if (!name || !email || !rating || !content) {
    const comments = db.prepare('SELECT * FROM comments WHERE book_id = ? ORDER BY created_at DESC').all(book.id);
    const avgRating = comments.length > 0
      ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
      : null;
    return res.render('book-detail', {
      title: `${book.title} - Thư Viện Sách`,
      book,
      comments,
      avgRating,
      success: null,
      error: 'Vui lòng điền đầy đủ thông tin bình luận!'
    });
  }

  const ratingNum = parseInt(rating);
  if (ratingNum < 1 || ratingNum > 5) {
    const comments = db.prepare('SELECT * FROM comments WHERE book_id = ? ORDER BY created_at DESC').all(book.id);
    const avgRating = comments.length > 0
      ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
      : null;
    return res.render('book-detail', {
      title: `${book.title} - Thư Viện Sách`,
      book,
      comments,
      avgRating,
      success: null,
      error: 'Điểm đánh giá phải từ 1 đến 5!'
    });
  }

  db.prepare(`
    INSERT INTO comments (book_id, name, email, rating, content) VALUES (?, ?, ?, ?, ?)
  `).run(book.id, name.trim(), email.trim(), ratingNum, content.trim());

  const comments = db.prepare('SELECT * FROM comments WHERE book_id = ? ORDER BY created_at DESC').all(book.id);
  const avgRating = comments.length > 0
    ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1)
    : null;

  res.render('book-detail', {
    title: `${book.title} - Thư Viện Sách`,
    book,
    comments,
    avgRating,
    success: 'Bình luận của bạn đã được gửi thành công!',
    error: null
  });
});

module.exports = router;
