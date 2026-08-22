import React, { useState } from 'react';
import { Lock, KeyRound, X, Check, ShieldCheck, AlertCircle } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: (pin: string) => boolean;
  isUnlocked: boolean;
  onLock: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onUnlock,
  isUnlocked,
  onLock,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) {
      setErrorMsg('Please enter your owner PIN');
      return;
    }

    const ok = onUnlock(pinInput.trim());
    if (ok) {
      setErrorMsg('');
      setSuccessMsg('Unlocked successfully! You can now edit the page.');
      setTimeout(() => {
        setPinInput('');
        setSuccessMsg('');
        onClose();
      }, 700);
    } else {
      setErrorMsg('Incorrect PIN. Default PIN is 1234.');
    }
  };

  const handleLockNow = () => {
    onLock();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#0e0e14] border border-white/15 p-6 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isUnlocked ? (
          <div className="text-center space-y-4 py-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Editor Unlocked</h3>
              <p className="text-xs text-gray-400 mt-1">
                You are currently in Owner Edit Mode. You can customize tracks, styling, and bio.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleLockNow}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40 border border-white/10 text-xs font-semibold transition-all"
              >
                Lock Page for Visitors
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black text-xs font-bold transition-all hover:opacity-95"
              >
                Keep Editing
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/10">
              <Lock className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-white">Owner Access Lock</h3>
              <p className="text-xs text-gray-400 mt-1">
                Only the page owner can edit tracks, styling, and info. Enter PIN to unlock.
              </p>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  autoFocus
                  placeholder="Enter Owner PIN (e.g. 1234)"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                  <Check className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black text-xs font-bold transition-all hover:opacity-95 shadow-lg shadow-cyan-500/20"
              >
                Unlock Editor
              </button>
            </div>

            <p className="text-[11px] text-center text-gray-500 font-mono">
              Default Owner PIN: <span className="text-cyan-400 font-bold">1234</span> (Changeable in settings)
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
