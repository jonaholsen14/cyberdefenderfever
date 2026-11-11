import { CampaignChapter, CampaignProgress, ChapterProgress, MedalType } from '../types/campaign';
import { graduateCards } from '../utils/srsManager';

export const CAMPAIGN_CHAPTERS: CampaignChapter[] = [
  {
    id: 'chapter-1-linux',
    order: 1,
    title: 'Chapter 1: Linux Terminal Foundations',
    subtitle: 'File navigation, inspection, identity & shell utilities',
    category: 'Linux',
    description: 'Master the fundamental Linux terminal commands. Print your working directory, list files, view active login sessions, examine text files, and check kernel details.',
    cardIds: [
      'cli-linux-pwd',
      'cli-linux-ls',
      'cli-linux-cd',
      'cli-linux-cat',
      'cli-linux-whoami',
      'cli-linux-w',
      'cli-linux-clear',
      'cli-linux-man',
      'cli-linux-history',
      'cli-linux-uname'
    ],
    remixConfig: {
      rounds: 5,
      lives: 3,
      minPassCount: 4,
    },
  },
  {
    id: 'chapter-2-windows',
    order: 2,
    title: 'Chapter 2: Linux Process & Service Control',
    subtitle: 'Process monitoring, privilege escalation, permissions & services',
    category: 'Linux',
    description: 'Gain procedural muscle memory over running Linux systems. Switch users, elevate via sudo, inspect active process trees, terminate unauthorized binaries, and manage systemd services.',
    cardIds: [
      'cli-linux-su',
      'cli-linux-sudo',
      'cli-linux-ps',
      'cli-linux-top',
      'cli-linux-kill',
      'cli-linux-pkill',
      'cli-linux-chmod',
      'cli-linux-chown',
      'cli-linux-systemctl-status',
      'cli-linux-systemctl-restart'
    ],
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
    title: 'Chapter 3: Windows & PowerShell Essentials',
    subtitle: 'PowerShell cmdlets, services, tasks, local accounts & Defender',
    category: 'Windows',
    description: 'Rapidly administer Windows boxes using core cmdlets and tools. Audit running processes, start/stop services, review local user accounts, inspect privileges, and activate Defender.',
    cardIds: [
      'cli-win-get-process',
      'cli-win-get-service',
      'cli-win-stop-service',
      'cli-win-start-service',
      'cli-win-net-user',
      'cli-win-whoami-priv',
      'cli-win-tasklist',
      'cli-win-taskkill',
      'cli-win-restart',
      'gui-win-defender'
    ],
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
    title: 'Chapter 4: Network & Firewall Defense',
    subtitle: 'IP interfaces, listening sockets, reachability & UFW rules',
    category: 'Firewall',
    description: 'Protect the perimeter and diagnose connectivity. Map interface IP addresses, find listening ports, test endpoints with curl, trace network paths, and enforce host firewall drop rules.',
    cardIds: [
      'cli-net-ip',
      'cli-net-ss',
      'cli-net-ping',
      'cli-net-curl',
      'cli-net-traceroute',
      'cli-net-ufw-status',
      'cli-net-ufw-enable',
      'cli-net-ufw-allow',
      'cli-net-ufw-deny',
      'cfg-fw-default-drop'
    ],
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
