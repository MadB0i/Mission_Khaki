/* ============================================================
   MISSION KHAKI — shared JS
   Every enhancement is optional: no JS, a blocked CDN, or
   prefers-reduced-motion all leave the page fully readable.
   ============================================================ */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var hasST = hasGsap && typeof window.ScrollTrigger !== 'undefined';
  if (hasST) { window.gsap.registerPlugin(window.ScrollTrigger); }

  /* ---------- nav shrink on scroll ---------- */
  var nav = document.querySelector('.nav');
  if (nav) {
    var ticking = false;
    var onScroll = function () {
      nav.classList.toggle('is-scrolled', (window.scrollY || window.pageYOffset) > 28);
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();
  }

  /* ---------- mobile menu: close after choosing a link ---------- */
  var menu = document.querySelector('.site-menu');
  if (menu) {
    var panel = menu.querySelector('.menu-panel');
    if (panel) {
      Array.prototype.forEach.call(panel.querySelectorAll('a'), function (a) {
        a.addEventListener('click', function () { menu.open = false; });
      });
    }
    document.addEventListener('click', function (e) {
      if (menu.open && !menu.contains(e.target)) { menu.open = false; }
    });
  }

  /* ---------- scroll cue: fade out on first meaningful scroll ---------- */
  var cue = document.querySelector('.hero-scroll');
  if (cue) {
    var onCueScroll = function () {
      if ((window.scrollY || window.pageYOffset) > 90) {
        cue.classList.add('is-gone');
        window.removeEventListener('scroll', onCueScroll);
      }
    };
    window.addEventListener('scroll', onCueScroll, { passive: true });
  }

  /* ---------- scroll-spy: highlight the current section in the nav (index only) ---------- */
  if (document.querySelector('.hero') && 'IntersectionObserver' in window) {
    var spyLinks = {};
    Array.prototype.forEach.call(document.querySelectorAll('.nav-links a[href^="#"]'), function (a) {
      spyLinks[a.getAttribute('href').slice(1)] = a;
    });
    var spyTargets = ['features', 'exams', 'premium']
      .map(function (id) { return document.getElementById(id); })
      .concat([document.querySelector('.hero')])
      .filter(Boolean);
    var clearSpy = function () {
      Object.keys(spyLinks).forEach(function (k) { spyLinks[k].classList.remove('is-active'); });
    };
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var link = spyLinks[en.target.id];
        if (link) {
          clearSpy();
          link.classList.add('is-active');
        } else {
          clearSpy();
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    spyTargets.forEach(function (t) { spy.observe(t); });
  }

  /* ---------- stat count-up (IntersectionObserver + rAF, no deps) ---------- */
  function formatVal(v) { return v.toLocaleString('en-IN'); }
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  counters.forEach(function (el) {
    if (el.getAttribute('data-counted')) return;
    el.setAttribute('data-counted', '1');
    var val = parseInt(el.getAttribute('data-count'), 10) || 0;
    var pre = el.getAttribute('data-prefix') || '';
    var suf = el.getAttribute('data-suffix') || '';
    function setFinal() { el.textContent = pre + formatVal(val) + suf; }
    if (reduceMotion || !('IntersectionObserver' in window)) { setFinal(); return; }
    var started = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || started) return;
        started = true;
        io.unobserve(en.target);
        var dur = 1400, t0 = null;
        function step(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          var e = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + formatVal(Math.round(val * e)) + suf;
          if (p < 1) { window.requestAnimationFrame(step); } else { setFinal(); }
        }
        window.requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    io.observe(el);
  });

  /* ---------- custom cursor (dot + trailing ring, fine pointers only) ---------- */
  if (finePointer && !reduceMotion) {
    doc.classList.add('has-cursor');
    var dot = document.createElement('div');
    var ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var dx = mx, dy = my, rx = mx, ry = my;
    var shown = false;
    var HOVERABLES = 'a, button, summary, [data-cursor]';

    window.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!shown) {
        shown = true;
        dx = rx = mx; dy = ry = my;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }
    }, { passive: true });

    document.addEventListener('pointerover', function (e) {
      var t = e.target;
      ring.classList.toggle('is-active', !!(t && t.closest && t.closest(HOVERABLES)));
    });
    document.documentElement.addEventListener('mouseleave', function () {
      shown = false;
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    });

    (function cursorLoop() {
      dx += (mx - dx) * 0.55;
      dy += (my - dy) * 0.55;
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.transform = 'translate(' + dx + 'px,' + dy + 'px) translate(-50%,-50%)';
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      window.requestAnimationFrame(cursorLoop);
    })();
  }

  /* ---------- hero canvas: drifting grid-reference motif ---------- */
  var canvas = document.getElementById('field-canvas');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var GRID = 72, MAJOR = GRID * 4;
    var offX = 0, offY = 0;
    var marks = [];
    var running = false;

    function seedMarks() {
      marks = [];
      var n = Math.max(3, Math.round(W / 420));
      for (var i = 0; i < n; i++) {
        marks.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: -(0.05 + Math.random() * 0.07),
          vy: 0.03 + Math.random() * 0.05,
          label: 'R-' + (100 + Math.floor(Math.random() * 880)) + '-' + String.fromCharCode(65 + Math.floor(Math.random() * 26))
        });
      }
    }

    function drawGrid() {
      var mod = function (v, g) { return ((v % g) + g) % g; };
      ctx.lineWidth = 1;

      ctx.strokeStyle = 'rgba(236, 238, 224, 0.045)';
      ctx.beginPath();
      for (var x = mod(offX, GRID); x < W; x += GRID) {
        ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H);
      }
      for (var y = mod(offY, GRID); y < H; y += GRID) {
        ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5);
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(236, 238, 224, 0.085)';
      ctx.beginPath();
      for (var x2 = mod(offX, MAJOR); x2 < W; x2 += MAJOR) {
        ctx.moveTo(x2 + 0.5, 0); ctx.lineTo(x2 + 0.5, H);
      }
      for (var y2 = mod(offY, MAJOR); y2 < H; y2 += MAJOR) {
        ctx.moveTo(0, y2 + 0.5); ctx.lineTo(W, y2 + 0.5);
      }
      ctx.stroke();
    }

    function drawMarks() {
      ctx.font = '10px "IBM Plex Mono", monospace';
      ctx.lineWidth = 1;
      for (var i = 0; i < marks.length; i++) {
        var m = marks[i];
        m.x += m.vx; m.y += m.vy;
        if (m.x < -50) m.x = W + 50;
        if (m.y > H + 50) m.y = -50;
        ctx.strokeStyle = 'rgba(169, 174, 140, 0.32)';
        ctx.beginPath();
        ctx.moveTo(m.x - 7, m.y + 0.5); ctx.lineTo(m.x + 7, m.y + 0.5);
        ctx.moveTo(m.x + 0.5, m.y - 7); ctx.lineTo(m.x + 0.5, m.y + 7);
        ctx.stroke();
        ctx.fillStyle = 'rgba(169, 174, 140, 0.38)';
        ctx.fillText(m.label, m.x + 11, m.y - 8);
      }
    }

    function frame() {
      offX -= 0.05;
      offY += 0.03;
      ctx.clearRect(0, 0, W, H);
      drawGrid();
      drawMarks();
      if (running) { window.requestAnimationFrame(frame); }
    }

    function drawStatic() {
      ctx.clearRect(0, 0, W, H);
      drawGrid();
    }

    function resize() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedMarks();
      if (reduceMotion) { drawStatic(); }
    }

    function start() {
      if (running || reduceMotion) return;
      running = true;
      window.requestAnimationFrame(frame);
    }
    function stop() { running = false; }

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stop(); } else { start(); }
    });
    resize();
    start();
  }

  /* ---------- orchestrated hero entrance (index only) ---------- */
  if (hasGsap && !reduceMotion && document.querySelector('.hero')) {
    var tl = window.gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.nav-inner', { y: -14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, delay: 0.05 })
      .fromTo('.hero-title .line-inner', { yPercent: 112 }, { yPercent: 0, duration: 1.0, ease: 'power4.out', stagger: 0.12 }, 0.35)
      .fromTo('.hero-sub', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.88)
      .fromTo('.hero-actions', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.02)
      .fromTo('.hero-fineprint', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 1.17)
      .fromTo('.hero-rule', { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power2.inOut', transformOrigin: 'left center' }, 0.98)
      .fromTo('.hero-stats .stat', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.09 }, 1.08);
  }

  /* ---------- scroll-triggered reveals (distinct per pattern) ---------- */
  if (hasGsap && hasST && !reduceMotion) {
    window.gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      var type = el.getAttribute('data-reveal');
      var delay = parseFloat(el.getAttribute('data-delay') || '0');

      if (type === 'wipe') {
        var inner = el.querySelector('.line-inner') || el;
        window.gsap.fromTo(inner, { yPercent: 110 }, {
          yPercent: 0, duration: 0.9, ease: 'power4.out', delay: delay,
          scrollTrigger: { trigger: el, start: 'top 86%', once: true }
        });
      } else if (type === 'row') {
        var lineEl = el.querySelector('.row-line');
        if (lineEl) {
          window.gsap.fromTo(lineEl, { scaleX: 0 }, {
            scaleX: 1, duration: 0.8, ease: 'power3.inOut', transformOrigin: 'left center',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true }
          });
        }
        window.gsap.fromTo(el.children, { autoAlpha: 0, x: -16 }, {
          autoAlpha: 1, x: 0, duration: 0.55, stagger: 0.07, delay: delay,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
      } else if (type === 'stamp') {
        window.gsap.fromTo(el, { autoAlpha: 0, scale: 1.5, rotation: -20 }, {
          autoAlpha: 1, scale: 1, rotation: -7, duration: 0.7, ease: 'back.out(2)',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true }
        });
      } else {
        /* rise (default) + fade */
        var from = type === 'fade' ? { autoAlpha: 0, y: 14 } : { autoAlpha: 0, y: 28 };
        window.gsap.fromTo(el, from, {
          autoAlpha: 1, y: 0, duration: type === 'fade' ? 0.6 : 0.85,
          ease: 'power3.out', delay: delay,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
      }
    });

    /* feature grid: one grouped, staggered reveal (not per-card repeats) */
    var featGrid = document.querySelector('.feature-grid');
    if (featGrid && featGrid.children.length) {
      window.gsap.fromTo(featGrid.children, { autoAlpha: 0, y: 34 }, {
        autoAlpha: 1, y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.12,
        scrollTrigger: { trigger: featGrid, start: 'top 80%', once: true }
      });
    }
  }

  /* ---------- tactile: 3D tilt + magnetic (fine pointers only) ---------- */
  if (hasGsap && finePointer && !reduceMotion) {
    window.gsap.utils.toArray('.tilt').forEach(function (card) {
      window.gsap.set(card, { transformPerspective: 900 });
      var rx = window.gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power2.out' });
      var ry = window.gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power2.out' });
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        ry(px * 7);
        rx(-py * 5);
      });
      card.addEventListener('pointerleave', function () { rx(0); ry(0); });
    });

    window.gsap.utils.toArray('.magnetic').forEach(function (btn) {
      var tx = window.gsap.quickTo(btn, 'x', { duration: 0.6, ease: 'power3.out' });
      var ty = window.gsap.quickTo(btn, 'y', { duration: 0.6, ease: 'power3.out' });
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        tx((e.clientX - cx) * 0.18);
        ty((e.clientY - cy) * 0.3);
      });
      btn.addEventListener('pointerleave', function () { tx(0); ty(0); });
    });
  }

  /* ---------- language chips micro-interaction ---------- */
  var chipGroup = document.querySelector('[data-lang-chips]');
  if (chipGroup) {
    var chips = chipGroup.querySelectorAll('button[data-lang]');
    Array.prototype.forEach.call(chips, function (c) {
      c.addEventListener('click', function () {
        Array.prototype.forEach.call(chips, function (o) {
          o.classList.remove('is-active');
          o.setAttribute('aria-pressed', 'false');
        });
        c.classList.add('is-active');
        c.setAttribute('aria-pressed', 'true');
      });
    });
  }

  /* ---------- WhatsApp share: append the live page URL at runtime ---------- */
  var waShare = document.getElementById('wa-share');
  if (waShare) {
    var waText = 'Mission Khaki — free mock tests for Army, Police, SSC & CAPF aspirants. Real negative marking, EN/HI/ASM in-test. Premium 99 rupees one-time, no subscription.';
    waShare.setAttribute('href', 'https://wa.me/?text=' + encodeURIComponent(waText + ' ' + window.location.href));
  }

  /* ---------- try-one-question quiz ---------- */
  var quiz = document.querySelector('.quiz');
  if (quiz) {
    var answerKey = quiz.getAttribute('data-answer');
    var quizOpts = quiz.querySelectorAll('.quiz-opt');
    var quizFeedback = quiz.querySelector('.quiz-feedback');
    var quizReset = quiz.querySelector('.quiz-reset');
    var quizCta = quiz.querySelector('.quiz-cta');
    var EXPLAIN_OK = 'Correct — Doom Dum (Sindora tomentosa) is the State Tree of Assam.';
    var EXPLAIN_NO = 'Not quite — the State Tree of Assam is Doom Dum (Sindora tomentosa).';
    var NOTE_OK = 'No penalty here — but in the app, every wrong answer still costs you −0.25.';
    var NOTE_NO = 'In the real paper, a wrong answer costs you −0.25. That is exactly how the app scores you.';

    function lockQuiz() {
      Array.prototype.forEach.call(quizOpts, function (o) { o.disabled = true; });
    }
    Array.prototype.forEach.call(quizOpts, function (o) {
      o.addEventListener('click', function () {
        if (quiz.classList.contains('is-answered')) return;
        quiz.classList.add('is-answered');
        lockQuiz();
        var isOk = o.getAttribute('data-opt') === answerKey;
        var correctOpt = quiz.querySelector('.quiz-opt[data-opt="' + answerKey + '"]');
        if (correctOpt) { correctOpt.classList.add('is-correct'); }
        if (!isOk) { o.classList.add('is-wrong'); }
        quizFeedback.innerHTML =
          '<p class="quiz-explain">' + (isOk ? EXPLAIN_OK : EXPLAIN_NO) + '</p>' +
          '<p class="quiz-note ' + (isOk ? 'is-ok' : 'is-pen') + '">' + (isOk ? NOTE_OK : NOTE_NO) + '</p>';
        if (quizReset) { quizReset.hidden = false; }
        if (quizCta) { quizCta.hidden = false; }
      });
    });
    if (quizReset) {
      quizReset.addEventListener('click', function () {
        quiz.classList.remove('is-answered');
        Array.prototype.forEach.call(quizOpts, function (o) {
          o.disabled = false;
          o.classList.remove('is-correct', 'is-wrong');
        });
        if (quizFeedback) { quizFeedback.innerHTML = ''; }
        quizReset.hidden = true;
        if (quizCta) { quizCta.hidden = true; }
      });
    }
  }
})();
