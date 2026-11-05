export type MedalType = 'BRONZE' | 'SILVER' | 'GOLD';

export interface CampaignChapter {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  category: 'Linux' | 'Windows' | 'Firewall' | 'Injects' | 'Custom';
  description: string;
  cardIds: string[];
  remixConfig: {
    rounds: number;
    lives: number;
    minPassCount: number;
  };
  unlockChapterId?: string; // Chapter required to beat before this unlocks
}

export interface ChapterProgress {
  chapterId: string;
  unlocked: boolean;
  completed: boolean;
  lessonsCompleted: Record<string, boolean>; // cardId -> true
  bestMedal?: MedalType;
  highScore?: number;
  completedAt?: number;
}

export interface CampaignProgress {
  chapters: Record<string, ChapterProgress>;
  selectedChapterId?: string;
  lastPlayedAt?: number;
}
