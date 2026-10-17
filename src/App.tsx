import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FloatingPill } from './components/FloatingPill';
import { StudioWorkspace } from './components/StudioWorkspace';
import { SettingsModal } from './components/SettingsModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { sounds } from './utils/soundEffects';
import { AppConfig, DictationItem, DictationState, ToneMode, AppViewMode } from './types';

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const DEFAULT_CONFIG: AppConfig = {
  provider: 'groq',
  mode: 'casual',
  hotkey: 'Ctrl+Space',
  autoInject: true,
  soundEnabled: true,
  language: 'auto',
  viewMode: 'compact',
  groqApiKey: '',
  googleApiKey: '',
  openaiApiKey: '',
  deepgramApiKey: '',
  localModelPath: 'models/ggml-base.bin',
  inputDevice: 'default',
  silenceThresholdMs: 1500,
  vocabulary: [
    { id: '1', term: 'Wispr Flow', category: 'tech' },
    { id: '2', term: 'RDF Flow', category: 'tech' },
    { id: '3', term: 'Tauri', category: 'tech' },
  ],
  snippets: [
    { id: '1', trigger: 'eml', expansion: 'mdsamiislam2006@gmail.com' },
    { id: '2', trigger: 'rdf', expansion: 'RDF Flow AI Voice Assistant' },
  ],
};

