/*! Driver's Collection — LP text sections (lp-copy.js)
 * Replaces the concept image (text baked into a picture) with live text, so the copy can be
 * changed here in seconds. Loaded by dc3d.js on the top page; no BASE edit needed.
 */
(function () {
  'use strict';
  if (window.__dcLpCopy) return;
  window.__dcLpCopy = true;

  var SCRIPT = document.currentScript;
  var ROOT = (SCRIPT && SCRIPT.src) ? SCRIPT.src.replace(/[^/]*(\?.*)?$/, '') : 'https://coretagishi-lab.github.io/dc-cards/';

  // ---- copy (edit here) ----
  var CONCEPT = {
    image: '6aabd5514cc23/',          // BASE file id of the old concept image this replaces
    heading: 'このトレカアート<br>全てハンドメイド',
    body: 'あなたの愛車専用のトレカは<br>1枚1枚職人が手作業で作ります。<br>これをできるのは世界でここだけ<br>\u201C世界に一個だけ\u201Dをあなたに届けます。'
  };

  var SERIF = '"Shippori Mincho","Hiragino Mincho ProN","Yu Mincho","YuMincho",serif';
  var CSS = [
    '.dcConcept{position:relative;display:grid;place-items:center;padding:44px 16px 38px;background:#040405 url("' + ROOT + 'lp/concept-bg.webp") center/cover no-repeat;text-align:center;overflow:hidden;box-sizing:border-box}',
    '.dcConcept-h{margin:0;font-family:' + SERIF + ';font-weight:700;font-size:clamp(30px,8.6vw,46px);line-height:1.42;letter-spacing:.08em;padding-left:.08em;background:linear-gradient(180deg,#fffaf0 0%,#f3e9d3 55%,#d8c190 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:#f3e9d3}',
    '.dcConcept-rule{position:relative;width:min(78%,360px);height:1px;margin:18px auto 16px;background:linear-gradient(90deg,transparent,#c9a24a 22%,#ebd28f 50%,#c9a24a 78%,transparent)}',
    '.dcConcept > div{width:100%;text-align:center}',
    '.dcConcept-rule i{position:absolute;left:50%;top:50%;width:7px;height:7px;background:#ebd28f;transform:translate(-50%,-50%) rotate(45deg);box-shadow:0 0 10px rgba(235,210,143,.7)}',
    '.dcConcept-p{margin:0;font-family:' + SERIF + ';font-weight:500;font-size:clamp(13.5px,3.7vw,17px);line-height:1.95;letter-spacing:.06em;padding-left:.06em;color:#e9e3d6;word-break:keep-all;overflow-wrap:anywhere}'
  ].join('\n');

  // top-page spacing: product cards, product list -> closing image -> footer
  // ("html body#..." outranks the theme's own !important rules)
  var LAYOUT = [
    'html body#shopTopPage .itemList{padding:18px 16px 8px!important;gap:12px!important}',
    'html body#shopTopPage .item .itemImg{aspect-ratio:auto!important}',
    'html body#shopTopPage .item .itemImg a::before{padding-top:131%!important}',
    'html body#shopTopPage .item .itemImg img{object-fit:cover!important}',
    'html body#shopTopPage .item .itemTitle{margin:12px 10px 0!important}',
    'html body#shopTopPage .item .itemTitle h2{margin:0 auto!important}',
    'html body#shopTopPage .item .itemPrice{margin:2px 10px 14px!important;line-height:1.4}',
    'html body#shopTopPage .item .itemDetail{margin:0!important}',
    'html body#shopTopPage #loading{padding:0!important}',
    // closing image: trim the empty sky above the words
    'html body#shopTopPage .dcStory img[src*="6aabd5720060e"]{aspect-ratio:1/1;object-fit:cover;object-position:50% 75%}',
    'html body#shopTopPage #mainFooter{margin:18px auto 24px!important}'
  ].join('\n');
  function injectLayout() {
    if (document.getElementById('dcLpLayoutCss')) return;
    var s = document.createElement('style');
    s.id = 'dcLpLayoutCss';
    s.textContent = LAYOUT;
    document.head.appendChild(s);
  }

  function injectCSS() {
    if (document.getElementById('dcLpCopyCss')) return;
    // a Japanese serif, downloaded only for the characters used here (tiny file)
    var chars = (CONCEPT.heading + CONCEPT.body).replace(/<[^>]+>/g, '');
    var uniq = Array.from(new Set(chars.split(''))).join('');
    var f = document.createElement('link');
    f.rel = 'stylesheet';
    f.href = 'https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700&display=swap&text=' + encodeURIComponent(uniq);
    document.head.appendChild(f);
    var s = document.createElement('style');
    s.id = 'dcLpCopyCss';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function concept() {
    if (document.querySelector('.dcConcept')) return true;
    var img = document.querySelector('.dcStory img[src*="' + CONCEPT.image + '"]');
    if (!img) return false;
    injectCSS();
    var sec = document.createElement('section');
    sec.className = 'dcConcept';
    sec.innerHTML = '<div><h2 class="dcConcept-h">' + CONCEPT.heading + '</h2>' +
      '<div class="dcConcept-rule"><i></i></div>' +
      '<p class="dcConcept-p">' + CONCEPT.body + '</p></div>';
    img.parentNode.replaceChild(sec, img);
    return true;
  }

  function boot() {
    if (document.body.id !== 'shopTopPage') return;
    injectLayout();
    if (concept()) return;
    if ('MutationObserver' in window) {
      var mo = new MutationObserver(function () { if (concept()) mo.disconnect(); });
      mo.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(function () { mo.disconnect(); }, 15000);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
