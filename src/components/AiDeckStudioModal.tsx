'use client';
import React, { useState, useEffect } from 'react';
import { CustomCardDeck } from '../types/srs';
import { MicrogamePayload } from '../types/game';
import { getCustomDecks, saveCustomDeck, deleteCustomDeck, graduateCards } from '../utils/srsManager';
import CliExecEngine from './engines/CliExecEngine';
import ConfigEditEngine from './engines/ConfigEditEngine';
import GuiNavEngine from './engines/GuiNavEngine';
import MultipleChoiceEngine from './engines/MultipleChoiceEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDecksUpdated?: () => void;
}

export const AI_MASTER_PROMPT = `You are a CCDC (Collegiate Cyber Defense Competition) Microgame Deck Generator.
Generate a valid JSON array of cybersecurity incident response microgames matching the following schema.

RULES:
1. Return ONLY a valid JSON array of objects. No markdown formatting, no backticks, no introductory text.
2. Each card must test a realistic Blue Team incident response skill: Linux triage, Windows defense, Active Directory, network firewalls, or business injects.
3. Supported engine types:
   - "CLI_EXEC": Terminal command challenge. Payload requires: "prompt", and "successCommands" (array of strings) or "sequence" (array of {command, nextPrompt?, simulatedOutput?}).
   - "CONFIG_EDIT": Configuration file fix. Payload requires: "filename", "initialContent", and "successRegex" (regex matching the fixed state).
   - "GUI_NAV": Windows GUI navigation. Payload requires: "windowTitle", "steps" (array of {correctOption, options: string[]}), and optional "finalToggle": {label: string}.
   - "MULTIPLE_CHOICE": 4-option incident decision. Payload requires: "question", and "options" (array of 4 {text, isCorrect: boolean, feedback?: string}).
4. Every card MUST provide:
   - "hintNudge": A subtle conceptual hint (e.g. "Look at processes running from /dev/shm").
   - "hintSolution": The exact solution command or action (e.g. "Run: kill -9 $(pgrep -f /dev/shm)").
   - "educationalNote": A 2-3 sentence explanation of the attack technique and defense rationale.

JSON FORMAT EXAMPLE:
[
  {
    "id": "custom-linux-backdoor-1",
    "tier": 2,
    "category": "Linux",
    "verb": "TERMINATE ROGUE SHELL!",
    "engine": "CLI_EXEC",
    "timeLimitMs": 14000,
    "hintNudge": "Check for netcat or bash reverse shells running under user www-data.",
    "hintSolution": "killall -9 nc",
    "educationalNote": "Red teams often spawn netcat reverse shells from web servers. Killing the nc process immediately terminates their interactive terminal connection.",
    "payload": {
      "prompt": "root@web:~#",
      "successCommands": ["killall -9 nc", "pkill nc", "killall nc"]
    }
  },
  {
    "id": "custom-cfg-sshd-root",
    "tier": 1,
    "category": "Linux",
    "verb": "DISABLE ROOT SSH!",
    "engine": "CONFIG_EDIT",
    "timeLimitMs": 15000,
    "hintNudge": "Search for PermitRootLogin in sshd_config and change it to 'no'.",
    "hintSolution": "Change PermitRootLogin yes to PermitRootLogin no",
    "educationalNote": "PermitRootLogin allows direct root brute-forcing over SSH. Setting it to 'no' forces attackers to escalate through an unprivileged user.",
    "payload": {
      "filename": "/etc/ssh/sshd_config",
      "initialContent": "# SSH Server Configuration\\nPermitRootLogin yes\\nPasswordAuthentication yes\\n",
      "successRegex": "PermitRootLogin\\s+no"
    }
  }
]`;

