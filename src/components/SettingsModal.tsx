import React, { useState } from 'react';
import { X, Key, Mic, Keyboard, Sparkles, Shield, Cpu, ExternalLink } from 'lucide-react';
import { AppConfig, STTProvider, ToneMode } from '../types';

interface SettingsModalProps {
  config: AppConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: AppConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  config,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<AppConfig>({ ...config });
  const [activeTab, setActiveTab] = useState<'providers' | 'modes' | 'audio' | 'shortcuts'>('providers');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleShowKey = (provider: string) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
              RF
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">RDF Flow Settings</h2>
              <p className="text-xs text-slate-400">Configure AI models, speech providers &amp; hotkeys</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40 text-xs font-medium">
          <button
            onClick={() => setActiveTab('providers')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'providers'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            STT &amp; API Keys
          </button>
          <button
            onClick={() => setActiveTab('modes')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'modes'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Polishing Modes
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'shortcuts'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            Hotkeys &amp; Injection
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'audio'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Audio Input
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* TAB: STT & API Keys */}
          {activeTab === 'providers' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Active Speech-to-Text Provider
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'groq', name: 'Groq Whisper', desc: 'Ultra-fast (<250ms), free tier', badge: 'Recommended' },
                    { id: 'google', name: 'Google Gemini', desc: 'Accurate, generous free tier', badge: 'Free API' },
                    { id: 'openai', name: 'OpenAI Whisper', desc: 'High precision STT', badge: 'Paid' },
                    { id: 'deepgram', name: 'Deepgram Nova', desc: 'Real-time streaming speech', badge: 'API' },
                    { id: 'local', name: 'Local Whisper', desc: '100% offline, private', badge: 'Offline' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, provider: p.id as STTProvider })}
                      className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                        formData.provider === p.id
                          ? 'border-cyan-400 bg-cyan-950/20 shadow-md ring-1 ring-cyan-400/40'
                          : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-slate-100">{p.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-mono">
                          {p.badge}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 leading-tight">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Provider API Keys inputs */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Provider Credentials (.env or local vault)
                </h3>

                {/* Groq Key */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <label className="text-slate-300 font-medium">Groq API Key (Fastest &amp; Free)</label>
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      Get free key <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showKeys['groq'] ? 'text' : 'password'}
                      placeholder="gsk_..."
                      value={formData.groqApiKey}
                      onChange={(e) => setFormData({ ...formData, groqApiKey: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('groq')}
                      className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-200"
                    >
                      {showKeys['groq'] ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {/* Google Gemini Key */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <label className="text-slate-300 font-medium">Google Gemini API Key (Free tier)</label>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      Get free key <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showKeys['google'] ? 'text' : 'password'}
                      placeholder="AIzaSy..."
                      value={formData.googleApiKey}
                      onChange={(e) => setFormData({ ...formData, googleApiKey: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('google')}
                      className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-200"
                    >
                      {showKeys['google'] ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {/* OpenAI Key */}
                <div>
                  <label className="block text-slate-300 font-medium text-xs mb-1">OpenAI API Key</label>
                  <div className="relative">
                    <input
                      type={showKeys['openai'] ? 'text' : 'password'}
                      placeholder="sk-..."
                      value={formData.openaiApiKey}
                      onChange={(e) => setFormData({ ...formData, openaiApiKey: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('openai')}
                      className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-200"
                    >
                      {showKeys['openai'] ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {/* Deepgram Key */}
                <div>
                  <label className="block text-slate-300 font-medium text-xs mb-1">Deepgram API Key</label>
                  <input
                    type={showKeys['deepgram'] ? 'text' : 'password'}
                    placeholder="Token..."
                    value={formData.deepgramApiKey}
                    onChange={(e) => setFormData({ ...formData, deepgramApiKey: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                {/* Local Model Directory */}
                <div>
                  <label className="block text-slate-300 font-medium text-xs mb-1 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-purple-400" />
                    Local Whisper Model Path (Offline)
                  </label>
                  <input
                    type="text"
                    placeholder="models/ggml-base.bin"
                    value={formData.localModelPath}
                    onChange={(e) => setFormData({ ...formData, localModelPath: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Supports ggml-tiny.bin, ggml-base.bin, or ONNX speech weights.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: AI Polishing Modes */}
          {activeTab === 'modes' && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Default Formatting Tone Mode
              </label>
              <div className="space-y-2">
                {[
                  { id: 'casual', name: 'Casual', desc: 'Fixes punctuation, removes filler words (um, uh, like), natural conversational flow.' },
                  { id: 'professional', name: 'Professional', desc: 'Polished executive tone, concise phrasing, perfect grammar and paragraph structure.' },
                  { id: 'code', name: 'Code / Technical', desc: 'Preserves technical identifiers (snake_case, camelCase), markdown code blocks, terminal commands.' },
                  { id: 'bullets', name: 'Bullet Points', desc: 'Automatically groups thoughts into neat, actionable bullet lists.' },
                  { id: 'raw', name: 'Raw Dictation', desc: 'Direct speech-to-text verbatim without AI rewriting.' },
                ].map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setFormData({ ...formData, mode: m.id as ToneMode })}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.mode === m.id
                        ? 'border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-400/40'
                        : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mode"
                      checked={formData.mode === m.id}
                      onChange={() => setFormData({ ...formData, mode: m.id as ToneMode })}
                      className="mt-1 accent-cyan-400"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-100">{m.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{m.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Hotkeys & Injection */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium text-xs mb-1">Global Dictation Hotkey</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.hotkey}
                    onChange={(e) => setFormData({ ...formData, hotkey: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <span className="text-[11px] text-slate-400">e.g. <code>Ctrl+Space</code> or <code>F8</code></span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoInject}
                    onChange={(e) => setFormData({ ...formData, autoInject: e.target.checked })}
                    className="rounded accent-cyan-400"
                  />
                  <span className="text-xs font-medium text-slate-200">
                    Automatically inject / paste text into active window on finish
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 ml-6 mt-0.5">
                  Simulates keyboard typing or clipboard paste at the active cursor position.
                </p>
              </div>
            </div>
          )}

          {/* TAB: Audio Input */}
          {activeTab === 'audio' && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium text-xs mb-1">Microphone Input Device</label>
                <select
                  value={formData.inputDevice}
                  onChange={(e) => setFormData({ ...formData, inputDevice: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                >
                  <option value="default">Default System Microphone</option>
                  <option value="headset">USB Audio / Headset Microphone</option>
                  <option value="synthetic">Synthetic Test Stream (Software Test)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium text-xs mb-1">
                  Silence Auto-Stop Detection (ms)
                </label>
                <input
                  type="number"
                  min="500"
                  max="5000"
                  step="250"
                  value={formData.silenceThresholdMs}
                  onChange={(e) => setFormData({ ...formData, silenceThresholdMs: parseInt(e.target.value) || 1500 })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Automatically stops recording when you pause talking for this duration.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Keys are stored locally and encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md hover:from-cyan-400 hover:to-purple-500 transition-all"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
