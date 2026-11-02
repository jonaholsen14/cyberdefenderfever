"use client";

import React, { useEffect, useState } from 'react';
import { LeaderboardEntry, PlayerStats } from '../types/achievement';
import { getLeaderboardRankings, fetchLiveLeaderboard } from '../data/mockLeaderboard';
import { ACHIEVEMENTS } from '../data/achievements';
import PlayerNameBadge from './PlayerNameBadge';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
}

export default function LeaderboardModal({ isOpen, onClose, stats }: LeaderboardModalProps) {
  const [realPlayers, setRealPlayers] = useState<LeaderboardEntry[]>([]);
  const [loadingLive, setLoadingLive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoadingLive(true);
      fetchLiveLeaderboard().then(entries => {
        setRealPlayers(entries);
        setLoadingLive(false);
      }).catch(() => {
        setLoadingLive(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const rankings = getLeaderboardRankings(stats, realPlayers);
  const playerRank = rankings.find(r => r.isPlayer)?.rank || 1;
  const playerBadge = stats.selectedBadgeId 
    ? ACHIEVEMENTS.find(a => a.id === stats.selectedBadgeId) 
    : ACHIEVEMENTS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-gray-950 border-2 border-gray-800 rounded-2xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)]">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-wide uppercase">
                  Collegiate Cyber Standings
                </h2>
                {loadingLive && (
                  <span className="text-[10px] bg-blue-950/80 border border-blue-500/40 text-blue-400 px-2 py-0.5 rounded-full animate-pulse">
                    SYNCING CLOUD...
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                Live rankings across regional CCDC teams and active incident responders.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-gray-300 bg-gray-800 hover:bg-gray-700 hover:text-white rounded-lg transition-all border border-gray-700"
          >
            ESC / CLOSE
          </button>
        </div>

        {/* Player Status Banner */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-orange-950/40 via-yellow-950/20 to-gray-900 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PlayerNameBadge
              username={stats.username || 'Defender'}
              icon={playerBadge ? playerBadge.icon : '🛡️'}
              rarity={playerBadge ? playerBadge.rarity : 'COMMON'}
              size="md"
              showRarityPill
            />
            <div className="hidden sm:block">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">YOUR RANK</div>
              <div className="text-sm font-mono font-black text-yellow-400">
                #{playerRank} on Global Board
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 font-bold uppercase">Fever Points</div>
            <div className="text-base font-black text-orange-400 flex items-center gap-1 justify-end">
              <span>🔥</span> {stats.feverPoints.toLocaleString()} <span className="text-xs text-orange-500">FP</span>
            </div>
          </div>
        </div>

        {/* Standings Table */}
        <div className="flex-grow p-6 overflow-y-auto">
          <div className="w-full border border-gray-800/80 rounded-xl overflow-hidden bg-gray-900/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-900 text-gray-400 uppercase font-mono tracking-wider border-b border-gray-800 text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">Rank</th>
                  <th className="py-3 px-4">Defender & Title</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Affiliation</th>
                  <th className="py-3 px-4 text-right">Fever Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-sans">
                {rankings.map(entry => {
                  const isTop3 = entry.rank <= 3;
                  return (
                    <tr 
                      key={entry.rank}
                      className={`transition-colors ${
                        entry.isPlayer 
                          ? 'bg-yellow-950/30 border-l-4 border-yellow-400 font-bold text-white' 
                          : 'hover:bg-gray-850/40 text-gray-300'
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        {entry.rank === 1 ? '🥇 #1' :
                         entry.rank === 2 ? '🥈 #2' :
                         entry.rank === 3 ? '🥉 #3' :
                         `#${entry.rank}`}
                      </td>

                      {/* Defender & Title */}
                      <td className="py-2.5 px-4">
                        <div className="flex flex-col items-start gap-1">
                          <PlayerNameBadge
                            username={`${entry.username}${entry.isPlayer ? ' (YOU)' : ''}`}
                            icon={entry.badgeIcon}
                            rarity={entry.badgeRarity || 'COMMON'}
                            size="sm"
                            showRarityPill={entry.badgeRarity === 'LEGENDARY'}
                          />
                          <div className="text-[10px] text-gray-400 font-mono ml-1">
                            {entry.badgeTitle}
                          </div>
                        </div>
                      </td>

                      {/* Affiliation */}
                      <td className="py-3.5 px-4 hidden sm:table-cell text-gray-400">
                        {entry.affiliation}
                      </td>

                      {/* Fever Points */}
                      <td className="py-3.5 px-4 text-right font-mono font-black">
                        <span className={isTop3 ? 'text-yellow-400' : entry.isPlayer ? 'text-orange-400' : 'text-gray-300'}>
                          {entry.feverPoints.toLocaleString()} <span className="text-[10px] text-gray-500">FP</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3 bg-gray-900 border-t border-gray-800 text-center text-xs text-gray-400">
          Earn Fever Points from Daily Gauntlets, Perfect clears, Mutator survivals, and Achievement unlocks to climb the ranks!
        </div>

      </div>
    </div>
  );
}
