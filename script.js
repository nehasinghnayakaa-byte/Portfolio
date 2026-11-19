/* =========================================================
   Rohit Sharma | Model Portfolio
   Vanilla JavaScript, no libraries.
   Modules:
     1  Setup + helpers          7  Gallery filter
     2  Scroll progress/header   8  Tilt on gallery tiles
     3  Mobile nav + scroll spy  9  Lightbox
     4  Scroll reveal           10  Booking form
     5  Hero text + spotlight   11  Footer year
     6  Cursor + magnetic btns
   ========================================================= */
(function () {
  'use strict';

  /* ---------- CONFIG: contact targets (edit here only) ---------- */
  var CONTACT = {
    emailTo: 'sharmarohit98969@gmail.com',   // primary booking email
    emailCc: 'nehakv001@gmail.com',          // secondary booking email (cc'd)
    whatsapp: '917494907991'                 // country code + number, digits only
  };

  /* ---------- 1. Setup + helpers ---------- */
  document.documentElement.classList.add('js');   // enables the JS-only animation states in CSS

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 2. Scroll progress bar + sticky header state ---------- */
  var progress = $('#progress');
  var header = $('.site-header');
  var hero = $('#home');
  var heroPhotoInner = $('.hero-photo-inner');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    header.classList.toggle('is-scrolled', y > 24);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- 3. Mobile navigation + scroll spy ---------- */
  var navToggle = $('#navToggle');
  var navMenu = $('#navMenu');

  function setMenu(open) {
    navMenu.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  }
  navToggle.addEventListener('click', function () {
    setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
  });
  $$('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  var navLinks = $$('.nav-link');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) {
            l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 4. Scroll reveal ---------- */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var revealer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { revealer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- 5. Hero: letter reveal, spotlight, parallax ---------- */
  // Split each [data-split] word into animated letters (CSS handles the stagger via --i)
  var charIndex = 0;
  $$('[data-split]').forEach(function (word) {
    var text = word.textContent;
    word.textContent = '';
    text.split('').forEach(function (ch) {
      var span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch;
      span.style.setProperty('--i', charIndex++);
      word.appendChild(span);
    });
  });

  if (hero && !reducedMotion && finePointer) {
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = e.clientX - r.left;
      var y = e.clientY - r.top;
      // Spotlight follows the pointer
      hero.style.setProperty('--mx', x + 'px');
      hero.style.setProperty('--my', y + 'px');
      // Photo drifts slightly opposite to the pointer
      var nx = x / r.width - 0.5;
      var ny = y / r.height - 0.5;
      if (heroPhotoInner) {
        heroPhotoInner.style.setProperty('--px', (nx * -22).toFixed(1) + 'px');
        heroPhotoInner.style.setProperty('--py', (ny * -22).toFixed(1) + 'px');
      }
    });
    hero.addEventListener('mouseleave', function () {
      if (heroPhotoInner) {
        heroPhotoInner.style.setProperty('--px', '0px');
        heroPhotoInner.style.setProperty('--py', '0px');
      }
    });
  }

  /* ---------- 6. Custom cursor + magnetic buttons (desktop only) ---------- */
  var cursor = $('#cursor');

  if (cursor && finePointer && !reducedMotion) {
    var cx = 0, cy = 0, tx = 0, ty = 0;

    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add('is-on');
    });
    document.addEventListener('mouseleave', function () { cursor.classList.remove('is-on'); });

    // Smooth follow loop
    (function loop() {
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      cursor.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      requestAnimationFrame(loop);
    })();

    // Hover states: links/buttons grow, gallery tiles show "View"
    document.addEventListener('mouseover', function (e) {
      var t = e.target;
      cursor.classList.toggle('is-view', !!t.closest('.tile-btn'));
      cursor.classList.toggle('is-link', !t.closest('.tile-btn') && !!t.closest('a, button, input, textarea, label'));
    });

    // Magnetic buttons: pull slightly toward the pointer
    $$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.35;
        el.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- 7. Portfolio filter ---------- */
  var gallery = $('#gallery');
  var filterBtns = $$('.filter');
  var tiles = $$('.tile');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = btn.dataset.filter;

      filterBtns.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });

      // The large "feature" tile only applies while showing everything
      gallery.classList.toggle('is-filtered', cat !== 'all');

      tiles.forEach(function (tile) {
        var show = cat === 'all' || tile.dataset.category === cat;
        tile.hidden = !show;
        tile.classList.remove('pop');
        if (show) {
          void tile.offsetWidth;          // restart the entrance animation
          tile.classList.add('pop');
        }
      });
    });
  });

  /* ---------- 8. Subtle 3D tilt on gallery tiles (desktop only) ---------- */
  if (finePointer && !reducedMotion) {
    $$('.tile-btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - 0.5;
        var ny = (e.clientY - r.top) / r.height - 0.5;
        btn.style.setProperty('--ry', (nx * 6).toFixed(2) + 'deg');
        btn.style.setProperty('--rx', (ny * -6).toFixed(2) + 'deg');
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.setProperty('--ry', '0deg');
        btn.style.setProperty('--rx', '0deg');
      });
    });
  }

  /* ---------- 9. Lightbox (pure JS) ---------- */
  var lightbox = $('#lightbox');
  var lbImg = $('#lbImg');
  var lbCaption = $('#lbCaption');
  var lbClose = $('#lbClose');
  var lbPrev = $('#lbPrev');
  var lbNext = $('#lbNext');

  var current = 0;            // index within the currently visible tiles
  var visibleButtons = [];    // tile buttons currently shown by the filter
  var lastFocus = null;       // element to return focus to on close

  function showImage(index) {
    if (!visibleButtons.length) return;
    current = (index + visibleButtons.length) % visibleButtons.length;
    var btn = visibleButtons[current];
    var img = $('img', btn);
    // data-full on the button (optional) points to a higher-resolution version
    lbImg.src = btn.dataset.full || img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = img.alt.replace(/^Placeholder:\s*/i, '') +
      '  ·  ' + (current + 1) + ' / ' + visibleButtons.length;
  }

  function openLightbox(btn) {
    visibleButtons = $$('.tile:not([hidden]) .tile-btn');
    lastFocus = btn;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    showImage(visibleButtons.indexOf(btn));
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lbImg.src = '';
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  $$('.tile-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { openLightbox(btn); });
  });
  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', function () { showImage(current - 1); });
  lbNext.addEventListener('click', function () { showImage(current + 1); });
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });

  // Keyboard: Esc, arrows, and a simple focus trap on Tab
  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') showImage(current - 1);
    else if (e.key === 'ArrowRight') showImage(current + 1);
    else if (e.key === 'Tab') {
      var focusables = [lbClose, lbPrev, lbNext];
      var idx = focusables.indexOf(document.activeElement);
      e.preventDefault();
      var next = e.shiftKey ? idx - 1 : idx + 1;
      focusables[(next + focusables.length) % focusables.length].focus();
    }
  });

  // Touch swipe
  var touchX = null;
  lightbox.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showImage(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* ---------- 10. Booking inquiry form ---------- */
  var form = $('#bookingForm');
  var statusEl = $('#formStatus');

  var rules = {
    name:    function (v) { return v.length >= 2 ? '' : 'Please enter your name.'; },
    company: function (v) { return v.length >= 2 ? '' : 'Please enter your brand or company.'; },
    email:   function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Please enter a valid email address.'; },
    message: function (v) { return v.length >= 10 ? '' : 'Please add a few details (at least 10 characters).'; }
  };

  function validateField(name) {
    var input = form.elements[name];
    var msg = rules[name](input.value.trim());
    input.closest('.field').classList.toggle('has-error', !!msg);
    $('[data-error-for="' + name + '"]', form).textContent = msg;
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }

  Object.keys(rules).forEach(function (name) {
    var input = form.elements[name];
    input.addEventListener('blur', function () { validateField(name); });
    input.addEventListener('input', function () {
      if (input.closest('.field').classList.contains('has-error')) validateField(name);
    });
  });

  function setStatus(text, type) {
    statusEl.textContent = text;
    statusEl.className = 'form-status' + (type ? ' is-' + type : '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Validate every field (no short-circuit so all errors show at once)
    var ok = Object.keys(rules).map(validateField).every(Boolean);
    if (!ok) {
      setStatus('Please fix the highlighted fields and try again.', 'error');
      var firstBad = $('.has-error input, .has-error textarea', form);
      if (firstBad) firstBad.focus();
      return;
    }

    var data = {
      name: form.elements.name.value.trim(),
      company: form.elements.company.value.trim(),
      email: form.elements.email.value.trim(),
      message: form.elements.message.value.trim()
    };

    // Which button was pressed? (falls back to email if unsupported)
    var channel = (e.submitter && e.submitter.value) || 'email';

    var body =
      'Hello Rohit,\n\n' + data.message + '\n\n' +
      '- ' + data.name + '\n' +
      'Brand / Company: ' + data.company + '\n' +
      'Reply to: ' + data.email;

    if (channel === 'whatsapp') {
      var waUrl = 'https://wa.me/' + CONTACT.whatsapp + '?text=' +
        encodeURIComponent('Booking inquiry for Rohit Sharma\n\n' + body);
      var win = window.open(waUrl, '_blank', 'noopener');
      if (!win) window.location.href = waUrl;   // popup-blocked fallback
      setStatus('Opening WhatsApp with your message ready to send…', 'success');
    } else {
      var subject = 'Booking Inquiry: ' + data.company + ' (' + data.name + ')';
      window.location.href = 'mailto:' + CONTACT.emailTo +
        '?cc=' + encodeURIComponent(CONTACT.emailCc) +
        '&subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
      setStatus('Opening your email app with the message prefilled. Press send there to complete your inquiry.', 'success');
    }
  });

  /* ---------- 11. Footer year ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
