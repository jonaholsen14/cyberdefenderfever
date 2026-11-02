'use client';

import React, { useState, useEffect } from 'react';
import { EngineProps } from '../../types/game';

export default function TutorialEngine({
  payload,
  onWin,
  isActive
}: EngineProps) {
  const [hasWon, setHasWon] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  const isStandalone = Boolean(payload?.isStandalone);

  useEffect(() => {
    // Default to true so players aren't repeatedly prompted unless they want to be
    const stored = localStorage.getItem('ccdc_tutorial_seen');
    if (stored === 'false') {
      setDontShowAgain(false);
    }
  }, []);

  const handleStart = () => {
    if (!isActive || hasWon) return;
    setHasWon(true);
    if (dontShowAgain) {
      localStorage.setItem('ccdc_tutorial_seen', 'true');
    } else {
      localStorage.removeItem('ccdc_tutorial_seen');
    }
    onWin();
  };

  return (
    <div className="w-full h-full bg-slate-950 border-2 border-emerald-500/60 rounded-xl p-4 md:p-6 flex flex-col justify-between font-sans shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-y-auto">
      
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
            SECURE CHANNEL // PROTOCOL OVERVIEW
          </span>
        </div>
        <div className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 font-bold uppercase tracking-wider">
          BLUE TEAM ORIENTATION
        </div>
      </div>

      {/* Main Content Grid: 4 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-3">
        
        {/* Pillar 1: Card System */}
        <div className="bg-gray-900/90 border border-cyan-500/40 rounded-xl p-3.5 flex flex-col justify-between shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:border-cyan-400/80 transition-all">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">⚡</span>
              <h3 className="text-sm font-black text-cyan-300 tracking-wide uppercase">
                1. Rapid Microgames
              </h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Triage rapid security cards: terminal <span className="text-cyan-400 font-mono font-bold">CLI</span> commands, configuration file editing (<span className="text-cyan-400 font-mono font-bold">nano</span>), GUI security settings, and multiple choice injects.
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-gray-800 text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
            <span>⭐</span> Clear with &gt;50% time left for a <strong className="text-yellow-300 font-bold">PERFECT</strong> bonus!
          </div>
        </div>

        {/* Pillar 2: Red Team Hacks (Mutators) */}
        <div className="bg-gray-900/90 border border-red-500/40 rounded-xl p-3.5 flex flex-col justify-between shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:border-red-400/80 transition-all">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">👾</span>
              <h3 className="text-sm font-black text-red-400 tracking-wide uppercase">
                2. Red Team Mutators
              </h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Active attacks will randomly compromise your terminal: <span className="text-red-300 font-semibold">upside-down screen</span>, <span className="text-red-300 font-semibold">static blur</span>, <span className="text-red-300 font-semibold">earthquake shakes</span>, and <span className="text-red-300 font-semibold">color inverts</span>.
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-gray-800 text-[11px] font-mono text-pink-400 font-semibold flex items-center gap-1.5">
            <span>🛡️</span> Type through chaos to earn <strong className="text-pink-300 font-bold">HACKED &amp; MYTHIC 👑</strong> clears!
          </div>
        </div>

        {/* Pillar 3: Fever Points & Badges */}
        <div className="bg-gray-900/90 border border-yellow-500/40 rounded-xl p-3.5 flex flex-col justify-between shadow-[0_0_15px_rgba(234,179,8,0.1)] hover:border-yellow-400/80 transition-all">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">🔥</span>
              <h3 className="text-sm font-black text-yellow-300 tracking-wide uppercase">
                3. Fever Points &amp; Badges
              </h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Earn <span className="text-yellow-400 font-bold">Fever Points (FP)</span> on every clear, daily streak, and achievement. Unlock badges in the <span className="text-yellow-400 font-bold">Trophy Room</span> to equip animated name borders!
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-gray-800 text-[11px] font-mono text-orange-400 font-semibold flex items-center gap-1.5">
            <span>🏆</span> Climb the live global leaderboard and overtake rivals!
          </div>
        </div>

        {/* Pillar 4: Feedback & Bug Reports */}
        <div className="bg-gray-900/90 border border-blue-500/40 rounded-xl p-3.5 flex flex-col justify-between shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:border-blue-400/80 transition-all">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">📋</span>
              <h3 className="text-sm font-black text-blue-300 tracking-wide uppercase">
                4. Feedback &amp; Improvements
              </h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Found a bug, typo, or have an idea for an awesome new microgame? Click the <span className="text-blue-400 font-bold">Feedback</span> button in the top navigation bar anytime to submit reports.
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-gray-800 text-[11px] font-mono text-blue-300 font-semibold flex items-center gap-1.5">
            <span>☁️</span> Connect your Google/Email account to sync progress to cloud!
          </div>
        </div>

      </div>

      {/* Interactive Bottom Control Bar */}
      <div className="pt-3 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-400 hover:text-gray-200 transition-colors">
          <input 
            type="checkbox" 
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500"
          />
          <span>Don't show this briefing before Daily again</span>
        </label>

        <button
          disabled={!isActive || hasWon}
          onClick={handleStart}
          className={`px-8 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 border-2 ${
            hasWon 
              ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.6)]'
              : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95'
          }`}
        >
          <span>{hasWon ? 'COMMENCING...' : (isStandalone ? 'RETURN TO BASE' : 'START DAILY GAUNTLET')}</span>
          <span>▶</span>
        </button>
      </div>

    </div>
  );
}
