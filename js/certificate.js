/* ============================================================
   CERTIFICATE – draws the "Photoshop Skills Lab Award" on a canvas
   and saves it as a PDF. No outside libraries needed.
   Needs js/logo.js (the Oldham College logo) loaded first.

   await prepareCertificate()                       – loads fonts + logo
   drawCertificate(canvas, details, part)           – part: 'all' | 'base' | 'seal'
   downloadCertificatePDF(canvas, fileName)
   ============================================================ */

const CERT_W = 2339, CERT_H = 1654;          // A4 landscape at 200 dpi
const NAVY = '#14213d', INK = '#2b3550';
const TUTOR_NAME = 'Jamil Ahmed';           // signature shown on every certificate
const PASS_MARK = 60;                        // below this, students must retake the quiz
const SEAL_Y = CERT_H - 245;                 // where the seal sits (used by the animation too)

// Award level from the percentage – change the numbers to suit your class
function awardTier(pct) {
  if (pct >= 85) return { name: 'DISTINCTION', words: 'with distinction', light: '#f7e08a', mid: '#d4af37', dark: '#9c7a17' };
  if (pct >= 70) return { name: 'MERIT', words: 'with merit', light: '#f4f6f9', mid: '#b9c1cc', dark: '#6f7a88' };
  if (pct >= PASS_MARK) return { name: 'PASS', words: '', light: '#f3c79b', mid: '#cd8b4f', dark: '#8e5426' };
  return null;                               // not passed yet
}

let collegeLogoImg = null;
async function prepareCertificate() {
  const logo = new Promise(res => {
    if (typeof COLLEGE_LOGO === 'undefined') return res();
    const img = new Image(); img.onload = () => { collegeLogoImg = img; res(); }; img.onerror = () => res(); img.src = COLLEGE_LOGO;
  });
  const fonts = !document.fonts ? Promise.resolve() : Promise.all(
    ['800 100px Cinzel', '600 40px Cinzel', '700 150px "Playfair Display"', 'italic 500 50px "Cormorant Garamond"', '700 90px "Dancing Script"']
      .map(f => document.fonts.load(f).catch(() => {})));
  // don't wait more than 2.5 s (e.g. if Google Fonts is blocked) – fall back to built-in fonts
  await Promise.race([Promise.all([logo, fonts]), new Promise(r => setTimeout(r, 2500))]);
}

