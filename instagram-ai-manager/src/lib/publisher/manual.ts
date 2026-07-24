import { Post } from "@/models";
import type { Publisher, PublishResult } from "./types";

/**
 * Fluxo manual: "publicar" move o post para a fila "pronto".
 * O usuário copia a legenda, baixa a imagem, posta no app do Instagram
 * e depois marca como "publicado".
 */
export const manualPublisher: Publisher = {
  id: "manual",
  label: "Publicação manual (copiar e postar)",

  isConfigured() {
    return true;
  },

  async publish(postId: string): Promise<PublishResult> {
    const doc = await Post.findByIdAndUpdate(
      postId,
      { status: "pronto" },
      { new: true }
    );
    if (!doc) return { ok: false, error: "Post não encontrado" };
    return { ok: true, status: "pronto" };
  },
};
