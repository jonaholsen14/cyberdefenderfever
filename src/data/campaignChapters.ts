import { CampaignChapter, CampaignProgress, ChapterProgress, MedalType } from '../types/campaign';
import { graduateCards } from '../utils/srsManager';

export const CAMPAIGN_CHAPTERS: CampaignChapter[] = [
  {
    id: 'chapter-1-linux',
    order: 1,
    title: 'Chapter 1: Linux Incident Triage',
    subtitle: 'Active sessions, port mapping, file hunting & privilege hygiene',
    category: 'Linux',
    description: 'When Red Team breaches a Linux bastion, your first 60 seconds decide the battle. Inspect active user sessions, audit open listening sockets, hunt in temporary RAM mounts, and patch rogue sudoers privileges.',
    cardIds: ['cli-linux-who', 'cli-linux-conn', 'cli-linux-temp', 'cfg-linux-sudoers'],
    remixConfig: {
      rounds: 5,
      lives: 3,
      minPassCount: 4,
    },
  },
  {
    id: 'chapter-2-windows',
    order: 2,
    title: 'Chapter 2: Windows Defense & Lockdown',
    subtitle: 'Credential rotation, protocol suppression, Defender & tasks',
    category: 'Windows',
    description: 'Lock down critical Windows infrastructure before lateral movement begins. Rotate the local Administrator password, disable vulnerable SMB shares, turn on Windows Defender real-time protection, and audit persistent scheduled tasks.',
    cardIds: ['cli-win-pass', 'cli-win', 'gui-nav-win', 'cli-win-tasks'],
    remixConfig: {
      rounds: 5,
      lives: 3,
      minPassCount: 4,
    },
    unlockChapterId: 'chapter-1-linux',
  },
  {
    id: 'chapter-3-firewall',
    order: 3,
    title: 'Chapter 3: Perimeter & Network Defense',
    subtitle: 'Firewall rules, service persistence & access log analysis',
    category: 'Firewall',
    description: 'Sever active C2 connections at the edge. Add emergency UFW deny rules, ensure host firewall persistence across reboots, investigate Apache brute-force status codes, and restore unauthorized SSH listener ports.',
    cardIds: ['cli-fw', 'cfg-fw', 'mc-linux', 'cfg-linux-ssh'],
    remixConfig: {
      rounds: 5,
      lives: 3,
      minPassCount: 4,
    },
    unlockChapterId: 'chapter-2-windows',
  },
  {
    id: 'chapter-4-advanced',
    order: 4,
    title: 'Chapter 4: Advanced Persistence & Injects',
    subtitle: 'Multi-stage DNS cleanup, web shell eviction & cron eradication',
    category: 'Injects',
    description: 'Tackle advanced multi-stage attacks and business SLA injects. Regain locked file permissions to strip malicious DNS hijackers, track down and delete hidden web shells, and wipe malicious reverse-shell crontabs.',
    cardIds: ['multi-stage-1', 'cli-nav-linux', 'cfg-linux', 'cfg-inject'],
    remixConfig: {
      rounds: 5,
      lives: 3,
      minPassCount: 4,
    },
    unlockChapterId: 'chapter-3-firewall',
  },
];

const CAMPAIGN_STORAGE_KEY = 'ccdc_campaign_progress_v1';

export function getCampaignProgress(): CampaignProgress {
  if (typeof window === 'undefined') {
    return { chapters: {}, selectedChapterId: CAMPAIGN_CHAPTERS[0].id };
  }
  try {
    const raw = localStorage.getItem(CAMPAIGN_STORAGE_KEY);
    if (!raw) {
      // Default: Chapter 1 is unlocked
      const initial: CampaignProgress = {
        chapters: {
          [CAMPAIGN_CHAPTERS[0].id]: {
            chapterId: CAMPAIGN_CHAPTERS[0].id,
            unlocked: true,
            completed: false,
            lessonsCompleted: {},
          },
        },
        selectedChapterId: CAMPAIGN_CHAPTERS[0].id,
      };
      return initial;
    }
    const parsed = JSON.parse(raw) as CampaignProgress;
    // Ensure Chapter 1 is always unlocked
    if (!parsed.chapters[CAMPAIGN_CHAPTERS[0].id]) {
      parsed.chapters[CAMPAIGN_CHAPTERS[0].id] = {
        chapterId: CAMPAIGN_CHAPTERS[0].id,
        unlocked: true,
        completed: false,
        lessonsCompleted: {},
      };
    }
    return parsed;
  } catch (err) {
    console.warn('Failed to load campaign progress:', err);
    return { chapters: {}, selectedChapterId: CAMPAIGN_CHAPTERS[0].id };
  }
}

export function saveCampaignProgress(progress: CampaignProgress): void {
  if (typeof window === 'undefined') return;
  try {
    progress.lastPlayedAt = Date.now();
    localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.warn('Failed to save campaign progress:', err);
  }
}

export function markLessonCompleted(chapterId: string, cardId: string): void {
  const progress = getCampaignProgress();
  if (!progress.chapters[chapterId]) {
    progress.chapters[chapterId] = {
      chapterId,
      unlocked: true,
      completed: false,
      lessonsCompleted: {},
    };
  }
  progress.chapters[chapterId].lessonsCompleted[cardId] = true;
  saveCampaignProgress(progress);
}

export function markRemixCompleted(
  chapterId: string,
  medal: MedalType,
  score: number,
  chapterCards: string[]
): { nextChapterUnlocked?: string } {
  const progress = getCampaignProgress();
  let ch = progress.chapters[chapterId];
  if (!ch) {
    ch = {
      chapterId,
      unlocked: true,
      completed: true,
      lessonsCompleted: {},
      bestMedal: medal,
      highScore: score,
      completedAt: Date.now(),
    };
  } else {
    ch.completed = true;
    ch.completedAt = Date.now();
    if (!ch.highScore || score > ch.highScore) {
      ch.highScore = score;
    }
    // Upgrade medal if better
    const rankValue = { BRONZE: 1, SILVER: 2, GOLD: 3 };
    if (!ch.bestMedal || rankValue[medal] > rankValue[ch.bestMedal]) {
      ch.bestMedal = medal;
    }
  }
  progress.chapters[chapterId] = ch;

  // Automatically graduate chapter cards into the player's personal Spaced Repetition queue!
  graduateCards(chapterCards);

  // Find next chapter to unlock
  let nextChapterUnlocked: string | undefined;
  const currentIndex = CAMPAIGN_CHAPTERS.findIndex((c) => c.id === chapterId);
  if (currentIndex >= 0 && currentIndex < CAMPAIGN_CHAPTERS.length - 1) {
    const nextChapter = CAMPAIGN_CHAPTERS[currentIndex + 1];
    if (!progress.chapters[nextChapter.id]) {
      progress.chapters[nextChapter.id] = {
        chapterId: nextChapter.id,
        unlocked: true,
        completed: false,
        lessonsCompleted: {},
      };
    } else {
      progress.chapters[nextChapter.id].unlocked = true;
    }
    nextChapterUnlocked = nextChapter.id;
  }

  saveCampaignProgress(progress);
  return { nextChapterUnlocked };
}
