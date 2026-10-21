import React, { useState } from 'react';
import { VineyardLogo } from './VineyardLogo';
import { Lock, ShieldAlert, KeyRound, CheckCircle2 } from 'lucide-react';

interface PinLockModalProps {
  onUnlock: (pin: string) => boolean;
  isOpen: boolean;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({ onUnlock, isOpen }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onUnlock(pin);
    if (!success) {
      setError(true);
      setPin('');
    } else {
      setError(false);
      setPin('');
    }
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 border border-slate-100 flex flex-col items-center">
        
        {/* Vineyard Logo */}
        <VineyardLogo variant="full" size="lg" showSubtitle={true} className="mb-6" />

        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-3">
          <Lock className="w-5 h-5" />
        </div>

        <h2 className="text-xl font-bold text-slate-800 text-center">
          Workstation Locked
        </h2>
        <p className="text-xs text-slate-500 text-center mt-1 mb-6">
          Enter your security PIN to access confidential beneficiary &amp; community data.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          {/* PIN Dots Display */}
          <div className="flex gap-3 mb-6">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  pin.length > index
                    ? 'bg-emerald-600 scale-110'
                    : 'bg-slate-200 border border-slate-300'
                }`}
              />
            ))}
          </div>

          {/* Quick Keypad */}
          <div className="grid grid-cols-3 gap-2.5 w-full max-w-[240px] mb-6">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
              <button
                type="button"
                key={k}
                onClick={() => {
                  if (k === 'C') setPin('');
                  else if (k === '⌫') handleBackspace();
                  else handleKeyPress(k);
                }}
                className={`h-12 rounded-xl text-lg font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                  k === 'C' || k === '⌫'
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm'
                    : 'bg-slate-50 text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200'
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium mb-4">
              <ShieldAlert className="w-4 h-4" />
              <span>Incorrect security PIN. Please try again.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={pin.length === 0}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Unlock Local Console</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 w-full text-center">
          <p className="text-[11px] text-slate-400">
            Default Officer PIN: <span className="font-mono font-bold text-slate-600">2024</span>
          </p>
          <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-800 mt-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Offline Local Server Mode Active</span>
          </div>
        </div>

      </div>
    </div>
  );
};
