'use client';

const categoryConfig: Record<string, { label: string; color: string; emoji: string }> = {
  infrastructure: { label: 'Infratuzilma', color: 'bg-orange-100 text-orange-700', emoji: '🏗️' },
  education: { label: "Ta'lim", color: 'bg-blue-100 text-blue-700', emoji: '📚' },
  healthcare: { label: "Sog'liq", color: 'bg-red-100 text-red-700', emoji: '🏥' },
  safety: { label: 'Xavfsizlik', color: 'bg-yellow-100 text-yellow-700', emoji: '🛡️' },
  environment: { label: 'Atrof-muhit', color: 'bg-green-100 text-green-700', emoji: '🌿' },
  transport: { label: 'Transport', color: 'bg-purple-100 text-purple-700', emoji: '🚌' },
  social: { label: 'Ijtimoiy', color: 'bg-pink-100 text-pink-700', emoji: '👥' },
  government: { label: 'Davlat', color: 'bg-indigo-100 text-indigo-700', emoji: '🏛️' },
  other: { label: 'Boshqa', color: 'bg-gray-100 text-gray-700', emoji: '📋' },
  uncategorized: { label: 'Tasniflanmagan', color: 'bg-gray-100 text-gray-500', emoji: '❓' },
};

export default function CategoryBadge({ category }: { category: string }) {
  const cfg = categoryConfig[category] || categoryConfig.other;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.emoji} {cfg.label}
    </span>
  );
}
