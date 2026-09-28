/*! Driver's Collection — site-wide bits (site.js)
 * - language: JP / EN toggle (top-left). EN is picked automatically for non-Japanese phones,
 *   remembered in localStorage, and can be forced with ?lang=en / ?lang=ja
 * - item pages: a small "back to top" arrow at the top-left
 * - EN only: the LP pictures that carry Japanese text (hero, gallery title, order flow)
 *   are swapped for live English sections; product names in the list are shown in English
 * Loaded by dc3d.js (top page) and item.js (item pages). No BASE edit needed.
 */
(function () {
  'use strict';
  if (window.__dcSite) return;
  window.__dcSite = true;

  var SCRIPT = document.currentScript;
  var ROOT = (SCRIPT && SCRIPT.src) ? SCRIPT.src.replace(/[^/]*(\?.*)?$/, '') : 'https://coretagishi-lab.github.io/dc-cards/';
  var IG_DM = 'https://ig.me/m/drivers_collection_';

  // The chosen language is kept in localStorage and a cookie (the cookie also works in private tabs).
  // ?lang=en / ?lang=ja in a link sets it once and is then removed from the address, so an old
  // address in the history can't switch the language back later.
  function stored() {
    try { var s = localStorage.getItem('dc_lang'); if (s === 'en' || s === 'ja') return s; } catch (_) {}
    var c = /(?:^|;\s*)dc_lang=(en|ja)/.exec(document.cookie || '');
    return c ? c[1] : '';
  }
  function store(l) {
    try { localStorage.setItem('dc_lang', l); } catch (_) {}
    try { document.cookie = 'dc_lang=' + l + ';path=/;max-age=31536000;SameSite=Lax'; } catch (_) {}
    return stored() === l;
  }
  function urlWithoutLang() {
    var search = location.search.replace(/([?&])lang=(en|ja)(&|$)/, function (m, a, l, b) { return b ? a : ''; }).replace(/^&/, '?');
    return location.pathname + (search === '?' ? '' : search) + location.hash;
  }
  function dcLang() {
    var q = /[?&]lang=(en|ja)(&|$)/.exec(location.search);
    if (q) {
      if (store(q[1])) { try { history.replaceState(history.state, '', urlWithoutLang()); } catch (_) {} }
      return q[1];
    }
    return stored() || (/^ja\b/i.test(navigator.language || 'ja') ? 'ja' : 'en');
  }
  var LANG = dcLang();
  window.DC_LANG = LANG;
  document.documentElement.setAttribute('data-dc-lang', LANG);
  if (LANG === 'en') document.documentElement.setAttribute('lang', 'en');
  // coming back with the browser's back button can show a page kept in memory: fix its language
  window.addEventListener('pageshow', function (e) {
    var s = stored();
    if (e.persisted && s && s !== LANG) location.reload();
  });

  // BASE file ids of the LP pictures (see the theme's LP script)
  var IMG = { hero: '6aacdb5db5289/', gallery: '6aabd540edcf6/', flow: '6aacae74296a9/' };
  var SERIF = '"Cormorant Garamond","Times New Roman",serif';

  var CSS = [
    // language toggle + back arrow
    '.dcTopbar{position:fixed;top:calc(var(--information-banner-height, 0px) + 12px);left:12px;z-index:2147480000;display:flex;gap:8px;align-items:center;-webkit-tap-highlight-color:transparent}',
    '.dcBack{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;border:1px solid rgba(201,162,74,.35);background:rgba(12,11,10,.72);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#ebd28f!important;text-decoration:none!important}',
    '.dcBack svg{width:18px;height:18px}',
    // one switch with a gold knob that slides to the chosen side as soon as it is tapped
    '.dcLang{position:relative;display:grid;grid-template-columns:1fr 1fr;width:92px;height:36px;padding:3px;border-radius:999px;border:1px solid rgba(201,162,74,.35);background:rgba(12,11,10,.72);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);cursor:pointer;touch-action:manipulation;user-select:none;-webkit-user-select:none}',
    '.dcLang::before{content:"";position:absolute;top:3px;bottom:3px;left:3px;width:calc(50% - 3px);border-radius:999px;background:linear-gradient(180deg,#e8ca7b,#b68d35);box-shadow:0 2px 8px rgba(0,0,0,.35);transition:transform .22s cubic-bezier(.3,.7,.2,1)}',
    '.dcLang[data-on="en"]::before{transform:translateX(100%)}',
    '.dcLang a{position:relative;z-index:1;display:grid;place-items:center;border-radius:999px;font:600 11px/1 "Helvetica Neue",Arial,sans-serif;letter-spacing:.12em;padding-left:.12em;color:#958c7a!important;text-decoration:none!important;transition:color .22s ease}',
    '.dcLang[data-on="ja"] a[data-l="ja"],.dcLang[data-on="en"] a[data-l="en"]{color:#15110a!important}',
    '.dcLang-busy body{opacity:.55;transition:opacity .2s ease}',
    '@media (prefers-reduced-motion:reduce){.dcLang::before{transition:none}}',
    '.dc3d-open .dcTopbar{display:none}',
    // EN sections (".dcEn …" prefixes outrank the theme's later ".dcStory img{width:100%}")
    '.dcEn{position:relative;box-sizing:border-box;text-align:center;word-break:normal;overflow-wrap:break-word;color:#ede6d6;background:#040405 url("' + ROOT + 'lp/concept-bg.webp") center/cover no-repeat;overflow:hidden}',
    '.dcEn *{box-sizing:border-box}',
    '.dcEn-rule{position:relative;width:min(70%,320px);height:1px;margin:18px auto 16px;background:linear-gradient(90deg,transparent,#c9a24a 22%,#ebd28f 50%,#c9a24a 78%,transparent)}',
    '.dcEn-rule i{position:absolute;left:50%;top:50%;width:7px;height:7px;background:#ebd28f;transform:translate(-50%,-50%) rotate(45deg);box-shadow:0 0 10px rgba(235,210,143,.7)}',
    '.dcEn-gold{background:linear-gradient(180deg,#fff6dc 0%,#ebd28f 45%,#b8923f 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:#ebd28f}',
    '.dcEnHero{padding:60px 16px 40px}',
    '.dcEnHero-cards{position:relative;height:clamp(210px,56vw,320px);margin:0 auto 18px;max-width:420px}',
    '.dcEn .dcEnHero-cards img{position:absolute;top:8%;width:36%;border-radius:8px;box-shadow:0 18px 40px rgba(0,0,0,.6),0 0 0 1px rgba(235,210,143,.25)}',
    '.dcEn .dcEnHero-cards .l{left:6%;transform:rotate(-11deg);z-index:1}',
    '.dcEn .dcEnHero-cards .r{right:6%;transform:rotate(11deg);z-index:1}',
    '.dcEn .dcEnHero-cards .c{left:32%;top:0;width:36%;z-index:2;box-shadow:0 24px 50px rgba(0,0,0,.7),0 0 36px rgba(201,162,74,.28),0 0 0 1px rgba(235,210,143,.35)}',
    '.dcEnHero-h{margin:0;font-family:' + SERIF + ';font-weight:600;font-size:clamp(34px,9.6vw,54px);line-height:1.08;letter-spacing:.02em}',
    '.dcEnHero-sub{margin:0;font-family:' + SERIF + ';font-size:clamp(13px,3.6vw,16px);letter-spacing:.32em;line-height:1.9;color:#e9e3d6;padding-left:.32em}',
    '.dcEnTitle{padding:26px 16px 24px;background:#050505}',
    '.dcEnTitle-h{margin:0;font-family:' + SERIF + ';font-weight:600;font-size:clamp(44px,13vw,64px);line-height:1;letter-spacing:.08em;padding-left:.08em}',
    '.dcEnTitle-p{margin:8px 0 0;font-family:' + SERIF + ';font-style:italic;font-size:15px;letter-spacing:.08em;color:#cfc6b2}',
    '.dcEnTitle .dcEn-rule{margin:0 auto;width:min(86%,420px)}',
    '.dcEnTitle .dcEn-rule + .dcEnTitle-h{margin-top:22px}',
    '.dcEnTitle-p + .dcEn-rule{margin-top:20px}',
    '.dcEnFlow{padding:40px 16px 38px}',
    '.dcEnFlow-h{margin:0;font-family:' + SERIF + ';font-weight:600;font-size:clamp(30px,8.6vw,42px);letter-spacing:.14em;padding-left:.14em}',
    '.dcEnFlow ol{list-style:none;margin:6px auto 0;padding:0;max-width:420px;text-align:left;counter-reset:s}',
    '.dcEnFlow li{position:relative;display:flex;gap:14px;align-items:flex-start;padding:13px 4px;border-bottom:1px solid rgba(201,162,74,.18)}',
    '.dcEnFlow li:last-child{border-bottom:none}',
    '.dcEnFlow li b{flex:none;width:30px;font-family:' + SERIF + ';font-size:22px;line-height:1.1;font-weight:600;color:#c9a24a}',
    '.dcEnFlow li span{font-size:14px;line-height:1.6;color:#e2dccd}',
    '.dcEnFlow li small{display:block;margin-top:2px;font-size:12px;color:#958c7a}',
    '.dcEnFlow-note{margin:16px auto 0;max-width:420px;font-size:12.5px;line-height:1.7;color:#b9ad8c}'
  ].join('\n');

  function injectCSS() {
    if (document.getElementById('dcSiteCss')) return;
    if (!document.querySelector('link[href*="Cormorant+Garamond"]')) {
      var f = document.createElement('link');
      f.rel = 'stylesheet';
      f.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&display=swap';
      document.head.appendChild(f);
    }
    var s = document.createElement('style');
    s.id = 'dcSiteCss';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // ---------- top bar: back arrow (item pages) + JP/EN ----------
  function switchTo(l, sw) {
    sw.setAttribute('data-on', l);                       // show the change right away
    document.documentElement.classList.add('dcLang-busy');
    var base = urlWithoutLang();
    // saved -> reload the same address; storage blocked -> carry the choice in the address instead
    var next = store(l) ? base : base.replace(/(#|$)/, (base.indexOf('?') < 0 ? '?' : '&') + 'lang=' + l + '$1');
    setTimeout(function () {
      if (next === location.pathname + location.search + location.hash) location.reload();
      else location.href = next;
    }, 180);
  }
  function topbar(page) {
    if (document.querySelector('.dcTopbar')) return;
    var bar = document.createElement('div');
    bar.className = 'dcTopbar';
    if (page === 'shopDetailPage') {
      var back = document.createElement('a');
      back.className = 'dcBack';
      back.href = '/';
      back.setAttribute('aria-label', LANG === 'en' ? 'Back to top' : 'トップへ戻る');
      back.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
      back.addEventListener('click', function (e) {
        // came from our own top page -> go back so the scroll position is kept
        if (document.referrer && document.referrer.indexOf(location.origin) === 0 && history.length > 1) {
          e.preventDefault();
          history.back();
        }
      });
      bar.appendChild(back);
    }
    var sw = document.createElement('div');
    sw.className = 'dcLang';
    sw.setAttribute('data-on', LANG);
    sw.setAttribute('role', 'group');
    sw.setAttribute('aria-label', 'Language');
    sw.innerHTML = '<a href="#" role="button" data-l="ja" lang="ja" aria-pressed="' + (LANG === 'ja') + '">JP</a>' +
      '<a href="#" role="button" data-l="en" lang="en" aria-pressed="' + (LANG === 'en') + '">EN</a>';
    sw.addEventListener('click', function (e) {
      e.preventDefault();
      if (document.documentElement.classList.contains('dcLang-busy')) return;
      switchTo(LANG === 'ja' ? 'en' : 'ja', sw);   // two choices: any tap flips it
    });
    bar.appendChild(sw);
    document.body.appendChild(bar);
    // BASE's own language/currency selector (if the i18n app shows one) also sits top-left: go under it
    var i18 = document.getElementById('i18');
    if (i18) {
      var r = i18.getBoundingClientRect();
      if (r.height) bar.style.top = Math.round(r.bottom + 8) + 'px';
    }
  }

  // ---------- EN versions of the LP pictures ----------
  function img(id) { return document.querySelector('.dcStory img[src*="' + id + '"]'); }
  function swap(el, html, cls) {
    var s = document.createElement('section');
    s.className = 'dcEn ' + cls;
    s.innerHTML = html;
    el.parentNode.replaceChild(s, el);
  }
  function enHero() {
    var el = img(IMG.hero);
    if (!el) return !!document.querySelector('.dcEnHero');
    swap(el,
      '<div class="dcEnHero-cards">' +
        '<img class="l" src="' + ROOT + 'cards/sf90-stradale/mid.webp" alt="">' +
        '<img class="r" src="' + ROOT + 'cards/gallardo-spyder/mid.webp" alt="">' +
        '<img class="c" src="' + ROOT + 'cards/aventador/mid.webp" alt="">' +
      '</div>' +
      '<h1 class="dcEnHero-h dcEn-gold">Your car,<br>one card in the world.</h1>' +
      '<div class="dcEn-rule"><i></i></div>' +
      '<p class="dcEnHero-sub">MORE THAN A CARD.<br>A STORY OF YOU.</p>', 'dcEnHero');
    return true;
  }
  function enGalleryTitle() {
    var el = img(IMG.gallery);
    if (!el) return !!document.querySelector('.dcEnTitle');
    swap(el,
      '<div class="dcEn-rule"><i></i></div>' +
      '<h2 class="dcEnTitle-h dcEn-gold">GALLERY</h2>' +
      '<p class="dcEnTitle-p">One-of-one designs</p>' +
      '<div class="dcEn-rule"><i></i></div>', 'dcEnTitle');
    return true;
  }
  function enFlow() {
    var el = img(IMG.flow);
    if (!el) { var box = document.getElementById('dcFlow'); if (box && box.querySelector('.dcEnFlow')) return true; return false; }
    swap(el,
      '<h2 class="dcEnFlow-h dcEn-gold">HOW IT WORKS</h2>' +
      '<div class="dcEn-rule"><i></i></div>' +
      '<ol>' +
        '<li><b>01</b><span>Send us a photo of your car<small>By Instagram DM. One photo is enough.</small></span></li>' +
        '<li><b>02</b><span>Get a free rough design<small>Pick any design from the gallery — no obligation.</small></span></li>' +
        '<li><b>03</b><span>Place your order<small>Semi Order: a gallery design with your car. Full Order: designed from scratch.</small></span></li>' +
        '<li><b>04</b><span>Handmade in Japan<small>About one month, finished card by card.</small></span></li>' +
        '<li><b>05</b><span>Shipped to your door<small>In a Driver\'s Collection gift box. Tracked EMS outside Japan.</small></span></li>' +
      '</ol>' +
      '<p class="dcEnFlow-note">Outside Japan, we ship by EMS \u2014 shipping is shown at checkout.<br>In the US? DM us first for a total including import duties.</p>', 'dcEnFlow');
    return true;
  }
  function enProducts() {
    var map = { 'フルオーダー': 'Full Order', 'セミオーダー': 'Semi Order' };
    Array.prototype.forEach.call(document.querySelectorAll('#mainContent .item .itemTitle h2'), function (h) {
      var t = h.textContent.trim();
      if (map[t]) h.textContent = map[t];
    });
    return document.querySelectorAll('#mainContent .item').length > 0;
  }

  function placeTop() {
    var ok = true;
    if (LANG === 'en') {
      ok = enHero() && ok;
      ok = enGalleryTitle() && ok;
      ok = enFlow() && ok;
      ok = enProducts() && ok;
    }
    return ok;
  }

  function boot() {
    var page = document.body && document.body.id;
    if (page !== 'shopTopPage' && page !== 'shopDetailPage') return;
    injectCSS();
    topbar(page);
    if (page !== 'shopTopPage') return;
    if (placeTop()) return;
    if ('MutationObserver' in window) {
      var mo = new MutationObserver(function () { if (placeTop()) mo.disconnect(); });
      mo.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(function () { mo.disconnect(); }, 15000);
    }
  }

  window.DCSite = { lang: LANG, igDm: IG_DM };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
