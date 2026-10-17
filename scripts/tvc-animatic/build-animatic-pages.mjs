// Writes one full-frame art page and one transparent caption page per animatic shot,
// plus shots.json describing timing and camera moves for render-animatic.py.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { panels, CSS, DEFS } from './build-storyboard.mjs';

const OUT = process.argv[2];
if (!OUT) throw new Error('usage: node build-animatic-pages.mjs <out-dir>');
mkdirSync(OUT, { recursive: true });

const FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;1,400;1,500&family=JetBrains+Mono:wght@500&display=swap">';

// Camera moves: zoom z0 -> z1 and frame centre (as a fraction of the art) c0 -> c1.
const SHOTS = [
  { scene: 1, from: 0, to: 3, z: [1.0, 1.12], c: [[0.5, 0.5], [0.32, 0.62]], note: '[Chuông báo thức tắt · tiếng gót "cộp"]' },
  { scene: 2, from: 3, to: 6, z: [1.12, 1.12], c: [[0.44, 0.55], [0.56, 0.55]], shake: true, note: '[Còi xe · tiếng mưa rào]' },
  { scene: 3, from: 6, to: 9, z: [1.3, 1.3], c: [[0.3, 0.56], [0.7, 0.52]] },
  { scene: 4, from: 9, to: 12, z: [1.0, 1.06], c: [[0.4, 0.6], [0.4, 0.6]], note: '[Mũi giày gõ nhịp · nhạc vào]' },
  { scene: 5, from: 12, to: 15, z: [1.06, 1.1], c: [[0.4, 0.6], [0.42, 0.6]] },
  { scene: 6, sub: '6A', from: 15, to: 17, z: [2.02, 2.1], c: [[0.247, 0.64], [0.247, 0.64]], note: '[Nhạc dâng]' },
  { scene: 6, sub: '6B', from: 17, to: 19, z: [2.02, 2.02], c: [[0.74, 0.6], [0.76, 0.6]], note: '[Nhạc dâng]' },
  { scene: 7, sub: '7A', from: 19, to: 21, z: [2.1, 2.02], c: [[0.247, 0.6], [0.247, 0.6]] },
  { scene: 7, sub: '7B', from: 21, to: 23, z: [2.02, 2.06], c: [[0.753, 0.5], [0.753, 0.5]] },
  { scene: 8, from: 23, to: 27, z: [2.4, 1.0], c: [[0.69, 0.64], [0.5, 0.5]] },
  { scene: 9, from: 27, to: 30, z: [1.0, 1.05], c: [[0.5, 0.5], [0.5, 0.5]] },
];

const tc = (s) => `00:${String(s).padStart(2, '0')}`;
const page = (body, extraCss, bg) => `<!doctype html><html data-theme="light"><head><meta charset="utf-8">${FONTS}
<style>${CSS}
html, body { margin: 0; background: ${bg}; }
${extraCss}</style></head><body>${body}</body></html>`;

const ART_CSS = `.art { width: 3840px; height: 2160px; background: var(--panel); }
.art svg { display: block; width: 3840px; height: 2160px; }
/* storyboard-only annotations do not belong on screen */
.art .arr-act, .art .arr-cam, .art .frame-mark, .art .note.cam, .art .note.on, .art .tag-bg.cut, .art .sfx.small, .art .insert { display: none; }`;

// Caption boxes stay opaque: headless Chromium loses text drawn on translucent fills in transparent screenshots.
const CAP_CSS = `.cap { position: relative; width: 1920px; height: 1080px; font-family: var(--font-body); }
.tag { position: absolute; left: 48px; top: 40px; display: flex; gap: 16px; align-items: baseline;
  background: #23272d; color: #fff; padding: 10px 20px; }
.tag b { font-family: var(--font-display); font-size: 34px; letter-spacing: .08em; }
.tag span { font-family: var(--font-mono); font-size: 22px; opacity: .8; }
.mark { position: absolute; right: 48px; top: 48px; font-family: var(--font-display); font-weight: 600;
  font-size: 24px; letter-spacing: .14em; color: #23272d; background: #fff; padding: 6px 14px; }
.sub { position: absolute; left: 50%; bottom: 64px; transform: translateX(-50%); max-width: 1500px;
  background: #1d2025; color: #fff; padding: 18px 34px; text-align: center; }
.sub .line { font-style: italic; font-weight: 500; font-size: 46px; line-height: 1.3; }
.sub .line i { font-style: normal; font-family: var(--font-display); font-weight: 600; font-size: 26px;
  letter-spacing: .12em; opacity: .7; margin-right: 14px; vertical-align: middle; }
.sub .note { font-size: 30px; opacity: .85; }`;

const shots = SHOTS.map((s, i) => {
  const p = panels[s.scene - 1];
  const id = `shot-${String(i + 1).padStart(2, '0')}`;
  // Thin storyboard strokes would vanish at 4K, so let shoe outlines scale with the drawing.
  const svg = `<svg viewBox="0 0 320 180">${p.svg()}</svg>`.replaceAll('vector-effect="non-scaling-stroke"', '');
  writeFileSync(join(OUT, `${id}-art.html`), page(`${DEFS}<div class="art">${svg}</div>`, ART_CSS, '#fff'));

  const label = s.sub ? `CẢNH ${s.sub}` : `CẢNH ${s.scene}`;
  const sub = p.vo
    ? `<div class="sub"><div class="line"><i>VO</i>“${p.vo}”</div></div>`
    : s.note ? `<div class="sub"><div class="note">${s.note}</div></div>` : '';
  const cap = `<div class="cap">
    <div class="tag"><b>${label}</b><span>${tc(s.from)}–${tc(s.to)}</span></div>
    <div class="mark">ANIMATIC · GIÀY BQ · TỪNG BƯỚC</div>${sub}</div>`;
  writeFileSync(join(OUT, `${id}-cap.html`), page(cap, CAP_CSS, 'transparent'));
  return { id, ...s };
});

writeFileSync(join(OUT, 'shots.json'), JSON.stringify(shots, null, 2));
console.log(`wrote ${shots.length} shots to ${OUT}`);
