export type DictationState = 'idle' | 'listening' | 'polishing' | 'injected' | 'error';

export type ToneMode = 'casual' | 'professional' | 'code' | 'bullets' | 'academic' | 'raw';

export type STTProvider = 'groq' | 'google' | 'openai' | 'deepgram' | 'local';

export type AppViewMode = 'compact' | 'studio';

export interface VocabularyItem {
  id: string;
  term: string;
  replacement?: string;
  category?: 'name' | 'tech' | 'acronym' | 'custom';
}

export interface SnippetItem {
  id: string;
  trigger: string;
  expansion: string;
}

export interface SpeechStats {
  wordCount: number;
  charCount: number;
  durationSec: number;
  wpm: number;
}

export interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

export interface AppConfig {
  provider: STTProvider;
  mode: ToneMode;
  hotkey: string;
  autoInject: boolean;
  soundEnabled: boolean;
  language: string;
  viewMode: AppViewMode;
  groqApiKey: string;
  googleApiKey: string;
  openaiApiKey: string;
  deepgramApiKey: string;
  localModelPath: string;
  inputDevice: string;
  silenceThresholdMs: number;
  vocabulary: VocabularyItem[];
  snippets: SnippetItem[];
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
