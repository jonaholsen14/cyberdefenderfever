"use client";

import React from 'react';
import { PlayerStats } from '../types/achievement';
import { ACHIEVEMENTS } from '../data/achievements';
import PlayerNameBadge from './PlayerNameBadge';
import { useAuth } from '../context/AuthContext';

interface GlobalHeaderProps {
  stats: PlayerStats;
  inGame: boolean;
  currentCardNumber?: number;
  totalCards?: number;
  isTutorial?: boolean;
  onOpenLeaderboard: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onOpenBugReport: () => void;
  onGoHome: () => void;
}

function GlobalHeader({
  stats,
  inGame,
  currentCardNumber,
  totalCards,
  isTutorial,
  onOpenLeaderboard,
  onOpenProfile,
  onOpenAuth,
  onOpenBugReport,
  onGoHome
}: GlobalHeaderProps) {
  const { user } = useAuth();

  // Find equipped badge icon and title
  const equippedBadge = stats.selectedBadgeId 
    ? ACHIEVEMENTS.find(a => a.id === stats.selectedBadgeId) 
    : ACHIEVEMENTS[0];

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-gray-950/90 border-b border-gray-800/80 backdrop-blur-md z-40 flex items-center justify-between px-3 sm:px-6 select-none font-sans">
      
      {/* Brand & Main Nav */}
      <div className="flex items-center gap-4 sm:gap-6">
        <button 
          onClick={onGoHome}
          className="flex items-center gap-2 group text-left focus:outline-none"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="font-black text-xs sm:text-sm tracking-widest uppercase text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)] group-hover:text-emerald-300 transition-colors">
            Cyber Defender Fever
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-400">
          <button 
            onClick={onGoHome}
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-gray-800/60 transition-all"
          >
            Home
          </button>
          <button 
            onClick={onOpenLeaderboard}
            className="px-3 py-1.5 rounded-lg hover:text-yellow-400 hover:bg-yellow-950/20 transition-all flex items-center gap-1"
          >
            <span>🏆</span> Leaderboard
          </button>
          <button 
            onClick={onOpenProfile}
            className="px-3 py-1.5 rounded-lg hover:text-sky-400 hover:bg-sky-950/20 transition-all flex items-center gap-1"
          >
            <span>🎖️</span> Trophy Room
          </button>
        </nav>
      </div>

      {/* Center: In-Game Situation Pill */}
      {inGame && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-xs font-mono">
          {isTutorial ? (
            <span className="font-bold text-emerald-400">ORIENTATION: BRIEFING</span>
          ) : currentCardNumber !== undefined && totalCards !== undefined ? (
            <>
              <span className="text-gray-400">DEFENDING:</span>
              <span className="font-bold text-white">{currentCardNumber} / {totalCards}</span>
              {stats.currentStreak > 1 && (
                <span className="text-orange-400 font-bold ml-1">🔥 {stats.currentStreak}x</span>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* Right: Feedback Button, Points, Auth Status / Player Pill */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Playtest Feedback Button */}
        <button
          onClick={onOpenBugReport}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700/80 text-gray-300 hover:text-white transition-all text-xs font-bold group shadow-sm"
          title="Submit Bug Report or Feature Idea"
        >
          <span className="group-hover:scale-125 transition-transform">📝</span>
          <span className="hidden sm:inline">Feedback</span>
        </button>

        {/* Fever Points Counter */}
        <button
          onClick={onOpenLeaderboard}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-orange-950/30 border border-orange-500/40 text-orange-400 hover:bg-orange-900/40 hover:border-orange-400 transition-all shadow-[0_0_10px_rgba(249,115,22,0.15)] group"
          title="View Leaderboard"
        >
          <span className="text-sm group-hover:scale-125 transition-transform">🔥</span>
          <span className="text-xs font-black tracking-wider text-orange-300">
            {stats.feverPoints.toLocaleString()} <span className="text-[10px] text-orange-400">FP</span>
          </span>
        </button>

        {/* Player Profile Badge */}
        <PlayerNameBadge
          username={stats.username || 'Defender'}
          icon={equippedBadge ? equippedBadge.icon : '🛡️'}
          rarity={equippedBadge ? equippedBadge.rarity : 'COMMON'}
          onClick={onOpenProfile}
          size="md"
        />

        {/* Sign In / Cloud Pill if Guest */}
        {!user ? (
          <button
            onClick={onOpenAuth}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/50 text-blue-300 hover:text-blue-100 text-xs font-bold transition-all shadow-[0_0_12px_rgba(59,130,246,0.2)]"
            title="Log in to save stats to cloud & claim unique handle"
          >
            <span>☁️</span>
            <span>Sign In</span>
          </button>
        ) : (
          <div 
            className="hidden sm:block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            title={`Synced as ${user.email || user.displayName}`}
          />
        )}

        {/* In-game Abort / Exit Button */}
        {inGame && (
          <button
            onClick={onGoHome}
            className="px-2.5 py-1 text-[11px] font-bold text-red-400 bg-red-950/30 hover:bg-red-900/40 border border-red-800/60 rounded-lg transition-all"
            title="Quit run to main menu"
          >
            EXIT
          </button>
        )}
      </div>

    </header>
  );
}

const GlobalHeaderMemo = React.memo(GlobalHeader);
GlobalHeaderMemo.displayName = 'GlobalHeader';
export default GlobalHeaderMemo;
