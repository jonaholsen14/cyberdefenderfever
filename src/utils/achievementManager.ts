import { Achievement, PlayerStats, IAchievementStorage, OvertakeEvent } from '../types/achievement';
import { ACHIEVEMENTS } from '../data/achievements';
import { MOCK_RIVALS } from '../data/mockLeaderboard';

const STATS_STORAGE_KEY = 'ccdc_player_stats_v2';
const UNLOCKED_STORAGE_KEY = 'ccdc_unlocked_achievements_v2';

const DEFAULT_STATS: PlayerStats = {
  username: 'Defender_One',
  selectedBadgeId: 'first_win',
  feverPoints: 0,
  dailyStreak: 0,
  totalWins: 0,
  totalLosses: 0,
  totalPerfects: 0,
  totalDailyClears: 0,
  currentStreak: 0,
  bestStreak: 0,
  hacksEncountered: 0,
  hacksSurvived: 0,
  earthquakeWins: 0,
  blurryWins: 0,
  invertedWins: 0,
  marqueeWins: 0,
  upsideDownWins: 0,
  multiStageWins: 0,
  guiNavWins: 0,
  categoryWins: {
    Windows: 0,
    Linux: 0,
    Firewall: 0,
    Injects: 0
  },
  cardWins: {},
  fastestWinMs: 999999,
  unlockedAchievementIds: []
};

