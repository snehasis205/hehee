/* =====================================================================
   SPOTIFY SETUP: paste your song link between the quotes below.
   How: Spotify -> right-click the song -> Share -> Copy Song Link.
   It looks like https://open.spotify.com/track/xxxxxxxx?si=...
   Albums and playlists links work too. That's the only line to edit.
   ===================================================================== */
const SPOTIFY_TRACK_URL = "PASTE_SPOTIFY_LINK_HERE";
/* ===================================================================== */

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TOTAL = 7;
  let cur = 0, run = 0, locked = false, clicks = 0, eggTimer;
  const answers = {};

  const later = (fn, ms, id) => setTimeout(() => { if (id === run) fn(); }, ms);

  /* ---------- reveal .ln elements one after another ---------- */
  function reveal(s, id, startAt = 500) {
    let t = startAt;
    $$('.ln', s).forEach(l => {
      if (l.dataset.manual) return;
      l.classList.remove('show');
      t += +(l.dataset.d || 1400);
      later(() => l.classList.add('show'), t, id);
    });
  }

  /* ---------- screen navigation ---------- */
  function go(n) {
    if (locked) return;
    locked = true; run++;
    const id = run, old = $('.screen.on');
    if (old) old.classList.remove('on');
    cur = n;
    document.documentElement.style.setProperty('--s', n);
    $('#bar i').style.width = (n / TOTAL * 100) + '%';
    setTimeout(() => {
      const s = $('#s' + n);
      s.classList.add('on');
      (enter[n] || (() => reveal(s, id)))(s, id);
      locked = false;
    }, old ? 700 : 0);
  }

  const enter = {
    1(s, id) { buildTitle(); reset(s); boost.base = 0; reveal(s, id, 1000); },
    3(s, id) { reset(s); startQuiz(id); },
    4(s, id) { reset(s); startTiny(id); },
    5(s, id) { reveal(s, id); },
    7(s, id) {
      $('#inner').classList.remove('zoom');
      $('#q').textContent = 'So… shall we see where this goes?';
      $('#after').hidden = true;
      $('#ask').hidden = false;
      reveal(s, id);
    }
  };
  function reset(s) { $$('.ln', s).forEach(l => l.classList.remove('show')); }

  /* ---------- intro title (letter reveal + Easter egg) ---------- */
  function buildTitle() {
    const t = $('#title'); t.innerHTML = '';
    [...'SONANKA'].forEach((c, i) => {
      const sp = document.createElement('span');
      sp.textContent = c; sp.style.animationDelay = (0.3 + i * 0.12) + 's';
      t.appendChild(sp);
    });
  }
  $('#title').addEventListener('click', () => {
    clicks++;
    if (clicks >= 5) {
      clicks = 0;
      const e = $('#egg'); e.classList.add('show');
      burst(40);
      clearTimeout(eggTimer); eggTimer = setTimeout(() => e.classList.remove('show'), 4500);
    }
  });

  /* ---------- screen 3: playful questions ---------- */
  const QS = [
    ['Coffee or chai?', ['Coffee', 'bold choice.'], ['Chai', 'good taste.']],
    ['Sunrise or sunset?', ['Sunrise', 'early bird, huh.'], ['Sunset', 'golden hour it is.']],
    ['Mountains or sea?', ['Mountains', 'fresh air. noted.'], ['Sea', 'salt air. nice.']],
    ['Late-night talks or random adventures?', ['Late-night talks', 'dangerous. hours vanish.'], ['Random adventures', 'chaos. interesting.']]
  ];
  function startQuiz(id) {
    const box = $('#quiz'), noted = $('#noted'), nx = $('#q-next');
    box.innerHTML = ''; noted.classList.remove('show'); noted.style.display = 'none';
    nx.dataset.manual = '1'; nx.classList.remove('show');
    const ask = i => {
      if (id !== run) return;
      if (i >= QS.length) {
        box.innerHTML = '';
        noted.style.display = 'block';
        later(() => noted.classList.add('show'), 60, id);
        later(() => nx.classList.add('show'), 1800, id);
        return;
      }
      const [q, a, b] = QS[i];
      const d = document.createElement('div'); d.className = 'q';
      d.innerHTML = `<p class="serif">${q}</p><div class="opts"></div><p class="react">&nbsp;</p><div class="dots">${QS.map((_, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('')}</div>`;
      [a, b].forEach(([label, msg]) => {
        const c = document.createElement('button'); c.className = 'card'; c.textContent = label;
        c.onclick = () => {
          if (d.classList.contains('done')) return;
          answers[q] = label; /* stored here: answers object */
          c.classList.add('sel'); d.classList.add('done');
          $('.react', d).textContent = msg; burst(8);
          later(() => { d.style.transition = 'opacity .6s'; d.style.opacity = 0; }, 1500, id);
          later(() => { box.innerHTML = ''; ask(i + 1); }, 2100, id);
        };
        $('.opts', d).appendChild(c);
      });
      box.innerHTML = ''; box.appendChild(d);
    };
    later(() => ask(0), 500, id);
  }

  /* ---------- screen 4: tiny things ---------- */
  const TINY = [
    ['Laughing', 'the kind of laugh you remember'],
    ['Random conversations', 'conversations that accidentally become hours'],
    ['Unexpected moments', 'the little moments nobody plans'],
    ['Comfort', 'when silence is also easy'],
    ['Music', 'one song can hold a whole evening'],
    ['Good energy', 'you can tell without saying it'],
    ['New memories', 'the ones we haven’t made yet']
  ];
  function startTiny(id) {
    const box = $('#tiny'), nx = $('#t-next'), hint = $('#hint');
    box.innerHTML = ''; let opened = 0;
    nx.dataset.manual = '1'; hint.dataset.manual = '1'; nx.classList.remove('show'); hint.classList.remove('show');
    TINY.forEach(([w, t], i) => {
      const c = document.createElement('button'); c.className = 'chip';
      c.style.setProperty('--d', (-i * 0.9) + 's');
      c.innerHTML = `${w}<small>${t}</small>`;
      c.style.opacity = 0; c.style.transition = 'opacity 1s ' + (0.4 + i * 0.15) + 's, box-shadow .5s, border-color .5s, background .5s, padding .5s';
      requestAnimationFrame(() => requestAnimationFrame(() => c.style.opacity = 1));
      c.onclick = () => {
        if (!c.classList.contains('open')) { c.classList.add('open'); opened++; burst(5); }
        else c.classList.remove('open');
        if (opened >= 3) nx.classList.add('show');
      };
      box.appendChild(c);
    });
    later(() => hint.classList.add('show'), 1800, id);
    later(() => nx.classList.add('show'), 30000, id); /* safety: never stuck */
  }

  /* ---------- screen 5: official Spotify embed ---------- */
  function embedUrl() {
    const m = String(SPOTIFY_TRACK_URL).match(/(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
    return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0` : null;
  }
  $('#play').addEventListener('click', () => {
    const p = $('#player'), f = $('#frame');
    p.classList.add('open');
    if (!f.dataset.ready) {
      f.dataset.ready = '1';
      const url = embedUrl();
      if (url) {
        const i = document.createElement('iframe');
        i.src = url; i.title = 'Spotify player'; i.loading = 'lazy';
        i.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
        f.appendChild(i);
      } else f.textContent = 'Paste a Spotify link into SPOTIFY_TRACK_URL in script.js';
    }
    $('#play').textContent = 'NOW PLAYING ♫'; burst(14);
  });

  /* ---------- screen 7 ---------- */
  $('#yes').addEventListener('click', () => {
    burst(90); boost.base = 0.45;
    $('#inner').classList.add('zoom');
    $('#ask').classList.remove('show');
    const id = run;
    later(() => {
      $('#q').textContent = 'Then let’s begin.';
      $('#ask').hidden = true;
      const a = $('#after'); a.hidden = false; a.classList.add('ln');
      later(() => a.classList.add('show'), 80, id);
    }, 700, id);
  });
  $('#song').addEventListener('click', () => go(5));
  $('#again').addEventListener('click', () => go(1));
  $('#again2').addEventListener('click', () => go(1));
  $('#enter').addEventListener('click', () => go(2));
  $$('.next').forEach(b => b.addEventListener('click', () => go(cur + 1)));

  /* ---------- magnetic buttons + cursor glow ---------- */
  const glow = $('#glow'); let mx = 0, my = 0;
  addEventListener('pointermove', e => {
    mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5;
    if (e.pointerType !== 'mouse') return;
    glow.classList.add('on');
    glow.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
    $$('.btn').forEach(b => {
      const r = b.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      b.style.transform = Math.hypot(dx, dy) < 90 ? `translate(${dx * 0.18}px,${dy * 0.25}px)` : '';
    });
  });

  /* ---------- particles ---------- */
  const cv = $('#fx'), cx = cv.getContext('2d');
  const boost = { v: 0, base: 0 };
  let W, H, dpr, P = [];
  const mk = (rise) => ({ x: Math.random() * W, y: rise ? H + 10 : Math.random() * H, r: (Math.random() * 1.6 + 0.4) * dpr, vy: (Math.random() * 0.25 + 0.05) * dpr, vx: (Math.random() - 0.5) * 0.12 * dpr, a: Math.random() * 0.5 + 0.2, z: Math.random() * 30 + 5, rise });
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
    const n = reduce ? 20 : innerWidth < 700 ? 38 : 75;
    P = Array.from({ length: n }, () => mk(false));
  }
  function burst(n) {
    if (reduce) n = Math.min(n, 6);
    boost.v = 1;
    for (let i = 0; i < n; i++) { const p = mk(true); p.vy *= 6 + Math.random() * 4; p.r *= 1.3; P.push(p); }
  }
  function draw() {
    cx.clearRect(0, 0, W, H);
    boost.v += (boost.base - boost.v) * 0.02;
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i];
      p.y -= p.vy * (1 + boost.v * 2); p.x += p.vx;
      if (p.y < -10) { if (p.rise) { P.splice(i, 1); continue; } p.y = H + 10; p.x = Math.random() * W; }
      cx.globalAlpha = Math.min(1, p.a * (0.6 + boost.v * 1.2));
      cx.fillStyle = p.rise ? '#ffd6e8' : '#f3ece6';
      cx.beginPath(); cx.arc(p.x + mx * p.z * dpr, p.y + my * p.z * dpr, p.r, 0, 6.283); cx.fill();
    }
    if (!reduce) requestAnimationFrame(draw);
  }
  addEventListener('resize', size);
  size(); draw(); if (reduce) setInterval(draw, 400);

  go(1);
})();
