// Builds the static storyboard page for the Giày BQ "Từng bước" TVC.
import { writeFileSync } from 'node:fs';

const OUT = process.argv[2];

// Women's low-heel office pump, side view, toe pointing right. Local box ~86 x 38.
const SHOE = 'M4 4 L4 24 L4 37 L12 37 L15 27 C24 28 34 33 48 35 L76 35 C83 35 85 29 78 26 C68 22 56 20 46 21 C34 22 22 15 4 4 Z';
const HEEL = 'M4 25 L4 37 L12 37 L14.5 27.5 Z';
const STITCH = 'M9 9 C20 16 32 23 46 24.5 C58 25.5 70 26 77 29.5';
const NS = 'vector-effect="non-scaling-stroke"';

function shoe(x, y, s, o = {}) {
  const { rot = 0, flip = false, leg = 0, cls = 'shoe', worn = false } = o;
  const tx = flip ? x + 84 * s : x;
  let g = `<g transform="translate(${tx} ${y}) scale(${flip ? -s : s} ${s}) rotate(${rot} 6 37)">`;
  g += `<path class="${cls}" d="${SHOE}" ${NS}/>`;
  g += `<path class="heel" d="${HEEL}" ${NS}/>`;
  g += `<path class="stitch" d="${STITCH}" ${NS}/>`;
  if (worn) {
    g += `<path class="ink thin" d="M70 27 L74 33 M74 26.5 L78 32 M78 27 L80 31 M5 30 L9 36 M7 28 L11 35 M40 25 C44 28 48 27 50 24 M30 21 C34 25 38 25 40 22" ${NS}/>`;
  }
  if (leg) g += `<path class="cloth" d="M-1 -2 L34 7 L31 ${-leg} L1 ${-leg} Z" ${NS}/>`;
  return g + '</g>';
}

