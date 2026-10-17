import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FloatingPill } from './components/FloatingPill';
import { SettingsModal } from './components/SettingsModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { AppConfig, DictationItem, DictationState, ToneMode } from './types';

const DEFAULT_CONFIG: AppConfig = {
  provider: 'groq',
  mode: 'casual',
  hotkey: 'Ctrl+Space',
  autoInject: true,
  groqApiKey: '',
  googleApiKey: '',
  openaiApiKey: '',
  deepgramApiKey: '',
  localModelPath: 'models/ggml-base.bin',
  inputDevice: 'default',
  silenceThresholdMs: 1500,
};

export const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('rdf_flow_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const [dictationState, setDictationState] = useState<DictationState>('idle');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [currentText, setCurrentText] = useState<string>('');
  const [history, setHistory] = useState<DictationItem[]>(() => {
    const saved = localStorage.getItem('rdf_flow_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const audioIntervalRef = useRef<number | null>(null);
  const recordStartTimeRef = useRef<number>(0);

  // Save config changes
  const handleSaveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem('rdf_flow_config', JSON.stringify(newConfig));
  };

  // Cycle Tone Mode (Casual -> Professional -> Code -> Bullets -> Raw -> Casual)
  const handleCycleMode = () => {
    const modes: ToneMode[] = ['casual', 'professional', 'code', 'bullets', 'raw'];
    const nextIndex = (modes.indexOf(config.mode) + 1) % modes.length;
    const nextMode = modes[nextIndex];
    const updated = { ...config, mode: nextMode };
    setConfig(updated);
    localStorage.setItem('rdf_flow_config', JSON.stringify(updated));
  };

  // Polish text based on mode
  const polishText = (raw: string, mode: ToneMode): string => {
    let cleaned = raw.trim();
    // 1. Remove filler words
    cleaned = cleaned.replace(/\b(um|uh|like|you know|err|erm)\b/gi, '').replace(/\s{2,}/g, ' ').trim();
    
    // Capitalize first letter
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }

    if (mode === 'casual') {
      if (!cleaned.endsWith('.') && !cleaned.endsWith('?') && !cleaned.endsWith('!')) {
        cleaned += '.';
      }
      return cleaned;
    }

    if (mode === 'professional') {
      cleaned = cleaned
        .replace(/\bgonna\b/gi, 'going to')
        .replace(/\bwanna\b/gi, 'want to')
        .replace(/\bgotta\b/gi, 'must')
        .replace(/\bkind of\b/gi, 'rather');
      if (!cleaned.endsWith('.') && !cleaned.endsWith('?') && !cleaned.endsWith('!')) {
        cleaned += '.';
      }
      return cleaned;
    }

    if (mode === 'code') {
      return cleaned;
    }

    if (mode === 'bullets') {
      const parts = cleaned.split(/(?:\.|\band\b|\bthen\b)/i).map(s => s.trim()).filter(Boolean);
      if (parts.length > 1) {
        return parts.map(p => `- ${p.charAt(0).toUpperCase() + p.slice(1)}`).join('\n');
      }
      return `- ${cleaned}`;
    }

    return raw; // Raw mode
  };

  // Start recording
  const startRecording = useCallback(() => {
    setDictationState('listening');
    setCurrentText('Listening for your voice...');
    recordStartTimeRef.current = Date.now();

    // In a live environment with Tauri, invoke('start_listening')
    // Dev simulated audio meter:
    audioIntervalRef.current = window.setInterval(() => {
      setAudioLevel(Math.random() * 0.7 + 0.2);
    }, 100);
  }, []);

  // Stop recording & trigger transcription + polishing + injection
  const stopRecording = useCallback(() => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    setAudioLevel(0);
    setDictationState('polishing');
    setCurrentText('Polishing with AI...');

    const duration = Date.now() - recordStartTimeRef.current;

    // Simulated speech result (or from Tauri IPC)
    setTimeout(() => {
      const samplePhrases = [
        "Um, hey team, let's schedule the RDF Flow release review for tomorrow at 10 AM.",
        "Could you please check the GitHub pull request and merge the new Tauri v2 icons?",
        "function formatAudioBuffer with sample rate 16000 and return normalized float32 array.",
        "We need to buy groceries and fix the audio latency bug and update the documentation.",
      ];
      const raw = samplePhrases[Math.floor(Math.random() * samplePhrases.length)];
      const polished = polishText(raw, config.mode);

      setCurrentText(polished);
      setDictationState('injected');

      const newItem: DictationItem = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rawText: raw,
        polishedText: polished,
        provider: config.provider,
        mode: config.mode,
        durationMs: duration,
      };

      setHistory(prev => {
        const updated = [newItem, ...prev.slice(0, 49)];
        localStorage.setItem('rdf_flow_history', JSON.stringify(updated));
        return updated;
      });

      // Reset to idle after injection preview
      setTimeout(() => {
        setDictationState('idle');
        setCurrentText('');
      }, 2500);
    }, 650);
  }, [config.mode, config.provider]);

  const handleToggleRecord = useCallback(() => {
    if (dictationState === 'idle') {
      startRecording();
    } else if (dictationState === 'listening') {
      stopRecording();
    }
  }, [dictationState, startRecording, stopRecording]);

  // Global Hotkey Listener (e.g. Ctrl+Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check Ctrl+Space or user hotkey
      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault();
        handleToggleRecord();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleRecord]);

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6 bg-transparent select-none">
      {/* Floating Dynamic Waveform Pill (Wispr Flow style overlay) */}
      <FloatingPill
        state={dictationState}
        audioLevel={audioLevel}
        activeMode={config.mode}
        provider={config.provider}
        currentText={currentText}
        onToggleRecord={handleToggleRecord}
        onCycleMode={handleCycleMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Settings Modal */}
      <SettingsModal
        config={config}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveConfig}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        items={history}
        onClose={() => setIsHistoryOpen(false)}
        onClear={() => {
          setHistory([]);
          localStorage.removeItem('rdf_flow_history');
        }}
        onInject={(text) => {
          setCurrentText(text);
          setDictationState('injected');
          setIsHistoryOpen(false);
          setTimeout(() => {
            setDictationState('idle');
            setCurrentText('');
          }, 2000);
        }}
      />
    </main>
  );
};
