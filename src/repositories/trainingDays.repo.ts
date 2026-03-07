import { query } from '@/lib/db';

export async function upsertDay(payload: {
  id: string;
  title: string;
  overview?: string | null;
  cardio_title?: string | null;
  cardio_prescription?: string | null;
}) {
  await query(
    `INSERT INTO training_days (id, title, overview, cardio_title, cardio_prescription, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5, now(), now())
     ON CONFLICT (id) DO UPDATE SET
       title=EXCLUDED.title,
       overview=EXCLUDED.overview,
       cardio_title=EXCLUDED.cardio_title,
       cardio_prescription=EXCLUDED.cardio_prescription,
       updated_at=now()`,
    [
      payload.id,
      payload.title,
      payload.overview ?? null,
      payload.cardio_title ?? null,
      payload.cardio_prescription ?? null
    ]
  );
}

export async function updateDay(payload: {
  id: string;
  title?: string | null;
  overview?: string | null;
  cardio_title?: string | null;
  cardio_prescription?: string | null;
}) {
  await query(
    'UPDATE training_days SET title=COALESCE($2,title), overview=COALESCE($3,overview), cardio_title=COALESCE($4,cardio_title), cardio_prescription=COALESCE($5,cardio_prescription), updated_at=now() WHERE id=$1',
    [payload.id, payload.title ?? null, payload.overview ?? null, payload.cardio_title ?? null, payload.cardio_prescription ?? null]
  );
}

export async function deleteDay(id: string) {
  await query('DELETE FROM training_days WHERE id=$1', [id]);
}

export async function upsertGroup(payload: {
  training_day_id: string;
  order?: number | null;
  exercise_a_slug?: string | null;
  exercise_b_slug?: string | null;
  prescription?: string | null;
}) {
  await query(
    `INSERT INTO training_day_groups (training_day_id, "order", exercise_a_slug, exercise_b_slug, prescription, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5, now(), now())`,
    [
      payload.training_day_id,
      payload.order ?? null,
      payload.exercise_a_slug ?? null,
      payload.exercise_b_slug ?? null,
      payload.prescription ?? null
    ]
  );
}

export async function getDayWithGroups(id: string) {
  const dayRes = await query(
    'SELECT id, title, overview, cardio_title, cardio_prescription FROM training_days WHERE id=$1 LIMIT 1',
    [id]
  );
  const day = dayRes.rows[0];
  if (!day) return null;
  const groupsRes = await query(
    `SELECT g.id as id,
            g."order" as order,
            g.prescription,
            g.exercise_a_slug as a_slug,
            (SELECT title FROM exercises e WHERE e.slug=g.exercise_a_slug) as a_title,
            g.exercise_b_slug as b_slug,
            (SELECT title FROM exercises e WHERE e.slug=g.exercise_b_slug) as b_title
     FROM training_day_groups g
     WHERE g.training_day_id=$1
     ORDER BY g."order" ASC, g.id ASC`,
    [id]
  );
  return {
    id: day.id,
    title: day.title,
    overview: day.overview,
    cardio: day.cardio_title || day.cardio_prescription ? { title: day.cardio_title, prescription: day.cardio_prescription } : null,
    groups: groupsRes.rows.map((r: any) => ({
      id: r.id,
      order: r.order,
      prescription: r.prescription,
      a: { slug: r.a_slug, title: r.a_title },
      b: r.b_slug ? { slug: r.b_slug, title: r.b_title } : null
    }))
  };
}

export async function listDays(limit = 50, offset = 0) {
  const r = await query(
    'SELECT id, title, overview FROM training_days ORDER BY updated_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  return r.rows;
}

export async function updateGroup(payload: {
  id: number;
  order?: number | null;
  exercise_a_slug?: string | null;
  exercise_b_slug?: string | null;
  prescription?: string | null;
}) {
  await query(
    'UPDATE training_day_groups SET "order"=COALESCE($2,"order"), exercise_a_slug=COALESCE($3,exercise_a_slug), exercise_b_slug=COALESCE($4,exercise_b_slug), prescription=COALESCE($5,prescription), updated_at=now() WHERE id=$1',
    [payload.id, payload.order ?? null, payload.exercise_a_slug ?? null, payload.exercise_b_slug ?? null, payload.prescription ?? null]
  );
}

export async function deleteGroup(id: number) {
  await query('DELETE FROM training_day_groups WHERE id=$1', [id]);
}
