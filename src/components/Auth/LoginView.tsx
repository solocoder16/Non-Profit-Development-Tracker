import React, { useState } from 'react';
import { VineyardLogo } from '../VineyardLogo';
import { OfficerProfile } from '../Profile/OfficerProfileModal';
import {
  Lock,
  User,
  Briefcase,
  KeyRound,
  ShieldCheck,
  HardDrive,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface LoginViewProps {
  onLogin: (name: string, position: string) => void;
  profile: OfficerProfile;
  storedPin: string;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  profile,
  storedPin,
}) => {
  const [name, setName] = useState(profile.name || 'Jericho');
  const [position, setPosition] = useState(profile.position || 'Project Officer');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide officer name.');
      return;
    }

    // Check PIN (if entered or default)
    if (pin && pin !== storedPin) {
      setError('Incorrect security PIN. (Default: 1234)');
      return;
    }

    setError(null);
    onLogin(name.trim(), position.trim() || 'Project Officer');
  };

  const handleQuickDemoLogin = () => {
    setError(null);
    onLogin(profile.name || 'Jericho', profile.position || 'Project Officer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100 selection:bg-emerald-500 selection:text-white">
      
      {/* Background ambient accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-emerald-700 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        
        {/* Main Card */}
        <div className="bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-10 space-y-6">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center">
            <VineyardLogo variant="full" size="lg" showSubtitle={false} className="mb-4" />
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-2">
              Workstation Authentication
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Officer Log In
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              Sign in to manage confidential Beneficiaries, Volunteer Corps, and Community Activities.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Officer Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>Officer Name</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. Jericho"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            {/* Officer Position */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-emerald-700" />
                <span>Position / Assignment</span>
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Project Officer"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            {/* Security PIN */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Security PIN</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Default PIN: 1234
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={10}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter PIN (e.g. 1234)"
                  className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Sign In to Workstation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
            >
              Quick Sign In as {profile.name || 'Jericho'} ({profile.position || 'Project Officer'})
            </button>
          </div>

          {/* Security Features Badge */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Offline Local Security</span>
            </span>
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              <span>Air-Gapped Workstation</span>
            </span>
          </div>

        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          Protected under Republic of the Philippines Data Privacy Act of 2012 (RA 10173).
        </p>

      </div>
    </div>
  );
};
