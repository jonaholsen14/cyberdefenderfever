"use client";

import React, { useState, useMemo } from 'react';
import { AchievementRarity, PlayerStats } from '../types/achievement';
import { ACHIEVEMENTS } from '../data/achievements';
import { getPlayerStats, getAchievementProgress, equipBadge, updateUsername } from '../utils/achievementManager';
import PlayerNameBadge from './PlayerNameBadge';
import { useAuth } from '../context/AuthContext';

interface TrophyRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: () => void;
  onOpenAuth?: () => void;
}

export default function TrophyRoomModal({ isOpen, onClose, onProfileUpdated, onOpenAuth }: TrophyRoomModalProps) {
  const { user, claimUsername, logout } = useAuth();
  const [filter, setFilter] = useState<AchievementRarity | 'ALL' | 'SECRET'>('ALL');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);

  const stats: PlayerStats = useMemo(() => {
    return isOpen ? getPlayerStats() : {} as PlayerStats;
  }, [isOpen]);

  const unlockedIds = useMemo(() => new Set(stats.unlockedAchievementIds || []), [stats.unlockedAchievementIds]);

  const equippedBadge = useMemo(() => {
    return stats.selectedBadgeId 
      ? ACHIEVEMENTS.find(a => a.id === stats.selectedBadgeId) 
      : ACHIEVEMENTS[0];
  }, [stats.selectedBadgeId]);

  const filteredAchievements = useMemo(() => {
    return ACHIEVEMENTS.filter(ach => {
      if (filter === 'ALL') return true;
      if (filter === 'SECRET') return ach.secret;
      return ach.rarity === filter;
    });
  }, [filter]);

  const unlockedCount = useMemo(() => {
    return ACHIEVEMENTS.filter(a => unlockedIds.has(a.id)).length;
  }, [unlockedIds]);

  const progressPercent = useMemo(() => {
    return Math.round((unlockedCount / ACHIEVEMENTS.length) * 100);
  }, [unlockedCount]);

  if (!isOpen) return null;

  const handleEquip = (badgeId: string) => {
    equipBadge(badgeId);
    if (onProfileUpdated) onProfileUpdated();
  };

  const handleSaveUsername = async () => {
    const raw = usernameInput.trim();
    if (!raw) {
      setIsEditingUsername(false);
      return;
    }

    setNameError(null);
    setSavingName(true);

    if (user) {
      // Logged in: Claim unique username in Firestore
      const res = await claimUsername(raw);
      if (!res.success) {
        setNameError(res.error || 'Failed to update username');
        setSavingName(false);
        return;
      }
    }

    // Update locally and through active adapter
    updateUsername(raw);
    if (onProfileUpdated) onProfileUpdated();
    setSavingName(false);
    setIsEditingUsername(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gray-950 border-2 border-gray-800 rounded-2xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] font-sans">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-gray-900 border-b border-gray-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl flex-shrink-0">🏆</span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase whitespace-nowrap">
                  Trophy Room & Profile
                </h2>
                {/* Username Editor */}
                <div className="flex items-center gap-1.5">
                  {isEditingUsername ? (
                    <div className="flex items-center gap-1">
                      <input 
                        type="text"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder={stats.username}
                        maxLength={18}
                        className="bg-black border-2 border-blue-500 text-white px-2 py-0.5 rounded-lg text-xs focus:outline-none w-28 sm:w-36"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveUsername()}
                      />
                      <button 
                        onClick={handleSaveUsername}
                        disabled={savingName}
                        className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold disabled:opacity-50 whitespace-nowrap"
                      >
                        {savingName ? '...' : 'SAVE'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <PlayerNameBadge
                        username={`@${stats.username}`}
                        icon={equippedBadge ? equippedBadge.icon : '🛡️'}
                        rarity={equippedBadge ? equippedBadge.rarity : 'COMMON'}
                        onClick={() => {
                          setUsernameInput(stats.username);
                          setIsEditingUsername(true);
                        }}
                        size="sm"
                        showRarityPill
                      />
                      <button 
                        onClick={() => {
                          setUsernameInput(stats.username);
                          setIsEditingUsername(true);
                        }}
                        className="text-gray-500 hover:text-gray-300 text-xs px-1"
                        title="Edit Username"
                      >
                        ✎
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Unlock achievements to earn Fever Points and equip badges to showcase your title.
              </p>
              {nameError && (
                <p className="text-[11px] text-red-400 font-bold mt-1">{nameError}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Account pill in Trophy Room */}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                  CLOUD SYNCED
                </span>
                <button
                  onClick={logout}
                  className="px-2.5 py-1 text-[10px] font-bold text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-all"
                  title="Sign out of Firebase"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              onOpenAuth && (
                <button
                  onClick={onOpenAuth}
                  className="px-3 py-1 text-xs font-bold text-blue-300 bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/40 rounded-lg transition-all flex items-center gap-1"
                >
                  <span>☁️</span> Connect Account
                </button>
              )
            )}
            <button 
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white rounded-lg transition-all border border-gray-700 ml-2"
            >
              ESC / CLOSE
            </button>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-gray-900/60 border-b border-gray-800 text-center">
          <div className="p-2.5 rounded-lg bg-gray-900/90 border border-gray-800">
            <div className="text-xs text-gray-400 font-semibold uppercase">Fever Points</div>
            <div className="text-xl font-black text-orange-400 mt-0.5 flex items-center justify-center gap-1">
              <span>🔥</span> {stats.feverPoints.toLocaleString()}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-gray-900/90 border border-gray-800">
            <div className="text-xs text-gray-400 font-semibold uppercase">Total Clears</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{stats.totalWins}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-gray-900/90 border border-gray-800">
            <div className="text-xs text-gray-400 font-semibold uppercase">Perfects ⭐</div>
            <div className="text-xl font-black text-yellow-400 mt-0.5">{stats.totalPerfects}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-gray-900/90 border border-gray-800">
            <div className="text-xs text-gray-400 font-semibold uppercase">Best Streak 🔥</div>
            <div className="text-xl font-black text-orange-500 mt-0.5">{stats.bestStreak}</div>
          </div>
          <div className="col-span-2 sm:col-span-1 p-2.5 rounded-lg bg-gray-900/90 border border-gray-800 flex flex-col justify-center">
            <div className="flex justify-between text-xs text-gray-400 font-semibold mb-1">
              <span>Chievos</span>
              <span className="text-white font-bold">{unlockedCount} / {ACHIEVEMENTS.length}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-yellow-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3.5 flex flex-wrap gap-2 bg-gray-950 border-b border-gray-800 text-xs">
          {(['ALL', 'COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'SECRET'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg font-bold tracking-wider uppercase transition-all ${
                filter === tab 
                  ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]' 
                  : 'bg-gray-900 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {tab === 'SECRET' ? '🕵️ CLASSIFIED' : tab}
            </button>
          ))}
        </div>

        {/* Trophy Grid */}
        <div className="flex-grow min-h-0 p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 content-start auto-rows-[minmax(130px,auto)]">
          {filteredAchievements.map(ach => {
            const isUnlocked = unlockedIds.has(ach.id);
            const isEquipped = stats.selectedBadgeId === ach.id;
            const progress = getAchievementProgress(ach, stats);
            const isSecretLocked = ach.secret && !isUnlocked;

            // Border & Glow styling based on rarity
            const isLegendary = ach.rarity === 'LEGENDARY';

            const rarityStyle = {
              COMMON: 'border border-emerald-500/40 hover:border-emerald-500/70',
              RARE: 'border border-sky-400/50 hover:border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]',
              EPIC: 'border-2 border-yellow-400/80 hover:border-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.3)]',
              LEGENDARY: ''
            }[ach.rarity];

            const badgeBg = isUnlocked 
              ? 'bg-gray-900/95' 
              : 'bg-gray-950/80';

            return (
              <div 
                key={ach.id}
                style={{ contentVisibility: 'auto', containIntrinsicSize: '130px' }}
                className={`relative rounded-xl transition-all group min-h-[125px] p-3.5 flex items-start gap-3.5 ${
                  isLegendary 
                    ? 'rainbow-border shadow-[0_0_20px_rgba(255,0,128,0.35)] hover:shadow-[0_0_30px_rgba(0,255,255,0.55)]' 
                    : `${rarityStyle} ${badgeBg}`
                }`}
              >
                {/* Icon Container */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                    isUnlocked 
                      ? (isLegendary ? 'bg-gray-900 border border-yellow-400/50 shadow-[0_0_12px_rgba(250,204,21,0.4)]' : 'bg-gray-800 shadow-inner') 
                      : 'bg-gray-900 border border-gray-800 text-gray-600'
                  }`}>
                    {isSecretLocked ? '🔒' : isUnlocked ? ach.icon : '🔒'}
                  </div>

                  {/* Details */}
                  <div className="flex-grow min-w-0 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-gray-500">
                          {ach.rarity}
                        </span>
                        {isUnlocked ? (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">UNLOCKED</span>
                        ) : (
                          <span className="text-[10px] font-mono text-gray-600">LOCKED</span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-white truncate mt-0.5">
                        {isSecretLocked ? 'CLASSIFIED INTEL' : ach.title}
                      </h3>

                      <p className="text-xs text-gray-400 mt-1 leading-snug">
                        {isSecretLocked ? 'Requirements are classified. Keep investigating threats to discover.' : ach.description}
                      </p>

                      {/* Progress Bar if available */}
                      {!isUnlocked && progress && !isSecretLocked && (
                        <div className="mt-2">
                          <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-0.5">
                            <span>Progress</span>
                            <span>{progress.current} / {progress.max}</span>
                          </div>
                          <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-blue-500 h-full rounded-full transition-all" 
                              style={{ width: `${(progress.current / progress.max) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Unlocked Action Bar */}
                    {isUnlocked && (
                      <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-gray-800/60">
                        <span className="text-[10px] text-gray-400 font-mono">
                          +{ach.rarity === 'LEGENDARY' ? '250' : ach.rarity === 'EPIC' ? '100' : ach.rarity === 'RARE' ? '50' : '25'} FP
                        </span>
                        {isEquipped ? (
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30">
                            EQUIPPED ✓
                          </span>
                        ) : (
                          <button
                            onClick={() => handleEquip(ach.id)}
                            className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white text-[10px] font-bold uppercase transition-all"
                          >
                            EQUIP BADGE
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
