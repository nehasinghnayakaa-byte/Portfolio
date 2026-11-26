/* =========================================================
   Rohit Sharma | Model Portfolio
   Vanilla JavaScript, no libraries.

   1. Helpers
   2. Scroll/header
   3. Mobile navigation
   4. Scroll reveal
   5. Gallery filters
   6. Full-screen photo viewer
   7. Instagram
   8. Booking form
   9. Footer year
   ========================================================= */

(function () {

  'use strict';


  /* ---------- CONFIG ---------- */

  var CONTACT = {
    emailTo: 'sharmarohit98969@gmail.com',
    emailCc: 'nehakv001@gmail.com',
    whatsapp: '917494907991'
  };

  var IG_REEL_URL =
    'https://www.instagram.com/p/DdwKUHtk8yR/';

  var IG_PROFILE_URL =
    'https://www.instagram.com/rohit_sharmadra/';


  /* ---------- 1. Helpers ---------- */

  document.documentElement.classList.add('js');

  var $ = function (selector, context) {
    return (context || document).querySelector(selector);
  };

  var $$ = function (selector, context) {
    return Array.prototype.slice.call(
      (context || document).querySelectorAll(selector)
    );
  };

  var hasIO = 'IntersectionObserver' in window;


  /* =========================================================
     2. Scroll progress + header state
     ========================================================= */

  var progress = $('#progress');
  var header = $('.header');

  var ticking = false;

  function onScroll() {

    var y =
      window.scrollY ||
      window.pageYOffset;

    var max =
      document.documentElement.scrollHeight -
      window.innerHeight;

    if (progress) {

      progress.style.transform =
        'scaleX(' +
        (max > 0 ? y / max : 0) +
        ')';

    }

    if (header) {

      header.classList.toggle(
        'is-scrolled',
        y > 10
      );

    }

    ticking = false;
  }

  window.addEventListener(
    'scroll',
    function () {

      if (!ticking) {

        ticking = true;

        requestAnimationFrame(onScroll);

      }

    },
    {
      passive: true
    }
  );

  onScroll();


  /* =========================================================
     3. Mobile navigation + scroll spy
     ========================================================= */

  var navToggle = $('#navToggle');
  var navMenu = $('#navMenu');

  var navLinks = $$('.nav__link');


  function setMenu(open) {

    if (!navMenu || !navToggle) {
      return;
    }

    navMenu.classList.toggle(
      'is-open',
      open
    );

    navToggle.setAttribute(
      'aria-expanded',
      String(open)
    );

  }


  if (navToggle) {

    navToggle.addEventListener(
      'click',
      function () {

        setMenu(
          navToggle.getAttribute('aria-expanded') !== 'true'
        );

      }
    );

  }


  navLinks.forEach(function (link) {

    link.addEventListener(
      'click',
      function () {

        setMenu(false);

      }
    );

  });


  document.addEventListener(
    'keydown',
    function (e) {

      if (e.key === 'Escape') {

        setMenu(false);

      }

    }
  );


  /* ---------- Scroll spy ---------- */

  if (hasIO) {

    var spy =
      new IntersectionObserver(
        function (entries) {

          entries.forEach(
            function (entry) {

              if (entry.isIntersecting) {

                navLinks.forEach(
                  function (link) {

                    link.classList.toggle(
                      'is-active',
                      link.getAttribute('href') ===
                        '#' + entry.target.id
                    );

                  }
                );

              }

            }
          );

        },
        {
          rootMargin: '-45% 0px -50% 0px'
        }
      );

    $$('main section[id]').forEach(
      function (section) {

        spy.observe(section);

      }
    );

  }


  /* =========================================================
     4. Scroll reveal
     ========================================================= */

  var revealEls = $$('.reveal');


  function showAll() {

    revealEls.forEach(
      function (element) {

        element.classList.add('is-visible');

      }
    );

  }


  if (hasIO) {

    document.documentElement.classList.add(
      'reveal-ready'
    );

    var revealer =
      new IntersectionObserver(
        function (entries, observer) {

          entries.forEach(
            function (entry) {

              if (entry.isIntersecting) {

                entry.target.classList.add(
                  'is-visible'
                );

                observer.unobserve(
                  entry.target
                );

              }

            }
          );

        },
        {
          threshold: 0.05
        }
      );


    revealEls.forEach(
      function (element) {

        revealer.observe(element);

      }
    );


    /* Failsafe */
    setTimeout(
      showAll,
      2500
    );

  }


  /* =========================================================
     5. Gallery filter
     ========================================================= */

  var filterBtns =
    $$('.filters__btn');

  var tiles =
    $$('.gallery__item');

  var activeFilter =
    'all';


  function renderGallery(animate) {

    tiles.forEach(
      function (tile) {

        var match =
          !tile.dataset.broken &&
          (
            activeFilter === 'all' ||
            tile.dataset.category === activeFilter
          );


        tile.classList.remove(
          'is-pop'
        );

        tile.hidden =
          !match;


        if (match && animate) {

          void tile.offsetWidth;

          tile.classList.add(
            'is-pop'
          );

        }

      }
    );

  }


  /* ---------- Filter buttons ---------- */

  filterBtns.forEach(
    function (button) {

      button.addEventListener(
        'click',
        function () {

          activeFilter =
            button.dataset.filter;


          filterBtns.forEach(
            function (otherButton) {

              var active =
                otherButton === button;

              otherButton.classList.toggle(
                'is-active',
                active
              );

              otherButton.setAttribute(
                'aria-pressed',
                String(active)
              );

            }
          );


          renderGallery(true);

        }
      );

    }
  );


  /* ---------- Broken image cleanup ---------- */

  tiles.forEach(
    function (tile) {

      var image =
        $('img', tile);

      if (!image) {
        return;
      }


      image.addEventListener(
        'error',
        function () {

          tile.dataset.broken = '1';

          renderGallery(false);

        }
      );

    }
  );


  renderGallery(false);


  /* =========================================================
     6. Full-screen viewer / Lightbox
     ========================================================= */

  var lightbox =
    $('#lightbox');

  var lbImg =
    $('#lbImg');

  var lbCaption =
    $('#lbCaption');

  var lbClose =
    $('#lbClose');

  var lbPrev =
    $('#lbPrev');

  var lbNext =
    $('#lbNext');


  var current = 0;

  var visibleBtns = [];

  var lastFocus = null;


  /* ---------- Show image ---------- */

  function showImage(index) {

    if (!visibleBtns.length) {
      return;
    }


    current =
      (index + visibleBtns.length) %
      visibleBtns.length;


    var button =
      visibleBtns[current];

    var image =
      $('img', button);

    if (!image) {
      return;
    }


    /*
      Use the original image source.

      The gallery itself displays the complete photo
      using height:auto, so the lightbox receives the
      same complete image.
    */
    lbImg.src =
      image.src;


    lbImg.alt =
      image.alt;


    lbCaption.textContent =
      (current + 1) +
      ' / ' +
      visibleBtns.length;

  }


  /* ---------- Open lightbox ---------- */

  function openLightbox(button) {

    /*
      Only currently visible photos are included
      in previous / next navigation.
    */
    visibleBtns =
      $$('.gallery__item:not([hidden]) .gallery__btn');


    if (!visibleBtns.length) {
      return;
    }


    lastFocus =
      button;


    lightbox.hidden =
      false;


    document.body.style.overflow =
      'hidden';


    showImage(
      visibleBtns.indexOf(button)
    );


    lbClose.focus();

  }


  /* ---------- Close lightbox ---------- */

  function closeLightbox() {

    lightbox.hidden =
      true;


    lbImg.removeAttribute(
      'src'
    );


    document.body.style.overflow =
      '';


    if (lastFocus) {

      lastFocus.focus();

    }

  }


  /* ---------- Lightbox event handlers ---------- */

  if (
    lightbox &&
    lbImg &&
    lbCaption &&
    lbClose &&
    lbPrev &&
    lbNext
  ) {

    /* Open photo */
    $$('.gallery__btn').forEach(
      function (button) {

        button.addEventListener(
          'click',
          function () {

            openLightbox(
              button
            );

          }
        );

      }
    );


    /* Close */
    lbClose.addEventListener(
      'click',
      closeLightbox
    );


    /* Previous */
    lbPrev.addEventListener(
      'click',
      function () {

        showImage(
          current - 1
        );

      }
    );


    /* Next */
    lbNext.addEventListener(
      'click',
      function () {

        showImage(
          current + 1
        );

      }
    );


    /* Close when clicking dark background */
    lightbox.addEventListener(
      'click',
      function (event) {

        if (
          event.target === lightbox ||
          event.target.tagName === 'FIGURE'
        ) {

          closeLightbox();

        }

      }
    );


    /* ---------- Keyboard controls ---------- */

    document.addEventListener(
      'keydown',
      function (event) {

        if (lightbox.hidden) {
          return;
        }


        if (event.key === 'Escape') {

          closeLightbox();

        }

        else if (event.key === 'ArrowLeft') {

          showImage(
            current - 1
          );

        }

        else if (event.key === 'ArrowRight') {

          showImage(
            current + 1
          );

        }

        else if (event.key === 'Tab') {

          var focusable = [
            lbClose,
            lbPrev,
            lbNext
          ];


          var index =
            focusable.indexOf(
              document.activeElement
            );


          event.preventDefault();


          var nextIndex =
            (
              (
                event.shiftKey
                  ? index - 1
                  : index + 1
              ) +
              focusable.length
            ) %
            focusable.length;


          focusable[nextIndex].focus();

        }

      }
    );


    /* ---------- Touch swipe ---------- */

    var touchX =
      null;


    lightbox.addEventListener(
      'touchstart',
      function (event) {

        touchX =
          event.changedTouches[0].clientX;

      },
      {
        passive: true
      }
    );


    lightbox.addEventListener(
      'touchend',
      function (event) {

        if (touchX === null) {
          return;
        }


        var dx =
          event.changedTouches[0].clientX -
          touchX;


        if (Math.abs(dx) > 50) {

          showImage(
            current +
            (dx < 0 ? 1 : -1)
          );

        }


        touchX =
          null;

      }
    );

  }


  /* =========================================================
     7. Instagram link
     ========================================================= */

  var igWatch =
    $('#igWatch');


  if (
    igWatch &&
    IG_REEL_URL.indexOf('REEL_ID') === -1
  ) {

    igWatch.href =
      IG_REEL_URL;

  }


  /* =========================================================
     8. Booking form
     ========================================================= */

  var form =
    $('#bookingForm');

  var statusEl =
    $('#formStatus');


  if (form && statusEl) {

    var rules = {

      name: function (value) {

        return value.length >= 2
          ? ''
          : 'Please enter your name.';

      },


      company: function (value) {

        return value.length >= 2
          ? ''
          : 'Please enter your brand or company.';

      },


      email: function (value) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
          ? ''
          : 'Please enter a valid email address.';

      },


      message: function (value) {

        return value.length >= 10
          ? ''
          : 'Please add a few details (at least 10 characters).';

      }

    };


    /* ---------- Field validation ---------- */

    var validateField =
      function (name) {

        var input =
          form.elements[name];

        var message =
          rules[name](
            input.value.trim()
          );


        input
          .closest('.field')
          .classList.toggle(
            'has-error',
            !!message
          );


        var errorElement =
          $('[data-error-for="' + name + '"]', form);


        if (errorElement) {

          errorElement.textContent =
            message;

        }


        input.setAttribute(
          'aria-invalid',
          message
            ? 'true'
            : 'false'
        );


        return !message;

      };


    /* ---------- Validate on blur/input ---------- */

    Object.keys(rules).forEach(
      function (name) {

        var input =
          form.elements[name];


        input.addEventListener(
          'blur',
          function () {

            validateField(name);

          }
        );


        input.addEventListener(
          'input',
          function () {

            if (
              input
                .closest('.field')
                .classList
                .contains('has-error')
            ) {

              validateField(name);

            }

          }
        );

      }
    );


    /* ---------- Status ---------- */

    var setStatus =
      function (text, type) {

        statusEl.textContent =
          text;


        statusEl.className =
          'form__status' +
          (
            type
              ? ' is-' + type
              : ''
          );

      };


    /* ---------- Submit ---------- */

    form.addEventListener(
      'submit',
      function (event) {

        event.preventDefault();


        var ok =
          Object.keys(rules)
            .map(validateField)
            .every(Boolean);


        if (!ok) {

          setStatus(
            'Please fix the highlighted fields and try again.',
            'error'
          );


          var bad =
            $('.has-error input, .has-error textarea', form);


          if (bad) {

            bad.focus();

          }


          return;

        }


        var data = {

          name:
            form.elements.name.value.trim(),

          company:
            form.elements.company.value.trim(),

          email:
            form.elements.email.value.trim(),

          message:
            form.elements.message.value.trim()

        };


        var channel =
          (
            event.submitter &&
            event.submitter.value
          ) ||
          'email';


        var body =
          'Hello Rohit,\n\n' +
          data.message +
          '\n\n- ' +
          data.name +
          '\nBrand / Company: ' +
          data.company +
          '\nReply to: ' +
          data.email;


        /* ---------- WhatsApp ---------- */

        if (channel === 'whatsapp') {

          var whatsappUrl =
            'https://wa.me/' +
            CONTACT.whatsapp +
            '?text=' +
            encodeURIComponent(
              'Booking inquiry for Rohit Sharma\n\n' +
              body
            );


          var whatsappWindow =
            window.open(
              whatsappUrl,
              '_blank',
              'noopener'
            );


          if (!whatsappWindow) {

            window.location.href =
              whatsappUrl;

          }


          setStatus(
            'Opening WhatsApp with your message ready to send…',
            'success'
          );

        }


        /* ---------- Email ---------- */

        else {

          var emailUrl =
            'mailto:' +
            CONTACT.emailTo +
            '?cc=' +
            encodeURIComponent(
              CONTACT.emailCc
            ) +
            '&subject=' +
            encodeURIComponent(
              'Booking Inquiry: ' +
              data.company +
              ' (' +
              data.name +
              ')'
            ) +
            '&body=' +
            encodeURIComponent(
              body
            );


          window.location.href =
            emailUrl;


          setStatus(
            'Opening your email app with the message prefilled. Press send there to complete your inquiry.',
            'success'
          );

        }

      }
    );

  }


  /* =========================================================
     9. Footer year
     ========================================================= */

  var yearEl =
    $('#year');


  if (yearEl) {

    yearEl.textContent =
      new Date().getFullYear();

  }

})();
