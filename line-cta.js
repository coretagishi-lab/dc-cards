/*! Driver's Collection — "free rough design via LINE" calls to action (line-cta.js)
 * One file for every rough-request button on the shop:
 *   top page    : block after the 3D gallery, slim block before the product list, sticky bar (phones)
 *   item pages  : block under the purchase button (semi = free rough / full = consultation), sticky bar
 *   3D gallery  : dc3d.js calls window.DCRough.open(message, place) from its enlarged view
 * Loaded automatically by dc3d.js (top page) and item.js (item pages); no BASE edit needed.
 * The LINE friend-add URL comes from DEFAULT_LINE_URL below, or data-line-url on any <script> tag.
 * Clarity events: dc_rough_<place>
 */
(function () {
  'use strict';
  if (window.DCRough) return;

  var DEFAULT_LINE_URL = 'https://lin.ee/SNMlSnr';   // LINE公式アカウントの友だち追加URL
  var IG_DM_URL = 'https://ig.me/m/drivers_collection_'; // English visitors: Instagram DM

  // JP / EN (same rule as site.js)
  function dcLang() {
    try {
      var q = /[?&]lang=(en|ja)\b/.exec(location.search);
      if (q) return q[1];
      var s = localStorage.getItem('dc_lang');
      if (s === 'en' || s === 'ja') return s;
    } catch (_) {}
    return /^ja\b/i.test(navigator.language || 'ja') ? 'ja' : 'en';
  }
  var EN = dcLang() === 'en';

  function lineUrl() {
    var s = document.querySelector('script[data-line-url]');
    var v = s && s.getAttribute('data-line-url');
    if (v && /^https?:\/\//.test(v)) return v;
    if (DEFAULT_LINE_URL) return DEFAULT_LINE_URL;
    var a = document.querySelector('a[href*="lin.ee"],a[href*="line.me/R/ti"]');
    return a ? a.href : '';
  }
  function slots() {
    var s = document.querySelector('script[data-slots]');
    return s ? s.getAttribute('data-slots') : '';
  }

  var CSS = [
    '.dcR{--gold:#c9a24a;--gold-hi:#ebd28f;--text:#ede6d6;--muted:#958c7a;box-sizing:border-box;max-width:560px;margin:30px auto;padding:0 16px;color:var(--text);text-align:center;font-family:inherit}',
    '.dcR *{box-sizing:border-box}',
    '.dcR-box{position:relative;padding:28px 20px 24px;border:1px solid rgba(201,162,74,.42);border-radius:14px;background:radial-gradient(120% 90% at 50% 0%,rgba(201,162,74,.13),rgba(12,11,10,.94) 62%);box-shadow:0 18px 50px rgba(0,0,0,.5)}',
    '.dcR-badge{display:inline-block;margin:0 0 12px;padding:3px 12px;border-radius:999px;border:1px solid rgba(235,210,143,.55);color:var(--gold-hi);font-size:11px;letter-spacing:.14em}',
    '.dcR-eyebrow{margin:0 0 8px;font-size:11px;letter-spacing:.34em;color:var(--gold)}',
    '.dcR-h{margin:0 0 10px;font-size:19px;line-height:1.55;font-weight:600;letter-spacing:.05em;color:#f3e7c4;word-break:keep-all;overflow-wrap:anywhere}',
    '.dcR-p{margin:0 0 18px;font-size:13.5px;line-height:1.9;color:#c2baa8;word-break:keep-all;overflow-wrap:anywhere}',
    '.dcR-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:0 0 20px;padding:0;list-style:none}',
    '.dcR-steps li{padding:10px 4px 9px;border-radius:8px;border:1px solid rgba(201,162,74,.2);background:rgba(255,255,255,.03);font-size:11.5px;line-height:1.5;color:#dcd3bd}',
    '.dcR-steps b{display:block;margin-bottom:3px;font-size:10px;font-weight:500;letter-spacing:.14em;color:var(--gold-hi)}',
    '.dcR-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;max-width:360px;margin:0 auto;padding:16px 18px;border-radius:999px;border:none;background:linear-gradient(180deg,#e8ca7b,#b68d35);color:#15110a!important;font-size:15px;font-weight:700;letter-spacing:.08em;line-height:1.3;text-decoration:none!important;box-shadow:0 12px 30px rgba(201,162,74,.26),inset 0 1px 0 rgba(255,255,255,.35);cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .15s ease,filter .2s ease}',
    '.dcR-btn:hover{filter:brightness(1.05)}',
    '.dcR-btn:active{transform:translateY(1px)}',
    '.dcR-btn--line{background:transparent;color:var(--gold-hi)!important;border:1px solid rgba(201,162,74,.7);box-shadow:none}',
    '.dcR-ico{flex:none;width:22px;height:22px;border-radius:6px;background:#06c755;display:grid;place-items:center}',
    '.dcR-ico svg{width:16px;height:16px;display:block}',
    '.dcR-ico--ig{background:radial-gradient(circle at 30% 107%,#fdf497 0%,#fd5949 45%,#d6249f 60%,#285AEB 90%)}',
    '.dcR-alt{display:inline-block;margin:14px 0 0;font-size:12.5px;color:var(--gold-hi)!important;text-decoration:underline!important;text-underline-offset:3px}',
    '.dcR-ship{margin:12px 0 0;font-size:12px;line-height:1.6;color:var(--muted)}',
    '.dcR[lang="en"],.dcR[lang="en"] *,.dcR-sticky[lang="en"] *{word-break:normal!important;overflow-wrap:break-word!important}',
    '.dcR-note{margin:11px 0 0;font-size:11.5px;line-height:1.7;color:var(--muted);word-break:keep-all;overflow-wrap:anywhere}',
    '.dcR[data-dc-rough="gallery"]{margin:10px auto 34px}',
    '.dcR[data-dc-rough="products"]{margin:26px auto 0}',
    '.dcR--slim .dcR-box{padding:22px 18px 18px}',
    '.dcR--slim .dcR-h{font-size:17px}',
    '.dcR--item{max-width:none;margin:22px 0 0;padding:0;text-align:left}',
    '.dcR--item .dcR-box{padding:22px 18px 18px;border-radius:10px}',
    '.dcR--item .dcR-h{font-size:16px;margin-bottom:8px}',
    '.dcR--item .dcR-p{font-size:13px;margin-bottom:16px;word-break:normal;line-break:strict}',
    '.dcR--item .dcR-btn{max-width:none}',
    '.dcR-sticky{position:fixed;left:12px;right:12px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:2147482000;display:none;pointer-events:none}',
    '.dcR-no-bubble .dcR-sticky{right:12px}',
    '.dcR-sticky.is-on{pointer-events:auto}',
    '.dcR-st{display:flex;flex-direction:column;align-items:flex-start;line-height:1.25}',
    '.dcR-st-main{font-size:14px;font-weight:600;letter-spacing:.06em}',
    '.dcR-st-sub{margin-top:3px;font-size:10.5px;font-weight:400;letter-spacing:.04em;color:#b9ad8c}',
    '@media (max-width:768px){.dcR-has-sticky body{padding-bottom:86px}}',
    '.dcR-sticky a{display:flex;align-items:center;justify-content:center;gap:11px;height:58px;padding:0 18px;border-radius:999px;border:1px solid rgba(201,162,74,.65);background:rgba(12,11,10,.9);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:var(--gold-hi,#ebd28f)!important;font-size:14px;font-weight:600;letter-spacing:.06em;text-decoration:none!important;box-shadow:0 10px 30px rgba(0,0,0,.45);-webkit-tap-highlight-color:transparent}',
    '.dcR-sticky .dcR-ico{width:20px;height:20px;border-radius:5px}',
    '.dcR-sticky{opacity:0;transform:translateY(12px);transition:opacity .3s ease,transform .3s ease}',
    '.dcR-sticky.is-on{opacity:1;transform:none}',
    '@media (max-width:768px){.dcR-sticky{display:block}}',
    '.dc3d-open .dcR-sticky{display:none!important}',
    '@media (prefers-reduced-motion:reduce){.dcR-sticky{transition:none}}'
  ].join('\n');

  var LINE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M12 3.2C6.9 3.2 2.8 6.5 2.8 10.6c0 3.6 3.2 6.6 7.6 7.2.3.1.7.2.8.5.1.3.1.6 0 .9l-.1.8c0 .2-.2.9.8.5s5.4-3.2 7.4-5.5c1.4-1.5 2-3 2-4.6 0-4-4.1-7.2-9.3-7.2z"/></svg>';

  var IG_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#fff" stroke-width="2"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="#fff" stroke="none"/></svg>';

  function track(name) { try { if (typeof window.clarity === 'function') window.clarity('event', name); } catch (_) {} }

  // put a ready-made first message on the clipboard, so the visitor only has to paste it in LINE
  function copy(text) {
    if (!text) return;
    try {
      if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).catch(function () {}); return; }
    } catch (_) {}
    try {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-100px;opacity:0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    } catch (_) {}
  }

  function ctaUrl() { return EN ? IG_DM_URL : lineUrl(); }

  function open(message, place) {
    var url = ctaUrl();
    if (!url) return false;
    copy(message);
    track('dc_rough_' + (place || 'other'));
    window.location.href = url;
    return true;
  }

  function link(cls, label, message, place) {
    var a = document.createElement('a');
    a.className = cls;
    a.href = ctaUrl();
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = '<span class="dcR-ico' + (EN ? ' dcR-ico--ig' : '') + '">' + (EN ? IG_SVG : LINE_SVG) + '</span><span>' + label + '</span>';
    a.addEventListener('click', function () { copy(message); track('dc_rough_' + place); });
    return a;
  }

  // ---------- copy ----------
  var MSG_ROUGH = EN ? 'Hi! I\'d like a free rough design. I\'ll send a photo of my car.' : '無料ラフをお願いします。愛車の写真を送ります。';
  var MSG_SEMI = EN ? 'Hi! I\'d like a free rough for a Semi Order. I\'ll send a photo of my car.' : 'セミオーダーの無料ラフをお願いします。愛車の写真を送ります。';
  var MSG_FULL = EN ? 'Hi! I\'d like to talk about a Full Order.' : 'フルオーダーについて相談したいです。';
  var STEPS = EN
    ? '<ol class="dcR-steps"><li><b>STEP 1</b>Send a photo<br>of your car by DM</li><li><b>STEP 2</b>Get your<br>free rough</li><li><b>STEP 3</b>Order if<br>you love it</li></ol>'
    : '<ol class="dcR-steps"><li><b>STEP 1</b>愛車の写真を<br>LINEで送る</li><li><b>STEP 2</b>あなたの車の<br>ラフが届く</li><li><b>STEP 3</b>気に入ったら<br>ご注文</li></ol>';
  var T = EN ? {
    galleryH: 'What would your car look like<br>as one of these?',
    galleryP: 'Pick any design from the gallery and we\'ll make<br>a free rough with your car. Just send one photo.',
    btn: 'Get a free rough of your car',
    productsH: 'Not sure yet? Start with a free rough',
    productsP: 'See it first, then decide.<br>Questions are welcome too.',
    semiH: 'A free rough before you buy',
    semiP: 'Pick a design and we\'ll show you a rough with your car first. Order only if you love it.',
    fullH: 'Let\'s talk first',
    fullP: 'Full Order designs are created together with you after you order. Share your ideas by DM — it\'s free. Want a feel for it first? We can also make a free rough with a gallery design.',
    fullBtn: 'Talk to us by DM (free)',
    stickyMain: 'Get a free rough of your car', stickyFull: 'Talk to us by DM (free)', stickySub: 'Questions? DM us on Instagram',
    alt: 'Living in Japan? Chat with us on LINE',
    ship: 'Shipping outside Japan is charged separately — we\'ll quote it for your country by DM.'
  } : {
    galleryH: 'あなたの愛車だと、<br>どんな一枚になる？',
    galleryP: 'ギャラリーのデザインで、あなたの愛車のラフを<br>無料でお作りします。写真を1枚送るだけ。',
    btn: '愛車のラフを無料で見る',
    productsH: '迷ったら、まず無料ラフから',
    productsP: '仕上がりを見てから決められます。<br>ご質問だけでもお気軽にどうぞ。',
    semiH: 'ご購入前に、無料でラフをお作りします',
    semiP: 'お好きな掲載デザインで、あなたの愛車のラフを先にお見せします。仕上がりを見てからご購入いただけます。',
    fullH: 'まずはLINEでご相談ください',
    fullP: 'フルオーダーのデザインは、ご注文後の打ち合わせで一緒に作り上げます。イメージのご相談は無料です。掲載デザインで仕上がりの雰囲気を先に見たい方には、無料ラフもお作りします。',
    fullBtn: 'LINEで無料相談・ラフ依頼',
    stickyMain: '愛車のラフを無料で見る', stickyFull: 'LINEで相談する（無料）', stickySub: 'ご質問だけでも、お気軽にLINEへ',
    alt: '', ship: ''
  };

  function block(kind) {
    var wrap = document.createElement('section');
    wrap.setAttribute('data-dc-rough', kind);
    var badge = slots() ? '<p class="dcR-badge">' + slots() + '</p>' : '';
    var html, label, msg, cls = 'dcR';
    if (kind === 'gallery') {
      html = '<p class="dcR-eyebrow">FREE ROUGH DESIGN</p>' +
        '<h3 class="dcR-h">' + T.galleryH + '</h3>' +
        '<p class="dcR-p">' + T.galleryP + '</p>' + STEPS;
      label = T.btn; msg = MSG_ROUGH;
    } else if (kind === 'products') {
      cls += ' dcR--slim';
      html = '<h3 class="dcR-h">' + T.productsH + '</h3>' +
        '<p class="dcR-p">' + T.productsP + '</p>';
      label = T.btn; msg = MSG_ROUGH;
    } else if (kind === 'semi') {
      cls += ' dcR--item';
      html = '<h3 class="dcR-h">' + T.semiH + '</h3>' +
        '<p class="dcR-p">' + T.semiP + '</p>';
      label = T.btn; msg = MSG_SEMI;
    } else { // full
      cls += ' dcR--item';
      html = '<h3 class="dcR-h">' + T.fullH + '</h3>' +
        '<p class="dcR-p">' + T.fullP + '</p>';
      label = T.fullBtn; msg = MSG_FULL;
    }
    wrap.className = cls;
    if (EN) wrap.setAttribute('lang', 'en');
    wrap.innerHTML = '<div class="dcR-box">' + badge + html + '</div>';
    var box = wrap.firstChild;
    box.appendChild(link('dcR-btn', label, msg, kind));
    if (EN) {
      // people living in Japan often use LINE; keep that door open
      var alt = document.createElement('a');
      alt.className = 'dcR-alt';
      alt.href = lineUrl(); alt.target = '_blank'; alt.rel = 'noopener';
      alt.textContent = T.alt;
      alt.addEventListener('click', function () { track('dc_rough_line_en_' + kind); });
      box.appendChild(alt);
      if (kind === 'semi' || kind === 'full') {   // the top page says it in HOW IT WORKS
        var ship = document.createElement('p');
        ship.className = 'dcR-ship';
        ship.textContent = T.ship;
        box.appendChild(ship);
      }
    }
    return wrap;
  }

  function sticky(kind) {
    var d = document.createElement('div');
    d.className = 'dcR-sticky';
    d.setAttribute('data-dc-rough', 'sticky');
    if (EN) d.setAttribute('lang', 'en');
    var full = kind === 'full';
    var a = link('', '', full ? MSG_FULL : (kind === 'semi' ? MSG_SEMI : MSG_ROUGH), 'sticky_' + kind);
    a.lastChild.outerHTML = '<span class="dcR-st"><span class="dcR-st-main">' +
      (full ? T.stickyFull : T.stickyMain) +
      '</span><span class="dcR-st-sub">' + T.stickySub + '</span></span>';
    d.appendChild(a);
    document.body.appendChild(d);
    document.documentElement.classList.add('dcR-has-sticky');
    // appears once you scroll past the first screen and then stays put (no flicker);
    // it only goes away again near the very top of the page
    var shown = false;
    function update() {
      var y = window.pageYOffset, h = window.innerHeight;
      var on = shown ? y > h * 0.25 : y > h * 0.7;
      if (on !== shown) { shown = on; d.classList.toggle('is-on', on); }
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // The shop's older floating LINE bubble (bottom right) is no longer needed: hide it.
  function isLineWidget(n) {
    try { return lineWidgetTest(n); } catch (_) { return false; }
  }
  function lineWidgetTest(n) {
    if (n.matches && n.matches('iframe') && /line/i.test(n.src || '')) return true;
    if (n.querySelector && n.querySelector('a[href*="lin.ee"],a[href*="line.me"],iframe[src*="line"],img[src*="line" i],img[alt*="line" i]')) return true;
    if (n.matches && n.matches('a[href*="lin.ee"],a[href*="line.me"]')) return true;
    if (/(^|\s)line(\s|$)/i.test((n.textContent || '').trim())) return true;
    return /(^|[-_\s])line([-_\s]|$)/i.test((n.id || '') + ' ' + (typeof n.className === 'string' ? n.className : ''));
  }
  function hideOldLineBubble() {
    var W = window.innerWidth, H = window.innerHeight, hid = false;
    Array.prototype.forEach.call(document.querySelectorAll('body > *, body > * > *'), function (n) {
      if (n.__dcSeen || /^(SCRIPT|STYLE|LINK|NOSCRIPT)$/.test(n.tagName)) return;
      if (n.closest && n.closest('.dcR,.dcR-sticky,.dc3d,.dc3d-modal,#baseMenu,#mainHeader,#mainContent,#mainFooter,.dcStory')) return;
      var cs = window.getComputedStyle(n);
      if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') return;
      var r = n.getBoundingClientRect();
      if (!r.width || r.width > 240 || r.height > 240) return;
      if (r.left < W * 0.4 || r.top < H * 0.4) return;           // bottom-right corner only
      n.__dcSeen = true;
      if (!isLineWidget(n)) return;
      n.style.setProperty('display', 'none', 'important');
      hid = true;
    });
    if (hid) document.documentElement.classList.add('dcR-no-bubble');
    return hid;
  }
  function watchOldLineBubble() {
    hideOldLineBubble();
    if (!('MutationObserver' in window)) return;
    var mo = new MutationObserver(function () { hideOldLineBubble(); });
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () { mo.disconnect(); }, 20000);
    window.addEventListener('load', function () { setTimeout(hideOldLineBubble, 800); setTimeout(hideOldLineBubble, 3000); });
  }

  // ---------- placement ----------
  function injectCSS() {
    if (document.getElementById('dcRoughCss')) return;
    var st = document.createElement('style');
    st.id = 'dcRoughCss';
    st.textContent = CSS;
    document.head.appendChild(st);
  }
  function itemKind() {
    var k = document.body.getAttribute('data-dc-kind');   // set by item.js
    if (k === 'semi' || k === 'full') return k;
    var h1 = document.querySelector('#mainContent h1.itemTitle');
    var t = h1 ? h1.textContent.trim() : '';
    if (t.indexOf('セミオーダー') === 0 || t.indexOf('Semi Order') === 0) return 'semi';
    if (t.indexOf('フルオーダー') === 0 || t.indexOf('Full Order') === 0) return 'full';
    return '';
  }

  var stickyDone = false;
  function place() {
    var page = document.body && document.body.id;
    if (page !== 'shopTopPage' && page !== 'shopDetailPage') return true;
    if (!ctaUrl()) return false;
    injectCSS();
    var done = true;

    if (page === 'shopTopPage') {
      if (!document.querySelector('[data-dc-rough="gallery"]')) {
        var g = document.querySelector('[data-dc3d]') || document.querySelector('.dcScroll');
        if (g) g.parentNode.insertBefore(block('gallery'), g.nextSibling); else done = false;
      }
      if (!document.querySelector('[data-dc-rough="products"]')) {
        var m = document.getElementById('mainContent');
        if (m) m.parentNode.insertBefore(block('products'), m); else done = false;
      }
      if (done && !stickyDone) { stickyDone = true; sticky('top'); }
      return done;
    }

    var kind = itemKind();
    if (!kind) return true;
    if (!document.querySelector('[data-dc-rough="' + kind + '"]')) {
      var anchor = document.querySelector('#mainContent .dcItem-trust') ||
        document.querySelector('#mainContent .purchaseButton') ||
        document.querySelector('#mainContent #purchase_form');
      if (!anchor) return false;
      anchor.parentNode.insertBefore(block(kind), anchor.nextSibling);
    }
    if (!stickyDone) { stickyDone = true; sticky(kind); }
    return true;
  }

  window.DCRough = { url: ctaUrl, open: open, en: EN, version: '3.1.0' };
  window.__dcLineCta = true;

  function boot() {
    watchOldLineBubble();
    if (place()) return;
    // the LP and item enhancements are inserted after load, so keep looking for a while
    if ('MutationObserver' in window) {
      var mo = new MutationObserver(function () { if (place()) mo.disconnect(); });
      mo.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(function () { mo.disconnect(); }, 20000);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
