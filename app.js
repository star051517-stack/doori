(function () {
  const S = window.STUDENTS || [];
  const pad = n => String(n).padStart(2, '0');
  const or = (v, d = '미정') => (v && String(v).trim()) ? v : d;

  const SIL = '<svg class="sil" viewBox="0 0 100 110" fill="currentColor" aria-hidden="true">' +
    '<circle cx="50" cy="38" r="22"/><path d="M8 110c0-26 19-44 42-44s42 18 42 44z"/></svg>';

  const photo = s => s.photo ? `<img src="${s.photo}" alt="${or(s.name, '')}">` : SIL;

  /* ---- 학생증 ---- */
  const rows = [document.getElementById('row1'), document.getElementById('row2')];
  S.forEach((s, i) => {
    const no = pad(i + 1);
    const card = document.createElement('button');
    card.className = 'idcard';
    card.style.setProperty('--delay', (-(i * 0.9) % 6) + 's');
    card.setAttribute('aria-label', `${no}번 ${or(s.name, '이름 미정')} 프로필 열기`);
    card.innerHTML = s.card
      ? `<img class="id-img" src="${s.card}" alt="">`
      : `<span class="id-top"><span class="id-hole"></span><b>학 생 증</b><small>Student ID Card</small></span>
         <span class="id-photo">${photo(s)}</span>
         <span class="id-text"><span class="id-name ${s.name ? '' : 'blank'}">${or(s.name, '? ? ?')}</span><span class="id-en">${s.en || 'UNKNOWN'}</span></span>
         <span class="id-school"><img src="images/school-band.webp" alt=""></span>`;
    if (s.card) card.classList.add('has-img');
    card.addEventListener('click', () => open(i));
    (i < 5 ? rows[0] : rows[1]).appendChild(card);
  });

  /* ---- 프로필 ---- */
  const P = document.getElementById('profile');
  const $ = id => document.getElementById(id);
  let cur = 0, typer = null, lastFocus = null;

  P.querySelectorAll('.p-block').forEach((el, i) => el.style.setProperty('--i', i));

  function type(el, text) {
    clearInterval(typer);
    el.innerHTML = '<span class="cursor">&nbsp;</span>';
    let k = 0;
    typer = setInterval(() => {
      k++;
      el.innerHTML = text.slice(0, k) + '<span class="cursor">&nbsp;</span>';
      if (k >= text.length) clearInterval(typer);
    }, 90);
  }

  function redactions(n) {
    let h = '';
    for (let i = 0; i < n; i++) h += `<span class="redact">${'■'.repeat(3 + (i * 5) % 7)}</span>`;
    return h;
  }

  function fill(i) {
    const s = S[i];
    $('pNo').textContent = pad(i + 1);
    const pp = $('pPortrait');
    pp.classList.toggle('has-art', !!s.art);
    pp.innerHTML = s.art ? `<i class="pbg"></i><img class="cut" src="${s.art}" alt="${or(s.name, '')}">` : photo(s);
    P.querySelectorAll('.echo').forEach(e => {
      e.classList.toggle('art', !!s.art);
      e.innerHTML = s.art ? '' : photo(s);
      e.style.setProperty('--art', s.art ? `url("${s.art}")` : 'none');
    });
    $('pVName').textContent = or(s.name, '??????');
    $('pVEn').textContent = 'NOAH-' + pad(i + 1);
    $('pCode').textContent = 'NOAH-' + pad(i + 1) + ' / 12';
    $('pGiant').textContent = s.en || 'UNKNOWN';
    P.querySelector('.p-hud span:last-child').textContent = (i + 1) + ' OF ' + S.length;
    $('pTag').textContent = s.tag || '';
    $('pEn').textContent = s.en || 'UNKNOWN';
    $('pCls').textContent = s.cls ? s.cls + '반' : '미정';
    $('pGender').textContent = or(s.gender);
    $('pHeight').textContent = s.height ? s.height + 'cm' : '미정';

    $('pQuote').textContent = s.quote || '';
    $('pQuoteWrap').classList.toggle('empty', !s.quote);

    $('pDesc').innerHTML = s.desc ? s.desc : '<span class="mute">아직 작성되지 않은 기록입니다.</span>';
    $('pTraits').innerHTML = (s.traits || []).map(t => `<li>${t}</li>`).join('');

    const m = Math.max(0, Math.min(100, s.memory ?? 0));
    $('pMemNum').textContent = m + '%';
    $('pMemBar').style.transitionDelay = '0s';
    $('pMemBar').style.width = '0';

    $('pReason').innerHTML = (s.locked || !s.reason)
      ? redactions(4) + '<span class="locked-msg">기억 손상 · 열람 불가</span>'
      : s.reason;

    clearInterval(typer);
    $('pName').innerHTML = '&nbsp;';
  }

  const inner = $('pInner');
  let closeTimer = null;

  /* ================= 물결 전환 그리기 ================= */
  const NS = 'http://www.w3.org/2000/svg';
  const W = 1600, H = 2000;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const el = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

  // 말린 물결 끝 (오른쪽으로 말려 들어감) - 단위 크기
  const CURL = 'M -1 0.35 C -0.75 -0.75, 0.55 -1.15, 1.05 -0.35 C 1.3 0.1, 1.05 0.62, 0.6 0.55 C 0.3 0.5, 0.2 0.2, 0.42 0.02 C 0.62 -0.12, 0.85 0.05, 0.78 0.25 C 0.95 -0.05, 0.7 -0.45, 0.3 -0.38 C -0.15 -0.3, -0.45 0.05, -0.55 0.4 Z';
  const SWIRL = 'M -0.7 0.25 C -0.45 -0.45, 0.45 -0.75, 0.82 -0.2';

  function crestFn(phase, amp) {
    return x => 330 + amp * Math.sin(x / 190 + phase) + amp * .45 * Math.sin(x / 71 + phase * 2) + amp * .25 * Math.sin(x / 37 + phase);
  }

  function buildLayer(cls, c) {
    const svg = el('svg', { class: 'sw ' + cls, viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMin slice', 'aria-hidden': 'true' });
    const f = crestFn(c.phase, c.amp);
    const g = x => f(x) + (c.thick || 0) + 90 * Math.sin(x / 230 + c.phase * 1.7);
    const pts = [];
    for (let x = 0; x <= W; x += 20) pts.push(x);
    let d, sd;
    if (c.thick) { // 띠 모양 물결 (위아래 모두 물결)
      d = 'M ' + pts.map(x => `${x} ${f(x).toFixed(1)}`).join(' L ') + ' L ' + pts.slice().reverse().map(x => `${x} ${g(x).toFixed(1)}`).join(' L ') + ' Z';
      sd = 'M ' + pts.map(x => `${x} ${(g(x) - 90 - 30 * Math.sin(x / 60)).toFixed(1)}`).join(' L ') + ' L ' + pts.slice().reverse().map(x => `${x} ${g(x).toFixed(1)}`).join(' L ') + ' Z';
    } else {
      d = `M 0 ${H} L ` + pts.map(x => `${x} ${f(x).toFixed(1)}`).join(' L ') + ` L ${W} ${H} Z`;
      sd = `M 0 ${H} L ` + pts.map(x => `${x} ${(f(x) + 70 + 25 * Math.sin(x / 50)).toFixed(1)}`).join(' L ') + ` L ${W} ${H} Z`;
    }
    if (c.grad) {
      const defs = el('defs', {});
      const g = el('linearGradient', { id: 'g' + cls, x1: 0, y1: 0, x2: 0, y2: 1 });
      g.appendChild(el('stop', { offset: '0', 'stop-color': c.fill }));
      g.appendChild(el('stop', { offset: '.35', 'stop-color': '#1f3cf0' }));
      g.appendChild(el('stop', { offset: '1', 'stop-color': '#1f3cf0' }));
      defs.appendChild(g); svg.appendChild(defs);
    }
    svg.appendChild(el('path', { d, fill: c.grad ? `url(#g${cls})` : c.fill }));
    if (c.shade) svg.appendChild(el('path', { d: sd, fill: c.shade }));
    if (c.swirl && c.thick) { // 결 따라 흐르는 줄
      [0.22, 0.42, 0.6].forEach((t, k) => {
        const off = x => f(x) + (g(x) - f(x)) * t + 18 * Math.sin(x / 90 + k);
        svg.appendChild(el('path', {
          d: 'M ' + pts.map(x => `${x} ${off(x).toFixed(1)}`).join(' L '),
          fill: 'none', stroke: c.swirl, 'stroke-width': 12 - k * 3, 'stroke-linecap': 'round', opacity: .55 - k * .12,
          'stroke-dasharray': `${(rnd(180, 420)).toFixed(0)} ${(rnd(60, 200)).toFixed(0)} ${(rnd(40, 120)).toFixed(0)} ${(rnd(80, 220)).toFixed(0)}`
        }));
      });
    }

    // 봉우리마다 말린 물결
    for (let x = 40; x < W - 40; x += 10) {
      const y = f(x);
      if (y < f(x - 10) && y <= f(x + 10) && y < 330) {
        const sc = rnd(c.curl[0], c.curl[1]);
        const g = el('g', { transform: `translate(${x + sc * .2} ${y - sc * .05}) scale(${sc})` });
        g.appendChild(el('path', { d: CURL, fill: c.fill }));
        if (c.swirl) g.appendChild(el('path', { d: SWIRL, fill: 'none', stroke: c.swirl, 'stroke-width': 0.07, 'stroke-linecap': 'round' }));
        svg.appendChild(g);
        x += 120;
      }
    }

    // 물보라 타원
    if (c.spray) {
      for (let i = 0; i < c.spray; i++) {
        const x = rnd(0, W), lift = Math.pow(Math.random(), 1.8) * 260;
        const r = rnd(3, 22) * (1 - lift / 400);
        svg.appendChild(el('ellipse', {
          cx: x.toFixed(1), cy: (f(x) - 10 - lift).toFixed(1),
          rx: r.toFixed(1), ry: (r * rnd(.45, .8)).toFixed(1),
          transform: `rotate(${rnd(-35, 5).toFixed(0)} ${x.toFixed(0)} ${(f(x) - lift).toFixed(0)})`,
          fill: Math.random() < .35 ? '#ffffff' : c.dot, opacity: rnd(.45, .95).toFixed(2)
        }));
      }
    }
    return svg;
  }

  const flood = P.querySelector('.flood');
  const fb = P.querySelector('.flood-bubbles');
  [
    ['sw-deep', { fill: '#2f4dff', phase: 2.1, amp: 70, curl: [90, 140], grad: true, swirl: '#6f86ff' }],
    ['sw-3', { thick: 900, fill: '#1c86c8', shade: '#156aa8', phase: 4.0, amp: 85, curl: [100, 170], swirl: '#5cc2ea', spray: 25, dot: '#4fb6e6' }],
    ['sw-2', { thick: 750, fill: '#35c6ee', shade: '#22a6d8', phase: 0.9, amp: 95, curl: [110, 190], swirl: '#a8ecf7', spray: 45, dot: '#7fd9f2' }],
    ['sw-1', { thick: 600, fill: '#aeeef6', shade: '#7fdcee', phase: 3.1, amp: 80, curl: [90, 150], swirl: '#ffffff', spray: 60, dot: '#d4f6fb' }]
  ].forEach(([cls, c]) => flood.insertBefore(buildLayer(cls, c), fb));

  // 손그림 거품 윤곽선
  function blobPath(r) {
    const n = 9, pts = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, rr = r * rnd(.82, 1.12);
      pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
    }
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d + ' Z';
  }
  for (let k = 0; k < 0; k++) {
    const r = Math.random() < .3 ? rnd(26, 60) : rnd(6, 22);
    const box = r * 1.3;
    const svg = el('svg', { width: box * 2, height: box * 2, viewBox: `${-box} ${-box} ${box * 2} ${box * 2}` });
    const d = blobPath(r);
    const len = 2 * Math.PI * r;
    svg.appendChild(el('path', { d, fill: 'none', stroke: 'rgba(255,255,255,.55)', 'stroke-width': 1 }));
    svg.appendChild(el('path', { d, fill: 'none', stroke: '#fff', 'stroke-width': 1.8, 'stroke-linecap': 'round',
      'stroke-dasharray': `${(len * rnd(.06, .14)).toFixed(1)} ${(len * rnd(.2, .4)).toFixed(1)}`, 'stroke-dashoffset': rnd(0, len).toFixed(0) }));
    if (r > 26) { // 큰 거품엔 작은 거품이 붙음
      const d2 = blobPath(r * rnd(.25, .38)), ang = rnd(0, Math.PI * 2);
      svg.appendChild(el('path', { d: d2, transform: `translate(${(Math.cos(ang) * r).toFixed(1)} ${(Math.sin(ang) * r).toFixed(1)})`, fill: 'none', stroke: 'rgba(255,255,255,.55)', 'stroke-width': 1 }));
    }
    svg.style.left = rnd(0, 100) + '%';
    svg.style.top = rnd(55, 105) + '%';
    svg.style.setProperty('--d', rnd(7, 14) + 's');
    svg.style.setProperty('--dl', rnd(.9, 5) + 's');
    svg.style.setProperty('--dx', rnd(-60, 60) + 'px');
    svg.style.setProperty('--r', rnd(-40, 40) + 'deg');
    fb.appendChild(svg);
  }

  // 캐릭터 창 장식 — 모든 무늬는 파도에서 나온다
  // 대: 일러스트를 앞뒤로 감싸는 파도 붓질 (앞 파도는 잘린 그림 가장자리를 덮음)
  // 중: 그림 오른쪽 가장자리에서 떨어져 이름 쪽으로 날아가는 물보라 조각, 결 따라 흐르는 가는 선
  // 소: 물결 문양, 끊긴 줄, 빨간 실 — 실은 그림 앞을 지나 정보 칸의 윗줄이 된다
  // 글자 칸(오른쪽)에는 큰 덩어리를 두지 않아 읽기를 방해하지 않음
  (function buildDeco() {
    const back = $('pDeco'), front = $('pFront');
    const B = n => back.querySelector('.' + n), F = n => front.querySelector('.' + n);
    const bez = (p, t) => { const u = 1 - t; return [0, 1].map(j => u*u*u*p[0][j] + 3*u*u*t*p[1][j] + 3*u*t*t*p[2][j] + t*t*t*p[3][j]); };
    const tan = (p, t) => { const a = bez(p, Math.max(0, t - .01)), b = bez(p, Math.min(1, t + .01)); return Math.atan2(b[1] - a[1], b[0] - a[0]); };
    const fmt = q => q.map(v => v.toFixed(1)).join(' ');

    function swoosh(root, p, w, fill, op, k) {
      const L = [], R = [];
      for (let i = 0; i <= 90; i++) {
        const t = i / 90, [x, y] = bez(p, t), a = tan(p, t) + Math.PI / 2;
        const ww = w * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.15)), .75) * (1 - .55 * t) / 2;
        const wob = 1 + .1 * Math.sin(t * 26 + k * 2);
        L.push([x + Math.cos(a) * ww * wob, y + Math.sin(a) * ww * wob]);
        R.push([x - Math.cos(a) * ww * .6, y - Math.sin(a) * ww * .6]);
      }
      root.appendChild(el('path', { d: 'M ' + L.map(fmt).join(' L ') + ' L ' + R.reverse().map(fmt).join(' L ') + ' Z', fill, style: `--k:${k};--o:${op}` }));
    }
    function flowLines(root, p, offs, k0) {
      offs.forEach(([off, op], j) => {
        let d = '';
        for (let i = 0; i <= 60; i++) {
          const t = i / 60, [x, y] = bez(p, t), a = tan(p, t) + Math.PI / 2;
          const o = off * (1 - .5 * t);
          d += (i ? ' L ' : 'M ') + fmt([x + Math.cos(a) * o, y + Math.sin(a) * o]);
        }
        root.appendChild(el('path', { d, fill: 'none', stroke: '#0b1f4d', 'stroke-width': .8, opacity: op, pathLength: 1, style: `--k:${k0 + j}` }));
      });
    }
    const CURLP = 'M -1 0.35 C -0.75 -0.75, 0.55 -1.15, 1.05 -0.35 C 1.3 0.1, 1.05 0.62, 0.6 0.55 C 0.3 0.5, 0.2 0.2, 0.42 0.02 C 0.62 -0.12, 0.85 0.05, 0.78 0.25 C 0.95 -0.05, 0.7 -0.45, 0.3 -0.38 C -0.15 -0.3, -0.45 0.05, -0.55 0.4 Z';

    /* 뒤: 그림 위쪽·왼쪽으로 보이는 큰 파도 */
    swoosh(B('vortex'), [[-80, 620], [-60, 120], [380, -80], [860, 60]], 230, '#a9cdf0', .9, 0);
    swoosh(B('vortex'), [[-60, 420], [80, 40], [520, -40], [800, 120]], 120, '#1f4fa8', .95, 1);
    swoosh(B('vortex'), [[60, 200], [260, 20], [560, 40], [760, -40]], 46, '#0b1f4d', 1, 2);
    B('vortex').appendChild(el('path', { d: CURLP, fill: '#0b1f4d', transform: 'translate(620 64) rotate(-12) scale(56)', style: '--k:3' }));

    /* 앞: 아래에서 감아 올라 그림 오른쪽 가장자리를 타고 오르는 파도 */
    const P1 = [[-120, 1040], [460, 1090], [860, 960], [770, 470]];
    const P2 = [[-120, 930], [300, 1080], [740, 1000], [730, 610]];
    const P3 = [[60, 1060], [480, 1010], [690, 850], [700, 700]];
    swoosh(F('vortex'), P1, 170, '#0b1f4d', 1, 4);
    swoosh(F('vortex'), P2, 110, '#1f4fa8', .95, 5);
    swoosh(F('vortex'), P3, 54, '#a9cdf0', .95, 6);
    F('vortex').appendChild(el('path', { d: CURLP, fill: '#0b1f4d', transform: 'translate(748 560) rotate(-95) scale(34)', style: '--k:7' }));
    flowLines(F('lines'), P1, [[-110, .8], [-130, .45], [96, .5]], 0);
    flowLines(F('lines'), P2, [[-80, .5]], 3);

    /* 물보라 조각: 그림 오른쪽 가장자리 → 이름 첫 글자로, 점점 작게 */
    const shard = (x, y, len, ang, fill) => {
      const w = len * .32;
      F('shards').appendChild(el('path', {
        d: `M ${-len / 2} 0 C ${-len / 4} ${-w}, ${len / 4} ${-w * .6}, ${len / 2} 0 C ${len / 4} ${w * .35}, ${-len / 4} ${w * .7}, ${-len / 2} 0 Z`,
        fill, transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(ang * 180 / Math.PI).toFixed(1)})`
      }));
    };
    const flow = [[770, 520], [800, 430], [770, 340], [820, 290]];
    [[0, 46, '#0b1f4d'], [.12, 30, '#1f4fa8'], [.24, 26, '#0b1f4d'], [.36, 18, '#6fa8dc'], [.48, 15, '#0b1f4d'],
     [.6, 11, '#1f4fa8'], [.7, 8, '#0b1f4d'], [.8, 6, '#6fa8dc'], [.9, 4.5, '#0b1f4d'], [1, 3, '#0b1f4d']]
      .forEach(([t, l, c], i) => { const [x, y] = bez(flow, t); shard(x + (i % 2 ? 10 : -6), y, l, tan(flow, t) + (i % 2 ? .3 : -.2), c); });
    [[772, 640, 22, '#6fa8dc'], [790, 668, 9, '#0b1f4d'], [300, 1000, 30, '#a9cdf0'], [40, 990, 16, '#1f4fa8']]
      .forEach(([x, y, l, c]) => shard(x, y, l, -.6, c));

    /* 물결 문양 (대·중·소) — 글자 칸 바깥 가장자리 */
    [[1500, 880, 40, -8], [1546, 852, 15, 16], [1556, 184, 13, -18], [1578, 170, 6, 8]].forEach(([x, y, sc, r]) =>
      B('marks').appendChild(el('path', { d: CURLP, fill: '#0b1f4d', transform: `translate(${x} ${y}) rotate(${r}) scale(${sc})` })));

    /* 끊긴 줄 */
    [[1300, 196, 110, 2], [1330, 204, 46, 1], [1440, 200, 22, 3], [880, 905, 150, 1.5], [880, 911, 60, 1],
     [210, 30, 130, 2], [260, 38, 50, 1]].forEach(([x, y, w, h]) =>
      B('glitch').appendChild(el('rect', { x, y, width: w, height: h, fill: '#1f4fa8', opacity: .85 })));
  })();

  function fitGiant() {
    const g = $('pGiant'), box = g.parentElement;
    g.style.fontSize = '';
    const max = box.clientWidth;
    const w = g.scrollWidth;
    if (w > max) g.style.fontSize = (parseFloat(getComputedStyle(g).fontSize) * max / w) + 'px';
  }
  window.addEventListener('resize', () => { if (P.classList.contains('open')) fitGiant(); });

  function showContent(base) {
    fitGiant();
    inner.classList.remove('show');
    inner.style.setProperty('--base', base + 's');
    void inner.offsetWidth;
    inner.classList.add('show');
    const m = Math.max(0, Math.min(100, S[cur].memory ?? 0));
    $('pMemBar').style.transitionDelay = (base + 0.6) + 's';
    requestAnimationFrame(() => requestAnimationFrame(() => { $('pMemBar').style.width = m + '%'; }));
  }

  function open(i) {
    clearTimeout(closeTimer);
    lastFocus = document.activeElement;
    cur = i;
    fill(i);
    P.classList.remove('closing', 'open');
    void P.offsetWidth;
    P.setAttribute('aria-hidden', 'false');
    document.body.classList.add('locked');
    P.classList.add('open');
    showContent(0.9);
    setTimeout(() => type($('pName'), or(S[cur].name, '??????')), 900);
    P.querySelector('.p-close').focus({ preventScroll: true });
  }

  function close() {
    if (!P.classList.contains('open') || P.classList.contains('closing')) return;
    clearInterval(typer);
    P.classList.add('closing');
    closeTimer = setTimeout(() => {
      P.classList.remove('open', 'closing');
      inner.classList.remove('show');
      P.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('locked');
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    }, 450);
  }

  function go(d) {
    cur = (cur + d + S.length) % S.length;
    fill(cur);
    showContent(0.05);
    type($('pName'), or(S[cur].name, '??????'));
  }

  P.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', close));
  $('pPrev').addEventListener('click', () => go(-1));
  $('pNext').addEventListener('click', () => go(1));

  document.addEventListener('keydown', e => {
    if (!P.classList.contains('open') || P.classList.contains('closing')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  });
})();
