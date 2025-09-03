// features/automations/types.ts
export type AutomationStatus =
  | 'draft'
  | 'scheduled'
  | 'running'
  | 'paused'
  | 'completed';

export type Automation = {
  id: string;
  name: string;
  status: AutomationStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  stats?: {
    queued: number;
    active: number;
    completed: number;
    failed: number;
  };
  // Extended fields from your existing API
  description?: string;
  triggerType: 'date_offset' | 'fixed_date' | 'on_date';
  offsetDays: number;
  offsetDirection?: 'before' | 'after';
  offsetTime: string;
  onDate?: string;
  onTime?: string;
  aiInstructions: string;
  voiceMessage?: string;
  voiceAudioUrl?: string;
  voiceAudioDuration?: number;
  isActive: boolean;
};

export type CreateAutomationInput = {
  name: string;
  description?: string;
  triggerType: 'date_offset' | 'fixed_date' | 'on_date';
  offsetDays: number;
  offsetDirection?: 'before' | 'after';
  offsetTime: string;
  onDate?: string;
  onTime?: string;
  aiInstructions: string;
  voiceMessage?: string;
  voiceAudioUri?: string;
  voiceAudioDuration?: number;
  isActive?: boolean;
};

export type UpdateAutomationInput = Partial<CreateAutomationInput>;

export type ImportResult = {
  total: number;
  inserted: number;
  updated: number;
  invalid: number;
  errors?: { rowNumber: number; reason: string }[];
};

export type EnqueuePayload = {
  windowStart: string; // ISO
  windowEnd: string;   // ISO
  tz: string;          // e.g. 'America/New_York'
  concurrency?: number;
  cps?: number;
};

export type DryRunResult = {
  willImport: number;
  willSkip: number;
  total: number;
  errorBuckets: Array<{code: string; count: number; message: string}>;
  sampleErrors: any[];
  validation: any;
};

export type ExecutionResult = {
  success: boolean;
  message?: string;
  data?: any;
};