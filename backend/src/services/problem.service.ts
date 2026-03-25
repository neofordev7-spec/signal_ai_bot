import { getDB, saveDB } from '../config/db';
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

function rowToObj(columns: string[], values: any[]): any {
  const obj: any = {};
  columns.forEach((col, i) => obj[col] = values[i]);
  return obj;
}

function queryAll(sql: string, params?: any[]): any[] {
  const db = getDB();
  const stmt = db.prepare(sql);
  if (params) stmt.bind(params);
  const rows: any[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function queryOne(sql: string, params?: any[]): any | null {
  const rows = queryAll(sql, params);
  return rows[0] || null;
}

function runSql(sql: string, params?: any[]) {
  const db = getDB();
  db.run(sql, params);
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

  runSql(
    `INSERT INTO problems (user_id, title, description, category, sentiment, urgency, keywords, lat, lng, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, title, description, aiResult.category, aiResult.sentiment, aiResult.urgency, JSON.stringify(aiResult.keywords), input.lat || null, input.lng || null, imageUrl || null]
  );

  const db = getDB();
  const lastId = db.exec('SELECT last_insert_rowid()')[0].values[0][0] as number;
  saveDB();

  return queryOne('SELECT * FROM problems WHERE id = ?', [lastId]);
}

export async function getProblems(query: ProblemsQuery, currentUserId?: number): Promise<{ problems: any[]; total: number }> {
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

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  let orderBy: string;
  switch (query.sort) {
    case 'trending': orderBy = 'p.vote_count DESC, p.created_at DESC'; break;
    case 'urgent': orderBy = 'p.urgency DESC, p.created_at DESC'; break;
    default: orderBy = 'p.created_at DESC';
  }

  const countRow = queryOne(`SELECT COUNT(*) as count FROM problems p ${where}`, params);
  const total = countRow?.count || 0;

  const offset = (query.page - 1) * query.limit;

  let sql: string;
  let queryParams: any[];

  if (currentUserId) {
    sql = `SELECT p.*, u.first_name, u.username,
           (SELECT COUNT(*) FROM votes v WHERE v.problem_id = p.id AND v.user_id = ?) as user_voted
           FROM problems p JOIN users u ON u.id = p.user_id ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
    queryParams = [currentUserId, ...params, query.limit, offset];
  } else {
    sql = `SELECT p.*, u.first_name, u.username, 0 as user_voted
           FROM problems p JOIN users u ON u.id = p.user_id ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
    queryParams = [...params, query.limit, offset];
  }

  const problems = queryAll(sql, queryParams);
  return { problems, total };
}

export async function getProblemById(id: number, currentUserId?: number): Promise<any | null> {
  let sql: string;
  let params: any[];

  if (currentUserId) {
    sql = `SELECT p.*, u.first_name, u.username,
           (SELECT COUNT(*) FROM votes v WHERE v.problem_id = p.id AND v.user_id = ?) as user_voted
           FROM problems p JOIN users u ON u.id = p.user_id WHERE p.id = ?`;
    params = [currentUserId, id];
  } else {
    sql = `SELECT p.*, u.first_name, u.username, 0 as user_voted
           FROM problems p JOIN users u ON u.id = p.user_id WHERE p.id = ?`;
    params = [id];
  }

  return queryOne(sql, params);
}

export async function toggleVote(userId: number, problemId: number): Promise<{ voted: boolean; voteCount: number }> {
  const existing = queryOne('SELECT id FROM votes WHERE user_id = ? AND problem_id = ?', [userId, problemId]);

  let voted: boolean;
  if (existing) {
    runSql('DELETE FROM votes WHERE user_id = ? AND problem_id = ?', [userId, problemId]);
    runSql('UPDATE problems SET vote_count = vote_count - 1 WHERE id = ?', [problemId]);
    voted = false;
  } else {
    runSql('INSERT INTO votes (user_id, problem_id) VALUES (?, ?)', [userId, problemId]);
    runSql('UPDATE problems SET vote_count = vote_count + 1 WHERE id = ?', [problemId]);
    voted = true;
  }

  const result = queryOne('SELECT vote_count FROM problems WHERE id = ?', [problemId]);
  saveDB();
  return { voted, voteCount: result?.vote_count || 0 };
}
