'use client';

import Link from 'next/link';
import { Problem } from '@/lib/types';
import CategoryBadge from './CategoryBadge';
import UrgencyIndicator from './UrgencyIndicator';
import VoteButton from './VoteButton';

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'hozirgina';
  if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} kun oldin`;
  return date.toLocaleDateString('uz-UZ');
}

export default function ProblemCard({ problem }: { problem: Problem }) {
  return (
    <Link href={`/problem/${problem.id}`}>
      <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <CategoryBadge category={problem.category} />
              <UrgencyIndicator urgency={problem.urgency} />
            </div>
            <h3 className="font-semibold text-[15px] text-tg-text leading-tight mb-1">
              {problem.title}
            </h3>
            <p className="text-sm text-tg-hint line-clamp-2">
              {problem.description}
            </p>
          </div>
          <VoteButton
            problemId={problem.id}
            voteCount={problem.vote_count}
            userVoted={problem.user_voted || false}
          />
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-tg-hint">
          <span>{problem.first_name || 'Anonim'}</span>
          <span>{timeAgo(problem.created_at)}</span>
          {problem.lat && problem.lng && (
            <span className="flex items-center gap-0.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Joylashuv
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
