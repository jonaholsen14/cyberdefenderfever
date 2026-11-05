'use client';
import React, { useState, useEffect } from 'react';
import { MicrogamePayload } from '../types/game';
import CliExecEngine from './engines/CliExecEngine';
import ConfigEditEngine from './engines/ConfigEditEngine';
import GuiNavEngine from './engines/GuiNavEngine';
import MultipleChoiceEngine from './engines/MultipleChoiceEngine';
import StudyBreakEngine from './engines/StudyBreakEngine';
import TutorialEngine from './engines/TutorialEngine';
import { MICROGAME_QUEUE, TUTORIAL_CARD } from '../data/deck';
import AchievementToast from './AchievementToast';
import TrophyRoomModal from './TrophyRoomModal';
import GlobalHeader from './GlobalHeader';
import LeaderboardModal from './LeaderboardModal';
import AuthModal from './AuthModal';
import BugReportModal from './BugReportModal';
import CampaignModal from './CampaignModal';
import AiDeckStudioModal from './AiDeckStudioModal';
import { Achievement, OvertakeEvent, PlayerStats } from '../types/achievement';
import { ACHIEVEMENTS } from '../data/achievements';
import { getPlayerStats, evaluateCardWin, evaluateCardLoss, evaluateRunComplete, setAchievementStorageAdapter } from '../utils/achievementManager';
import { FirestoreAdapter } from '../utils/firestoreAdapter';
import { useAuth } from '../context/AuthContext';
import { CampaignChapter, MedalType } from '../types/campaign';
import { CAMPAIGN_CHAPTERS, getCampaignProgress, markLessonCompleted, markRemixCompleted } from '../data/campaignChapters';
import { getSRSState, recordCardReview, getDueCardIds, getDueCount, getTotalGraduatedCount, getCustomDecks, graduateCards } from '../utils/srsManager';

type Phase = 'MAIN_MENU' | 'VERB_SLAM' | 'INTERACTIVE' | 'RESOLUTION' | 'EDUCATIONAL_REVIEW' | 'INTERMISSION' | 'VICTORY' | 'DEFEAT';
type MenuTab = 'HOME' | 'FOCUSED';
type GameMode = 'DAILY' | 'FULL' | 'CATEGORY' | 'DEBUG' | 'TUTORIAL' | 'CAMPAIGN_LESSON' | 'CAMPAIGN_REMIX' | 'SRS_REVIEW';

