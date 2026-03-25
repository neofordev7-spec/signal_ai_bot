'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Asosiy', icon: '🏠' },
  { href: '/submit', label: 'Yuborish', icon: '✏️' },
  { href: '/dashboard', label: 'Analitika', icon: '📊' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-4 text-xs transition-colors
                ${active ? 'text-tg-button' : 'text-tg-hint hover:text-tg-text'}
              `}
            >
              <span className="text-lg mb-0.5">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
