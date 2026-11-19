/* =========================================================
   Rohit Sharma | Model Portfolio, vanilla JS, no libraries.
   1 Helpers        5 Gallery filter + "Show more" + broken-image cleanup
   2 Scroll/header  6 Lightbox
   3 Mobile nav     7 Instagram embed (lazy)
   4 Scroll reveal  8 Booking form, 9 Footer year
   ========================================================= */
(function () {
  'use strict';

  /* ---------- CONFIG (edit here only) ---------- */
  var CONTACT = {
    emailTo: 'sharmarohit98969@gmail.com',
    emailCc: 'nehakv001@gmail.com',
    whatsapp: '917494907991'              // country code + number, digits only
  };

  // PASTE THE KESHKANTI REEL LINK HERE, e.g. 'https://www.instagram.com/reel/AbCdEfGh123/'
  var IG_REEL_URL = 'https://www.instagram.com/reel/REEL_ID/';
  var IG_PROFILE_URL = 'https://www.instagram.com/rohit_sharmadra/';

  var INITIAL_TILES = 8;                  // gallery tiles shown before "Show more"

  /* ---------- 1. Helpers ---------- */
  document.documentElement.classList.add('js');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- 2. Scroll progress + header state ---------- */
  var progress = $('#progress');
  var header = $('.header');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    header.classList.toggle('is-scrolled', y > 10);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- 3. Mobile nav + scroll spy ---------- */
  var navToggle = $('#navToggle');
  var navMenu = $('#navMenu');
  var navLinks = $$('.nav__link');

  function setMenu(open) {
    navMenu.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  }
  navToggle.addEventListener('click', function () {
    setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
  });
  navLinks.forEach(function (l) { l.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  if (hasIO) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          navLinks.forEach(function (l) {
            l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 4. Scroll reveal (with failsafe) ---------- */
  var revealEls = $$('.reveal');
  function showAll() { revealEls.forEach(function (el) { el.classList.add('is-visible'); }); }

  if (hasIO) {
    document.documentElement.classList.add('reveal-ready');
    var revealer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.05 });
    revealEls.forEach(function (el) { revealer.observe(el); });
    setTimeout(showAll, 2500);            // failsafe: nothing stays hidden
  }

  /* ---------- 5. Gallery filter + "Show more" ---------- */
  var filterBtns = $$('.filters__btn');
  var tiles = $$('.gallery__item');
  var moreWrap = $('.gallery__more');
  var moreBtn = $('#galleryMore');
  var activeFilter = 'all';
  var expanded = false;

  function renderGallery(animate) {
    var matches = tiles.filter(function (t) {
      return !t.dataset.broken && (activeFilter === 'all' || t.dataset.category === activeFilter);
    });
    tiles.forEach(function (t) { t.hidden = true; t.classList.remove('is-pop'); });

    matches.forEach(function (t, i) {
      var show = expanded || i < INITIAL_TILES;
      t.hidden = !show;
      if (show && animate) { void t.offsetWidth; t.classList.add('is-pop'); }
    });

    moreWrap.hidden = matches.length <= INITIAL_TILES;
    moreBtn.textContent = expanded ? 'Show less' : 'Show more';
    moreBtn.setAttribute('aria-expanded', String(expanded));
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeFilter = btn.dataset.filter;
      expanded = false;
      filterBtns.forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      renderGallery(true);
    });
  });
  moreBtn.addEventListener('click', function () { expanded = !expanded; renderGallery(true); });

  // If an image file is missing, drop its tile so no broken-image boxes show
  tiles.forEach(function (tile) {
    var img = $('img', tile);
    img.addEventListener('error', function () {
      tile.dataset.broken = '1';
      renderGallery(false);
    });
  });
  renderGallery(false);

  /* ---------- 6. Lightbox ---------- */
  var lightbox = $('#lightbox');
  var lbImg = $('#lbImg');
  var lbCaption = $('#lbCaption');
  var lbClose = $('#lbClose');
  var lbPrev = $('#lbPrev');
  var lbNext = $('#lbNext');
  var current = 0, visibleBtns = [], lastFocus = null;

  function showImage(i) {
    if (!visibleBtns.length) return;
    current = (i + visibleBtns.length) % visibleBtns.length;
    var img = $('img', visibleBtns[current]);
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = img.alt + '  ·  ' + (current + 1) + ' / ' + visibleBtns.length;
  }
  function openLightbox(btn) {
    visibleBtns = $$('.gallery__item:not([hidden]) .gallery__btn');
    lastFocus = btn;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    showImage(visibleBtns.indexOf(btn));
    lbClose.focus();
  }
  function closeLightbox() {
    lightbox.hidden = true;
    lbImg.removeAttribute('src');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  $$('.gallery__btn').forEach(function (b) { b.addEventListener('click', function () { openLightbox(b); }); });
  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', function () { showImage(current - 1); });
  lbNext.addEventListener('click', function () { showImage(current + 1); });
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });

  // Keyboard: Esc, arrows, focus trap on Tab
  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') showImage(current - 1);
    else if (e.key === 'ArrowRight') showImage(current + 1);
    else if (e.key === 'Tab') {
      var f = [lbClose, lbPrev, lbNext];
      var idx = f.indexOf(document.activeElement);
      e.preventDefault();
      f[((e.shiftKey ? idx - 1 : idx + 1) + f.length) % f.length].focus();
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

  /* ---------- 7. Instagram embed (built and loaded only when near the viewport) ---------- */
  var igWrap = $('#igWrap');

  function buildInstagram() {
    // No real reel link yet: show a clean fallback card instead of a broken embed
    if (IG_REEL_URL.indexOf('REEL_ID') !== -1) {
      igWrap.innerHTML =
        '<div class="ig-fallback"><p>The Keshkanti advertisement is on Instagram.</p>' +
        '<a class="btn btn--solid" href="' + IG_PROFILE_URL + '" target="_blank" rel="noopener">Watch on Instagram</a></div>';
      return;
    }
    var url = IG_REEL_URL.split('?')[0];
    igWrap.innerHTML =
      '<blockquote class="instagram-media" data-instgrm-permalink="' + url + '?utm_source=ig_embed&amp;utm_campaign=loading" ' +
      'data-instgrm-version="14" style="background:#fff;border:0;border-radius:6px;margin:0 auto;max-width:540px;min-width:280px;padding:0;width:100%;">' +
      '<a href="' + url + '" target="_blank" rel="noopener">Watch the Keshkanti advertisement on Instagram</a></blockquote>';

    if (window.instgrm && window.instgrm.Embeds) { window.instgrm.Embeds.process(); return; }
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.instagram.com/embed.js';
    s.onload = function () { if (window.instgrm) window.instgrm.Embeds.process(); };
    document.body.appendChild(s);
  }

  if (igWrap) {
    if (hasIO) {
      var igObs = new IntersectionObserver(function (entries, obs) {
        if (entries[0].isIntersecting) { buildInstagram(); obs.disconnect(); }
      }, { rootMargin: '300px 0px' });
      igObs.observe(igWrap);
    } else {
      buildInstagram();
    }
  }

  /* ---------- 8. Booking form ---------- */
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
    statusEl.className = 'form__status' + (type ? ' is-' + type : '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = Object.keys(rules).map(validateField).every(Boolean);
    if (!ok) {
      setStatus('Please fix the highlighted fields and try again.', 'error');
      var bad = $('.has-error input, .has-error textarea', form);
      if (bad) bad.focus();
      return;
    }

    var d = {
      name: form.elements.name.value.trim(),
      company: form.elements.company.value.trim(),
      email: form.elements.email.value.trim(),
      message: form.elements.message.value.trim()
    };
    var channel = (e.submitter && e.submitter.value) || 'email';
    var body = 'Hello Rohit,\n\n' + d.message + '\n\n- ' + d.name +
               '\nBrand / Company: ' + d.company + '\nReply to: ' + d.email;

    if (channel === 'whatsapp') {
      var url = 'https://wa.me/' + CONTACT.whatsapp + '?text=' +
                encodeURIComponent('Booking inquiry for Rohit Sharma\n\n' + body);
      var w = window.open(url, '_blank', 'noopener');
      if (!w) window.location.href = url;
      setStatus('Opening WhatsApp with your message ready to send…', 'success');
    } else {
      window.location.href = 'mailto:' + CONTACT.emailTo +
        '?cc=' + encodeURIComponent(CONTACT.emailCc) +
        '&subject=' + encodeURIComponent('Booking Inquiry: ' + d.company + ' (' + d.name + ')') +
        '&body=' + encodeURIComponent(body);
      setStatus('Opening your email app with the message prefilled. Press send there to complete your inquiry.', 'success');
    }
  });

  /* ---------- 9. Footer year ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
