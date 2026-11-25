const Database = require('better-sqlite3');
const path = require('path');

let db;

function getDB() {
  if (!db) {
    db = new Database(path.join(__dirname, 'library.db'));
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDB() {
  const db = getDB();

  // Tạo bảng users
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tạo bảng books
  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      genre TEXT NOT NULL,
      publisher TEXT NOT NULL,
      description TEXT,
      cover_image TEXT DEFAULT '/images/books/default.jpg',
      quantity INTEGER DEFAULT 1,
      views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tạo bảng comments
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    )
  `);

  // Tạo bảng contacts
  db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullname TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tạo bảng site_stats
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_stats (
      id INTEGER PRIMARY KEY,
      views INTEGER DEFAULT 0
    )
  `);

  // Seed dữ liệu nếu chưa có
  const userCount = db.prepare('SELECT COUNT(*) as cnt FROM users').get();
  if (userCount.cnt === 0) {
    // Seed users
    db.prepare(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`).run('admin', '1', 'admin');
    db.prepare(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`).run('user1', '1', 'user');

    // Seed books
    const insertBook = db.prepare(`
      INSERT INTO books (title, author, genre, publisher, description, cover_image, quantity, views)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const books = [
      [
        'Đắc Nhân Tâm',
        'Dale Carnegie',
        'Kỹ năng sống',
        'NXB Tổng hợp TP.HCM',
        'Đắc Nhân Tâm (How to Win Friends and Influence People) của Dale Carnegie là quyển sách nổi tiếng nhất, bán chạy nhất và có tầm ảnh hưởng nhất của mọi thời đại. Tác phẩm đã được chuyển ngữ sang hầu hết các thứ tiếng trên thế giới và có mặt ở hàng trăm quốc gia. Đây là một trong số ít những cuốn sách thực sự thay đổi cuộc đời hàng triệu người.',
        '/images/books/dac-nhan-tam.jpg',
        15,
        320
      ],
      [
        'Nhà Giả Kim',
        'Paulo Coelho',
        'Tiểu thuyết',
        'NXB Hội Nhà Văn',
        'Nhà Giả Kim (The Alchemist) là câu chuyện về Santiago, một chú bé chăn cừu người Andalusia, người bắt đầu cuộc hành trình tìm kiếm kho báu thực sự của cuộc sống. Từ những đồng cỏ miền Nam Tây Ban Nha đến sa mạc Sahara huyền bí và hơn thế nữa, Santiago gặp gỡ những người thầy vĩ đại và học được những bài học về linh hồn vũ trụ.',
        '/images/books/nha-gia-kim.jpg',
        20,
        285
      ],
      [
        'Tôi Thấy Hoa Vàng Trên Cỏ Xanh',
        'Nguyễn Nhật Ánh',
        'Văn học Việt Nam',
        'NXB Trẻ',
        'Tôi Thấy Hoa Vàng Trên Cỏ Xanh là tác phẩm xuất sắc của nhà văn Nguyễn Nhật Ánh. Câu chuyện kể về tuổi thơ của Thiều và Tường – hai anh em sống ở làng quê miền Trung thơ mộng. Những trang văn trong trẻo, giàu cảm xúc khắc họa vẻ đẹp bình dị của đồng quê và tình người ấm áp.',
        '/images/books/hoa-vang-tren-co-xanh.jpg',
        12,
        198
      ],
      [
        'Sapiens: Lược Sử Loài Người',
        'Yuval Noah Harari',
        'Lịch sử',
        'NXB Tri Thức',
        'Sapiens đưa người đọc vào hành trình từ sự xuất hiện của loài người thông minh ở Châu Phi khoảng 70.000 năm trước, qua cuộc Cách mạng Nông nghiệp và sự nổi lên của đế chế, tôn giáo, khoa học – cho đến thế giới ngày nay và tương lai của loài người. Harari giải thích rằng Sapiens thống trị thế giới vì khả năng độc đáo của chúng ta trong việc tin vào những thứ chỉ tồn tại trong trí tưởng tượng.',
        '/images/books/sapiens.jpg',
        8,
        412
      ],
      [
        'Atomic Habits',
        'James Clear',
        'Kỹ năng sống',
        'NXB Lao Động',
        'Atomic Habits (Thói Quen Hiệu Quả) của James Clear là một cuốn sách thực hành đã được chứng minh về cách xây dựng thói quen tốt và phá vỡ những thói quen xấu. Clear sử dụng nghiên cứu từ sinh học, tâm lý học và khoa học thần kinh để giải thích tại sao thói quen lại quan trọng và cách thay đổi chúng.',
        '/images/books/atomic-habits.jpg',
        18,
        367
      ],
      [
        'Conan Toàn Tập - Tập 1',
        'Gosho Aoyama',
        'Truyện tranh',
        'NXB Kim Đồng',
        'Thám tử Conan (Detective Conan) là bộ truyện tranh trinh thám nổi tiếng của tác giả Gosho Aoyama. Câu chuyện xoay quanh thám tử nhí Conan Edogawa - thực chất là thám tử trung học tài năng Shinichi Kudo bị biến thành đứa trẻ sau khi uống phải thuốc lạ của tổ chức tội phạm bí ẩn.',
        '/images/books/conan.jpg',
        25,
        156
      ],
      [
        'Dế Mèn Phiêu Lưu Ký',
        'Tô Hoài',
        'Văn học thiếu nhi',
        'NXB Kim Đồng',
        'Dế Mèn Phiêu Lưu Ký là tác phẩm văn học nổi tiếng nhất của nhà văn Tô Hoài, viết năm 1941. Truyện kể về cuộc phiêu lưu của chú dế mèn từ khi còn nhỏ cho đến lúc trưởng thành. Qua đó, tác giả gửi gắm những bài học về sự khiêm tốn, lòng dũng cảm, tình bạn và ước mơ về một thế giới hòa bình.',
        '/images/books/de-men.jpg',
        30,
        89
      ],
      [
        'Người Giàu Có Nhất Thành Babylon',
        'George S. Clason',
        'Tài chính cá nhân',
        'NXB Tổng hợp TP.HCM',
        'Người Giàu Có Nhất Thành Babylon (The Richest Man in Babylon) là cuốn sách kinh điển về tài chính cá nhân. Thông qua những câu chuyện ngụ ngôn từ thành phố Babylon cổ đại, George S. Clason chia sẻ những nguyên tắc bất biến giúp bạn tích lũy tài sản, quản lý tiền bạc và đạt được tự do tài chính.',
        '/images/books/nguoi-giau-nhat-babylon.jpg',
        10,
        234
      ]
    ];

    for (const book of books) {
      insertBook.run(...book);
    }

    // Seed site_stats
    db.prepare('INSERT INTO site_stats (id, views) VALUES (1, 0)').run();

    // Seed một vài comment mẫu
    const insertComment = db.prepare(`
      INSERT INTO comments (book_id, name, email, rating, content) VALUES (?, ?, ?, ?, ?)
    `);
    insertComment.run(1, 'Nguyễn Văn A', 'nguyenvana@gmail.com', 5, 'Cuốn sách rất hay, thay đổi hoàn toàn cách tôi nhìn nhận về các mối quan hệ xã hội!');
    insertComment.run(1, 'Trần Thị B', 'tranthib@gmail.com', 4, 'Nội dung bổ ích, nhiều ví dụ thực tế. Rất đáng đọc!');
    insertComment.run(2, 'Lê Văn C', 'levanc@gmail.com', 5, 'Một trong những cuốn sách hay nhất tôi từng đọc. Paulo Coelho thực sự là thiên tài!');
    insertComment.run(4, 'Phạm Thị D', 'phamthid@gmail.com', 5, 'Sapiens mở ra cái nhìn hoàn toàn mới về lịch sử loài người. Tuyệt vời!');
    insertComment.run(5, 'Hoàng Văn E', 'hoangvane@gmail.com', 4, 'Atomic Habits giúp tôi xây dựng được nhiều thói quen tốt. Highly recommend!');

    console.log('✅ Database đã được khởi tạo và seed dữ liệu thành công!');
  } else {
    console.log('✅ Database đã sẵn sàng!');
  }
}

module.exports = { initDB, getDB };
