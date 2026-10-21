import React, { useState, useEffect } from 'react';
import {
  ChildBeneficiary,
  CommunityReport,
  VolunteerProfile,
  AuditLogEntry,
  SecuritySettings,
} from './types';
import {
  getStoredChildren,
  saveStoredChildren,
  getStoredReports,
  saveStoredReports,
  getStoredVolunteers,
  saveStoredVolunteers,
  getStoredAuditLogs,
  appendAuditLog,
  getStoredSecurity,
  saveStoredSecurity,
  getStoredCommunities,
  saveStoredCommunities,
  initializeFromLocalServer,
} from './utils/storage';
import { Header, ActiveTab } from './components/Header';
import { ChildMasterlist } from './components/ChildLink/ChildMasterlist';
import { ChildModal } from './components/ChildLink/ChildModal';
import { ChildProfileDossier } from './components/ChildLink/ChildProfileDossier';
import { VolunteerMasterlist } from './components/Volunteers/VolunteerMasterlist';
import { CommunityReportsView } from './components/Reports/CommunityReportsView';
import { SecurityAuditView } from './components/Security/SecurityAuditView';
import { PinLockModal } from './components/PinLockModal';
import { OfficerProfileModal, OfficerProfile } from './components/Profile/OfficerProfileModal';
import { LoginView } from './components/Auth/LoginView';

const DEFAULT_OFFICER_PROFILE: OfficerProfile = {
  name: 'Jericho',
  position: 'Project Officer',
  birthday: '1992-06-15',
};

