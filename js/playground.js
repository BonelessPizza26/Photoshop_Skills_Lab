/* ============================================================
   PLAYGROUND – a mini Photoshop made with the HTML <canvas>.
   Sections:
     1. Setup & helpers        6. Selection tools
     2. Sample image           7. Fill / gradient / shape / text
     3. Undo & redo            8. Crop, move, zoom, eyedropper
     4. Tool list & UI         9. Menu commands, filters, adjustments
     5. Painting tools        10. Keyboard shortcuts & challenges
   ============================================================ */
(() => {
  /* ================= 1. SETUP & HELPERS ================= */
  const $ = id => document.getElementById(id);
  const cv = $('cv'), ctx = cv.getContext('2d', { willReadFrequently: true });
  const ov = $('ov'), octx = ov.getContext('2d');        // overlay: previews, cursors, crop box
  const ants = $('ants'), actx = ants.getContext('2d');  // "marching ants" selection outline
  const mk = (w = cv.width, h = cv.height) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const selC = mk(), sel = selC.getContext('2d', { willReadFrequently: true });       // selection mask (white = selected)
  const strokeC = mk(), sctx = strokeC.getContext('2d', { willReadFrequently: true }); // current brush stroke
  const tmpC = mk(), tctx = tmpC.getContext('2d');
  const dabC = mk(10, 10), dctx = dabC.getContext('2d');

  // Current settings (shown in the Options Bar)
  const S = {
    tool: 'brush', fg: '#ff4d8d', bg: '#ffffff', size: 30, hard: 70, op: 100, flow: 100,
    tol: 32, contiguous: true, marquee: 'rect', lasso: 'free', selMode: 'new',
    shape: 'rect', fillShape: true, dodge: 'dodge', text: 'Hello!', font: 'Poppins', fontSize: 64,
    ratio: 0, zoom: 1
  };

  let hasSel = false, edge = null, antsOff = { x: 0, y: 0 }, antsT = 0, antsImg = null;
  let mouse = null, preview = null;       // preview = function that draws on the overlay
  let cloneSrc = null, cloneOff = null, newSource = false;
  let stroke = null, adjBase = null;

  const W = () => cv.width, H = () => cv.height;
  const rgb = hex => [1, 3, 5].map(i => parseInt(hex.substr(i, 2), 16));
  const rgba = (hex, a) => `rgba(${rgb(hex).join(',')},${a})`;
  const copyCanvas = () => { const c = mk(); c.getContext('2d').drawImage(cv, 0, 0); return c; };
  function pos(e) {
    const r = ov.getBoundingClientRect();
    return { x: (e.clientX - r.left) * W() / r.width, y: (e.clientY - r.top) * H() / r.height };
  }
  function resizeAll(w, h) {
    [cv, ov, ants, selC, strokeC, tmpC].forEach(c => { c.width = w; c.height = h; });
    hasSel = false; edge = null; antsImg = null;
    $('st-size').textContent = `${w} × ${h} px`;
  }

  /* ================= 2. SAMPLE IMAGE (drawn with code) ================= */
  function drawScene(c) {
    const g = c.createLinearGradient(0, 0, 0, 320);
    g.addColorStop(0, '#2b1e5c'); g.addColorStop(.45, '#d9487d'); g.addColorStop(.75, '#ffa45b'); g.addColorStop(1, '#ffd27a');
    c.fillStyle = g; c.fillRect(0, 0, 800, 320);
    const sun = c.createRadialGradient(520, 250, 0, 520, 250, 110);
    sun.addColorStop(0, '#fff6c9'); sun.addColorStop(.6, '#ffd25c'); sun.addColorStop(1, 'rgba(255,210,92,0)');
    c.fillStyle = sun; c.beginPath(); c.arc(520, 250, 110, 0, 7); c.fill();
    c.fillStyle = '#fff1b8'; c.beginPath(); c.arc(520, 250, 55, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,.55)';
    [[160, 90, 80, 18], [210, 78, 50, 16], [650, 120, 70, 14], [610, 110, 40, 12]].forEach(([x, y, rx, ry]) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 7); c.fill(); });
    const poly = (pts, col) => { c.fillStyle = col; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.fill(); };
    poly([[0, 320], [120, 180], [230, 320]], '#5a2f6e');
    poly([[140, 320], [300, 140], [470, 320]], '#47265d');
    poly([[380, 320], [560, 200], [720, 320]], '#5a2f6e');
    poly([[600, 320], [720, 220], [800, 280], [800, 320]], '#3d2053');
    poly([[300, 140], [330, 175], [310, 170], [290, 185], [270, 165]], 'rgba(243,215,232,.8)');
    const lake = c.createLinearGradient(0, 320, 0, 500); lake.addColorStop(0, '#ff9e6b'); lake.addColorStop(1, '#3a2a6e');
    c.fillStyle = lake; c.fillRect(0, 320, 800, 180);
    [[345, 90, 6, .7], [365, 60, 4, .5], [385, 35, 3, .35]].forEach(([y, rx, ry, a]) => { c.fillStyle = `rgba(255,241,184,${a})`; c.beginPath(); c.ellipse(520, y, rx, ry, 0, 0, 7); c.fill(); });
    c.fillStyle = '#1d1233'; c.beginPath(); c.moveTo(0, 420); c.quadraticCurveTo(120, 395, 260, 430); c.lineTo(260, 500); c.lineTo(0, 500); c.fill();
    c.fillStyle = '#120a22'; c.fillRect(96, 300, 12, 120);
    c.fillStyle = '#1a0f2e'; [[102, 290, 44], [70, 320, 30], [135, 318, 32]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); });
    poly([[600, 410], [700, 410], [685, 428], [615, 428]], '#1a0f2e');
    c.fillRect(648, 360, 4, 50);
    poly([[652, 362], [652, 405], [690, 405]], '#f7e0c4');
    c.strokeStyle = '#2b1e5c'; c.lineWidth = 3; c.lineCap = 'round';
    c.beginPath(); c.moveTo(330, 100); c.quadraticCurveTo(340, 90, 350, 100); c.quadraticCurveTo(360, 90, 370, 100); c.stroke();
    c.beginPath(); c.moveTo(380, 70); c.quadraticCurveTo(387, 63, 394, 70); c.quadraticCurveTo(401, 63, 408, 70); c.stroke();
  }
  function loadSample() { resizeAll(800, 500); ctx.clearRect(0, 0, 800, 500); drawScene(ctx); }

  /* ================= 3. UNDO & REDO ================= */
  const undoStack = [], redoStack = [];
  const snap = () => ({ w: W(), h: H(), data: ctx.getImageData(0, 0, W(), H()) });
  function restore(s) { if (s.w !== W() || s.h !== H()) resizeAll(s.w, s.h); ctx.putImageData(s.data, 0, 0); }
  function pushUndo() { commitAdj(); undoStack.push(snap()); if (undoStack.length > 30) undoStack.shift(); redoStack.length = 0; }
  function undo() { if (adjBase) { cancelAdj(); return toast('Adjustment cancelled', 'undo'); } if (!undoStack.length) return toast('Nothing to undo', 'undo'); redoStack.push(snap()); restore(undoStack.pop()); toast('Undo', 'undo'); }
  function redo() { if (!redoStack.length) return toast('Nothing to redo', 'redo'); undoStack.push(snap()); restore(redoStack.pop()); toast('Redo', 'redo'); }

  /* ================= 4. TOOL LIST & UI ================= */
  const TOOLS = [
    { id: 'move', icon: 'move', name: 'Move Tool', key: 'V', opts: [],
      how: 'Drag to move the <strong>selected pixels</strong>. With no selection, the whole image moves (leaving transparent pixels behind – the checkerboard).<br><br>Try: make a selection around the boat, then drag it somewhere else.' },
    { id: 'marquee', icon: 'marquee', name: 'Marquee Tool', key: 'M', opts: ['marquee', 'selMode'],
      how: 'Drag to draw a selection. <strong>Shift</strong> = add to it, <strong>Alt</strong> = take away. <kbd>Ctrl</kbd>+<kbd>D</kbd> deselects.<br><br>Anything you do next (paint, fill, filters, adjustments) only happens <em>inside</em> the selection.' },
    { id: 'lasso', icon: 'lasso', name: 'Lasso Tool', key: 'L', opts: ['lasso', 'selMode'],
      how: '<strong>Freehand:</strong> hold the mouse and draw round an object.<br><strong>Polygonal:</strong> click from corner to corner, then click the first point (or double-click) to finish. <kbd>Esc</kbd> cancels.' },
    { id: 'wand', icon: 'wand', name: 'Magic Wand', key: 'W', opts: ['tol', 'contiguous', 'selMode'],
      how: 'Click a colour to select it. <strong>Tolerance</strong> controls how similar colours must be: low = fussy, high = selects more.<br><br>Try: click the sun with tolerance 40, then use Adjustments › Hue.' },
    { id: 'crop', icon: 'crop', name: 'Crop Tool', key: 'C', opts: ['ratio', 'cropBtns'],
      how: 'Drag a box over the part you want to keep, then press <kbd>Enter</kbd> or the Apply button. Use the grid lines to follow the <strong>rule of thirds</strong>.' },
    { id: 'eyedropper', icon: 'eyedropper', name: 'Eyedropper', key: 'I', opts: [],
      how: 'Click anywhere on the image to pick up that colour as your foreground colour.<br><br>Shortcut: while using the Brush, hold <kbd>Alt</kbd> and click.' },
    { id: 'brush', icon: 'brush', name: 'Brush Tool', key: 'B', opts: ['size', 'hard', 'op', 'flow'],
      how: 'Paint with the foreground colour. <kbd>[</kbd> and <kbd>]</kbd> change the size. Number keys set opacity (5 = 50%, 0 = 100%).<br><br><strong>Hardness</strong> 0% = soft edge. <strong>Opacity</strong> limits each stroke. <strong>Flow</strong> builds up slowly.' },
    { id: 'pencil', icon: 'pencil', name: 'Pencil Tool', key: 'B', opts: ['size', 'op'],
      how: 'Hard-edged square pixels – perfect for pixel art. Zoom in (View menu) and set size to 4–10 px.' },
    { id: 'eraser', icon: 'eraser', name: 'Eraser Tool', key: 'E', opts: ['size', 'hard', 'op', 'flow'],
      how: 'Removes pixels to show transparency (checkerboard). Low opacity fades things gently.<br><br>Pro tip: in real Photoshop, a Layer Mask is safer than erasing.' },
    { id: 'bucket', icon: 'bucket', name: 'Paint Bucket', key: 'G', opts: ['tol', 'contiguous', 'op'],
      how: 'Click an area to fill similar colours with the foreground colour. Tolerance works like the Magic Wand.<br><br>Press <kbd>G</kbd> again to switch to the Gradient tool.' },
    { id: 'gradient', icon: 'gradient', name: 'Gradient Tool', key: 'G', opts: ['op'],
      how: 'Drag across the image. It blends from the <strong>foreground</strong> to the <strong>background</strong> colour. A short drag = a sharp change, a long drag = a smooth blend.<br><br>Try: select the sky with the Magic Wand first!' },
    { id: 'clone', icon: 'clone', name: 'Clone Stamp', key: 'S', opts: ['size', 'hard', 'op', 'cloneBtn'],
      how: '<strong>Step 1:</strong> hold <kbd>Alt</kbd> (Mac: <kbd>Option</kbd>) and click the area to copy FROM – or press “Pick source”.<br><strong>Step 2:</strong> paint somewhere else. A + shows where it is copying from.<br><br>Try: remove the boat by cloning the water over it.' },
    { id: 'heal', icon: 'heal', name: 'Spot Healing Brush', key: 'J', opts: ['size'],
      how: 'Paint over a small object or mark (it turns red). When you let go, Photoshop fills it in using the pixels around it.<br><br>Try: remove the birds or the tree!' },
    { id: 'blur', icon: 'blur', name: 'Blur Tool', key: '', opts: ['size', 'op'],
      how: 'Paint to soften areas. Higher opacity = stronger blur. Paint over the same place to blur more.' },
    { id: 'dodge', icon: 'dodge', name: 'Dodge / Burn / Sponge', key: 'O', opts: ['dodge', 'size', 'op'],
      how: '<strong>Dodge</strong> lightens, <strong>Burn</strong> darkens, <strong>Sponge</strong> adds or removes colour. Use a low opacity and build it up.' },
    { id: 'text', icon: 'text', name: 'Type Tool', key: 'T', opts: ['text', 'font', 'fontSize', 'op'],
      how: 'Type your words in the Options Bar, choose a font and size, then click on the image to place the text. It uses the foreground colour.' },
    { id: 'shape', icon: 'shape', name: 'Shape Tool', key: 'U', opts: ['shape', 'fillShape', 'size', 'op'],
      how: 'Drag to draw a shape in the foreground colour. Hold <kbd>Shift</kbd> for a perfect square or circle. Untick “Fill” for an outline (size = line thickness).' },
    { id: 'zoom', icon: 'zoom', name: 'Zoom Tool', key: 'Z', opts: ['zoomBtns'],
      how: 'Click to zoom in. <kbd>Alt</kbd>+click zooms out. Scroll the image area to move around. Zooming never changes your image.' }
  ];
  const tool = () => TOOLS.find(t => t.id === S.tool);

  // Options Bar controls
  const OPT = {
    size:  () => `<label class="opt">Size <input type="range" data-o="size" min="1" max="200" value="${S.size}"><output>${S.size}px</output></label>`,
    hard:  () => `<label class="opt">Hardness <input type="range" data-o="hard" min="0" max="100" value="${S.hard}"><output>${S.hard}%</output></label>`,
    op:    () => `<label class="opt">Opacity <input type="range" data-o="op" min="1" max="100" value="${S.op}"><output>${S.op}%</output></label>`,
    flow:  () => `<label class="opt">Flow <input type="range" data-o="flow" min="1" max="100" value="${S.flow}"><output>${S.flow}%</output></label>`,
    tol:   () => `<label class="opt">Tolerance <input type="range" data-o="tol" min="0" max="255" value="${S.tol}"><output>${S.tol}</output></label>`,
    fontSize: () => `<label class="opt">Size <input type="range" data-o="fontSize" min="10" max="200" value="${S.fontSize}"><output>${S.fontSize}pt</output></label>`,
    contiguous: () => `<label class="opt"><input type="checkbox" data-o="contiguous" ${S.contiguous ? 'checked' : ''}> Contiguous</label>`,
    fillShape:  () => `<label class="opt"><input type="checkbox" data-o="fillShape" ${S.fillShape ? 'checked' : ''}> Fill</label>`,
    marquee: () => sel_('marquee', [['rect', 'Rectangle'], ['ellipse', 'Ellipse']]),
    lasso:   () => sel_('lasso', [['free', 'Freehand lasso'], ['poly', 'Polygonal lasso']]),
    selMode: () => sel_('selMode', [['new', 'New selection'], ['add', 'Add (Shift)'], ['sub', 'Subtract (Alt)']]),
    shape:   () => sel_('shape', [['rect', 'Rectangle'], ['ellipse', 'Ellipse'], ['tri', 'Triangle'], ['line', 'Line']]),
    dodge:   () => sel_('dodge', [['dodge', 'Dodge (lighten)'], ['burn', 'Burn (darken)'], ['sat', 'Sponge – saturate'], ['desat', 'Sponge – desaturate']]),
    font:    () => sel_('font', [['Poppins', 'Poppins'], ['Inter', 'Inter'], ['Georgia', 'Georgia (serif)'], ['Impact', 'Impact'], ['Courier New', 'Courier'], ['Comic Sans MS', 'Comic Sans']]),
    ratio:   () => sel_('ratio', [['0', 'Free ratio'], ['1', '1:1 square'], ['1.7778', '16:9'], ['0.8', '4:5'], ['1.5', '3:2']]),
    text:    () => `<label class="opt">Text <input type="text" data-o="text" value="${S.text.replace(/"/g, '&quot;')}" style="width:160px"></label>`,
    cropBtns: () => `<button class="btn btn-small btn-primary" data-cmd="cropApply">${ic('check')} Apply</button><button class="btn btn-small" data-cmd="cropCancel">${ic('close')} Cancel</button>`,
    cloneBtn: () => `<button class="btn btn-small ${newSource ? 'is-on' : ''}" data-cmd="pickSource">${ic('target')} Pick source</button><span class="muted">${cloneSrc ? 'Source set' : 'No source yet'}</span>`,
    zoomBtns: () => `<button class="btn btn-small" data-cmd="zin">${ic('zoom')}</button><button class="btn btn-small" data-cmd="zout">${ic('zoom-out')}</button><button class="btn btn-small" data-cmd="zfit">Fit</button>`
  };
  function sel_(key, list) {
    return `<label class="opt"><select data-o="${key}" style="width:auto">${list.map(([v, l]) =>
      `<option value="${v}" ${String(S[key]) === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`;
  }

  function buildToolbar() {
    $('toolbar').innerHTML = TOOLS.map(t =>
      `<button data-tool="${t.id}" data-tip="${t.name}${t.key ? ' (' + t.key + ')' : ''}" aria-label="${t.name}">${ic(t.icon)}</button>`).join('');
    $('toolbar').querySelectorAll('button').forEach(b => b.onclick = () => setTool(b.dataset.tool));
  }
  function setTool(id) {
    finishPoly(false); cropBox = null;
    S.tool = id; preview = null;
    const t = tool();
    $('toolbar').querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.tool === id));
    $('ti-title').innerHTML = `${ic(t.icon)} ${t.name} ${t.key ? `<kbd>${t.key}</kbd>` : ''}`;
    $('ti-how').innerHTML = t.how;
    buildOptions();
    ov.style.cursor = { move: 'move', zoom: 'zoom-in', text: 'text', eyedropper: 'copy' }[id] || 'crosshair';
    drawOverlay();
  }
  function buildOptions() {
    const t = tool();
    $('options').innerHTML = `<strong style="margin-right:4px;display:flex;align-items:center;gap:6px">${ic(t.icon)} ${t.name}</strong>` + (t.opts.map(o => OPT[o]()).join('') || '<span class="muted">No options for this tool</span>');
    $('options').querySelectorAll('[data-o]').forEach(inp => {
      const k = inp.dataset.o;
      inp.addEventListener('input', () => {
        S[k] = inp.type === 'checkbox' ? inp.checked : inp.type === 'range' ? +inp.value : (k === 'ratio' ? +inp.value : inp.value);
        const out = inp.parentElement.querySelector('output');
        if (out) out.textContent = inp.value + ({ size: 'px', hard: '%', op: '%', flow: '%', fontSize: 'pt' }[k] || '');
        drawOverlay();
      });
    });
    bindCmds($('options'));
  }

  /* ================= 5. PAINTING TOOLS ================= */
  const PAINT = ['brush', 'pencil', 'eraser', 'clone', 'heal', 'blur', 'dodge'];

  function strokeStart(p, e) {
    if (S.tool === 'clone') {
      if (e.altKey || newSource) {
        cloneSrc = { ...p }; newSource = false; cloneOff = null; buildOptions();
        toast('Source set – now paint somewhere else', 'target'); return false;
      }
      if (!cloneSrc) { toast('First Alt+click (or press “Pick source”) to choose where to copy from', 'clone'); return false; }
      if (!cloneOff) cloneOff = { x: cloneSrc.x - p.x, y: cloneSrc.y - p.y };
    }
    if ((S.tool === 'brush' || S.tool === 'pencil') && e.altKey) { pickColour(p); return false; }
    pushUndo();
    let src = null;
    if (S.tool === 'clone') src = copyCanvas();
    if (S.tool === 'blur' || S.tool === 'dodge') {
      src = mk(); const c = src.getContext('2d');
      c.drawImage(cv, 0, 0);
      c.filter = S.tool === 'blur' ? 'blur(4px)' : { dodge: 'brightness(1.45)', burn: 'brightness(0.6) saturate(1.2)', sat: 'saturate(2.2)', desat: 'saturate(0)' }[S.dodge];
      c.drawImage(cv, 0, 0);
    }
    stroke = { base: ctx.getImageData(0, 0, W(), H()), src, last: p };
    sctx.clearRect(0, 0, W(), H());
    dab(p); composite();
    return true;
  }
  function strokeMove(p) {
    const d = Math.hypot(p.x - stroke.last.x, p.y - stroke.last.y);
    const step = Math.max(1, S.size * (S.tool === 'pencil' ? .25 : .12));
    if (d < step) return;
    for (let i = step; i <= d; i += step) dab({ x: stroke.last.x + (p.x - stroke.last.x) * i / d, y: stroke.last.y + (p.y - stroke.last.y) * i / d });
    stroke.last = p; composite();
  }
  function strokeEnd() { if (S.tool === 'heal') heal(); stroke = null; }

  function softDisc(c, x, y, r, colour, alpha) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    const hard = S.tool === 'heal' ? .99 : Math.min(S.hard / 100, .99);
    g.addColorStop(0, rgba(colour, alpha)); g.addColorStop(hard, rgba(colour, alpha)); g.addColorStop(1, rgba(colour, 0));
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  }
  function dab(p) {
    const r = Math.max(.5, S.size / 2), flow = S.flow / 100;
    switch (S.tool) {
      case 'brush':  softDisc(sctx, p.x, p.y, r, S.fg, flow); break;
      case 'eraser': softDisc(sctx, p.x, p.y, r, '#000000', flow); break;
      case 'heal':   softDisc(sctx, p.x, p.y, r, '#ff2050', 1); break;
      case 'pencil': sctx.fillStyle = S.fg; sctx.fillRect(Math.round(p.x - r), Math.round(p.y - r), Math.max(1, Math.round(S.size)), Math.max(1, Math.round(S.size))); break;
      default: { // clone, blur, dodge: copy a soft circle from the source image
        const off = S.tool === 'clone' ? cloneOff : { x: 0, y: 0 };
        const d = Math.ceil(r * 2) + 2;
        if (dabC.width !== d) { dabC.width = dabC.height = d; }
        dctx.globalCompositeOperation = 'source-over'; dctx.clearRect(0, 0, d, d);
        dctx.drawImage(stroke.src, -(p.x + off.x - d / 2), -(p.y + off.y - d / 2));
        dctx.globalCompositeOperation = 'destination-in';
        softDisc(dctx, d / 2, d / 2, r, '#000000', S.tool === 'clone' ? 1 : .35);
        sctx.drawImage(dabC, p.x - d / 2, p.y - d / 2);
      }
    }
  }
  function composite() {
    ctx.putImageData(stroke.base, 0, 0);
    let layer = strokeC;
    if (hasSel) { // only paint inside the selection
      tctx.globalCompositeOperation = 'source-over'; tctx.clearRect(0, 0, W(), H());
      tctx.drawImage(strokeC, 0, 0); tctx.globalCompositeOperation = 'destination-in'; tctx.drawImage(selC, 0, 0);
      layer = tmpC;
    }
    ctx.save();
    ctx.globalAlpha = S.tool === 'heal' ? .5 : S.op / 100;
    ctx.globalCompositeOperation = S.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.drawImage(layer, 0, 0);
    ctx.restore();
  }

  // Spot Healing: fill the painted area by blending in the colours around it
  function heal() {
    const w = W(), h = H(), sd = sctx.getImageData(0, 0, w, h).data;
    const selD = hasSel ? sel.getImageData(0, 0, w, h).data : null;
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (sd[(y * w + x) * 4 + 3] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    const img = new ImageData(new Uint8ClampedArray(stroke.base.data), w, h);
    if (x1 < 0) { ctx.putImageData(img, 0, 0); return; }
    x0 = Math.max(1, x0); y0 = Math.max(1, y0); x1 = Math.min(w - 2, x1); y1 = Math.min(h - 2, y1);
    const d = img.data, list = [];
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const i = y * w + x;
      if (sd[i * 4 + 3] > 10 && (!selD || selD[i * 4 + 3] > 127)) list.push(i * 4);
    }
    const f = new Float32Array(d);
    const avg = [0, 0, 0, 0]; let n = 0;  // start from the average of the surrounding border
    for (let x = x0 - 1; x <= x1 + 1; x++) for (const y of [y0 - 1, y1 + 1]) { const j = (y * w + x) * 4; for (let c = 0; c < 4; c++) avg[c] += f[j + c]; n++; }
    list.forEach(j => { for (let c = 0; c < 4; c++) f[j + c] = avg[c] / n; });
    const iters = Math.min(350, Math.max(x1 - x0, y1 - y0) * 1.5 + 20), row = w * 4;
    for (let it = 0; it < iters; it++) {
      const L = list.length;
      for (let k = 0; k < L; k++) {
        const j = list[it % 2 ? L - 1 - k : k];
        for (let c = 0; c < 4; c++) f[j + c] = (f[j - 4 + c] + f[j + 4 + c] + f[j - row + c] + f[j + row + c]) / 4;
      }
    }
    list.forEach(j => { const nz = (Math.random() - .5) * 10; for (let c = 0; c < 3; c++) d[j + c] = f[j + c] + nz; d[j + 3] = f[j + 3]; });
    ctx.putImageData(img, 0, 0);
    toast('Healed!', 'heal');
  }

  /* ================= 6. SELECTION TOOLS ================= */
  function modeFrom(e) { return e.shiftKey ? 'add' : e.altKey ? 'sub' : S.selMode; }
  function selCommit(drawFn, mode) {
    if (mode === 'new') sel.clearRect(0, 0, W(), H());
    sel.save();
    sel.globalCompositeOperation = mode === 'sub' ? 'destination-out' : 'source-over';
    sel.fillStyle = '#fff';
    drawFn(sel);
    sel.restore();
    updateSel();
  }
  function updateSel() {
    const w = W(), h = H(), d = sel.getImageData(0, 0, w, h).data, pts = [];
    let any = false;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4 + 3;
      if (d[i] > 127) {
        any = true;
        if (x === 0 || y === 0 || x === w - 1 || y === h - 1 || d[i - 4] <= 127 || d[i + 4] <= 127 || d[i - w * 4] <= 127 || d[i + w * 4] <= 127) pts.push(x, y);
      }
    }
    hasSel = any; edge = any ? pts : null; drawAnts();
  }
  function deselect() { sel.clearRect(0, 0, W(), H()); hasSel = false; edge = null; drawAnts(); }
  function drawAnts() {
    actx.clearRect(0, 0, W(), H());
    if (!edge) return;
    if (!antsImg || antsImg.width !== W() || antsImg.height !== H()) antsImg = actx.createImageData(W(), H());
    const d = antsImg.data; d.fill(0);
    for (let k = 0; k < edge.length; k += 2) {
      const x = edge[k], y = edge[k + 1], j = (y * W() + x) * 4, v = ((x + y + antsT) >> 2) & 1 ? 0 : 255;
      d[j] = d[j + 1] = d[j + 2] = v; d[j + 3] = 255;
    }
    actx.putImageData(antsImg, Math.round(antsOff.x), Math.round(antsOff.y));
  }
  setInterval(() => { if (edge) { antsT++; drawAnts(); } }, 120);

  function rectFrom(a, b, square) {
    let w = b.x - a.x, h = b.y - a.y;
    if (square) { const s = Math.max(Math.abs(w), Math.abs(h)); w = Math.sign(w || 1) * s; h = Math.sign(h || 1) * s; }
    return { x: Math.min(a.x, a.x + w), y: Math.min(a.y, a.y + h), w: Math.abs(w), h: Math.abs(h) };
  }
  function pathRect(c, r, ellipse) {
    c.beginPath();
    if (ellipse) c.ellipse(r.x + r.w / 2, r.y + r.h / 2, Math.max(r.w / 2, .5), Math.max(r.h / 2, .5), 0, 0, Math.PI * 2);
    else c.rect(r.x, r.y, r.w, r.h);
  }

  // Flood fill used by the Magic Wand and Paint Bucket
  function flood(data, w, h, sx, sy, tol, contiguous) {
    const out = new Uint8Array(w * h), i0 = (sy * w + sx) * 4;
    const r0 = data[i0], g0 = data[i0 + 1], b0 = data[i0 + 2], a0 = data[i0 + 3];
    const match = i => { const j = i * 4; return Math.abs(data[j] - r0) <= tol && Math.abs(data[j + 1] - g0) <= tol && Math.abs(data[j + 2] - b0) <= tol && Math.abs(data[j + 3] - a0) <= tol; };
    if (!contiguous) { for (let i = 0; i < w * h; i++) if (match(i)) out[i] = 1; return out; }
    const seen = new Uint8Array(w * h), stack = [sy * w + sx];
    while (stack.length) {
      const i = stack.pop();
      if (seen[i]) continue; seen[i] = 1;
      if (!match(i)) continue;
      out[i] = 1;
      const x = i % w;
      if (x > 0) stack.push(i - 1); if (x < w - 1) stack.push(i + 1);
      if (i >= w) stack.push(i - w); if (i < w * (h - 1)) stack.push(i + w);
    }
    return out;
  }

  let poly = null; // points for the polygonal lasso
  function finishPoly(commit, mode) {
    if (!poly) return;
    if (commit && poly.pts.length > 2) selCommit(c => { c.beginPath(); poly.pts.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)); c.closePath(); c.fill(); }, mode || poly.mode);
    poly = null; preview = null; drawOverlay();
  }

  /* ================= 7. FILL, GRADIENT, SHAPE, TEXT ================= */
  // Run a drawing function on a copy of the image, then put the result back (inside the selection only)
  function applyProcessed(fn, { replace = false, alpha = 1 } = {}) {
    const src = copyCanvas(), p = mk(), pc = p.getContext('2d');
    fn(pc, src);
    if (hasSel) { pc.globalCompositeOperation = 'destination-in'; pc.drawImage(selC, 0, 0); }
    ctx.save();
    if (replace) {
      if (hasSel) { ctx.globalCompositeOperation = 'destination-out'; ctx.drawImage(selC, 0, 0); ctx.globalCompositeOperation = 'source-over'; }
      else ctx.clearRect(0, 0, W(), H());
    }
    ctx.globalAlpha = alpha; ctx.drawImage(p, 0, 0);
    ctx.restore();
  }
  function bucket(p) {
    pushUndo();
    const w = W(), h = H(), img = ctx.getImageData(0, 0, w, h), d = img.data;
    const out = flood(d, w, h, Math.floor(p.x), Math.floor(p.y), S.tol, S.contiguous);
    const sd = hasSel ? sel.getImageData(0, 0, w, h).data : null;
    const [r, g, b] = rgb(S.fg), a = S.op / 100;
    for (let i = 0; i < w * h; i++) {
      if (!out[i] || (sd && sd[i * 4 + 3] < 128)) continue;
      const j = i * 4, sa = d[j + 3] / 255, oa = a + sa * (1 - a);
      d[j] = (r * a + d[j] * sa * (1 - a)) / oa; d[j + 1] = (g * a + d[j + 1] * sa * (1 - a)) / oa; d[j + 2] = (b * a + d[j + 2] * sa * (1 - a)) / oa; d[j + 3] = oa * 255;
    }
    ctx.putImageData(img, 0, 0);
  }
  function drawShape(c, a, b, shift) {
    const r = rectFrom(a, b, shift && S.shape !== 'line');
    c.fillStyle = S.fg; c.strokeStyle = S.fg; c.lineWidth = Math.max(1, S.size / 3); c.lineJoin = 'round'; c.lineCap = 'round';
    c.beginPath();
    if (S.shape === 'line') { c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); return; }
    if (S.shape === 'rect') c.rect(r.x, r.y, r.w, r.h);
    if (S.shape === 'ellipse') c.ellipse(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, r.h / 2, 0, 0, Math.PI * 2);
    if (S.shape === 'tri') { c.moveTo(r.x + r.w / 2, r.y); c.lineTo(r.x + r.w, r.y + r.h); c.lineTo(r.x, r.y + r.h); c.closePath(); }
    S.fillShape ? c.fill() : c.stroke();
  }
  function drawText(c, p) {
    c.font = `800 ${S.fontSize * 1.33}px "${S.font}", sans-serif`;
    c.fillStyle = S.fg; c.textBaseline = 'middle';
    c.fillText(S.text, p.x, p.y);
  }

  /* ================= 8. CROP, MOVE, ZOOM, EYEDROPPER ================= */
  let cropBox = null;
  function cropFrom(a, b) {
    let w = b.x - a.x, h = b.y - a.y;
    if (S.ratio) { const s = Math.sign(h || 1); h = s * Math.abs(w) / S.ratio; }
    let r = { x: Math.min(a.x, a.x + w), y: Math.min(a.y, a.y + h), w: Math.abs(w), h: Math.abs(h) };
    r.x = Math.max(0, r.x); r.y = Math.max(0, r.y); r.w = Math.min(r.w, W() - r.x); r.h = Math.min(r.h, H() - r.y);
    return r;
  }
  function cropApply() {
    if (!cropBox || cropBox.w < 4 || cropBox.h < 4) return toast('Drag a crop box first', 'crop');
    pushUndo();
    const r = { x: Math.round(cropBox.x), y: Math.round(cropBox.y), w: Math.round(cropBox.w), h: Math.round(cropBox.h) };
    const data = ctx.getImageData(r.x, r.y, r.w, r.h);
    resizeAll(r.w, r.h); ctx.putImageData(data, 0, 0);
    cropBox = null; preview = null; drawOverlay(); drawAnts();
    toast(`Cropped to ${r.w} × ${r.h} px`, 'crop');
  }
  function pickColour(p) {
    const [r, g, b, a] = ctx.getImageData(Math.floor(p.x), Math.floor(p.y), 1, 1).data;
    if (a === 0) return toast('That pixel is transparent', 'eyedropper');
    S.fg = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    paintSwatches(); toast('Picked ' + S.fg.toUpperCase(), 'eyedropper');
  }
  const ZOOMS = [.5, .75, 1, 1.5, 2, 3, 4, 6];
  function zoom(dir) {
    let i = ZOOMS.indexOf(S.zoom);
    S.zoom = dir === 0 ? 1 : ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, i + dir))];
    $('canvas-wrap').style.width = S.zoom * 100 + '%';
    $('st-zoom').textContent = Math.round(S.zoom * 100) + '%';
  }
  let moving = null;

  /* ================= OVERLAY (previews & cursor) ================= */
  function drawOverlay() {
    octx.clearRect(0, 0, W(), H());
    if (preview) preview(octx);
    if (cropBox) {
      octx.fillStyle = 'rgba(0,0,0,.55)';
      octx.beginPath(); octx.rect(0, 0, W(), H()); octx.rect(cropBox.x, cropBox.y, cropBox.w, cropBox.h); octx.fill('evenodd');
      octx.strokeStyle = '#fff'; octx.lineWidth = 2; octx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);
      octx.lineWidth = 1; octx.strokeStyle = 'rgba(255,255,255,.6)'; octx.beginPath();
      for (let k = 1; k < 3; k++) {
        octx.moveTo(cropBox.x + cropBox.w * k / 3, cropBox.y); octx.lineTo(cropBox.x + cropBox.w * k / 3, cropBox.y + cropBox.h);
        octx.moveTo(cropBox.x, cropBox.y + cropBox.h * k / 3); octx.lineTo(cropBox.x + cropBox.w, cropBox.y + cropBox.h * k / 3);
      }
      octx.stroke();
    }
    if (!mouse) return;
    if (PAINT.includes(S.tool) || (S.tool === 'shape' && !S.fillShape)) {
      octx.lineWidth = 1.5; octx.strokeStyle = 'rgba(0,0,0,.8)';
      octx.beginPath(); octx.arc(mouse.x, mouse.y, Math.max(1, S.size / 2), 0, Math.PI * 2); octx.stroke();
      octx.strokeStyle = 'rgba(255,255,255,.9)'; octx.beginPath(); octx.arc(mouse.x, mouse.y, Math.max(1, S.size / 2) + 1.5, 0, Math.PI * 2); octx.stroke();
    }
    if (S.tool === 'clone' && cloneSrc) {
      const c = stroke && cloneOff ? { x: mouse.x + cloneOff.x, y: mouse.y + cloneOff.y } : cloneSrc;
      octx.strokeStyle = '#fff'; octx.lineWidth = 2; octx.beginPath();
      octx.moveTo(c.x - 10, c.y); octx.lineTo(c.x + 10, c.y); octx.moveTo(c.x, c.y - 10); octx.lineTo(c.x, c.y + 10); octx.stroke();
    }
    if (S.tool === 'text' && !preview) { octx.globalAlpha = .6; drawText(octx, mouse); octx.globalAlpha = 1; }
  }

  /* ================= POINTER EVENTS ================= */
  let down = null;
  ov.addEventListener('pointerdown', e => {
    if (e.button === 2) return;
    ov.setPointerCapture(e.pointerId);
    const p = pos(e); down = { p, e: { shiftKey: e.shiftKey, altKey: e.altKey } };
    switch (S.tool) {
      case 'brush': case 'pencil': case 'eraser': case 'clone': case 'heal': case 'blur': case 'dodge':
        if (!strokeStart(p, e)) down = null; break;
      case 'eyedropper': pickColour(p); down = null; break;
      case 'bucket': bucket(p); down = null; break;
      case 'wand': {
        const w = W(), h = H();
        const out = flood(ctx.getImageData(0, 0, w, h).data, w, h, Math.floor(p.x), Math.floor(p.y), S.tol, S.contiguous);
        const m = mk(), mc = m.getContext('2d'), id = mc.createImageData(w, h);
        for (let i = 0; i < w * h; i++) if (out[i]) id.data[i * 4 + 3] = 255;
        mc.putImageData(id, 0, 0);
        selCommit(c => c.drawImage(m, 0, 0), modeFrom(e));
        down = null; break;
      }
      case 'lasso':
        if (S.lasso === 'poly') {
          if (!poly) poly = { pts: [p], mode: modeFrom(e) };
          else if (Math.hypot(p.x - poly.pts[0].x, p.y - poly.pts[0].y) < 10 * W() / ov.clientWidth) { finishPoly(true); down = null; break; }
          else poly.pts.push(p);
          preview = c => { c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.setLineDash([5, 4]); c.beginPath();
            poly.pts.forEach((q, i) => i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y)); if (mouse) c.lineTo(mouse.x, mouse.y); c.stroke(); c.setLineDash([]);
            c.fillStyle = '#31a8ff'; poly.pts.forEach(q => c.fillRect(q.x - 3, q.y - 3, 6, 6)); };
          down = null;
        } else down.pts = [p];
        break;
      case 'move': {
        pushUndo();
        const src = copyCanvas(), float = mk(), rest = mk(), fc = float.getContext('2d'), rc = rest.getContext('2d');
        fc.drawImage(src, 0, 0);
        if (hasSel) { fc.globalCompositeOperation = 'destination-in'; fc.drawImage(selC, 0, 0); rc.drawImage(src, 0, 0); rc.globalCompositeOperation = 'destination-out'; rc.drawImage(selC, 0, 0); }
        moving = { float, rest };
        break;
      }
      case 'text': pushUndo(); ctx.save(); ctx.globalAlpha = S.op / 100; drawText(ctx, p); ctx.restore(); down = null; break;
      case 'zoom': zoom(e.altKey ? -1 : 1); down = null; break;
    }
    drawOverlay();
  });

  ov.addEventListener('pointermove', e => {
    const p = pos(e); mouse = p;
    $('st-pos').textContent = `x ${Math.round(p.x)}  y ${Math.round(p.y)}`;
    if (down) {
      const a = down.p;
      switch (S.tool) {
        case 'brush': case 'pencil': case 'eraser': case 'clone': case 'heal': case 'blur': case 'dodge': if (stroke) strokeMove(p); break;
        case 'marquee': { const r = rectFrom(a, p, e.shiftKey && down.e.shiftKey === false);
          preview = c => { c.strokeStyle = '#fff'; c.setLineDash([5, 4]); c.lineWidth = 1.5; pathRect(c, r, S.marquee === 'ellipse'); c.stroke(); c.setLineDash([]); }; break; }
        case 'lasso': if (down.pts) { down.pts.push(p);
          preview = c => { c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.setLineDash([5, 4]); c.beginPath(); down.pts.forEach((q, i) => i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y)); c.stroke(); c.setLineDash([]); }; } break;
        case 'crop': cropBox = cropFrom(a, p); break;
        case 'gradient': preview = c => { c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(p.x, p.y); c.stroke();
          c.fillStyle = S.fg; c.beginPath(); c.arc(a.x, a.y, 6, 0, 7); c.fill(); c.stroke(); c.fillStyle = S.bg; c.beginPath(); c.arc(p.x, p.y, 6, 0, 7); c.fill(); c.stroke(); }; break;
        case 'shape': preview = c => { c.globalAlpha = .7; drawShape(c, a, p, e.shiftKey); c.globalAlpha = 1; }; break;
        case 'move': if (moving) {
          const dx = p.x - a.x, dy = p.y - a.y;
          ctx.clearRect(0, 0, W(), H()); ctx.drawImage(moving.rest, 0, 0); ctx.drawImage(moving.float, dx, dy);
          antsOff = { x: dx, y: dy }; drawAnts();
        } break;
      }
    }
    drawOverlay();
  });

  ov.addEventListener('pointerup', e => {
    if (!down) return;
    const a = down.p, p = pos(e), m = modeFrom(down.e);
    switch (S.tool) {
      case 'brush': case 'pencil': case 'eraser': case 'clone': case 'heal': case 'blur': case 'dodge': if (stroke) strokeEnd(); break;
      case 'marquee': {
        const r = rectFrom(a, p, e.shiftKey && !down.e.shiftKey);
        if (r.w < 2 && r.h < 2) { if (m === 'new') deselect(); }
        else selCommit(c => { pathRect(c, r, S.marquee === 'ellipse'); c.fill(); }, m);
        break;
      }
      case 'lasso': if (down.pts && down.pts.length > 2) selCommit(c => { c.beginPath(); down.pts.forEach((q, i) => i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y)); c.closePath(); c.fill(); }, m); break;
      case 'gradient':
        if (Math.hypot(p.x - a.x, p.y - a.y) > 3) {
          pushUndo();
          applyProcessed(c => { const g = c.createLinearGradient(a.x, a.y, p.x, p.y); g.addColorStop(0, S.fg); g.addColorStop(1, S.bg); c.fillStyle = g; c.fillRect(0, 0, W(), H()); }, { alpha: S.op / 100 });
        }
        break;
      case 'shape':
        if (Math.hypot(p.x - a.x, p.y - a.y) > 2) { pushUndo(); ctx.save(); ctx.globalAlpha = S.op / 100; drawShape(ctx, a, p, e.shiftKey); ctx.restore(); }
        break;
      case 'move':
        if (moving && hasSel) { // move the selection outline too
          const dx = Math.round(p.x - a.x), dy = Math.round(p.y - a.y), c = mk();
          c.getContext('2d').drawImage(selC, dx, dy); sel.clearRect(0, 0, W(), H()); sel.drawImage(c, 0, 0);
          antsOff = { x: 0, y: 0 }; updateSel();
        }
        moving = null; break;
    }
    if (S.tool !== 'lasso' || S.lasso !== 'poly') preview = null;
    down = null; drawOverlay();
  });
  ov.addEventListener('dblclick', () => { if (poly) finishPoly(true); });
  ov.addEventListener('pointerleave', () => { mouse = null; drawOverlay(); });
  ov.addEventListener('contextmenu', e => e.preventDefault());

  /* ================= 9. MENU COMMANDS, FILTERS, ADJUSTMENTS ================= */
  function convolve(kernel, bias = 0) {
    return (c, src) => {
      const w = W(), h = H(), s = src.getContext('2d').getImageData(0, 0, w, h), o = c.createImageData(w, h), sd = s.data, od = o.data;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let r = 0, g = 0, b = 0;
        for (let ky = -1; ky <= 1; ky++) for (let kx = -1; kx <= 1; kx++) {
          const xx = Math.min(w - 1, Math.max(0, x + kx)), yy = Math.min(h - 1, Math.max(0, y + ky)), j = (yy * w + xx) * 4, k = kernel[(ky + 1) * 3 + kx + 1];
          r += sd[j] * k; g += sd[j + 1] * k; b += sd[j + 2] * k;
        }
        const i = (y * w + x) * 4; od[i] = r + bias; od[i + 1] = g + bias; od[i + 2] = b + bias; od[i + 3] = sd[i + 3];
      }
      c.putImageData(o, 0, 0);
    };
  }
  function pixelOp(fn) {
    return (c, src) => {
      const img = src.getContext('2d').getImageData(0, 0, W(), H()), d = img.data;
      for (let i = 0; i < d.length; i += 4) fn(d, i);
      c.putImageData(img, 0, 0);
    };
  }
  const FILTERS = {
    'f-blur': (c, src) => { c.drawImage(src, 0, 0); c.filter = 'blur(4px)'; c.drawImage(src, 0, 0); },
    'f-sharpen': convolve([0, -1, 0, -1, 5, -1, 0, -1, 0]),
    'f-emboss': convolve([-2, -1, 0, -1, 1, 1, 0, 1, 2], 0),
    'f-edges': convolve([-1, -1, -1, -1, 8, -1, -1, -1, -1]),
    'f-noise': pixelOp((d, i) => { const n = (Math.random() - .5) * 60; d[i] += n; d[i + 1] += n; d[i + 2] += n; }),
    'f-poster': pixelOp((d, i) => { for (let c = 0; c < 3; c++) d[i + c] = Math.round(d[i + c] / 85) * 85; }),
    'f-invert': pixelOp((d, i) => { d[i] = 255 - d[i]; d[i + 1] = 255 - d[i + 1]; d[i + 2] = 255 - d[i + 2]; }),
    'f-pixel': (c, src) => { const s = mk(Math.ceil(W() / 12), Math.ceil(H() / 12)); s.getContext('2d').drawImage(src, 0, 0, s.width, s.height); c.imageSmoothingEnabled = false; c.drawImage(s, 0, 0, W(), H()); }
  };

  const CMDS = {
    undo, redo,
    new: () => { pushUndo(); resizeAll(800, 500); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 800, 500); toast('New blank canvas', 'plus'); },
    open: () => $('file-in').click(),
    sample: () => { pushUndo(); loadSample(); toast('Sample image loaded', 'image'); },
    save: () => { const a = document.createElement('a'); a.href = cv.toDataURL('image/png'); a.download = 'my-photoshop-edit.png'; a.click(); toast('Downloaded!', 'download'); },
    fillfg: () => { pushUndo(); applyProcessed(c => { c.fillStyle = S.fg; c.fillRect(0, 0, W(), H()); }); },
    clear: () => { if (!hasSel) return toast('Make a selection first', 'marquee'); pushUndo(); ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.drawImage(selC, 0, 0); ctx.restore(); },
    rotcw: () => rotate(90), rotccw: () => rotate(-90), rot180: () => rotate(180),
    fliph: () => flip(true), flipv: () => flip(false),
    all: () => { selCommit(c => c.fillRect(0, 0, W(), H()), 'new'); },
    deselect,
    inverse: () => { sel.save(); sel.globalCompositeOperation = 'xor'; sel.fillStyle = '#fff'; sel.fillRect(0, 0, W(), H()); sel.restore(); updateSel(); },
    zin: () => zoom(1), zout: () => zoom(-1), zfit: () => zoom(0),
    swap: () => { [S.fg, S.bg] = [S.bg, S.fg]; paintSwatches(); },
    resetcol: () => { S.fg = '#000000'; S.bg = '#ffffff'; paintSwatches(); },
    cropApply, cropCancel: () => { cropBox = null; drawOverlay(); },
    pickSource: () => { newSource = true; buildOptions(); toast('Now click the area to copy FROM', 'target'); }
  };
  Object.keys(FILTERS).forEach(k => CMDS[k] = () => { pushUndo(); applyProcessed(FILTERS[k], { replace: true }); toast('Filter applied' + (hasSel ? ' to selection' : ''), 'filters'); });

  function rotate(deg) {
    pushUndo(); const src = copyCanvas(), w = W(), h = H();
    if (deg === 180) resizeAll(w, h); else resizeAll(h, w);
    ctx.save(); ctx.translate(W() / 2, H() / 2); ctx.rotate(deg * Math.PI / 180); ctx.drawImage(src, -w / 2, -h / 2); ctx.restore();
    drawOverlay(); drawAnts();
  }
  function flip(horizontal) {
    pushUndo(); const src = copyCanvas(); deselect();
    ctx.clearRect(0, 0, W(), H()); ctx.save();
    if (horizontal) { ctx.translate(W(), 0); ctx.scale(-1, 1); } else { ctx.translate(0, H()); ctx.scale(1, -1); }
    ctx.drawImage(src, 0, 0); ctx.restore();
  }
  function bindCmds(root) {
    root.querySelectorAll('[data-cmd]').forEach(b => b.onclick = () => { CMDS[b.dataset.cmd](); b.blur(); });
  }

  // open a photo from the student's computer
  $('file-in').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, 1200 / img.width, 800 / img.height), w = Math.round(img.width * s), h = Math.round(img.height * s);
        pushUndo(); resizeAll(w, h); ctx.drawImage(img, 0, 0, w, h); toast('Image opened', 'folder');
      };
      img.src = r.result;
    };
    r.readAsDataURL(f); e.target.value = '';
  });

  // Adjustments panel (live preview)
  const ADJ = [
    { id: 'brightness', label: 'Brightness', min: 0, max: 200, def: 100, u: '%' },
    { id: 'contrast', label: 'Contrast', min: 0, max: 200, def: 100, u: '%' },
    { id: 'saturate', label: 'Saturation', min: 0, max: 300, def: 100, u: '%' },
    { id: 'hue-rotate', label: 'Hue', min: -180, max: 180, def: 0, u: 'deg' },
    { id: 'grayscale', label: 'Black & White', min: 0, max: 100, def: 0, u: '%' },
    { id: 'sepia', label: 'Sepia', min: 0, max: 100, def: 0, u: '%' }
  ];
  $('adj').innerHTML = ADJ.map(a => `<label style="margin-top:8px">${a.label} <span id="a-${a.id}-v">${a.def}${a.u === 'deg' ? '°' : '%'}</span></label>
    <input type="range" id="a-${a.id}" min="${a.min}" max="${a.max}" value="${a.def}">`).join('');
  const filterStr = () => ADJ.map(a => `${a.id}(${$('a-' + a.id).value}${a.u})`).join(' ');
  ADJ.forEach(a => $('a-' + a.id).addEventListener('input', () => {
    $(`a-${a.id}-v`).textContent = $('a-' + a.id).value + (a.u === 'deg' ? '°' : '%');
    if (!adjBase) { undoStack.push(snap()); redoStack.length = 0; adjBase = snap(); }
    ctx.putImageData(adjBase.data, 0, 0);
    applyProcessed((c, src) => { c.filter = filterStr(); c.drawImage(src, 0, 0); }, { replace: true });
  }));
  function resetAdjSliders() { ADJ.forEach(a => { $('a-' + a.id).value = a.def; $(`a-${a.id}-v`).textContent = a.def + (a.u === 'deg' ? '°' : '%'); }); }
  function commitAdj() { if (adjBase) { adjBase = null; resetAdjSliders(); } }
  function cancelAdj() { if (adjBase) { restore(adjBase); undoStack.pop(); adjBase = null; resetAdjSliders(); } }
  $('adj-apply').onclick = () => { if (adjBase) { commitAdj(); toast('Adjustment applied', 'check'); } };
  $('adj-cancel').onclick = () => { cancelAdj(); };

  // colour swatches
  function paintSwatches() {
    $('fg-sw').style.background = S.fg; $('bg-sw').style.background = S.bg;
    $('fg').value = S.fg; $('bg').value = S.bg;
  }
  $('fg').addEventListener('input', e => { S.fg = e.target.value; paintSwatches(); });
  $('bg').addEventListener('input', e => { S.bg = e.target.value; paintSwatches(); });

  /* ================= 10. KEYBOARD SHORTCUTS & CHALLENGES ================= */
  document.addEventListener('keydown', e => {
    if (e.target.matches('input[type=text], input[type=number], textarea, select')) return;
    const k = e.key.toLowerCase(), mod = e.ctrlKey || e.metaKey;
    if (mod) {
      const map = { z: e.shiftKey ? redo : undo, y: redo, d: deselect, a: CMDS.all, s: CMDS.save, o: CMDS.open, '0': CMDS.zfit, '=': CMDS.zin, '+': CMDS.zin, '-': CMDS.zout,
        i: e.shiftKey ? CMDS.inverse : CMDS['f-invert'] };
      if (map[k]) { e.preventDefault(); map[k](); }
      return;
    }
    if (k === 'enter') { if (S.tool === 'crop') cropApply(); if (poly) finishPoly(true); return; }
    if (k === 'escape') { finishPoly(false); cropBox = null; drawOverlay(); return; }
    if (k === 'delete' || k === 'backspace') { if (poly && poly.pts.length > 1) { poly.pts.pop(); drawOverlay(); } else if (hasSel) CMDS.clear(); e.preventDefault(); return; }
    if (k === '[' || k === ']') { S.size = Math.max(1, Math.min(200, S.size + (k === ']' ? 5 : -5))); buildOptions(); drawOverlay(); return; }
    if (/^[0-9]$/.test(k)) { S.op = k === '0' ? 100 : +k * 10; buildOptions(); toast('Opacity ' + S.op + '%', 'opacity'); return; }
    if (k === 'x') return CMDS.swap();
    if (k === 'd') return CMDS.resetcol();
    const keys = { v: 'move', m: 'marquee', l: 'lasso', w: 'wand', c: 'crop', i: 'eyedropper', e: 'eraser', s: 'clone', j: 'heal', o: 'dodge', t: 'text', u: 'shape', z: 'zoom' };
    if (k === 'b') return setTool(S.tool === 'brush' ? 'pencil' : 'brush');
    if (k === 'g') return setTool(S.tool === 'bucket' ? 'gradient' : 'bucket');
    if (keys[k]) setTool(keys[k]);
  });

  const CHALLENGES = [
    { id: 'c1', icon: 'clone', text: 'Remove the boat using the Clone Stamp.' },
    { id: 'c2', icon: 'heal', text: 'Remove the two birds with the Spot Healing Brush.' },
    { id: 'c3', icon: 'wand', text: 'Select the sun with the Magic Wand and turn it pink using Hue.' },
    { id: 'c4', icon: 'crop', text: 'Crop the image to a 1:1 square using the rule of thirds.' },
    { id: 'c5', icon: 'lasso', text: 'Use the Lasso to select the mountains and make them black & white.' },
    { id: 'c6', icon: 'gradient', text: 'Select the sky and add a new gradient to it.' },
    { id: 'c7', icon: 'text', text: 'Add a title to make it into a postcard.' },
    { id: 'c8', icon: 'folder', text: 'Open your own photo and apply a filter to one part only.' }
  ];
  const getCh = () => { try { return JSON.parse(localStorage.getItem('psChallenges') || '[]'); } catch { return []; } };
  function renderChallenges() {
    const done = getCh();
    $('challenges').innerHTML = CHALLENGES.map(c => `<label class="challenge ${done.includes(c.id) ? 'done' : ''}">
      <input type="checkbox" data-c="${c.id}" ${done.includes(c.id) ? 'checked' : ''}><span>${ic(c.icon)} ${c.text}</span></label>`).join('') +
      `<p class="muted" style="font-size:.85rem;margin-top:8px">${done.length} / ${CHALLENGES.length} complete</p>`;
    $('challenges').querySelectorAll('input').forEach(i => i.onchange = () => {
      const set = new Set(getCh()); i.checked ? set.add(i.dataset.c) : set.delete(i.dataset.c);
      try { localStorage.setItem('psChallenges', JSON.stringify([...set])); } catch {}
      if (i.checked) { toast('Challenge complete!', 'trophy'); if (set.size === CHALLENGES.length) confetti(150); else confetti(25); }
      renderChallenges();
    });
  }

  /* ================= START ================= */
  bindCmds(document.querySelector('.menubar'));
  bindCmds(document.querySelector('.ps-info'));
  buildToolbar();
  loadSample();
  paintSwatches();
  renderChallenges();
  const start = new URLSearchParams(location.search).get('tool');
  setTool(TOOLS.some(t => t.id === start) ? start : 'brush');
})();
