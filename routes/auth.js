const express = require('express');
const router = express.Router();
const { getDB } = require('../database');

// GET /auth/login
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect(req.session.user.role === 'admin' ? '/admin' : '/');
  }
  res.render('login', {
    title: 'Đăng Nhập - Thư Viện Sách',
    error: null
  });
});

// POST /auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render('login', {
      title: 'Đăng Nhập - Thư Viện Sách',
      error: 'Vui lòng nhập đầy đủ thông tin!'
    });
  }

  const db = getDB();
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username.trim(), password);

  if (!user) {
    return res.render('login', {
      title: 'Đăng Nhập - Thư Viện Sách',
      error: 'Tên đăng nhập hoặc mật khẩu không đúng!'
    });
  }

  req.session.user = {
    id: user.id,
    username: user.username,
    role: user.role
  };

  const returnTo = req.session.returnTo || (user.role === 'admin' ? '/admin' : '/');
  delete req.session.returnTo;
  res.redirect(returnTo);
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.redirect('/auth/login');
  });
});

// GET /auth/logout (hỗ trợ cả GET)
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.redirect('/auth/login');
  });
});

module.exports = router;
