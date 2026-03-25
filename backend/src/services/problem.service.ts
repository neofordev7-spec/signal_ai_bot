import { db } from '../config/db';
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
  keywords: string;
  lat: number | null;
  lng: number | null;
  image_url: string | null;
  status: string;
  vote_count: number;
  created_at: string;
  first_name?: string;
  username?: string;
  user_voted?: number;
}

export async function createProblem(
  userId: number,
  input: CreateProblemInput,
  imageUrl?: string
): Promise<Problem> {
  const title = sanitizeString(input.title);
  const description = sanitizeString(input.description);

  let aiResult = { category: 'uncategorized', sentiment: 'unknown', urgency: 3, keywords: [] as string[] };
  try {
    aiResult = await analyzeProblem(title, description);
  } catch (err) {
    console.error('AI analysis failed, using defaults:', err);
  }

  const stmt = db.prepare(
    `INSERT INTO problems (user_id, title, description, category, sentiment, urgency, keywords, lat, lng, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     RETURNING *`
  );

  const result = stmt.get(
    userId,
    title,
    description,
    aiResult.category,
    aiResult.sentiment,
    aiResult.urgency,
    JSON.stringify(aiResult.keywords),
    input.lat || null,
    input.lng || null,
    imageUrl || null,
  ) as Problem;

  return result;
}

export async function getProblems(query: ProblemsQuery, currentUserId?: number): Promise<{ problems: Problem[]; total: number }> {
  const conditions: string[] = [];
  const params: any[] = [];

  if (query.category) {
    conditions.push('p.category = ?');
    params.push(query.category);
  }

  if (query.search) {
    conditions.push('(p.title LIKE ? OR p.description LIKE ?)');
    params.push(`%${query.search}%`, `%${query.search}%`);
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

  const countStmt = db.prepare(`SELECT COUNT(*) as count FROM problems p ${where}`);
  const countResult = countStmt.get(...params) as { count: number };
  const total = countResult.count;

  const voteJoin = currentUserId
    ? 'LEFT JOIN votes v ON v.problem_id = p.id AND v.user_id = ?'
    : '';
  const voteSelect = currentUserId ? ', (v.id IS NOT NULL) as user_voted' : ', 0 as user_voted';

  const queryParams = [...params];
  if (currentUserId) queryParams.push(currentUserId);
  queryParams.push(query.limit, offset);

  const stmt = db.prepare(
    `SELECT p.*, u.first_name, u.username ${voteSelect}
     FROM problems p
     JOIN users u ON u.id = p.user_id
     ${voteJoin}
     ${where}
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`
  );

  const problems = stmt.all(...queryParams) as Problem[];

  return { problems, total };
}

export async function getProblemById(id: number, currentUserId?: number): Promise<Problem | null> {
  const params: any[] = [id];
  let voteJoin = '';
  let voteSelect = ', 0 as user_voted';

  if (currentUserId) {
    voteJoin = 'LEFT JOIN votes v ON v.problem_id = p.id AND v.user_id = ?';
    voteSelect = ', (v.id IS NOT NULL) as user_voted';
    params.push(currentUserId);
  }

  const stmt = db.prepare(
    `SELECT p.*, u.first_name, u.username ${voteSelect}
     FROM problems p
     JOIN users u ON u.id = p.user_id
     ${voteJoin}
     WHERE p.id = ?`
  );

  // id must be first param for WHERE
  const reorderedParams = currentUserId ? [id, currentUserId] : [id];
  const result = stmt.get(...reorderedParams) as Problem | undefined;

  return result || null;
}

export async function toggleVote(userId: number, problemId: number): Promise<{ voted: boolean; voteCount: number }> {
  const toggleTransaction = db.transaction(() => {
    const existing = db.prepare('SELECT id FROM votes WHERE user_id = ? AND problem_id = ?').get(userId, problemId);

    let voted: boolean;
    if (existing) {
      db.prepare('DELETE FROM votes WHERE user_id = ? AND problem_id = ?').run(userId, problemId);
      db.prepare('UPDATE problems SET vote_count = vote_count - 1 WHERE id = ?').run(problemId);
      voted = false;
    } else {
      db.prepare('INSERT INTO votes (user_id, problem_id) VALUES (?, ?)').run(userId, problemId);
      db.prepare('UPDATE problems SET vote_count = vote_count + 1 WHERE id = ?').run(problemId);
      voted = true;
    }

    const result = db.prepare('SELECT vote_count FROM problems WHERE id = ?').get(problemId) as { vote_count: number };
    return { voted, voteCount: result.vote_count };
  });

  return toggleTransaction();
}
