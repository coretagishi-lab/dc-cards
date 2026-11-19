/*! Driver's Collection — 販売サイトの設定（ここだけ書き換えればリンクが変わります）
 * Stripe の決済リンクは Stripe ダッシュボードで作ったもの（2026-11-19 作成）。差し替えるときは URL だけ書き換える。
 */
window.DC_SHOP = {
  // 決済リンク（Stripe Payment Links）
  stripe: {
    full:  'https://buy.stripe.com/5kQ28s4BH2II9pb1br1VK00',  // フルオーダー ¥50,000
    frame: 'https://buy.stripe.com/4gMbJ2b05bfe58VbQ51VK01'   // フルオーダー＋光る額縁ディスプレイ ¥60,000
  },
  // サイトで使える支払い方法（Stripe の決済画面で使えるもの）。Stripe 側で増やしたら、ここに1行足すだけで各ページの表記が変わる
  payMethods: [
    { ja: 'クレジットカード', en: 'credit card' }
  ],
  // 相談・購入後の連絡先（Instagram DM）
  igHandle: 'drivers_collection_',
  igDm: 'https://ig.me/m/drivers_collection_',
  igProfile: 'https://www.instagram.com/drivers_collection_/'
};
