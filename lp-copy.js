/*! Driver's Collection — LP text sections (lp-copy.js)
 * Live-text versions of the LP parts that used to be pictures with words in them, so the copy can
 * be changed here in seconds: the concept and the order flow (ご注文の流れ), in Japanese and English.
 * Loaded by dc3d.js on the top page. Works with both theme versions:
 *   new theme : empty placeholders <… data-dc="concept"> / <… data-dc="flow"> with their height reserved
 *   old theme : the pictures themselves, which get swapped out
 */
(function () {
  'use strict';
  if (window.__dcLpCopy) return;
  window.__dcLpCopy = true;

  var SCRIPT = document.currentScript;
  var ROOT = (SCRIPT && SCRIPT.src) ? SCRIPT.src.replace(/[^/]*(\?.*)?$/, '') : 'https://coretagishi-lab.github.io/dc-cards/';

  // JP / EN (same rule as site.js)
  function dcLang() {
    try {
      var q = /[?&]lang=(en|ja)(&|$)/.exec(location.search);
      if (q) return q[1];
      var s = localStorage.getItem('dc_lang');
      if (s === 'en' || s === 'ja') return s;
    } catch (_) {}
    var c = /(?:^|;\s*)dc_lang=(en|ja)/.exec(document.cookie || '');
    if (c) return c[1];
    return /^ja\b/i.test(navigator.language || 'ja') ? 'ja' : 'en';
  }
  var EN = dcLang() === 'en';

  // ---- copy (edit here) ----
  var CONCEPT = {
    image: '6aabd5514cc23/',          // BASE file id of the old concept image this replaces
    heading: EN ? 'Every card,<br>made by hand.' : 'このトレカアート<br>全てハンドメイド',
    body: EN
      ? 'Your card is made only for your car,<br>crafted one by one by our artisans.<br>No one else in the world does this.<br>A true \u201Cone of one,\u201D delivered to you.'
      : 'あなたの愛車専用のトレカは<br>1枚1枚職人が手作業で作ります。<br>これをできるのは世界でここだけ<br>\u201C世界に一個だけ\u201Dをあなたに届けます。'
  };

  // order flow: free rough first (semi), purchase, then the handmade part
  var FLOW = EN ? {
    heading: 'HOW IT WORKS', sub: '',
    steps: [
      ['Send us a photo of your car', 'By Instagram DM. One photo is enough.'],
      ['Get a free rough design', 'Pick any design from the gallery and see it with your car \u2014 no obligation.'],
      ['Place your order', 'Semi Order: the design you picked. Full Order: designed from scratch with you after you order.'],
      ['Handmade in Japan', 'You check the final design first, then our craftsmen make it card by card.'],
      ['Shipped to your door', 'In a Driver\'s Collection gift box. Tracked EMS outside Japan.']
    ],
    note: 'About one month from your order. Outside Japan, EMS shipping is shown at checkout.<br>In the US? DM us first for a total including import duties.'
  } : {
    heading: 'ご注文の流れ', sub: 'FLOW',
    steps: [
      ['写真を送る', '愛車の写真を1枚、公式LINEで送るだけ。'],
      ['無料ラフが届く', '掲載デザインで、あなたの愛車のラフをお作りします。'],
      ['ご購入', '仕上がりを見て、気に入ったらご購入ください。フルオーダーは、ご購入後の打ち合わせでゼロからデザインします。'],
      ['職人が制作', '完成デザインをご確認いただいたうえで、職人が一枚ずつ手作業で仕上げます。'],
      ['お届け', '専用の化粧箱に入れて発送。発送時にLINEでお知らせします。']
    ],
    note: '納期の目安はご購入から約1ヶ月です。お急ぎの場合はLINEでご相談ください。'
  };

  var SERIF = EN ? '"Cormorant Garamond","Times New Roman",serif' : '"Shippori Mincho","Hiragino Mincho ProN","Yu Mincho","YuMincho",serif';
  var SANS = '"Helvetica Neue",Arial,"Hiragino Sans","Hiragino Kaku Gothic ProN",sans-serif';
  var CSS = [
    '.dcConcept{position:relative;display:grid;place-items:center;padding:44px 16px 38px;background:#040405 url("' + ROOT + 'lp/concept-bg.webp") center/cover no-repeat;text-align:center;overflow:hidden;box-sizing:border-box}',
    '.dcConcept-h{margin:0;font-family:' + SERIF + ';font-weight:700;font-size:clamp(30px,8.6vw,46px);line-height:1.42;letter-spacing:.08em;padding-left:.08em;background:linear-gradient(180deg,#fffaf0 0%,#f3e9d3 55%,#d8c190 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:#f3e9d3}',
    '.dcConcept-rule{position:relative;width:min(78%,360px);height:1px;margin:18px auto 16px;background:linear-gradient(90deg,transparent,#c9a24a 22%,#ebd28f 50%,#c9a24a 78%,transparent)}',
    '.dcConcept > div{width:100%;text-align:center}',
    '.dcConcept-rule i{position:absolute;left:50%;top:50%;width:7px;height:7px;background:#ebd28f;transform:translate(-50%,-50%) rotate(45deg);box-shadow:0 0 10px rgba(235,210,143,.7)}',
    '.dcConcept-p{margin:0;font-family:' + SERIF + ';font-weight:500;font-size:clamp(13.5px,3.7vw,17px);line-height:1.95;letter-spacing:.06em;padding-left:.06em;color:#e9e3d6;word-break:keep-all;overflow-wrap:anywhere}'
  ,
    // order flow
    '.dcFlow{position:relative;display:flex;flex-direction:column;justify-content:center;box-sizing:border-box;padding:42px 18px 36px;background:#040405 url("' + ROOT + 'lp/concept-bg.webp") center/cover no-repeat;text-align:center;color:#ede6d6;overflow:hidden;word-break:normal;overflow-wrap:break-word}',
    '.dcFlow *{box-sizing:border-box}',
    '.dcFlow-h{margin:0;font-family:' + SERIF + ';font-weight:700;font-size:clamp(28px,7.8vw,40px);line-height:1.3;letter-spacing:.12em;padding-left:.12em;background:linear-gradient(180deg,#fff6dc 0%,#ebd28f 50%,#b8923f 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:#ebd28f}',
    '.dcFlow-sub{margin:6px 0 0;font-family:"Cormorant Garamond","Times New Roman",serif;font-style:italic;font-size:13px;letter-spacing:.42em;padding-left:.42em;color:#c9a24a}',
    '.dcFlow .dcConcept-rule{margin:16px auto 18px;width:min(70%,320px)}',
    '.dcFlow ol{list-style:none;margin:0 auto;padding:0;max-width:430px;text-align:left}',
    '.dcFlow li{position:relative;display:grid;grid-template-columns:44px 1fr;column-gap:14px;padding:0 0 16px}',
    '.dcFlow li:last-child{padding-bottom:0}',
    '.dcFlow li:not(:last-child)::before{content:"";position:absolute;left:21.5px;top:46px;bottom:2px;width:1px;background:linear-gradient(180deg,rgba(235,210,143,.7),rgba(201,162,74,.15))}',
    '.dcFlow-no{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;border:1px solid rgba(201,162,74,.75);background:radial-gradient(circle at 50% 35%,rgba(201,162,74,.22),rgba(8,7,6,.9) 70%);font-family:"Cormorant Garamond","Times New Roman",serif;font-size:19px;font-weight:600;font-variant-numeric:lining-nums;color:#ebd28f;box-shadow:0 0 14px rgba(201,162,74,.18)}',
    '.dcFlow-t{display:block;padding-top:5px;font-family:' + SERIF + ';font-weight:700;font-size:17px;line-height:1.35;letter-spacing:.06em;color:#f1dfae}',
    '.dcFlow-d{display:block;margin-top:4px;font-family:' + SANS + ';font-size:12.5px;line-height:1.7;color:#c2baa8}',
    '.dcFlow-note{margin:18px auto 0;max-width:430px;font-family:' + SANS + ';font-size:12px;line-height:1.7;color:#b9ad8c}'
  ].concat(EN ? [
    '.dcConcept-h{font-weight:600;font-size:clamp(34px,10vw,52px);line-height:1.12;letter-spacing:.02em;padding-left:0}',
    '.dcConcept-p{font-size:clamp(16px,4.4vw,19px);line-height:1.75;letter-spacing:.03em;padding-left:0}',
    '.dcFlow-h{font-weight:600;letter-spacing:.14em;padding-left:.14em}',
    '.dcFlow-t{font-weight:600;font-size:19px;letter-spacing:.02em;padding-top:3px}'
  ] : []).join('\n');

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
    var f = document.createElement('link');
    f.rel = 'stylesheet';
    if (EN) {
      if (document.querySelector('link[href*="Cormorant+Garamond"]')) f = null;
      else f.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&display=swap';
    } else {
      // a Japanese serif, downloaded only for the characters used here (tiny file)
      var chars = (CONCEPT.heading + CONCEPT.body + FLOW.heading + FLOW.steps.map(function (x) { return x[0]; }).join('') + '0123456789').replace(/<[^>]+>/g, '');
      var uniq = Array.from(new Set(chars.split(''))).join('');
      f.href = 'https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700&display=swap&text=' + encodeURIComponent(uniq);
    }
    if (f) document.head.appendChild(f);
    var s = document.createElement('style');
    s.id = 'dcLpCopyCss';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // fill the theme's placeholder, or swap the old picture for a new section
  function place(slot, oldImgId, cls, html) {
    var el = document.querySelector('.dcStory [data-dc="' + slot + '"]:not([data-dc-done])') ||
      document.querySelector('.dcStory img[src*="' + oldImgId + '"]');
    if (!el) return !!document.querySelector('.' + cls);
    injectCSS();
    var sec = el;
    if (el.tagName === 'IMG') { sec = document.createElement('section'); el.parentNode.replaceChild(sec, el); }
    sec.classList.add(cls);
    sec.setAttribute('data-dc-done', '');
    if (EN) sec.setAttribute('lang', 'en');
    sec.innerHTML = html;
    return true;
  }
  function concept() {
    return place('concept', CONCEPT.image, 'dcConcept',
      '<div><h2 class="dcConcept-h">' + CONCEPT.heading + '</h2>' +
      '<div class="dcConcept-rule"><i></i></div>' +
      '<p class="dcConcept-p">' + CONCEPT.body + '</p></div>');
  }
  function flow() {
    return place('flow', '6aacae74296a9/', 'dcFlow',
      '<h2 class="dcFlow-h">' + FLOW.heading + '</h2>' +
      (FLOW.sub ? '<p class="dcFlow-sub">' + FLOW.sub + '</p>' : '') +
      '<div class="dcConcept-rule"><i></i></div>' +
      '<ol>' + FLOW.steps.map(function (st, i) {
        return '<li><span class="dcFlow-no">0' + (i + 1) + '</span><span><span class="dcFlow-t">' + st[0] +
          '</span><span class="dcFlow-d">' + st[1] + '</span></span></li>';
      }).join('') + '</ol>' +
      '<p class="dcFlow-note">' + FLOW.note + '</p>');
  }
  function all() { var a = concept(), b = flow(); return a && b; }

  function boot() {
    if (document.body.id !== 'shopTopPage') return;
    injectLayout();
    if (all()) return;
    if ('MutationObserver' in window) {
      var mo = new MutationObserver(function () { if (all()) mo.disconnect(); });
      mo.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(function () { mo.disconnect(); }, 15000);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