// Hand with index finger extended, fingertip at local (0,0), reaching in from the right.
function hand(x, y, s = 1, rot = 0) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path class="uniform" d="M84 -37 L140 -42 L140 -8 L84 -12 Z" ${NS}/>
    <path class="skin" d="M86 -32 L52 -26 C42 -25 31 -19 21 -12 L3 -4.5 C-1.5 -2.5 0 3 4.5 2 L24 -3 C36 -5 48 -9 57 -13 L86 -16 Z" ${NS}/>
    <path class="ink thin" d="M40 -17 C46 -18 50 -17 54 -15 M36 -12 C42 -13 47 -12 51 -10" ${NS}/>
  </g>`;
}

const arrow = (d, kind) => `<path class="arr-${kind}" d="${d}"/>`;
const label = (x, y, t, cls = 'lbl', anchor = 'start') =>
  `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${t}</text>`;

function rain(x0, x1, n, seed = 7) {
  let r = seed, out = '';
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < n; i++) {
    const x = x0 + rnd() * (x1 - x0), y = rnd() * 160, l = 10 + rnd() * 10;
    out += `M${x.toFixed(1)} ${y.toFixed(1)} l${(-l * 0.35).toFixed(1)} ${l.toFixed(1)} `;
  }
  return `<path class="rain" d="${out}"/>`;
}

function shelfRow(y, x0, n, gap) {
  let g = `<line class="ink thin" x1="0" y1="${y}" x2="320" y2="${y}"/>`;
  for (let i = 0; i < n; i++) g += shoe(x0 + i * gap, y - 13.3, 0.35, { cls: 'shoe-ghost' });
  return g;
}

const panels = [
  {
    t: [0, 3], title: 'Sáng sớm, xỏ giày',
    shot: 'Cận cảnh (CU), máy đặt sát sàn nhà',
    cam: 'Máy đứng yên',
    act: '6:15 sáng. Đôi giày BQ đặt ngay ngắn ở cửa. Bàn chân Linh xỏ vào, gót gõ nhẹ xuống sàn.',
    sound: 'Chuông báo thức tắt. Tiếng gót "cộp".',
    vo: 'Mỗi ngày, bạn đi xa hơn người ta nghĩ.',
    svg: () => `
      <g class="sk">
        <path class="ink thin" d="M0 148 H320 M0 160 H320 M0 174 H320 M160 148 L60 180 M160 148 L260 180 M160 148 L0 168 M160 148 L320 168"/>
        <path class="ink" d="M212 0 V148 M296 0 V148 M218 0 V148"/>
        <rect class="tone" x="218" y="0" width="78" height="148"/>
        <circle class="ink" cx="228" cy="92" r="3"/>
        ${shoe(168, 125.5, 0.6, { cls: 'shoe-ghost' })}
        ${shoe(44, 106, 1.1, { leg: 110 })}
      </g>
      ${arrow('M30 30 V82', 'act')}
      ${label(150, 122, 'cộp!', 'sfx', 'middle')}
      <g><rect class="tag-bg" x="10" y="10" width="54" height="20" rx="2"/>${label(37, 25, '06:15', 'mono', 'middle')}</g>`,
  },
  {
    t: [3, 6], title: 'Kẹt xe dưới mưa',
    shot: 'Trung cảnh hẹp, góc thấp ngang để chân xe máy',
    cam: 'Máy đi song song theo xe, rung nhẹ',
    act: 'Giày đặt trên để chân xe tay ga giữa dòng kẹt xe. Nước mưa bắn qua mũi giày.',
    sound: 'Còi xe, tiếng mưa rào.',
    vo: '',
    svg: () => `
      <g class="sk">
        <rect class="tone" x="0" y="96" width="320" height="64" opacity=".35"/>
        <circle class="ink" cx="300" cy="150" r="16"/><circle class="ink" cx="18" cy="146" r="13"/>
        <ellipse class="puddle" cx="170" cy="164" rx="90" ry="8"/>
        <path class="ink" d="M0 160 H320"/>
        <path class="body" d="M30 118 L96 118 L96 131 L44 133 Q20 128 12 108 L8 96 L40 100 Z"/>
        <path class="body" d="M96 118 H226 Q238 118 240 100 L252 34 L268 36 L258 110 Q254 132 226 132 H96 Z"/>
        <circle class="ink" cx="252" cy="140" r="22"/><circle class="ink thin" cx="252" cy="140" r="9"/>
        ${shoe(118, 81, 1.0, { leg: 100 })}
        <path class="ink thin" d="M206 146 q-6 -10 -2 -16 M214 148 q0 -12 6 -16 M196 150 q-10 -6 -12 -12"/>
      </g>
      ${rain(0, 330, 46)}
      ${label(312, 18, 'mưa ↘', 'note', 'end')}`,
  },
  {
    t: [6, 9], title: 'Thang máy đầy, chuyển sang thang bộ',
    shot: 'Toàn cảnh hẹp (WS) ngang sàn hành lang',
    cam: 'Lia theo bàn chân từ trái sang phải',
    act: 'Thang máy đóng sập trước mặt. Bàn chân rẽ ngoắt sang cầu thang bộ, bước hai bậc một.',
    sound: 'Tiếng cửa thang máy, tiếng bước dồn dập.',
    vo: 'Qua kẹt xe, qua mưa, qua những bậc thang không có thang máy…',
    svg: () => `
      <g class="sk">
        <path class="ink" d="M0 150 H150"/>
        <rect class="ink" x="14" y="28" width="92" height="122"/>
        <rect class="tone" x="18" y="32" width="40" height="118"/><rect class="tone" x="62" y="32" width="40" height="118"/>
        <path class="ink" d="M150 150 V130 H185 V110 H220 V90 H255 V70 H290 V50 H320"/>
        <path class="ink thin" d="M150 104 L320 18 M160 99 V130 M195 81 V110 M230 64 V90 M265 46 V70 M300 28 V50"/>
        ${shoe(150, 104, 0.7, { rot: -14, leg: 70 })}
        ${shoe(188, 83.4, 0.7, { leg: 70 })}
      </g>
      ${arrow('M26 20 H40', 'act')}${arrow('M94 20 H80', 'act')}
      ${label(60, 22, '▲12', 'mono small', 'middle')}
      ${arrow('M98 132 Q128 150 150 122', 'act')}
      <g><rect class="tag-bg" x="236" y="10" width="76" height="18" rx="2"/>${label(274, 23, 'THANG BỘ', 'note', 'middle')}</g>`,
  },
  {
    t: [9, 12], title: 'Hồi hộp trước phòng họp',
    shot: 'Cận cảnh (CU) mũi giày',
    cam: 'Máy đứng yên, lấy nét vào mũi giày',
    act: 'Linh đứng trước cửa phòng họp. Mũi giày nhịp nhịp xuống sàn vì hồi hộp.',
    sound: 'Nhịp chân dần trở thành nhịp nhạc.',
    vo: '',
    svg: () => `
      <g class="sk">
        <path class="ink" d="M0 158 H320"/>
        <rect class="tone" x="124" y="0" width="196" height="158"/>
        <path class="ink" d="M124 0 V158"/>
        <rect class="ink" x="124" y="128" width="196" height="30"/>
        <rect class="tag-bg" x="250" y="30" width="64" height="20"/>
        ${shoe(16, 86, 1.9, { rot: -9, leg: 60 })}
      </g>
      ${label(282, 44, 'PHÒNG HỌP', 'note', 'middle')}
      <path class="arr-act" d="M182 128 q8 -10 0 -20" style="marker-end:none"/>
      <path class="arr-act" d="M192 132 q12 -14 0 -28" style="marker-end:none"/>
      ${label(205, 102, 'tạch… tạch…', 'sfx')}`,
  },
  {
    t: [12, 15], title: 'Match cut: cửa hàng BQ',
    shot: 'Cận cảnh (CU), giữ đúng vị trí giày như cảnh 4',
    cam: 'Máy đứng yên, khớp khung với cảnh 4',
    act: 'Nhịp chân chuyển sang cửa hàng BQ: bàn chân ấy đặt lên thước đo. Chị Hà quỳ xuống giúp Linh xỏ giày, ấn nhẹ ngón tay lên mũi giày kiểm tra độ vừa.',
    sound: 'Nhạc lắng xuống, ấm.',
    vo: '…và cả những lúc hồi hộp nhất.',
    svg: () => `
      <g class="sk">
        <rect class="tone" x="0" y="0" width="320" height="152" opacity=".45"/>
        ${shelfRow(38, 8, 8, 40)}${shelfRow(78, 26, 7, 40)}
        <path class="ink" d="M0 152 H320"/>
        <rect class="ruler" x="10" y="146" width="190" height="8"/>
        <path class="ink thin" d="${Array.from({ length: 18 }, (_, i) => `M${18 + i * 10} 146 v${i % 2 ? 3 : 5}`).join(' ')}"/>
        ${shoe(16, 80, 1.9, { leg: 60 })}
        ${hand(156, 128, 1, -4)}
      </g>
      <g><rect class="tag-bg cut" x="236" y="104" width="78" height="18" rx="2"/>${label(275, 117, 'MATCH CUT ← 4', 'note on', 'middle')}</g>`,
  },
  {
    t: [15, 19], title: 'Đứng vững thuyết trình, bước qua vũng nước',
    shot: '6A: trung cảnh chân (MS) · 6B: cận cảnh bước chân',
    cam: '6A máy đứng yên · 6B máy đi theo bước chân',
    act: 'Trở về hiện tại. 6A: Linh đứng vững thuyết trình, chỉ thấy chân và dáng đứng tự tin. 6B: cắt nhanh, bước qua vũng nước trên đường đi gặp khách.',
    sound: 'Nhạc dâng lên.',
    vo: '',
    split: true,
    svg: () => `
      <defs><clipPath id="c6a"><rect x="0" y="0" width="158" height="180"/></clipPath><clipPath id="c6b"><rect x="162" y="0" width="158" height="180"/></clipPath></defs>
      <g clip-path="url(#c6a)" class="sk">
        <rect class="glow" x="10" y="0" width="140" height="70" opacity=".5"/>
        <path class="ink thin" d="M10 70 H150"/>
        <rect class="tone" x="104" y="84" width="8" height="66"/><rect class="tone" x="140" y="84" width="8" height="66"/>
        <path class="ink" d="M96 84 H158 M0 150 H158"/>
        ${shoe(18, 123.4, 0.7, { leg: 90 })}
        ${shoe(52, 125.5, 0.65, { leg: 90 })}
      </g>
      <g clip-path="url(#c6b)" class="sk">
        <path class="ink" d="M162 150 H320"/>
        <ellipse class="puddle" cx="250" cy="153" rx="46" ry="7"/>
        <ellipse class="ink thin" cx="250" cy="153" rx="22" ry="3"/>
        ${shoe(168, 124, 0.7, { rot: 16, leg: 70 })}
        ${shoe(262, 92, 0.7, { rot: -10, leg: 70 })}
      </g>
      ${arrow('M206 112 Q240 70 262 96', 'act')}
      <rect class="gutter" x="158" y="0" width="4" height="180"/>
      ${label(8, 172, '6A', 'note')}${label(312, 172, '6B', 'note', 'end')}`,
  },
  {
    t: [19, 23], title: 'Tan làm muộn, quay lại bảo hành',
    shot: '7A: toàn cảnh hẹp phố đêm · 7B: cận cảnh quầy cửa hàng',
    cam: '7A máy lùi theo bước chân · 7B máy đứng yên',
    act: '7A: 21h, sảnh văn phòng vắng, bàn chân vẫn bước đều ra phố đầy đèn. 7B: vài năm sau, đôi giày đã sờn, mòn gót được đặt lên quầy BQ. Chị Hà nâng niu kiểm tra rồi trao lại đôi giày đã bảo hành.',
    sound: 'Nhạc tiếp tục dâng.',
    vo: 'Bạn tận lực trong cuộc sống.',
    split: true,
    svg: () => `
      <defs><clipPath id="c7a"><rect x="0" y="0" width="158" height="180"/></clipPath><clipPath id="c7b"><rect x="162" y="0" width="158" height="180"/></clipPath></defs>
      <g clip-path="url(#c7a)">
        <rect class="night" x="0" y="0" width="158" height="180"/>
        <g class="sk">
          <circle class="glow" cx="40" cy="30" r="22" opacity=".55"/><circle class="glow" cx="122" cy="44" r="16" opacity=".45"/>
          <path class="ink-night" d="M40 30 V150 M122 44 V150 M0 150 H158"/>
          ${shoe(20, 117, 0.7, { rot: 14, leg: 80 })}
          ${shoe(78, 123.4, 0.7, { leg: 80 })}
        </g>
        ${label(8, 172, '7A · 21:00', 'note on-night')}
      </g>
      <g clip-path="url(#c7b)">
        <g class="sk">
          <rect class="tone" x="162" y="112" width="158" height="68"/>
          <path class="ink" d="M162 112 H320"/>
          ${shoe(170, 74, 1.0, { worn: true, cls: 'shoe-worn' })}
          ${hand(248, 97, 0.8, -8)}
        </g>
        ${label(312, 172, '7B · VÀI NĂM SAU', 'note', 'end')}
      </g>
      ${label(214, 62, 'mòn gót, sờn mũi', 'sfx small', 'middle')}
      <rect class="gutter" x="158" y="0" width="4" height="180"/>`,
  },
  {
    t: [23, 27], title: 'Lên bục nhận giải, máy nâng lên',
    shot: 'Mở đầu cận cảnh giày, kết thúc trung cảnh (MS) lộ gương mặt',
    cam: 'Máy nâng lên (crane up) lần đầu tiên trong phim, từ sàn lên ngang mặt',
    act: 'Bước nhảy thời gian: cùng đôi chân bước lên bục nhận giải nhân viên xuất sắc. Máy từ từ nâng lên, lộ gương mặt Linh mỉm cười.',
    sound: 'Nhạc đạt đỉnh.',
    vo: 'Chúng tôi tận tuỵ nâng bước bạn đến thành công.',
    svg: () => `
      <g class="sk">
        <path class="glow" d="M220 0 L160 122 L284 122 Z" opacity=".45"/>
        <path class="ink" d="M0 158 H50 V140 H96 V122 H320"/>
        <rect class="tone" x="96" y="122" width="224" height="58"/>
        <path class="cloth" d="M208 66 L206 118 L218 118 L222 80 L226 118 L238 118 L236 66 Z"/>
        ${shoe(196, 109, 0.38, { flip: true })}${shoe(226, 109, 0.38)}
        <path class="uniform" d="M204 70 L200 34 Q222 24 244 34 L240 70 Z"/>
        <path class="skin" d="M243 36 L262 18 L266 22 L246 44 Z"/>
        <rect class="trophy" x="260" y="6" width="12" height="16"/>
        <circle class="skin" cx="222" cy="18" r="10"/>
        <path class="ink thin" d="M218 21 Q222 25 226 21"/>
      </g>
      <rect class="frame-mark" x="186" y="92" width="72" height="40"/>
      ${label(182, 104, 'khung đầu', 'note cam', 'end')}
      <rect class="frame-mark" x="176" y="4" width="92" height="56"/>
      ${label(172, 16, 'khung cuối', 'note cam', 'end')}
      ${arrow('M300 150 V24', 'cam')}
      ${label(312, 172, 'NÂNG MÁY', 'note cam', 'end')}
      <path class="confetti" d="M40 20 h5 M70 40 h5 M120 16 h5 M150 50 h5 M30 70 h5 M300 60 h4 M286 20 h5"/>`,
  },
  {
    t: [27, 30], title: 'Packshot',
    shot: 'Cận cảnh sản phẩm trên nền sạch',
    cam: 'Máy trượt ngang rất chậm',
    act: 'Đôi giày công sở nữ của BQ. Super: "Bạn tận lực. Chúng tôi tận tuỵ." cùng logo Giày BQ và dòng phụ "Bảo hành trọn đời".',
    sound: 'Âm thanh logo.',
    vo: '',
    svg: () => `
      <ellipse class="shadow" cx="118" cy="140" rx="74" ry="6"/>
      <g class="sk">
        <path class="ink thin" d="M0 140 H320"/>
        ${shoe(84, 92, 1.0, { cls: 'shoe-back' })}
        ${shoe(52, 100, 1.05)}
      </g>
      ${label(160, 34, 'Bạn tận lực. Chúng tôi tận tuỵ.', 'super', 'middle')}
      <rect class="logo" x="210" y="92" width="96" height="30" rx="2"/>
      ${label(258, 112, 'GIÀY BQ', 'logo-t', 'middle')}
      ${label(258, 134, 'Bảo hành trọn đời', 'note', 'middle')}
      ${label(160, 172, 'Áp dụng theo chính sách bảo hành của Giày BQ', 'legal', 'middle')}`,
  },
];

const tc = (s) => `00:${String(s).padStart(2, '0')}`;

const panelHtml = panels.map((p, i) => {
  const n = i + 1;
  return `
  <article class="panel" id="canh-${n}">
    <figure class="frame">
      <svg viewBox="0 0 320 180" role="img" aria-label="Cảnh ${n}: ${p.title}">${p.svg()}</svg>
    </figure>
    <div class="caption">
      <div class="head">
        <span class="num">${n}</span>
        <h2>${p.title}</h2>
        <span class="tc">${tc(p.t[0])}–${tc(p.t[1])}</span>
      </div>
      <dl>
        <div><dt>Khung hình</dt><dd>${p.shot}</dd></div>
        <div><dt>Máy quay</dt><dd>${p.cam}</dd></div>
        <div><dt>Hành động</dt><dd>${p.act}</dd></div>
        <div><dt>Âm thanh</dt><dd>${p.sound}${p.vo ? `<span class="vo">VO: “${p.vo}”</span>` : ''}</dd></div>
      </dl>
    </div>
  </article>`;
}).join('');

const timeline = panels.map((p, i) =>
  `<a href="#canh-${i + 1}" style="flex:${p.t[1] - p.t[0]}" title="Cảnh ${i + 1}: ${p.title}"><span>${i + 1}</span></a>`).join('');

const html = `<title>Storyboard Từng bước</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@500&display=swap">
<style>
/* Layout: a production storyboard sheet. A slate header, a 30-second timeline strip, then 16:9 panels in a 3-up grid. */
:root {
  --paper: #eef0f2; --panel: #ffffff; --ink: #23272d; --muted: #5f6772; --line: #d3d8de;
  --tone: #dde1e6; --cloth: #b9c0c9; --uniform: #8c96a3; --skin: #ecd5c3; --night: #2f3644; --ink-night: #c7cdd6;
  --glow: #f3dc8f; --shoe: #6f3b22; --shoe-back: #8d5132; --cam: #2c58cf; --act: #cf3f2b;
  --font-display: "Barlow Condensed", "Arial Narrow", sans-serif;
  --font-body: "Be Vietnam Pro", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --paper: #15181c; --panel: #1f2329; --ink: #e3e6ea; --muted: #9aa3ae; --line: #343a42;
  --tone: #2b3138; --cloth: #4a525d; --uniform: #5d6774; --skin: #9b7a64; --night: #0e1116; --ink-night: #c7cdd6;
  --glow: #8f7a3a; --shoe: #b46c43; --shoe-back: #8c5233; --cam: #7d9cff; --act: #ff7a64; color-scheme: dark } }
:root[data-theme="dark"] {
  --paper: #15181c; --panel: #1f2329; --ink: #e3e6ea; --muted: #9aa3ae; --line: #343a42;
  --tone: #2b3138; --cloth: #4a525d; --uniform: #5d6774; --skin: #9b7a64; --night: #0e1116; --ink-night: #c7cdd6;
  --glow: #8f7a3a; --shoe: #b46c43; --shoe-back: #8c5233; --cam: #7d9cff; --act: #ff7a64; color-scheme: dark }

body { background: var(--paper); color: var(--ink); font-family: var(--font-body); font-size: 14px; line-height: 1.55; }
.wrap { max-width: 1240px; margin: 0 auto; padding-block: 28px 56px;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px));
  display: grid; gap: 24px; }

