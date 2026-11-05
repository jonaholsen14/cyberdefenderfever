export type EngineType = 'CLI_EXEC' | 'CONFIG_EDIT' | 'GUI_NAV' | 'MULTIPLE_CHOICE' | 'STUDY_BREAK' | 'SPOT_THE_DIFF' | 'LOG_CATCHER' | 'TUTORIAL';

export interface MicrogameStage {
  verb: string;
  engine: EngineType;
  timeLimitMs: number;
  hint?: string;
  hintNudge?: string;
  hintSolution?: string;
  payload: any;
}

export interface MicrogamePayload {
  id: string;
  tier: number;
  category?: 'Windows' | 'Linux' | 'Firewall' | 'Injects';
  educationalNote: string;
  variables?: Record<string, string[]>;
  
  verb?: string;
  engine?: EngineType;
  timeLimitMs?: number;
  hint?: string;
  hintNudge?: string;
  hintSolution?: string;
  payload?: any;
  
  stages?: MicrogameStage[];
}

export interface EngineProps<T = any> {
  payload: T;
  onWin: () => void;
  onLose: (reason: string) => void;
  timeRemainingMs: number;
  isActive: boolean; // True during Phase 2 (interactive phase). If false, inputs should be disabled.
}
