import { db } from '../config/db';

export async function getAnalytics() {
  const categoryStats = db.prepare(
    `SELECT category, COUNT(*) as count FROM problems GROUP BY category ORDER BY count DESC`
  ).all();

  const sentimentStats = db.prepare(
    `SELECT sentiment, COUNT(*) as count FROM problems GROUP BY sentiment ORDER BY count DESC`
  ).all();

  const urgencyStats = db.prepare(
    `SELECT urgency, COUNT(*) as count FROM problems GROUP BY urgency ORDER BY urgency DESC`
  ).all();

  const topProblems = db.prepare(
    `SELECT id, title, category, vote_count, urgency, created_at
     FROM problems ORDER BY vote_count DESC LIMIT 10`
  ).all();

  const totalStats = db.prepare(
    `SELECT
       COUNT(*) as total_problems,
       COUNT(CASE WHEN status = 'open' THEN 1 END) as open_problems,
       COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_problems,
       COUNT(CASE WHEN created_at > datetime('now', '-7 days') THEN 1 END) as new_this_week,
       COALESCE(AVG(urgency), 0) as avg_urgency
     FROM problems`
  ).get();

  const weeklyTop = db.prepare(
    `SELECT id, title, category, vote_count, urgency
     FROM problems
     WHERE created_at > datetime('now', '-7 days')
     ORDER BY vote_count DESC LIMIT 5`
  ).all();

  // Keyword aggregation - parse JSON keywords and count
  const allProblems = db.prepare('SELECT keywords FROM problems').all() as { keywords: string }[];
  const keywordMap: Record<string, number> = {};
  for (const row of allProblems) {
    try {
      const kws = JSON.parse(row.keywords || '[]') as string[];
      for (const kw of kws) {
        keywordMap[kw] = (keywordMap[kw] || 0) + 1;
      }
    } catch { /* skip invalid */ }
  }
  const topKeywords = Object.entries(keywordMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([keyword, count]) => ({ keyword, count: String(count) }));

  return {
    categories: categoryStats,
    sentiments: sentimentStats,
    urgencyLevels: urgencyStats,
    topProblems,
    stats: totalStats,
    weeklyTop,
    topKeywords,
  };
}
