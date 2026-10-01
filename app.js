(function () {
  const S = window.STUDENTS || [];
  const pad = n => String(n).padStart(2, '0');
  const or = (v, d = '미정') => (v && String(v).trim()) ? v : d;

  const SIL = '<svg class="sil" viewBox="0 0 100 110" fill="currentColor" aria-hidden="true">' +
    '<circle cx="50" cy="38" r="22"/><path d="M8 110c0-26 19-44 42-44s42 18 42 44z"/></svg>';

  // 일러스트 뒤 네모: 흰 종이 + 점 격자 위에 번진 파란 붓질, 끊긴 줄, 작은 문양
  const PBG = `<svg viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <pattern id="pbgDots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#0b1f4d" opacity=".35"/></pattern>
      <linearGradient id="pbgPaper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7f9fc"/><stop offset="1" stop-color="#e3ebf5"/></linearGradient>
      <filter id="pbgSoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>
      <filter id="pbgMid" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
    </defs>
    <rect width="400" height="520" fill="url(#pbgPaper)"/>
    <rect width="400" height="520" fill="url(#pbgDots)"/>
    <g filter="url(#pbgSoft)">
      <path d="M 430 60 C 330 90, 270 170, 230 280 C 210 360, 200 440, 210 560 L 330 560 C 330 440, 360 320, 430 250 Z" fill="#1f4fa8" opacity=".7"/>
      <path d="M 430 200 C 370 240, 330 320, 310 420 C 300 470, 300 520, 310 560 L 430 560 Z" fill="#06132e" opacity=".75"/>
      <path d="M 300 -20 C 260 60, 180 110, 60 140 L 90 170 C 200 150, 290 100, 360 -20 Z" fill="#6fa8dc" opacity=".8"/>
      <ellipse cx="330" cy="500" rx="70" ry="34" fill="#e0333a" opacity=".25"/>
    </g>
    <g filter="url(#pbgMid)">
      <path d="M 420 70 C 320 110, 220 200, 150 330" stroke="#ffffff" stroke-width="10" fill="none" opacity=".7"/>
      <path d="M 430 300 C 380 340, 350 410, 340 520" stroke="#0b1f4d" stroke-width="14" fill="none" opacity=".6"/>
    </g>
    <g fill="#6fa8dc" opacity=".9">
      <rect x="22" y="58" width="70" height="1.5"/><rect x="22" y="62" width="70" height="1.5"/><rect x="22" y="66" width="44" height="1.5"/>
      <rect x="250" y="40" width="58" height="1.2"/><rect x="250" y="44" width="58" height="1.2"/><rect x="250" y="48" width="30" height="1.2"/>
      <rect x="30" y="430" width="90" height="1.2"/><rect x="30" y="434" width="90" height="1.2"/><rect x="30" y="438" width="54" height="1.2"/><rect x="30" y="442" width="90" height="1.2"/>
    </g>
    <g fill="#0b1f4d">
      <rect x="0" y="210" width="400" height=".6" opacity=".25"/><rect x="0" y="380" width="400" height=".6" opacity=".25"/>
    </g>
    <text x="22" y="92" font-family="Bodoni Moda, serif" font-size="11" fill="#0b1f4d" opacity=".8">ark record</text>
    <text x="30" y="462" font-family="IBM Plex Mono, monospace" font-size="7" fill="#0b1f4d" opacity=".6" letter-spacing="1">NAKWON HIGH SCHOOL</text>
  </svg>`;

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
    pp.innerHTML = s.art ? `<div class="pframe"></div><div class="pbg">${PBG}</div><img class="cut" src="${s.art}" alt="${or(s.name, '')}">` : photo(s);
    P.querySelectorAll('.echo').forEach(e => {
      e.classList.toggle('art', !!s.art);
      e.innerHTML = s.art ? '' : photo(s);
      e.style.setProperty('--art', s.art ? `url("${s.art}")` : 'none');
    });
    $('pVName').textContent = or(s.name, '??????');
    $('pVEn').textContent = 'NOAH-' + pad(i + 1);
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
  for (let k = 0; k < 16; k++) {
    const r = Math.random() < .3 ? rnd(26, 60) : rnd(6, 22);
    const box = r * 1.3;
    const svg = el('svg', { width: box * 2, height: box * 2, viewBox: `${-box} ${-box} ${box * 2} ${box * 2}` });
    const d = blobPath(r);
    const len = 2 * Math.PI * r;
    svg.appendChild(el('path', { d, fill: 'none', stroke: '#a9d3e6', 'stroke-width': Math.max(1.6, r / 14) }));
    svg.appendChild(el('path', { d, fill: 'none', stroke: '#4f6f8f', 'stroke-width': Math.max(2.2, r / 9), 'stroke-linecap': 'round',
      'stroke-dasharray': `${(len * rnd(.06, .14)).toFixed(1)} ${(len * rnd(.2, .4)).toFixed(1)}`, 'stroke-dashoffset': rnd(0, len).toFixed(0) }));
    if (r > 26) { // 큰 거품엔 작은 거품이 붙음
      const d2 = blobPath(r * rnd(.25, .38)), ang = rnd(0, Math.PI * 2);
      svg.appendChild(el('path', { d: d2, transform: `translate(${(Math.cos(ang) * r).toFixed(1)} ${(Math.sin(ang) * r).toFixed(1)})`, fill: 'none', stroke: '#4f6f8f', 'stroke-width': 2 }));
    }
    svg.style.left = rnd(0, 100) + '%';
    svg.style.top = rnd(55, 105) + '%';
    svg.style.setProperty('--d', rnd(7, 14) + 's');
    svg.style.setProperty('--dl', rnd(.9, 5) + 's');
    svg.style.setProperty('--dx', rnd(-60, 60) + 'px');
    svg.style.setProperty('--r', rnd(-40, 40) + 'deg');
    fb.appendChild(svg);
  }

  // 캐릭터 뒤 눈금 빛살
  // 파도 무늬 (가는 흰 선) — 대: 오른쪽 아래 물결 비늘 / 중: 오른쪽 위 작은 물결 비늘 / 소: 이름 옆 물결 끝 문양
  (function buildWaves() {
    const svg = $('pWaves');
    function seigaiha(g, x0, x1, y0, y1, R) {
      const rows = Math.ceil((y1 - y0) / (R / 2)) + 1;
      for (let r = 0; r < rows; r++) {
        const y = y0 + r * R / 2, shift = r % 2 ? R : 0;
        for (let x = x0 - R + shift; x <= x1 + R; x += R * 2) {
          [1, .72, .44].forEach(f => g.appendChild(el('path', {
            d: `M ${x - R * f} ${y} A ${R * f} ${R * f} 0 0 1 ${x + R * f} ${y}`,
            fill: 'none', stroke: '#fff', 'stroke-width': f === 1 ? 1.1 : .7, opacity: f === 1 ? .55 : .35
          })));
        }
      }
    }
    seigaiha(svg.querySelector('.sei-l'), 860, 1620, 800, 1040, 44);
    seigaiha(svg.querySelector('.sei-s'), 1180, 1620, -10, 180, 20);
  })();

  // 물고기 떼: 오른쪽 위에 빽빽하게 몰려 있고, 오른쪽 아래로 흘러내리며 흩어진다
  (function buildFish() {
    const g = $('pFish').querySelector('.school');
    const FISH = 'M 0.5 0 C 0.38 -0.2, -0.1 -0.22, -0.3 -0.05 L -0.5 -0.18 L -0.42 0 L -0.5 0.18 L -0.3 0.05 C -0.1 0.22, 0.38 0.2, 0.5 0 Z';
    const pick = a => a[Math.floor(Math.random() * a.length)];
    const add = (x, y, len, ang, fill, op) => {
      g.appendChild(el('path', { d: FISH, fill, opacity: op.toFixed(2), transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${len.toFixed(1)})` }));
      if (len > 44 && Math.random() < .45) {
        const r = ang * Math.PI / 180;
        g.appendChild(el('circle', { cx: (x + Math.cos(r) * len * .3).toFixed(1), cy: (y + Math.sin(r) * len * .3).toFixed(1), r: (len * .03).toFixed(1), fill: '#fff', opacity: .9 }));
      }
    };
    const LIGHT = ['#e3f2fc', '#b7dcf4', '#8cc4ec'], MID = ['#4f8fd0', '#3473bd', '#2a63ad'], DEEP = ['#06132e', '#0b1f4d', '#13306a'];

    /* 1) 오른쪽 위: 모서리를 중심으로 휘도는 빽빽한 벽 (안쪽 진하고 바깥 가장자리 밝음) */
    const C = [1640, 40];
    const items = [];
    for (let i = 0; i < 380; i++) {
      const r = 120 + Math.pow(Math.random(), .85) * 500;
      const th = rnd(Math.PI * .5, Math.PI * 1.08);              // 모서리에서 왼쪽·아래쪽 사분면
      const x = C[0] + Math.cos(th) * r, y = C[1] + Math.sin(th) * r * .95;
      const edge = (r - 120) / 500;
      const pal = edge < .45 ? DEEP : edge < .78 ? MID : LIGHT;
      items.push([r, x, y, rnd(38, 92) * (1.1 - edge * .4), th * 180 / Math.PI - 90 + rnd(-10, 10), pick(pal), rnd(.88, 1)]);
    }
    items.sort((a, b) => b[0] - a[0]).forEach(([, x, y, l, a, c, o]) => add(x, y, l, a, c, o));

    /* 2) 오른쪽 아래: 벽에서 떨어져 나와 흘러내리며 흩어짐 (점점 작고 옅고 듬성듬성) */
    const flow = [[1180, 520], [1440, 600], [1520, 860], [1180, 1040]];
    const bz = t => { const u = 1 - t; return [0, 1].map(j => u*u*u*flow[0][j] + 3*u*u*t*flow[1][j] + 3*u*t*t*flow[2][j] + t*t*t*flow[3][j]); };
    for (let i = 0; i < 120; i++) {
      const t = Math.pow(Math.random(), 1.5);
      const [x, y] = bz(t), [x2, y2] = bz(Math.min(1, t + .01));
      const spread = 30 + t * 210;
      const ang = Math.atan2(y2 - y, x2 - x) * 180 / Math.PI;
      add(x + rnd(-spread, spread), y + rnd(-spread, spread) * .7, (58 - t * 40) * rnd(.7, 1.1), ang + rnd(-25, 25),
          t < .3 ? pick(MID.concat(DEEP)) : pick(LIGHT.concat(MID)), 1 - t * .55);
    }
    // 아주 멀리 흩어진 몇 마리
    for (let i = 0; i < 14; i++) add(rnd(900, 1560), rnd(700, 980), rnd(10, 20), rnd(60, 140), pick(LIGHT), rnd(.35, .6));
  })();

  // 흰 선: 오른쪽 위 덩어리에서 엉켜 나와 아래로 흩어지며 뻗는 가는 곡선
  (function buildWires() {
    const svg = $('pWires');
    const P = (x, y) => `${x.toFixed(0)} ${y.toFixed(0)}`;
    for (let i = 0; i < 30; i++) {
      const dense = i < 20;
      const x0 = rnd(1250, 1680), y0 = rnd(-80, 260);                          // 위쪽 덩어리 속에서 시작
      const c1 = [rnd(1050, 1450), rnd(150, 450)];
      const c2 = dense ? [rnd(1300, 1700), rnd(400, 700)] : [rnd(800, 1200), rnd(500, 900)];
      const end = dense ? [rnd(1250, 1680), rnd(700, 1080)] : [rnd(700, 1100), rnd(900, 1080)];
      const w = Math.random() < .2 ? rnd(1.6, 2.4) : rnd(.5, 1.05);
      svg.appendChild(el('path', {
        d: `M ${P(x0, y0)} C ${P(...c1)} ${P(...c2)} ${P(...end)}`,
        fill: 'none', stroke: '#fff', 'stroke-width': w.toFixed(2), opacity: (dense ? rnd(.55, .95) : rnd(.35, .6)).toFixed(2), pathLength: 1, style: `--k:${i}`
      }));
    }
    // 덩어리 위의 길쭉한 흰 조각
    for (let i = 0; i < 7; i++) {
      const L = rnd(140, 380), W = rnd(6, 18);
      svg.appendChild(el('path', {
        class: 'sliver',
        d: `M ${-L / 2} 0 Q 0 ${-W} ${L / 2} 0 Q 0 ${(W * .35).toFixed(1)} ${-L / 2} 0 Z`,
        fill: '#fff', opacity: rnd(.6, .95).toFixed(2),
        transform: `translate(${rnd(1200, 1580).toFixed(0)} ${rnd(60, 480).toFixed(0)}) rotate(${rnd(50, 120).toFixed(0)})`, style: `--k:${i}`
      }));
    }
  })();

  (function buildBurst() {
    const svg = $('pBurst');
    const g = el('g', {});
    const n = 16;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd(-.15, .15);
      const L = i === 3 ? 480 : rnd(140, 380);
      const start = rnd(0, 60);
      const x1 = Math.cos(a) * start, y1 = Math.sin(a) * start, x2 = Math.cos(a) * L, y2 = Math.sin(a) * L;
      g.appendChild(el('line', { x1, y1, x2, y2, stroke: '#fff', 'stroke-width': 1.4, opacity: .85 }));
      const tStart = L * rnd(.35, .6);
      g.appendChild(el('line', {
        x1: Math.cos(a) * tStart, y1: Math.sin(a) * tStart, x2, y2,
        stroke: '#fff', 'stroke-width': 7, opacity: .85,
        'stroke-dasharray': `1.4 ${rnd(4, 9).toFixed(1)} 1.4 2.4 1.4 ${rnd(10, 22).toFixed(1)}`
      }));
    }
    svg.appendChild(g);
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
