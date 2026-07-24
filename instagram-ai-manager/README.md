# Instagram AI Manager

Sistema pessoal para gerenciar seu Instagram com IA: gere posts completos
(legenda, hashtags e imagem), agende em um calendário, acompanhe o crescimento
e receba insights — tudo em uma interface escura com as cores do Instagram,
100% responsiva (celular → desktop).

## Funcionalidades

- ✨ **Gerar post com IA** — descreva o tema e receba 3 opções com legenda
  pronta em pt-BR, 15–25 hashtags, melhor horário e prompt de imagem
  (Claude `claude-opus-4-8` com structured outputs)
- 🖼️ **Imagens por IA** — geração com OpenAI `gpt-image-1` a partir do prompt
  (editável e regenerável)
- 📅 **Calendário** — grade mensal no desktop, agenda em lista no celular,
  com status coloridos (rascunho → agendado → pronto → publicado)
- 📋 **Fluxo de publicação manual** — copiar legenda + hashtags, baixar a
  imagem, postar no app do Instagram e marcar como publicado
- 📈 **Crescimento** — registre seguidores e métricas por post, veja gráficos
  e gere insights com IA ("o que está funcionando")
- 💡 **Banco de ideias** — anote temas e transforme em post com um clique
- ⚙️ **Perfil da marca** — nicho, tom de voz e público alimentam todos os prompts

> **Crescimento dentro das regras:** este projeto não usa bots de
> follow/unfollow nem engajamento falso (violam os Termos do Instagram e
> arriscam banimento). O crescimento vem de conteúdo consistente e otimizado.

## Como rodar

```bash
npm install
cp .env.example .env   # preencha as variáveis
npm run dev            # http://localhost:3000
```

Variáveis necessárias no `.env`:

| Variável            | O que é                                                          |
| ------------------- | ---------------------------------------------------------------- |
| `SUPABASE_URL`      | URL do projeto Supabase (Settings → API)                          |
| `SUPABASE_KEY`      | Chave SECRETA do Supabase (service_role) — nunca vai ao navegador |
| `ANTHROPIC_API_KEY` | Chave da Claude API (textos e insights)                           |
| `OPENAI_API_KEY`    | Chave da OpenAI (imagens gpt-image-1)                             |
| `CRON_SECRET`       | Opcional — protege o endpoint de agendamento                      |

## Publicação automática no futuro (Instagram Graph API)

O app já tem a arquitetura pronta (`src/lib/publisher/`):

1. Converta sua conta para **Business/Creator** e vincule a uma Página do Facebook.
2. Crie um app em [developers.facebook.com](https://developers.facebook.com) com as
   permissões `instagram_basic` e `instagram_content_publish`.
3. Preencha `IG_USER_ID` e `IG_ACCESS_TOKEN` no `.env` e implemente o fluxo
   documentado em `src/lib/publisher/instagram-graph.ts`
   (container de mídia → publish). As imagens já ficam em URL pública no
   Supabase Storage, como a Graph API exige.
4. Agende o endpoint `GET /api/cron/publish` (header
   `Authorization: Bearer $CRON_SECRET`) via Vercel Cron ou cron do servidor —
   os posts `agendado` vencidos serão publicados automaticamente.

Enquanto isso, o mesmo endpoint move posts vencidos para a fila
**"Pronto para postar"** do dashboard.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Supabase (Postgres +
Storage) · Claude API (`@anthropic-ai/sdk`) · OpenAI Images · Recharts ·
date-fns · Zod · Deploy na Vercel
