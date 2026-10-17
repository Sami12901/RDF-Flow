import React from 'react';
import { X, Copy, Check, Clock, Trash2, ArrowUpRight } from 'lucide-react';
import { DictationItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: DictationItem[];
  onClear: () => void;
  onInject: (text: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onClear,
  onInject,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">Dictation History ({items.length})</h2>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onClear}
                className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-950/30"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-2.5 text-xs">
          {items.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No dictations yet.</p>
              <p className="text-[11px]">Hold your hotkey or click the microphone to start.</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold uppercase">{item.mode}</span>
                    <span>•</span>
                    <span>{item.provider}</span>
                  </div>
                  <span>{item.timestamp}</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-sans">{item.polishedText}</p>
                {item.rawText !== item.polishedText && (
                  <p className="text-[10px] text-slate-500 mt-1 italic line-clamp-1">
                    Raw: "{item.rawText}"
                  </p>
                )}
                <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-slate-900">
                  <button
                    onClick={() => handleCopy(item.id, item.polishedText)}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400 px-2 py-0.5 rounded hover:bg-slate-800"
                  >
                    {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedId === item.id ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={() => onInject(item.polishedText)}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 px-2 py-0.5 rounded hover:bg-cyan-950/40"
                  >
                    <ArrowUpRight className="w-3 h-3" />
                    Paste at Cursor
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
