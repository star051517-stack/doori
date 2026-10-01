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
    card.innerHTML = `
      <span class="id-band"><span>방주 학생증</span><b>${no}</b></span>
      <span class="id-photo">${photo(s)}</span>
      <span class="id-text">
        <span class="id-name ${s.name ? '' : 'blank'}">${or(s.name, '??????')}</span>
        <span class="id-meta">${or(s.cls, '?')}반 · ${or(s.gender, '?')} </span>
      </span>
      `;
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

  /* 물속 기포 */
  const fb = P.querySelector('.flood-bubbles');
  for (let k = 0; k < 18; k++) {
    const b = document.createElement('span');
    const sz = 3 + Math.random() * 10;
    b.style.width = b.style.height = sz + 'px';
    b.style.left = Math.random() * 100 + '%';
    b.style.animationDuration = 3 + Math.random() * 5 + 's';
    b.style.animationDelay = (0.3 + Math.random() * 3) + 's';
    b.style.setProperty('--dx', (Math.random() * 40 - 20) + 'px');
    fb.appendChild(b);
  }

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
