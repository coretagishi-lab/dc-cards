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

  var LABELS = { 'フルオーダー': 'Full Order', 'セミオーダー': 'Semi Order' };
  var SUBS = { 'フルオーダー': 'あなたの愛車のためだけに、ゼロから。', 'セミオーダー': '掲載デザインを、あなたの愛車で。' };
  var ROOT = (document.currentScript && document.currentScript.src) ? document.currentScript.src.replace(/[^/]*(\?.*)?$/, '') : 'https://coretagishi-lab.github.io/dc-cards/';
  var TRUST = [
    ['<path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.4 7.2 17.9l.9-5.4L4.2 8.7l5.4-.8z"/>', '一点物<br>完全ハンドメイド'],
    ['<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', '納期<br>約1ヶ月'],
    ['<path d="M4.5 6.5h15v9h-8l-4 3v-3h-3z"/><path d="M8.5 10.5h7M8.5 13h4"/>', '公式LINEで<br>デザイン確認']
  ];

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
  var LINE_CHOICE = 'LINEで相談して決める';

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
      if (/デザイン/.test(labels[i].textContent)) {
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
      box.innerHTML = '<div class="dcPick-head"><p class="dcPick-h">デザインを選ぶ</p><p class="dcPick-sel">選択中：<b>未選択</b></p></div>' +
        '<div class="dcPick-grid" role="radiogroup" aria-label="デザイン">' + list.map(function (d) {
          return '<button type="button" class="dcPick-item" role="radio" aria-checked="false" data-slug="' + d.slug + '">' +
            '<span class="dcPick-img"><img src="' + d.thumb + '" alt="" loading="lazy" decoding="async"></span>' +
            '<span class="dcPick-name">' + d.label + '</span></button>';
        }).join('') +
        '<button type="button" class="dcPick-item dcPick-item--line" role="radio" aria-checked="false" data-slug="__line">' +
        '<span class="dcPick-img"><span class="dcPick-q">?</span></span><span class="dcPick-name">' + LINE_CHOICE + '</span></button></div>' +
        (field ? '' : '<p class="dcPick-note">ご注文後、公式LINEで選んだデザイン名をお知らせください。</p>');

      var anchor = purchase.querySelector('#purchase_form');
      if (anchor) anchor.parentNode.insertBefore(box, anchor);
      else { var price = purchase.querySelector('.itemPrice'); if (!price) return; after(price, box); }

      if (field && field.tagName !== 'SELECT' && !field.value) field.placeholder = '上のデザインから選ぶと自動で入ります';

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
        sel.textContent = value;
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

    if (h1) {
      h1.parentNode.insertBefore(el('p', 'dcItem-eyebrow', key ? LABELS[key] : "Driver's Collection"), h1);
      var rule = el('div', 'dcItem-rule');
      after(h1, rule);
      if (key) after(h1, el('p', 'dcItem-sub', SUBS[key]));
    }

    var desc = main.querySelector('.itemDescription');
    var purchase = main.querySelector('.purchase');
    if (desc && purchase) {
      after(purchase, desc);
      structure(desc);
    }

    // BASE's report link: keep it (required), but at the very bottom of the page
    var report = document.getElementById('reportBtn');
    if (report) main.appendChild(report);

    if (key === 'セミオーダー' && purchase) designPicker(purchase);

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

  function start() { run(); loadRoughCta(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
