import { pool } from '../config/db';
import { CreateProblemInput, ProblemsQuery } from '../validators/problem.validator';
import { analyzeProblem } from './ai.service';
import { sanitizeString } from '../utils/sanitize';

export interface Problem {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category: string;
  sentiment: string;
  urgency: number;
  keywords: string[];
  lat: number | null;
  lng: number | null;
  image_url: string | null;
  status: string;
  vote_count: number;
  created_at: string;
  first_name?: string;
  username?: string;
  user_voted?: boolean;
}

export async function createProblem(
  userId: number,
  input: CreateProblemInput,
  imageUrl?: string
): Promise<Problem> {
  const title = sanitizeString(input.title);
  const description = sanitizeString(input.description);

  // AI analysis (with fallback)
  let aiResult = { category: 'uncategorized', sentiment: 'unknown', urgency: 3, keywords: [] as string[] };
  try {
    aiResult = await analyzeProblem(title, description);
  } catch (err) {
    console.error('AI analysis failed, using defaults:', err);
  }

  const result = await pool.query(
    `INSERT INTO problems (user_id, title, description, category, sentiment, urgency, keywords, lat, lng, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      userId,
      title,
      description,
      aiResult.category,
      aiResult.sentiment,
      aiResult.urgency,
      aiResult.keywords,
      input.lat || null,
      input.lng || null,
      imageUrl || null,
    ]
  );

  return result.rows[0];
}

export async function getProblems(query: ProblemsQuery, currentUserId?: number): Promise<{ problems: Problem[]; total: number }> {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIdx = 1;

  if (query.category) {
    conditions.push(`p.category = $${paramIdx++}`);
    params.push(query.category);
  }

  if (query.search) {
    conditions.push(`(p.title ILIKE $${paramIdx} OR p.description ILIKE $${paramIdx})`);
    params.push(`%${query.search}%`);
    paramIdx++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderBy: string;
  switch (query.sort) {
    case 'trending':
      orderBy = 'p.vote_count DESC, p.created_at DESC';
      break;
    case 'urgent':
      orderBy = 'p.urgency DESC, p.created_at DESC';
      break;
    default:
      orderBy = 'p.created_at DESC';
  }

  const offset = (query.page - 1) * query.limit;

  const countResult = await pool.query(`SELECT COUNT(*) FROM problems p ${where}`, params);
  const total = parseInt(countResult.rows[0].count, 10);

  const voteJoin = currentUserId
    ? `LEFT JOIN votes v ON v.problem_id = p.id AND v.user_id = $${paramIdx++}`
    : '';
  if (currentUserId) params.push(currentUserId);

  const voteSelect = currentUserId ? ', (v.id IS NOT NULL) as user_voted' : ', FALSE as user_voted';

  params.push(query.limit, offset);

  const result = await pool.query(
    `SELECT p.*, u.first_name, u.username ${voteSelect}
     FROM problems p
     JOIN users u ON u.id = p.user_id
     ${voteJoin}
     ${where}
     ORDER BY ${orderBy}
     LIMIT $${paramIdx++} OFFSET $${paramIdx}`,
    params
  );

  return { problems: result.rows, total };
}

export async function getProblemById(id: number, currentUserId?: number): Promise<Problem | null> {
  const params: any[] = [id];
  let voteJoin = '';
  let voteSelect = ', FALSE as user_voted';

  if (currentUserId) {
    voteJoin = 'LEFT JOIN votes v ON v.problem_id = p.id AND v.user_id = $2';
    voteSelect = ', (v.id IS NOT NULL) as user_voted';
    params.push(currentUserId);
  }

  const result = await pool.query(
    `SELECT p.*, u.first_name, u.username ${voteSelect}
     FROM problems p
     JOIN users u ON u.id = p.user_id
     ${voteJoin}
     WHERE p.id = $1`,
    params
  );

  return result.rows[0] || null;
}

export async function toggleVote(userId: number, problemId: number): Promise<{ voted: boolean; voteCount: number }> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query(
      'SELECT id FROM votes WHERE user_id = $1 AND problem_id = $2',
      [userId, problemId]
    );

    let voted: boolean;
    if (existing.rows.length > 0) {
      await client.query('DELETE FROM votes WHERE user_id = $1 AND problem_id = $2', [userId, problemId]);
      await client.query('UPDATE problems SET vote_count = vote_count - 1 WHERE id = $1', [problemId]);
      voted = false;
    } else {
      await client.query('INSERT INTO votes (user_id, problem_id) VALUES ($1, $2)', [userId, problemId]);
      await client.query('UPDATE problems SET vote_count = vote_count + 1 WHERE id = $1', [problemId]);
      voted = true;
    }

    const result = await client.query('SELECT vote_count FROM problems WHERE id = $1', [problemId]);
    await client.query('COMMIT');

    return { voted, voteCount: result.rows[0].vote_count };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
