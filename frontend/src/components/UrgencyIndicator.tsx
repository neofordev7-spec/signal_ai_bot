'use client';

const urgencyConfig: Record<number, { label: string; color: string }> = {
  1: { label: 'Past', color: 'text-green-500' },
  2: { label: "O'rtacha past", color: 'text-lime-500' },
  3: { label: "O'rtacha", color: 'text-yellow-500' },
  4: { label: 'Yuqori', color: 'text-orange-500' },
  5: { label: 'Juda yuqori', color: 'text-red-500' },
};

export default function UrgencyIndicator({ urgency }: { urgency: number }) {
  const cfg = urgencyConfig[urgency] || urgencyConfig[3];

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`w-1.5 h-3 rounded-sm ${level <= urgency ? cfg.color.replace('text-', 'bg-') : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
    </div>
  );
}
