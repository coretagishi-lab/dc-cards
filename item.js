/*! Driver's Collection — product page enhancements (item.js)
 * Loaded only on BASE item pages. Pairs with item.css.
 * - English eyebrow + gold rule above the title
 * - moves the description below the purchase box and turns ＜見出し＞ lines into an accordion
 * - trust points under the purchase button (order items only)
 */
(function () {
  'use strict';
  if (window.__dcItem) return;
  window.__dcItem = true;

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

  var LABELS = { 'フルオーダー': 'Full Order', 'セミオーダー': 'Semi Order' };
  var SUBS = EN
    ? { 'フルオーダー': 'Designed from scratch, only for your car.', 'セミオーダー': 'Our designs, made with your car.' }
    : { 'フルオーダー': 'あなたの愛車のためだけに、ゼロから。', 'セミオーダー': '掲載デザインを、あなたの愛車で。' };
  var ROOT = (document.currentScript && document.currentScript.src) ? document.currentScript.src.replace(/[^/]*(\?.*)?$/, '') : 'https://coretagishi-lab.github.io/dc-cards/';
  var TRUST = [
    ['<path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.4 7.2 17.9l.9-5.4L4.2 8.7l5.4-.8z"/>', EN ? 'One of one<br>fully handmade' : '一点物<br>完全ハンドメイド'],
    ['<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', EN ? 'Ready in<br>about a month' : '納期<br>約1ヶ月'],
    ['<path d="M4.5 6.5h15v9h-8l-4 3v-3h-3z"/><path d="M8.5 10.5h7M8.5 13h4"/>', EN ? 'Design check<br>by DM' : '公式LINEで<br>デザイン確認']
  ];

  // English descriptions (the BASE description stays Japanese; EN visitors see these instead)
  var IG = '<a href="https://ig.me/m/drivers_collection_" target="_blank" rel="noopener">Instagram DM (@drivers_collection_)</a>';
  var EN_COMMON = [
    ['Photos of your car', ['We take care of the editing: removing number plates and reflections in the windows, improving image quality, and more. Photos with people in them are fine too, so just send what you have.']],
    ['The case', ['Your card arrives sealed in a grading-card case. The card can be taken out, so you can enjoy it however you like, even behind your phone case.']],
    ['Packaging', ['Delivered in a Driver\'s Collection gift box, ready to give as a special present.']],
    ['Delivery time', ['About one month (design: about 10 days / making: about 2 weeks / shipping prep: 1\u20133 days).', 'You will see the finished design before we make it, and changes are possible. We\'ll message you when it ships. In a hurry? Just ask.']],
    ['Shipping outside Japan', ['We ship outside Japan too. International shipping is charged separately, depending on your country. Send us a DM and we\'ll tell you the cost before you order.', 'Import duties or taxes in your country, if any, are not included.']],
    ['Display (+\u00A510,000)', ['A wall-mounted display with built-in lighting is also available, to show your card in an even more special way.']]
  ];
  var EN_DESC = {
    'フルオーダー': {
      lead: ['Your car, turned into a trading card artwork that exists only once in the world.', 'This is not a template. We design your card from scratch, just for your car.', 'If you have a look in mind, we\'ll get as close to it as we can. If not, you can leave everything to us.', 'Every card is finished by hand by our craftsmen.'],
      secs: [
        ['After you order', ['Send us photos of your car and your ideas by ' + IG + ', or by LINE if you live in Japan. Tell us the colors and mood you have in mind.']],
        ['About the design', ['The gold frame is shared by every Driver\'s Collection card and can\'t be changed. The typeface is up to you.', 'We can\'t create designs that use other people\'s trademarks or copyrighted works, such as anime characters, unless you already have permission to use the material (for example, an itasha livery). If there is a design you really want, ask us by DM first.']],
        EN_COMMON[0],
        ['The certification tag', ['The certification tag at the top of the card is gold, a mark reserved for Full Order clients only.']]
      ].concat(EN_COMMON.slice(1))
    },
    'セミオーダー': {
      lead: ['Your car, as a one-of-one card in the design you choose.', 'Pick any design from our gallery or our Instagram, and we\'ll make it with your car.', 'Semi Orders are handmade by our craftsmen just like Full Orders. The finish quality is exactly the same.'],
      secs: [
        ['After you order', ['Send us photos of your car and the design you chose by ' + IG + ', or by LINE if you live in Japan. Pick from the designs in our gallery or on our Instagram.']],
        ['About the design', ['We build your card on the design you picked.', 'The gold frame is shared by every card and can\'t be changed. Changing the typeface is available with Full Order only.', 'Want a design made from scratch? Choose Full Order.']],
        EN_COMMON[0],
        ['The certification tag', ['The certification tag at the top of the card is silver. Gold is reserved for Full Orders.']]
      ].concat(EN_COMMON.slice(1))
    }
  };
  function enDescription(desc, key) {
    var d = EN_DESC[key];
    if (!d) return;
    var ps = function (arr) { return arr.map(function (t) { return '<p>' + t + '</p>'; }).join(''); };
    desc.innerHTML = '<div class="dcItem-lead">' + ps(d.lead) + '</div><div class="dcItem-secs">' +
      d.secs.map(function (s, i) {
        return '<details class="dcItem-sec"><summary><span class="dcItem-no">' + (i < 9 ? '0' : '') + (i + 1) +
          '</span><span class="dcItem-h">' + s[0] + '</span></summary><div class="dcItem-body">' + ps(s[1]) + '</div></details>';
      }).join('') + '</div>';
    desc.classList.add('dcItem-desc');
    desc.setAttribute('lang', 'en');
  }

  // EN: relabel BASE's purchase form (labels only; submitted values stay as they are)
  function enForm(purchase) {
    var map = { 'デザイン': 'Design', 'ディスプレイ': 'Display', '数量': 'Quantity' };
    Array.prototype.forEach.call(purchase.querySelectorAll('label'), function (l) {
      var t = l.textContent.trim();
      if (map[t] && l.children.length === 0) l.textContent = map[t];
    });
    Array.prototype.forEach.call(purchase.querySelectorAll('option[value]'), function (o) {
      if (o.text.trim() === '選択なし') o.text = 'None';
      else if (o.text.indexOf('ディスプレイ') === 0) o.text = o.text.replace('ディスプレイ', 'Display');
    });
    // BASE's notice lines under the price (only the ones we know)
    var notes = { 'この商品は送料無料です。': 'Free shipping within Japan.', '海外への発送について': 'About international shipping' };
    Array.prototype.forEach.call(purchase.querySelectorAll('#itemAttention .attention, #itemAttention .attention a'), function (n) {
      var t = n.textContent.trim();
      if (notes[t] && n.children.length === 0) n.textContent = notes[t];
    });
    Array.prototype.forEach.call(purchase.querySelectorAll('button, input[type="submit"]'), function (b) {
      if (b.tagName === 'INPUT') { if (b.value === 'カートに入れる') b.value = 'Add to cart'; return; }
      if (b.children.length === 0 && b.textContent.trim() === 'カートに入れる') b.textContent = 'Add to cart';
    });
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function after(ref, node) { ref.parentNode.insertBefore(node, ref.nextSibling); }

  function paragraphs(lines) {
    var out = [], buf = [];
    lines.forEach(function (l) {
      if (l === '') { if (buf.length) { out.push(buf.join('<br>')); buf = []; } }
      else buf.push(l);
    });
    if (buf.length) out.push(buf.join('<br>'));
    return out.map(function (h) { return '<p>' + h + '</p>'; }).join('');
  }

  // ＜見出し＞ / 【見出し】 / ■見出し lines become accordion sections
  function structure(desc) {
    var p = desc.querySelector('p');
    if (!p) return;
    var html = p.innerHTML;
    var lines = (/<br/i.test(html) ? html.split(/<br\s*\/?>/i) : html.split(/\n/)).map(function (s) { return s.trim(); });
    var head = /^(?:＜|【|■|◆|&lt;)\s*(.+?)\s*(?:＞|】|&gt;)?$/;
    var texts = lines.map(function (l) { return l.replace(/<[^>]+>/g, '').trim(); });
    var marked = texts.some(function (t) { return t.length <= 40 && head.test(t); });
    // without ＜＞ markers: a short line with no 。 that sits after a blank line and before text
    function plainHead(i) {
      var t = texts[i];
      return t && t.length <= 26 && !/[。．！？!?]/.test(t) && i > 0 && texts[i - 1] === '' && !!texts[i + 1];
    }
    var lead = [], secs = [], cur = null;
    lines.forEach(function (line, i) {
      var text = texts[i];
      var m = marked ? (text.length <= 40 ? head.exec(text) : null) : (plainHead(i) ? [text, text] : null);
      if (m) { cur = { title: m[1], body: [] }; secs.push(cur); return; }
      (cur ? cur.body : lead).push(line);
    });
    if (!secs.length) return;
    var html = '';
    if (lead.join('').trim()) html += '<div class="dcItem-lead">' + paragraphs(lead) + '</div>';
    html += '<div class="dcItem-secs">' + secs.map(function (s, i) {
      return '<details class="dcItem-sec"><summary><span class="dcItem-no">' + (i < 9 ? '0' : '') + (i + 1) +
        '</span><span class="dcItem-h">' + s.title + '</span></summary><div class="dcItem-body">' +
        paragraphs(s.body) + '</div></details>';
    }).join('') + '</div>';
    desc.innerHTML = html;
    desc.classList.add('dcItem-desc');
  }

  // bxSlider grabs every touch on the photo, so the page can't scroll from there.
  // Keep touches away from it and do a simple horizontal swipe ourselves.
  function freeSliderTouch() {
    var ul = document.getElementById('slideImg');
    if (!ul) return;
    ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'pointerdown', 'pointermove', 'pointerup',
      'pointercancel', 'MSPointerDown', 'MSPointerMove', 'MSPointerUp'].forEach(function (t) {
      ul.addEventListener(t, function (e) { e.stopPropagation(); }, { passive: true });
    });
    var sx = 0, sy = 0, st = 0, tracking = false, swiped = false;
    function go(dir) {
      if (!document.querySelector('.bx-wrapper')) return;
      var links = Array.prototype.slice.call(document.querySelectorAll('#slideImgPager a[data-slide-index]'));
      if (links.length < 2) return;
      var cur = 0;
      links.forEach(function (a, i) { if (a.classList.contains('active')) cur = i; });
      links[(cur + dir + links.length) % links.length].click();
    }
    ul.addEventListener('touchstart', function (e) {
      var t = e.touches[0];
      sx = t.clientX; sy = t.clientY; st = Date.now(); tracking = e.touches.length === 1; swiped = false;
    }, { passive: true });
    ul.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3 && Date.now() - st < 800) {
        swiped = true;
        go(dx < 0 ? 1 : -1);
      }
    }, { passive: true });
    // a swipe shouldn't also open the enlarged photo
    ul.addEventListener('click', function (e) {
      if (swiped) { swiped = false; e.preventDefault(); e.stopPropagation(); }
    }, true);
  }


  // ---------- semi order: choose the design ----------
  // Writes the choice into BASE's option field whose label contains 「デザイン」 (text or pulldown),
  // so the order shows which design was picked. ?design=<slug> (from the 3D gallery) pre-selects it.
  var LINE_CHOICE = EN ? 'Decide by DM' : 'LINEで相談して決める';
  var LINE_CHOICE_LABEL = EN ? 'Not sure?<br>Decide with us by DM' : LINE_CHOICE;
  function designHTML(label) {
    var m = /^No\.?\s*(\d+)$/i.exec(label || '');
    return m ? '<span class="dcNo"><span class="dcNo-mark">N\u00BA</span><span class="dcNo-num">' + m[1] + '</span></span>' : label;
  }

  function fieldFor(label) {
    if (label.htmlFor) { var byId = document.getElementById(label.htmlFor); if (byId) return byId; }
    var n = label.nextElementSibling, k = 0;
    while (n && k < 5) {
      if (/^(INPUT|SELECT|TEXTAREA)$/.test(n.tagName)) return n;
      var inner = n.querySelector && n.querySelector('input:not([type="hidden"]),select,textarea');
      if (inner) return inner;
      if (n.tagName === 'LABEL') break;
      n = n.nextElementSibling; k++;
    }
    return null;
  }
  function findDesignField(scope) {
    var labels = scope.querySelectorAll('label');
    for (var i = 0; i < labels.length; i++) {
      if (/デザイン|^\s*design\s*$/i.test(labels[i].textContent)) {
        var f = fieldFor(labels[i]);
        if (f) return f;
      }
    }
    return null;
  }
  function setField(input, value) {
    if (!input) return;
    if (input.tagName === 'SELECT') {
      var hit = null;
      Array.prototype.forEach.call(input.options, function (o) {
        if (!hit && value && (o.value === value || o.text.indexOf(value) >= 0)) hit = o;
      });
      if (!hit) return;
      input.value = hit.value;
    } else {
      var proto = Object.getPrototypeOf(input);
      var desc = Object.getOwnPropertyDescriptor(proto, 'value');
      if (desc && desc.set) desc.set.call(input, value); else input.value = value;
    }
    ['input', 'change'].forEach(function (t) {
      var ev;
      try { ev = new Event(t, { bubbles: true }); } catch (_) { ev = document.createEvent('Event'); ev.initEvent(t, true, true); }
      input.dispatchEvent(ev);
    });
  }
  // show the chosen design as the first product photo
  function showDesign(d) {
    var first = document.querySelector('#slideImg > li');
    if (!first) return;
    var img = first.querySelector('img'), a = first.querySelector('a');
    var pagerImg = document.querySelector('#slideImgPager a[data-slide-index="0"] img');
    if (!first.__dcOrig) first.__dcOrig = { src: img && img.src, href: a && a.href, thumb: pagerImg && pagerImg.src };
    var o = first.__dcOrig;
    if (img) img.src = d ? d.front : o.src;
    if (a) a.href = d ? d.front : o.href;
    if (pagerImg) pagerImg.src = d ? d.thumb : o.thumb;
    var p0 = document.querySelector('#slideImgPager a[data-slide-index="0"]');
    if (p0 && document.querySelector('.bx-wrapper') && !p0.classList.contains('active')) p0.click();
    if (img) img.addEventListener('load', function () {
      try { window.dispatchEvent(new Event('resize')); } catch (_) {}
    }, { once: true });
  }

  function designPicker(purchase) {
    fetch(ROOT + 'cards.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (json) {
      var list = (json.cards || []).filter(function (c) { return !c.hidden; }).map(function (c) {
        return { slug: c.slug, label: c.design || c.name, car: c.design ? c.name : '',
          front: ROOT + (c.front || 'cards/' + c.slug + '/front.webp'), thumb: ROOT + 'cards/' + c.slug + '/thumb.webp' };
      });
      if (!list.length) return;
      var field = findDesignField(purchase);

      var box = el('section', 'dcPick');
      box.innerHTML = '<div class="dcPick-head"><p class="dcPick-h">' + (EN ? 'Choose a design' : 'デザインを選ぶ') + '</p><p class="dcPick-sel">' + (EN ? 'Selected: <b>none</b>' : '選択中：<b>未選択</b>') + '</p></div>' +
        '<div class="dcPick-grid" role="radiogroup" aria-label="' + (EN ? 'Design' : 'デザイン') + '">' + list.map(function (d) {
          return '<button type="button" class="dcPick-item" role="radio" aria-checked="false" data-slug="' + d.slug + '">' +
            '<span class="dcPick-img"><img src="' + d.thumb + '" alt="" loading="lazy" decoding="async"></span>' +
            '<span class="dcPick-name">' + designHTML(d.label) + '</span></button>';
        }).join('') +
        '<button type="button" class="dcPick-item dcPick-item--line" role="radio" aria-checked="false" data-slug="__line">' +
        '<span class="dcPick-img"><span class="dcPick-q">?</span></span><span class="dcPick-name">' + LINE_CHOICE_LABEL + '</span></button></div>' +
        (field ? '' : '<p class="dcPick-note">' + (EN ? 'After ordering, please tell us the design number by DM.' : 'ご注文後、公式LINEで選んだデザイン名をお知らせください。') + '</p>');

      var anchor = purchase.querySelector('#purchase_form');
      if (anchor) anchor.parentNode.insertBefore(box, anchor);
      else { var price = purchase.querySelector('.itemPrice'); if (!price) return; after(price, box); }

      if (field && field.tagName !== 'SELECT' && !field.value) field.placeholder = EN ? 'Pick a design above and it fills in here' : '上のデザインから選ぶと自動で入ります';

      var sel = box.querySelector('.dcPick-sel b');
      function choose(slug, fromUser) {
        var d = null;
        list.forEach(function (x) { if (x.slug === slug) d = x; });
        var isLine = slug === '__line';
        if (!d && !isLine) return;
        Array.prototype.forEach.call(box.querySelectorAll('.dcPick-item'), function (b) {
          var on = b.getAttribute('data-slug') === slug;
          b.classList.toggle('is-on', on);
          b.setAttribute('aria-checked', on ? 'true' : 'false');
        });
        var value = isLine ? LINE_CHOICE : d.label;
        sel.innerHTML = isLine ? value : designHTML(value);
        setField(field, value);
        showDesign(isLine ? null : d);
        if (fromUser) { try { if (typeof window.clarity === 'function') window.clarity('event', 'dc_pick_design'); } catch (_) {} }
      }
      box.addEventListener('click', function (e) {
        var b = e.target.closest('.dcPick-item');
        if (b) choose(b.getAttribute('data-slug'), true);
      });
      var m = /[?&]design=([^&#]+)/.exec(location.search);
      if (m) choose(decodeURIComponent(m[1]), false);
    }).catch(function () {});
  }

  function run() {
    if (document.body.id !== 'shopDetailPage') return;
    var main = document.getElementById('mainContent');
    if (!main) return;

    freeSliderTouch();

    var h1 = main.querySelector('h1.itemTitle');
    var title = h1 ? h1.textContent.trim() : '';
    var key = null;
    Object.keys(LABELS).forEach(function (k) { if (!key && title.indexOf(k) === 0) key = k; });

    if (key) document.body.setAttribute('data-dc-kind', key === 'セミオーダー' ? 'semi' : 'full');
    if (h1) {
      // EN: the title itself becomes English, so the eyebrow shows the brand instead
      if (EN && key && h1.children.length === 0) h1.textContent = LABELS[key];
      h1.parentNode.insertBefore(el('p', 'dcItem-eyebrow', key && !EN ? LABELS[key] : "Driver's Collection"), h1);
      var rule = el('div', 'dcItem-rule');
      after(h1, rule);
      if (key) after(h1, el('p', 'dcItem-sub', SUBS[key]));
    }

    var desc = main.querySelector('.itemDescription');
    var purchase = main.querySelector('.purchase');
    if (desc && purchase) {
      after(purchase, desc);
      if (EN && key) enDescription(desc, key); else structure(desc);
    }

    // BASE's report link: keep it (required), but at the very bottom of the page
    var report = document.getElementById('reportBtn');
    if (report) main.appendChild(report);

    if (key === 'セミオーダー' && purchase) designPicker(purchase);
    if (EN && purchase) { enForm(purchase); setTimeout(function () { enForm(purchase); }, 1500); }

    if (key && purchase) {
      var list = el('ul', 'dcItem-trust', TRUST.map(function (t) {
        return '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          t[0] + '</svg><span>' + t[1] + '</span></li>';
      }).join(''));
      var anchor = purchase.querySelector('.purchaseButton') || purchase.querySelector('#purchase_form') || purchase.querySelector('.itemPrice');
      if (anchor) after(anchor, list);
    }
  }

  // free-rough / consultation buttons (LINE) live in line-cta.js
  function loadRoughCta() {
    if (window.DCRough || document.querySelector('script[src*="line-cta.js"]')) return;
    var s = document.createElement('script');
    s.src = ROOT + 'line-cta.js';
    s.async = true;
    document.head.appendChild(s);
  }

  // language toggle + back arrow live in site.js
  function loadSite() {
    if (window.__dcSite || document.querySelector('script[src*="site.js"]')) return;
    var s = document.createElement('script');
    s.src = ROOT + 'site.js';
    s.async = true;
    document.head.appendChild(s);
  }

  function start() { run(); loadSite(); loadRoughCta(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
