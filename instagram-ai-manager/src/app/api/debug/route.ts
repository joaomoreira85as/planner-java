import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Diagnóstico de conexão com o Supabase (temporário).
 * Não expõe segredos: apenas formato/tamanho das envs e a mensagem de erro real.
 */
export async function GET() {
  const url = process.env.SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_KEY ?? "";

  const report: Record<string, unknown> = {
    url_present: Boolean(url),
    url_length: url.length,
    url_starts_https: url.startsWith("https://"),
    url_has_whitespace: /\s/.test(url),
    url_has_quotes: /["']/.test(url),
    key_present: Boolean(key),
    key_length: key.length,
    key_prefix: key.slice(0, 6),
    key_has_whitespace: /\s/.test(key),
    key_has_quotes: /["']/.test(key),
  };

  try {
    report.url_host = new URL(url).host;
  } catch (e) {
    report.url_parse_error = e instanceof Error ? e.message : String(e);
  }

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error, count } = await supabase
      .from("posts")
      .select("id", { count: "exact", head: true });
    report.query_ok = !error;
    report.query_count = count;
    report.query_error = error
      ? { message: error.message, code: error.code, details: error.details }
      : null;
  } catch (e) {
    report.query_exception = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    if (e instanceof Error && e.cause) report.query_cause = String(e.cause);
  }

  return NextResponse.json(report);
}
