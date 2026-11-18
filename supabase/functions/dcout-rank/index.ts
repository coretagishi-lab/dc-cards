// ドラコレ営業：ランク（A/B/C/D/F）をふわが読み書きするための入口。
// 読む：  GET  …/dcout-rank?k=合言葉              （表の画面）
//         GET  …/dcout-rank?k=合言葉&format=json  （機械向け）  format=csv も可
// 提案：  GET/POST …/dcout-rank?k=合言葉&u=@ユーザー名&to=B&note=メモ
//         まとめて： …&bulk=ユーザー名 B メモ（1行1件。改行かカンマ区切り）
// ふわが書けるのは「提案」だけ。確定は本人がアプリで行う。
import { createClient } from "jsr:@supabase/supabase-js@2";

const RANKS = ["A", "B", "C", "D", "F"] as const;
const RL: Record<string, string> = { A: "振込待ち", B: "購入検討中", C: "ラフ作成中", D: "DMでやり取りあり", F: "その他" };
const ST2: Record<string, string> = { img: "画像待ち", info: "内容待ち", rough: "ラフ作成中", post: "投稿待ち", posted: "投稿済み(終了)", pay: "支払い待ち", make: "作品作成中", shipped: "発送済み(終了)" };
const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const norm = (s: string) => s.trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/[/?#].*$/, "").replace(/^@/, "").toLowerCase();
const jst = (t: string) => new Date(new Date(t).getTime() + 9 * 3600e3).toISOString().slice(5, 16).replace("T", " ");
async function sha(s: string) { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join(""); }

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const p = new Map(url.searchParams);
  if (req.method === "POST") {
    const ct = req.headers.get("content-type") || "";
    try {
      if (ct.includes("json")) for (const [k, v] of Object.entries(await req.json())) p.set(k, String(v));
      else for (const [k, v] of new URLSearchParams(await req.text())) p.set(k, v);
    } catch (_) { /* 無視 */ }
  }
  const html = (body: string, status = 200) => new Response(`<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><meta name=robots content=noindex><title>ドラコレ ランク表</title><style>body{font-family:sans-serif;margin:16px;line-height:1.5}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:4px 6px;font-size:14px;text-align:left}th{background:#f3f3f3}.p{color:#b25400}</style>${body}`, { status, headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex" } });

  const key = p.get("k") || "";
  const { data: kr } = key ? await sb.from("dcout_rank_keys").select("user_id,label").eq("key_hash", await sha(key)).maybeSingle() : { data: null };
  if (!kr) return html("<p>合言葉が違います。</p>", 401);
  const uid = kr.user_id as string;

  const { data: people } = await sb.from("dcout_people").select("id,data").eq("user_id", uid).eq("deleted", false);
  const byName = new Map<string, any>();
  for (const r of people || []) if (r.data?.username) byName.set(norm(r.data.username), r);
  const loadLog = async () => (await sb.from("dcout_rank_log").select("*").eq("user_id", uid).order("at")).data || [];
  let log = await loadLog();
  const state = () => {
    const cur = new Map<string, any>(), pend = new Map<string, any>(), closed = new Set<number>();
    for (const r of log) if (r.ref_id) closed.add(r.ref_id);
    for (const r of log) {
      const pid = r.person_id || "?" + norm(r.username || "");
      if (r.kind === "確定") cur.set(pid, r);
      if (r.kind === "提案" && !closed.has(r.id)) pend.set(pid, r);
    }
    for (const [pid, r] of pend) { const c = cur.get(pid); if (c && c.at > r.at) pend.delete(pid); }
    return { cur, pend };
  };

  // ---- 提案を書く ----
  const lines: [string, string, string][] = [];
  if (p.get("to") && (p.get("u") || p.get("id"))) lines.push([p.get("u") || "", p.get("to")!, p.get("note") || ""]);
  for (const l of (p.get("bulk") || "").split(/[\n,，]/)) { const m = l.trim().match(/^(\S+)\s+([ABCDFabcdf])(?:\s+(.*))?$/); if (m) lines.push([m[1], m[2], m[3] || ""]); }
  const done: string[] = [];
  if (lines.length) {
    const { cur, pend } = state();
    const rows = [];
    for (const [u, to0, note] of lines) {
      const to = to0.toUpperCase();
      if (!RANKS.includes(to as any)) { done.push(`× ${esc(u)}：ランクは A/B/C/D/F のどれかにしてください`); continue; }
      const r = p.get("id") && !u ? (people || []).find((x) => x.id === p.get("id")) : byName.get(norm(u));
      const pid = r ? r.id : "?" + norm(u);
      const now = cur.get(pid)?.to_rank || null, pp = pend.get(pid);
      if (pp && pp.to_rank === to) { done.push(`・${esc(u)}：同じ提案（→${to}）がすでに確認待ちです`); continue; }
      if (now === to) { done.push(`・${esc(u)}：すでに ${to} です`); continue; }
      rows.push({ user_id: uid, person_id: r ? r.id : null, username: r ? r.data.username : norm(u), from_rank: now, to_rank: to, by_who: "ふわ", kind: "提案", note: note || null });
      done.push(`○ ${esc(u)}：${now || "未設定"} → ${to}（${RL[to]}）を提案しました${r ? "" : "（※アプリに該当する相手が見つかりません。ユーザー名を確認してください）"}`);
    }
    if (rows.length) { const { error } = await sb.from("dcout_rank_log").insert(rows); if (error) return html(`<p>保存に失敗しました：${esc(error.message)}</p>`, 500); log = await loadLog(); }
  }

  // ---- 読む ----
  const { cur, pend } = state();
  const list = (people || []).map((r) => {
    const c = cur.get(r.id), q = pend.get(r.id), ev = r.data.events || [];
    return { id: r.id, username: r.data.username, name: r.data.name || "", rank: c?.to_rank || "", rank_at: c?.at || "", rank_by: c?.by_who || "", proposal: q ? { to: q.to_rank, at: q.at, note: q.note || "" } : null, status: ST2[r.data.st2] || "", dm_reply: ev.some((e: any) => e.kind === "reply" && e.ch === "dm") };
  });
  for (const [pid, q] of pend) if (pid.startsWith("?")) list.push({ id: "", username: q.username, name: "（アプリに見つからない）", rank: "", rank_at: "", rank_by: "", proposal: { to: q.to_rank, at: q.at, note: q.note || "" }, status: "", dm_reply: false });
  const ord = (x: any) => (x.rank ? RANKS.indexOf(x.rank) : 9);
  list.sort((a, b) => ord(a) - ord(b) || (b.proposal ? 1 : 0) - (a.proposal ? 1 : 0) || String(a.username).localeCompare(String(b.username)));
  const hist = log.slice(-60).reverse().map((r) => ({ at: r.at, username: r.username, from: r.from_rank, to: r.to_rank, by: r.by_who, kind: r.kind, note: r.note }));

  const fmt = p.get("format");
  if (fmt === "json") return new Response(JSON.stringify({ ranks: RL, accounts: list, history: hist, result: done }, null, 1), { headers: { "content-type": "application/json; charset=utf-8" } });
  if (fmt === "csv") {
    const q = (s: unknown) => `"${String(s ?? "").replace(/"/g, '""')}"`;
    const csv = ["ユーザー名,名前,ランク,ランクの意味,決めた人,決めた日時(日本時間),ふわの提案(確認待ち),提案メモ,状態,DM返信あり"].concat(list.map((x) => [x.username, x.name, x.rank, RL[x.rank] || "未設定", x.rank_by, x.rank_at && jst(x.rank_at), x.proposal?.to || "", x.proposal?.note || "", x.status, x.dm_reply ? "あり" : ""].map(q).join(","))).join("\n");
    return new Response("﻿" + csv, { headers: { "content-type": "text/csv; charset=utf-8" } });
  }
  const cnt = RANKS.map((r) => `${r} ${RL[r]}：${list.filter((x) => x.rank === r).length}人`).join(" ／ ") + ` ／ 未設定：${list.filter((x) => !x.rank).length}人`;
  return html(`<h2>ドラコレ ランク表</h2>${done.length ? `<p><b>今回の書き込み</b><br>${done.join("<br>")}</p>` : ""}<p>${cnt}</p><p class=p>オレンジ＝ふわの提案（本人の確定待ち）</p>
<table><tr><th>ユーザー名</th><th>名前</th><th>ランク</th><th>決めた人・日時</th><th>ふわの提案</th><th>状態</th><th>DM返信</th></tr>${list.map((x) => `<tr><td>@${esc(x.username)}</td><td>${esc(x.name)}</td><td>${x.rank ? `${x.rank} ${RL[x.rank]}` : "未設定"}</td><td>${x.rank_at ? `${esc(x.rank_by)} ${jst(x.rank_at)}` : ""}</td><td class=p>${x.proposal ? `→${x.proposal.to} ${esc(x.proposal.note)}` : ""}</td><td>${esc(x.status)}</td><td>${x.dm_reply ? "あり" : ""}</td></tr>`).join("")}</table>
<h3>変更履歴（新しい順・最大60件）</h3><table><tr><th>日時(日本時間)</th><th>相手</th><th>変更</th><th>誰が</th><th>種類</th><th>メモ</th></tr>${hist.map((h) => `<tr><td>${jst(h.at)}</td><td>@${esc(h.username)}</td><td>${h.from || "未設定"} → ${h.to}</td><td>${esc(h.by)}</td><td>${h.kind}</td><td>${esc(h.note)}</td></tr>`).join("")}</table>`);
});
