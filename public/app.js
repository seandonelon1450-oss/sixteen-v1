/* =====================================================================
 * Sixteen™ V1 — client app.
 * Single page: hero -> how -> try the room (quiz/reveal/consult) ->
 * seats -> sample consultation -> pricing -> waitlist -> charter -> faq.
 * The UI reads GET /api/config so it always labels itself honestly.
 * No real people's names or likenesses anywhere.
 * =================================================================== */
(function () {
  'use strict';

  function el(id) { return document.getElementById(id); }
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function scrollToEl(node) {
    if (!node) return;
    node.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  /* ---------- theme: OS default, header toggle, stored on device ---------- */
  (function theme() {
    var btn = el('theme-toggle');
    if (!btn) return;
    function current() {
      return document.documentElement.getAttribute('data-theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    function apply(t) {
      document.documentElement.setAttribute('data-theme', t);
      btn.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
    }
    try {
      var saved = localStorage.getItem('sixteen-theme');
      if (saved === 'dark' || saved === 'light') apply(saved);
      else btn.setAttribute('aria-pressed', current() === 'dark' ? 'true' : 'false');
    } catch (e) { /* storage unavailable */ }
    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem('sixteen-theme', next); } catch (e) { /* ignore */ }
    });
  })();

  /* ---------- header: glass after scroll ---------- */
  (function header() {
    var h = el('site-header');
    if (!h) return;
    function onScroll() { h.classList.toggle('scrolled', window.scrollY > 8); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ---------- scroll-triggered reveals (once, ≤600ms) ---------- */
  (function reveals() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach(function (n) { n.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (n) { io.observe(n); });
  })();

  /* ---------- config + honesty badge ---------- */
  var config = null, seats = [];
  fetch('/api/config').then(function (r) { return r.json(); })
    .then(function (c) { config = c; applyHonesty(); })
    .catch(function () { /* offline: keep defaults */ });
  fetch('/api/seats').then(function (r) { return r.json(); })
    .then(function (d) { seats = d.seats || []; buildSeatGrid(); buildBoardroom(); })
    .catch(function () { /* seats needed for boardroom; keep quiet */ });

  function isLive() { return !!(config && !config.demoMode); }
  function applyHonesty() {
    var badge = el('delib-badge');
    if (badge) badge.textContent = isLive() ? 'Live counsel' : 'Preview deliberation';
    var sb = el('sample-badge');
    if (sb) sb.textContent = isLive() ? 'Live counsel' : 'Preview deliberation';
  }

  /* ---------- seats grid ---------- */
  function buildSeatGrid() {
    var grid = el('seat-grid');
    if (!grid || !seats.length) return;
    grid.innerHTML = '';
    seats.forEach(function (s) {
      var t = document.createElement('article');
      t.className = 'seat-tile';
      t.innerHTML =
        '<span class="n">Seat ' + String(s.seat).padStart(2, '0') + '</span>' +
        '<h3>' + escapeHtml(s.archetype) + '</h3>' +
        '<span class="t">' + escapeHtml(s.mbti) + ' temperament</span>' +
        '<p>' + escapeHtml(s.mandate) + '</p>';
      grid.appendChild(t);
    });
  }

  /* ---------- boardroom: seats assemble seat by seat ---------- */
  function buildBoardroom() {
    var room = el('boardroom');
    if (!room || !seats.length) return;
    room.innerHTML = '';
    seats.forEach(function (s, i) {
      var b = document.createElement('div');
      b.className = 'seat';
      b.style.left = (50 + 42 * Math.cos(-Math.PI / 2 + i * Math.PI * 2 / 16)) + '%';
      b.style.top = (50 + 40 * Math.sin(-Math.PI / 2 + i * Math.PI * 2 / 16)) + '%';
      b.innerHTML = '<span class="n">' + String(s.seat).padStart(2, '0') + '</span>' +
        '<h4>' + escapeHtml(s.archetype) + '</h4>' +
        '<span class="t">' + escapeHtml(s.mbti) + ' temperament</span>';
      room.appendChild(b);
    });
  }
  function runReveal() {
    var items = document.querySelectorAll('#boardroom .seat');
    if (!items.length) return;
    items.forEach(function (x) { x.classList.remove('seated', 'lit'); });
    if (reduceMotion) {
      items.forEach(function (x) { x.classList.add('seated'); });
      return;
    }
    items.forEach(function (x, i) {
      setTimeout(function () {
        x.classList.add('seated', 'lit');
        setTimeout(function () { x.classList.remove('lit'); }, 700);
      }, 350 + i * 130);
    });
  }

  /* ---------- quiz: 10 questions, decision-style + MBTI-lite ---------- */
  var QUESTIONS = [
    { dim: 'EI', text: 'When a big decision lands, your first instinct is to…',
      a: 'Talk it through with someone I trust', b: 'Think it through alone first' },
    { dim: 'EI', text: 'At a room full of strangers, you…',
      a: 'Work the room — energy multiplies', b: 'Find one real conversation' },
    { dim: 'SN', text: 'When evaluating a plan, you trust…',
      a: "What's proven to work", b: 'What could work' },
    { dim: 'SN', text: 'Give me…',
      a: 'The facts and details first', b: 'The vision and the pattern first' },
    { dim: 'TF', text: 'Advising a friend in trouble, you lead with…',
      a: 'The clear-eyed logic', b: 'The human impact' },
    { dim: 'TF', text: 'Hard calls should be made by…',
      a: 'Criteria and consequences', b: 'Values and conscience' },
    { dim: 'JP', text: 'Your ideal week is…',
      a: 'Planned and structured', b: 'Open and adaptable' },
    { dim: 'JP', text: 'A deadline is…',
      a: 'A commitment to honor', b: 'A guide to adjust' },
    { dim: 'XX', text: 'The decision you would bring the board first is about…',
      a: 'Money and capital', b: "Something I can't name yet",
      c: 'Career and work', d: 'Relationships and people' },
    { dim: 'XX', text: 'When the sixteen disagree, the chair should…',
      a: 'Make the call and own it', b: "Build the room's consensus" }
  ];
  var BLURB = {
    E: 'you think best out loud and in motion',
    I: 'you decide best in depth, on your own counsel',
    S: 'you trust what is proven and concrete',
    N: 'you trust pattern and possibility',
    T: 'you decide by criteria and consequence',
    F: 'you decide by values and human impact',
    J: 'you like a decided thing — structured and closed',
    P: 'you keep options open until the evidence lands'
  };

  var qi = 0, tally = { EI: 0, SN: 0, TF: 0, JP: 0 };
  var qCount = el('q-count'), qText = el('q-text'),
      qChoices = el('q-choices'), qProgress = el('q-progress');

  if (qCount && qText && qChoices && qProgress) {
    for (var p = 0; p < QUESTIONS.length; p++) { qProgress.appendChild(document.createElement('span')); }
    renderQuestion();
  }

  function renderQuestion() {
    var q = QUESTIONS[qi];
    qCount.textContent = 'Question ' + String(qi + 1).padStart(2, '0') + ' / ' + QUESTIONS.length;
    qText.textContent = q.text;
    qChoices.innerHTML = '';
    [q.a, q.b, q.c, q.d].forEach(function (label, idx) {
      if (!label) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'choice';
      b.textContent = label;
      b.addEventListener('click', function () { answer(idx); });
      qChoices.appendChild(b);
    });
  }
  function answer(idx) {
    var q = QUESTIONS[qi];
    if (q.dim !== 'XX') {
      if (idx === 0) tally[q.dim]++; else tally[q.dim]--;
    }
    if (qProgress.children[qi]) qProgress.children[qi].classList.add('done');
    qi++;
    if (qi < QUESTIONS.length) { renderQuestion(); } else { finishQuiz(); }
  }
  function finishQuiz() {
    var type = (tally.EI >= 0 ? 'E' : 'I') +
               (tally.SN >= 0 ? 'S' : 'N') +
               (tally.TF >= 0 ? 'T' : 'F') +
               (tally.JP >= 0 ? 'J' : 'P');
    el('quiz-body').style.display = 'none';
    el('quiz-done').hidden = false;
    el('mbti-type').textContent = type.split('').join(' · ') + ' temperament';
    var bits = type.split('').map(function (l) { return BLURB[l]; });
    el('mbti-summary').textContent =
      'Your natural center: ' + bits.join('; ') + '. ' +
      'The room is weighted to preserve that strength — and to bring its opposite to the table wherever you lean hardest.';
    scrollToEl(el('quiz-card'));
  }

  var btnReveal = el('btn-reveal');
  if (btnReveal) btnReveal.addEventListener('click', function () {
    el('reveal-card').hidden = false;
    scrollToEl(el('reveal-card'));
    runReveal();
  });
  var btnConsult = el('btn-consult');
  if (btnConsult) btnConsult.addEventListener('click', function () {
    el('consult-card').hidden = false;
    scrollToEl(el('consult-card'));
  });

  /* ---------- deliberation (consult + sample share the renderer) ---------- */
  var btnDeliberate = el('btn-deliberate');
  if (btnDeliberate) btnDeliberate.addEventListener('click', function () {
    deliberate(el('question').value.trim(), {
      box: 'deliberation', voices: 'voices', synthesis: 'synthesis',
      synText: 'synthesis-text', disclaimer: 'delib-disclaimer',
      badge: 'delib-badge', echo: 'delib-echo',
      after: 'after-consult', err: 'consult-err', btn: btnDeliberate
    });
  });
  var btnSample = el('btn-sample');
  if (btnSample) btnSample.addEventListener('click', function () {
    deliberate("Should I take the promotion, or leave and start the business I've been planning for two years?", {
      box: 'sample-deliberation', voices: 'sample-voices', synthesis: 'sample-synthesis',
      synText: 'sample-synthesis-text', disclaimer: 'sample-disclaimer',
      badge: 'sample-badge', echo: null, after: null, err: null, btn: btnSample
    });
  });

  function deliberate(question, ids) {
    var btn = ids.btn;
    if (ids.err) { el(ids.err).textContent = ''; }
    if (!question) {
      if (ids.err) el(ids.err).textContent = 'Ask the board something first — the room needs a real question.';
      var q = el('question');
      if (q) q.focus();
      return;
    }
    var label = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Convening the board…';
    fetch('/api/deliberate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question })
    }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        btn.disabled = false;
        btn.textContent = label;
        if (!res.ok) {
          if (ids.err) el(ids.err).textContent = res.d.error || 'The board could not convene.';
          return;
        }
        renderDeliberation(res.d, ids);
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = label;
        if (ids.err) el(ids.err).textContent = 'Connection failed — check your network and try again.';
      });
  }

  function renderDeliberation(data, ids) {
    var box = el(ids.box), voices = el(ids.voices), syn = el(ids.synthesis);
    if (!box || !voices || !syn) return;
    if (ids.echo) el(ids.echo).textContent = '\u201C' + (data.questionEcho || '') + '\u201D';
    el(ids.badge).textContent = data.mode === 'live' ? 'Live counsel' : 'Preview deliberation';
    el(ids.disclaimer).textContent = data.disclaimer || '';
    voices.innerHTML = '';
    syn.classList.remove('visible');
    box.classList.add('visible');
    scrollToEl(box);

    data.deliberation.forEach(function (v, i) {
      var card = document.createElement('article');
      card.className = 'voice';
      card.innerHTML =
        '<div class="who">Seat ' + String(v.seat).padStart(2, '0') + ' · ' + escapeHtml(v.archetype) + '</div>' +
        '<h4>' + escapeHtml(v.response) + '</h4>' +
        '<p>' + escapeHtml(v.mbti) + ' temperament · illustrative sample — not the views of any real person.</p>';
      voices.appendChild(card);
      if (reduceMotion) {
        card.classList.add('visible');
      } else {
        setTimeout(function () { card.classList.add('visible'); }, 400 + i * 450);
      }
    });
    var total = reduceMotion ? 0 : 400 + data.deliberation.length * 450;
    setTimeout(function () {
      el(ids.synText).textContent = (data.synthesis && data.synthesis.text) || '';
      syn.classList.add('visible');
      if (ids.after) el(ids.after).hidden = false;
    }, total);
  }

  /* ---------- waitlist ---------- */
  var waitlistForm = el('waitlist-form');
  if (waitlistForm) waitlistForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var input = el('waitlist-email'), msg = el('waitlist-msg'), btn = el('btn-waitlist');
    var email = input.value.trim();
    msg.className = 'msg';
    msg.textContent = '';
    if (!email) { msg.className = 'msg err'; msg.textContent = 'Enter your email address first.'; return; }
    btn.disabled = true;
    fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, source: 'waitlist-page' })
    }).then(function (r) { return r.json(); })
      .then(function (d) {
        btn.disabled = false;
        if (d.ok) {
          msg.className = 'msg ok';
          msg.textContent = 'You are on the list. The room will call your name first.';
          input.value = '';
        } else {
          msg.className = 'msg err';
          msg.textContent = d.error || 'Could not save — try again.';
        }
      })
      .catch(function () {
        btn.disabled = false;
        msg.className = 'msg err';
        msg.textContent = 'Connection failed — try again.';
      });
  });

  /* ---------- data page: export + delete ---------- */
  var exportForm = el('export-form');
  if (exportForm) exportForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = el('export-email').value.trim(), msg = el('export-msg'), btn = el('btn-export');
    msg.className = 'msg'; msg.textContent = '';
    btn.disabled = true;
    fetch('/api/my-data?email=' + encodeURIComponent(email))
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        btn.disabled = false;
        if (!res.ok) { msg.className = 'msg err'; msg.textContent = res.d.error || 'Could not export.'; return; }
        var blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), email: email, entries: res.d.entries }, null, 2)], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'sixteen-my-data.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        msg.className = 'msg ok';
        msg.textContent = res.d.count === 0
          ? 'We hold no entries for that email — nothing to export.'
          : 'Exported ' + res.d.count + ' entr' + (res.d.count === 1 ? 'y' : 'ies') + '. Check your downloads.';
      })
      .catch(function () {
        btn.disabled = false;
        msg.className = 'msg err';
        msg.textContent = 'Connection failed — try again.';
      });
  });

  var deleteForm = el('delete-form');
  if (deleteForm) deleteForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = el('delete-email').value.trim(), msg = el('delete-msg'), btn = el('btn-delete');
    msg.className = 'msg'; msg.textContent = '';
    if (!window.confirm('Delete every waitlist entry for ' + email + '? This cannot be undone.')) return;
    btn.disabled = true;
    fetch('/api/my-data/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email })
    }).then(function (r) { return r.json(); })
      .then(function (d) {
        btn.disabled = false;
        if (d.ok) {
          msg.className = 'msg ok';
          msg.textContent = d.removed === 0
            ? 'We hold no entries for that email — nothing to delete.'
            : 'Deleted ' + d.removed + ' entr' + (d.removed === 1 ? 'y' : 'ies') + '. Gone from the live system.';
          el('delete-email').value = '';
        } else {
          msg.className = 'msg err';
          msg.textContent = d.error || 'Could not delete — try again.';
        }
      })
      .catch(function () {
        btn.disabled = false;
        msg.className = 'msg err';
        msg.textContent = 'Connection failed — try again.';
      });
  });

  /* ---------- helpers ---------- */
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
})();
