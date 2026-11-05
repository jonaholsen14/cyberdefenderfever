export interface SRSCardState {
  cardId: string;
  intervalDays: number;       // Current interval in days (starts at 1)
  easeFactor: number;         // Multiplier (default 2.5, min 1.3)
  consecutiveSuccesses: number;
  lastReviewedAt: number;     // Epoch timestamp in ms
  nextReviewAt: number;       // Epoch timestamp in ms
  totalReviews: number;
  totalHintsUsed: number;
  isCustom?: boolean;
}

export interface SRSDeckState {
  cards: Record<string, SRSCardState>;
  lastSyncAt?: number;
}

export interface CustomCardDeck {
  id: string;
  title: string;
  description: string;
  author?: string;
  createdAt: number;
  cards: any[]; // MicrogamePayload[]
}
