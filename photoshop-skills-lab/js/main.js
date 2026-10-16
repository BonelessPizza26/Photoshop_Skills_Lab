/* ============================================================
   PHOTOSHOP SKILLS LAB – shared JavaScript (used on every page)
   ============================================================ */

/* ---------- 1. Navigation bar (built once, used on every page) ---------- */
const PAGES = [
  { href: 'index.html',      label: 'Home' },
  { href: 'workspace.html',  label: 'Workspace' },
  { href: 'tools.html',      label: 'Tools' },
  { href: 'editing.html',    label: 'Image Editing' },
  { href: 'layers.html',     label: 'Layers' },
  { href: 'filters.html',    label: 'Filters' },
  { href: 'playground.html', label: '🎨 Playground' },
  { href: 'quiz.html',       label: 'Quiz' }
];

function buildNav() {
  const here = location.pathname.split('/').pop() || 'index.html';
  const nav = document.createElement('nav');
  nav.className = 'site-nav';
  nav.innerHTML = `
    <div class="container nav-inner">
      <a class="logo" href="index.html"><span class="logo-mark">Ps</span> Skills Lab</a>
      <button class="burger" aria-label="Menu">☰</button>
      <ul class="nav-links">
        ${PAGES.map(p => `<li><a href="${p.href}" class="${p.href === here ? 'active' : ''}">${p.label}</a></li>`).join('')}
      </ul>
      <div class="level-switch" data-tip="Choose your course level">
        <button data-level="1">Level 1</button>
        <button data-level="2">Level 2</button>
      </div>
    </div>`;
  document.body.prepend(nav);

  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.prepend(bar);

  nav.querySelector('.burger').addEventListener('click', () => nav.querySelector('.nav-links').classList.toggle('open'));

  // footer + back-to-top button
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `<div class="container">Photoshop Skills Lab · UAL Level 1 &amp; Level 2 Digital · Practise here, then try it for real in Photoshop!</div>`;
  document.body.appendChild(footer);
  const top = document.createElement('button');
  top.id = 'to-top'; top.textContent = '↑'; top.setAttribute('aria-label', 'Back to top');
  top.onclick = () => scrollTo({ top: 0 });
  document.body.appendChild(top);
}

/* ---------- 2. Level 1 / Level 2 switch (remembered between pages) ---------- */
function getLevel() { try { return localStorage.getItem('psLevel') || '2'; } catch { return '2'; } }
function setLevel(l) {
  document.body.dataset.level = l;
  document.querySelectorAll('.level-switch button').forEach(b => b.classList.toggle('on', b.dataset.level === l));
  try { localStorage.setItem('psLevel', l); } catch {}
}
function initLevel() {
  setLevel(getLevel());
  document.querySelectorAll('.level-switch button').forEach(b =>
    b.addEventListener('click', () => {
      setLevel(b.dataset.level);
      toast(b.dataset.level === '1' ? '📘 Level 1 mode – the essentials' : '⭐ Level 2 mode – extra detail switched on');
    }));
}

/* ---------- 3. Scroll effects ---------- */
function initScroll() {
  const bar = document.getElementById('scroll-progress');
  const top = document.getElementById('to-top');
  addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
    top.classList.toggle('show', scrollY > 500);
  });
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ---------- 4. Glow that follows the mouse on cards ---------- */
function initCardGlow() {
  document.addEventListener('pointermove', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
}

/* ---------- 5. Toast message ---------- */
function toast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------- 6. Pop-up (modal) ----------
   openModal({ icon, title, html })                                       */
function openModal({ icon = '💡', title = '', html = '' }) {
  let d = document.getElementById('modal');
  if (!d) {
    d = document.createElement('dialog');
    d.id = 'modal'; d.className = 'modal';
    document.body.appendChild(d);
    d.addEventListener('click', e => { if (e.target === d) d.close(); }); // click outside to close
  }
  d.innerHTML = `
    <div class="modal-head"><span class="big">${icon}</span><h2>${title}</h2>
      <button class="modal-close" aria-label="Close">✕</button></div>
    <div class="modal-body">${html}</div>`;
  d.querySelector('.modal-close').onclick = () => d.close();
  d.showModal();
}

/* ---------- 7. "Mark as learnt" progress (saved in the browser) ---------- */
function getDone() { try { return JSON.parse(localStorage.getItem('psDone') || '[]'); } catch { return []; } }
function markDone(id) {
  const done = new Set(getDone());
  done.has(id) ? done.delete(id) : done.add(id);
  try { localStorage.setItem('psDone', JSON.stringify([...done])); } catch {}
  return done.has(id);
}
function initLearnButtons() {
  const done = getDone();
  document.querySelectorAll('.learn-btn').forEach(btn => {
    const id = btn.dataset.id;
    const paint = on => { btn.classList.toggle('done', on); btn.textContent = on ? '✓ I’ve learnt this' : 'Mark as learnt'; };
    paint(done.includes(id));
    btn.addEventListener('click', () => {
      const on = markDone(id); paint(on);
      if (on) { toast('Nice work! Progress saved ✅'); confetti(30); }
    });
  });
}

/* ---------- 8. Confetti celebration ---------- */
function confetti(n = 80) {
  const colours = ['#31a8ff', '#a855f7', '#ff4d8d', '#22c55e', '#facc15'];
  for (let i = 0; i < n; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = colours[i % colours.length];
    c.style.animationDuration = 1.8 + Math.random() * 1.8 + 's';
    c.style.animationDelay = Math.random() * .4 + 's';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4200);
  }
}

/* ---------- 9. Before/after sliders (any .compare element) ---------- */
function initCompare() {
  document.querySelectorAll('.compare').forEach(box => {
    const range = box.querySelector('input');
    const after = box.querySelector('.after');
    const handle = box.querySelector('.handle');
    const update = () => {
      after.style.clipPath = `inset(0 0 0 ${range.value}%)`;
      handle.style.left = range.value + '%';
    };
    range.addEventListener('input', update); update();
  });
}

/* ---------- start everything ---------- */
document.addEventListener('DOMContentLoaded', () => {
  buildNav();
  initLevel();
  initScroll();
  initCardGlow();
  initLearnButtons();
  initCompare();
});
