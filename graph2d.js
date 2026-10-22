// graph2d.js — the map, drawn on a plain 2D canvas from precomputed 3D positions (data/layout.json, made by scripts/layout.mjs).
// No WebGL and no libraries, so it starts in any browser and offline. One global: createGraph2D(el, opts), used by index.html.
//   opts: nodes [{ id, x, y, z, color, size 0..1 }], links [[source, target] indices], tooltip(id) → html, onClick(id),
//         onBackground(), avoid() → DOMRect | null the tooltip keeps clear of, reduced (prefers-reduced-motion)
//   methods: setState({ visible, focus, chain }), setData(nodes, links), flyTo(id, { right, top, bottom }), resize(), pause(), resume(), spin(on)
function createGraph2D(el, opts) {
  const cv = document.createElement('canvas'), cx = cv.getContext('2d');
  if (!cx) throw new Error('no 2D canvas');
  cv.style.cssText = 'display:block;width:100%;height:100%;touch-action:none';
  el.appendChild(cv);
  const tip = document.createElement('div');
  tip.className = 'g2-tip';
  tip.style.cssText = 'position:fixed;left:0;top:0;z-index:30;pointer-events:none;display:none';
  document.body.appendChild(tip);

  const TAU = Math.PI * 2, LV = 20; // LV: alpha steps of the precomputed colour strings
  const SPIN = 0.05, ROT = 0.006, TILT_K = 0.004, TILT_MIN = -1.1, TILT_MAX = 0.15, ZMIN = 0.5, ZMAX = 4; // rad/s, rad/px
  const EASE = 0.12, INTRO = 2500, BASE = 2.2, KS = 6, RMAX = 16; // dot radius = (BASE + sqrt(size) * KS) * depth * scale
  const EDGE = 'rgba(150,165,210,.11)', EDGE_DIM = 'rgba(150,165,210,.03)', RIM = 'rgba(8,10,18,.5)', RING = 'rgba(255,255,255,.95)';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  let N = 0, ids = [], at = new Map(), links = [], order = [];
  let X, Y, Z, SZ, CI, YN, P, RAD, vis, inChain; // P: screen x, y and depth factor per node (0 = behind the camera)
  let dotCol = [], edgeCol = [], solid = [];
  let minY = 0, maxY = 1, rMax = 1, kLo = 0.7, kHi = 1.4, D = 600, S = 1, W = 0, H = 0, dpr = 1;
  let focus = -1, hover = -1, spinOn = true, raf = 0, last = 0, paused = false, placed = false;
  let introStart = null, introP = 0, introDone = !!opts.reduced;
  const cam = { rotY: 0, tilt: -0.15, zoom: 1, panY: 0, offX: 0, offY: 0 }, tg = {}; // tg: tween targets

  function setData(nodes, ls) {
    N = nodes.length; ids = nodes.map((n) => n.id); at = new Map(ids.map((id, i) => [id, i])); order = ids.map((_, i) => i);
    X = new Float32Array(N); Y = new Float32Array(N); Z = new Float32Array(N); SZ = new Float32Array(N); YN = new Float32Array(N);
    CI = new Uint16Array(N); P = new Float32Array(N * 3); RAD = new Float32Array(N);
    vis = new Uint8Array(N).fill(1); inChain = new Uint8Array(N);
    const ci = new Map(), rgb = [];
    nodes.forEach((n, i) => {
      X[i] = n.x; Y[i] = n.y; Z[i] = n.z; SZ[i] = Math.sqrt(clamp(n.size || 0, 0, 1));
      let h = String(n.color || '#999999');
      if (h.length === 4) h = '#' + [...h.slice(1)].map((c) => c + c).join('');
      if (!ci.has(h)) { ci.set(h, rgb.length); rgb.push([1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16) || 0)); }
      CI[i] = ci.get(h);
    });
    dotCol = rgb.map((c) => Array.from({ length: LV + 1 }, (_, l) => `rgba(${c},${l / LV})`));
    edgeCol = rgb.map((c) => `rgba(${c},.75)`); solid = rgb.map((c) => `rgb(${c})`);
    links = ls.filter(([a, b]) => a >= 0 && b >= 0 && a < N && b < N && a !== b);
    minY = Infinity; maxY = -Infinity; rMax = 1;
    for (let i = 0; i < N; i++) { minY = Math.min(minY, Y[i]); maxY = Math.max(maxY, Y[i]); rMax = Math.max(rMax, Math.hypot(X[i], Z[i])); }
    if (!N) { minY = 0; maxY = 1; }
    const hy = Math.max(1, maxY - minY);
    for (let i = 0; i < N; i++) YN[i] = (Y[i] - minY) / hy;
    D = hy * 1.2; // focal length about the size of the scene
    const rb = Math.hypot(rMax, hy / 2); kLo = D / (D + rb); kHi = D / Math.max(1, D - rb);
    if (!placed) { cam.panY = (minY + maxY) / 2; placed = true; } // a later setData (language switch) keeps the camera
    focus = hover = -1; tip.style.display = 'none';
    fit(); kick();
  }

  // scale that fits the whole cone in the canvas (perspective makes the near rim ~1.4× wider)
  function fit() { if (W && H) S = Math.max(0.05, Math.min((0.72 * H) / Math.max(1, maxY - minY), (0.9 * W) / (2.6 * rMax))); }

  function resize() {
    const w = el.clientWidth, h = el.clientHeight, r = Math.min(2, window.devicePixelRatio || 1);
    if (!w || !h) return;
    if (w !== W || h !== H || r !== dpr) { W = w; H = h; dpr = r; cv.width = Math.round(w * r); cv.height = Math.round(h * r); }
    fit(); kick();
  }

  function project() {
    const cr = Math.cos(cam.rotY), sr = Math.sin(cam.rotY), ct = Math.cos(cam.tilt), st = Math.sin(cam.tilt);
    const sc = S * cam.zoom, ox = W / 2 + cam.offX, oy = H / 2 + cam.offY, ds = clamp(Math.sqrt(sc), 0.9, 2.4);
    for (let i = 0, j = 0; i < N; i++, j += 3) {
      const x = X[i], y = Y[i] - cam.panY, z = Z[i];
      const x1 = x * cr - z * sr, z1 = x * sr + z * cr; // rotY around the vertical axis
      const y2 = y * ct + z1 * st, z2 = z1 * ct - y * st, d = D - z2; // then tilt (negative = looking from above)
      if (d < 1) { P[j + 2] = 0; continue; }
      const k = D / d;
      P[j] = ox + x1 * k * sc; P[j + 1] = oy - y2 * k * sc; P[j + 2] = k;
      RAD[i] = clamp((BASE + SZ[i] * KS) * k * ds, 1, RMAX);
    }
  }
  // intro: dots rise from the young bottom to the top
  const appear = (i) => (introDone ? 1 : clamp((introP * 1.3 - YN[i]) / 0.3, 0, 1));

  function draw() {
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx.clearRect(0, 0, W, H);
    if (!N || !W) return;
    project();
    const lit = focus >= 0;
    // edges behind the dots: one path, one faint stroke
    cx.beginPath();
    for (const [a, b] of links) {
      if (!vis[a] || !vis[b] || !P[a * 3 + 2] || !P[b * 3 + 2] || (lit && inChain[a] && inChain[b])) continue;
      if (!introDone && (appear(a) < 0.6 || appear(b) < 0.6)) continue;
      cx.moveTo(P[a * 3], P[a * 3 + 1]); cx.lineTo(P[b * 3], P[b * 3 + 1]);
    }
    cx.strokeStyle = lit ? EDGE_DIM : EDGE; cx.lineWidth = 1; cx.stroke();
    // the focused chain: coloured by the target's subject, with an arrowhead at the target
    if (lit) {
      cx.lineWidth = 1.6;
      for (const [a, b] of links) {
        if (!inChain[a] || !inChain[b] || !vis[a] || !vis[b] || !P[a * 3 + 2] || !P[b * 3 + 2]) continue;
        const x0 = P[a * 3], y0 = P[a * 3 + 1], dx = P[b * 3] - x0, dy = P[b * 3 + 1] - y0, len = Math.hypot(dx, dy);
        const gap = RAD[b] * (b === focus ? 1.6 : 1) + (b === focus ? 4 : 1.5);
        if (len < gap + 2) continue;
        const ux = dx / len, uy = dy / len, ex = x0 + ux * (len - gap), ey = y0 + uy * (len - gap), head = len > gap + 10;
        cx.strokeStyle = cx.fillStyle = edgeCol[CI[b]];
        cx.beginPath(); cx.moveTo(x0, y0); cx.lineTo(head ? ex - ux * 5 : ex, head ? ey - uy * 5 : ey); cx.stroke();
        if (head) {
          cx.beginPath(); cx.moveTo(ex, ey);
          cx.lineTo(ex - ux * 6.5 - uy * 3.2, ey - uy * 6.5 + ux * 3.2); cx.lineTo(ex - ux * 6.5 + uy * 3.2, ey - uy * 6.5 - ux * 3.2);
          cx.closePath(); cx.fill();
        }
      }
    }
    // dots far → near; far ones a bit dimmer, a dark rim keeps same-coloured neighbours apart
    order.sort((a, b) => P[a * 3 + 2] - P[b * 3 + 2]);
    cx.lineWidth = 1; cx.strokeStyle = RIM;
    for (const i of order) {
      const k = P[i * 3 + 2];
      if (!k || !vis[i] || i === focus || i === hover) continue;
      const ap = appear(i);
      if (ap <= 0) continue;
      const dim = lit && !inChain[i], a = (dim ? 0.1 : 0.5 + 0.45 * clamp((k - kLo) / (kHi - kLo), 0, 1)) * ap;
      cx.beginPath(); cx.arc(P[i * 3], P[i * 3 + 1], RAD[i] * (0.5 + 0.5 * ap), 0, TAU);
      cx.fillStyle = dotCol[CI[i]][Math.round(a * LV)]; cx.fill();
      if (!dim) cx.stroke();
    }
    // the focused dot and the one under the cursor: bigger, a glow in its colour, a white ring
    for (const i of hover >= 0 && hover !== focus ? [focus, hover] : [focus]) {
      if (i < 0 || !vis[i] || !P[i * 3 + 2]) continue;
      const x = P[i * 3], y = P[i * 3 + 1], r = RAD[i] * 1.6;
      cx.save(); cx.shadowColor = solid[CI[i]]; cx.shadowBlur = 14 * dpr; // shadowBlur ignores the transform
      cx.beginPath(); cx.arc(x, y, r, 0, TAU); cx.fillStyle = solid[CI[i]]; cx.fill(); cx.restore();
      cx.beginPath(); cx.arc(x, y, r + 2.5, 0, TAU); cx.strokeStyle = RING; cx.lineWidth = 1.5; cx.stroke();
    }
  }

  // --- motion: one rAF loop that stops when nothing moves (battery); kick() asks for one more frame
  let drag = false, multi = false;
  const spinning = () => spinOn && !opts.reduced && hover < 0 && focus < 0 && !drag && !multi;
  function step(t, dt) {
    let moving = false;
    if (!introDone && W) {
      introStart ??= t;
      introP = Math.min(1, (t - introStart) / INTRO);
      if (introP >= 1) introDone = true; else moving = true;
    }
    if (spinning()) { cam.rotY += SPIN * dt; moving = true; }
    const e = opts.reduced ? 1 : 1 - Math.pow(1 - EASE, dt * 60);
    for (const k of Object.keys(tg)) {
      const d = tg[k] - cam[k];
      if (Math.abs(d) < 1e-3) { cam[k] = tg[k]; delete tg[k]; } else { cam[k] += d * e; moving = true; }
    }
    return moving;
  }
  function frame(t) {
    raf = 0;
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 1 / 60;
    last = t;
    const moving = step(t, dt);
    draw();
    if (moving && !paused) raf = requestAnimationFrame(frame); else last = 0;
  }
  const kick = () => { if (!raf && !paused) raf = requestAnimationFrame(frame); };

  // --- input: pointer events for mouse and touch
  const ptrs = new Map();
  let down = null, pinchD = 0;
  const pos = (ev) => { const r = cv.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
  const pinch = () => { const [a, b] = [...ptrs.values()]; return Math.hypot(a[0] - b[0], a[1] - b[1]); };
  const zoomBy = (f) => { delete tg.zoom; cam.zoom = clamp(cam.zoom * f, ZMIN, ZMAX); kick(); };

  function hit(x, y) {
    let best = -1, bd = Infinity;
    for (let i = 0; i < N; i++) {
      const k = P[i * 3 + 2];
      if (!k || !vis[i] || appear(i) <= 0) continue;
      const d = Math.hypot(P[i * 3] - x, P[i * 3 + 1] - y), r = RAD[i] * (i === focus || i === hover ? 1.6 : 1);
      if (d > Math.max(11, r + 6)) continue;
      if (d < bd - 0.5 || (Math.abs(d - bd) <= 0.5 && k > P[best * 3 + 2])) { best = i; bd = d; } // a near tie goes to the nearer dot
    }
    return best;
  }
  function setHover(i) {
    if (i === hover) return;
    hover = i;
    cv.style.cursor = i >= 0 ? 'pointer' : '';
    if (i < 0) tip.style.display = 'none'; else tip.innerHTML = opts.tooltip ? opts.tooltip(ids[i]) : '';
    kick();
  }
  // the tooltip goes right-below the cursor; left of it at the window's right edge or the panel's left edge, above it at the bottom
  function placeTip(px, py) {
    tip.style.display = 'block';
    const w = tip.offsetWidth, h = tip.offsetHeight, av = opts.avoid ? opts.avoid() : null;
    let x = px + 16, y = py + 16;
    const hitsAvoid = av && x + w > av.left && px < av.left && y < av.bottom && y + h > av.top;
    if (x + w > innerWidth - 8 || hitsAvoid) x = px - 16 - w;
    if (y + h > innerHeight - 8) y = py - 16 - h;
    tip.style.left = `${Math.max(8, x)}px`; tip.style.top = `${Math.max(8, y)}px`;
  }

  cv.addEventListener('pointerdown', (ev) => {
    if (ev.button > 0) return;
    try { cv.setPointerCapture(ev.pointerId); } catch { /* the pointer is already gone */ }
    ptrs.set(ev.pointerId, pos(ev));
    if (ptrs.size === 1) down = { x: ev.clientX, y: ev.clientY, lx: ev.clientX, ly: ev.clientY };
    else { multi = true; drag = false; pinchD = pinch(); setHover(-1); } // a second finger: pinch, and no tap
  });
  cv.addEventListener('pointermove', (ev) => {
    if (!ptrs.has(ev.pointerId)) {
      if (ev.pointerType === 'mouse' && !paused) {
        const [x, y] = pos(ev), i = hit(x, y);
        setHover(i);
        if (i >= 0) placeTip(ev.clientX, ev.clientY);
      }
      return;
    }
    ptrs.set(ev.pointerId, pos(ev));
    if (ptrs.size >= 2) { const d = pinch(); if (pinchD) zoomBy(d / pinchD); pinchD = d; return; }
    if (!down || multi) return;
    if (!drag && Math.hypot(ev.clientX - down.x, ev.clientY - down.y) >= 4) {
      drag = true; delete tg.rotY; delete tg.tilt; setHover(-1); cv.style.cursor = 'grabbing';
    }
    if (drag) {
      cam.rotY -= (ev.clientX - down.lx) * ROT;
      cam.tilt = clamp(cam.tilt - (ev.clientY - down.ly) * TILT_K, TILT_MIN, TILT_MAX);
      kick();
    }
    down.lx = ev.clientX; down.ly = ev.clientY;
  });
  const end = (ev) => {
    if (!ptrs.has(ev.pointerId)) return;
    ptrs.delete(ev.pointerId);
    if (ev.type === 'pointerup' && down && !drag && !multi && !ptrs.size) {
      const [x, y] = pos(ev), i = hit(x, y);
      if (i >= 0) opts.onClick?.(ids[i]); else opts.onBackground?.();
    }
    if (!ptrs.size) { down = null; drag = false; multi = false; pinchD = 0; cv.style.cursor = hover >= 0 ? 'pointer' : ''; kick(); }
    else pinchD = 0; // one finger left after a pinch: neither a tap nor a drag
  };
  cv.addEventListener('pointerup', end);
  cv.addEventListener('pointercancel', end);
  cv.addEventListener('lostpointercapture', end);
  cv.addEventListener('pointerleave', (ev) => { if (ev.pointerType === 'mouse' && !ptrs.size) setHover(-1); });
  cv.addEventListener('wheel', (ev) => { ev.preventDefault(); zoomBy(Math.exp(-ev.deltaY * (ev.deltaMode ? 0.05 : 0.0015))); }, { passive: false });

  setData(opts.nodes || [], opts.links || []);
  resize();

  return {
    setData,
    setState(s) {
      const prev = focus;
      for (let i = 0; i < N; i++) {
        vis[i] = !s.visible || s.visible(ids[i]) ? 1 : 0;
        inChain[i] = s.chain && s.chain.has(ids[i]) ? 1 : 0;
      }
      focus = s.focus != null && at.has(s.focus) ? at.get(s.focus) : -1;
      if (prev >= 0 && focus < 0) { tg.offX = 0; tg.offY = 0; } // the card closed: centre on the whole canvas again
      if ((hover >= 0 && !vis[hover]) || focus !== prev) setHover(-1); // a new topic: the camera moves, the old hint would point at nothing
      kick();
    },
    // turn the node to the front, look slightly from above, zoom in, and centre it in the part of the canvas the card leaves free
    flyTo(id, o = {}) {
      const i = at.get(id);
      if (i === undefined) return;
      const turn = Math.PI / 2 - Math.atan2(Z[i], X[i]) - cam.rotY, tilt = -0.18;
      tg.rotY = cam.rotY + Math.atan2(Math.sin(turn), Math.cos(turn)); // the nearer way round
      tg.tilt = tilt; tg.zoom = Math.max(cam.zoom, 1.5);
      tg.panY = Y[i] + Math.hypot(X[i], Z[i]) * Math.tan(tilt);
      tg.offX = -(o.right || 0) / 2; tg.offY = ((o.top || 0) - (o.bottom || 0)) / 2;
      kick();
    },
    resize,
    pause() { paused = true; if (raf) cancelAnimationFrame(raf); raf = 0; last = 0; hover = -1; tip.style.display = 'none'; },
    resume() { paused = false; resize(); kick(); },
    spin(on) { spinOn = !!on; kick(); },
  };
}
