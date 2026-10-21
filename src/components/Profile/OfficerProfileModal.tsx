import React, { useState, useEffect } from 'react';
import { User, Briefcase, Calendar, X, Save, LogOut, CheckCircle2 } from 'lucide-react';

export interface OfficerProfile {
  name: string;
  position: string;
  birthday: string;
}

interface OfficerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: OfficerProfile;
  onSaveProfile: (updated: OfficerProfile) => void;
  onSignOut: () => void;
}

export const OfficerProfileModal: React.FC<OfficerProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onSignOut,
}) => {
  const [name, setName] = useState(profile.name);
  const [position, setPosition] = useState(profile.position);
  const [birthday, setBirthday] = useState(profile.birthday);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(profile.name);
      setPosition(profile.position);
      setBirthday(profile.birthday);
      setSavedNotice(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name: name.trim() || 'Officer',
      position: position.trim() || 'Project Officer',
      birthday: birthday || '',
    });
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 900);
  };

  // Format display birthday if set
  const formatBirthday = (dateStr: string) => {
    if (!dateStr) return 'Not set';
    try {
      const [year, month, day] = dateStr.split('-');
      if (!year || !month || !day) return dateStr;
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
              {name.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Officer Profile</h2>
              <p className="text-xs text-slate-500">Workstation user identity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Form: Exactly 3 fields (Name, Position, Birthday) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Saved feedback */}
          {savedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profile details saved successfully!</span>
            </div>
          )}

          {/* 1. Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span>Full Name</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jericho"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />
          </div>

          {/* 2. Position */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-700" />
              <span>Position</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g. Project Officer"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />
          </div>

          {/* 3. Birthday */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>Birthday</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />
            {birthday && (
              <p className="text-[11px] text-slate-500 mt-1 pl-1">
                Formatted: <strong className="text-slate-700">{formatBirthday(birthday)}</strong>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
