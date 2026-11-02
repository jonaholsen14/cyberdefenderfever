'use client';

import React, { useState } from 'react';
import { EngineProps } from '../../types/game';

interface StudyBreakPayload {
  fact: string;
}

export default function StudyBreakEngine({
  payload,
  onWin,
  isActive
}: EngineProps<StudyBreakPayload>) {
  const [hasWon, setHasWon] = useState(false);

  const handleAcknowledge = () => {
    if (!isActive || hasWon) return;
    setHasWon(true);
    onWin();
  };

  return (
    <div className="w-full h-full bg-slate-900 border-2 border-indigo-500 rounded-lg p-8 flex flex-col items-center justify-center font-sans shadow-[0_0_40px_rgba(99,102,241,0.3)] relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
      
      <div className="text-6xl mb-6 animate-pulse">☕</div>
      
      <h2 className="text-3xl md:text-4xl font-black text-indigo-400 mb-8 uppercase tracking-widest drop-shadow-md">
        Study Break
      </h2>
      
      <p className="text-lg md:text-xl text-slate-200 text-center leading-relaxed max-w-2xl bg-black/40 p-8 rounded-xl border border-indigo-500/30 shadow-inner">
        {payload.fact}
      </p>
      
      <button 
        disabled={!isActive || hasWon}
        onClick={handleAcknowledge}
        className={`mt-10 px-8 py-3 font-bold rounded shadow-lg transition-all border-2 
          ${hasWon 
            ? 'bg-green-600 border-green-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]' 
            : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400 text-white'
          }`}
      >
        {hasWon ? 'GOT IT!' : 'COOL!'}
      </button>

    </div>
  );
}