export default function App() {
  // Main data states
  const [children, setChildren] = useState<ChildBeneficiary[]>(() => getStoredChildren());
  const [reports, setReports] = useState<CommunityReport[]>(() => getStoredReports());
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>(() => getStoredVolunteers());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => getStoredAuditLogs());
  const [security, setSecurity] = useState<SecuritySettings>(() => getStoredSecurity());
  const [communities, setCommunities] = useState<string[]>(() => getStoredCommunities());

  // User Profile state (strictly 3 fields: Name, Position, Birthday)
  const [officerProfile, setOfficerProfile] = useState<OfficerProfile>(() => {
    try {
      const stored = localStorage.getItem('ngo_officer_profile');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_OFFICER_PROFILE;
  });

  // Login Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('ngo_officer_logged_in');
      if (stored !== null) return stored === 'true';
    } catch (e) {}
    return true; // Default logged in on first session
  });

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('childlink');
  const [selectedChildForDossier, setSelectedChildForDossier] = useState<ChildBeneficiary | null>(null);
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [childToEdit, setChildToEdit] = useState<ChildBeneficiary | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Sync with local server file storage on mount
  useEffect(() => {
    initializeFromLocalServer().then((synced) => {
      if (synced) {
        setChildren(getStoredChildren());
        setReports(getStoredReports());
        setVolunteers(getStoredVolunteers());
        setAuditLogs(getStoredAuditLogs());
        setCommunities(getStoredCommunities());
      }
    });
  }, []);

  // Auto-lock inactivity listener
  useEffect(() => {
    if (!isLoggedIn) return;
    let timer: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timer);
      const minutes = security.autoLockMinutes || 15;
      timer = setTimeout(() => {
        setSecurity((prev) => {
          const next = { ...prev, isLocked: true };
          saveStoredSecurity(next);
          return next;
        });
      }, minutes * 60 * 1000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [security.autoLockMinutes, isLoggedIn]);

  // Global hotkeys (Alt+P for Privacy Mode, Alt+L for Lock)
  useEffect(() => {
    if (!isLoggedIn) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        setSecurity((prev) => {
          const next = { ...prev, privacyMode: !prev.privacyMode };
          saveStoredSecurity(next);
          appendAuditLog({
            action: 'toggle_privacy',
            details: `Hotkey triggered: Privacy Mode ${next.privacyMode ? 'ON' : 'OFF'}`,
            officer: `${officerProfile.name} (${officerProfile.position})`,
          });
          return next;
        });
      }
      if (e.altKey && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        setSecurity((prev) => {
          const next = { ...prev, isLocked: true };
          saveStoredSecurity(next);
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoggedIn, officerProfile]);

  // Handlers for data updates
  const handleLogAudit = (action: any, details: string) => {
    appendAuditLog({
      action,
      details,
      officer: `${officerProfile.name} (${officerProfile.position})`,
    });
    setAuditLogs(getStoredAuditLogs());
  };

  const handleUpdateSecurity = (partial: Partial<SecuritySettings>) => {
    const next = { ...security, ...partial };
    setSecurity(next);
    saveStoredSecurity(next);
  };

  // Profile Save Handler
  const handleSaveProfile = (updated: OfficerProfile) => {
    setOfficerProfile(updated);
    try {
      const persistedProfile = {
        name: updated.name,
        position: updated.position,
      };
      localStorage.setItem('ngo_officer_profile', JSON.stringify(persistedProfile));
    } catch (e) {}
    handleLogAudit('update_child', `Updated officer profile: ${updated.name} (${updated.position})`);
  };

  // Login Handler
  const handleLogin = (name: string, position: string) => {
    const updatedProfile: OfficerProfile = {
      ...officerProfile,
      name,
      position,
    };
    setOfficerProfile(updatedProfile);
    try {
      const persistedProfile = {
        name: updatedProfile.name,
        position: updatedProfile.position,
      };
      localStorage.setItem('ngo_officer_profile', JSON.stringify(persistedProfile));
      localStorage.setItem('ngo_officer_logged_in', 'true');
    } catch (e) {}
    setIsLoggedIn(true);
    handleLogAudit('security_login', `Officer ${name} (${position}) logged in to workstation`);
  };

  // Sign Out Handler
  const handleSignOut = () => {
    setIsLoggedIn(false);
    try {
      localStorage.setItem('ngo_officer_logged_in', 'false');
    } catch (e) {}
    handleLogAudit('security_login', `Officer ${officerProfile.name} signed out`);
  };

  // Beneficiaries Handlers
  const handleSaveChild = (childData: Partial<ChildBeneficiary>) => {
    let updated: ChildBeneficiary[];
    if (childToEdit) {
      updated = children.map((c) =>
        c.id === childToEdit.id ? ({ ...c, ...childData, updatedAt: new Date().toISOString() } as ChildBeneficiary) : c
      );
      handleLogAudit('update_child', `Updated beneficiary profile for ${childData.beneficiaryName || childToEdit.beneficiaryName}`);
    } else {
      const newChild: ChildBeneficiary = {
        id: `ch-${Date.now()}`,
        beneficiaryCode: `BEN-${new Date().getFullYear()}-${String(children.length + 1).padStart(3, '0')}`,
        beneficiaryName: childData.beneficiaryName || 'New Beneficiary',
        nickname: childData.nickname || '',
        bday: childData.bday || '2016-01-01',
        age: childData.age || 8,
        gradeLevel: childData.gradeLevel || 'Grade 3',
        favoriteSubject: childData.favoriteSubject || '',
        householdChores: childData.householdChores || '',
        siblings: childData.siblings || '',
        fatherNameOccupation: childData.fatherNameOccupation || '',
        motherNameOccupation: childData.motherNameOccupation || '',
        briefHistoryOfFamily: childData.briefHistoryOfFamily || '',
        status: childData.status || 'available',
        sponsorName: childData.sponsorName,
        sponsorCode: childData.sponsorCode,
        communityCluster: childData.communityCluster || communities[0] || 'Brgy. Langkiwa, Binan, Laguna',
        mediaReleaseFormSigned: childData.mediaReleaseFormSigned ?? true,
        childProtectionPolicySigned: childData.childProtectionPolicySigned ?? true,
        photoUrl: childData.photoUrl || '',
        medicalOrNutritionNotes: childData.medicalOrNutritionNotes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updated = [newChild, ...children];
      handleLogAudit('create_child', `Enrolled new beneficiary ${newChild.beneficiaryName} (${newChild.beneficiaryCode})`);
    }

    setChildren(updated);
    saveStoredChildren(updated);
    setChildToEdit(null);
  };

  const handleDeleteChild = (id: string) => {
    const target = children.find((c) => c.id === id);
    if (!target) return;
    const updated = children.filter((c) => c.id !== id);
    setChildren(updated);
    saveStoredChildren(updated);
    handleLogAudit('delete_child', `Deleted beneficiary record for ${target.beneficiaryName}`);
  };

  const handleAddCommunity = (newArea: string) => {
    if (!communities.includes(newArea)) {
      const updated = [...communities, newArea];
      setCommunities(updated);
      saveStoredCommunities(updated);
      handleLogAudit('create_child', `Registered new community cluster: ${newArea}`);
    }
  };

  // Volunteer Handlers
  const handleAddVolunteer = (newVolunteer: VolunteerProfile) => {
    const updated = [newVolunteer, ...volunteers];
    setVolunteers(updated);
    saveStoredVolunteers(updated);
  };

  const handleUpdateVolunteer = (updatedVolunteer: VolunteerProfile) => {
    const updated = volunteers.map((v) => (v.id === updatedVolunteer.id ? updatedVolunteer : v));
    setVolunteers(updated);
    saveStoredVolunteers(updated);
  };

  const handleDeleteVolunteer = (id: string) => {
    const target = volunteers.find((v) => v.id === id);
    if (!target) return;
    const updated = volunteers.filter((v) => v.id !== id);
    setVolunteers(updated);
    saveStoredVolunteers(updated);
    handleLogAudit('delete_child', `Archived volunteer profile: ${target.fullName} (${target.volunteerCode})`);
  };

  // Reports Handlers
  const handleAddReport = (newReport: CommunityReport) => {
    const updated = [newReport, ...reports];
    setReports(updated);
    saveStoredReports(updated);
  };

  const handleUpdateReport = (updatedReport: CommunityReport) => {
    const updated = reports.map((r) => (r.id === updatedReport.id ? updatedReport : r));
    setReports(updated);
    saveStoredReports(updated);
  };

  const handleDeleteReport = (reportId: string) => {
    const target = reports.find((r) => r.id === reportId);
    if (!target) return;
    const updated = reports.filter((r) => r.id !== reportId);
    setReports(updated);
    saveStoredReports(updated);
    handleLogAudit('delete_child', `Deleted field report: ${target.title}`);
  };

  const refreshAllData = () => {
    setChildren(getStoredChildren());
    setReports(getStoredReports());
    setVolunteers(getStoredVolunteers());
    setAuditLogs(getStoredAuditLogs());
    setCommunities(getStoredCommunities());
  };

  const handleUnlock = (enteredPin: string) => {
    if (enteredPin === security.pinCode) {
      handleUpdateSecurity({ isLocked: false });
      handleLogAudit('security_login', 'Workstation console unlocked via security PIN');
      return true;
    }
    return false;
  };

  // Render Login Interface if signed out
  if (!isLoggedIn) {
    return (
      <LoginView
        onLogin={handleLogin}
        profile={officerProfile}
        storedPin={security.pinCode || '1234'}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Top Bar Navigation with Hamburger Menu */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        privacyMode={security.privacyMode}
        onTogglePrivacy={() => {
          const next = !security.privacyMode;
          handleUpdateSecurity({ privacyMode: next });
          handleLogAudit('toggle_privacy', `Turned Privacy Mode ${next ? 'ON' : 'OFF'}`);
        }}
        onLockApp={() => handleUpdateSecurity({ isLocked: true })}
        currentRole={security.currentRole}
        officerProfile={officerProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'childlink' && (
          <ChildMasterlist
            children={children}
            onSelectChild={(child) => setSelectedChildForDossier(child)}
            onEditChild={(child) => {
              setChildToEdit(child);
              setIsChildModalOpen(true);
            }}
            onDeleteChild={handleDeleteChild}
            onNewChild={() => {
              setChildToEdit(null);
              setIsChildModalOpen(true);
            }}
            privacyMode={security.privacyMode}
            currentRole={security.currentRole}
            onLogAudit={handleLogAudit}
            communities={communities}
            onAddCommunity={handleAddCommunity}
          />
        )}

        {activeTab === 'volunteers' && (
          <VolunteerMasterlist
            volunteers={volunteers}
            onAddVolunteer={handleAddVolunteer}
            onUpdateVolunteer={handleUpdateVolunteer}
            onDeleteVolunteer={handleDeleteVolunteer}
            communities={communities}
            currentRole={security.currentRole}
            privacyMode={security.privacyMode}
            onLogAudit={handleLogAudit}
          />
        )}

        {activeTab === 'reports' && (
          <CommunityReportsView
            reports={reports}
            onAddReport={handleAddReport}
            onUpdateReport={handleUpdateReport}
            onDeleteReport={handleDeleteReport}
            currentRole={security.currentRole}
            onLogAudit={handleLogAudit}
            communities={communities}
          />
        )}

        {activeTab === 'security' && (
          <SecurityAuditView
            security={security}
            onUpdateSecurity={handleUpdateSecurity}
            auditLogs={auditLogs}
            onLogAudit={handleLogAudit}
            onRefreshData={refreshAllData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">NGO Data Tracker</span>
            <span aria-hidden="true">·</span>
            <span>Beneficiaries &amp; Community Operations System</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-semibold">Offline Local Server Ready</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Confidential &amp; Protected</span>
            <span aria-hidden="true">·</span>
            <span>Officer: {officerProfile.name} ({officerProfile.position})</span>
            <span aria-hidden="true">·</span>
            <span>Alt+P (Mask)</span>
            <span aria-hidden="true">·</span>
            <span>Alt+L (Lock)</span>
          </div>
        </div>
      </footer>

      {/* Officer Profile Modal (Strictly 3 fields: Name, Position, Birthday) */}
      <OfficerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={officerProfile}
        onSaveProfile={handleSaveProfile}
        onSignOut={handleSignOut}
      />

      {/* Beneficiary Add/Edit Modal */}
      <ChildModal
        isOpen={isChildModalOpen}
        onClose={() => {
          setIsChildModalOpen(false);
          setChildToEdit(null);
        }}
        onSave={handleSaveChild}
        initialChild={childToEdit}
        existingCount={children.length}
        communities={communities}
        onAddCommunity={handleAddCommunity}
      />

      {/* Beneficiary Dossier Viewer Modal */}
      {selectedChildForDossier && (
        <ChildProfileDossier
          child={selectedChildForDossier}
          isOpen={Boolean(selectedChildForDossier)}
          onClose={() => setSelectedChildForDossier(null)}
          onEdit={(child) => {
            setSelectedChildForDossier(null);
            setChildToEdit(child);
            setIsChildModalOpen(true);
          }}
          privacyMode={security.privacyMode}
        />
      )}

      {/* PIN Lock Screen Modal */}
      <PinLockModal
        isOpen={security.isLocked}
        onUnlock={handleUnlock}
      />

    </div>
  );
}
