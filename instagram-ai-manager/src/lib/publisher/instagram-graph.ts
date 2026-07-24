import type { Publisher, PublishResult } from "./types";

/**
 * Stub da publicação automática via Instagram Graph API.
 *
 * Para ativar no futuro:
 * 1. Conta Instagram Business/Creator vinculada a uma Página do Facebook.
 * 2. App no Meta Developers com as permissões `instagram_basic`,
 *    `instagram_content_publish` e `pages_read_engagement`.
 * 3. Definir as variáveis IG_USER_ID e IG_ACCESS_TOKEN no .env.
 *
 * Fluxo da API (v21+):
 *   POST /{ig-user-id}/media          { image_url, caption }  → creation_id
 *   POST /{ig-user-id}/media_publish  { creation_id }         → id do post
 *
 * Obs.: a imagem precisa estar acessível por URL pública — ao ativar,
 * suba o arquivo de `storage/images` para um storage público (ex.: S3/Vercel Blob).
 */
export const instagramGraphPublisher: Publisher = {
  id: "instagram_graph",
  label: "Instagram Graph API (automático)",

  isConfigured() {
    return Boolean(process.env.IG_USER_ID && process.env.IG_ACCESS_TOKEN);
  },

  async publish(): Promise<PublishResult> {
    return {
      ok: false,
      error:
        "Instagram Graph API ainda não configurada. Defina IG_USER_ID e IG_ACCESS_TOKEN e implemente o fluxo em src/lib/publisher/instagram-graph.ts",
    };
  },
};
