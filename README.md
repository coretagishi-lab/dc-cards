# dc-cards

Driver's Collection の販売サイトと、LPギャラリー（3Dトレカ）用の素材置き場。GitHub Pagesで公開。

## 販売サイト（2026-11-19〜、BASEの代わり）
- `index.html` / `item.html` … 販売サイトのトップと商品ページ（https://coretagishi-lab.github.io/dc-cards/）。BASEのページと同じ作り（body#shopTopPage / #shopDetailPage）にしてあり、下の旧BASE用スクリプト（dc3d・site・line-cta・lp-copy・item）がBASE上と同じ見た目に整える。LPの写真は今はBASEに登録した画像を表示している（BASEを閉じる前にリポジトリへ移す）
- `law.html` … 特定商取引法に基づく表記 ／ `privacy.html` … プライバシーポリシー ／ `shop.css` … 3ページ共通の見た目
- `shop-config.js` … Stripe の決済リンクと Instagram DM の URL。リンクを差し替えるときはここだけ書き換える
- `base/lp-script.html` は旧BASEショップ用（BASEを閉じたら不要）

- `cards.json` … 表示するカードと並び順（上から順に表示）
- `cards/<slug>/front.webp` … 表面（幅760）
- `cards/<slug>/silver.webp` … 銀ホロ箔の範囲（白=光る）
- `cards/<slug>/gold.webp` … 純金フレーム箔の範囲
- `back/` … 全カード共通の裏面

Web用に軽くしたファイルのみ。印刷用の元データは置かない。

- `cards/<slug>/mid.webp` … 中サイズ（幅420、英語版トップの見出し用）
- `dc3d.js` … 3Dギャラリー本体。トップページで `site.js` `line-cta.js` `lp-copy.js` を読み込む
- `item.js` / `item.css` … 商品ページの装い。`site.js` `line-cta.js` を読み込む
- `line-cta.js` … 無料ラフのボタン（トップ・商品ページ・固定バー）。日本語はLINE、英語はInstagram DMへ
- `lp-copy.js` … トップのコンセプト（文字入り画像を文字に置き換え）
- `site.js` … 左上の JP/EN 切り替え、商品ページの戻る矢印、英語版の画像差し替え
- `base/lp-script.html` … BASEテンプレートの一番下（`</body>` の直前）に入れるLPの差し込みスクリプト。各パーツの高さを先に確保して、読み込み中に画面がズレない（CLS）ようにしてある

## 英語版
- 言語の決まり方：`?lang=en` / `?lang=ja` ＞ 前回選んだ言語 ＞ スマホの言語（日本語以外なら英語）
- 英語版の問い合わせ先は Instagram DM（`ig.me/m/drivers_collection_`）。日本在住の人向けに「LINEはこちら」も併記
- 英語の文章は各ファイルの中（`site.js` のトップ見出し・流れ、`lp-copy.js` のコンセプト、`line-cta.js` のボタン、`item.js` の商品説明）

## デザイン番号
- `cards.json` の各カードの `design`（例：`No.01`）がデザイン番号。ギャラリーとセミオーダーのデザイン選択に表示され、注文の「デザイン」欄にもこの番号が入る
- 番号は一度付けたら変えない（並び順を変えても番号はそのデザインに付いたまま）。新しいデザインは続き番号にする

## outreach/ (営業記録アプリ)
Instagram営業のカウンター・顧客リスト・リマインド。データは端末のIndexedDBに置き、ログインすると Supabase（ぺたろぐと同じプロジェクト）の dcout_people と非公開バケット dcout にも保存して、別の端末と同期する。開いている時間は desk_activity（DESK）に記録。AIは端末に保存したAPIキーでHaiku 4.5を直接呼ぶ。キーやデータはリポジトリに含めない。
