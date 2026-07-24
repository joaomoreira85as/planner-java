import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { IMAGES_DIR } from "@/lib/ai/openai-image";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const safe = path.basename(file);
  if (!/^[a-zA-Z0-9_-]+\.png$/.test(safe)) {
    return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 });
  }
  try {
    const buf = await readFile(path.join(IMAGES_DIR, safe));
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Imagem não encontrada" }, { status: 404 });
  }
}
