/*! Driver's Collection — 3D card showcase (dc3d.js)
 * Usage: <div data-dc3d data-order-url="https://..."></div>
 *        <script src="https://coretagishi-lab.github.io/dc-cards/dc3d.js" defer></script>
 * Cards and their order come from cards.json next to this file.
 */
(function () {
  'use strict';
  if (window.DC3D) return;

  var SCRIPT = document.currentScript;
  var ROOT = (SCRIPT && SCRIPT.src) ? SCRIPT.src.replace(/[^/]*(\?.*)?$/, '') : 'https://coretagishi-lab.github.io/dc-cards/';
  var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- feel (tuned in the prototype) ----
  var K = 70, C = 8;                 // return spring (under-damped = overshoot)
  var HOLD = 2.0;                    // s the card stays where you let go
  var DPX = 0.9, DPY = 0.45;         // deg per px (horizontal / vertical)
  var FOLLOW = 0.045;                // s the card trails the finger
  var FRY = 2.1, FRX = 3.2;          // glide friction after a flick
  var XLIM = 40;                     // soft limit for vertical tilt

  var CSS = [
    '.dc3d{--gold:#c9a24a;--gold-hi:#ebd28f;--text:#ede6d6;--muted:#8e8676;position:relative;color:var(--text);text-align:center;padding:4px 0 8px;-webkit-tap-highlight-color:transparent}',
    '.dc3d *{box-sizing:border-box}',
    '.dc3d-row{display:flex;align-items:center;justify-content:center;gap:clamp(6px,2.5vw,22px)}',
    '.dc3d-slot{position:relative;display:grid;place-items:center}',
    '.dc3d-stage{position:relative;display:grid;place-items:center;padding:16px 0 34px;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;outline:none}',
    '.dc3d-slot .dc3d-stage{--w:min(56vw,280px);touch-action:pan-y;cursor:pointer}',
    '.dc3d-stage::before{content:"";position:absolute;inset:0 -30% 12%;background:radial-gradient(closest-side,rgba(201,162,74,.18),rgba(201,162,74,0) 70%);pointer-events:none}',
    '.dc3d-stage:focus-visible .dc3d-fly{outline:2px solid var(--gold-hi);outline-offset:6px;border-radius:14px}',
    '.dc3d-fly{position:relative;perspective:1100px;will-change:transform,opacity}',
    '.dc3d-card{--r:12px;--t:3px;--h:calc(var(--w) * 1.3967);position:relative;width:var(--w);aspect-ratio:900/1257;transform-style:preserve-3d;will-change:transform}',
    '.dc3d-face{position:absolute;inset:0;border-radius:var(--r);overflow:hidden;background:#000;-webkit-backface-visibility:hidden;backface-visibility:hidden;box-shadow:0 0 0 1px rgba(235,210,143,.18)}',
    '.dc3d-face--front{transform:translateZ(calc(var(--t) / 2))}',
    '.dc3d-face--back{transform:rotateY(180deg) translateZ(calc(var(--t) / 2))}',
    '.dc3d-card[data-side="back"] .dc3d-face--front,.dc3d-card[data-side="front"] .dc3d-face--back{visibility:hidden}',
    '.dc3d-face img{display:block;width:100%;height:100%;object-fit:cover;pointer-events:none;-webkit-user-drag:none}',
    '.dc3d-l{position:absolute;inset:0;pointer-events:none;-webkit-mask-size:100% 100%;mask-size:100% 100%}',
    '.dc3d-holo{background-image:repeating-linear-gradient(115deg,#ff5f7e 0%,#ffc85a 6%,#9fe8c8 12%,#5ab8ff 18%,#b07cff 24%,#ff5f7e 30%);background-size:300% 300%;background-position:var(--hx,50%) var(--hy,50%);mix-blend-mode:color-dodge;opacity:var(--hs,.3);filter:brightness(.45) contrast(1.5) saturate(1.15)}',
    '.dc3d-face--front .dc3d-holo,.dc3d-face--front .dc3d-shine{-webkit-mask-image:var(--m-silver);mask-image:var(--m-silver)}',
    '.dc3d-face--back .dc3d-holo{-webkit-mask-image:var(--m-back);mask-image:var(--m-back)}',
    '.dc3d-gold{background:linear-gradient(118deg,rgba(92,58,12,.9) 0%,rgba(140,92,24,.75) 28%,rgba(255,206,120,.95) 44%,rgba(255,232,178,1) 50%,rgba(255,206,120,.95) 56%,rgba(140,92,24,.75) 72%,rgba(92,58,12,.9) 100%);background-size:260% 260%;background-position:var(--fx,50%) var(--fy,50%);mix-blend-mode:overlay;opacity:var(--fs,.6);-webkit-mask-image:var(--m-gold);mask-image:var(--m-gold)}',
    '.dc3d-gold2{background:linear-gradient(118deg,rgba(255,226,150,0) 38%,rgba(255,226,150,.38) 50%,rgba(255,226,150,0) 62%);background-size:240% 240%;background-position:var(--fx,50%) var(--fy,50%);mix-blend-mode:screen;opacity:var(--fs2,.3);-webkit-mask-image:var(--m-gold);mask-image:var(--m-gold)}',
    '.dc3d-card.no-gold .dc3d-gold,.dc3d-card.no-gold .dc3d-gold2{display:none}',
    '.dc3d-glare{background:radial-gradient(farthest-corner circle at var(--gx,50%) var(--gy,50%),rgba(255,255,255,.55) 0%,rgba(255,255,255,.12) 28%,rgba(0,0,0,.3) 95%);mix-blend-mode:overlay}',
    '.dc3d-shine{background:linear-gradient(115deg,rgba(255,255,255,0) 40%,rgba(255,255,255,.32) 50%,rgba(255,255,255,0) 60%);background-size:260% 100%;background-position:var(--sx,50%) 0;mix-blend-mode:screen;opacity:.8}',
    '.dc3d-face--back .dc3d-shine{opacity:.55}',
    '.dc3d-edge{position:absolute;background:linear-gradient(180deg,#6f5520,#d9b865 45%,#8a6a28)}',
    '.dc3d-edge--l,.dc3d-edge--r{top:var(--r);bottom:var(--r);width:var(--t);left:calc(50% - var(--t) / 2)}',
    '.dc3d-edge--r{transform:rotateY(90deg) translateZ(calc(var(--w) / 2))}',
    '.dc3d-edge--l{transform:rotateY(-90deg) translateZ(calc(var(--w) / 2))}',
    '.dc3d-edge--t,.dc3d-edge--b{left:var(--r);right:var(--r);height:var(--t);top:calc(50% - var(--t) / 2);background:linear-gradient(90deg,#6f5520,#d9b865 45%,#8a6a28)}',
    '.dc3d-edge--t{transform:rotateX(90deg) translateZ(calc(var(--h) / 2))}',
    '.dc3d-edge--b{transform:rotateX(-90deg) translateZ(calc(var(--h) / 2))}',
    '.dc3d-floor{position:absolute;bottom:14px;left:50%;width:calc(var(--w) * .8);height:24px;margin-left:calc(var(--w) * -.4);border-radius:50%;background:radial-gradient(closest-side,rgba(235,210,143,.28),rgba(235,210,143,0));filter:blur(6px);pointer-events:none}',
    '.dc3d-arrow{flex:none;appearance:none;width:44px;height:44px;padding:0;border-radius:50%;border:1px solid rgba(201,162,74,.6);background:rgba(10,9,8,.6);color:var(--gold-hi);display:grid;place-items:center;cursor:pointer;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);transition:transform .15s ease,background-color .2s ease;touch-action:manipulation}',
    '.dc3d-arrow:hover{background:rgba(201,162,74,.16)}',
    '.dc3d-arrow:active{transform:scale(.9)}',
    '.dc3d-arrow:focus-visible,.dc3d-close:focus-visible,.dc3d-order:focus-visible{outline:2px solid var(--gold-hi);outline-offset:2px}',
    '.dc3d-arrow svg,.dc3d-close svg{width:18px;height:18px;display:block}',
    '.dc3d-meta{margin-top:2px;display:flex;flex-direction:column;align-items:center;gap:8px}',
    '.dc3d-name{font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold-hi);margin:0}',
    '.dc3d-dots{display:flex;gap:6px;justify-content:center}',
    '.dc3d-dots i{width:6px;height:6px;border-radius:50%;background:rgba(201,162,74,.28);transition:background-color .25s,transform .25s}',
    '.dc3d-dots i.on{background:var(--gold);transform:scale(1.25)}',
    '.dc3d-count{font-size:11px;letter-spacing:.2em;color:var(--muted);font-variant-numeric:tabular-nums}',
    '.dc3d-cta{appearance:none;margin:12px auto 0;display:inline-flex;align-items:center;gap:8px;padding:9px 18px;border-radius:999px;border:1px solid rgba(201,162,74,.5);background:rgba(201,162,74,.08);color:var(--text);font:inherit;font-size:13px;letter-spacing:.06em;cursor:pointer;animation:dc3dPulse 2.4s ease-in-out infinite}',
    '.dc3d-cta svg{width:16px;height:16px;color:var(--gold-hi)}',
    '@keyframes dc3dPulse{0%,100%{box-shadow:0 0 0 0 rgba(201,162,74,0)}50%{box-shadow:0 0 0 6px rgba(201,162,74,.12)}}',
    '.dc3d-modal{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;touch-action:none;color:#ede6d6;-webkit-tap-highlight-color:transparent;--gold:#c9a24a;--gold-hi:#ebd28f;--muted:#8e8676}',
    '.dc3d-modal[hidden]{display:none}',
    '.dc3d-backdrop{position:absolute;inset:0;background:rgba(6,6,8,.9);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);opacity:0;transition:opacity .32s ease}',
    '.dc3d-modal.is-open .dc3d-backdrop{opacity:1}',
    '.dc3d-close{position:absolute;top:max(12px,env(safe-area-inset-top));right:12px;z-index:3;appearance:none;width:44px;height:44px;padding:0;border-radius:50%;border:1px solid rgba(235,210,143,.35);background:rgba(10,9,8,.6);color:#ede6d6;display:grid;place-items:center;cursor:pointer;opacity:0;transition:opacity .3s ease}',
    '.dc3d-modal.is-open .dc3d-close{opacity:1}',
    '.dc3d-mrow{position:relative;z-index:2;width:100%;display:grid;place-items:center}',
    '.dc3d-mslot{display:grid;place-items:center}',
    '.dc3d-mslot .dc3d-stage{--w:min(74vw,400px,max(200px,calc((100vh - 250px) * .716)));cursor:grab;touch-action:none;padding:10px 0 30px}',
    '@supports (height:100svh){.dc3d-mslot .dc3d-stage{--w:min(74vw,400px,max(200px,calc((100svh - 250px) * .716)))}}',
    '.dc3d-modal .dc3d-arrow{position:absolute;top:calc(50% - 10px);transform:translateY(-50%);width:40px;height:40px;opacity:0;transition:opacity .3s ease,background-color .2s ease}',
    '.dc3d-modal .dc3d-arrow:active{transform:translateY(-50%) scale(.9)}',
    '.dc3d-modal.is-open .dc3d-arrow{opacity:1}',
    '.dc3d-modal .dc3d-prev{left:max(6px,calc(50% - var(--mw,400px) / 2 - 56px))}',
    '.dc3d-modal .dc3d-next{right:max(6px,calc(50% - var(--mw,400px) / 2 - 56px))}',
    '.dc3d-mfoot{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:8px;padding:0 16px max(16px,env(safe-area-inset-bottom));opacity:0;transform:translateY(10px);transition:opacity .35s ease .1s,transform .35s ease .1s}',
    '.dc3d-modal.is-open .dc3d-mfoot{opacity:1;transform:none}',
    '.dc3d-hint{margin:0;font-size:12px;color:#ede6d6;opacity:.7;transition:opacity .5s ease}',
    '.dc3d-hint.is-hidden{opacity:0}',
    '.dc3d-order{display:inline-flex;align-items:center;justify-content:center;gap:8px;margin-top:4px;padding:13px 26px;border-radius:999px;background:linear-gradient(180deg,#e4c36f,#b58c34);color:#141008;font-size:14px;font-weight:700;letter-spacing:.06em;text-decoration:none;white-space:nowrap;box-shadow:0 6px 24px rgba(201,162,74,.28)}',
    '.dc3d-order:active{transform:translateY(1px)}',
    '@media (prefers-reduced-motion:reduce){.dc3d-cta{animation:none}}'
  ].join('\n');

  var ICON = {
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    hand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-.6a6 6 0 0 1-4.9-2.5L4.3 15.4a1.5 1.5 0 0 1 2.3-1.9L9 16"/></svg>'
  };

  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var ease = function (a) { return a * a * (3 - 2 * a); };
  var now = function () { return performance.now(); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  function track(name) { try { if (typeof window.clarity === 'function') window.clarity('event', name); } catch (_) {} }
  function abs(p) { return /^https?:/.test(p) ? p : ROOT + p.replace(/^\//, ''); }
  function cssUrl(p) { return p ? 'url("' + abs(p) + '")' : 'none'; }
  function loadImg(src) {
    return new Promise(function (res) {
      var im = new Image();
      im.decoding = 'async';
      im.onload = function () { (im.decode ? im.decode() : Promise.resolve()).then(res, res); };
      im.onerror = res;
      im.src = src;
    });
  }

  function idle(t) {
    return {
      x: 7 * Math.sin(t * 0.83 + 0.5) + 3.5 * Math.sin(t * 1.91 + 2.1),
      y: 15 * Math.sin(t * 0.61) + 6 * Math.sin(t * 1.37 + 1.2),
      z: 1.6 * Math.sin(t * 0.47 + 0.8),
      t: -6 * Math.sin(t * 0.9 + 0.3)
    };
  }
  function spring(pos, vel, target, dt) {
    vel += (K * (target - pos) - C * vel) * dt;
    return [pos + vel * dt, vel];
  }

  var cssDone = false;
  function injectCSS() {
    if (cssDone) return;
    cssDone = true;
    var s = document.createElement('style');
    s.id = 'dc3d-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function cardHTML() {
    var layers = '<div class="dc3d-l dc3d-holo"></div><div class="dc3d-l dc3d-gold"></div><div class="dc3d-l dc3d-gold2"></div><div class="dc3d-l dc3d-glare"></div><div class="dc3d-l dc3d-shine"></div>';
    return '<div class="dc3d-fly"><div class="dc3d-card" data-side="front">' +
      '<div class="dc3d-face dc3d-face--front"><img alt="" draggable="false">' + layers + '</div>' +
      '<div class="dc3d-face dc3d-face--back"><img alt="Driver\'s Collection のカード裏面" draggable="false"><div class="dc3d-l dc3d-holo"></div><div class="dc3d-l dc3d-glare"></div><div class="dc3d-l dc3d-shine"></div></div>' +
      '<div class="dc3d-edge dc3d-edge--l"></div><div class="dc3d-edge dc3d-edge--r"></div><div class="dc3d-edge dc3d-edge--t"></div><div class="dc3d-edge dc3d-edge--b"></div>' +
      '</div></div><div class="dc3d-floor"></div>';
  }

  function mount(root, opts) {
    if (!root || root.__dc3d) return root && root.__dc3d;
    opts = opts || {};
    injectCSS();
    var api = { root: root };
    root.__dc3d = api;
    root.setAttribute('data-dc3d-mounted', '');

    var listUrl = abs(opts.list || root.getAttribute('data-list') || 'cards.json');
    var data = null, cards = [], idx = 0, isOpen = false, animating = false;

    // ---------- DOM ----------
    root.innerHTML =
      '<div class="dc3d" role="region" aria-roledescription="carousel" aria-label="カードギャラリー">' +
        '<div class="dc3d-row">' +
          '<button class="dc3d-arrow dc3d-prev" type="button" aria-label="前のカード">' + ICON.prev + '</button>' +
          '<div class="dc3d-slot"><div class="dc3d-stage" tabindex="0" role="button" aria-label="カードを手に取って回す">' + cardHTML() + '</div></div>' +
          '<button class="dc3d-arrow dc3d-next" type="button" aria-label="次のカード">' + ICON.next + '</button>' +
        '</div>' +
        '<div class="dc3d-meta"><p class="dc3d-name" aria-live="polite"></p><div class="dc3d-dots" aria-hidden="true"></div><span class="dc3d-count"></span></div>' +
        '<button class="dc3d-cta" type="button">' + ICON.hand + 'タップして手に取る</button>' +
      '</div>';

    var modal = document.createElement('div');
    modal.className = 'dc3d-modal';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'カードを回して見る');
    modal.innerHTML =
      '<div class="dc3d-backdrop"></div>' +
      '<button class="dc3d-close" type="button" aria-label="閉じる">' + ICON.close + '</button>' +
      '<div class="dc3d-mrow"><div class="dc3d-mslot"></div>' +
        '<button class="dc3d-arrow dc3d-prev" type="button" aria-label="前のカード">' + ICON.prev + '</button>' +
        '<button class="dc3d-arrow dc3d-next" type="button" aria-label="次のカード">' + ICON.next + '</button>' +
      '</div>' +
      '<div class="dc3d-mfoot"><p class="dc3d-name"></p><span class="dc3d-count"></span>' +
        '<p class="dc3d-hint">← ドラッグで回転・裏面も見られます →</p>' +
        '<a class="dc3d-order" href="#">このデザインでオーダーする</a></div>';
    document.body.appendChild(modal);

    var q = function (sel, el) { return (el || root).querySelector(sel); };
    var slot = q('.dc3d-slot'), stage = q('.dc3d-stage'), fly = q('.dc3d-fly'), card = q('.dc3d-card'), floor = q('.dc3d-floor');
    var mslot = q('.dc3d-mslot', modal), mrow = q('.dc3d-mrow', modal), hint = q('.dc3d-hint', modal), order = q('.dc3d-order', modal);
    var frontImg = q('.dc3d-face--front img'), backImg = q('.dc3d-face--back img');
    var names = [q('.dc3d-name'), q('.dc3d-name', modal)];
    var counts = [q('.dc3d-count'), q('.dc3d-count', modal)];
    var dots = q('.dc3d-dots');

    // ---------- physics ----------
    var st = { ox: 0, oy: 0, oz: 0, ot: 0, vx: 0, vy: 0, vz: 0, vt: 0, fx: 0, fy: 0, targetY: 0,
      holdUntil: -1, pending: false, w: REDUCE ? 0 : 1, dragging: false, lean: 0, samples: [],
      lastX: 0, lastY: 0, lastMove: 0, released: -1 };
    var t0 = now(), prev = t0, running = false, visible = false;

    function lighting(rx, ry) {
      var n = ((ry % 360) + 540) % 360 - 180;
      var front = Math.abs(n) <= 90;
      var side = front ? 'front' : 'back';
      if (card.dataset.side !== side) card.dataset.side = side;
      var ly = front ? n : (n > 0 ? n - 180 : n + 180), lx = rx, s = card.style;
      var mag = Math.min(1, (Math.abs(ly) + Math.abs(lx)) / 28);
      s.setProperty('--gx', clamp(50 + ly * 1.8, -10, 110).toFixed(1) + '%');
      s.setProperty('--gy', clamp(50 - lx * 2.4, -10, 110).toFixed(1) + '%');
      s.setProperty('--hx', (50 + ly * 2.2).toFixed(1) + '%');
      s.setProperty('--hy', (50 + lx * 2.2).toFixed(1) + '%');
      s.setProperty('--sx', (50 - ly * 2.4).toFixed(1) + '%');
      s.setProperty('--hs', (0.16 + 0.5 * mag).toFixed(3));
      s.setProperty('--fx', (50 - ly * 1.5 + lx * 0.6).toFixed(1) + '%');
      s.setProperty('--fy', (50 + lx * 1.5).toFixed(1) + '%');
      s.setProperty('--fs', (0.45 + 0.45 * mag).toFixed(3));
      s.setProperty('--fs2', (0.15 + 0.55 * mag).toFixed(3));
      floor.style.transform = 'translateX(' + (ly * 0.8).toFixed(1) + 'px) scaleX(' + (0.55 + 0.45 * Math.abs(Math.cos(n * Math.PI / 180))).toFixed(3) + ')';
    }

    function frame(ts) {
      if (!(isOpen || visible)) { running = false; return; }
      var dt = Math.min((ts - prev) / 1000, 1 / 30);
      prev = ts;
      var t = (ts - t0) / 1000;

      if (st.dragging) st.w = 0;
      else if (!REDUCE) { if (st.released < 0 || t > st.holdUntil + 0.35) st.w = Math.min(1, st.w + dt / 1.4); }

      var r;
      if (st.dragging) {
        var a = 1 - Math.exp(-dt / FOLLOW), py = st.oy;
        st.oy += (st.fy - st.oy) * a;
        st.ox += (st.fx - st.ox) * a;
        st.vy = (st.oy - py) / Math.max(dt, 1e-3);
      } else {
        if (t < st.holdUntil) {
          st.oy += st.vy * dt; st.vy *= Math.exp(-dt * FRY);
          st.ox += st.vx * dt; st.vx *= Math.exp(-dt * FRX);
          var over = Math.abs(st.ox) - XLIM;
          if (over > 0) st.vx -= Math.sign(st.ox) * over * 90 * dt;
        } else {
          if (st.pending) { st.targetY = Math.round(st.oy / 360) * 360; st.pending = false; }
          r = spring(st.oy, st.vy, st.targetY, dt); st.oy = r[0]; st.vy = r[1];
          r = spring(st.ox, st.vx, 0, dt); st.ox = r[0]; st.vx = r[1];
        }
        r = spring(st.oz, st.vz, 0, dt); st.oz = r[0]; st.vz = r[1];
        r = spring(st.ot, st.vt, 0, dt); st.ot = r[0]; st.vt = r[1];
        if (!st.pending && st.targetY !== 0 && Math.abs(st.oy - st.targetY) < 0.05 && Math.abs(st.vy) < 0.05) {
          st.oy -= st.targetY; st.targetY = 0;
        }
      }

      st.lean += (clamp(-st.vy * 0.0045, -3.2, 3.2) - st.lean) * (1 - Math.exp(-dt / 0.12));
      var we = ease(st.w), id = idle(t);
      var rx = st.ox + we * id.x, ry = st.oy + we * id.y, rz = st.oz + we * id.z, ty = st.ot + we * id.t;
      card.style.transform = 'translateY(' + ty.toFixed(2) + 'px) rotateZ(' + st.lean.toFixed(2) + 'deg) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) rotateZ(' + rz.toFixed(2) + 'deg)';
      lighting(rx, ry);
      requestAnimationFrame(frame);
    }
    function run() {
      if (running || !(isOpen || visible)) return;
      running = true;
      prev = now();
      requestAnimationFrame(frame);
    }

    function beginDrag(x, y) {
      var id = idle((now() - t0) / 1000), we = ease(st.w);
      st.ox += we * id.x; st.oy += we * id.y; st.oz += we * id.z; st.ot += we * id.t;
      st.w = 0; st.vx = st.vy = st.vz = st.vt = 0;
      st.fx = st.ox; st.fy = st.oy;
      st.samples = [{ t: now(), x: st.fx, y: st.fy }];
      st.holdUntil = -1; st.pending = false; st.dragging = true;
      st.lastX = x; st.lastY = y; st.lastMove = now();
    }
    function moveDrag(x, y) {
      if (!st.dragging) return;
      var tn = now(), dx = x - st.lastX, dy = y - st.lastY;
      st.fy += dx * DPX;
      var nx = st.fx - dy * DPY;
      st.fx = (Math.abs(nx) > XLIM && Math.abs(nx) > Math.abs(st.fx)) ? st.fx + (nx - st.fx) * 0.3 : nx;
      st.samples.push({ t: tn, x: st.fx, y: st.fy });
      while (st.samples.length > 2 && tn - st.samples[0].t > 110) st.samples.shift();
      st.lastX = x; st.lastY = y; st.lastMove = tn;
    }
    function endDrag() {
      if (!st.dragging) return;
      st.dragging = false;
      var tn = now(), vx = 0, vy = 0;
      if (tn - st.lastMove < 70 && st.samples.length > 1) {
        var a = st.samples[0], b = st.samples[st.samples.length - 1], span = Math.max(16, b.t - a.t) / 1000;
        vy = (b.y - a.y) / span; vx = (b.x - a.x) / span;
      }
      st.vy = clamp(vy, -1100, 1100); st.vx = clamp(vx, -180, 180);
      st.released = (tn - t0) / 1000;
      st.holdUntil = st.released + HOLD;
      st.pending = true;
    }
    // a quick "ドゥルン" from an offset, no hold
    function kick(dy, dx) {
      var id = idle((now() - t0) / 1000), we = ease(st.w);
      st.ox += we * id.x; st.oy += we * id.y; st.oz += we * id.z; st.ot += we * id.t;
      st.w = 0; st.released = (now() - t0) / 1000; st.holdUntil = st.released - 0.2;
      st.oy = ((st.oy % 360) + 360) % 360; if (st.oy > 180) st.oy -= 360;
      st.oy += dy || 0; st.ox += dx || 0;
      st.vx = st.vy = 0; st.targetY = 0; st.pending = false;
    }

    // ---------- cards ----------
    function paint(i) {
      var c = cards[i];
      frontImg.src = abs(c.front);
      frontImg.alt = c.name + ' のカード表面';
      card.style.setProperty('--m-silver', cssUrl(c.silver));
      card.style.setProperty('--m-gold', cssUrl(c.gold));
      card.classList.toggle('no-gold', !c.gold);
      names.forEach(function (el) { el.textContent = c.name; });
      var label = String(i + 1).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0');
      counts.forEach(function (el) { el.textContent = label; });
      Array.prototype.forEach.call(dots.children, function (d, k) { d.classList.toggle('on', k === i); });
      order.href = c.orderUrl || root.getAttribute('data-order-url') || data.orderUrl || '#';
      idx = i;
    }
    function preloadAround(i) {
      [1, -1].forEach(function (d) {
        var c = cards[(i + d + cards.length) % cards.length];
        loadImg(abs(c.front));
        if (c.silver) loadImg(abs(c.silver));
        if (c.gold) loadImg(abs(c.gold));
      });
    }

    function go(dir) {
      if (animating || st.dragging || cards.length < 2) return;
      animating = true;
      track(dir > 0 ? 'dc3d_next' : 'dc3d_prev');
      var next = (idx + dir + cards.length) % cards.length;
      var ready = loadImg(abs(cards[next].front));
      var dist = isOpen ? 38 : 30;
      fly.style.transition = 'transform .2s ease-in, opacity .2s ease-in';
      fly.style.transform = 'translateX(' + (-dir * dist) + '%) scale(.92)';
      fly.style.opacity = '0';
      Promise.all([wait(200), ready]).then(function () {
        paint(next);
        kick(dir * 70, -6);
        fly.style.transition = 'none';
        fly.style.transform = 'translateX(' + (dir * dist) + '%) scale(.92)';
        void fly.offsetWidth;
        fly.style.transition = 'transform .38s cubic-bezier(.2,.8,.2,1), opacity .26s ease-out';
        fly.style.transform = '';
        fly.style.opacity = '';
        setTimeout(function () { fly.style.transition = ''; animating = false; }, 400);
        preloadAround(next);
      });
    }

    // ---------- open / close ----------
    var lastFocus = null, rel = null, rotatedThisOpen = false;
    function lockScroll(on) {
      var de = document.documentElement, b = document.body;
      if (on) {
        var sw = window.innerWidth - de.clientWidth;
        de.style.overflow = 'hidden'; b.style.overflow = 'hidden';
        if (sw > 0) b.style.paddingRight = sw + 'px';
      } else {
        de.style.overflow = ''; b.style.overflow = ''; b.style.paddingRight = '';
      }
    }
    function flip(fromRect) {
      var to = fly.getBoundingClientRect();
      var dx = (fromRect.left + fromRect.width / 2) - (to.left + to.width / 2);
      var dy = (fromRect.top + fromRect.height / 2) - (to.top + to.height / 2);
      var s = fromRect.width / to.width;
      fly.style.transition = 'none';
      fly.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')';
      void fly.offsetWidth;
    }
    function open() {
      if (isOpen || animating || !cards.length) return;
      animating = true; isOpen = true; rotatedThisOpen = false;
      track('dc3d_open');
      lastFocus = document.activeElement;
      var from = fly.getBoundingClientRect(), sr = slot.getBoundingClientRect();
      rel = { x: from.left - sr.left, y: from.top - sr.top, w: from.width, h: from.height };
      slot.style.width = sr.width + 'px'; slot.style.height = sr.height + 'px';
      modal.hidden = false;
      mslot.appendChild(stage);
      modal.style.setProperty('--mw', fly.getBoundingClientRect().width + 'px');
      lockScroll(true);
      flip(from);
      hint.classList.remove('is-hidden');
      requestAnimationFrame(function () {
        modal.classList.add('is-open');
        fly.style.transition = 'transform .5s cubic-bezier(.2,.8,.2,1)';
        fly.style.transform = '';
        kick(0, -14);
      });
      run();
      setTimeout(function () {
        fly.style.transition = ''; animating = false;
        var cb = q('.dc3d-close', modal); if (cb) cb.focus({ preventScroll: true });
      }, 520);
    }
    function close() {
      if (!isOpen || animating) return;
      animating = true;
      endDrag();
      var sr = slot.getBoundingClientRect(), cur = fly.getBoundingClientRect();
      var target = { left: sr.left + rel.x, top: sr.top + rel.y, width: rel.w, height: rel.h };
      var dx = (target.left + target.width / 2) - (cur.left + cur.width / 2);
      var dy = (target.top + target.height / 2) - (cur.top + cur.height / 2);
      fly.style.transition = 'transform .42s cubic-bezier(.4,0,.2,1)';
      fly.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + (target.width / cur.width) + ')';
      modal.classList.remove('is-open');
      setTimeout(function () {
        slot.appendChild(stage);
        fly.style.transition = 'none'; fly.style.transform = '';
        void fly.offsetWidth; fly.style.transition = '';
        slot.style.width = ''; slot.style.height = '';
        modal.hidden = true; isOpen = false; animating = false;
        lockScroll(false);
        if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
        run();
      }, 430);
    }

    // ---------- gestures ----------
    // inline: tap = open, horizontal swipe = next/prev, vertical = page scroll
    var ig = null;
    stage.addEventListener('pointerdown', function (e) {
      if (isOpen || (e.pointerType === 'mouse' && e.button !== 0)) return;
      ig = { id: e.pointerId, x: e.clientX, y: e.clientY, t: now() };
    });
    stage.addEventListener('pointerup', function (e) {
      if (isOpen || !ig || e.pointerId !== ig.id) return;
      var dx = e.clientX - ig.x, dy = e.clientY - ig.y, dt = now() - ig.t;
      ig = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) go(dx < 0 ? 1 : -1);
      else if (Math.hypot(dx, dy) < 10 && dt < 700) open();
    });
    stage.addEventListener('pointercancel', function () { ig = null; });
    stage.addEventListener('keydown', function (e) {
      if (isOpen) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    });
    stage.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    // open: drag anywhere to rotate; tap outside the card (not on the footer) = close
    var mg = null;
    function onCard(x, y) {
      var r = card.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    }
    modal.addEventListener('pointerdown', function (e) {
      if (!isOpen || animating || e.target.closest('button, a') || (e.pointerType === 'mouse' && e.button !== 0)) return;
      mg = { id: e.pointerId, x: e.clientX, y: e.clientY, t: now(), rot: false,
        safe: onCard(e.clientX, e.clientY) || !!e.target.closest('.dc3d-mfoot') };
      try { modal.setPointerCapture(e.pointerId); } catch (_) {}
    });
    modal.addEventListener('pointermove', function (e) {
      if (!mg || e.pointerId !== mg.id) return;
      if (!mg.rot && Math.hypot(e.clientX - mg.x, e.clientY - mg.y) > 6) {
        mg.rot = true;
        beginDrag(mg.x, mg.y);
        hint.classList.add('is-hidden');
        if (!rotatedThisOpen) { rotatedThisOpen = true; track('dc3d_rotate'); }
      }
      if (mg.rot) moveDrag(e.clientX, e.clientY);
    });
    function modalUp(e) {
      if (!mg || e.pointerId !== mg.id) return;
      var g = mg; mg = null;
      if (g.rot) endDrag();
      else if (e.type === 'pointerup' && !g.safe && now() - g.t < 700) close();
    }
    modal.addEventListener('pointerup', modalUp);
    modal.addEventListener('pointercancel', modalUp);
    modal.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    q('.dc3d-close', modal).addEventListener('click', close);
    order.addEventListener('click', function () { track('dc3d_order'); });
    document.addEventListener('keydown', function (e) {
      if (!isOpen) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    });

    [root, modal].forEach(function (scope) {
      q('.dc3d-prev', scope).addEventListener('click', function () { go(-1); });
      q('.dc3d-next', scope).addEventListener('click', function () { go(1); });
    });
    q('.dc3d-cta').addEventListener('click', open);

    // ---------- start: load the list when the section gets near the screen ----------
    var started = false;
    function start() {
      if (started) return;
      started = true;
      fetch(listUrl, { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (json) {
        data = json;
        cards = (json.cards || []).filter(function (c) { return !c.hidden; }).map(function (c) {
          var base = 'cards/' + c.slug + '/';
          return { slug: c.slug, name: c.name, orderUrl: c.orderUrl,
            front: c.front || base + 'front.webp',
            silver: c.silver === false ? null : (c.silver || base + 'silver.webp'),
            gold: c.gold === false ? null : (c.gold || base + 'gold.webp') };
        });
        if (!cards.length) { root.style.display = 'none'; return; }
        var back = json.back || {};
        backImg.src = abs(back.image || 'back/back.webp');
        card.style.setProperty('--m-back', cssUrl(back.silver));
        dots.innerHTML = cards.length <= 12 ? cards.map(function () { return '<i></i>'; }).join('') : '';
        if (cards.length < 2) root.querySelectorAll('.dc3d-arrow').forEach(function (b) { b.hidden = true; });
        paint(0);
        preloadAround(0);
        run();
      }).catch(function (err) {
        console.warn('[dc3d] could not load card list', err);
        root.style.display = 'none';
      });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) start();
          visible = en.isIntersecting;
          run();
        });
      }, { rootMargin: '400px 0px' }).observe(root);
    } else { visible = true; start(); }

    api.open = open; api.close = close; api.go = go;
    return api;
  }

  function autoMount() {
    var els = document.querySelectorAll('[data-dc3d]:not([data-dc3d-mounted])');
    for (var i = 0; i < els.length; i++) mount(els[i]);
  }
  window.DC3D = { mount: mount, version: '1.0.0' };

  function boot() {
    autoMount();
    // the BASE page inserts the LP after load, so keep looking for a while
    if ('MutationObserver' in window) {
      var mo = new MutationObserver(autoMount);
      mo.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(function () { mo.disconnect(); }, 20000);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
