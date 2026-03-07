import { query } from '@/lib/db';

export async function upsertExercise(payload: {
  slug: string;
  title: string;
  execution_text?: string | null;
  default_series?: number | null;
  default_reps?: number | null;
  video_url?: string | null;
}) {
  const normalizeVideoUrl = (url?: string | null) => {
    const u = (url || '').trim();
    if (!u) return null;
    const vimeoMatch = u.match(/vimeo\.com\/(\d+)/i);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    const ytWatch = u.match(/youtube\.com\/watch\?v=([^&]+)/i);
    if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}`;
    const youtuBe = u.match(/youtu\.be\/([A-Za-z0-9_-]+)/i);
    if (youtuBe) return `https://www.youtube.com/embed/${youtuBe[1]}`;
    return u;
  };
  await query(
    `INSERT INTO exercises (slug, title, execution_text, default_series, default_reps, video_url, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6, now(), now())
     ON CONFLICT (slug) DO UPDATE SET
       title=EXCLUDED.title,
       execution_text=EXCLUDED.execution_text,
       default_series=EXCLUDED.default_series,
       default_reps=EXCLUDED.default_reps,
       video_url=EXCLUDED.video_url,
       updated_at=now()`,
    [
      payload.slug,
      payload.title,
      payload.execution_text ?? null,
      payload.default_series ?? null,
      payload.default_reps ?? null,
      normalizeVideoUrl(payload.video_url)
    ]
  );
}

export async function setVideoUrl(slug: string, url: string) {
  const u = (url || '').trim();
  const vimeoMatch = u.match(/vimeo\.com\/(\d+)/i);
  const ytWatch = u.match(/youtube\.com\/watch\?v=([^&]+)/i);
  const youtuBe = u.match(/youtu\.be\/([A-Za-z0-9_-]+)/i);
  const normalized =
    vimeoMatch ? `https://player.vimeo.com/video/${vimeoMatch[1]}` :
    ytWatch ? `https://www.youtube.com/embed/${ytWatch[1]}` :
    youtuBe ? `https://www.youtube.com/embed/${youtuBe[1]}` :
    u;
  await query('UPDATE exercises SET video_url=$2, updated_at=now() WHERE slug=$1', [slug, normalized]);
}

export async function getBySlug(slug: string) {
  const r = await query('SELECT * FROM exercises WHERE slug=$1 LIMIT 1', [slug]);
  const row = r.rows[0] || null;
  if (!row) return null;
  const u = String(row.video_url || '').trim();
  if (u) {
    const vimeoMatch = u.match(/vimeo\.com\/(\d+)/i);
    const ytWatch = u.match(/youtube\.com\/watch\?v=([^&]+)/i);
    const youtuBe = u.match(/youtu\.be\/([A-Za-z0-9_-]+)/i);
    const normalized =
      vimeoMatch ? `https://player.vimeo.com/video/${vimeoMatch[1]}` :
      ytWatch ? `https://www.youtube.com/embed/${ytWatch[1]}` :
      youtuBe ? `https://www.youtube.com/embed/${youtuBe[1]}` :
      u;
    row.video_url = normalized;
  }
  return row;
}
