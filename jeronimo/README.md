# Jerônimo, seu assistente de gestão

Sistema de manutenção predial (plano preventivo, calendário, chamados, relatórios e avisos por WhatsApp),
recriado do Builder do Núcleo de I.A. Stack: React 18 + TypeScript + Tailwind (Vite) + Supabase.

Publicado em: https://ocrismedeiros.github.io/valorecondominios/jeronimo/

## Como funciona o acesso

Cada pessoa entra com **e-mail e senha próprios**. Para acessar os dados ela precisa:
1. ter uma conta no Supabase (Authentication > Users), e
2. estar na tabela `equipe`.

### Incluir alguém na equipe
1. Supabase > projeto **jeronimo** > Authentication > Users > **Add user > Create new user**.
   Preencha e-mail e senha e marque **Auto Confirm User**.
2. SQL Editor: `insert into public.equipe (email, nome) values ('pessoa@exemplo.com', 'Nome');`
3. Passe o e-mail e a senha para a pessoa.

### Tirar alguém da equipe
SQL Editor: `delete from public.equipe where email = 'pessoa@exemplo.com';`
O acesso aos dados é cortado na hora, mesmo com a pessoa logada.

### Esqueceu a senha
Authentication > Users > clique na pessoa > **Reset password** ou defina uma senha nova.

## Rodar no computador

```bash
cd jeronimo
npm install
npm run dev      # modo local: dados no navegador, sem login
```

Para usar o banco real no `npm run dev`, copie `.env.production` para `.env.local`.

## Publicação

A cada push na branch `main`, a automação `.github/workflows/pages.yml` gera o build e publica
no GitHub Pages junto com o `index.html` da raiz do repositório.

## Dados (`src/nucleo.ts`)

Mesma interface do Núcleo de I.A: `db.colecao<T>("nome").listar() / criar() / atualizar() / remover()`.
Todas as coleções ficam na tabela `registros` (campos em `dados`, jsonb). Estrutura em `supabase/schema.sql`.
