import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export * from "./supabase-types";

/**
 * Cliente Supabase usado APENAS no servidor (server actions e route handlers).
 * Use a chave secreta (service_role / sb_secret_...) — ela nunca chega ao navegador.
 */
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL/SUPABASE_KEY não configuradas. Adicione no arquivo .env."
    );
  }
  return (_client ??= createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  }));
}
