import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { IMAGES_BUCKET } from "@/lib/ai/openai-image";

/** Serve as imagens do bucket do Supabase Storage (mesma origem → download funciona). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  if (!/^[a-zA-Z0-9_-]+\.png$/.test(file)) {
    return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 });
  }
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.storage.from(IMAGES_BUCKET).download(file);
    if (error || !data) {
      return NextResponse.json({ error: "Imagem não encontrada" }, { status: 404 });
    }
    return new NextResponse(data.stream(), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Imagem não encontrada" }, { status: 404 });
  }
}
