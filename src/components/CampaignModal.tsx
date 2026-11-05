'use client';
import React, { useState, useEffect } from 'react';
import { CampaignChapter, CampaignProgress, ChapterProgress, MedalType } from '../types/campaign';
import { CAMPAIGN_CHAPTERS, getCampaignProgress } from '../data/campaignChapters';
import { MICROGAME_QUEUE } from '../data/deck';
import { getCustomDecks } from '../utils/srsManager';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartLesson: (chapter: CampaignChapter, cardId: string) => void;
  onStartRemix: (chapter: CampaignChapter) => void;
}

export default function CampaignModal({ isOpen, onClose, onStartLesson, onStartRemix }: Props) {
  const [progress, setProgress] = useState<CampaignProgress>({ chapters: {} });
  const [selectedChapterId, setSelectedChapterId] = useState<string>(CAMPAIGN_CHAPTERS[0].id);
  const [allChapters, setAllChapters] = useState<CampaignChapter[]>(CAMPAIGN_CHAPTERS);

  useEffect(() => {
    if (isOpen) {
      const p = getCampaignProgress();
      setProgress(p);

      // Merge standard chapters + custom decks as additional chapters
      const customDecks = getCustomDecks();
      const customChapters: CampaignChapter[] = customDecks.map((d, idx) => ({
        id: `custom-ch-${d.id}`,
        order: 10 + idx,
        title: d.title,
        subtitle: `Custom Deck • ${d.cards.length} Cards`,
        category: 'Custom',
        description: d.description,
        cardIds: d.cards.map((c) => c.id),
        remixConfig: {
          rounds: Math.min(5, d.cards.length),
          lives: 3,
          minPassCount: Math.min(4, d.cards.length),
        },
      }));

      const combined = [...CAMPAIGN_CHAPTERS, ...customChapters];
      setAllChapters(combined);

      if (p.selectedChapterId && combined.some((c) => c.id === p.selectedChapterId)) {
        setSelectedChapterId(p.selectedChapterId);
      } else {
        setSelectedChapterId(CAMPAIGN_CHAPTERS[0].id);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentChapter = allChapters.find((c) => c.id === selectedChapterId) || allChapters[0];
  const chapterProgress: ChapterProgress = progress.chapters[currentChapter.id] || {
    chapterId: currentChapter.id,
    unlocked: currentChapter.order === 1 || currentChapter.category === 'Custom',
    completed: false,
    lessonsCompleted: {},
  };

  const isUnlocked = chapterProgress.unlocked || currentChapter.order === 1 || currentChapter.category === 'Custom';

  // Find card objects for current chapter
  const customDecks = getCustomDecks();
  const allAvailableCards = [
    ...MICROGAME_QUEUE,
    ...customDecks.flatMap((d) => d.cards),
  ];

  const chapterCards = currentChapter.cardIds.map((id) => {
    return allAvailableCards.find((c) => c.id === id) || {
      id,
      verb: id,
      tier: 1,
      category: currentChapter.category,
      educationalNote: '',
      payload: {},
    };
  });

  const lessonsCompletedCount = Object.keys(chapterProgress.lessonsCompleted || {}).length;
  const canPlayRemix = isUnlocked;

  const getMedalBadge = (medal?: MedalType) => {
    if (medal === 'GOLD') return <span className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] font-bold text-sm">🥇 Gold</span>;
    if (medal === 'SILVER') return <span className="text-gray-300 drop-shadow-[0_0_8px_rgba(209,213,219,0.8)] font-bold text-sm">🥈 Silver</span>;
    if (medal === 'BRONZE') return <span className="text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.8)] font-bold text-sm">🥉 Bronze</span>;
    return <span className="text-gray-600 font-mono text-xs">Unranked</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#0c1017] border border-cyan-500/40 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl shadow-cyan-950/60 overflow-hidden font-sans">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🥋</span>
            <div>
              <h2 className="text-xl font-bold tracking-wider text-cyan-300">STORY CAMPAIGN & DOJO</h2>
              <p className="text-xs text-cyan-400/70">Master cards in guided lessons, conquer the Chapter Remix, and graduate to Daily SRS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Main Body: Left Chapter List, Right Chapter Detail */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3">
          
          {/* Chapter Selector (Sidebar) */}
          <div className="border-r border-cyan-500/20 bg-black/30 overflow-y-auto p-4 space-y-2.5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Chapters</h3>
            {allChapters.map((ch) => {
              const chProg = progress.chapters[ch.id];
              const unlocked = chProg?.unlocked || ch.order === 1 || ch.category === 'Custom';
              const isSelected = ch.id === selectedChapterId;

              return (
                <button
                  key={ch.id}
                  disabled={!unlocked}
                  onClick={() => setSelectedChapterId(ch.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-400/80 shadow-md shadow-cyan-900/30'
                      : unlocked
                      ? 'bg-black/40 border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-950/20'
                      : 'bg-black/20 border-gray-800 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      {ch.category}
                    </span>
                    {unlocked ? (
                      chProg?.bestMedal ? getMedalBadge(chProg.bestMedal) : <span className="text-[10px] text-gray-500">Unlocked</span>
                    ) : (
                      <span className="text-xs text-gray-500">🔒 Locked</span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-gray-200 mt-1 line-clamp-1">{ch.title}</h4>
                </button>
              );
            })}
          </div>

          {/* Chapter Details & Lessons Panel */}
          <div className="md:col-span-2 overflow-y-auto p-6 space-y-6 flex flex-col justify-between">
            <div>
              {/* Chapter Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-950/20 border border-cyan-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    {currentChapter.category} INCIDENT TRACK
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Best Grade:</span>
                    {getMedalBadge(chapterProgress.bestMedal)}
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white mt-1">{currentChapter.title}</h3>
                <p className="text-xs font-medium text-cyan-300/80 mt-1">{currentChapter.subtitle}</p>
                <p className="text-xs text-gray-300 mt-3 leading-relaxed">{currentChapter.description}</p>
              </div>

              {/* Lessons List */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Step-By-Step Lessons ({lessonsCompletedCount}/{chapterCards.length} Cleared)
                  </h4>
                  <span className="text-xs text-cyan-400/80 font-mono">Free Hints • Practice Mode</span>
                </div>

                <div className="space-y-2.5">
                  {chapterCards.map((card, idx) => {
                    const isCardCleared = !!chapterProgress.lessonsCompleted?.[card.id];

                    return (
                      <div
                        key={card.id}
                        className="p-3.5 rounded-xl border border-cyan-500/20 bg-black/40 flex items-center justify-between hover:border-cyan-400/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            isCardCleared
                              ? 'bg-emerald-500 text-black shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                              : 'bg-gray-800 text-gray-400'
                          }`}>
                            {isCardCleared ? '✓' : idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-sm text-white">{card.verb || card.id}</h5>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-300">
                                {card.engine}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                              {card.hintNudge || card.hint || card.educationalNote || 'Learn this countermeasure.'}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            onClose();
                            onStartLesson(currentChapter, card.id);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-500/40 text-cyan-200 text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                        >
                          <span>{isCardCleared ? 'Review' : 'Learn'}</span>
                          <span>→</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Boss Stage / Chapter Remix Section */}
            <div className="pt-6 border-t border-cyan-500/20">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-950/30 to-red-950/20 border border-orange-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base">🥊</span>
                    <h4 className="font-black text-lg text-orange-300 tracking-wide">
                      CHAPTER REMIX: 3-STRIKE TEST
                    </h4>
                  </div>
                  <p className="text-xs text-gray-300 mt-1 max-w-md">
                    Speed run of all chapter cards! 3 Lives, Malware Attacks, and Fever multipliers. Clear the remix to unlock the next chapter and graduate these cards to your <strong>Daily SRS Review</strong>.
                  </p>
                </div>

                <button
                  disabled={!canPlayRemix}
                  onClick={() => {
                    onClose();
                    onStartRemix(currentChapter);
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:opacity-40 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-600/40 transition-all shrink-0"
                >
                  Start Chapter Remix 🔥
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
