'use client';

import { useApp } from '@/context/AppContext';
import ProblemList from '@/components/ProblemList';

export default function HomePage() {
  const { user } = useApp();

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-tg-text">
          SignalAI
        </h1>
        <p className="text-sm text-tg-hint">
          {user ? `Salom, ${user.first_name}!` : 'Shahardagi muammolarni xabar bering'}
        </p>
      </div>
      <ProblemList />
    </div>
  );
}
