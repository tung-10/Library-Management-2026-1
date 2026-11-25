const express = require('express');
const router = express.Router();
const { getDB } = require('../database');

// GET /about
router.get('/', (req, res) => {
  res.render('about', {
    title: 'Giới Thiệu & Liên Hệ - Thư Viện Sách',
    success: null,
    error: null
  });
});

// POST /about/contact - Gửi liên hệ
router.post('/contact', (req, res) => {
  const { fullname, email, subject, message } = req.body;

  if (!fullname || !email || !subject || !message) {
    return res.render('about', {
      title: 'Giới Thiệu & Liên Hệ - Thư Viện Sách',
      success: null,
      error: 'Vui lòng điền đầy đủ tất cả các trường!'
    });
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.render('about', {
      title: 'Giới Thiệu & Liên Hệ - Thư Viện Sách',
      success: null,
      error: 'Email không hợp lệ!'
    });
  }

  const db = getDB();
  db.prepare(`
    INSERT INTO contacts (fullname, email, subject, message) VALUES (?, ?, ?, ?)
  `).run(fullname.trim(), email.trim(), subject.trim(), message.trim());

  res.render('about', {
    title: 'Giới Thiệu & Liên Hệ - Thư Viện Sách',
    success: 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 24 giờ.',
    error: null
  });
});

module.exports = router;
