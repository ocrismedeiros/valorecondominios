-- Estrutura do banco (já aplicada no projeto Supabase "jeronimo", região São Paulo).
-- Rode este arquivo só se for recriar o banco em outro projeto.
create extension if not exists pgcrypto;

-- Quem pode usar o sistema. Só e-mails desta lista acessam os dados, mesmo que alguém crie conta.
create table public.equipe (
  email text primary key check (email = lower(email)),
  nome text,
  criado_em timestamptz not null default now()
);
alter table public.equipe enable row level security;

-- Cada membro vê só a própria linha (o app usa isso para conferir se a pessoa está liberada).
create policy "equipe_ve_a_si" on public.equipe for select to authenticated
  using (email = lower(coalesce(auth.jwt() ->> 'email', '')));

create or replace function public.eh_da_equipe()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.equipe e
    where e.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
revoke all on function public.eh_da_equipe() from public, anon;
grant execute on function public.eh_da_equipe() to authenticated;

-- Todas as coleções do sistema (predios, manutencoes, chamados, config), com os campos em "dados".
create table public.registros (
  id uuid primary key default gen_random_uuid(),
  colecao text not null,
  dados jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index registros_colecao_idx on public.registros (colecao, criado_em desc);
alter table public.registros enable row level security;

create policy "equipe_le" on public.registros for select to authenticated using ((select public.eh_da_equipe()));
create policy "equipe_cria" on public.registros for insert to authenticated with check ((select public.eh_da_equipe()));
create policy "equipe_altera" on public.registros for update to authenticated using ((select public.eh_da_equipe())) with check ((select public.eh_da_equipe()));
create policy "equipe_apaga" on public.registros for delete to authenticated using ((select public.eh_da_equipe()));

revoke all on public.registros from anon;
revoke all on public.equipe from anon;

-- Liberar alguém: insert into public.equipe (email, nome) values ('pessoa@exemplo.com', 'Nome');
-- Bloquear alguém: delete from public.equipe where email = 'pessoa@exemplo.com';
