'use client';

import { useEffect, useState } from 'react';
import { Analytics } from '@/lib/types';
import { getAnalytics, getProblems } from '@/lib/api';
import { Problem } from '@/lib/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import HeatmapMock from '@/components/HeatmapMock';

const CATEGORY_EMOJIS: Record<string, string> = {
  infrastructure: '🏗️',
  education: '📚',
  healthcare: '🏥',
  safety: '🛡️',
  environment: '🌿',
  transport: '🚌',
  social: '👥',
  government: '🏛️',
  other: '📋',
};

const SENTIMENT_COLORS: Record<string, string> = {
  positive: 'bg-green-400',
  negative: 'bg-red-400',
  neutral: 'bg-gray-400',
  urgent: 'bg-orange-400',
};

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      getAnalytics(),
      getProblems({ sort: 'trending' }),
    ])
      .then(([analyticsData, problemsData]) => {
        setAnalytics(analyticsData);
        setProblems(problemsData.problems);
      })
      .catch((err) => setError(err.message || 'Analitika yuklanmadi'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return (
    <div className="text-center py-12">
      <p className="text-4xl mb-2">🔒</p>
      <p className="text-tg-hint text-sm">{error}</p>
      <p className="text-xs text-tg-hint mt-1">Admin ruxsati kerak</p>
    </div>
  );
  if (!analytics) return null;

  const totalSentiments = analytics.sentiments.reduce((sum, s) => sum + parseInt(s.count), 0);

  return (
    <div className="pb-8 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-tg-text">Analitika</h1>
        <p className="text-sm text-tg-hint">SignalAI Dashboard</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <p className="text-2xl font-bold text-tg-button">{analytics.stats.total_problems}</p>
          <p className="text-xs text-tg-hint">Jami muammolar</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <p className="text-2xl font-bold text-green-500">{analytics.stats.new_this_week}</p>
          <p className="text-xs text-tg-hint">Bu hafta yangi</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <p className="text-2xl font-bold text-orange-500">{parseFloat(analytics.stats.avg_urgency).toFixed(1)}</p>
          <p className="text-xs text-tg-hint">O'rtacha dolzarblik</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3">
          <p className="text-2xl font-bold text-purple-500">{analytics.stats.open_problems}</p>
          <p className="text-xs text-tg-hint">Ochiq muammolar</p>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h2 className="text-sm font-semibold mb-3">Kategoriyalar</h2>
        <div className="space-y-2">
          {analytics.categories.map((cat) => {
            const total = parseInt(analytics.stats.total_problems);
            const count = parseInt(cat.count);
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={cat.category} className="flex items-center gap-2">
                <span className="text-sm w-5">{CATEGORY_EMOJIS[cat.category] || '📋'}</span>
                <span className="text-xs text-tg-text w-24 truncate capitalize">{cat.category}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-tg-button h-2 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-tg-hint w-8 text-right">{cat.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sentiment breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h2 className="text-sm font-semibold mb-3">Sentiment tahlili</h2>
        <div className="flex rounded-full overflow-hidden h-4 mb-3">
          {analytics.sentiments.map((s) => {
            const pct = totalSentiments > 0 ? (parseInt(s.count) / totalSentiments) * 100 : 0;
            return (
              <div
                key={s.sentiment}
                className={`${SENTIMENT_COLORS[s.sentiment] || 'bg-gray-300'} transition-all`}
                style={{ width: `${pct}%` }}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          {analytics.sentiments.map((s) => (
            <div key={s.sentiment} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${SENTIMENT_COLORS[s.sentiment] || 'bg-gray-300'}`} />
              <span className="capitalize text-tg-hint">{s.sentiment}: {s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly top */}
      {analytics.weeklyTop.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h2 className="text-sm font-semibold mb-3">🔥 Haftalik top muammolar</h2>
          <div className="space-y-2">
            {analytics.weeklyTop.map((p, i) => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="text-sm font-bold text-tg-hint w-5">#{i + 1}</span>
                <span className="text-sm text-tg-text flex-1 truncate">{p.title}</span>
                <span className="text-xs text-tg-hint">👍 {p.vote_count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top keywords */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h2 className="text-sm font-semibold mb-3">Kalit so'zlar</h2>
        <div className="flex flex-wrap gap-2">
          {analytics.topKeywords.map((kw) => (
            <span
              key={kw.keyword}
              className="px-3 py-1 bg-tg-secondary rounded-full text-xs font-medium text-tg-text"
            >
              {kw.keyword} ({kw.count})
            </span>
          ))}
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h2 className="text-sm font-semibold mb-3">🗺️ Muammolar xaritasi</h2>
        <HeatmapMock problems={problems} />
      </div>
    </div>
  );
}
