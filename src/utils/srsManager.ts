import { SRSCardState, SRSDeckState, CustomCardDeck } from '../types/srs';

const SRS_STORAGE_KEY = 'ccdc_srs_deck_state_v1';
const CUSTOM_DECKS_KEY = 'ccdc_custom_decks_v1';
const DAY_MS = 86400000;

export function getSRSState(): SRSDeckState {
  if (typeof window === 'undefined') return { cards: {} };
  try {
    const raw = localStorage.getItem(SRS_STORAGE_KEY);
    if (!raw) return { cards: {} };
    return JSON.parse(raw) as SRSDeckState;
  } catch (err) {
    console.warn('Failed to load SRS state from localStorage:', err);
    return { cards: {} };
  }
}

export function saveSRSState(state: SRSDeckState): void {
  if (typeof window === 'undefined') return;
  try {
    state.lastSyncAt = Date.now();
    localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save SRS state to localStorage:', err);
  }
}

export function graduateCard(cardId: string, isCustom = false): SRSCardState {
  const state = getSRSState();
  if (state.cards[cardId]) {
    return state.cards[cardId];
  }
  const now = Date.now();
  const newCard: SRSCardState = {
    cardId,
    intervalDays: 1,
    easeFactor: 2.5,
    consecutiveSuccesses: 0,
    lastReviewedAt: 0,
    nextReviewAt: now, // immediately available for review
    totalReviews: 0,
    totalHintsUsed: 0,
    isCustom,
  };
  state.cards[cardId] = newCard;
  saveSRSState(state);
  return newCard;
}

export function graduateCards(cardIds: string[], isCustom = false): void {
  const state = getSRSState();
  const now = Date.now();
  let changed = false;

  for (const id of cardIds) {
    if (!state.cards[id]) {
      state.cards[id] = {
        cardId: id,
        intervalDays: 1,
        easeFactor: 2.5,
        consecutiveSuccesses: 0,
        lastReviewedAt: 0,
        nextReviewAt: now,
        totalReviews: 0,
        totalHintsUsed: 0,
        isCustom,
      };
      changed = true;
    }
  }

  if (changed) {
    saveSRSState(state);
  }
}

export function recordCardReview(
  cardId: string,
  won: boolean,
  usedHint: boolean
): SRSCardState {
  const state = getSRSState();
  let card = state.cards[cardId];
  const now = Date.now();

  if (!card) {
    card = graduateCard(cardId);
  }

  card.totalReviews += 1;
  card.lastReviewedAt = now;

  if (usedHint) {
    card.totalHintsUsed += 1;
  }

  if (won && !usedHint) {
    // Clean Pass: Grow interval via Modified SM-2
    card.consecutiveSuccesses += 1;
    if (card.consecutiveSuccesses === 1) {
      card.intervalDays = 1;
    } else if (card.consecutiveSuccesses === 2) {
      card.intervalDays = 3;
    } else {
      card.intervalDays = Math.max(4, Math.round(card.intervalDays * card.easeFactor));
    }
    card.easeFactor = Math.min(3.0, card.easeFactor + 0.05);
    card.nextReviewAt = now + card.intervalDays * DAY_MS;
  } else if (won && usedHint) {
    // Assisted Pass: Short interval (1 day), slight ease penalty
    card.intervalDays = 1;
    card.easeFactor = Math.max(1.3, card.easeFactor - 0.15);
    card.nextReviewAt = now + DAY_MS;
  } else {
    // Failure / Timeout: Interval reset to 1 day
    card.consecutiveSuccesses = 0;
    card.intervalDays = 1;
    card.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
    card.nextReviewAt = now + DAY_MS;
  }

  state.cards[cardId] = card;
  saveSRSState(state);
  return card;
}

export function getDueCardIds(now = Date.now()): string[] {
  const state = getSRSState();
  const due: string[] = [];
  for (const [id, card] of Object.entries(state.cards)) {
    if (card.nextReviewAt <= now) {
      due.push(id);
    }
  }
  return due;
}

export function getDueCount(now = Date.now()): number {
  return getDueCardIds(now).length;
}

export function getTotalGraduatedCount(): number {
  const state = getSRSState();
  return Object.keys(state.cards).length;
}

// Custom Decks Storage
export function getCustomDecks(): CustomCardDeck[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_DECKS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CustomCardDeck[];
  } catch (err) {
    console.warn('Failed to load custom decks from localStorage:', err);
    return [];
  }
}

export function saveCustomDeck(deck: CustomCardDeck): void {
  if (typeof window === 'undefined') return;
  try {
    const decks = getCustomDecks();
    const existingIndex = decks.findIndex((d) => d.id === deck.id);
    if (existingIndex >= 0) {
      decks[existingIndex] = deck;
    } else {
      decks.push(deck);
    }
    localStorage.setItem(CUSTOM_DECKS_KEY, JSON.stringify(decks));
  } catch (err) {
    console.warn('Failed to save custom deck:', err);
  }
}

export function deleteCustomDeck(deckId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const decks = getCustomDecks().filter((d) => d.id !== deckId);
    localStorage.setItem(CUSTOM_DECKS_KEY, JSON.stringify(decks));
  } catch (err) {
    console.warn('Failed to delete custom deck:', err);
  }
}
