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
import { Achievement, OvertakeEvent, PlayerStats } from '../types/achievement';
import { ACHIEVEMENTS } from '../data/achievements';
import { getPlayerStats, evaluateCardWin, evaluateCardLoss, evaluateRunComplete, setAchievementStorageAdapter } from '../utils/achievementManager';
import { FirestoreAdapter } from '../utils/firestoreAdapter';
import { useAuth } from '../context/AuthContext';

type Phase = 'MAIN_MENU' | 'VERB_SLAM' | 'INTERACTIVE' | 'RESOLUTION' | 'EDUCATIONAL_REVIEW' | 'INTERMISSION' | 'VICTORY';
type MenuTab = 'HOME' | 'FOCUSED';

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
  const [currentMode, setCurrentMode] = useState<'DAILY' | 'FULL' | 'CATEGORY' | 'DEBUG' | 'TUTORIAL'>('FULL');
  const [isCopied, setIsCopied] = useState(false);

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
          setPhase('EDUCATIONAL_REVIEW');
        } else {
          const nextUnsolved = unsolvedIds.filter(id => id !== currentMicrogame.id);
          setUnsolvedIds(nextUnsolved);
          
          if (nextUnsolved.length === 0) {
            if (currentMode === 'TUTORIAL') {
              setPhase('MAIN_MENU');
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
  };

  const handleLose = (reason: string) => {
    if (phase !== 'INTERACTIVE') return;
    setIsLastClearPerfect(false);
    setAttempts(prev => [...prev, mutator ? 'MUTATED_LOSE' : 'LOSE']);
    setResult('LOSE');
    setPhase('RESOLUTION');
    evaluateCardLoss(mutator);
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
        onGoHome={() => {
          setPhase('MAIN_MENU');
          setMenuTab('HOME');
        }}
      />
      
      {phase === 'MAIN_MENU' && (
        <div className="flex flex-col items-center justify-center z-50 text-white w-full max-w-lg bg-gray-900 border-2 border-gray-700 p-8 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.3)]">
          <h1 className="text-4xl md:text-5xl font-black mb-8 text-green-500 text-center uppercase tracking-widest">
            Cyber Defender Fever
          </h1>
          
          {menuTab === 'HOME' && (
            <div className="w-full flex flex-col gap-4 font-sans">
              
              <div className="relative w-full cursor-pointer transition-all hover:scale-[1.02] group" onClick={() => startRun('DAILY')}>
                {/* Outer Glow Mask: A solid, pre-clipped spinning rainbow block that is blurred */}
                <div className="absolute -inset-[2px] blur-xl opacity-70 group-hover:opacity-100 transition-opacity">
                  <div className="relative w-full h-full rounded-2xl overflow-hidden">
                    <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,red,yellow,green,cyan,blue,magenta,red)] animate-[spin_4s_linear_infinite]" />
                  </div>
                </div>
                
                {/* Inner Button */}
                <div className="relative p-[3px] rounded-2xl overflow-hidden w-full z-10">
                  <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,red,yellow,green,cyan,blue,magenta,red)] animate-[spin_4s_linear_infinite]" />
                  <div className="relative w-full py-10 bg-black/95 rounded-[13px] flex items-center justify-center font-black text-5xl text-white uppercase tracking-widest backdrop-blur-md">
                    Daily
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 font-sans">
                <button onClick={() => startRun('FULL')} className="w-full py-5 bg-green-600 hover:bg-green-500 font-bold text-sm rounded-lg shadow-lg transition-all border border-green-400 flex flex-col items-center justify-center tracking-wider">
                  FULL DECK
                </button>
                <button onClick={() => setMenuTab('FOCUSED')} className="w-full py-5 bg-blue-600 hover:bg-blue-500 font-bold text-sm rounded-lg shadow-lg transition-all border border-blue-400 flex flex-col items-center justify-center tracking-wider">
                  FOCUSED
                </button>
                <button onClick={() => setIsProfileOpen(true)} className="w-full py-5 bg-gray-700 hover:bg-gray-600 font-bold text-sm rounded-lg shadow-lg transition-all border border-gray-500 flex flex-col items-center justify-center opacity-80 tracking-wider">
                  PROFILE
                </button>
              </div>

              <button 
                onClick={() => startRun('TUTORIAL')} 
                className="w-full py-2.5 bg-gray-800/80 hover:bg-gray-700/80 text-emerald-400 hover:text-emerald-300 font-mono font-bold text-xs rounded-lg border border-gray-700 hover:border-emerald-500/50 flex items-center justify-center gap-2 transition-all mt-1"
              >
                <span>💡</span> HOW TO PLAY (BRIEFING)
              </button>
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
        <div className="flex flex-col items-center justify-center z-50">
          <h1 className="text-6xl md:text-8xl font-black uppercase text-center text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.8)] mb-4">
            DECK CLEARED
          </h1>
          <p className="text-2xl text-gray-300 font-mono mb-6">Final Time: {formatTime(elapsedTime)}</p>
          
          <div className="bg-gray-900 border-2 border-gray-700 rounded-xl p-6 mb-8 w-full max-w-md shadow-2xl relative font-sans">
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
            <p className="text-[11px] text-gray-500 mt-2 text-center">
              Click anywhere on snippet or button above to copy
            </p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setPhase('MAIN_MENU')}
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold font-mono text-xl rounded shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all"
            >
              MAIN MENU
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold font-mono text-xl rounded shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all"
            >
              RESTART APP
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

                  {/* Right: Tutorial Hint */}
                  {activeStage.hint && (
                    <div className="bg-black/90 border border-blue-500 text-blue-400 px-3 py-1 rounded-lg text-xs font-mono tracking-wide shadow-[0_0_10px_rgba(59,130,246,0.4)]">
                      <span className="text-blue-300 font-bold mr-1">TUTORIAL:</span>
                      {activeStage.hint.split(' then ').map((part: string, i: number, arr: string[]) => (
                        <React.Fragment key={i}>
                          {part}
                          {i < arr.length - 1 && <span className="text-pink-500 font-bold mx-2">THEN</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
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
    </div>
  );
}
