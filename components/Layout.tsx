'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  ['Player Dashboard', '/'],
  ['Capture', '/add-spark'],
  ['Inventory', '/vault'],
  ['Skill Trees', '/branches'],
  ['Progress Analytics', '/stats']
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 pb-20 pt-4 sm:px-6">
      <header className="mb-6 rounded-2xl border border-neon/40 bg-panel/80 p-4 shadow-glow backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-neonDim">Creative Momentum OS</p>
        <h1 className="mt-2 text-2xl font-semibold">Player Dashboard / Command</h1>
        <nav className="mt-4 grid grid-cols-2 gap-2 text-sm sm:flex sm:flex-wrap">
          {nav.map(([label, href]) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg border px-3 py-2 text-center backdrop-blur-sm transition ${active ? 'border-neon bg-neon/20 text-text' : 'border-neon/40 bg-panelAlt/85 text-muted hover:border-neon/80 hover:text-text'}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="grid-matrix rounded-2xl border border-neon/20 bg-panel/60 p-4 backdrop-blur">{children}</main>
    </div>
  );
}
