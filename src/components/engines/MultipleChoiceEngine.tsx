'use client';

import React, { useState } from 'react';
import { EngineProps } from '../../types/game';

interface MultipleChoiceOption {
  text: string;
  isCorrect: boolean;
  feedback?: string;
}

interface MultipleChoicePayload {
  question: string;
  options: MultipleChoiceOption[];
}

export default function MultipleChoiceEngine({
  payload,
  onWin,
  onLose,
  isActive
}: EngineProps<MultipleChoicePayload>) {
  const [selectedWrong, setSelectedWrong] = useState<number | null>(null);
  const [hasWon, setHasWon] = useState(false);

  const handleOptionClick = (idx: number, isCorrect: boolean) => {
    if (!isActive || hasWon) return;

    if (isCorrect) {
      setHasWon(true);
      setSelectedWrong(null);
      setTimeout(() => {
        onWin();
      }, 400); // Small visual delay to show the green button
    } else {
      setSelectedWrong(idx);
    }
  };

  return (
    <div className="w-full h-full bg-slate-900 border border-slate-700 rounded-lg p-6 flex flex-col font-sans shadow-[0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden">
      <div className="text-xl md:text-2xl font-bold text-white mb-6 leading-relaxed border-b border-slate-700 pb-4 tracking-wide">
        {payload.question}
      </div>

      <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
        {payload.options.map((opt, idx) => {
          const isSelectedWrong = selectedWrong === idx;
          return (
            <div key={idx} className="flex flex-col">
              <button
                disabled={!isActive || hasWon || isSelectedWrong}
                onClick={() => handleOptionClick(idx, opt.isCorrect)}
                className={`
                  p-4 rounded-lg text-left font-semibold text-sm md:text-md transition-all duration-200 border-2 
                  ${hasWon && opt.isCorrect ? 'bg-green-600 border-green-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]' : ''}
                  ${isSelectedWrong ? 'bg-red-950 border-red-700 text-red-300 opacity-70' : ''}
                  ${!hasWon && !isSelectedWrong ? 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:border-blue-500' : ''}
                `}
              >
                {opt.text}
              </button>
              
              {isSelectedWrong && opt.feedback && (
                <div className="mt-2 text-sm text-red-400 bg-red-950/80 p-3 rounded border border-red-800 animate-pulse flex items-start gap-2">
                  <span className="text-xl leading-none">⚠️</span>
                  <div>
                    <span className="font-black uppercase tracking-widest block mb-1">Incorrect</span>
                    {opt.feedback}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