export default function AiDeckStudioModal({ isOpen, onClose, onDecksUpdated }: Props) {
  const [activeTab, setActiveTab] = useState<'DECKS' | 'IMPORT' | 'PROMPT'>('DECKS');
  const [customDecks, setCustomDecks] = useState<CustomCardDeck[]>([]);
  const [deckTitle, setDeckTitle] = useState('');
  const [deckDescription, setDeckDescription] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [parsedCards, setParsedCards] = useState<MicrogamePayload[]>([]);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  // Preview state
  const [previewCard, setPreviewCard] = useState<MicrogamePayload | null>(null);
  const [previewResult, setPreviewResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCustomDecks(getCustomDecks());
      setValidationError(null);
      setImportSuccess(false);
    }
  }, [isOpen]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(AI_MASTER_PROMPT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const handleJsonChange = (val: string) => {
    setJsonInput(val);
    setImportSuccess(false);
    if (!val.trim()) {
      setValidationError(null);
      setParsedCards([]);
      return;
    }

    try {
      // Clean possible markdown code fences if user pasted markdown
      let clean = val.trim();
      if (clean.startsWith('```')) {
        clean = clean.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      const data = JSON.parse(clean);
      if (!Array.isArray(data)) {
        setValidationError('Input must be a JSON array of cards (e.g., [ {...}, {...} ]).');
        setParsedCards([]);
        return;
      }
      if (data.length === 0) {
        setValidationError('JSON array is empty. Please include at least one card.');
        setParsedCards([]);
        return;
      }

      // Validate each card
      for (let i = 0; i < data.length; i++) {
        const card = data[i];
        if (!card.id || typeof card.id !== 'string') {
          setValidationError(`Card #${i + 1} is missing a string "id".`);
          setParsedCards([]);
          return;
        }
        if (!card.verb || typeof card.verb !== 'string') {
          setValidationError(`Card #${i + 1} (${card.id}) is missing a string "verb".`);
          setParsedCards([]);
          return;
        }
        if (!['CLI_EXEC', 'CONFIG_EDIT', 'GUI_NAV', 'MULTIPLE_CHOICE', 'STUDY_BREAK'].includes(card.engine)) {
          setValidationError(`Card #${i + 1} (${card.id}) has invalid engine "${card.engine}". Must be CLI_EXEC, CONFIG_EDIT, GUI_NAV, or MULTIPLE_CHOICE.`);
          setParsedCards([]);
          return;
        }
        if (!card.payload || typeof card.payload !== 'object') {
          setValidationError(`Card #${i + 1} (${card.id}) is missing an object "payload".`);
          setParsedCards([]);
          return;
        }
      }

      setValidationError(null);
      setParsedCards(data);
    } catch (err: any) {
      setValidationError(`Invalid JSON syntax: ${err.message}`);
      setParsedCards([]);
    }
  };

  const handleImport = () => {
    if (parsedCards.length === 0) return;
    const title = deckTitle.trim() || `Custom Deck (${new Date().toLocaleDateString()})`;
    const desc = deckDescription.trim() || `Imported deck with ${parsedCards.length} microgames.`;

    const newDeck: CustomCardDeck = {
      id: `deck-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      description: desc,
      createdAt: Date.now(),
      cards: parsedCards,
    };

    saveCustomDeck(newDeck);
    // Graduate these cards into the player's SRS review queue automatically
    graduateCards(parsedCards.map((c) => c.id), true);

    const updated = getCustomDecks();
    setCustomDecks(updated);
    setImportSuccess(true);
    setDeckTitle('');
    setDeckDescription('');
    setJsonInput('');
    setParsedCards([]);
    if (onDecksUpdated) onDecksUpdated();
  };

  const handleDeleteDeck = (id: string) => {
    if (confirm('Are you sure you want to delete this custom deck?')) {
      deleteCustomDeck(id);
      setCustomDecks(getCustomDecks());
      if (onDecksUpdated) onDecksUpdated();
    }
  };

  const handleExportDeck = (deck: CustomCardDeck) => {
    const blob = new Blob([JSON.stringify(deck.cards, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_cards.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#0f141c] border border-cyan-500/40 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl shadow-cyan-950/50 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <h2 className="text-xl font-bold tracking-wider text-cyan-300">AI DECK STUDIO</h2>
              <p className="text-xs text-cyan-400/70">Create, validate, test, and import custom microgames with LLMs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-cyan-500/20 bg-black/20 px-6 gap-4">
          <button
            onClick={() => setActiveTab('DECKS')}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'DECKS'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>📁</span> My Decks ({customDecks.length})
          </button>
          <button
            onClick={() => setActiveTab('IMPORT')}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'IMPORT'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>📥</span> Import AI Cards
          </button>
          <button
            onClick={() => setActiveTab('PROMPT')}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'PROMPT'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <span>📋</span> Master AI Prompt
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: MY DECKS */}
          {activeTab === 'DECKS' && (
            <div className="space-y-4">
              {customDecks.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-cyan-500/20 rounded-xl bg-cyan-950/10">
                  <span className="text-4xl block mb-2">📦</span>
                  <h3 className="text-lg font-bold text-gray-300">No Custom Decks Yet</h3>
                  <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
                    Use an AI like ChatGPT, Claude, or Gemini with our prompt template to generate new cards for your team!
                  </p>
                  <button
                    onClick={() => setActiveTab('IMPORT')}
                    className="mt-4 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-600/30 transition-all text-sm"
                  >
                    Import Your First Deck
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customDecks.map((deck) => (
                    <div
                      key={deck.id}
                      className="p-5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 hover:border-cyan-400/60 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-cyan-300 text-lg">{deck.title}</h4>
                          <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-full font-mono border border-cyan-500/40">
                            {deck.cards.length} Cards
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 leading-relaxed">{deck.description}</p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-cyan-500/10 flex items-center justify-between">
                        <button
                          onClick={() => setPreviewCard(deck.cards[0])}
                          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
                        >
                          <span>▶</span> Test Card
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleExportDeck(deck)}
                            className="text-xs px-2.5 py-1 rounded bg-cyan-900/40 text-cyan-300 hover:bg-cyan-800/60 border border-cyan-500/30"
                          >
                            Export JSON
                          </button>
                          <button
                            onClick={() => handleDeleteDeck(deck.id)}
                            className="text-xs px-2 py-1 rounded bg-red-950/40 text-red-400 hover:bg-red-900/60 border border-red-500/30"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IMPORT AI CARDS */}
          {activeTab === 'IMPORT' && (
            <div className="space-y-5">
              {importSuccess && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500 text-emerald-300 text-sm flex items-center justify-between">
                  <span>✓ Deck successfully imported and added to your Spaced Repetition queue!</span>
                  <button
                    onClick={() => setActiveTab('DECKS')}
                    className="underline text-xs hover:text-white"
                  >
                    View Decks
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-cyan-300 mb-1.5 uppercase tracking-wider">
                    Deck Title
                  </label>
                  <input
                    type="text"
                    value={deckTitle}
                    onChange={(e) => setDeckTitle(e.target.value)}
                    placeholder="e.g. Linux PAM & Shadow Hardening"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-cyan-500/30 text-white placeholder-gray-500 text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-cyan-300 mb-1.5 uppercase tracking-wider">
                    Description
                  </label>
                  <input
                    type="text"
                    value={deckDescription}
                    onChange={(e) => setDeckDescription(e.target.value)}
                    placeholder="e.g. Generated by Claude for Western Regional CCDC"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-cyan-500/30 text-white placeholder-gray-500 text-sm focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                    Paste Generated JSON Array
                  </label>
                  <button
                    onClick={() => setActiveTab('PROMPT')}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    Need the prompt? View Master Prompt →
                  </button>
                </div>
                <textarea
                  rows={10}
                  value={jsonInput}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  placeholder="Paste your AI-generated JSON array here: [ { &quot;id&quot;: &quot;...&quot;, &quot;verb&quot;: &quot;...&quot; } ]"
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border font-mono text-xs text-cyan-100 placeholder-gray-600 focus:outline-none transition-all resize-y"
                  style={{
                    borderColor: validationError ? '#ef4444' : parsedCards.length > 0 ? '#10b981' : '#0891b2',
                  }}
                />
              </div>

              {/* Validation Status Banner */}
              {validationError && (
                <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{validationError}</span>
                </div>
              )}

              {parsedCards.length > 0 && !validationError && (
                <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>✓</span>
                    <span>Ready to import: <strong>{parsedCards.length} valid cards</strong> detected!</span>
                  </div>
                  <button
                    onClick={() => setPreviewCard(parsedCards[0])}
                    className="px-3 py-1 bg-emerald-600/40 hover:bg-emerald-600/60 rounded text-emerald-200 font-semibold border border-emerald-400/40 transition-colors"
                  >
                    Test Drive Card #1
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  disabled={parsedCards.length === 0 || !!validationError}
                  onClick={handleImport}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-cyan-600/30 transition-all"
                >
                  Save & Graduate to SRS ({parsedCards.length} Cards)
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: MASTER AI PROMPT */}
          {activeTab === 'PROMPT' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-300">
                  Copy this prompt and paste it into <strong>ChatGPT</strong>, <strong>Claude</strong>, or <strong>Gemini</strong>. You can ask it for cards on any CCDC topic (e.g. <em>&quot;Give me 5 hard Linux firewall cards&quot;</em>).
                </p>
                <button
                  onClick={handleCopyPrompt}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all flex items-center gap-1.5 shrink-0"
                >
                  {copiedPrompt ? (
                    <>
                      <span>✓</span> Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <span>📋</span> Copy Master AI Prompt
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-black/60 border border-cyan-500/20 font-mono text-xs text-cyan-200/90 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed selection:bg-cyan-600 selection:text-white">
                {AI_MASTER_PROMPT}
              </pre>
            </div>
          )}
        </div>

        {/* Test Drive Sandbox Overlay */}
        {previewCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="bg-[#121824] border-2 border-emerald-500/60 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-gray-700/60 pb-3 mb-4">
                <div>
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">SANDBOX TEST DRIVE</span>
                  <h3 className="text-lg font-bold text-white">{previewCard.verb}</h3>
                </div>
                <button
                  onClick={() => {
                    setPreviewCard(null);
                    setPreviewResult(null);
                  }}
                  className="text-gray-400 hover:text-white p-1 rounded"
                >
                  ✕ Close Test
                </button>
              </div>

              {/* Two-tier hint preview */}
              <div className="mb-4 p-3 bg-black/40 rounded-lg border border-cyan-500/20 text-xs space-y-1">
                <div><span className="text-cyan-400 font-bold">Nudge:</span> {previewCard.hintNudge || previewCard.hint || 'No nudge specified'}</div>
                <div><span className="text-amber-400 font-bold">Solution:</span> {previewCard.hintSolution || previewCard.hint || 'No solution specified'}</div>
              </div>

              {/* Engine Sandbox Runner */}
              <div className="min-h-[220px] flex items-center justify-center bg-black/40 rounded-xl p-4 border border-gray-800">
                {previewCard.engine === 'CLI_EXEC' && (
                  <CliExecEngine
                    payload={previewCard.payload}
                    onWin={() => setPreviewResult('WIN')}
                    onLose={(reason) => setPreviewResult(`LOSE: ${reason}`)}
                    timeRemainingMs={20000}
                    isActive={true}
                  />
                )}
                {previewCard.engine === 'CONFIG_EDIT' && (
                  <ConfigEditEngine
                    payload={previewCard.payload}
                    onWin={() => setPreviewResult('WIN')}
                    onLose={(reason) => setPreviewResult(`LOSE: ${reason}`)}
                    timeRemainingMs={20000}
                    isActive={true}
                  />
                )}
                {previewCard.engine === 'GUI_NAV' && (
                  <GuiNavEngine
                    payload={previewCard.payload}
                    onWin={() => setPreviewResult('WIN')}
                    onLose={(reason) => setPreviewResult(`LOSE: ${reason}`)}
                    timeRemainingMs={20000}
                    isActive={true}
                  />
                )}
                {previewCard.engine === 'MULTIPLE_CHOICE' && (
                  <MultipleChoiceEngine
                    payload={previewCard.payload}
                    onWin={() => setPreviewResult('WIN')}
                    onLose={(reason) => setPreviewResult(`LOSE: ${reason}`)}
                    timeRemainingMs={20000}
                    isActive={true}
                  />
                )}
              </div>

              {previewResult && (
                <div
                  className={`mt-4 p-3 rounded-lg text-center font-bold text-sm ${
                    previewResult === 'WIN'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                      : 'bg-red-950 text-red-300 border border-red-500'
                  }`}
                >
                  Result: {previewResult}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
