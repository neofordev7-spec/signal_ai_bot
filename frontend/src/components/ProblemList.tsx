'use client';

import { useState, useEffect } from 'react';
import { Problem } from '@/lib/types';
import { getProblems } from '@/lib/api';
import ProblemCard from './ProblemCard';
import TrendingBar from './TrendingBar';
import LoadingSpinner from './LoadingSpinner';

const CATEGORIES = [
  { value: '', label: 'Barchasi' },
  { value: 'infrastructure', label: '🏗️ Infratuzilma' },
  { value: 'education', label: "📚 Ta'lim" },
  { value: 'healthcare', label: "🏥 Sog'liq" },
  { value: 'safety', label: '🛡️ Xavfsizlik' },
  { value: 'environment', label: '🌿 Atrof-muhit' },
  { value: 'transport', label: '🚌 Transport' },
  { value: 'social', label: '👥 Ijtimoiy' },
  { value: 'government', label: '🏛️ Davlat' },
];

const SORTS = [
  { value: 'new', label: 'Yangi' },
  { value: 'trending', label: 'Trending' },
  { value: 'urgent', label: 'Dolzarb' },
];

export default function ProblemList() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [trending, setTrending] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('new');
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mainRes, trendRes] = await Promise.all([
        getProblems({ category: category || undefined, sort }),
        getProblems({ sort: 'trending', limit: 5 } as any),
      ]);
      setProblems(mainRes.problems);
      setTotal(mainRes.total);
      setTrending(trendRes.problems);
    } catch (err) {
      console.error('Failed to fetch problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category, sort]);

  return (
    <div>
      {/* Trending */}
      <TrendingBar problems={trending} />

      {/* Filters */}
      <div className="mb-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${category === cat.value
                  ? 'bg-tg-button text-tg-button-text'
                  : 'bg-tg-secondary text-tg-text'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-tg-hint">{total} ta muammo</span>
        <div className="flex gap-1">
          {SORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSort(s.value)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors
                ${sort === s.value
                  ? 'bg-tg-button text-tg-button-text'
                  : 'text-tg-hint hover:text-tg-text'
                }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Problem list */}
      {loading ? (
        <LoadingSpinner />
      ) : problems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">🔍</p>
          <p className="text-tg-hint text-sm">Muammolar topilmadi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {problems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
          ))}
        </div>
      )}
    </div>
  );
}
