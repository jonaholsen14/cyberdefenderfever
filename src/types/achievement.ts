export type AchievementRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  rarity: AchievementRarity;
  icon: string;
  secret?: boolean; // If true, displayed as [CLASSIFIED INTEL] until unlocked
  unlockedAt?: number;
  category?: 'Windows' | 'Linux' | 'Firewall' | 'Injects' | 'General' | 'Speed' | 'Streak' | 'Secret';
  progress?: {
    current: number;
    max: number;
  };
}

export interface PlayerStats {
  username: string;
  selectedBadgeId: string | null;
  feverPoints: number;
  dailyStreak: number;
  lastDailyDate?: string;
  totalWins: number;
  totalLosses: number;
  totalPerfects: number;
  totalDailyClears: number;
  currentStreak: number;
  bestStreak: number;
  hacksEncountered: number;
  hacksSurvived: number;
  earthquakeWins: number;
  blurryWins: number;
  invertedWins: number;
  marqueeWins: number;
  upsideDownWins: number;
  multiStageWins: number;
  guiNavWins: number;
  categoryWins: {
    Windows: number;
    Linux: number;
    Firewall: number;
    Injects: number;
  };
  cardWins: Record<string, number>; // cardId -> winCount
  fastestWinMs: number;
  unlockedAchievementIds: string[];
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  affiliation: string;
  badgeIcon: string;
  badgeTitle: string;
  badgeRarity?: AchievementRarity;
  feverPoints: number;
  isPlayer?: boolean;
}

export interface OvertakeEvent {
  rivalName: string;
  rivalAffiliation: string;
  newRank: number;
}

export type AttemptResult = 
  | 'WIN' 
  | 'LOSE' 
  | 'MUTATED_WIN' 
  | 'MUTATED_LOSE' 
  | 'PERFECT_WIN' 
  | 'MUTATED_PERFECT_WIN';

/**
 * Storage adapter interface for player achievements and stats.
 * Enables zero-friction migration to Google Firebase in the future.
 */
export interface IAchievementStorage {
  loadStats(): PlayerStats;
  saveStats(stats: PlayerStats): void;
  loadUnlockedIds(): string[];
  saveUnlockedId(id: string): void;
}
