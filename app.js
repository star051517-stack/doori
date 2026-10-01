(function () {
  const S = window.STUDENTS || [];
  const pad = n => String(n).padStart(2, '0');
  const or = (v, d = '미정') => (v && String(v).trim()) ? v : d;

  const SIL = '<svg class="sil" viewBox="0 0 100 110" fill="currentColor" aria-hidden="true">' +
    '<circle cx="50" cy="38" r="22"/><path d="M8 110c0-26 19-44 42-44s42 18 42 44z"/></svg>';

  const photo = s => s.photo ? `<img src="${s.photo}" alt="${or(s.name, '')}">` : SIL;

  /* ---- 거품 ---- */
  const bubbles = document.querySelector('.bubbles');
  for (let i = 0; i < 22; i++) {
    const b = document.createElement('span');
    const size = 4 + Math.random() * 14;
    b.style.width = b.style.height = size + 'px';
    b.style.left = Math.random() * 100 + '%';
    b.style.animationDuration = 10 + Math.random() * 16 + 's';
    b.style.animationDelay = -Math.random() * 20 + 's';
    b.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
    bubbles.appendChild(b);
  }

  /* ---- 학생증 ---- */
  const rows = [document.getElementById('row1'), document.getElementById('row2')];
  S.forEach((s, i) => {
    const no = pad(i + 1);
    const card = document.createElement('button');
    card.className = 'idcard';
    card.style.setProperty('--tilt', ((i * 37) % 7 - 3) * 0.7 + 'deg');
    card.style.setProperty('--delay', (-(i * 0.9) % 6) + 's');
    card.setAttribute('aria-label', `${no}번 ${or(s.name, '이름 미정')} 프로필 열기`);
    card.innerHTML = `
      <span class="id-hole"></span>
      <span class="id-band">STUDENT ID <b>${no}</b></span>
      <span class="id-photo">${photo(s)}</span>
      <span class="id-text">
        <span class="id-name ${s.name ? '' : 'blank'}">${or(s.name, '??????')}</span>
        <span class="id-meta">${or(s.cls, '?')}반 · ${or(s.gender, '?')} <span class="noah">· NOAH-${no}</span></span>
      </span>
      <span class="barcode"></span>`;
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
    $('pNo').textContent = 'No.' + pad(i + 1);
    $('pPortrait').innerHTML = photo(s);
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
    $('pMemBar').style.width = '0';
    requestAnimationFrame(() => requestAnimationFrame(() => { $('pMemBar').style.width = m + '%'; }));

    $('pReason').innerHTML = (s.locked || !s.reason)
      ? redactions(4) + '<span class="locked-msg">기억 손상 · 열람 불가</span>'
      : s.reason;

    type($('pName'), or(s.name, '??????'));
  }

  function replay() {
    // 애니메이션 다시 재생
    P.classList.remove('open');
    void P.offsetWidth;
    P.classList.add('open');
  }

  function open(i) {
    lastFocus = document.activeElement;
    cur = i;
    fill(i);
    P.setAttribute('aria-hidden', 'false');
    document.body.classList.add('locked');
    replay();
    P.querySelector('.p-close').focus({ preventScroll: true });
  }

  function close() {
    P.classList.remove('open');
    P.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('locked');
    clearInterval(typer);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  function go(d) {
    cur = (cur + d + S.length) % S.length;
    fill(cur);
    replay();
  }

  P.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', close));
  $('pPrev').addEventListener('click', () => go(-1));
  $('pNext').addEventListener('click', () => go(1));

  document.addEventListener('keydown', e => {
    if (!P.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  });
})();
