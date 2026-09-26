/*! Driver's Collection — "free rough design via LINE" buttons for the top page (line-cta.js)
 * Adds two call-to-action blocks to the BASE top page:
 *   1) right after the gallery   (after .dcScroll, or after [data-dc3d] once the 3D gallery is in)
 *   2) right before the products (before #mainContent)
 * Usage (paste once before </body> in the BASE theme):
 *   <script src="https://coretagishi-lab.github.io/dc-cards/line-cta.js"
 *           data-line-url="https://lin.ee/XXXXXXX" data-slots="今月の制作枠 残り2枠" defer></script>
 * data-line-url : LINE friend-add URL. If omitted, the first lin.ee / line.me link on the page is used.
 * data-slots    : optional small badge text (e.g. remaining slots). Leave out to hide the badge.
 * Clarity event : dc_line_cta_gallery / dc_line_cta_products
 */
(function () {
  'use strict';
  if (window.__dcLineCta) return;
  window.__dcLineCta = true;

  var me = document.currentScript;
  var cfgUrl = me && me.getAttribute('data-line-url');
  var slots = me && me.getAttribute('data-slots');

  var CSS = [
    '.dcLine{box-sizing:border-box;max-width:560px;margin:28px auto;padding:0 16px;font-family:"Hiragino Sans","Noto Sans JP",system-ui,sans-serif;color:#ede6d6;text-align:center}',
    '.dcLine *{box-sizing:border-box}',
    '.dcLine-box{position:relative;padding:26px 20px 22px;border:1px solid rgba(201,162,74,.45);border-radius:18px;background:linear-gradient(180deg,rgba(201,162,74,.10),rgba(10,10,12,.92) 60%);box-shadow:0 10px 40px rgba(0,0,0,.45)}',
    '.dcLine-badge{display:inline-block;margin:0 0 12px;padding:3px 12px;border-radius:999px;border:1px solid rgba(235,210,143,.6);color:#ebd28f;font-size:11px;letter-spacing:.14em}',
    '.dcLine-eyebrow{margin:0 0 6px;font-size:11px;letter-spacing:.32em;color:#c9a24a}',
    '.dcLine-h{margin:0 0 10px;font-size:20px;line-height:1.5;font-weight:700;letter-spacing:.04em;color:#f3e7c4}',
    '.dcLine-p{margin:0 0 18px;font-size:13px;line-height:1.85;color:#bdb5a3}',
    '.dcLine-steps{display:flex;justify-content:center;gap:6px;margin:0 0 18px;padding:0;list-style:none;font-size:11px;color:#d9cfb6}',
    '.dcLine-steps li{flex:1;max-width:120px;padding:8px 4px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(201,162,74,.18);line-height:1.5}',
    '.dcLine-steps b{display:block;color:#ebd28f;font-size:10px;letter-spacing:.12em;font-weight:500}',
    '.dcLine-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;max-width:340px;margin:0 auto;padding:15px 20px;border-radius:999px;background:#06c755;color:#fff!important;font-size:15px;font-weight:700;letter-spacing:.06em;text-decoration:none!important;box-shadow:0 8px 26px rgba(6,199,85,.28);animation:dcLinePulse 2.6s ease-in-out infinite}',
    '.dcLine-btn:active{transform:scale(.98)}',
    '.dcLine-btn svg{width:24px;height:24px;flex:none}',
    '.dcLine-note{margin:10px 0 0;font-size:11px;color:#8e8676}',
    '.dcLine--slim .dcLine-box{padding:20px 18px 18px}',
    '.dcLine--slim .dcLine-h{font-size:17px}',
    '@keyframes dcLinePulse{0%,100%{box-shadow:0 8px 26px rgba(6,199,85,.22)}50%{box-shadow:0 8px 34px rgba(6,199,85,.5)}}',
    '@media (prefers-reduced-motion:reduce){.dcLine-btn{animation:none}}'
  ].join('');

  var ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.5s5.9-3.5 8.1-6c1.5-1.6 2.2-3.3 2.2-4.8C22 6.6 17.5 3 12 3z"/><path fill="#06c755" d="M8.6 13.4H6.8a.5.5 0 0 1-.5-.5V9.3a.5.5 0 0 1 1 0v3.1h1.3a.5.5 0 0 1 0 1zm1.9-.5a.5.5 0 0 1-1 0V9.3a.5.5 0 0 1 1 0zm4.4 0a.5.5 0 0 1-.9.3l-1.8-2.5v2.2a.5.5 0 0 1-1 0V9.3a.5.5 0 0 1 .9-.3l1.8 2.5V9.3a.5.5 0 0 1 1 0zm2.9-2.3a.5.5 0 0 1 0 1h-1.3v.8h1.3a.5.5 0 0 1 0 1h-1.8a.5.5 0 0 1-.5-.5V9.3a.5.5 0 0 1 .5-.5h1.8a.5.5 0 0 1 0 1h-1.3v.8z"/></svg>';

  function track(name) { try { if (typeof window.clarity === 'function') window.clarity('event', name); } catch (_) {} }

  function lineUrl() {
    if (cfgUrl) return cfgUrl;
    var a = document.querySelector('a[href*="lin.ee"],a[href*="line.me"]');
    return a ? a.href : '';
  }

  function block(kind, url) {
    var wrap = document.createElement('section');
    wrap.className = 'dcLine' + (kind === 'products' ? ' dcLine--slim' : '');
    wrap.setAttribute('data-dc-line', kind);
    var badge = slots ? '<p class="dcLine-badge">' + slots + '</p>' : '';
    var body = kind === 'gallery'
      ? '<p class="dcLine-eyebrow">FREE ROUGH DESIGN</p>' +
        '<h3 class="dcLine-h">購入前に、無料でラフデザイン</h3>' +
        '<p class="dcLine-p">愛車の写真を送るだけ。<br>あなたの車がどんな一枚になるか、<br>先にお見せします。</p>' +
        '<ol class="dcLine-steps"><li><b>STEP 1</b>LINEで<br>写真を送る</li><li><b>STEP 2</b>無料で<br>ラフ作成</li><li><b>STEP 3</b>気に入ったら<br>ご購入</li></ol>'
      : '<h3 class="dcLine-h">迷ったら、まず無料ラフから</h3>' +
        '<p class="dcLine-p">仕上がりを見てから決められます。<br>ご質問だけでもお気軽にどうぞ。</p>';
    wrap.innerHTML = '<div class="dcLine-box">' + badge + body +
      '<a class="dcLine-btn" href="' + url + '" target="_blank" rel="noopener">' + ICON + '<span>LINEで無料ラフを依頼する</span></a>' +
      '<p class="dcLine-note">写真1枚でOK・購入の義務はありません</p></div>';
    wrap.querySelector('a').addEventListener('click', function () { track('dc_line_cta_' + kind); });
    return wrap;
  }

  function place() {
    if (document.body.id !== 'shopTopPage') return true;   // top page only
    var url = lineUrl();
    if (!url) return false;                                // wait for the LINE link to appear

    if (!document.getElementById('dcLineCss')) {
      var st = document.createElement('style');
      st.id = 'dcLineCss';
      st.textContent = CSS;
      document.head.appendChild(st);
    }

    var done = true;
    if (!document.querySelector('[data-dc-line="gallery"]')) {
      var g = document.querySelector('[data-dc3d]') || document.querySelector('.dcScroll');
      if (g) g.parentNode.insertBefore(block('gallery', url), g.nextSibling);
      else done = false;
    }
    if (!document.querySelector('[data-dc-line="products"]')) {
      var m = document.getElementById('mainContent');
      if (m) m.parentNode.insertBefore(block('products', url), m);
      else done = false;
    }
    return done;
  }

  function boot() {
    if (place()) return;
    // the LP and the LINE widget are inserted after load, so keep looking for a while
    if ('MutationObserver' in window) {
      var mo = new MutationObserver(function () { if (place()) mo.disconnect(); });
      mo.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(function () { mo.disconnect(); }, 20000);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