.slate { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 16px 32px; align-items: end;
  border-bottom: 2px solid var(--ink); padding-bottom: 18px; }
.eyebrow { font-family: var(--font-display); font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); font-size: 13px; }
h1 { font-family: var(--font-display); font-weight: 700; font-size: clamp(40px, 7vw, 68px); line-height: .95; margin: 4px 0 8px; text-wrap: balance; }
.tagline { margin: 0; max-width: 62ch; font-size: 15px; }
.slate dl { display: grid; grid-template-columns: repeat(3, auto); gap: 10px 24px; margin: 0; }
.slate dt, .caption dt { font-family: var(--font-display); font-weight: 600; letter-spacing: .08em; text-transform: uppercase; font-size: 11.5px; color: var(--muted); }
.slate dd { margin: 0; font-weight: 500; }

.strip { display: grid; gap: 8px; }
.strip-row { display: flex; gap: 3px; }
.strip-row a { display: flex; align-items: center; justify-content: center; height: 30px; background: var(--panel);
  border: 1px solid var(--line); color: var(--ink); text-decoration: none; font-family: var(--font-mono); font-size: 12px; min-width: 0; }
.strip-row a:hover, .strip-row a:focus-visible { border-color: var(--ink); outline: none; }
.ticks { display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px; color: var(--muted); font-variant-numeric: tabular-nums; }

