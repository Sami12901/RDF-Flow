export type DictationState = 'idle' | 'listening' | 'polishing' | 'injected' | 'error';

export type ToneMode = 'casual' | 'professional' | 'code' | 'bullets' | 'raw';

export type STTProvider = 'groq' | 'google' | 'openai' | 'deepgram' | 'local';

export interface AppConfig {
  provider: STTProvider;
  mode: ToneMode;
  hotkey: string;
  autoInject: boolean;
  groqApiKey: string;
  googleApiKey: string;
  openaiApiKey: string;
  deepgramApiKey: string;
  localModelPath: string;
  inputDevice: string;
  silenceThresholdMs: number;
}

export interface DictationItem {
  id: string;
  timestamp: string;
  rawText: string;
  polishedText: string;
  provider: STTProvider;
  mode: ToneMode;
  durationMs: number;
}
