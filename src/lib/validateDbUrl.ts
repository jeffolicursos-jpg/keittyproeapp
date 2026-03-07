export function validateDbUrl(url?: string) {
  if (!url) {
    throw new Error("DB_URL não definida nas variáveis de ambiente.");
  }

  const normalized = url.trim();
  const startsWithPostgres =
    normalized.startsWith("postgres://") || normalized.startsWith("postgresql://");
  if (!startsWithPostgres) {
    throw new Error("DB_URL inválida. Deve iniciar com postgres:// ou postgresql://");
  }

  const lower = normalized.toLowerCase();
  if (lower.includes("db.supabase.co")) {
    console.warn(
      "[warning] DB_URL está usando o host antigo do Supabase (db.supabase.co). Recomenda-se usar o pooler: aws-*.pooler.supabase.com"
    );
  }

  if (!lower.includes("pooler.supabase.com")) {
    console.warn(
      "[warning] DB_URL não parece usar o Supabase Pooler. Recomendado: aws-*.pooler.supabase.com"
    );
  }

  if (lower.includes("pooler.supabase.com") && !lower.includes(":6543")) {
    console.warn(
      "[warning] DB_URL do Pooler geralmente usa a porta 6543 (Session Pooler). Verifique sua connection string."
    );
  }

  if (!/[?&]sslmode=/.test(lower)) {
    console.warn("[warning] DB_URL sem sslmode definido. Recomenda-se ?sslmode=require");
  }

  return true;
}