.legend { display: flex; flex-wrap: wrap; gap: 8px 22px; font-size: 13px; color: var(--muted); }
.legend span { display: inline-flex; align-items: center; gap: 8px; }
.legend svg { width: 34px; height: 12px; flex: none; }

.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px 20px; }
@media (max-width: 980px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .grid { grid-template-columns: minmax(0, 1fr); } .slate { grid-template-columns: minmax(0, 1fr); } .slate dl { grid-template-columns: repeat(2, auto); } }

.panel { display: grid; gap: 12px; align-content: start; min-width: 0; }
.frame { margin: 0; background: var(--panel); border: 1.5px solid var(--ink); aspect-ratio: 16 / 9; max-width: 100%; overflow: hidden; }
.frame svg { display: block; width: 100%; height: 100%; }
.head { display: flex; align-items: baseline; gap: 10px; }
.num { font-family: var(--font-display); font-weight: 700; font-size: 28px; line-height: 1; }
.head h2 { font-size: 15px; font-weight: 600; margin: 0; flex: 1; min-width: 0; text-wrap: balance; }
.tc { font-family: var(--font-mono); font-size: 12px; color: var(--muted); font-variant-numeric: tabular-nums; white-space: nowrap; }
.caption dl { margin: 8px 0 0; display: grid; gap: 6px; }
.caption dl div { display: grid; grid-template-columns: 86px minmax(0, 1fr); gap: 10px; border-top: 1px solid var(--line); padding-top: 6px; }
.caption dd { margin: 0; font-size: 13.5px; }
.vo { display: block; margin-top: 4px; font-style: italic; color: var(--ink); font-weight: 500; }

