import React, { useState, useEffect } from 'react';
import { Mic, Check, Sparkles, AlertCircle, Settings, History, Volume2, VolumeX, Maximize2, Globe } from 'lucide-react';
import { DictationState, ToneMode, STTProvider } from '../types';

interface FloatingPillProps {
  state: DictationState;
  audioLevel: number; // 0.0 to 1.0
  activeMode: ToneMode;
  provider: STTProvider;
  currentText: string;
  soundEnabled?: boolean;
  language?: string;
  onToggleRecord: () => void;
  onCycleMode: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onExpandToStudio?: () => void;
  onToggleSound?: () => void;
}

export const FloatingPill: React.FC<FloatingPillProps> = ({
  state,
  audioLevel,
  activeMode,
  provider,
  currentText,
  soundEnabled = true,
  language = 'auto',
  onToggleRecord,
  onCycleMode,
  onOpenSettings,
  onOpenHistory,
  onExpandToStudio,
  onToggleSound,
}) => {
  // Animated bar heights simulation when listening
  const [bars, setBars] = useState<number[]>([15, 30, 60, 45, 25, 12]);

  useEffect(() => {
    if (state === 'listening') {
      const interval = setInterval(() => {
        const factor = Math.max(0.15, audioLevel);
        setBars([
          Math.min(95, Math.max(12, Math.random() * 50 * factor + 15)),
          Math.min(100, Math.max(18, Math.random() * 85 * factor + 20)),
          Math.min(100, Math.max(25, Math.random() * 100 * factor + 30)),
          Math.min(100, Math.max(22, Math.random() * 90 * factor + 25)),
          Math.min(95, Math.max(15, Math.random() * 70 * factor + 18)),
          Math.min(85, Math.max(10, Math.random() * 40 * factor + 12)),
        ]);
      }, 70);
      return () => clearInterval(interval);
    } else {
      setBars([15, 30, 45, 35, 20, 10]);
    }
  }, [state, audioLevel]);

  const modeBadgeColor: Record<ToneMode, string> = {
    casual: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30',
    professional: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30',
    code: 'text-amber-400 border-amber-500/40 bg-amber-950/30',
    bullets: 'text-purple-400 border-purple-500/40 bg-purple-950/30',
    academic: 'text-indigo-400 border-indigo-500/40 bg-indigo-950/30',
    raw: 'text-slate-400 border-slate-500/40 bg-slate-900/30',
  };

  return (
    <div className="flex flex-col items-center select-none">
      {/* Real-time transcription preview bubble (appears above pill when typing/polishing) */}
      {currentText && (state === 'listening' || state === 'polishing' || state === 'injected') && (
        <div className="mb-2 max-w-md px-4 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 text-xs text-slate-200 shadow-xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] font-semibold tracking-wider uppercase mb-0.5">
            {state === 'listening' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
            {state === 'polishing' && <Sparkles className="w-3 h-3 animate-spin text-purple-400" />}
            {state === 'injected' && <Check className="w-3 h-3 text-emerald-400" />}
            <span>{state === 'listening' ? 'Transcribing...' : state === 'polishing' ? 'AI Polishing...' : 'Injected!'}</span>
          </div>
          <p className="line-clamp-2 italic font-mono">{currentText}</p>
        </div>
      )}

      {/* Main Floating Pill Widget */}
      <div className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-full glass-panel shadow-2xl transition-all duration-300 ${
        state === 'listening' 
          ? 'border-cyan-400/80 glow-cyan ring-1 ring-cyan-400/50 scale-105' 
          : state === 'polishing'
          ? 'border-purple-500/80 glow-purple ring-1 ring-purple-500/50'
          : state === 'injected'
          ? 'border-emerald-400/80 ring-1 ring-emerald-400/50'
          : 'border-slate-700/60 hover:border-cyan-500/50'
      }`}>
        {/* Mic / Action Button */}
        <button
          onClick={onToggleRecord}
          className={`relative p-2 rounded-full transition-all duration-200 ${
            state === 'listening'
              ? 'bg-gradient-to-tr from-cyan-500 to-emerald-400 text-slate-950 shadow-lg scale-110'
              : state === 'polishing'
              ? 'bg-gradient-to-tr from-purple-600 to-cyan-500 text-white animate-pulse'
              : state === 'injected'
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-slate-800 hover:bg-slate-700 text-cyan-400'
          }`}
          title={state === 'listening' ? 'Click to Stop & Inject' : 'Click to Dictate (or use Hotkey)'}
        >
          {state === 'listening' ? (
            <Volume2 className="w-4 h-4 animate-bounce" />
          ) : state === 'polishing' ? (
            <Sparkles className="w-4 h-4 animate-spin" />
          ) : state === 'injected' ? (
            <Check className="w-4 h-4 stroke-[3]" />
          ) : state === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>

        {/* Dynamic Equalizer Waveform Bars */}
        <div 
          onClick={onToggleRecord}
          className="flex items-center gap-1.5 h-7 px-1 cursor-pointer"
          title="Voice Activity Equalizer"
        >
          {bars.map((height, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-75 ${
                state === 'listening'
                  ? 'bg-gradient-to-t from-purple-500 via-cyan-400 to-emerald-300 shadow-[0_0_8px_#00F2FE]'
                  : state === 'polishing'
                  ? 'bg-gradient-to-t from-purple-500 to-cyan-400 opacity-60 animate-pulse'
                  : 'bg-slate-700'
              }`}
              style={{
                height: `${state === 'idle' ? 12 + (i % 3) * 6 : height}%`,
                minHeight: '4px',
              }}
            />
          ))}
        </div>

        {/* Tone Mode Pill Selector */}
        <button
          onClick={onCycleMode}
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border transition-all hover:scale-105 ${modeBadgeColor[activeMode]}`}
          title="Click to cycle tone (Casual / Pro / Code / Bullets / Raw)"
        >
          {activeMode}
        </button>

        {/* Language & Provider Tags */}
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 uppercase px-1 border-l border-slate-700/80">
          {language !== 'auto' && (
            <span className="flex items-center gap-0.5 text-cyan-400 font-bold bg-cyan-950/40 px-1 py-0.5 rounded border border-cyan-800/40">
              <Globe className="w-2.5 h-2.5" />
              {language}
            </span>
          )}
          <span>{provider}</span>
        </div>

        {/* Quick Menu Icons (Sound, Studio, History, Settings) */}
        <div className="flex items-center gap-1 pl-1 border-l border-slate-700/80">
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              className={`p-1 rounded-lg transition-colors ${
                soundEnabled ? 'text-cyan-400 hover:text-cyan-300' : 'text-slate-500 hover:text-slate-400'
              }`}
              title={soundEnabled ? 'Sound Chimes On (Click to Mute)' : 'Sound Chimes Muted (Click to Enable)'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          )}

          {onExpandToStudio && (
            <button
              onClick={onExpandToStudio}
              className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition-colors"
              title="Expand to Full Studio Workspace (F9 / Ctrl+M)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onOpenHistory}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
            title="Recent Dictations History"
          >
            <History className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition-colors"
            title="Settings & API Keys"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
