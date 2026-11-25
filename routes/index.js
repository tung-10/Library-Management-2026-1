const express = require('express');
const router = express.Router();
const { getDB } = require('../database');

// Trang chủ
router.get('/', (req, res) => {
  const db = getDB();
  const books = db.prepare('SELECT * FROM books ORDER BY views DESC').all();
  const featuredBooks = db.prepare('SELECT * FROM books ORDER BY views DESC LIMIT 3').all();
  res.render('index', {
    title: 'Thư Viện Sách - Trang Chủ',
    books,
    featuredBooks
  });
});

module.exports = router;
