import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AchievementRarity, LeaderboardEntry, PlayerStats } from '../types/achievement';
import { ACHIEVEMENTS } from './achievements';

export const MOCK_RIVALS: Omit<LeaderboardEntry, 'rank' | 'isPlayer'>[] = [
  {
    username: 'Root_Overlord',
    affiliation: 'BYU-Idaho SOC',
    badgeIcon: '👑',
    badgeTitle: 'Cyber Defender Fever',
    badgeRarity: 'LEGENDARY',
    feverPoints: 3450
  },
  {
    username: 'Kernel_Panic',
    affiliation: 'Dakota State Univ',
    badgeIcon: '⭐',
    badgeTitle: 'Golden Standard',
    badgeRarity: 'LEGENDARY',
    feverPoints: 2850
  },
  {
    username: 'Packet_Paladin',
    affiliation: 'UVU SecOps',
    badgeIcon: '🚀',
    badgeTitle: 'Terminal Velocity',
    badgeRarity: 'EPIC',
    feverPoints: 2300
  },
  {
    username: 'Cipher_Wolf',
    affiliation: 'Stanford Blue Team',
    badgeIcon: '🐧',
    badgeTitle: 'Sudo Champion',
    badgeRarity: 'RARE',
    feverPoints: 1750
  },
  {
    username: 'Firewall_Phoenix',
    affiliation: 'Texas A&M CCDC',
    badgeIcon: '🧱',
    badgeTitle: 'Bastion Host',
    badgeRarity: 'RARE',
    feverPoints: 1250
  },
  {
    username: 'ZeroDay_Ghost',
    affiliation: 'Cal Poly Pomona',
    badgeIcon: '☣️',
    badgeTitle: 'Zero-Day Veteran',
    badgeRarity: 'RARE',
    feverPoints: 850
  },
  {
    username: 'SysAdmin_Sam',
    affiliation: 'Univ of Washington',
    badgeIcon: '🪟',
    badgeTitle: 'Domain Admin',
    badgeRarity: 'COMMON',
    feverPoints: 550
  },
  {
    username: 'Byte_Defender',
    affiliation: 'Boise State Cyber',
    badgeIcon: '⚡',
    badgeTitle: 'Split Second',
    badgeRarity: 'COMMON',
    feverPoints: 350
  },
  {
    username: 'Terminal_Trainee',
    affiliation: 'Idaho State Blue',
    badgeIcon: '🛡️',
    badgeTitle: 'First Response',
    badgeRarity: 'COMMON',
    feverPoints: 150
  },
  {
    username: 'Novice_Net',
    affiliation: 'BYU Provo Security',
    badgeIcon: '☕',
    badgeTitle: 'Mental Reset',
    badgeRarity: 'COMMON',
    feverPoints: 50
  }
];

export function getLeaderboardRankings(stats: PlayerStats, realPlayers: LeaderboardEntry[] = []): LeaderboardEntry[] {
  let badgeIcon = '🛡️';
  let badgeTitle = 'First Response';
  let badgeRarity: AchievementRarity = 'COMMON';

  if (stats.selectedBadgeId) {
    const found = ACHIEVEMENTS.find(a => a.id === stats.selectedBadgeId);
    if (found) {
      badgeIcon = found.icon;
      badgeTitle = found.title;
      badgeRarity = found.rarity;
    }
  }

  const playerEntry: Omit<LeaderboardEntry, 'rank'> = {
    username: stats.username || 'You (Defender)',
    affiliation: 'Home Blue Team',
    badgeIcon,
    badgeTitle,
    badgeRarity,
    feverPoints: stats.feverPoints,
    isPlayer: true
  };

  // Combine real cloud entries with mock rivals for a populated leaderboard during playtesting
  const entryMap = new Map<string, Omit<LeaderboardEntry, 'rank'>>();

  // Add mock rivals first
  MOCK_RIVALS.forEach(r => entryMap.set(r.username.toLowerCase(), r));

  // Overlay real players from Firestore
  realPlayers.forEach(p => {
    entryMap.set(p.username.toLowerCase(), {
      username: p.username,
      affiliation: p.affiliation || 'Collegiate Defender',
      badgeIcon: p.badgeIcon || '🛡️',
      badgeTitle: p.badgeTitle || 'First Response',
      badgeRarity: p.badgeRarity || 'COMMON',
      feverPoints: p.feverPoints || 0,
      isPlayer: p.isPlayer || (p.username.toLowerCase() === (stats.username || '').toLowerCase())
    });
  });

  // Ensure current player's latest local/session stats are represented
  entryMap.set((stats.username || 'You (Defender)').toLowerCase(), playerEntry);

  const allEntries = Array.from(entryMap.values()).sort((a, b) => b.feverPoints - a.feverPoints);

  return allEntries.map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));
}

/**
 * Fetches real player scores from Firestore leaderboard collection
 */
export async function fetchLiveLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const q = query(
      collection(db, 'leaderboard'),
      orderBy('feverPoints', 'desc'),
      limit(25)
    );
    const snap = await getDocs(q);
    const entries: LeaderboardEntry[] = [];
    snap.forEach((d) => {
      const data = d.data();
      entries.push({
        rank: 0,
        username: data.username || 'Defender',
        affiliation: data.affiliation || 'Collegiate Defender',
        badgeIcon: data.badgeIcon || '🛡️',
        badgeTitle: data.badgeTitle || 'First Response',
        badgeRarity: data.badgeRarity || 'COMMON',
        feverPoints: data.feverPoints || 0
      });
    });
    return entries;
  } catch (error) {
    console.warn('Could not fetch Firestore leaderboard, using offline rivals:', error);
    return [];
  }
}
