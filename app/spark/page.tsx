'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useStore } from '@/components/store';

export default function SparkPage() {
  const router = useRouter();
  const { sparks } = useStore();

  useEffect(() => {
    if (sparks[0]?.id) {
      router.replace(`/spark/${sparks[0].id}`);
    }
  }, [router, sparks]);

  if (sparks[0]?.id) {
    return null;
  }

  return (
    <Layout>
      <section className="rounded-xl border border-neon/20 bg-panelAlt p-6">
        <h2 className="text-xl font-semibold">No Sparks Yet</h2>
        <p className="mt-2 text-sm text-muted">Capture your first Spark in Vault to start momentum.</p>
        <Link href="/vault" className="mt-4 inline-block rounded bg-neon px-4 py-2 font-semibold text-black">
          Go to Vault
        </Link>
      </section>
    </Layout>
  );
}
