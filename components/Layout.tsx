'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { key: 'command', label: 'Command', href: '/' },
  { key: 'capture', label: 'Capture', href: '/add-spark' },
  { key: 'vault', label: 'Vault', href: '/vault' },
  { key: 'pillars', label: 'Pillars', href: '/branches' },
  { key: 'progress', label: 'Progress', href: '/stats' }
] as const;

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-4 px-4 py-4 sm:px-6">
      <aside className="sticky top-4 h-[calc(100vh-2rem)] w-64 shrink-0 rounded-2xl border border-neon/40 bg-panel/85 p-4 shadow-glow backdrop-blur">
        <p className="text-lg font-semibold text-amber-100">Creative Momentum OS</p>
        <nav className="mt-6 space-y-2 text-sm">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`block rounded-lg border px-3 py-2 transition ${
                  active
                    ? 'border-neon bg-neon/20 text-text'
                    : 'border-neon/30 bg-panelAlt/80 text-muted hover:border-neon/80 hover:text-text'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="grid-matrix flex-1 rounded-2xl border border-neon/20 bg-panel/60 p-5 backdrop-blur">{children}</main>
    </div>
  );
}
