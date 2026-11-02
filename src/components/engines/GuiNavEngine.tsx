'use client';

import React, { useState } from 'react';
import { EngineProps } from '../../types/game';

interface GuiNavStep {
  options: string[];
  correctOption: string;
}

interface GuiNavPayload {
  windowTitle: string;
  steps: GuiNavStep[];
  finalToggle: {
    label: string;
  };
}

export default function GuiNavEngine({
  payload,
  onWin,
  onLose,
  isActive
}: EngineProps<GuiNavPayload>) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errorFlash, setErrorFlash] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const isFinalStep = currentStepIndex >= payload.steps.length;

  const handleOptionClick = (opt: string) => {
    if (!isActive || errorFlash || hasWon) return;

    const currentStep = payload.steps[currentStepIndex];
    if (opt === currentStep.correctOption) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setErrorFlash(true);
      setTimeout(() => setErrorFlash(false), 500); // Penalty stun
    }
  };

  const handleToggleClick = () => {
    if (!isActive || hasWon) return;
    setHasWon(true);
    setTimeout(() => {
      onWin();
    }, 400); // Visual delay
  };

  return (
    <div className={`w-full h-full bg-white text-black font-sans border border-gray-400 shadow-xl overflow-hidden flex flex-col transition-all duration-200 ${errorFlash ? 'bg-red-200 border-red-500' : ''}`}>
      
      {/* Windows-style Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-100 border-b border-gray-300 select-none">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <span className="text-xl">⚙️</span> {payload.windowTitle}
        </div>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500 font-mono select-none flex gap-2 overflow-x-auto">
         <span>Home</span>
         {payload.steps.slice(0, currentStepIndex).map((s, i) => (
           <React.Fragment key={i}>
             <span>{'>'}</span>
             <span className="text-gray-700 font-bold whitespace-nowrap">{s.correctOption}</span>
           </React.Fragment>
         ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-white flex flex-col items-center">
        {!isFinalStep ? (
          <div className="w-full max-w-sm flex flex-col gap-3 mt-4">
            {payload.steps[currentStepIndex].options.map((opt, idx) => (
              <button
                key={idx}
                disabled={!isActive || errorFlash}
                onClick={() => handleOptionClick(opt)}
                className={`flex items-center gap-3 p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded text-left transition-all
                  ${errorFlash ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span className="text-2xl text-blue-400">📁</span>
                <span className="font-semibold text-gray-700">{opt}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="w-full max-w-sm mt-8 border border-gray-200 rounded p-6 bg-gray-50 shadow-sm flex flex-col items-center">
            <div className="text-4xl mb-4">🛡️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">{payload.finalToggle.label}</h2>
            <p className="text-xs text-gray-500 mb-6 text-center">Enable this to secure the system against exploits.</p>
            
            <button
              disabled={!isActive}
              onClick={handleToggleClick}
              className={`relative w-20 h-10 rounded-full transition-colors duration-300 ${hasWon ? 'bg-green-500' : 'bg-gray-400'}`}
            >
              <div 
                className={`absolute top-1 w-8 h-8 rounded-full bg-white shadow-md transition-transform duration-300 ${hasWon ? 'left-11' : 'left-1'}`}
              ></div>
            </button>
            <div className="mt-3 text-sm font-bold text-gray-700">
              {hasWon ? 'ENABLED' : 'DISABLED'}
            </div>
          </div>
        )}
      </div>

      {errorFlash && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 pointer-events-none z-50">
          <span className="text-red-600 font-black text-6xl drop-shadow-md">INVALID PATH</span>
        </div>
      )}
    </div>
  );
}
