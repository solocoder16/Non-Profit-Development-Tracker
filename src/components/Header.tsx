import React, { useState, useRef, useEffect } from 'react';
import { VineyardLogo } from './VineyardLogo';
import {
  Users,
  BookOpen,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Plus,
  HeartHandshake,
  Menu,
  X,
  User,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { UserRole } from '../types';
import { OfficerProfile } from './Profile/OfficerProfileModal';

export type ActiveTab = 'childlink' | 'volunteers' | 'reports' | 'security';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  privacyMode: boolean;
  onTogglePrivacy: () => void;
  onLockApp: () => void;
  onQuickNewChild?: () => void;
  currentRole: UserRole;
  officerProfile: OfficerProfile;
  onOpenProfile: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  privacyMode,
  onTogglePrivacy,
  onLockApp,
  onQuickNewChild,
  currentRole,
  officerProfile,
  onOpenProfile,
  onSignOut,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleSelectSecurity = () => {
    onTabChange('security');
    setIsMenuOpen(false);
  };

  const handleSelectProfile = () => {
    setIsMenuOpen(false);
    onOpenProfile();
  };

  const handleTriggerSignOut = () => {
    setIsMenuOpen(false);
    onSignOut();
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs no-print">
      {/* Privacy Mode Warning Banner if active */}
      {privacyMode && (
        <div className="bg-amber-500 text-white text-xs font-semibold py-1 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 shrink-0" />
            <span>Privacy Mode Active: Sensitive beneficiary names and personal profiles are obscured.</span>
          </div>
          <button
            onClick={onTogglePrivacy}
            className="underline hover:text-amber-100 cursor-pointer font-bold ml-4 text-xs"
          >
            Disable Privacy Mode
          </button>
        </div>
      )}

      {/* Top Bar: Logo, Navigation, and Action Buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6 sm:gap-8">
        
        {/* Zone 1: Brand Logo only (Childlink & Field Ops text removed) */}
        <div className="flex items-center shrink-0">
          <VineyardLogo variant="horizontal" size="md" showSubtitle={false} />
        </div>

        {/* Zone 2: Navigation links (General naming: Beneficiaries & Community Activities) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => onTabChange('childlink')}
            className={`flex items-center gap-2 pb-0.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'childlink'
                ? 'text-emerald-700 font-bold border-b-2 border-emerald-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Beneficiaries</span>
          </button>

          <button
            onClick={() => onTabChange('volunteers')}
            className={`flex items-center gap-2 pb-0.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'volunteers'
                ? 'text-emerald-700 font-bold border-b-2 border-emerald-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Volunteer Corps</span>
          </button>

          <button
            onClick={() => onTabChange('reports')}
            className={`flex items-center gap-2 pb-0.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'reports'
                ? 'text-emerald-700 font-bold border-b-2 border-emerald-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Community Activities</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions and Top Hamburger Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Quick Privacy Toggle */}
          <button
            onClick={onTogglePrivacy}
            title={privacyMode ? 'Turn off Privacy Masking' : 'Enable Privacy Masking'}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              privacyMode
                ? 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {privacyMode ? <EyeOff className="w-3.5 h-3.5 text-amber-700" /> : <Eye className="w-3.5 h-3.5 text-slate-600" />}
            <span className="hidden sm:inline">{privacyMode ? 'Masked' : 'Privacy Mode'}</span>
          </button>


          {/* Quick Lock Button */}
          <button
            onClick={onLockApp}
            title="Lock session (requires PIN)"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* Top Hamburger Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                isMenuOpen
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
              }`}
              title="Workstation menu: Security Section, Profile Section, and Sign Out"
              aria-label="Toggle workstation menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-5 h-5 text-emerald-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
            </button>

            {/* Hamburger Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                
                {/* User Summary Header */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50/70">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                    {officerProfile.name ? officerProfile.name.charAt(0).toUpperCase() : 'O'}
                  </div>
                  <div className="overflow-hidden">
                    <span className="font-bold text-slate-900 text-sm block truncate">
                      {officerProfile.name || 'Jericho'}
                    </span>
                    <span className="text-xs text-slate-500 block truncate">
                      {officerProfile.position || 'Project Officer'}
                    </span>
                  </div>
                </div>

                {/* Primary Menu Options: Security, Profile, Sign Out */}
                <div className="p-2 space-y-1">
                  
                  {/* Profile Section */}
                  <button
                    onClick={handleSelectProfile}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold block text-slate-800 group-hover:text-emerald-800">
                          Profile Section
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          Name, Position, Birthday
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                  </button>

                  {/* Security Section */}
                  <button
                    onClick={handleSelectSecurity}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer group text-left ${
                      activeTab === 'security'
                        ? 'bg-slate-100 text-emerald-800 font-bold'
                        : 'text-slate-700 hover:text-emerald-800 hover:bg-emerald-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div>
                        <span className="font-bold block text-slate-800 group-hover:text-emerald-800">
                          Security Section
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          Audit Logs, PIN, Compliance
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                  </button>

                  {/* Sign Out */}
                  <button
                    onClick={handleTriggerSignOut}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer group text-left mt-1 pt-2 border-t border-slate-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold block text-rose-700">
                          Sign Out
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          Return to login interface
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-rose-300 group-hover:text-rose-500" />
                  </button>
                </div>

                {/* Mobile view quick tabs */}
                <div className="md:hidden border-t border-slate-100 p-2 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
                    Sections
                  </span>
                  <button
                    onClick={() => {
                      onTabChange('childlink');
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                      activeTab === 'childlink' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Beneficiaries</span>
                  </button>
                  <button
                    onClick={() => {
                      onTabChange('volunteers');
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                      activeTab === 'volunteers' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
                    }`}
                  >
                    <HeartHandshake className="w-3.5 h-3.5" />
                    <span>Volunteer Corps</span>
                  </button>
                  <button
                    onClick={() => {
                      onTabChange('reports');
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                      activeTab === 'reports' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Community Activities</span>
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Navigation Sub-bar (Beneficiaries, Volunteer Corps, Community Activities) */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 py-2 px-2 bg-slate-50 text-xs">
        <button
          onClick={() => onTabChange('childlink')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'childlink' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600'
          }`}
        >
          Beneficiaries
        </button>
        <button
          onClick={() => onTabChange('volunteers')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'volunteers' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600'
          }`}
        >
          Volunteers
        </button>
        <button
          onClick={() => onTabChange('reports')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === 'reports' ? 'bg-white text-emerald-800 shadow-xs font-bold' : 'text-slate-600'
          }`}
        >
          Community Activities
        </button>
      </div>
    </header>
  );
};
