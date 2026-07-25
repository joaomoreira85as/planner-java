export interface PublishResult {
  ok: boolean;
  /** Status final do post após a publicação (ex.: "pronto" no fluxo manual, "publicado" na Graph API). */
  status?: string;
  externalId?: string;
  error?: string;
}

/**
 * Adaptador de publicação. Hoje só o fluxo manual está ativo;
 * o InstagramGraphPublisher pluga a Instagram Graph API sem mudar o resto do app.
 */
export interface Publisher {
  readonly id: "manual" | "instagram_graph";
  readonly label: string;
  isConfigured(): boolean;
  publish(postId: string): Promise<PublishResult>;
}
