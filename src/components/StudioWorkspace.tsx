import React, { useState, useEffect } from 'react';
import {
  Mic,
  Copy,
  Check,
  Sparkles,
  Download,
  Trash2,
  Volume2,
  VolumeX,
  Minimize2,
  Settings,
  History,
  BookOpen,
  Plus,
  Globe,
  Code2,
  Briefcase,
  Coffee,
  List,
  GraduationCap,
  FileText,
  Clock,
  Gauge
} from 'lucide-react';
import { DictationState, ToneMode, AppConfig, VocabularyItem, SnippetItem } from '../types';

interface StudioWorkspaceProps {
  state: DictationState;
  audioLevel: number;
  currentText: string;
  transcriptHistory: string;
  config: AppConfig;
  onToggleRecord: () => void;
  onSelectMode: (mode: ToneMode) => void;
  onUpdateText: (text: string) => void;
  onClearText: () => void;
  onSwitchToCompact: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onSaveConfig: (cfg: AppConfig) => void;
}

const LANGUAGES = [
  { code: 'auto', name: 'Auto-Detect', flag: '🌐' },
  { code: 'en', name: 'English (US)', flag: '🇺🇸' },
  { code: 'bn', name: 'বাংলা (Bengali)', flag: '🇧🇩' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'zh', name: '中文 (Chinese)', flag: '🇨🇳' },
  { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵' },
];

export const StudioWorkspace: React.FC<StudioWorkspaceProps> = ({
  state,
  audioLevel,
  currentText,
  transcriptHistory,
  config,
  onToggleRecord,
  onSelectMode,
  onUpdateText,
  onClearText,
  onSwitchToCompact,
  onOpenSettings,
  onOpenHistory,
  onSaveConfig,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'vocabulary' | 'snippets'>('editor');
  const [newVocabTerm, setNewVocabTerm] = useState('');
  const [newSnippetTrigger, setNewSnippetTrigger] = useState('');
  const [newSnippetExpansion, setNewSnippetExpansion] = useState('');

  // Speaking Duration & WPM calculation
  const [durationSec, setDurationSec] = useState(0);

  useEffect(() => {
    let timer: number | null = null;
    if (state === 'listening') {
      timer = window.setInterval(() => {
        setDurationSec((prev) => prev + 1);
      }, 1000);
    } else if (state === 'idle' && !currentText) {
      setDurationSec(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state, currentText]);

  const activeText = currentText || transcriptHistory;
  const wordCount = activeText.trim() ? activeText.trim().split(/\s+/).length : 0;
  const charCount = activeText.length;
  const wpm = durationSec > 2 ? Math.round((wordCount / durationSec) * 60) : 0;

  // Waveform bars simulation
  const [bars, setBars] = useState<number[]>(Array(24).fill(15));
  useEffect(() => {
    if (state === 'listening') {
      const interval = setInterval(() => {
        const factor = Math.max(0.12, audioLevel);
        setBars(
          Array(24)
            .fill(0)
            .map((_, i) => {
              const wave = Math.sin((i / 24) * Math.PI) * 50;
              return Math.min(100, Math.max(12, Math.random() * wave * factor + 15));
            })
        );
      }, 70);
      return () => clearInterval(interval);
    } else {
      setBars(Array(24).fill(12));
    }
  }, [state, audioLevel]);

  const handleCopy = () => {
    if (!activeText) return;
    navigator.clipboard.writeText(activeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = (format: 'md' | 'txt') => {
    if (!activeText) return;
    const blob = new Blob([activeText], { type: format === 'md' ? 'text/markdown' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RDF-Flow-Dictation-${new Date().toISOString().slice(0, 10)}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddVocab = () => {
    if (!newVocabTerm.trim()) return;
    const item: VocabularyItem = {
      id: Date.now().toString(),
      term: newVocabTerm.trim(),
    };
    const updated = [...(config.vocabulary || []), item];
    onSaveConfig({ ...config, vocabulary: updated });
    setNewVocabTerm('');
  };

  const handleDeleteVocab = (id: string) => {
    const updated = (config.vocabulary || []).filter((v) => v.id !== id);
    onSaveConfig({ ...config, vocabulary: updated });
  };

  const handleAddSnippet = () => {
    if (!newSnippetTrigger.trim() || !newSnippetExpansion.trim()) return;
    const item: SnippetItem = {
      id: Date.now().toString(),
      trigger: newSnippetTrigger.trim(),
      expansion: newSnippetExpansion.trim(),
    };
    const updated = [...(config.snippets || []), item];
    onSaveConfig({ ...config, snippets: updated });
    setNewSnippetTrigger('');
    setNewSnippetExpansion('');
  };

  const handleDeleteSnippet = (id: string) => {
    const updated = (config.snippets || []).filter((s) => s.id !== id);
    onSaveConfig({ ...config, snippets: updated });
  };

  const modeIcons: Record<ToneMode, React.ReactNode> = {
    casual: <Coffee className="w-3.5 h-3.5" />,
    professional: <Briefcase className="w-3.5 h-3.5" />,
    code: <Code2 className="w-3.5 h-3.5" />,
    bullets: <List className="w-3.5 h-3.5" />,
    academic: <GraduationCap className="w-3.5 h-3.5" />,
    raw: <FileText className="w-3.5 h-3.5" />,
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[94vh] rounded-2xl glass-panel border border-slate-800 shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
      {/* 1. Header Bar */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
            RF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">RDF FLOW</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 font-mono">
                STUDIO v0.2
              </span>
            </div>
          </div>
        </div>

        {/* Center: Language Picker & Provider */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={config.language || 'auto'}
              onChange={(e) => onSaveConfig({ ...config, language: e.target.value })}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => onSaveConfig({ ...config, soundEnabled: !config.soundEnabled })}
            className={`p-1.5 rounded-lg border transition-colors ${
              config.soundEnabled
                ? 'border-cyan-500/40 text-cyan-400 bg-cyan-950/20'
                : 'border-slate-800 text-slate-500 bg-slate-950/40'
            }`}
            title={config.soundEnabled ? 'Sound Chimes: On' : 'Sound Chimes: Muted'}
          >
            {config.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenHistory}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Dictation History"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
            title="Settings & API Keys"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onSwitchToCompact}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-700/80 bg-slate-800/50 hover:bg-slate-800 text-xs text-slate-300 transition-colors"
            title="Minimize to Floating Pill (Ctrl+M)"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mini Mode</span>
          </button>
        </div>
      </header>

      {/* 2. Top Banner: Audio Equalizer Waveform & Mode Selector */}
      <div className="px-6 py-4 bg-slate-950/40 border-b border-slate-800/80 flex flex-col items-center gap-3">
        {/* Live Audio Reactive Waveform */}
        <div className="flex items-center justify-center gap-1.5 h-10 w-full max-w-md cursor-pointer" onClick={onToggleRecord}>
          {bars.map((h, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all duration-75 ${
                state === 'listening'
                  ? 'bg-gradient-to-t from-purple-500 via-cyan-400 to-emerald-300 shadow-[0_0_10px_#00F2FE]'
                  : state === 'polishing'
                  ? 'bg-gradient-to-t from-purple-500 to-cyan-400 animate-pulse opacity-70'
                  : 'bg-slate-800'
              }`}
              style={{ height: `${h}%`, minHeight: '6px' }}
            />
          ))}
        </div>

        {/* Tone Mode Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
          {(['casual', 'professional', 'code', 'bullets', 'academic', 'raw'] as ToneMode[]).map((m) => (
            <button
              key={m}
              onClick={() => onSelectMode(m)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all ${
                config.mode === m
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/80 shadow-md ring-1 ring-cyan-400/40'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {modeIcons[m]}
              <span>{m}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col p-5 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'editor'
                  ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Live Transcript
            </button>
            <button
              onClick={() => setActiveTab('vocabulary')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'vocabulary'
                  ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Custom Vocabulary ({config.vocabulary?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('snippets')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'snippets'
                  ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Snippets ({config.snippets?.length || 0})
            </button>
          </div>

          {/* Quick Actions (Copy, Export, Clear) */}
          {activeTab === 'editor' && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                disabled={!activeText}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-cyan-400 text-xs text-slate-300 disabled:opacity-40 transition-colors"
                title="Copy to Clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={() => handleExport('md')}
                disabled={!activeText}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-cyan-400 text-xs text-slate-300 disabled:opacity-40 transition-colors"
                title="Export as Markdown"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .md</span>
              </button>
              <button
                onClick={onClearText}
                disabled={!activeText}
                className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/20 disabled:opacity-40 transition-colors"
                title="Clear Text"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Tab 1: Live Transcript Editor */}
        {activeTab === 'editor' && (
          <div className="flex-1 flex flex-col relative rounded-xl bg-slate-950/70 border border-slate-800/80 p-4 overflow-hidden">
            <textarea
              value={activeText}
              onChange={(e) => onUpdateText(e.target.value)}
              placeholder="Click the microphone below or press your hotkey (Ctrl+Space) to start dictating..."
              className="flex-1 w-full bg-transparent resize-none focus:outline-none text-slate-100 text-sm sm:text-base leading-relaxed placeholder:text-slate-600 font-sans"
            />

            {/* Status Indicator */}
            {state !== 'idle' && (
              <div className="absolute top-3 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/40 text-xs text-cyan-300 shadow-lg animate-pulse">
                {state === 'listening' && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
                {state === 'polishing' && <Sparkles className="w-3.5 h-3.5 animate-spin text-purple-400" />}
                <span>{state === 'listening' ? 'Listening...' : state === 'polishing' ? 'Polishing...' : 'Injected!'}</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Custom Vocabulary Manager */}
        {activeTab === 'vocabulary' && (
          <div className="flex-1 flex flex-col rounded-xl bg-slate-950/70 border border-slate-800/80 p-4 overflow-y-auto space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add custom word (e.g. CRISPR, RDF Flow, Kubernetes)..."
                value={newVocabTerm}
                onChange={(e) => setNewVocabTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddVocab()}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleAddVocab}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Word
              </button>
            </div>

            <div className="space-y-1.5">
              {(config.vocabulary || []).length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No custom vocabulary words yet. Add industry terms or personal names to ensure 100% accuracy.
                </div>
              ) : (
                config.vocabulary?.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800"
                  >
                    <span className="font-mono text-xs text-cyan-300 font-bold">{v.term}</span>
                    <button
                      onClick={() => handleDeleteVocab(v.id)}
                      className="p-1 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Snippets & Macro Expander */}
        {activeTab === 'snippets' && (
          <div className="flex-1 flex flex-col rounded-xl bg-slate-950/70 border border-slate-800/80 p-4 overflow-y-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Spoken trigger (e.g. brb, zoomlink)..."
                value={newSnippetTrigger}
                onChange={(e) => setNewSnippetTrigger(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Full text expansion..."
                  value={newSnippetExpansion}
                  onChange={(e) => setNewSnippetExpansion(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={handleAddSnippet}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              {(config.snippets || []).length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No snippets created yet. Define quick abbreviations that expand into full sentences or templates.
                </div>
              ) : (
                config.snippets?.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-cyan-400 font-bold bg-slate-950 px-2 py-0.5 rounded">
                        /{s.trigger}
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="text-slate-200">{s.expansion}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteSnippet(s.id)}
                      className="p-1 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Controls: Analytics HUD & Giant Mic Button */}
      <footer className="px-6 py-4 bg-slate-900/80 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Speech Analytics HUD */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{Math.floor(durationSec / 60)}:{(durationSec % 60).toString().padStart(2, '0')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>{wordCount} words ({charCount} chars)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-bold">{wpm} WPM</span>
          </div>
        </div>

        {/* Central Record Button */}
        <button
          onClick={onToggleRecord}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-full font-bold text-sm transition-all duration-200 shadow-xl ${
            state === 'listening'
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse ring-4 ring-red-500/30 scale-105'
              : state === 'polishing'
              ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white animate-pulse'
              : 'bg-gradient-to-r from-cyan-400 via-sky-500 to-purple-600 text-slate-950 hover:brightness-110 hover:scale-105'
          }`}
        >
          <Mic className={`w-5 h-5 ${state === 'listening' ? 'animate-bounce' : ''}`} />
          <span>
            {state === 'listening'
              ? 'Stop & Polish'
              : state === 'polishing'
              ? 'AI Polishing...'
              : 'Start Dictation (Ctrl+Space)'}
          </span>
        </button>
      </footer>
    </div>
  );
};
