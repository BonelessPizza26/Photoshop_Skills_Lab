/* ============================================================
   PHOTOSHOP SKILLS LAB – shared JavaScript (used on every page)
   Needs js/icons.js to be loaded first.
   ============================================================ */

/* ---------- 1. Navigation bar (built once, used on every page) ---------- */
const PAGES = [
  { href: 'index.html',      label: 'Home' },
  { href: 'workspace.html',  label: 'Workspace' },
  { href: 'tools.html',      label: 'Tools' },
  { href: 'editing.html',    label: 'Image Editing' },
  { href: 'layers.html',     label: 'Layers' },
  { href: 'filters.html',    label: 'Filters' },
  { href: 'playground.html', label: 'Playground', icon: 'palette' },
  { href: 'quiz.html',       label: 'Quiz', icon: 'trophy' }
];

function buildNav() {
  const here = location.pathname.split('/').pop() || 'index.html';
  const nav = document.createElement('nav');
  nav.className = 'site-nav';
  nav.innerHTML = `
    <div class="container nav-inner">
      <a class="logo" href="index.html"><span class="logo-mark">Ps</span> Skills Lab</a>
      <button class="burger" aria-label="Menu">${ic('menu')}</button>
      <ul class="nav-links">
        ${PAGES.map(p => `<li><a href="${p.href}" class="${p.href === here ? 'active' : ''}">${p.icon ? ic(p.icon) + ' ' : ''}${p.label}</a></li>`).join('')}
      </ul>
    </div>`;
  document.body.prepend(nav);

  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.prepend(bar);

  nav.querySelector('.burger').addEventListener('click', () => nav.querySelector('.nav-links').classList.toggle('open'));

  // footer + back-to-top button
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `<div class="container">Photoshop Skills Lab · Practise here, then try it for real in Photoshop! · Icons: Material Design Icons (Pictogrammers)</div>`;
  document.body.appendChild(footer);
  const top = document.createElement('button');
  top.id = 'to-top'; top.innerHTML = ic('arrow-up'); top.setAttribute('aria-label', 'Back to top');
  top.onclick = () => scrollTo({ top: 0 });
  document.body.appendChild(top);
}

/* ---------- 2. Scroll effects ---------- */
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

/* ---------- 3. Glow that follows the mouse on cards ---------- */
function initCardGlow() {
  document.addEventListener('pointermove', e => {
    const card = e.target.closest('.card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
}

/* ---------- 4. Toast message ----------
   toast('Saved!', 'check')  – the second part is an optional icon name   */
function toast(msg, icon = 'info') {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.innerHTML = ic(icon) + '<span></span>';
  t.querySelector('span').textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------- 5. Pop-up (modal) ----------
   openModal({ icon: 'brush', title: 'Brush', html: '<p>...</p>' })       */
function openModal({ icon = 'bulb', title = '', html = '' }) {
  let d = document.getElementById('modal');
  if (!d) {
    d = document.createElement('dialog');
    d.id = 'modal'; d.className = 'modal';
    document.body.appendChild(d);
    d.addEventListener('click', e => { if (e.target === d) d.close(); }); // click outside to close
  }
  d.innerHTML = `
    <div class="modal-head"><span class="big">${ic(icon)}</span><h2>${title}</h2>
      <button class="modal-close" aria-label="Close">${ic('close')}</button></div>
    <div class="modal-body">${html}</div>`;
  d.querySelector('.modal-close').onclick = () => d.close();
  d.showModal();
}

/* ---------- 6. "Mark as learnt" progress (saved in the browser) ---------- */
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
    const paint = on => { btn.classList.toggle('done', on); btn.innerHTML = on ? ic('check-circle') + ' I’ve learnt this' : ic('check') + ' Mark as learnt'; };
    paint(done.includes(id));
    btn.addEventListener('click', () => {
      const on = markDone(id); paint(on);
      if (on) { toast('Nice work! Progress saved', 'check-circle'); confetti(30); }
    });
  });
}

/* ---------- 7. Confetti celebration ---------- */
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

/* ---------- 8. Before/after sliders (any .compare element) ---------- */
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
  initScroll();
  initCardGlow();
  initLearnButtons();
  initCompare();
});
