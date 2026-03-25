'use client';

import Link from 'next/link';
import { Problem } from '@/lib/types';

export default function TrendingBar({ problems }: { problems: Problem[] }) {
  if (problems.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-tg-text mb-2 flex items-center gap-1">
        🔥 Trending muammolar
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {problems.slice(0, 5).map((p) => (
          <Link key={p.id} href={`/problem/${p.id}`}>
            <div className="flex-shrink-0 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 rounded-lg px-3 py-2 min-w-[180px] max-w-[200px]">
              <p className="text-xs font-medium text-tg-text truncate">{p.title}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-tg-hint">
                <span>👍 {p.vote_count}</span>
                <span className="truncate">{p.category}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
