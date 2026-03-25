import { getDB } from '../config/db';

function queryAll(sql: string): any[] {
  const db = getDB();
  const stmt = db.prepare(sql);
  const rows: any[] = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function queryOne(sql: string): any {
  const rows = queryAll(sql);
  return rows[0] || {};
}

export async function getAnalytics() {
  const categoryStats = queryAll('SELECT category, COUNT(*) as count FROM problems GROUP BY category ORDER BY count DESC');
  const sentimentStats = queryAll('SELECT sentiment, COUNT(*) as count FROM problems GROUP BY sentiment ORDER BY count DESC');
  const urgencyStats = queryAll('SELECT urgency, COUNT(*) as count FROM problems GROUP BY urgency ORDER BY urgency DESC');
  const topProblems = queryAll('SELECT id, title, category, vote_count, urgency, created_at FROM problems ORDER BY vote_count DESC LIMIT 10');

  const totalStats = queryOne(`SELECT
    COUNT(*) as total_problems,
    COUNT(CASE WHEN status = 'open' THEN 1 END) as open_problems,
    COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_problems,
    COUNT(CASE WHEN created_at > datetime('now', '-7 days') THEN 1 END) as new_this_week,
    COALESCE(AVG(urgency), 0) as avg_urgency
    FROM problems`);

  const weeklyTop = queryAll(`SELECT id, title, category, vote_count, urgency FROM problems WHERE created_at > datetime('now', '-7 days') ORDER BY vote_count DESC LIMIT 5`);

  // Keyword aggregation
  const allProblems = queryAll('SELECT keywords FROM problems');
  const keywordMap: Record<string, number> = {};
  for (const row of allProblems) {
    try {
      const kws = JSON.parse(row.keywords || '[]') as string[];
      for (const kw of kws) keywordMap[kw] = (keywordMap[kw] || 0) + 1;
    } catch { /* skip */ }
  }
  const topKeywords = Object.entries(keywordMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([keyword, count]) => ({ keyword, count: String(count) }));

  return { categories: categoryStats, sentiments: sentimentStats, urgencyLevels: urgencyStats, topProblems, stats: totalStats, weeklyTop, topKeywords };
}
