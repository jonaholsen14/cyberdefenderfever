import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PlayerStats, IAchievementStorage } from '../types/achievement';
import { ACHIEVEMENTS } from '../data/achievements';

const STATS_STORAGE_KEY = 'ccdc_player_stats_v2';
const UNLOCKED_STORAGE_KEY = 'ccdc_unlocked_achievements_v2';

export class FirestoreAdapter implements IAchievementStorage {
  private uid: string;
  private memoryStats: PlayerStats;
  private syncTimeout: NodeJS.Timeout | null = null;

  constructor(uid: string, initialStats: PlayerStats) {
    this.uid = uid;
    this.memoryStats = { ...initialStats };
    // Immediately persist initial snapshot to localStorage as backup
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(this.memoryStats));
        localStorage.setItem(UNLOCKED_STORAGE_KEY, JSON.stringify(this.memoryStats.unlockedAchievementIds || []));
      } catch {}
    }
  }

  loadStats(): PlayerStats {
    return { ...this.memoryStats };
  }

  saveStats(stats: PlayerStats): void {
    this.memoryStats = { ...stats };
    
    // Save to local storage for instant offline/caching resiliency
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
      } catch {}
    }

    // Debounce cloud write (500ms) to conserve Firestore writes while batching rapid score increments
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    this.syncTimeout = setTimeout(() => {
      this.pushToFirestore(this.memoryStats);
    }, 500);
  }

  loadUnlockedIds(): string[] {
    return [...(this.memoryStats.unlockedAchievementIds || [])];
  }

  saveUnlockedId(id: string): void {
    if (!this.memoryStats.unlockedAchievementIds.includes(id)) {
      this.memoryStats.unlockedAchievementIds.push(id);
      this.saveStats(this.memoryStats);

      // Directly ensure cloud array union
      updateDoc(doc(db, 'users', this.uid), {
        unlockedAchievementIds: arrayUnion(id)
      }).catch(err => {
        console.warn('Failed cloud arrayUnion for achievement:', id, err);
      });
    }
  }

  /**
   * Pushes current player stats to user doc and updates the public leaderboard entry
   */
  public async pushToFirestore(stats: PlayerStats): Promise<void> {
    try {
      const userDocRef = doc(db, 'users', this.uid);
      await setDoc(userDocRef, {
        username: stats.username || 'Defender_One',
        selectedBadgeId: stats.selectedBadgeId || 'first_win',
        feverPoints: stats.feverPoints || 0,
        dailyStreak: stats.dailyStreak || 0,
        lastDailyDate: stats.lastDailyDate || null,
        totalWins: stats.totalWins || 0,
        totalLosses: stats.totalLosses || 0,
        totalPerfects: stats.totalPerfects || 0,
        totalDailyClears: stats.totalDailyClears || 0,
        currentStreak: stats.currentStreak || 0,
        bestStreak: stats.bestStreak || 0,
        hacksEncountered: stats.hacksEncountered || 0,
        hacksSurvived: stats.hacksSurvived || 0,
        earthquakeWins: stats.earthquakeWins || 0,
        blurryWins: stats.blurryWins || 0,
        invertedWins: stats.invertedWins || 0,
        marqueeWins: stats.marqueeWins || 0,
        multiStageWins: stats.multiStageWins || 0,
        categoryWins: stats.categoryWins || { Windows: 0, Linux: 0, Firewall: 0, Injects: 0 },
        cardWins: stats.cardWins || {},
        fastestWinMs: stats.fastestWinMs || 999999,
        unlockedAchievementIds: stats.unlockedAchievementIds || [],
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Determine equipped badge details for public leaderboard
      const equippedBadge = ACHIEVEMENTS.find(a => a.id === stats.selectedBadgeId) || ACHIEVEMENTS[0];

      // Update public leaderboard
      const leaderboardRef = doc(db, 'leaderboard', this.uid);
      await setDoc(leaderboardRef, {
        username: stats.username || 'Defender_One',
        badgeIcon: equippedBadge.icon,
        badgeTitle: equippedBadge.title,
        badgeRarity: equippedBadge.rarity,
        feverPoints: stats.feverPoints || 0,
        affiliation: 'Collegiate Defender',
        updatedAt: serverTimestamp()
      }, { merge: true });

    } catch (error) {
      console.error('Failed to sync player stats with Firestore:', error);
    }
  }

  /**
   * Loads the latest remote stats from Firestore into memory
   */
  public async fetchRemoteStats(): Promise<PlayerStats | null> {
    try {
      const snap = await getDoc(doc(db, 'users', this.uid));
      if (snap.exists()) {
        const remote = snap.data() as Partial<PlayerStats>;
        this.memoryStats = {
          ...this.memoryStats,
          ...remote,
          categoryWins: { ...this.memoryStats.categoryWins, ...(remote.categoryWins || {}) },
          cardWins: { ...this.memoryStats.cardWins, ...(remote.cardWins || {}) },
          unlockedAchievementIds: remote.unlockedAchievementIds || this.memoryStats.unlockedAchievementIds || []
        };
        // Update local storage cache
        if (typeof window !== 'undefined') {
          localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(this.memoryStats));
          localStorage.setItem(UNLOCKED_STORAGE_KEY, JSON.stringify(this.memoryStats.unlockedAchievementIds));
        }
        return this.memoryStats;
      }
    } catch (e) {
      console.warn('Could not fetch remote stats, falling back to cached state:', e);
    }
    return null;
  }
}
