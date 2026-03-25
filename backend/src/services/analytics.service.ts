import { pool } from '../config/db';

export async function getAnalytics() {
  const [
    categoryStats,
    sentimentStats,
    urgencyStats,
    topProblems,
    totalStats,
    weeklyTop,
  ] = await Promise.all([
    pool.query(
      `SELECT category, COUNT(*) as count
       FROM problems
       GROUP BY category
       ORDER BY count DESC`
    ),
    pool.query(
      `SELECT sentiment, COUNT(*) as count
       FROM problems
       GROUP BY sentiment
       ORDER BY count DESC`
    ),
    pool.query(
      `SELECT urgency, COUNT(*) as count
       FROM problems
       GROUP BY urgency
       ORDER BY urgency DESC`
    ),
    pool.query(
      `SELECT p.id, p.title, p.category, p.vote_count, p.urgency, p.created_at
       FROM problems p
       ORDER BY p.vote_count DESC
       LIMIT 10`
    ),
    pool.query(
      `SELECT
         COUNT(*) as total_problems,
         COUNT(CASE WHEN status = 'open' THEN 1 END) as open_problems,
         COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_problems,
         COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as new_this_week,
         COALESCE(AVG(urgency), 0) as avg_urgency
       FROM problems`
    ),
    pool.query(
      `SELECT p.id, p.title, p.category, p.vote_count, p.urgency
       FROM problems p
       WHERE p.created_at > NOW() - INTERVAL '7 days'
       ORDER BY p.vote_count DESC
       LIMIT 5`
    ),
  ]);

  // Simple keyword clustering
  const keywordResult = await pool.query(
    `SELECT unnest(keywords) as keyword, COUNT(*) as count
     FROM problems
     GROUP BY keyword
     ORDER BY count DESC
     LIMIT 20`
  );

  return {
    categories: categoryStats.rows,
    sentiments: sentimentStats.rows,
    urgencyLevels: urgencyStats.rows,
    topProblems: topProblems.rows,
    stats: totalStats.rows[0],
    weeklyTop: weeklyTop.rows,
    topKeywords: keywordResult.rows,
  };
}
