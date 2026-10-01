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
      g.appendChild(el('stop', { offset: '.35', 'stop-color': '#0f3f7a' }));
      g.appendChild(el('stop', { offset: '1', 'stop-color': '#061a36' }));
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
    ['sw-deep', { fill: '#1c6fb4', phase: 2.1, amp: 70, curl: [90, 140], grad: true, swirl: '#3a9ad6' }],
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
  for (let k = 0; k < 9; k++) {
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

  // 캐릭터 창 장식: 전선처럼 휘는 가는 선, 거품 격자, 반짝이
  (function buildDeco() {
    const svg = $('pDeco');
    const wires = svg.querySelector('.wires'), foam = svg.querySelector('.foam'), stars = svg.querySelector('.stars');

    // 가는 곡선 (왼쪽 아래 → 오른쪽 위로 가로지름)
    [
      [-60, 760, 1660, 120, 90, .9],
      [-60, 820, 1660, 210, 120, .6],
      [-60, 600, 1660, 40, 60, .5],
      [300, 1060, 1660, 330, 140, .45],
      [-60, 380, 1100, -60, 50, .35]
    ].forEach(([x0, y0, x1, y1, sag, op], k) => {
      const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 + sag;
      wires.appendChild(el('path', {
        d: `M ${x0} ${y0} Q ${mx} ${my} ${x1} ${y1}`, pathLength: 1,
        fill: 'none', stroke: '#fff', 'stroke-width': k === 0 ? 1.4 : 1, opacity: op, style: `--k:${k}`
      }));
    });

    // 거품 격자 (오른쪽 위에 모여 있음)
    const cells = [], cx = 1210, cy = 160;
    for (let t = 0; cells.length < 11 && t < 800; t++) {
      const r = rnd(18, 70);
      const x = cx + rnd(-200, 200), y = cy + rnd(-110, 70);
      if (cells.every(c => Math.hypot(c.x - x, c.y - y) > c.r + r - 10 && Math.hypot(c.x - x, c.y - y) < c.r + r + 120)
          || cells.length === 0) cells.push({ x, y, r });
    }
    cells.forEach((c, k) => foam.appendChild(el('circle', {
      cx: c.x.toFixed(0), cy: c.y.toFixed(0), r: c.r.toFixed(0),
      fill: 'none', stroke: '#fff', 'stroke-width': 4.5, style: `--k:${k}`
    })));

    // 반짝이 (가는 네 갈래 별)
    const star = (L, w) => `M0 ${-L} C ${w} ${-w} ${w} ${-w} ${L} 0 C ${w} ${w} ${w} ${w} 0 ${L} C ${-w} ${w} ${-w} ${w} ${-L} 0 C ${-w} ${-w} ${-w} ${-w} 0 ${-L} Z`;
    [[1040, 120, 22], [1480, 560, 16], [930, 840, 12], [1180, 470, 9], [1540, 90, 10], [760, 90, 14],
     [860, 360, 7], [1390, 900, 20], [700, 640, 8], [1300, 700, 6], [1010, 600, 5], [1560, 760, 7]]
      .forEach(([x, y, L], k) => {
        const g = el('g', { transform: `translate(${x} ${y})` });
        const inner = el('g', { class: 'tw', style: `--k:${k}` });
        inner.appendChild(el('path', { d: star(L, L * .07), fill: '#fff' }));
        if (L > 12) inner.appendChild(el('path', { d: star(L * .45, L * .04), fill: '#fff', transform: 'rotate(45)' }));
        g.appendChild(inner);
        stars.appendChild(g);
      });
    [[980, 200], [1120, 760], [820, 520], [1450, 380], [1230, 90], [900, 960]].forEach(([x, y]) =>
      stars.appendChild(el('circle', { cx: x, cy: y, r: 1.6, fill: '#fff', opacity: .8 })));
  })();

  function showContent(base) {
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