function drawCertificate(cv, { name, id, score, total, date }, part = 'all') {
  cv.width = CERT_W; cv.height = CERT_H;
  const c = cv.getContext('2d'), W = CERT_W, H = CERT_H, cx = W / 2;
  const pct = Math.round(score / total * 100), tier = awardTier(pct) || awardTier(PASS_MARK);
  const TITLE = 'Cinzel, "Trajan Pro", Georgia, serif';
  const NAME = '"Playfair Display", "Cormorant Garamond", Georgia, "Times New Roman", serif';
  const BODY = '"Cormorant Garamond", Garamond, Georgia, serif';
  const spaced = (px) => { try { c.letterSpacing = px + 'px'; } catch {} };
  const goldGrad = (y1, y2, t = tier) => { const g = c.createLinearGradient(0, y1, 0, y2); g.addColorStop(0, t.light); g.addColorStop(.5, t.mid); g.addColorStop(1, t.dark); return g; };
  const GOLD = { light: '#f7e08a', mid: '#d4af37', dark: '#9c7a17' };
  const sx = cx, sy = SEAL_Y;

  if (part !== 'seal') {
    /* --- parchment background --- */
    const bg = c.createRadialGradient(cx, H / 2, 100, cx, H / 2, W * .65);
    bg.addColorStop(0, '#fffdf8'); bg.addColorStop(1, '#f1e6cc');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);

    /* --- guilloche rosette watermark --- */
    c.save(); c.translate(cx, H / 2 + 40); c.strokeStyle = 'rgba(180, 140, 40, .09)'; c.lineWidth = 2;
    for (let i = 0; i < 48; i++) { c.rotate(Math.PI / 48); c.beginPath(); c.ellipse(0, 0, 520, 190, 0, 0, Math.PI * 2); c.stroke(); }
    c.restore();

    /* --- seal ribbons (drawn before the frame so they tuck underneath) --- */
    [-1, 1].forEach(d => {
      c.fillStyle = d < 0 ? '#1f3a68' : '#2a4a80';
      c.beginPath(); c.moveTo(sx + d * 30, sy); c.lineTo(sx + d * 120, H - 40); c.lineTo(sx + d * 75, H - 75); c.lineTo(sx + d * 40, H - 30); c.lineTo(sx - d * 20, sy); c.fill();
    });

    /* --- frame --- */
    c.lineWidth = 4; c.strokeStyle = goldGrad(0, H, GOLD); c.strokeRect(36, 36, W - 72, H - 72);
    c.lineWidth = 50; c.strokeStyle = NAVY; c.strokeRect(75, 75, W - 150, H - 150);
    c.lineWidth = 2.5; c.strokeStyle = 'rgba(232, 200, 100, .85)';
    const band = (x1, y1, x2, y2) => {   // braided gold waves inside the navy band
      const len = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / len, uy = (y2 - y1) / len, nx = -uy, ny = ux;
      for (const ph of [0, Math.PI]) {
        c.beginPath();
        for (let t = 0; t <= len; t += 4) { const o = Math.sin(t / 22 + ph) * 13; const x = x1 + ux * t + nx * o, y = y1 + uy * t + ny * o; t ? c.lineTo(x, y) : c.moveTo(x, y); }
        c.stroke();
      }
    };
    band(75, 75, W - 75, 75); band(W - 75, 75, W - 75, H - 75); band(W - 75, H - 75, 75, H - 75); band(75, H - 75, 75, 75);
    c.lineWidth = 5; c.strokeStyle = goldGrad(0, H, GOLD); c.strokeRect(112, 112, W - 224, H - 224);
    c.lineWidth = 1.5; c.strokeRect(126, 126, W - 252, H - 252);
    [[126, 126], [W - 126, 126], [126, H - 126], [W - 126, H - 126]].forEach(([x, y]) => {
      c.save(); c.translate(x, y); c.rotate(Math.PI / 4);
      c.fillStyle = goldGrad(-30, 30, GOLD); c.fillRect(-26, -26, 52, 52);
      c.fillStyle = NAVY; c.fillRect(-13, -13, 26, 26);
      c.fillStyle = goldGrad(-8, 8, GOLD); c.fillRect(-6, -6, 12, 12);
      c.restore();
    });

    /* --- Oldham College logo --- */
    if (collegeLogoImg) {
      const lw = 500, lh = lw * collegeLogoImg.height / collegeLogoImg.width;
      c.drawImage(collegeLogoImg, cx - lw / 2, 260 - lh / 2, lw, lh);
    }

    /* --- title --- */
    c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.fillStyle = NAVY; spaced(10); c.font = `800 92px ${TITLE}`; c.fillText('PHOTOSHOP SKILLS LAB', cx, 430);
    spaced(34); c.font = `800 120px ${TITLE}`; c.fillStyle = goldGrad(440, 555, GOLD); c.fillText('AWARD', cx + 17, 555);
    c.lineWidth = 2; c.strokeStyle = 'rgba(120, 90, 20, .5)'; c.strokeText('AWARD', cx + 17, 555);
    const half = c.measureText('AWARD').width / 2 + 40;
    [-1, 1].forEach(d => {
      c.strokeStyle = GOLD.mid; c.lineWidth = 3;
      c.beginPath(); c.moveTo(cx + d * (half + 20), 510); c.lineTo(cx + d * (half + 280), 510); c.stroke();
      c.save(); c.translate(cx + d * (half + 300), 510); c.rotate(Math.PI / 4); c.fillStyle = GOLD.mid; c.fillRect(-9, -9, 18, 18); c.restore();
      c.beginPath(); c.arc(cx + d * half, 510, 6, 0, Math.PI * 2); c.fillStyle = GOLD.mid; c.fill();
    });

    /* --- presented to --- */
    spaced(1); c.fillStyle = INK; c.font = `italic 500 54px ${BODY}`;
    c.fillText('This award is proudly presented to', cx, 660);

    /* --- student name: formal serif, shrinks to fit --- */
    spaced(2); let size = 140;
    do { c.font = `700 ${size}px ${NAME}`; size -= 4; } while (c.measureText(name).width > 1500 && size > 50);
    c.fillStyle = NAVY; c.fillText(name, cx, 820);
    c.strokeStyle = GOLD.mid; c.lineWidth = 3;
    c.beginPath(); c.moveTo(cx - 640, 870); c.lineTo(cx - 22, 870); c.moveTo(cx + 22, 870); c.lineTo(cx + 640, 870); c.stroke();
    c.save(); c.translate(cx, 870); c.rotate(Math.PI / 4); c.fillStyle = GOLD.mid; c.fillRect(-10, -10, 20, 20); c.restore();

    /* --- student ID --- */
    spaced(8); c.font = `600 40px ${TITLE}`; c.fillStyle = '#8a6d1d';
    c.fillText('STUDENT ID: ' + id.toUpperCase(), cx, 945);

    /* --- reason --- */
    spaced(0); c.fillStyle = INK; c.font = `500 50px ${BODY}`;
    c.fillText(`for successfully completing the Photoshop Skills Lab quiz${tier.words ? ' ' + tier.words : ''},`, cx, 1035);
    c.fillText('covering tools, image editing, layers, filters and exporting.', cx, 1097);

    /* --- score panel --- */
    const pw = 640, ph = 140, px = cx - pw / 2, py = 1145;
    c.fillStyle = NAVY; c.beginPath(); c.roundRect ? c.roundRect(px, py, pw, ph, 70) : c.rect(px, py, pw, ph); c.fill();
    c.lineWidth = 5; c.strokeStyle = goldGrad(py, py + ph, GOLD); c.stroke();
    spaced(6); c.font = `600 26px ${TITLE}`; c.fillStyle = GOLD.mid; c.fillText('FINAL SCORE', cx, py + 48);
    spaced(4); c.font = `800 64px ${TITLE}`; c.fillStyle = '#ffffff'; c.fillText(`${score} / ${total}  ·  ${pct}%`, cx, py + 115);

    /* --- tutor signature + date --- */
    spaced(0);
    c.save(); c.translate(W - 560, H - 296); c.rotate(-0.04);
    c.fillStyle = '#1b2a55'; c.font = `700 88px "Dancing Script", "Segoe Script", "Brush Script MT", cursive`;
    c.fillText(TUTOR_NAME, 0, 0);
    c.restore();
    [[560, date, 'DATE'], [W - 560, '', 'TUTOR SIGNATURE']].forEach(([x, val, label]) => {
      c.fillStyle = INK; c.font = `italic 500 50px ${BODY}`; if (val) c.fillText(val, x, H - 300);
      c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 260, H - 280); c.lineTo(x + 260, H - 280); c.stroke();
      spaced(6); c.font = `600 26px ${TITLE}`; c.fillStyle = '#8a6d1d'; c.fillText(label, x, H - 238); spaced(0);
    });
  }

  if (part !== 'base') {
    /* --- award seal --- */
    c.save(); c.translate(sx, sy); c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.shadowColor = 'rgba(0,0,0,.25)'; c.shadowBlur = 18; c.shadowOffsetY = 6;
    c.beginPath();
    for (let i = 0; i < 64; i++) { const r = i % 2 ? 118 : 132, a = i / 64 * Math.PI * 2; i ? c.lineTo(Math.cos(a) * r, Math.sin(a) * r) : c.moveTo(r, 0); }
    c.closePath(); c.fillStyle = goldGrad(-132, 132); c.fill();
    c.shadowColor = 'transparent';
    c.beginPath(); c.arc(0, 0, 104, 0, Math.PI * 2); c.lineWidth = 4; c.strokeStyle = tier.dark; c.stroke();
    c.beginPath(); c.arc(0, 0, 80, 0, Math.PI * 2); c.lineWidth = 2; c.stroke();
    c.fillStyle = tier.dark; c.font = `700 17px ${TITLE}`; spaced(0);
    const ring = 'PHOTOSHOP SKILLS LAB  ★  OLDHAM COLLEGE  ★  ';
    const step = Math.PI * 2 / ring.length;
    [...ring].forEach((ch, i) => { c.save(); c.rotate(i * step - Math.PI / 2); c.translate(0, -86); c.fillText(ch, 0, 0); c.restore(); });
    c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 9 : 22, a = i / 10 * Math.PI * 2 - Math.PI / 2; c.lineTo(Math.cos(a) * r, Math.sin(a) * r - 32); } c.fill();
    let fs = 34; do { c.font = `800 ${fs}px ${TITLE}`; fs -= 1; } while (c.measureText(tier.name).width > 138 && fs > 14);
    c.fillText(tier.name, 0, 20);
    c.font = `600 18px ${TITLE}`; spaced(4); c.fillText('AWARD', 2, 48);
    c.restore(); spaced(0);
  }
  return { pct, tier: awardTier(pct) };
}

