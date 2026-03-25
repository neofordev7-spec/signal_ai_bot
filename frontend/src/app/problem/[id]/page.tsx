'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Problem } from '@/lib/types';
import { getProblem } from '@/lib/api';
import CategoryBadge from '@/components/CategoryBadge';
import UrgencyIndicator from '@/components/UrgencyIndicator';
import VoteButton from '@/components/VoteButton';
import LoadingSpinner from '@/components/LoadingSpinner';

const sentimentLabels: Record<string, { label: string; color: string }> = {
  positive: { label: 'Ijobiy', color: 'text-green-600' },
  negative: { label: 'Salbiy', color: 'text-red-600' },
  neutral: { label: 'Neytral', color: 'text-gray-600' },
  urgent: { label: 'Shoshilinch', color: 'text-orange-600' },
};

export default function ProblemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = parseInt(params.id as string, 10);
    if (isNaN(id)) {
      setError('Noto\'g\'ri ID');
      setLoading(false);
      return;
    }

    getProblem(id)
      .then(setProblem)
      .catch(() => setError('Muammo topilmadi'))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return (
    <div className="text-center py-12">
      <p className="text-4xl mb-2">😕</p>
      <p className="text-tg-hint">{error}</p>
      <button onClick={() => router.push('/')} className="mt-3 text-sm text-tg-link">
        Orqaga qaytish
      </button>
    </div>
  );
  if (!problem) return null;

  const sentiment = sentimentLabels[problem.sentiment] || sentimentLabels.neutral;

  return (
    <div className="pb-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-tg-link mb-4"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Orqaga
      </button>

      <div className="bg-white rounded-xl border border-gray-100 p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={problem.category} />
            <UrgencyIndicator urgency={problem.urgency} />
          </div>
          <VoteButton
            problemId={problem.id}
            voteCount={problem.vote_count}
            userVoted={problem.user_voted || false}
          />
        </div>

        {/* Title & Description */}
        <h1 className="text-lg font-bold text-tg-text mb-2">{problem.title}</h1>
        <p className="text-sm text-tg-text leading-relaxed mb-4">{problem.description}</p>

        {/* Image */}
        {problem.image_url && (
          <div className="mb-4">
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${problem.image_url}`}
              alt={problem.title}
              className="w-full rounded-lg object-cover max-h-[300px]"
            />
          </div>
        )}

        {/* AI Analysis */}
        <div className="bg-tg-secondary rounded-lg p-3 mb-4">
          <h3 className="text-sm font-semibold text-tg-text mb-2 flex items-center gap-1">
            🤖 AI Tahlili
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-tg-hint text-xs">Sentiment</span>
              <p className={`font-medium ${sentiment.color}`}>{sentiment.label}</p>
            </div>
            <div>
              <span className="text-tg-hint text-xs">Dolzarblik</span>
              <p className="font-medium">{problem.urgency}/5</p>
            </div>
            <div>
              <span className="text-tg-hint text-xs">Status</span>
              <p className="font-medium capitalize">{problem.status}</p>
            </div>
            <div>
              <span className="text-tg-hint text-xs">Ovozlar</span>
              <p className="font-medium">{problem.vote_count}</p>
            </div>
          </div>
          {problem.keywords && problem.keywords.length > 0 && (
            <div className="mt-3">
              <span className="text-tg-hint text-xs">Kalit so'zlar</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {problem.keywords.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white rounded-full text-xs text-tg-text">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Location */}
        {problem.lat && problem.lng && (
          <div className="bg-tg-secondary rounded-lg p-3 mb-4">
            <h3 className="text-sm font-semibold text-tg-text mb-1 flex items-center gap-1">
              📍 Joylashuv
            </h3>
            <p className="text-xs text-tg-hint">
              {problem.lat.toFixed(4)}, {problem.lng.toFixed(4)}
            </p>
          </div>
        )}

        {/* Meta */}
        <div className="text-xs text-tg-hint flex items-center gap-2">
          <span>{problem.first_name || 'Anonim'}</span>
          <span>•</span>
          <span>{new Date(problem.created_at).toLocaleDateString('uz-UZ', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
          })}</span>
        </div>
      </div>
    </div>
  );
}
