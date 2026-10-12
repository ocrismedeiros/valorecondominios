# Jerônimo, seu assistente de gestão

Sistema de manutenção predial (plano preventivo, calendário, chamados, relatórios e avisos por WhatsApp),
recriado do Builder do Núcleo de I.A. Stack: React 18 + TypeScript + Tailwind (Vite).

## Rodar

```bash
cd jeronimo
npm install
npm run dev      # desenvolvimento em http://localhost:5173
npm run build    # gera dist/ (base relativa, funciona em qualquer subpasta)
```

Senha da equipe: `src/lib/acesso.ts` (troque antes de usar; ela fica visível no código do navegador).

## Dados (`src/nucleo.ts`)

O módulo `nucleo` mantém a mesma interface do original:
`db.colecao<T>("nome").listar() / criar() / atualizar(id, campos) / remover(id)`.

- **Sem configuração**: salva no `localStorage` do navegador (cada computador vê só os próprios dados).
- **Com Supabase** (dados compartilhados pela equipe):
  1. Rode `supabase/schema.sql` no SQL Editor do projeto.
  2. Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
  3. Rode `npm run build` de novo.

Todas as coleções (`predios`, `manutencoes`, `chamados`, `config`) ficam na tabela `registros`,
com os campos em `dados` (jsonb).

**Atenção:** não há login real. Com Supabase, quem tiver a URL do sistema tem a chave anon e acessa os dados.
