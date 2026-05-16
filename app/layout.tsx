import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/components/store';

export const metadata: Metadata = {
  title: 'Creative Momentum OS',
  description: 'Turn inspiration into sustained momentum.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><StoreProvider>{children}</StoreProvider></body>
    </html>
  );
}