/* ---------- Tiny PDF writer: puts the certificate image on one A4 landscape page ---------- */
function downloadCertificatePDF(cv, fileName, title = 'Photoshop Skills Lab Award') {
  const jpeg = cv.toDataURL('image/jpeg', 0.92);
  const bin = atob(jpeg.split(',')[1]);
  const img = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) img[i] = bin.charCodeAt(i);

  const PW = 841.89, PH = 595.28;                          // A4 landscape in points
  const bytes = s => Uint8Array.from(s, ch => ch.charCodeAt(0) & 255);
  const hexText = s => '<FEFF' + [...s].map(ch => ch.charCodeAt(0).toString(16).padStart(4, '0')).join('').toUpperCase() + '>';
  const parts = [], offsets = []; let len = 0;
  const add = p => { const b = typeof p === 'string' ? bytes(p) : p; parts.push(b); len += b.length; };
  const obj = (n, body) => { offsets[n] = len; add(`${n} 0 obj\n${body}\nendobj\n`); };

  add('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  offsets[4] = len;
  add(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${cv.width} /Height ${cv.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.length} >>\nstream\n`);
  add(img); add('\nendstream\nendobj\n');
  const content = `q ${PW} 0 0 ${PH} 0 0 cm /Im0 Do Q`;
  obj(5, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  obj(6, `<< /Title ${hexText(title)} /Producer (Photoshop Skills Lab) >>`);
  const xref = len;
  add(`xref\n0 7\n0000000000 65535 f \n${offsets.slice(1).map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('')}`);
  add(`trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xref}\n%%EOF`);

  const url = URL.createObjectURL(new Blob(parts, { type: 'application/pdf' }));
  const a = document.createElement('a'); a.href = url; a.download = fileName;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
