-- ドラコレ営業：ランク履歴（追記のみ）と、ふわ用の合言葉（ハッシュのみ保存）
create table public.dcout_rank_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  at timestamptz not null default now(),
  person_id text, username text,
  from_rank text check (from_rank in ('A','B','C','D','F')),
  to_rank text check (to_rank in ('A','B','C','D','F')),
  by_who text not null check (by_who in ('本人','ふわ','Claude','初期データ')),
  kind text not null check (kind in ('提案','確定','却下')),
  ref_id bigint references public.dcout_rank_log(id),
  note text);
alter table public.dcout_rank_log enable row level security;
create policy "own rows read" on public.dcout_rank_log for select to authenticated using (user_id = (select auth.uid()));
create policy "own rows insert" on public.dcout_rank_log for insert to authenticated with check (user_id = (select auth.uid()));
create table public.dcout_rank_keys (key_hash text primary key, user_id uuid not null references auth.users(id) on delete cascade, label text not null, created_at timestamptz not null default now());
alter table public.dcout_rank_keys enable row level security; -- ポリシーなし＝関数からのみ
