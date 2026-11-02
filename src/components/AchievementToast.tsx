"use client";

import React, { useEffect, useState } from 'react';
import { Achievement, OvertakeEvent } from '../types/achievement';

interface AchievementToastProps {
  queue: Achievement[];
  onDismiss: (id: string) => void;
  overtake?: OvertakeEvent | null;
  onDismissOvertake?: () => void;
}

export default function AchievementToast({ 
  queue, 
  onDismiss,
  overtake,
  onDismissOvertake 
}: AchievementToastProps) {
  const [currentAch, setCurrentAch] = useState<Achievement | null>(null);
  const [currentOvertake, setCurrentOvertake] = useState<OvertakeEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Handle Overtakes with top priority
  useEffect(() => {
    if (overtake && !currentOvertake && !currentAch) {
      setCurrentOvertake(overtake);
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          if (onDismissOvertake) onDismissOvertake();
          setCurrentOvertake(null);
        }, 300);
      }, 4500);

      return () => clearTimeout(timer);
    }
  }, [overtake, currentOvertake, currentAch, onDismissOvertake]);

  // Handle Achievement queue
  useEffect(() => {
    if (!currentAch && !currentOvertake && queue.length > 0) {
      const nextAch = queue[0];
      setCurrentAch(nextAch);
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onDismiss(nextAch.id);
          setCurrentAch(null);
        }, 300);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [queue, currentAch, currentOvertake, onDismiss]);

  if (!currentAch && !currentOvertake) return null;

  return (
    <div className={`fixed top-16 right-4 z-[9999] pointer-events-none transition-all duration-300 transform ${
      isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'
    }`}>
      {/* ================= LEADERBOARD OVERTAKE TOAST ================= */}
      {currentOvertake ? (
        <div className="relative group p-[2px] rounded-xl overflow-visible max-w-sm w-84 shadow-[0_0_35px_rgba(234,179,8,0.5)]">
          <div className="relative rounded-xl border-2 border-yellow-400 bg-gray-950 p-4 flex items-center gap-3 backdrop-blur-md">
            <div className="text-3xl animate-bounce filter drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]">
              🚀
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black tracking-widest uppercase text-yellow-400">
                  LEADERBOARD OVERTAKE!
                </span>
                <span className="text-xs font-mono font-black text-yellow-300">
                  #{currentOvertake.newRank}
                </span>
              </div>
              <div className="text-sm font-black text-white mt-0.5">
                Surpassed {currentOvertake.rivalName}!
              </div>
              <div className="text-xs text-gray-300 mt-0.5">
                {currentOvertake.rivalAffiliation}
              </div>
            </div>
          </div>
        </div>
      ) : currentAch?.rarity === 'LEGENDARY' ? (
        // ================= LEGENDARY RGB GLOWING BORDER TOAST =================
        <div className="relative rainbow-border rounded-xl p-3.5 max-w-sm w-80 shadow-[0_0_25px_rgba(255,0,128,0.4)] backdrop-blur-md flex items-center gap-3">
          <div className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,215,0,0.8)] animate-bounce">
            {currentAch.icon}
          </div>
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-widest uppercase text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]">
                LEGENDARY CHIEVO
              </span>
              <span className="text-[10px] text-yellow-400 font-mono font-bold animate-pulse">
                ★ MYTHIC ★
              </span>
            </div>
            <div className="text-sm font-black text-white tracking-wide truncate mt-0.5">
              {currentAch.title}
            </div>
            <div className="text-xs text-gray-300 leading-tight mt-0.5">
              {currentAch.description}
            </div>
          </div>
        </div>
      ) : currentAch?.rarity === 'EPIC' ? (
        // ================= EPIC GOLDEN TOAST =================
        <div className="relative rounded-xl border border-yellow-500/80 bg-gray-950/95 p-3.5 max-w-sm w-80 shadow-[0_0_20px_rgba(234,179,8,0.35)] backdrop-blur-md flex items-center gap-3">
          <div className="text-3xl filter drop-shadow-[0_0_6px_rgba(234,179,8,0.7)]">
            {currentAch.icon}
          </div>
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-widest uppercase text-yellow-400">
                EPIC ACHIEVEMENT
              </span>
              <span className="text-[10px] text-yellow-500 font-mono">GOLD</span>
            </div>
            <div className="text-sm font-black text-yellow-100 tracking-wide truncate mt-0.5">
              {currentAch.title}
            </div>
            <div className="text-xs text-gray-400 leading-tight mt-0.5">
              {currentAch.description}
            </div>
          </div>
        </div>
      ) : currentAch?.rarity === 'RARE' ? (
        // ================= RARE BLUE/CYAN TOAST =================
        <div className="relative rounded-xl border border-sky-500/60 bg-gray-950/95 p-3.5 max-w-sm w-80 shadow-[0_0_15px_rgba(14,165,233,0.3)] backdrop-blur-md flex items-center gap-3">
          <div className="text-3xl filter drop-shadow-[0_0_5px_rgba(14,165,233,0.6)]">
            {currentAch.icon}
          </div>
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-widest uppercase text-sky-400">
                RARE ACHIEVEMENT
              </span>
              <span className="text-[10px] text-sky-500 font-mono">SILVER</span>
            </div>
            <div className="text-sm font-bold text-sky-100 tracking-wide truncate mt-0.5">
              {currentAch.title}
            </div>
            <div className="text-xs text-gray-400 leading-tight mt-0.5">
              {currentAch.description}
            </div>
          </div>
        </div>
      ) : (
        // ================= COMMON BRONZE/SLATE TOAST =================
        <div className="relative rounded-xl border border-gray-700 bg-gray-900/95 p-3.5 max-w-sm w-80 shadow-[0_0_10px_rgba(0,0,0,0.5)] backdrop-blur-md flex items-center gap-3">
          <div className="text-2xl text-emerald-400">
            {currentAch?.icon}
          </div>
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">
                ACHIEVEMENT UNLOCKED
              </span>
              <span className="text-[10px] text-gray-500 font-mono">BRONZE</span>
            </div>
            <div className="text-sm font-semibold text-white tracking-wide truncate mt-0.5">
              {currentAch?.title}
            </div>
            <div className="text-xs text-gray-400 leading-tight mt-0.5">
              {currentAch?.description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
