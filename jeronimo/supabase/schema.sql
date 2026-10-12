-- Uma tabela genérica guarda todas as coleções (predios, manutencoes, chamados, config).
-- Os campos de cada registro ficam em "dados" (jsonb), igual ao Núcleo de I.A.
create extension if not exists pgcrypto;

create table if not exists public.registros (
  id uuid primary key default gen_random_uuid(),
  colecao text not null,
  dados jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists registros_colecao_idx on public.registros (colecao, criado_em desc);

alter table public.registros enable row level security;

-- ATENÇÃO: o sistema não tem login real (a "senha da equipe" fica no código do front).
-- Esta política libera leitura e escrita para quem tiver a chave anon, que também fica no front.
-- Ou seja: qualquer pessoa com a URL do sistema acessa os dados. Para restringir,
-- troque por Supabase Auth e políticas por usuário.
drop policy if exists "acesso_anon" on public.registros;
create policy "acesso_anon" on public.registros for all to anon using (true) with check (true);
