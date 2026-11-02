'use client';

import dynamic from 'next/dynamic';

const GameManager = dynamic(() => import('../components/GameManager'), { ssr: false });

export default function Home() {
  return (
    <main className="h-screen w-screen bg-black text-white overflow-hidden">
      <GameManager />
    </main>
  );
}