export const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('rdf_flow_config');
    if (saved) {
      try {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });

  const [viewMode, setViewMode] = useState<AppViewMode>(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const savedMode = localStorage.getItem('rdf_flow_view_mode') as AppViewMode | null;
    return savedMode || (isMobile ? 'studio' : 'compact');
  });

  const [dictationState, setDictationState] = useState<DictationState>('idle');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [currentText, setCurrentText] = useState<string>('');
  const [studioTranscript, setStudioTranscript] = useState<string>(() => {
    return localStorage.getItem('rdf_flow_studio_transcript') || '';
  });

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

  const handleToggleSound = () => {
    const updated = { ...config, soundEnabled: !config.soundEnabled };
    handleSaveConfig(updated);
  };

  const handleToggleViewMode = useCallback(() => {
    setViewMode((prev) => {
      const next = prev === 'compact' ? 'studio' : 'compact';
      localStorage.setItem('rdf_flow_view_mode', next);
      return next;
    });
  }, []);

  // Cycle Tone Mode (Casual -> Professional -> Code -> Bullets -> Academic -> Raw)
  const handleCycleMode = () => {
    const modes: ToneMode[] = ['casual', 'professional', 'code', 'bullets', 'academic', 'raw'];
    const nextIndex = (modes.indexOf(config.mode) + 1) % modes.length;
    const nextMode = modes[nextIndex];
    const updated = { ...config, mode: nextMode };
    handleSaveConfig(updated);
  };

  // Polish text based on mode, snippets, and custom vocabulary
  const polishText = (raw: string, mode: ToneMode): string => {
    let cleaned = raw.trim();

    // 1. Snippet expansions (e.g. trigger -> expansion)
    if (config.snippets && config.snippets.length > 0) {
      for (const snip of config.snippets) {
        if (snip.trigger && snip.expansion) {
          const regex = new RegExp(`\\b${escapeRegExp(snip.trigger)}\\b`, 'gi');
          cleaned = cleaned.replace(regex, snip.expansion);
        }
      }
    }

    // 2. Custom Vocabulary replacement / casing
    if (config.vocabulary && config.vocabulary.length > 0) {
      for (const vocab of config.vocabulary) {
        if (vocab.term) {
          const target = vocab.replacement || vocab.term;
          const regex = new RegExp(`\\b${escapeRegExp(vocab.term)}\\b`, 'gi');
          cleaned = cleaned.replace(regex, target);
        }
      }
    }

    // 3. Remove filler words
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

    if (mode === 'academic') {
      cleaned = cleaned
        .replace(/\bkids\b/gi, 'children')
        .replace(/\ba lot of\b/gi, 'numerous')
        .replace(/\bbad\b/gi, 'adverse')
        .replace(/\bgood\b/gi, 'beneficial');
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
    sounds.playStart(config.soundEnabled);
    setDictationState('listening');
    setCurrentText('Listening for your voice...');
    recordStartTimeRef.current = Date.now();

    // In a live environment with Tauri, invoke('start_listening')
    audioIntervalRef.current = window.setInterval(() => {
      setAudioLevel(Math.random() * 0.7 + 0.2);
    }, 100);
  }, [config.soundEnabled]);

  // Stop recording & trigger transcription + polishing + injection
  const stopRecording = useCallback(() => {
    sounds.playStop(config.soundEnabled);
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    setAudioLevel(0);
    setDictationState('polishing');
    setCurrentText('Polishing with AI...');

    const duration = Date.now() - recordStartTimeRef.current;

    setTimeout(() => {
      const samplePhrases = [
        "Um, hey team, let's schedule the RDF Flow release review for tomorrow at 10 AM.",
        "Could you please check the GitHub pull request and merge the new Wispr Flow features?",
        "function formatAudioBuffer with sample rate 16000 and return normalized float32 array.",
        "We need to buy groceries and fix the audio latency bug and update the documentation.",
      ];
      const raw = samplePhrases[Math.floor(Math.random() * samplePhrases.length)];
      const polished = polishText(raw, config.mode);

      sounds.playInjected(config.soundEnabled);
      setCurrentText(polished);
      setDictationState('injected');

      // Append to Studio transcript
      setStudioTranscript((prev) => {
        const updated = prev ? `${prev}\n\n${polished}` : polished;
        localStorage.setItem('rdf_flow_studio_transcript', updated);
        return updated;
      });

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
  }, [config.mode, config.provider, config.soundEnabled, config.snippets, config.vocabulary]);

  const handleToggleRecord = useCallback(() => {
    if (dictationState === 'idle') {
      startRecording();
    } else if (dictationState === 'listening') {
      stopRecording();
    }
  }, [dictationState, startRecording, stopRecording]);

  // Global Hotkey Listener (e.g. Ctrl+Space for dictation, F9 or Ctrl+M for Studio mode toggle)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Dictation
      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault();
        handleToggleRecord();
      }
      // Toggle Studio / Compact view mode (F9 or Ctrl+M)
      if (e.key === 'F9' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm')) {
        e.preventDefault();
        handleToggleViewMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleRecord, handleToggleViewMode]);

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-2 sm:p-6 bg-transparent select-none">
      {viewMode === 'compact' ? (
        <FloatingPill
          state={dictationState}
          audioLevel={audioLevel}
          activeMode={config.mode}
          provider={config.provider}
          currentText={currentText}
          soundEnabled={config.soundEnabled}
          language={config.language}
          onToggleRecord={handleToggleRecord}
          onCycleMode={handleCycleMode}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onExpandToStudio={() => {
            setViewMode('studio');
            localStorage.setItem('rdf_flow_view_mode', 'studio');
          }}
          onToggleSound={handleToggleSound}
        />
      ) : (
        <StudioWorkspace
          state={dictationState}
          audioLevel={audioLevel}
          currentText={currentText}
          transcriptHistory={studioTranscript}
          config={config}
          onToggleRecord={handleToggleRecord}
          onSelectMode={(mode) => {
            const updated = { ...config, mode };
            handleSaveConfig(updated);
          }}
          onUpdateText={(text) => {
            setStudioTranscript(text);
            localStorage.setItem('rdf_flow_studio_transcript', text);
          }}
          onClearText={() => {
            setStudioTranscript('');
            localStorage.removeItem('rdf_flow_studio_transcript');
          }}
          onSwitchToCompact={() => {
            setViewMode('compact');
            localStorage.setItem('rdf_flow_view_mode', 'compact');
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onSaveConfig={handleSaveConfig}
        />
      )}

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
          sounds.playInjected(config.soundEnabled);
          setStudioTranscript(prev => (prev ? `${prev}\n\n${text}` : text));
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
