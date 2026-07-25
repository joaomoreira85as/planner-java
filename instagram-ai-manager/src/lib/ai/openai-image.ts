import "server-only";
import OpenAI from "openai";
import { getSupabase } from "@/lib/supabase";

export class ImageConfigError extends Error {}

export const IMAGES_BUCKET = "post-images";

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new ImageConfigError(
      "OPENAI_API_KEY não configurada. Adicione a chave no arquivo .env."
    );
  }
  return (_client ??= new OpenAI());
}

/**
 * Gera uma imagem quadrada com gpt-image-1 e envia para o Supabase Storage.
 * Retorna o nome do arquivo salvo no bucket.
 */
export async function generateImage(prompt: string, postRef: string): Promise<string> {
  const client = getClient();

  const result = await client.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "1024x1024",
    quality: "medium",
  });

  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error("A API de imagem não retornou dados");

  const safeRef = postRef.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || "img";
  const filename = `${safeRef}-${Date.now()}.png`;

  const supabase = getSupabase();
  const { error } = await supabase.storage
    .from(IMAGES_BUCKET)
    .upload(filename, Buffer.from(b64, "base64"), {
      contentType: "image/png",
      upsert: false,
    });
  if (error) throw new Error(`Falha ao salvar a imagem no Storage: ${error.message}`);

  return filename;
}