// Seeded RNG generator
function getSeededRandom(seed: number) {
  return function() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function getDailySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function shuffleDeck(array: any[], rng: () => number) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(rng() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function hydrateGame(game: MicrogamePayload, rng: () => number = Math.random): MicrogamePayload {
  if (!game.variables) return game;
  
  const chosenVars: Record<string, string> = {};
  for (const [key, values] of Object.entries(game.variables)) {
    chosenVars[key] = values[Math.floor(rng() * values.length)];
  }

  const replaceVars = (str: string) => {
    let res = str;
    for (const [key, val] of Object.entries(chosenVars)) {
      res = res.replaceAll(`{{${key}}}`, val);
    }
    return res;
  };

  const newGame = JSON.parse(JSON.stringify(game));
  
  const traverse = (obj: any) => {
    if (!obj) return;
    for (const k in obj) {
      if (typeof obj[k] === 'string') {
        obj[k] = replaceVars(obj[k]);
      } else if (typeof obj[k] === 'object' && obj[k] !== null) {
        traverse(obj[k]);
      }
    }
  };
  traverse(newGame);
  
  return newGame;
}

export default function GameManager() {
  const [phase, setPhase] = useState<Phase>('MAIN_MENU');
  const [menuTab, setMenuTab] = useState<MenuTab>('HOME');
  
  // Session State
  const [sessionQueue, setSessionQueue] = useState<MicrogamePayload[]>([]);
  const [unsolvedIds, setUnsolvedIds] = useState<string[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [result, setResult] = useState<'WIN' | 'LOSE' | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [attempts, setAttempts] = useState<string[]>([]);
  const [mutator, setMutator] = useState<string | null>(null);
  const [stageIndex, setStageIndex] = useState(0);

  // Debug State
  const [debugGameId, setDebugGameId] = useState<string>('all');
  const [debugMutator, setDebugMutator] = useState<string>('random');
  const [forcedMutator, setForcedMutator] = useState<string | undefined>(undefined);
  
  // Custom RNG for mutators during daily runs
  const [mutatorRng, setMutatorRng] = useState<(() => number) | null>(null);

  // Achievements, Leaderboard, & Points State
  const { user } = useAuth();
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStats>(getPlayerStats());
  const [overtakeEvent, setOvertakeEvent] = useState<OvertakeEvent | null>(null);
  const [floatingFP, setFloatingFP] = useState<number | null>(null);
  const [isLastClearPerfect, setIsLastClearPerfect] = useState(false);
  const [currentMode, setCurrentMode] = useState<GameMode>('FULL');
  const [isCopied, setIsCopied] = useState(false);

  // Campaign & Spaced Repetition (SRS) State
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState<CampaignChapter | null>(null);
  const [activeLessonCardId, setActiveLessonCardId] = useState<string | null>(null);
  const [remixLives, setRemixLives] = useState(3);
  const [remixLostLives, setRemixLostLives] = useState(0);
  const [remixEarnedMedal, setRemixEarnedMedal] = useState<MedalType | null>(null);
  const [unlockedNextChapterId, setUnlockedNextChapterId] = useState<string | null>(null);
  const [dueCount, setDueCount] = useState<number>(0);
  const [graduatedCount, setGraduatedCount] = useState<number>(0);
  const [hintTier, setHintTier] = useState<0 | 1 | 2>(0);
  const [usedHintThisCard, setUsedHintThisCard] = useState<boolean>(false);
  const [remixFailed, setRemixFailed] = useState(false);

  // Refresh SRS Counts
  const refreshSRSCounts = () => {
    setDueCount(getDueCount());
    setGraduatedCount(getTotalGraduatedCount());
  };

  useEffect(() => {
    refreshSRSCounts();
  }, []);

  // Sync auth state with storage adapter
  useEffect(() => {
    if (user) {
      const adapter = new FirestoreAdapter(user.uid, getPlayerStats());
      setAchievementStorageAdapter(adapter);
      adapter.fetchRemoteStats().then(remote => {
        if (remote) {
          setPlayerStats({ ...remote });
        } else {
          // If brand new account, push local stats up
          adapter.pushToFirestore(getPlayerStats());
          setPlayerStats(getPlayerStats());
        }
      });
    } else {
      // Guest mode
      setPlayerStats(getPlayerStats());
    }
  }, [user]);

  const currentMicrogame = sessionQueue.length > 0 
    ? (sessionQueue.find(g => g.id === unsolvedIds[queueIndex % Math.max(1, unsolvedIds.length)]) || sessionQueue[0])
    : MICROGAME_QUEUE[0];
    
  const activeStage = currentMicrogame.stages ? currentMicrogame.stages[stageIndex] : (currentMicrogame as any);

  const startRun = (mode: 'DAILY' | 'FULL' | 'CATEGORY' | 'DEBUG' | 'TUTORIAL', category?: string) => {
    setCurrentMode(mode);
    let q: MicrogamePayload[] = [];
    let rng = Math.random;

    if (mode === 'DAILY') {
      const seed = getDailySeed();
      rng = getSeededRandom(seed);
      setMutatorRng(() => getSeededRandom(seed + 1));
      
      q = MICROGAME_QUEUE.map(g => hydrateGame(g, rng));
      q = shuffleDeck(q, rng);
      q = q.slice(0, 12); // Cap Daily runs to 12 cards

      // Check if new player hasn't seen the mission briefing yet
      const seen = typeof window !== 'undefined' && localStorage.getItem('ccdc_tutorial_seen') === 'true';
      if (!seen) {
        q = [{ ...TUTORIAL_CARD, payload: { isStandalone: false } }, ...q];
      }
    } else if (mode === 'TUTORIAL') {
      setMutatorRng(null);
      q = [{ ...TUTORIAL_CARD, payload: { isStandalone: true } }];
    } else {
      setMutatorRng(null); // use Math.random
      if (mode === 'FULL') {
        q = MICROGAME_QUEUE.map(g => hydrateGame(g, Math.random));
        q = shuffleDeck(q, Math.random);
      } else if (mode === 'CATEGORY' && category) {
        q = MICROGAME_QUEUE.filter(g => g.category === category).map(g => hydrateGame(g, Math.random));
        q = shuffleDeck(q, Math.random);
      } else if (mode === 'DEBUG') {
        if (debugGameId === 'all') {
          q = MICROGAME_QUEUE.map(g => hydrateGame(g, Math.random));
        } else {
          const g = MICROGAME_QUEUE.find(g => g.id === debugGameId)!;
          q = [hydrateGame(g, Math.random)];
        }
      }
    }
    
    setSessionQueue(q);
    setUnsolvedIds(q.map(g => g.id));
    
    let activeForced: string | undefined = undefined;
    if (mode === 'DEBUG' && debugMutator !== 'random') {
      activeForced = debugMutator === 'none' ? undefined : debugMutator;
      setForcedMutator(activeForced);
    } else {
      setForcedMutator(undefined);
    }
    
    // Set initial mutator (never mutate tutorial briefing card!)
    if (q[0]?.id === 'tutorial-briefing') {
      setMutator(null);
    } else if (activeForced !== undefined) {
      setMutator(activeForced);
    } else if (mode === 'DEBUG' && debugMutator === 'none') {
      setMutator(null);
    } else {
      const chance = rng();
      setMutator(chance < 0.25 ? ['UPSIDE_DOWN', 'BLURRY', 'PWNED_MARQUEE', 'EARTHQUAKE', 'COLOR_INVERT'][Math.floor(rng() * 5)] : null);
    }

    setElapsedTime(0);
    setAttempts([]);
    setQueueIndex(0);
    setStageIndex(0);
    setResult(null);
    setHintTier(0);
    setUsedHintThisCard(false);
    setRemixFailed(false);
    setPhase('VERB_SLAM');
  };

  const triggerHint = () => {
    setUsedHintThisCard(true);
    setHintTier((prev) => (prev === 0 ? 1 : 2));
    if (currentMode === 'CAMPAIGN_LESSON') {
      setTimeRemaining((prev) => Math.max(prev, 45000));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'h' || e.key === 'H') && phase === 'INTERACTIVE' && currentMicrogame.id !== 'tutorial-briefing') {
        triggerHint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, currentMicrogame]);

  const startLesson = (chapter: CampaignChapter, cardId: string) => {
    setActiveChapter(chapter);
    setActiveLessonCardId(cardId);
    setCurrentMode('CAMPAIGN_LESSON');
    setMutator(null);
    setMutatorRng(null);
    setForcedMutator(undefined);

    const customDecks = getCustomDecks();
    const allCards = [...MICROGAME_QUEUE, ...customDecks.flatMap(d => d.cards)];
    const raw = allCards.find(c => c.id === cardId) || MICROGAME_QUEUE[0];
    const hydrated = hydrateGame(raw, Math.random);
    
    // Generous time in lesson mode (60s)
    if (hydrated.stages) {
      hydrated.stages.forEach(s => s.timeLimitMs = Math.max(s.timeLimitMs, 60000));
    } else {
      hydrated.timeLimitMs = Math.max(hydrated.timeLimitMs || 15000, 60000);
    }

    setSessionQueue([hydrated]);
    setUnsolvedIds([hydrated.id]);
    setElapsedTime(0);
    setAttempts([]);
    setQueueIndex(0);
    setStageIndex(0);
    setResult(null);
    setHintTier(0);
    setUsedHintThisCard(false);
    setRemixFailed(false);
    setPhase('VERB_SLAM');
  };

  const startRemix = (chapter: CampaignChapter) => {
    setActiveChapter(chapter);
    setCurrentMode('CAMPAIGN_REMIX');
    setRemixLives(chapter.remixConfig.lives || 3);
    setRemixLostLives(0);
    setRemixEarnedMedal(null);
    setUnlockedNextChapterId(null);
    setMutatorRng(null);
    setForcedMutator(undefined);

    const customDecks = getCustomDecks();
    const allCards = [...MICROGAME_QUEUE, ...customDecks.flatMap(d => d.cards)];
    const chapterCards = chapter.cardIds.map(id => allCards.find(c => c.id === id)).filter(Boolean) as MicrogamePayload[];
    
    const rounds = chapter.remixConfig.rounds || 5;
    let pool: MicrogamePayload[] = [];
    while (pool.length < rounds) {
      pool.push(...shuffleDeck([...chapterCards], Math.random));
    }
    const q = pool.slice(0, rounds).map(c => hydrateGame(c, Math.random));

    setSessionQueue(q);
    setUnsolvedIds(q.map(c => c.id));
    setElapsedTime(0);
    setAttempts([]);
    setQueueIndex(0);
    setStageIndex(0);
    setResult(null);
    setHintTier(0);
    setUsedHintThisCard(false);
    setRemixFailed(false);
    setPhase('VERB_SLAM');
  };

  const startSRSReview = () => {
    const dueIds = getDueCardIds();
    const customDecks = getCustomDecks();
    const allCards = [...MICROGAME_QUEUE, ...customDecks.flatMap(d => d.cards)];
    
    let targetCards: MicrogamePayload[] = [];
    if (dueIds.length > 0) {
      targetCards = dueIds.map(id => allCards.find(c => c.id === id)).filter(Boolean) as MicrogamePayload[];
    } else {
      // Cram Session: use graduated cards or Chapter 1
      const state = getSRSState();
      const gradIds = Object.keys(state.cards);
      if (gradIds.length > 0) {
        targetCards = gradIds.map(id => allCards.find(c => c.id === id)).filter(Boolean) as MicrogamePayload[];
      } else {
        graduateCards(CAMPAIGN_CHAPTERS[0].cardIds);
        targetCards = CAMPAIGN_CHAPTERS[0].cardIds.map(id => allCards.find(c => c.id === id)).filter(Boolean) as MicrogamePayload[];
      }
    }

    setCurrentMode('SRS_REVIEW');
    setMutatorRng(null);
    setForcedMutator(undefined);
    const q = shuffleDeck(targetCards, Math.random).slice(0, 10).map(c => hydrateGame(c, Math.random));

    setSessionQueue(q);
    setUnsolvedIds(q.map(c => c.id));
    setElapsedTime(0);
    setAttempts([]);
    setQueueIndex(0);
    setStageIndex(0);
    setResult(null);
    setHintTier(0);
    setUsedHintThisCard(false);
    setRemixFailed(false);
    setPhase('VERB_SLAM');
  };

  // Stopwatch Timer
  useEffect(() => {
    if (phase === 'VICTORY' || phase === 'MAIN_MENU') return;
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Phase State Machine
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (phase === 'VERB_SLAM') {
      setTimeRemaining(activeStage.timeLimitMs);
      timer = setTimeout(() => {
        setPhase('INTERACTIVE');
        setResult(null);
      }, 1000);
    } else if (phase === 'RESOLUTION') {
      timer = setTimeout(() => {
        if (result === 'LOSE') {
          if (currentMode === 'CAMPAIGN_REMIX' && remixFailed) {
            setPhase('DEFEAT');
            return;
          }
          setPhase('EDUCATIONAL_REVIEW');
        } else {
          const nextUnsolved = unsolvedIds.filter(id => id !== currentMicrogame.id);
          setUnsolvedIds(nextUnsolved);
          
          if (nextUnsolved.length === 0) {
            if (currentMode === 'TUTORIAL') {
              setPhase('MAIN_MENU');
              return;
            }
            if (currentMode === 'CAMPAIGN_LESSON') {
              setPhase('VICTORY');
              return;
            }
            if (currentMode === 'CAMPAIGN_REMIX' && activeChapter) {
              let medal: MedalType = 'BRONZE';
              if (remixLostLives === 0) {
                medal = attempts.filter(a => a.includes('PERFECT')).length >= 2 ? 'GOLD' : 'SILVER';
              }
              setRemixEarnedMedal(medal);
              const { nextChapterUnlocked } = markRemixCompleted(
                activeChapter.id,
                medal,
                playerStats.feverPoints,
                activeChapter.cardIds
              );
              if (nextChapterUnlocked) {
                setUnlockedNextChapterId(nextChapterUnlocked);
              }
              refreshSRSCounts();
              setPhase('VICTORY');
              return;
            }
            if (currentMode === 'SRS_REVIEW') {
              refreshSRSCounts();
              setPhase('VICTORY');
              return;
            }
            const { newlyUnlocked, bonusFP, overtake } = evaluateRunComplete({
              mode: currentMode,
              totalCards: sessionQueue.filter(g => g.id !== 'tutorial-briefing').length,
              perfectCount: attempts.filter(a => a.includes('PERFECT')).length,
              failCount: attempts.filter(a => a.includes('LOSE')).length
            });
            if (bonusFP > 0) {
              setFloatingFP(bonusFP);
              setTimeout(() => setFloatingFP(null), 2500);
            }
            if (overtake) {
              setOvertakeEvent(overtake);
            }
            if (newlyUnlocked.length > 0) {
              setAchievementQueue(prev => [...prev, ...newlyUnlocked]);
            }
            setPlayerStats(getPlayerStats());
            setPhase('VICTORY');
          } else {
            setPhase('INTERMISSION');
          }
        }
      }, 1000);
    } else if (phase === 'EDUCATIONAL_REVIEW') {
      timer = setTimeout(() => {
        setPhase('INTERMISSION');
      }, 6000); // 6 seconds penalty reading time
    } else if (phase === 'INTERMISSION') {
      timer = setTimeout(() => {
        if (result === 'LOSE') {
          setQueueIndex((prev) => prev + 1);
        }
        
        setStageIndex(0);
        setHintTier(0);
        setUsedHintThisCard(false);

        if (forcedMutator !== undefined) {
          setMutator(forcedMutator);
        } else if (debugMutator === 'none') {
          setMutator(null);
        } else {
          const rng = mutatorRng || Math.random;
          setMutator(rng() < 0.25 ? ['UPSIDE_DOWN', 'BLURRY', 'PWNED_MARQUEE', 'EARTHQUAKE', 'COLOR_INVERT'][Math.floor(rng() * 5)] : null);
        }
        
        setPhase('VERB_SLAM');
      }, 500);
    }

    return () => clearTimeout(timer);
  }, [phase, currentMicrogame, result, unsolvedIds, forcedMutator, debugMutator, mutatorRng]);

  // Timer for INTERACTIVE phase
  useEffect(() => {
    if (phase === 'INTERACTIVE') {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 100) {
            clearInterval(interval);
            handleLose("TIME OUT!");
            return 0;
          }
          return prev - 100;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const handleWin = () => {
    if (phase !== 'INTERACTIVE') return;

    if (currentMicrogame.id === 'tutorial-briefing') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('ccdc_tutorial_seen', 'true');
      }
      setIsLastClearPerfect(false);
      setResult('WIN');
      setPhase('RESOLUTION');
      setFloatingFP(10);
      setTimeout(() => setFloatingFP(null), 1800);
      return;
    }

    const stagesCount = currentMicrogame.stages ? currentMicrogame.stages.length : 1;
    if (stageIndex < stagesCount - 1) {
      setStageIndex(prev => prev + 1);
      setPhase('VERB_SLAM');
      return;
    }

    const isPerfect = timeRemaining > (activeStage.timeLimitMs / 2);
    setIsLastClearPerfect(isPerfect);

    const attemptType = isPerfect 
      ? (mutator ? 'MUTATED_PERFECT_WIN' : 'PERFECT_WIN')
      : (mutator ? 'MUTATED_WIN' : 'WIN');

    setAttempts(prev => [...prev, attemptType]);
    setResult('WIN');
    setPhase('RESOLUTION');

    const runPerfectCount = attempts.filter(a => a.includes('PERFECT')).length + (isPerfect ? 1 : 0);
    const { newlyUnlocked, earnedFP, overtake } = evaluateCardWin({
      cardId: currentMicrogame.id,
      category: currentMicrogame.category,
      engine: activeStage.engine,
      timeTakenMs: activeStage.timeLimitMs - timeRemaining,
      timeLimitMs: activeStage.timeLimitMs,
      isPerfect,
      mutator,
      runPerfectCount,
      isMultiStage: Boolean(currentMicrogame.stages)
    });

    setFloatingFP(earnedFP);
    setTimeout(() => setFloatingFP(null), 1800);

    if (overtake) {
      setOvertakeEvent(overtake);
    }

    if (newlyUnlocked.length > 0) {
      setAchievementQueue(prev => [...prev, ...newlyUnlocked]);
    }
    setPlayerStats(getPlayerStats());

    if (currentMode === 'SRS_REVIEW') {
      recordCardReview(currentMicrogame.id, true, usedHintThisCard);
      refreshSRSCounts();
    } else if (currentMode === 'CAMPAIGN_LESSON' && activeChapter) {
      markLessonCompleted(activeChapter.id, currentMicrogame.id);
    }
  };

  const handleLose = (reason: string) => {
    if (phase !== 'INTERACTIVE') return;
    setIsLastClearPerfect(false);
    setAttempts(prev => [...prev, mutator ? 'MUTATED_LOSE' : 'LOSE']);
    setResult('LOSE');
    setPhase('RESOLUTION');
    evaluateCardLoss(mutator);

    if (currentMode === 'SRS_REVIEW') {
      recordCardReview(currentMicrogame.id, false, usedHintThisCard);
      refreshSRSCounts();
    } else if (currentMode === 'CAMPAIGN_REMIX') {
      const nextLives = Math.max(0, remixLives - 1);
      setRemixLives(nextLives);
      setRemixLostLives(prev => prev + 1);
      if (nextLives === 0) {
        setRemixFailed(true);
      }
    }
  };

  const renderEngine = () => {
    const Engine = activeStage.engine === 'CLI_EXEC' ? CliExecEngine :
                   activeStage.engine === 'CONFIG_EDIT' ? ConfigEditEngine :
                   activeStage.engine === 'GUI_NAV' ? GuiNavEngine :
                   activeStage.engine === 'MULTIPLE_CHOICE' ? MultipleChoiceEngine :
                   activeStage.engine === 'STUDY_BREAK' ? StudyBreakEngine :
                   activeStage.engine === 'TUTORIAL' ? TutorialEngine :
                   null;
    
    if (!Engine) return <div className="text-red-500">Unknown Engine: {activeStage.engine}</div>;

    return (
      <Engine
        key={`${currentMicrogame.id}-${stageIndex}`}
        payload={activeStage.payload}
        onWin={handleWin}
        onLose={handleLose}
        timeRemainingMs={timeRemaining}
        isActive={phase === 'INTERACTIVE'}
      />
    );
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getCorrectAnswerText = (game: MicrogamePayload) => {
    try {
      const stage: any = game.stages ? game.stages[stageIndex] : game;
      if (stage.engine === 'CLI_EXEC') {
        if (stage.payload.sequence) return stage.payload.sequence.map((s: any) => s.command).join(' THEN ');
        return stage.payload.successCommands?.[0] || stage.hint;
      }
      if (stage.engine === 'GUI_NAV') {
        const steps = stage.payload.steps.map((s: any) => s.correctOption).join(' > ');
        return `${steps} > ${stage.payload.finalToggle.label}`;
      }
      if (stage.engine === 'MULTIPLE_CHOICE') {
        return stage.payload.options.find((o: any) => o.isCorrect)?.text || stage.hint;
      }
      if (stage.engine === 'CONFIG_EDIT') {
        return stage.hint;
      }
      if (stage.engine === 'STUDY_BREAK') {
        return "You were supposed to read the fun fact and click Acknowledge!";
      }
    } catch (e) {}
    const stageFallback: any = game.stages ? game.stages[stageIndex] : game;
    return stageFallback.hint || "Time ran out!";
  };

  const generateWordleSnippet = () => {
    // Generate clean emoji grid lines
    const emojiMap: Record<string, string> = {
      'PERFECT_WIN': '⭐',
      'MUTATED_PERFECT_WIN': '👑',
      'WIN': '🟩',
      'LOSE': '🟥',
      'MUTATED_WIN': '🛡️',
      'MUTATED_LOSE': '❌'
    };

    const emojis = attempts.map(a => emojiMap[a] || '⬜');
    
    // Chunk emojis 5 per row with clean separation
    const rows: string[] = [];
    for (let i = 0; i < emojis.length; i += 5) {
      rows.push(emojis.slice(i, i + 5).join(' '));
    }
    const gridText = rows.join('\n');

    const mutatorCount = attempts.filter(a => a.startsWith('MUTATED')).length;
    const perfectCount = attempts.filter(a => a.includes('PERFECT')).length;

    const equippedBadge = playerStats.selectedBadgeId 
      ? ACHIEVEMENTS.find(a => a.id === playerStats.selectedBadgeId) 
      : null;
    const badgePrefix = equippedBadge ? `[${equippedBadge.icon} ${equippedBadge.title}] ` : '';

    const actualDeckLength = sessionQueue.filter(g => g.id !== 'tutorial-briefing').length;

    return `Cyber Defender Fever 🛡️\n👤 ${badgePrefix}${playerStats.username || 'Defender'} • 🔥 ${playerStats.feverPoints} FP\n⏱️ Time: ${formatTime(elapsedTime)}\n🃏 Deck: ${actualDeckLength} cards\n⭐ Perfects: ${perfectCount}\n👾 Hacks: ${mutatorCount}\n\n${gridText}\n\n🟩=Clear  ⭐=Perfect  🛡️=Hacked  👑=Hacked(Perfect)  🟥=Fail  ❌=Hacked(Fail)\n\nPlay at: https://cyber-trainer.web.app`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative pt-16 p-4">
      {/* Standard Persistent Global Header */}
      <GlobalHeader 
        stats={playerStats}
        inGame={phase !== 'MAIN_MENU'}
        isTutorial={currentMicrogame?.id === 'tutorial-briefing'}
        currentCardNumber={
          sessionQueue.some(g => g.id === 'tutorial-briefing')
            ? Math.max(1, sessionQueue.length - unsolvedIds.length)
            : Math.min(sessionQueue.length, Math.max(1, sessionQueue.length - unsolvedIds.length + 1))
        }
        totalCards={Math.max(1, sessionQueue.filter(g => g.id !== 'tutorial-briefing').length)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenBugReport={() => setIsBugReportOpen(true)}
        onOpenCampaign={() => setIsCampaignOpen(true)}
        onOpenStudio={() => setIsStudioOpen(true)}
        onGoHome={() => {
          setPhase('MAIN_MENU');
          setMenuTab('HOME');
          refreshSRSCounts();
        }}
      />
      
      {phase === 'MAIN_MENU' && (
        <div className="flex flex-col items-center justify-center z-50 text-white w-full max-w-3xl bg-gray-900/95 border-2 border-cyan-500/30 p-6 sm:p-8 rounded-2xl shadow-[0_0_35px_rgba(6,182,212,0.15)] backdrop-blur-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-500 uppercase tracking-widest">
              Cyber Defender Fever
            </h1>
            <p className="text-xs sm:text-sm text-cyan-400/80 font-mono mt-1">CCDC Incident Response Simulation & Training Engine</p>
          </div>
          
          {menuTab === 'HOME' && (
            <div className="w-full flex flex-col gap-4 font-sans">
              
              {/* Top 3 Core Game Modes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                
                {/* 1. STORY CAMPAIGN (DOJO) */}
                <div 
                  onClick={() => setIsCampaignOpen(true)}
                  className="p-5 rounded-2xl bg-gradient-to-b from-cyan-950/40 to-blue-950/30 border border-cyan-500/40 hover:border-cyan-400 hover:scale-[1.02] cursor-pointer transition-all flex flex-col justify-between shadow-lg shadow-cyan-950/50 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl group-hover:scale-110 transition-transform">🥋</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        RHYTHM CAMPAIGN
                      </span>
                    </div>
                    <h3 className="font-black text-lg text-white tracking-wide group-hover:text-cyan-300 transition-colors">
                      Story Mode
                    </h3>
                    <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
                      Guided lessons, two-tier hints, and 3-strike Chapter Remix tests with medals.
                    </p>
                  </div>
                  <button className="mt-4 w-full py-2 bg-cyan-600 group-hover:bg-cyan-500 text-white font-bold text-xs rounded-lg uppercase tracking-wider transition-all">
                    Enter Dojo →
                  </button>
                </div>

                {/* 2. DAILY CHALLENGE (RAINBOW CARD) */}
                <div 
                  onClick={() => startRun('DAILY')}
                  className="relative cursor-pointer transition-all hover:scale-[1.02] group rounded-2xl p-[2px] overflow-hidden flex flex-col justify-between shadow-lg"
                >
                  <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,red,yellow,green,cyan,blue,magenta,red)] animate-[spin_4s_linear_infinite]" />
                  <div className="relative w-full h-full p-5 bg-black/95 rounded-[14px] flex flex-col justify-between backdrop-blur-md">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl group-hover:scale-110 transition-transform">⚡</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40">
                          DAILY SEED
                        </span>
                      </div>
                      <h3 className="font-black text-lg text-white uppercase tracking-wider group-hover:text-yellow-400 transition-colors">
                        Daily Incident
                      </h3>
                      <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
                        Competitive seeded 12-card sprint. One chance daily to climb the leaderboard!
                      </p>
                    </div>
                    <button className="mt-4 w-full py-2 bg-gradient-to-r from-orange-600 to-red-600 group-hover:from-orange-500 group-hover:to-red-500 text-white font-bold text-xs rounded-lg uppercase tracking-wider transition-all">
                      Play Daily 🔥
                    </button>
                  </div>
                </div>

                {/* 3. DAILY SRS REVIEW */}
                <div 
                  onClick={startSRSReview}
                  className="p-5 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-teal-950/30 border border-emerald-500/40 hover:border-emerald-400 hover:scale-[1.02] cursor-pointer transition-all flex flex-col justify-between shadow-lg shadow-emerald-950/50 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl group-hover:scale-110 transition-transform">🧠</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        dueCount > 0 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse' 
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {dueCount > 0 ? `${dueCount} DUE TODAY` : 'ALL CAUGHT UP'}
                      </span>
                    </div>
                    <h3 className="font-black text-lg text-white tracking-wide group-hover:text-emerald-300 transition-colors">
                      SRS Review
                    </h3>
                    <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
                      Modified SM-2 interval scheduler. Review graduated cards to cement long-term recall.
                    </p>
                  </div>
                  <button className="mt-4 w-full py-2 bg-emerald-600 group-hover:bg-emerald-500 text-white font-bold text-xs rounded-lg uppercase tracking-wider transition-all">
                    {dueCount > 0 ? `Review (${dueCount}) →` : 'Cram Practice →'}
                  </button>
                </div>

              </div>
              
              {/* Secondary Navigation Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2">
                <button 
                  onClick={() => startRun('FULL')} 
                  className="py-3 bg-gray-800/90 hover:bg-gray-700 font-bold text-xs rounded-xl shadow transition-all border border-gray-700 hover:border-gray-500 flex items-center justify-center gap-1.5 text-gray-200"
                >
                  <span>🎮</span> Full Deck
                </button>
                <button 
                  onClick={() => setMenuTab('FOCUSED')} 
                  className="py-3 bg-gray-800/90 hover:bg-gray-700 font-bold text-xs rounded-xl shadow transition-all border border-gray-700 hover:border-gray-500 flex items-center justify-center gap-1.5 text-gray-200"
                >
                  <span>🎯</span> Categories
                </button>
                <button 
                  onClick={() => setIsStudioOpen(true)} 
                  className="py-3 bg-purple-950/40 hover:bg-purple-900/60 font-bold text-xs rounded-xl shadow transition-all border border-purple-500/40 hover:border-purple-400 flex items-center justify-center gap-1.5 text-purple-300"
                >
                  <span>🤖</span> AI Studio
                </button>
                <button 
                  onClick={() => startRun('TUTORIAL')} 
                  className="py-3 bg-gray-800/90 hover:bg-gray-700 font-bold text-xs rounded-xl shadow transition-all border border-gray-700 hover:border-emerald-500/50 flex items-center justify-center gap-1.5 text-emerald-400"
                >
                  <span>💡</span> Briefing
                </button>
              </div>

            </div>
          )}

          {menuTab === 'FOCUSED' && (
            <div className="w-full flex flex-col gap-4 font-sans">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-300">FOCUSED TRAINING</h2>
                <button onClick={() => setMenuTab('HOME')} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded">Back</button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <button onClick={() => startRun('CATEGORY', 'Windows')} className="bg-blue-900 hover:bg-blue-800 border border-blue-500 py-2 rounded">Windows</button>
                <button onClick={() => startRun('CATEGORY', 'Linux')} className="bg-orange-900 hover:bg-orange-800 border border-orange-500 py-2 rounded">Linux</button>
                <button onClick={() => startRun('CATEGORY', 'Firewall')} className="bg-red-900 hover:bg-red-800 border border-red-500 py-2 rounded">Firewall</button>
                <button onClick={() => startRun('CATEGORY', 'Injects')} className="bg-purple-900 hover:bg-purple-800 border border-purple-500 py-2 rounded">Injects</button>
              </div>

              <div className="w-full border-t border-gray-700 pt-4 flex flex-col gap-2">
                <h2 className="text-sm font-bold text-gray-500">DEBUG & PLAYTEST</h2>
                
                <label className="flex flex-col text-xs text-gray-400">
                  Select Scenario:
                  <select value={debugGameId} onChange={e => setDebugGameId(e.target.value)} className="mt-1 bg-black border border-gray-600 text-white p-2 rounded focus:outline-none focus:border-blue-500">
                    <option value="all">-- All Scenarios --</option>
                    {MICROGAME_QUEUE.map(g => <option key={g.id} value={g.id}>[Tier {g.tier}] {g.verb || (g.stages && g.stages[0].verb) || g.id}</option>)}
                  </select>
                </label>

                <label className="flex flex-col text-xs text-gray-400">
                  Force Hack / Mutator:
                  <select value={debugMutator} onChange={e => setDebugMutator(e.target.value)} className="mt-1 bg-black border border-gray-600 text-white p-2 rounded focus:outline-none focus:border-blue-500">
                    <option value="random">Random (25% chance)</option>
                    <option value="none">None (Disabled)</option>
                    <option value="UPSIDE_DOWN">Upside Down</option>
                    <option value="BLURRY">Blurry Vision</option>
                    <option value="PWNED_MARQUEE">Pwned Marquee</option>
                    <option value="COLOR_INVERT">Color Invert</option>
                    <option value="EARTHQUAKE">Earthquake</option>
                  </select>
                </label>

                <button onClick={() => startRun('DEBUG')} className="w-full py-2 bg-gray-700 hover:bg-gray-600 font-bold text-sm rounded border border-gray-500 mt-2 transition-all">
                  LAUNCH DEBUG RUN
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {phase !== 'MAIN_MENU' && (
        <div className="absolute top-20 left-6 z-30 flex flex-col items-start gap-1.5 select-none pointer-events-none">
          <div className="text-xs font-bold font-mono bg-gray-900/90 border border-gray-700 px-3 py-1.5 rounded shadow text-blue-400">
            ⏱️ TIME: {formatTime(elapsedTime)}
          </div>
          {currentMode === 'CAMPAIGN_REMIX' && (
            <div className="text-xs font-mono bg-red-950/90 border border-red-500/80 px-3 py-1 rounded text-red-200 font-bold shadow flex items-center gap-1.5 pointer-events-auto">
              <span>STRIKES:</span>
              <span className="text-sm tracking-widest">
                {'❤️'.repeat(remixLives)}{'🖤'.repeat(3 - remixLives)}
              </span>
            </div>
          )}
          {currentMode === 'CAMPAIGN_LESSON' && (
            <div className="text-xs font-mono bg-cyan-950/90 border border-cyan-500/80 px-3 py-1 rounded text-cyan-200 font-bold shadow pointer-events-auto">
              <span>🥋 DOJO PRACTICE • UNLIMITED HINTS</span>
            </div>
          )}
          {currentMode === 'SRS_REVIEW' && (
            <div className="text-xs font-mono bg-emerald-950/90 border border-emerald-500/80 px-3 py-1 rounded text-emerald-200 font-bold shadow pointer-events-auto">
              <span>🧠 SPACED REPETITION REVIEW</span>
            </div>
          )}
          {currentMicrogame.id === 'tutorial-briefing' ? (
            <div className="text-xs font-mono bg-emerald-950/90 border border-emerald-600/80 px-3 py-1 rounded text-emerald-300 font-bold shadow">
              <span>⚡ SYSTEM ONBOARDING</span>
            </div>
          ) : (
            <>
              <div className="text-xs font-mono bg-gray-900/90 border border-gray-700 px-3 py-1.5 rounded text-white opacity-90 flex items-center gap-1.5 shadow">
                <span>CARDS LEFT: {unsolvedIds.filter(id => id !== 'tutorial-briefing').length}</span>
                {currentMicrogame.stages && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-600 font-bold tracking-wider animate-pulse">
                    {stageIndex + 1}/{currentMicrogame.stages.length}
                  </span>
                )}
              </div>
              <div className="text-xs font-mono bg-gray-900/90 border border-gray-700 px-3 py-1 rounded text-yellow-500 opacity-90 tracking-wider flex items-center gap-1.5 shadow">
                <span>TIER {'★'.repeat(currentMicrogame.tier)}</span>
                {currentMicrogame.category && (
                  <span className="text-[10px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded uppercase">
                    {currentMicrogame.category}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {phase === 'VICTORY' && (
        <div className="flex flex-col items-center justify-center z-50 text-center max-w-xl p-4">
          {currentMode === 'CAMPAIGN_REMIX' ? (
            <div className="flex flex-col items-center mb-6">
              <div className="text-7xl mb-2 animate-bounce">
                {remixEarnedMedal === 'GOLD' ? '🥇' : remixEarnedMedal === 'SILVER' ? '🥈' : '🥉'}
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] mb-2">
                {remixEarnedMedal} MEDAL!
              </h1>
              <p className="text-base text-emerald-400 font-mono font-bold">
                ✓ Chapter Cleared! All chapter cards graduated to your Daily SRS Deck!
              </p>
              {unlockedNextChapterId && (
                <div className="mt-3 px-4 py-2 rounded-xl bg-cyan-950/90 border border-cyan-400 text-cyan-300 font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-pulse">
                  ⚡ NEXT CHAPTER UNLOCKED!
                </div>
              )}
            </div>
          ) : currentMode === 'CAMPAIGN_LESSON' ? (
            <div className="flex flex-col items-center mb-6">
              <div className="text-6xl mb-2">🎯</div>
              <h1 className="text-4xl md:text-5xl font-black uppercase text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)] mb-2">
                LESSON COMPLETED!
              </h1>
              <p className="text-sm text-gray-300 font-mono max-w-md">
                Technique verified and logged in your Dojo campaign.
              </p>
            </div>
          ) : currentMode === 'SRS_REVIEW' ? (
            <div className="flex flex-col items-center mb-6">
              <div className="text-6xl mb-2">🧠</div>
              <h1 className="text-4xl md:text-5xl font-black uppercase text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)] mb-2">
                REVIEW COMPLETE!
              </h1>
              <p className="text-sm text-gray-300 font-mono max-w-md">
                Memory retention intervals updated via Modified SM-2. Keep defending!
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-6xl md:text-8xl font-black uppercase text-center text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.8)] mb-4">
                DECK CLEARED
              </h1>
              <p className="text-2xl text-gray-300 font-mono mb-6">Final Time: {formatTime(elapsedTime)}</p>
              
              <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-6 mb-8 w-full max-w-md shadow-2xl relative font-sans text-left">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-300 font-bold text-xs uppercase tracking-wider">Share your run</h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generateWordleSnippet());
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      isCopied
                        ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {isCopied ? 'COPIED! ✓' : 'COPY TO CLIPBOARD 📋'}
                  </button>
                </div>
                <textarea 
                  readOnly 
                  className="w-full h-44 bg-black border border-gray-700 text-gray-100 p-3.5 font-mono text-xs leading-relaxed resize-none rounded-xl focus:outline-none focus:border-green-500 select-all"
                  value={generateWordleSnippet()}
                  onClick={(e) => {
                    e.currentTarget.select();
                    navigator.clipboard.writeText(e.currentTarget.value);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                />
              </div>
            </>
          )}

          <div className="flex gap-4">
            <button 
              onClick={() => {
                setPhase('MAIN_MENU');
                if (currentMode === 'CAMPAIGN_LESSON' || currentMode === 'CAMPAIGN_REMIX') {
                  setIsCampaignOpen(true);
                }
              }}
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold font-mono text-lg rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all"
            >
              {currentMode.startsWith('CAMPAIGN') ? 'BACK TO DOJO 🥋' : 'MAIN MENU'}
            </button>
            {currentMode === 'CAMPAIGN_REMIX' && activeChapter && (
              <button 
                onClick={() => startRemix(activeChapter)}
                className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold font-mono text-lg rounded-xl shadow-[0_0_15px_rgba(234,88,12,0.5)] transition-all"
              >
                REPLAY REMIX 🔄
              </button>
            )}
            {!currentMode.startsWith('CAMPAIGN') && (
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold font-mono text-xl rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all"
              >
                RESTART APP
              </button>
            )}
          </div>
        </div>
      )}

      {phase === 'DEFEAT' && (
        <div className="flex flex-col items-center justify-center z-50 p-6 text-center max-w-lg">
          <div className="text-7xl mb-4 animate-bounce">💥</div>
          <h1 className="text-4xl md:text-6xl font-black uppercase text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] mb-2 tracking-wider">
            REMIX FAILED
          </h1>
          <p className="text-sm sm:text-base text-gray-300 font-mono mb-6 leading-relaxed">
            Red team breached your defenses! All 3 strikes were triggered during the Chapter Remix.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                if (activeChapter) startRemix(activeChapter);
              }}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold font-mono text-base rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all"
            >
              RETRY REMIX 🔄
            </button>
            <button
              onClick={() => {
                setPhase('MAIN_MENU');
                setIsCampaignOpen(true);
              }}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold font-mono text-base rounded-xl transition-all"
            >
              RETURN TO DOJO 🥋
            </button>
          </div>
        </div>
      )}

      {phase === 'VERB_SLAM' && (
        <div className="flex flex-col items-center z-50">
          {mutator && <div className="text-red-500 font-bold text-3xl animate-pulse mb-4 tracking-widest">⚠️ SYSTEM HACKED ⚠️</div>}
          {currentMicrogame.stages && (
            <div className="flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full bg-purple-950/90 border-2 border-purple-500 text-purple-300 font-mono font-black text-xs sm:text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(168,85,247,0.6)]">
              <span>⚡ MULTI-STAGE INCIDENT</span>
              <span>•</span>
              <span className="text-yellow-400">STAGE {stageIndex + 1} OF {currentMicrogame.stages.length}</span>
            </div>
          )}
          <h1 className="text-6xl md:text-8xl font-black uppercase text-center animate-bounce text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
            {activeStage.verb}
          </h1>
          {currentMicrogame.stages && stageIndex > 0 && (
            <div className="text-emerald-400 font-bold text-sm tracking-wider mt-3 animate-pulse flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/60 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <span>✓</span> STEP {stageIndex} SECURED! PROCEEDING TO NEXT OBJECTIVE:
            </div>
          )}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake-tight {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(3px, -3px) rotate(1deg); }
          50% { transform: translate(-3px, 3px) rotate(-1deg); }
          75% { transform: translate(3px, 3px) rotate(0deg); }
        }
        .animate-earthquake {
          animation: shake-tight 0.15s infinite;
        }
        @keyframes pan-grid {
          0% { background-position: 0 0; }
          100% { background-position: 0 40px; }
        }
        .bg-grid {
          background-size: 40px 40px;
          background-image: linear-gradient(to right, rgba(34, 197, 94, 0.2) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(34, 197, 94, 0.2) 1px, transparent 1px);
          animation: pan-grid 5s linear infinite;
        }
        .xterm-viewport {
          overflow: hidden !important;
        }
      `}} />

      {/* Subtle Hacker Background */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-grid opacity-100"></div>
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black"></div>

      {(phase === 'INTERACTIVE' || phase === 'RESOLUTION' || phase === 'EDUCATIONAL_REVIEW') && (
        <div className="w-full max-w-3xl xl:max-w-4xl flex flex-col items-center justify-center h-full relative z-40">
          <div 
            className="w-full relative rounded-xl p-1.5 transition-all duration-100 flex flex-col flex-1 max-h-[80%]"
            style={{
              background: phase === 'INTERACTIVE' && currentMicrogame.id !== 'tutorial-briefing'
                ? `conic-gradient(${timeRemaining < 3000 ? '#ef4444' : '#eab308'} ${Math.max(0, (timeRemaining / activeStage.timeLimitMs) * 360)}deg, transparent 0deg)`
                : 'transparent',
              boxShadow: (phase === 'INTERACTIVE' && currentMicrogame.id !== 'tutorial-briefing') 
                ? (timeRemaining < 3000 ? '0 0 40px rgba(239, 68, 68, 0.6)' : '0 0 20px rgba(234, 179, 8, 0.3)')
                : 'none'
            }}
          >
            <div className={`flex-1 w-full bg-gray-900 rounded-lg p-4 relative overflow-hidden flex flex-col transition-all duration-300
              ${mutator === 'UPSIDE_DOWN' && (phase === 'INTERACTIVE' || phase === 'RESOLUTION') ? 'rotate-180' : ''}
              ${mutator === 'BLURRY' && (phase === 'INTERACTIVE' || phase === 'RESOLUTION') ? 'blur-[1px]' : ''}
              ${mutator === 'COLOR_INVERT' && (phase === 'INTERACTIVE' || phase === 'RESOLUTION') ? 'invert hue-rotate-180' : ''}
              ${mutator === 'EARTHQUAKE' && (phase === 'INTERACTIVE' || phase === 'RESOLUTION') ? 'animate-earthquake' : ''}
            `}>
             {mutator === 'PWNED_MARQUEE' && phase === 'INTERACTIVE' && (() => {
               const Marquee = 'marquee' as any;
               return (
                 <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden flex flex-col justify-around opacity-40 mix-blend-screen">
                   <Marquee scrollamount="20" className="text-red-500 text-6xl font-black uppercase">YOU ARE PWNED YOU ARE PWNED</Marquee>
                   <Marquee scrollamount="25" direction="right" className="text-green-500 text-8xl font-black uppercase">HACKED HACKED HACKED</Marquee>
                   <Marquee scrollamount="15" className="text-purple-500 text-6xl font-black uppercase">GET GOOD GET GOOD GET GOOD</Marquee>
                 </div>
               );
              })()}
             
              {/* Dedicated Card Header Bar (Non-overlapping) */}
              {phase === 'INTERACTIVE' && currentMicrogame.id !== 'tutorial-briefing' && (
                <div className="w-full flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-gray-800/80 z-10 select-none flex-shrink-0">
                  {/* Left: Chain stage if multi-stage, or Category/Tier badge */}
                  <div>
                    {currentMicrogame.stages ? (
                      <div className="flex items-center gap-2 bg-purple-950/90 border border-purple-500/80 text-purple-200 px-3 py-1 rounded-lg text-xs font-mono font-bold tracking-wider shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                        <span>⚡ OBJECTIVE {stageIndex + 1}/{currentMicrogame.stages.length}</span>
                        <div className="flex items-center gap-1">
                          {currentMicrogame.stages.map((_, idx) => (
                            <div 
                              key={idx}
                              className={`h-1.5 rounded-full transition-all ${
                                idx < stageIndex 
                                  ? 'w-3.5 bg-emerald-400' 
                                  : idx === stageIndex 
                                  ? 'w-5 bg-yellow-400 animate-pulse' 
                                  : 'w-2 bg-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-950/60 border border-gray-800 text-xs font-mono text-gray-400">
                        <span className="text-yellow-400 font-bold">★ TIER {currentMicrogame.tier}</span>
                        {currentMicrogame.category && <span>• {currentMicrogame.category}</span>}
                      </div>
                    )}
                  </div>

                  {/* Right: Interactive Two-Tier Hint System */}
                  <div className="flex items-center gap-2">
                    {hintTier === 0 ? (
                      <button
                        onClick={triggerHint}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-md ${
                          currentMode === 'CAMPAIGN_LESSON'
                            ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                            : 'bg-yellow-950/80 hover:bg-yellow-900 border border-yellow-500/50 text-yellow-300'
                        }`}
                        title="Click or press 'H' for hint"
                      >
                        <span>💡</span>
                        <span>{currentMode === 'CAMPAIGN_LESSON' ? 'GET HINT' : 'HINT (H)'}</span>
                      </button>
                    ) : hintTier === 1 ? (
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 rounded-lg bg-cyan-950/90 border border-cyan-400 text-cyan-200 text-xs font-mono shadow-[0_0_12px_rgba(34,211,238,0.3)] animate-pulse">
                          <span className="text-cyan-400 font-bold mr-1">💡 NUDGE:</span>
                          {activeStage.hintNudge || activeStage.hint || 'Carefully inspect the parameters on screen.'}
                        </div>
                        <button
                          onClick={triggerHint}
                          className="px-2.5 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 text-amber-300 text-xs font-mono font-bold transition-all flex items-center gap-1"
                          title="Reveal exact solution"
                        >
                          <span>🎯 Solution</span>
                        </button>
                      </div>
                    ) : (
                      <div className="px-3 py-1 rounded-lg bg-amber-950/90 border border-amber-400 text-amber-200 text-xs font-mono shadow-[0_0_12px_rgba(251,191,36,0.3)]">
                        <span className="text-amber-400 font-bold mr-1">🎯 SOLUTION:</span>
                        {activeStage.hintSolution || activeStage.hint || getCorrectAnswerText(currentMicrogame)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Engine Container (Terminal / Editor / GUI) */}
              <div className="flex-1 w-full relative min-h-0 flex flex-col">
                {renderEngine()}
              </div>
             
             {phase === 'RESOLUTION' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 z-50">
                  {result === 'WIN' && isLastClearPerfect && (
                    <div className="text-3xl font-black text-yellow-400 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(250,204,21,0.9)] animate-bounce mb-2">
                      ⭐ PERFECT! ⭐
                    </div>
                  )}
                  {result === 'WIN' && floatingFP !== null && (
                    <div className="text-xl font-black text-orange-400 font-mono tracking-widest drop-shadow-[0_0_12px_rgba(251,146,60,0.9)] animate-pulse mb-3">
                      +{floatingFP} FEVER POINTS 🔥
                    </div>
                  )}
                  <h2 className={`text-6xl md:text-7xl font-black uppercase tracking-widest text-center px-4 ${
                    result === 'WIN' 
                      ? (isLastClearPerfect ? 'text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.9)]' : 'text-green-500 drop-shadow-[0_0_20px_currentColor]')
                      : 'text-red-600 drop-shadow-[0_0_20px_currentColor]'
                  }`}>
                    {currentMicrogame.id === 'tutorial-briefing' ? 'BRIEFING COMPLETE!' : (result === 'WIN' ? 'SECURED!' : 'BREACHED!')}
                  </h2>
                </div>
             )}

             {phase === 'EDUCATIONAL_REVIEW' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/95 z-50 p-8 border-4 border-red-600">
                  <h3 className="text-3xl font-black text-red-500 mb-6 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">Post-Incident Report</h3>
                  <p className="text-xl text-white font-mono text-center leading-relaxed max-w-2xl bg-black/50 p-6 rounded border border-red-500/50 mb-6">
                    {currentMicrogame.educationalNote}
                  </p>
                  
                  <div className="text-lg text-green-400 font-mono text-center max-w-2xl bg-black/80 p-4 rounded border border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                    <span className="font-bold text-green-500 block mb-2 uppercase tracking-widest text-sm">Correct Solution:</span> 
                    {getCorrectAnswerText(currentMicrogame)}
                  </div>

                  <p className="text-lg text-red-400 font-mono mt-8 animate-pulse font-bold">
                    [ RECORDING PENALTY TIME... ]
                  </p>
                </div>
             )}
          </div>
          </div>
        </div>
      )}
      
      {phase === 'INTERMISSION' && (
         <div className="w-8 h-8 rounded-full bg-white animate-pulse"></div>
      )}

      {/* Achievement & Overtake Toast Queue */}
      <AchievementToast 
        queue={achievementQueue} 
        onDismiss={(id) => setAchievementQueue(prev => prev.filter(a => a.id !== id))} 
        overtake={overtakeEvent}
        onDismissOvertake={() => setOvertakeEvent(null)}
      />

      {/* Trophy Room / Profile Modal */}
      {isProfileOpen && (
        <TrophyRoomModal 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)} 
          onProfileUpdated={() => setPlayerStats(getPlayerStats())}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}

      {/* Collegiate Leaderboard Modal */}
      {isLeaderboardOpen && (
        <LeaderboardModal 
          isOpen={isLeaderboardOpen} 
          onClose={() => setIsLeaderboardOpen(false)} 
          stats={playerStats}
        />
      )}

      {/* Authentication Modal */}
      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={() => setPlayerStats(getPlayerStats())}
        />
      )}

      {/* Bug Report / Suggestions Modal */}
      {isBugReportOpen && (
        <BugReportModal
          isOpen={isBugReportOpen}
          onClose={() => setIsBugReportOpen(false)}
        />
      )}

      {/* Story Campaign & Dojo Modal */}
      {isCampaignOpen && (
        <CampaignModal
          isOpen={isCampaignOpen}
          onClose={() => setIsCampaignOpen(false)}
          onStartLesson={startLesson}
          onStartRemix={startRemix}
        />
      )}

      {/* AI Deck Studio Modal */}
      {isStudioOpen && (
        <AiDeckStudioModal
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
          onDecksUpdated={() => {
            refreshSRSCounts();
          }}
        />
      )}
    </div>
  );
}
