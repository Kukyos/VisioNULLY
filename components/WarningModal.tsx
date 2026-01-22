import React, { useState } from 'react';

interface WarningModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  onDontWarnAgain: (checked: boolean) => void;
}

const WarningModal: React.FC<WarningModalProps> = ({ onConfirm, onCancel, onDontWarnAgain }) => {
  const [dontWarn, setDontWarn] = useState(false);

  const handleConfirm = () => {
    if (dontWarn) {
      onDontWarnAgain(true);
    }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border-2 border-red-500 max-w-md w-full">
        <div className="bg-red-500 p-4 flex items-center gap-3">
          <span className="text-3xl">⚠️</span>
          <h2 className="text-lg font-bold uppercase tracking-wider text-white">Critical Warning</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-white font-mono text-sm leading-relaxed">
              You are about to view a <span className="font-bold text-red-400">ONE-TIME ONLY</span> incident clip.
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Once viewed, this video will be <span className="font-bold">permanently deleted</span> and cannot be reviewed again. This is to protect resident privacy.
            </p>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 p-4">
            <ul className="text-xs text-zinc-400 space-y-2 font-mono">
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>Clip will auto-delete after viewing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>No replay or pause available</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>No video storage or backup exists</span>
              </li>
            </ul>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={dontWarn}
              onChange={(e) => setDontWarn(e.target.checked)}
              className="w-4 h-4 accent-red-500"
            />
            <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">
              Don't warn me again
            </span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-4 text-sm font-bold uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 text-sm font-bold uppercase tracking-wider transition-colors"
            >
              View Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;