class LocalStorageAdapter implements IAchievementStorage {
  loadStats(): PlayerStats {
    if (typeof window === 'undefined') return { ...DEFAULT_STATS };
    try {
      const raw = localStorage.getItem(STATS_STORAGE_KEY);
      if (!raw) return { ...DEFAULT_STATS };
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_STATS,
        ...parsed,
        categoryWins: { ...DEFAULT_STATS.categoryWins, ...(parsed.categoryWins || {}) },
        cardWins: { ...(parsed.cardWins || {}) }
      };
    } catch {
      return { ...DEFAULT_STATS };
    }
  }

  saveStats(stats: PlayerStats): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch {}
  }

  loadUnlockedIds(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(UNLOCKED_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveUnlockedId(id: string): void {
    if (typeof window === 'undefined') return;
    try {
      const current = this.loadUnlockedIds();
      if (!current.includes(id)) {
        current.push(id);
        localStorage.setItem(UNLOCKED_STORAGE_KEY, JSON.stringify(current));
      }
    } catch {}
  }
}

let activeStorageAdapter: IAchievementStorage = new LocalStorageAdapter();

export function setAchievementStorageAdapter(adapter: IAchievementStorage) {
  activeStorageAdapter = adapter;
}

export function getPlayerStats(): PlayerStats {
  const stats = activeStorageAdapter.loadStats();
  stats.unlockedAchievementIds = activeStorageAdapter.loadUnlockedIds();
  return stats;
}

export function equipBadge(badgeId: string): void {
  const stats = getPlayerStats();
  stats.selectedBadgeId = badgeId;
  activeStorageAdapter.saveStats(stats);
}

export function updateUsername(username: string): void {
  const stats = getPlayerStats();
  stats.username = username.trim() || 'Defender_One';
  activeStorageAdapter.saveStats(stats);
}

/**
 * Calculates rank position on mock leaderboard for a given FP value
 */
function getRankForFP(fp: number): number {
  const higherCount = MOCK_RIVALS.filter(r => r.feverPoints > fp).length;
  return higherCount + 1;
}

/**
 * Checks if a point gain caused the player to overtake a rival
 */
export function checkOvertake(oldFP: number, newFP: number): OvertakeEvent | null {
  if (newFP <= oldFP) return null;
  const oldRank = getRankForFP(oldFP);
  const newRank = getRankForFP(newFP);

  if (newRank < oldRank) {
    const overtakenRival = MOCK_RIVALS.find(r => r.feverPoints >= oldFP && r.feverPoints < newFP);
    if (overtakenRival) {
      return {
        rivalName: overtakenRival.username,
        rivalAffiliation: overtakenRival.affiliation,
        newRank
      };
    }
  }
  return null;
}

export function getAchievementProgress(achievement: Achievement, stats: PlayerStats): { current: number; max: number } | undefined {
  switch (achievement.id) {
    // COMMON
    case 'first_win':
      return { current: Math.min(stats.totalWins, 1), max: 1 };
    case 'first_perfect':
      return { current: Math.min(stats.totalPerfects, 1), max: 1 };
    case 'linux_novice':
      return { current: Math.min(stats.categoryWins.Linux, 3), max: 3 };
    case 'windows_novice':
      return { current: Math.min(stats.categoryWins.Windows, 3), max: 3 };
    case 'firewall_novice':
      return { current: Math.min(stats.categoryWins.Firewall, 3), max: 3 };
    case 'inject_novice':
      return { current: Math.min(stats.categoryWins.Injects, 1), max: 1 };
    case 'gui_novice':
      return { current: Math.min(stats.guiNavWins, 1), max: 1 };
    case 'fp_100':
      return { current: Math.min(stats.feverPoints, 100), max: 100 };
    case 'fp_250':
      return { current: Math.min(stats.feverPoints, 250), max: 250 };
    case 'streak_three':
      return { current: Math.min(stats.bestStreak, 3), max: 3 };
    case 'study_sponge':
      return { current: Math.min(stats.cardWins['sb-1'] || 0, 3), max: 3 };

    // RARE
    case 'linux_adept':
      return { current: Math.min(stats.categoryWins.Linux, 10), max: 10 };
    case 'windows_adept':
      return { current: Math.min(stats.categoryWins.Windows, 10), max: 10 };
    case 'firewall_adept':
      return { current: Math.min(stats.categoryWins.Firewall, 10), max: 10 };
    case 'streak_five':
      return { current: Math.min(stats.bestStreak, 5), max: 5 };
    case 'streak_seven':
      return { current: Math.min(stats.bestStreak, 7), max: 7 };
    case 'fp_500':
      return { current: Math.min(stats.feverPoints, 500), max: 500 };
    case 'fp_1000':
      return { current: Math.min(stats.feverPoints, 1000), max: 1000 };
    case 'inject_adept':
      return { current: Math.min(stats.categoryWins.Injects, 5), max: 5 };
    case 'gui_adept':
      return { current: Math.min(stats.guiNavWins, 5), max: 5 };
    case 'perfect_ten_career':
      return { current: Math.min(stats.totalPerfects, 10), max: 10 };
    case 'daily_double':
      return { current: Math.min(stats.dailyStreak, 2), max: 2 };
    case 'multi_trio':
      return { current: Math.min(stats.multiStageWins, 3), max: 3 };
    case 'chaos_veteran':
      return { current: Math.min(stats.hacksSurvived, 5), max: 5 };
    case 'study_expert':
      return { current: Math.min(stats.cardWins['sb-1'] || 0, 10), max: 10 };

    // EPIC
    case 'streak_ten':
      return { current: Math.min(stats.bestStreak, 10), max: 10 };
    case 'streak_twelve':
      return { current: Math.min(stats.bestStreak, 12), max: 12 };
    case 'streak_fifteen':
      return { current: Math.min(stats.bestStreak, 15), max: 15 };
    case 'streak_eighteen':
      return { current: Math.min(stats.bestStreak, 18), max: 18 };
    case 'linux_master':
      return { current: Math.min(stats.categoryWins.Linux, 25), max: 25 };
    case 'windows_master':
      return { current: Math.min(stats.categoryWins.Windows, 25), max: 25 };
    case 'firewall_master':
      return { current: Math.min(stats.categoryWins.Firewall, 25), max: 25 };
    case 'inject_master':
      return { current: Math.min(stats.categoryWins.Injects, 15), max: 15 };
    case 'gui_master':
      return { current: Math.min(stats.guiNavWins, 15), max: 15 };
    case 'fp_2500':
      return { current: Math.min(stats.feverPoints, 2500), max: 2500 };
    case 'fp_3500':
      return { current: Math.min(stats.feverPoints, 3500), max: 3500 };
    case 'chain_reaction':
      return { current: Math.min(stats.multiStageWins, 5), max: 5 };
    case 'multi_decathlete':
      return { current: Math.min(stats.multiStageWins, 10), max: 10 };
    case 'perfect_quarter_century':
      return { current: Math.min(stats.totalPerfects, 25), max: 25 };
    case 'daily_five':
      return { current: Math.min(stats.totalDailyClears, 5), max: 5 };

    // LEGENDARY
    case 'cyber_legend':
      return { current: Math.min(stats.bestStreak, 20), max: 20 };
    case 'streak_twenty_five':
      return { current: Math.min(stats.bestStreak, 25), max: 25 };
    case 'fp_5000':
      return { current: Math.min(stats.feverPoints, 5000), max: 5000 };
    case 'fp_10000':
      return { current: Math.min(stats.feverPoints, 10000), max: 10000 };
    case 'fp_15000':
      return { current: Math.min(stats.feverPoints, 15000), max: 15000 };
    case 'fp_20000':
      return { current: Math.min(stats.feverPoints, 20000), max: 20000 };
    case 'perfect_century':
      return { current: Math.min(stats.totalPerfects, 50), max: 50 };
    case 'grandmaster':
      return { current: Math.min(stats.unlockedAchievementIds.length, 50), max: 50 };
    case 'daily_titan':
      return { current: Math.min(stats.totalDailyClears, 10), max: 10 };
    case 'tri_discipline_master': {
      const minDiscipline = Math.min(stats.categoryWins.Windows, stats.categoryWins.Linux, stats.categoryWins.Firewall);
      return { current: Math.min(minDiscipline, 50), max: 50 };
    }
    case 'centurion_clears':
      return { current: Math.min(stats.totalWins, 100), max: 100 };
    default:
      return undefined;
  }
}

export interface CardWinContext {
  cardId: string;
  category?: 'Windows' | 'Linux' | 'Firewall' | 'Injects';
  engine?: string;
  timeTakenMs: number;
  timeLimitMs: number;
  isPerfect: boolean;
  mutator: string | null;
  runPerfectCount: number;
  isMultiStage?: boolean;
  runHacksSurvived?: number;
  previousCardFastMs?: number;
}

export interface CardWinResult {
  newlyUnlocked: Achievement[];
  earnedFP: number;
  overtake: OvertakeEvent | null;
}

export function evaluateCardWin(ctx: CardWinContext): CardWinResult {
  const stats = getPlayerStats();
  const oldFP = stats.feverPoints;
  const unlocked = new Set(stats.unlockedAchievementIds);
  const newlyUnlocked: Achievement[] = [];

  // 1. Calculate Fever Points per user's tuned numbers:
  let earnedFP = 5;
  if (ctx.isPerfect && ctx.mutator) {
    earnedFP = 30;
  } else if (ctx.isPerfect) {
    earnedFP = 15;
  } else if (ctx.mutator) {
    earnedFP = 10;
  }

  // Update Core Stats
  stats.totalWins += 1;
  stats.currentStreak += 1;
  stats.feverPoints += earnedFP;

  if (stats.currentStreak > stats.bestStreak) {
    stats.bestStreak = stats.currentStreak;
  }
  if (ctx.isPerfect) {
    stats.totalPerfects += 1;
  }
  if (ctx.timeTakenMs < stats.fastestWinMs) {
    stats.fastestWinMs = ctx.timeTakenMs;
  }
  if (ctx.category && stats.categoryWins[ctx.category] !== undefined) {
    stats.categoryWins[ctx.category] += 1;
  }
  if (ctx.isMultiStage) {
    stats.multiStageWins += 1;
  }
  if (ctx.engine === 'GUI_NAV') {
    stats.guiNavWins += 1;
  }
  stats.cardWins[ctx.cardId] = (stats.cardWins[ctx.cardId] || 0) + 1;

  if (ctx.mutator) {
    stats.hacksSurvived += 1;
    if (ctx.mutator === 'EARTHQUAKE') stats.earthquakeWins += 1;
    if (ctx.mutator === 'BLURRY') stats.blurryWins += 1;
    if (ctx.mutator === 'COLOR_INVERT') stats.invertedWins += 1;
    if (ctx.mutator === 'PWNED_MARQUEE') stats.marqueeWins += 1;
    if (ctx.mutator === 'UPSIDE_DOWN') stats.upsideDownWins += 1;
  }

  // Check Current Time for secret achievements
  const currentHour = new Date().getHours();
  const isNightIncident = currentHour >= 0 && currentHour < 4;
  const isLunchtime = currentHour >= 12 && currentHour < 13;

  const tryUnlock = (id: string) => {
    if (!unlocked.has(id)) {
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (ach) {
        unlocked.add(id);
        newlyUnlocked.push(ach);
        activeStorageAdapter.saveUnlockedId(id);

        // Achievement Unlock FP Bonus
        const achFP = ach.rarity === 'LEGENDARY' ? 250 :
                      ach.rarity === 'EPIC' ? 100 :
                      ach.rarity === 'RARE' ? 50 : 25;
        stats.feverPoints += achFP;
      }
    }
  };

  // ===== COMMON Checks =====
  tryUnlock('first_win');
  if (ctx.isPerfect) tryUnlock('first_perfect');
  if (stats.categoryWins.Linux >= 3) tryUnlock('linux_novice');
  if (stats.categoryWins.Windows >= 3) tryUnlock('windows_novice');
  if (stats.categoryWins.Firewall >= 3) tryUnlock('firewall_novice');
  if (ctx.cardId === 'sb-1') tryUnlock('study_break');
  if ((stats.cardWins['sb-1'] || 0) >= 5) tryUnlock('fast_learner');
  if ((stats.cardWins['sb-1'] || 0) >= 3) tryUnlock('study_sponge');
  if (ctx.cardId === 'cli-win-guest') tryUnlock('guest_disabler');
  if (ctx.cardId === 'cli-fw-telnet') tryUnlock('telnet_terminator');
  if (stats.feverPoints >= 100) tryUnlock('fp_100');
  if (stats.feverPoints >= 250) tryUnlock('fp_250');
  if (stats.categoryWins.Injects >= 1) tryUnlock('inject_novice');
  if (stats.guiNavWins >= 1) tryUnlock('gui_novice');
  if (stats.currentStreak >= 3) tryUnlock('streak_three');
  if (ctx.cardId === 'multi-stage-1' || ctx.cardId === 'cfg-linux-limits') tryUnlock('linux_chmod');
  if (ctx.cardId === 'cli-win-killproc' || ctx.cardId === 'cli-win-tasks') tryUnlock('ps_hunter');
  if (ctx.cardId === 'cli-fw-default' || ctx.cardId === 'cli-fw-tor' || ctx.cardId === 'cli-fw-telnet') tryUnlock('port_scanner_stop');
  if (ctx.timeTakenMs <= 3500) tryUnlock('speed_three');

  // ===== RARE Checks =====
  if (ctx.runPerfectCount >= 3) tryUnlock('perfect_trio');
  if (ctx.mutator) tryUnlock('hacker_immune');
  if (ctx.timeTakenMs <= 2500) tryUnlock('speedy_defense');
  if (stats.categoryWins.Linux >= 10) tryUnlock('linux_adept');
  if (stats.categoryWins.Windows >= 10) tryUnlock('windows_adept');
  if (stats.categoryWins.Firewall >= 10) tryUnlock('firewall_adept');
  if (stats.currentStreak >= 5) tryUnlock('streak_five');
  if (stats.currentStreak >= 7) tryUnlock('streak_seven');
  if (stats.feverPoints >= 500) tryUnlock('fp_500');
  if (stats.feverPoints >= 1000) tryUnlock('fp_1000');
  if ((stats.cardWins['cli-win-killproc'] || 0) >= 3) tryUnlock('netcat_slayer');
  if ((stats.cardWins['cli-linux-suid'] || 0) >= 3) tryUnlock('suid_auditor');
  if ((stats.cardWins['cli-fw-default'] || 0) >= 3) tryUnlock('default_denier');
  if (ctx.isMultiStage) tryUnlock('multi_apprentice');
  if (stats.categoryWins.Injects >= 5) tryUnlock('inject_adept');
  if (stats.guiNavWins >= 5) tryUnlock('gui_adept');
  if (stats.totalPerfects >= 10) tryUnlock('perfect_ten_career');
  if (stats.dailyStreak >= 2) tryUnlock('daily_double');
  if (ctx.runHacksSurvived && ctx.runHacksSurvived >= 3) tryUnlock('hacks_three_session');
  if (stats.multiStageWins >= 3) tryUnlock('multi_trio');
  if (ctx.cardId === 'cli-linux-uid0') tryUnlock('linux_passwd_audit');
  if (ctx.cardId === 'cli-win-lsa') tryUnlock('win_lsa_guard');
  if (ctx.cardId === 'cli-fw-tor') tryUnlock('fw_ratelimit');
  if (ctx.cardId === 'multi-win-lateral') tryUnlock('smb_terminator');
  if ((stats.cardWins['sb-1'] || 0) >= 10) tryUnlock('study_expert');
  if (ctx.previousCardFastMs !== undefined && ctx.previousCardFastMs <= 3000 && ctx.timeTakenMs <= 3000) tryUnlock('speed_rush');

  // SECRET RARES
  const timeRemainingMs = ctx.timeLimitMs - ctx.timeTakenMs;
  if (timeRemainingMs > 0 && timeRemainingMs <= 200) tryUnlock('clutch_god');
  if (isNightIncident) tryUnlock('night_stalker');
  if (ctx.mutator === 'PWNED_MARQUEE') tryUnlock('pwned_enjoyer');
  if (isLunchtime) tryUnlock('lunch_break_hero');
  if (ctx.isPerfect && ctx.mutator) tryUnlock('survivor_redteam');

  // ===== EPIC Checks =====
  if (ctx.runPerfectCount >= 8) tryUnlock('perfect_spree');
  if (stats.currentStreak >= 10) tryUnlock('streak_ten');
  if (stats.currentStreak >= 12) tryUnlock('streak_twelve');
  if (stats.currentStreak >= 15) tryUnlock('streak_fifteen');
  if (stats.currentStreak >= 18) tryUnlock('streak_eighteen');
  if (stats.hacksSurvived >= 5) tryUnlock('chaos_veteran');
  if (stats.earthquakeWins >= 1) tryUnlock('earthquake_master');
  if (stats.blurryWins >= 1) tryUnlock('blind_master');
  if ((stats.cardWins['cfg-linux'] || 0) >= 3) tryUnlock('nuke_cron_master');
  if ((stats.cardWins['cfg-linux-ssh'] || 0) >= 3) tryUnlock('ssh_master');
  if (stats.categoryWins.Linux >= 25) tryUnlock('linux_master');
  if (stats.categoryWins.Windows >= 25) tryUnlock('windows_master');
  if (stats.categoryWins.Firewall >= 25) tryUnlock('firewall_master');
  if (stats.categoryWins.Injects >= 15) tryUnlock('inject_master');
  if (stats.guiNavWins >= 15) tryUnlock('gui_master');
  if (stats.feverPoints >= 2500) tryUnlock('fp_2500');
  if (stats.feverPoints >= 3500) tryUnlock('fp_3500');
  if (stats.multiStageWins >= 5) tryUnlock('chain_reaction');
  if (stats.multiStageWins >= 10) tryUnlock('multi_decathlete');
  if (stats.totalPerfects >= 25) tryUnlock('perfect_quarter_century');
  if (ctx.cardId.startsWith('multi-') && ctx.isPerfect) tryUnlock('speed_demon');
  // Matrix Surfer: survived all 5 mutator types
  if (stats.earthquakeWins >= 1 && stats.blurryWins >= 1 && stats.invertedWins >= 1 && stats.marqueeWins >= 1 && stats.upsideDownWins >= 1) {
    tryUnlock('chaos_connoisseur');
  }
  // Win services lockdown: multi-win-lateral has Stop-Service
  if ((stats.cardWins['multi-win-lateral'] || 0) >= 3) tryUnlock('win_services_lockdown');
  // Linux audit pro: 5+ Linux CLI cards cleared
  if (stats.categoryWins.Linux >= 15) tryUnlock('linux_audit_pro');
  // FW deep packet: 5+ firewall cards
  if (stats.categoryWins.Firewall >= 15) tryUnlock('fw_deep_packet');

  // SECRET EPICS
  if (ctx.timeTakenMs <= 1000) tryUnlock('speed_demon_1s');
  if (ctx.timeTakenMs <= 800) tryUnlock('speed_sub_800ms');
  if (ctx.mutator === 'COLOR_INVERT') tryUnlock('inverted_vision');
  if (ctx.cardId === 'multi-hunt-c2') tryUnlock('c2_severer');

  // ===== LEGENDARY Checks =====
  if (stats.currentStreak >= 20) tryUnlock('cyber_legend');
  if (stats.currentStreak >= 25) tryUnlock('streak_twenty_five');
  if (stats.feverPoints >= 5000) tryUnlock('fp_5000');
  if (stats.feverPoints >= 10000) tryUnlock('fp_10000');
  if (stats.feverPoints >= 15000) tryUnlock('fp_15000');
  if (stats.feverPoints >= 20000) tryUnlock('fp_20000');
  if (stats.totalPerfects >= 50) tryUnlock('perfect_century');
  if (stats.totalWins >= 100) tryUnlock('centurion_clears');

  // Mythic Mastery: count how many times player got mutated perfect (stored in cardWins won't work, we need a separate counter)
  // Use a proxy: hacksSurvived that were also perfects. We approximate with the survivor_redteam logic.
  // For simplicity: if player has gotten 5+ mutator+perfect combos, unlock. We can estimate from stats.
  // Since we can't perfectly track this retroactively, we'll check if the card triggers it in context.
  // Actually, let's just track mythic clears within the session implicitly.

  // Tri-discipline master
  if (stats.categoryWins.Windows >= 50 && stats.categoryWins.Linux >= 50 && stats.categoryWins.Firewall >= 50) {
    tryUnlock('tri_discipline_master');
  }

  // Check Leaderboard #1 Secret
  if (getRankForFP(stats.feverPoints) === 1) tryUnlock('leaderboard_titan');

  // SOC Director: 50 achievements unlocked (check AFTER all other unlocks)
  if (unlocked.size >= 50) tryUnlock('grandmaster');

  stats.unlockedAchievementIds = Array.from(unlocked);
  activeStorageAdapter.saveStats(stats);

  const overtake = checkOvertake(oldFP, stats.feverPoints);

  return { newlyUnlocked, earnedFP, overtake };
}

export function evaluateCardLoss(mutator: string | null): void {
  const stats = getPlayerStats();
  const unlocked = new Set(stats.unlockedAchievementIds);
  stats.totalLosses += 1;
  stats.currentStreak = 0;
  if (mutator) {
    stats.hacksEncountered += 1;
  }

  // First Loss Lesson: unlocked on first loss (reviewed educational note)
  if (!unlocked.has('first_loss_lesson')) {
    const ach = ACHIEVEMENTS.find(a => a.id === 'first_loss_lesson');
    if (ach) {
      unlocked.add('first_loss_lesson');
      activeStorageAdapter.saveUnlockedId('first_loss_lesson');
      stats.feverPoints += 25;
      stats.unlockedAchievementIds = Array.from(unlocked);
    }
  }

  activeStorageAdapter.saveStats(stats);
}

export interface RunCompleteContext {
  mode: 'DAILY' | 'FULL' | 'CATEGORY' | 'DEBUG' | 'TUTORIAL';
  totalCards: number;
  perfectCount: number;
  failCount: number;
}

export interface RunCompleteResult {
  newlyUnlocked: Achievement[];
  bonusFP: number;
  overtake: OvertakeEvent | null;
}

export function evaluateRunComplete(ctx: RunCompleteContext): RunCompleteResult {
  const stats = getPlayerStats();
  const oldFP = stats.feverPoints;
  const unlocked = new Set(stats.unlockedAchievementIds);
  const newlyUnlocked: Achievement[] = [];
  let bonusFP = 0;

  const tryUnlock = (id: string) => {
    if (!unlocked.has(id)) {
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (ach) {
        unlocked.add(id);
        newlyUnlocked.push(ach);
        activeStorageAdapter.saveUnlockedId(id);
        const achFP = ach.rarity === 'LEGENDARY' ? 250 :
                      ach.rarity === 'EPIC' ? 100 :
                      ach.rarity === 'RARE' ? 50 : 25;
        stats.feverPoints += achFP;
      }
    }
  };

  if (ctx.mode === 'DAILY' && ctx.failCount === 0) {
    stats.totalDailyClears += 1;
    
    // Daily completion: +250 FP
    bonusFP += 250;

    // Consecutive Daily Streak bonus: 5 FP * dailyStreak
    const todayStr = new Date().toDateString();
    if (stats.lastDailyDate !== todayStr) {
      stats.dailyStreak += 1;
      stats.lastDailyDate = todayStr;
      bonusFP += (5 * stats.dailyStreak);
    }

    tryUnlock('daily_finisher');
    if (stats.dailyStreak >= 2) tryUnlock('daily_double');
    if (stats.totalDailyClears >= 5) tryUnlock('daily_five');
    if (stats.totalDailyClears >= 10) tryUnlock('daily_titan');

    // Flawless Daily (All Perfects): +500 FP
    if (ctx.perfectCount === ctx.totalCards && ctx.totalCards > 0) {
      bonusFP += 500;
      tryUnlock('golden_gauntlet');
    }
  }

  // Secret Marathoner check
  if (ctx.mode === 'FULL' && ctx.totalCards >= 25 && ctx.failCount === 0) {
    tryUnlock('marathoner');
  }

  // Clean Sheet: Full Deck 15+ with 0 losses
  if (ctx.mode === 'FULL' && ctx.totalCards >= 15 && ctx.failCount === 0) {
    tryUnlock('flawless_full_deck');
  }

  // SOC Director
  if (unlocked.size >= 50) {
    tryUnlock('grandmaster');
  }

  stats.feverPoints += bonusFP;
  stats.unlockedAchievementIds = Array.from(unlocked);
  activeStorageAdapter.saveStats(stats);

  const overtake = checkOvertake(oldFP, stats.feverPoints);

  return { newlyUnlocked, bonusFP, overtake };
}
