'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  ['Command', '/'],
  ['Capture', '/add-spark'],
  ['Vault', '/vault'],
  ['Branches', '/branches'],
  ['Progress Analytics', '/stats'],
  ['Suns', '/stats']
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-4 px-4 py-4 sm:px-6">
      <aside className="sticky top-4 h-[calc(100vh-2rem)] w-64 shrink-0 rounded-2xl border border-neon/40 bg-panel/85 p-4 shadow-glow backdrop-blur">
        <p className="text-[11px] uppercase tracking-[0.3em] text-neonDim">Creative Momentum OS</p>
        <p className="mt-2 text-lg font-semibold text-amber-100">App Shell</p>
        <nav className="mt-6 space-y-2 text-sm">
          {nav.map(([label, href]) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`block rounded-lg border px-3 py-2 transition ${
                  active
                    ? 'border-neon bg-neon/20 text-text'
                    : 'border-neon/30 bg-panelAlt/80 text-muted hover:border-neon/80 hover:text-text'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="grid-matrix flex-1 rounded-2xl border border-neon/20 bg-panel/60 p-5 backdrop-blur">{children}</main>
    </div>
  );
}
