'use client';

import { useState } from 'react';
import { vote as voteApi } from '@/lib/api';
import { getTelegramWebApp } from '@/lib/telegram';

interface VoteButtonProps {
  problemId: number;
  voteCount: number;
  userVoted: boolean;
}

export default function VoteButton({ problemId, voteCount: initialCount, userVoted: initialVoted }: VoteButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [loading, setLoading] = useState(false);

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      const result = await voteApi(problemId);
      setCount(result.voteCount);
      setVoted(result.voted);

      const webapp = getTelegramWebApp();
      webapp?.HapticFeedback.impactOccurred('light');
    } catch (err) {
      console.error('Vote failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleVote}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
        ${voted
          ? 'bg-tg-button text-tg-button-text'
          : 'bg-tg-secondary text-tg-text hover:bg-tg-button hover:text-tg-button-text'
        }
        ${loading ? 'opacity-50' : ''}
      `}
    >
      <svg
        className={`w-4 h-4 ${voted ? 'fill-current' : ''}`}
        viewBox="0 0 24 24"
        fill={voted ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
      </svg>
      {count}
    </button>
  );
}
