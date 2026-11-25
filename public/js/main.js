/* 
   MAIN JavaScript
   Features:
   - Menu toggle (mobile)
   - Popup quảng cáo (60s, cookie)
   - Book filter / search
   - Star rating
   - Password toggle
   - Smooth scroll
 */

document.addEventListener('DOMContentLoaded', function () {

  /* 1. Mobile Menu Toggle */
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      navLinks.classList.toggle('nav-open');
      const expanded = navLinks.classList.contains('nav-open');
      menuToggle.setAttribute('aria-expanded', expanded);
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('nav-open');
      }
    });

    // Close when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('nav-open'));
    });
  }

  /* 2. Popup Quảng Cáo (60 giây, cookie) */
  const adPopup = document.getElementById('adPopup');
  if (adPopup) {
    // Kiểm tra cookie
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    }

    function setCookie(name, value, days) {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    }

    // Chỉ hiện popup nếu chưa đóng
    if (!getCookie('popup_closed')) {
      const popupTimer = setTimeout(function () {
        adPopup.style.display = 'flex';
        // Trigger animation
        requestAnimationFrame(() => {
          adPopup.classList.add('popup-visible');
        });
      }, 60000); // 60 giây

      // Đóng popup
      function closePopup() {
        adPopup.style.display = 'none';
        setCookie('popup_closed', '1', 1); // 1 ngày
      }

      const closeBtn = document.getElementById('closePopup');
      if (closeBtn) closeBtn.addEventListener('click', closePopup);

      const popupLater = document.getElementById('popupLater');
      if (popupLater) popupLater.addEventListener('click', closePopup);

      const popupExplore = document.getElementById('popupExplore');
      if (popupExplore) {
        popupExplore.addEventListener('click', function (e) {
          closePopup();
        });
      }

      // Đóng khi click overlay
      adPopup.addEventListener('click', function (e) {
        if (e.target === adPopup) closePopup();
      });

      // Đóng khi nhấn Escape
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && adPopup.style.display !== 'none') closePopup();
      });
    }
  }

  /* 3. Book Filter & Search (Trang Chủ) */
  const searchInput = document.getElementById('searchInput');
  const genreFilter = document.getElementById('genreFilter');
  const booksGrid = document.getElementById('booksGrid');
  const noResults = document.getElementById('noResults');

  function filterBooks() {
    if (!booksGrid) return;
    const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const genre = genreFilter ? genreFilter.value : '';
    const cards = booksGrid.querySelectorAll('.book-card');
    let visible = 0;

    cards.forEach(card => {
      const title = card.getAttribute('data-title') || '';
      const author = card.getAttribute('data-author') || '';
      const cardGenre = card.getAttribute('data-genre') || '';

      const matchSearch = !q || title.includes(q) || author.includes(q);
      const matchGenre = !genre || cardGenre === genre;

      if (matchSearch && matchGenre) {
        card.style.display = '';
        visible++;
      } else {
        card.style.display = 'none';
      }
    });

    if (noResults) {
      noResults.style.display = visible === 0 ? 'block' : 'none';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterBooks);
  }

  if (genreFilter) {
    genreFilter.addEventListener('change', filterBooks);
  }

  /* 4. Password Toggle */
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function () {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      this.textContent = type === 'password' ? '👁️' : '🙈';
    });
  }

  /* 5. Auto-dismiss Alerts */
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    setTimeout(() => {
      alert.style.transition = 'opacity 0.5s ease';
      alert.style.opacity = '0';
      setTimeout(() => { alert.style.display = 'none'; }, 500);
    }, 5000);
  });

  /* 6. Smooth Scroll */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80; // height of navbar
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* 7. Sticky Navbar Shadow */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 10) {
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
      } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
      }
    });
  }

  /* 8. Form Validation Feedback */
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function (e) {
      const requiredFields = form.querySelectorAll('[required]');
      let valid = true;
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = 'var(--danger)';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });
    });
  });

  // Reset border on input
  document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('input', function () {
      if (this.value.trim()) {
        this.style.borderColor = '';
      }
    });
  });

  /* 9. Image Lazy Loading Fallback */
  document.querySelectorAll('img[onerror]').forEach(img => {
    img.addEventListener('error', function () {
      if (!this.src.includes('default.jpg')) {
        this.src = '/images/books/default.jpg';
      }
    });
  });

  /* 10. Confirm Dialogs (Enhanced) */
  document.querySelectorAll('[onsubmit*="confirm"]').forEach(form => {
    form.removeAttribute('onsubmit');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const confirmMsg = this.dataset.confirm || 'Bạn có chắc chắn muốn thực hiện thao tác này?';
      if (confirm(confirmMsg)) {
        this.submit();
      }
    });
  });

  console.log('Thư Viện Sách - Scripts đã khởi tạo thành công!');
});