.notes { border-top: 2px solid var(--ink); padding-top: 16px; display: grid; gap: 8px; max-width: 75ch; }
.notes h3 { font-family: var(--font-display); font-size: 22px; margin: 0; }
.notes ul { margin: 0; padding-left: 18px; display: grid; gap: 4px; }

/* sketch styles */
svg .ink { fill: none; stroke: var(--ink); stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
svg .ink.thin { stroke-width: .8; opacity: .7; }
svg .ink-night { fill: none; stroke: var(--ink-night); stroke-width: 1.2; }
svg .tone { fill: var(--tone); }
svg .night { fill: var(--night); }
svg .glow { fill: var(--glow); }
svg .shoe { fill: var(--shoe); stroke: var(--ink); stroke-width: 1.3; stroke-linejoin: round; }
svg .shoe-back { fill: var(--shoe-back); stroke: var(--ink); stroke-width: 1.3; }
svg .shoe-worn { fill: var(--shoe-back); stroke: var(--ink); stroke-width: 1.3; }
svg .shoe-ghost { fill: var(--cloth); stroke: var(--ink); stroke-width: .9; opacity: .8; }
svg .heel { fill: var(--ink); opacity: .55; }
svg .stitch { fill: none; stroke: var(--paper); stroke-width: .8; stroke-dasharray: 2 2; opacity: .8; }
svg .cloth { fill: var(--cloth); stroke: var(--ink); stroke-width: 1.2; }
svg .uniform { fill: var(--uniform); stroke: var(--ink); stroke-width: 1.2; }
svg .skin { fill: var(--skin); stroke: var(--ink); stroke-width: 1.1; }
svg .body { fill: var(--tone); stroke: var(--ink); stroke-width: 1.4; }
svg .puddle { fill: var(--cam); opacity: .16; stroke: var(--cam); stroke-width: .8; }
svg .ruler { fill: var(--panel); stroke: var(--ink); stroke-width: 1; }
svg .rain { stroke: var(--cam); stroke-width: .9; opacity: .55; fill: none; }
svg .trophy { fill: var(--glow); stroke: var(--ink); stroke-width: 1; }
svg .shadow { fill: var(--ink); opacity: .14; }
svg .confetti { stroke: var(--act); stroke-width: 2; stroke-linecap: round; opacity: .7; }
svg .gutter { fill: var(--panel); }
svg .frame-mark { fill: none; stroke: var(--cam); stroke-width: 1.2; stroke-dasharray: 4 3; }
svg .tag-bg { fill: var(--panel); stroke: var(--ink); stroke-width: 1; }
svg .tag-bg.cut { fill: var(--act); stroke: none; }
svg .logo { fill: var(--ink); }
svg .arr-act { fill: none; stroke: var(--act); stroke-width: 2.2; stroke-linecap: round; marker-end: url(#m-act); }
svg .arr-cam { fill: none; stroke: var(--cam); stroke-width: 2.4; stroke-dasharray: 7 4; marker-end: url(#m-cam); }
svg .m-act { fill: var(--act); } svg .m-cam { fill: var(--cam); }
svg text { font-family: var(--font-display); fill: var(--ink); }
svg .lbl, svg .note { font-size: 11px; font-weight: 600; letter-spacing: .06em; }
svg .note.cam { fill: var(--cam); } svg .note.on { fill: #fff; } svg .note.on-night { fill: var(--ink-night); }
svg .mono { font-family: var(--font-mono); font-size: 12px; }
svg .mono.small { font-size: 10px; }
svg .sfx { font-family: var(--font-body); font-style: italic; font-size: 12px; fill: var(--act); font-weight: 600; }
svg .sfx.small { font-size: 10px; }
svg .super { font-size: 19px; font-weight: 700; }
svg .logo-t { font-size: 16px; font-weight: 700; letter-spacing: .14em; fill: var(--panel); }
svg .legal { font-family: var(--font-body); font-size: 7px; fill: var(--muted); }
svg .sk { filter: url(#rough); }
@media (prefers-reduced-motion: no-preference) { .strip-row a { transition: border-color .15s; } }
</style>

<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3"/>
      <feDisplacementMap in="SourceGraphic" scale="1.6"/>
    </filter>
    <marker id="m-act" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path class="m-act" d="M0 0 L10 5 L0 10 Z"/></marker>
    <marker id="m-cam" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path class="m-cam" d="M0 0 L10 5 L0 10 Z"/></marker>
  </defs>
</svg>

<main class="wrap">
  <header class="slate">
    <div>
      <div class="eyebrow">Storyboard · TVC 30 giây</div>
      <h1>Từng bước</h1>
      <p class="tagline">Bạn tận lực trong cuộc sống. Chúng tôi tận tuỵ nâng bước bạn đến thành công.</p>
    </div>
    <dl>
      <div><dt>Thương hiệu</dt><dd>Giày BQ</dd></div>
      <div><dt>Thời lượng</dt><dd>30 giây</dd></div>
      <div><dt>Khung hình</dt><dd>16:9</dd></div>
      <div><dt>Kịch bản</dt><dd>v3</dd></div>
      <div><dt>Storyboard</dt><dd>v1</dd></div>
      <div><dt>Ngày</dt><dd>17/10/2026</dd></div>
    </dl>
  </header>

  <section class="strip" aria-label="Dòng thời gian 30 giây">
    <div class="strip-row">${timeline}</div>
    <div class="ticks"><span>00:00</span><span>00:10</span><span>00:20</span><span>00:30</span></div>
  </section>

  <div class="legend">
    <span><svg viewBox="0 0 34 12"><path class="arr-act" d="M2 6 H26"/></svg>Chuyển động của nhân vật</span>
    <span><svg viewBox="0 0 34 12"><path class="arr-cam" d="M2 6 H26"/></svg>Chuyển động máy quay</span>
    <span><svg viewBox="0 0 34 12"><rect class="shoe" x="4" y="2" width="26" height="8" rx="3"/></svg>Giày BQ của Linh (sản phẩm)</span>
    <span><svg viewBox="0 0 34 12"><rect class="frame-mark" x="3" y="1.5" width="28" height="9"/></svg>Khung hình đầu và cuối của cú máy</span>
  </div>

  <section class="grid">${panelHtml}
  </section>

  <section class="notes">
    <h3>Ghi chú cho đoàn quay</h3>
    <ul>
      <li>Cảnh 1 đến 7 giữ máy ở độ cao mắt cá chân. Cảnh 8 là lần duy nhất máy nâng lên, nên tránh mọi cú máy cao trước đó.</li>
      <li>Cảnh 4 và 5 phải khớp vị trí giày trong khung để chuyển cảnh match cut liền mạch.</li>
      <li>Cảnh 7B cần một đôi giày cùng mẫu đã mòn gót và sờn mũi. Phạm vi bảo hành trọn đời của BQ bao gồm gót, đế, keo và chỉ.</li>
      <li>Cảnh 5 và 7B quay tại cửa hàng BQ thật. Dòng chữ nhỏ ở cảnh 9 cần bộ phận pháp lý duyệt trước khi phát sóng.</li>
    </ul>
  </section>
</main>
`;

writeFileSync(OUT, html);
console.log('wrote', OUT, html.length, 'bytes');
