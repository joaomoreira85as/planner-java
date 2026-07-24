import "server-only";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import OpenAI from "openai";

export class ImageConfigError extends Error {}

export const IMAGES_DIR = path.join(process.cwd(), "storage", "images");

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
 * Gera uma imagem quadrada com gpt-image-1 e salva em storage/images.
 * Retorna o nome do arquivo salvo.
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

  await mkdir(IMAGES_DIR, { recursive: true });
  const safeRef = postRef.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40) || "img";
  const filename = `${safeRef}-${Date.now()}.png`;
  await writeFile(path.join(IMAGES_DIR, filename), Buffer.from(b64, "base64"));
  return filename;
}
