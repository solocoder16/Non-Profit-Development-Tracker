import React, { useState } from 'react';
import {
  SecuritySettings,
  AuditLogEntry,
  UserRole,
  PolicyDocument,
  PolicyDocumentType,
} from '../../types';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Download,
  Upload,
  HardDrive,
  KeyRound,
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  FileText,
  Trash2,
  ExternalLink,
  FileUp,
  X,
  Sparkles,
} from 'lucide-react';
import {
  exportAllDataBundle,
  importAllDataBundle,
  getStoredPolicies,
  uploadPolicyDocument,
  deletePolicyDocument,
} from '../../utils/storage';
import { encryptData, decryptData } from '../../utils/crypto';

interface SecurityAuditViewProps {
  security: SecuritySettings;
  onUpdateSecurity: (settings: Partial<SecuritySettings>) => void;
  auditLogs: AuditLogEntry[];
  onLogAudit: (action: any, details: string) => void;
  onRefreshData: () => void;
}

export const SecurityAuditView: React.FC<SecurityAuditViewProps> = ({
  security,
  onUpdateSecurity,
  auditLogs,
  onLogAudit,
  onRefreshData,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinMessage, setPinMessage] = useState('');
  const [backupPassphrase, setBackupPassphrase] = useState('');
  const [restorePassphrase, setRestorePassphrase] = useState('');
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const [auditSearch, setAuditSearch] = useState('');

  // Organizational Policy Documents State
  const [policies, setPolicies] = useState<PolicyDocument[]>(() => getStoredPolicies());
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [viewingPolicy, setViewingPolicy] = useState<PolicyDocument | null>(null);

  const policyNameMap: Record<PolicyDocumentType, string> = {
    data_privacy_policy: 'Data Privacy Policy',
    employee_safety_policy: 'Employee Safety Policy',
    child_protection_policy: 'Child Protection Policy',
  };

  const handleUploadPolicyFile = (
    policyId: PolicyDocumentType,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updated = uploadPolicyDocument(
        policyId,
        file.name,
        file.size,
        dataUrl,
        file.type || 'application/octet-stream'
      );
      setPolicies(updated);
      const friendlyName = policyNameMap[policyId] || 'Policy Document';
      setUploadFeedback(`Successfully uploaded "${file.name}" for ${friendlyName}!`);
      onLogAudit('upload_policy', `Uploaded official policy document: ${friendlyName} ("${file.name}")`);
      setTimeout(() => setUploadFeedback(null), 5000);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeletePolicy = (policyId: PolicyDocumentType) => {
    const friendlyName = policyNameMap[policyId] || 'Policy Document';
    if (confirm(`Are you sure you want to remove the uploaded document for ${friendlyName}?`)) {
      const updated = deletePolicyDocument(policyId);
      setPolicies(updated);
      onLogAudit('delete_policy', `Removed policy document for: ${friendlyName}`);
      setUploadFeedback(`Document removed for ${friendlyName}.`);
      setTimeout(() => setUploadFeedback(null), 4000);
    }
  };

  const handleDownloadPolicy = (policy: PolicyDocument) => {
    if (!policy.fileDataUrl) return;
    const link = document.createElement('a');
    link.href = policy.fileDataUrl;
    link.setAttribute('download', policy.fileName || `${policy.id}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onLogAudit('view_child', `Downloaded policy document: ${policy.title}`);
  };

  // Handle PIN update
  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length < 4) {
      setPinMessage('PIN must be at least 4 digits');
      return;
    }
    onUpdateSecurity({ pinCode: pinInput });
    setPinMessage('Security PIN successfully updated.');
    onLogAudit('security_login', 'Project Officer changed local security PIN code');
    setPinInput('');
  };

  // Encrypted Backup Export
  const handleExportEncryptedBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupPassphrase || backupPassphrase.length < 6) {
      setBackupStatus('Passphrase must be at least 6 characters long.');
      return;
    }

    try {
      setBackupStatus('Generating AES-GCM 256-bit encrypted archive...');
      const dataBundle = exportAllDataBundle();
      const encryptedJson = await encryptData(dataBundle, backupPassphrase);

      const blob = new Blob([encryptedJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `ngo_tracker_encrypted_backup_${new Date().toISOString().slice(0, 10)}.bak`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setBackupStatus('Encrypted backup successfully downloaded!');
      onLogAudit('export_backup', 'Exported AES-GCM 256-bit encrypted database backup');
      setBackupPassphrase('');
    } catch (err: any) {
      setBackupStatus(`Encryption failed: ${err.message}`);
    }
  };

  // Encrypted Backup Restore
  const handleRestoreFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!restorePassphrase) {
      setRestoreStatus('Please enter the decryption passphrase first.');
      e.target.value = '';
      return;
    }

    try {
      setRestoreStatus('Decrypting and verifying archive...');
      const text = await file.text();
      const restoredBundle = await decryptData<any>(text, restorePassphrase);

      importAllDataBundle(restoredBundle);
      onRefreshData();
      setRestoreStatus('Database successfully restored from backup!');
      setRestorePassphrase('');
      e.target.value = '';
    } catch (err: any) {
      setRestoreStatus(`Decryption failed: Incorrect passphrase or damaged backup file.`);
    }
  };

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.officer.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Workstation Security & Data Privacy Compliance
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Strict offline air-gapped protection for sensitive child identities and humanitarian field records.
        </p>
      </div>

      {/* Local Air-Gapped Status Banner */}
      <div className="p-5 bg-white border border-emerald-200 rounded-2xl shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Local Server & Air-Gapped Mode: Active
              </h2>
              <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Isolated</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-2xl">
              All child profiles, family living histories, and community field dispatches are stored exclusively on this local machine. No records are synchronized to public cloud servers, fulfilling your strict NGO data protection mandate.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[11px] text-slate-400 block">Compliance Standard</span>
          <span className="text-xs font-bold text-slate-700">DPA & NGO Safeguarding</span>
        </div>
      </div>

      {/* Physical File Storage Path Card */}
      <div className="p-6 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Physical Storage Location on Local Server
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Real-time Atomic Disk Synchronization
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-medium block text-[11px] mb-1">
              Primary Server Disk File:
            </span>
            <code className="text-emerald-300 font-mono text-xs block break-all font-bold select-all">
              C:\WebApp Data\vineyard_masterlist.json
            </code>
            <span className="text-slate-500 text-[10px] mt-1.5 block">
              Permanent JSON store in <strong className="text-slate-400">C:\WebApp Data</strong>. Can be copied or backed up directly.
            </span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-medium block text-[11px] mb-1">
              Client Browser Offline Mirror:
            </span>
            <code className="text-blue-300 font-mono text-xs block break-all font-bold select-all">
              localStorage['vineyard_children_data']
            </code>
            <span className="text-slate-500 text-[10px] mt-1.5 block">
              Instant zero-latency cache allowing full functionality even without LAN connection.
            </span>
          </div>
        </div>
      </div>

      {/* Organizational Policy & Safeguarding Documents (Data Privacy, Employee Safety, Child Protection) */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Organizational Safeguarding & Operational Policies
                </h3>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  3 Compliance Standards
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload and manage your organization&apos;s official <strong>Data Privacy Policy</strong>, <strong>Employee Safety Policy</strong>, and <strong>Child Protection Policy</strong>. Stored on the local server for rapid audit inspection.
              </p>
            </div>
          </div>
        </div>

        {/* Upload feedback banner */}
        {uploadFeedback && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-emerald-900 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadFeedback}</span>
          </div>
        )}

        {/* 3 Policy Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {policies.map((doc) => {
            const isUploaded = Boolean(doc.fileName && doc.fileDataUrl);

            return (
              <div
                key={doc.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isUploaded
                    ? 'bg-slate-50/50 border-emerald-300 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Category Badge & Status */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {doc.category}
                    </span>
                    {isUploaded ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Pending Upload</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-extrabold text-slate-900 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{doc.title}</span>
                  </h4>

                  {/* Description */}
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {doc.description}
                  </p>

                  {/* Uploaded File Details (if present) */}
                  {isUploaded && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 mb-4 space-y-1.5 text-xs shadow-2xs">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 break-all text-xs leading-snug">
                            {doc.fileName}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                            <span className="font-medium text-slate-600">{doc.fileSizeFormatted}</span>
                            <span aria-hidden="true">·</span>
                            <span>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Active'}</span>
                          </div>
                        </div>
                      </div>
                      {doc.uploadedBy && (
                        <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                          Verified by: <span className="font-medium text-slate-600">{doc.uploadedBy}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-2">
                  {isUploaded ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadPolicy(doc)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        title="Download uploaded policy document"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>

                      {/* Replace Button */}
                      <label
                        className="flex items-center justify-center gap-1 p-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        title="Replace with updated document"
                      >
                        <FileUp className="w-3.5 h-3.5 text-emerald-700" />
                        <span className="hidden sm:inline">Replace</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt,.rtf,.odt,image/*"
                          onChange={(e) => handleUploadPolicyFile(doc.id, e)}
                          className="hidden"
                        />
                      </label>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeletePolicy(doc.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                        title="Remove uploaded document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors">
                        <FileUp className="w-4 h-4" />
                        <span>Upload {doc.title.replace(' Policy', '')}</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt,.rtf,.odt,image/*"
                          onChange={(e) => handleUploadPolicyFile(doc.id, e)}
                          className="hidden"
                        />
                      </label>
                      <span className="block text-[10px] text-slate-400 text-center mt-1.5">
                        Accepts PDF, DOCX, TXT, or scanned images
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Privacy Mode & Role Setting */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Eye className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Privacy Mode & Active Role
            </h3>
          </div>

          {/* Privacy Mode Quick Switch */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                {security.privacyMode ? 'Privacy Masking: Enabled' : 'Privacy Masking: Disabled'}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Instantly obscures child names, photos, family history, and donation values.
              </span>
            </div>
            <button
              onClick={() => {
                const next = !security.privacyMode;
                onUpdateSecurity({ privacyMode: next });
                onLogAudit('toggle_privacy', `Turned Privacy Mode ${next ? 'ON' : 'OFF'}`);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                security.privacyMode
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {security.privacyMode ? 'Turn Off' : 'Enable Masking'}
            </button>
          </div>

          {/* Active Role Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Current Workstation Role
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(['project_officer', 'field_enumerator', 'auditor'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    onUpdateSecurity({ currentRole: role });
                    onLogAudit('security_login', `Switched active role to ${role}`);
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-colors cursor-pointer ${
                    security.currentRole === role
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block capitalize font-bold">
                    {role.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {role === 'project_officer'
                      ? 'Full Access'
                      : role === 'field_enumerator'
                      ? 'Child Entry'
                      : 'Audits Only'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Auto-lock Timer */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Auto-Lock Inactivity Timeout
            </label>
            <select
              value={security.autoLockMinutes}
              onChange={(e) => onUpdateSecurity({ autoLockMinutes: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="5">5 Minutes</option>
              <option value="15">15 Minutes (Default)</option>
              <option value="30">30 Minutes</option>
              <option value="60">1 Hour</option>
            </select>
          </div>
        </div>

        {/* Card 2: Security PIN & Console Lock */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <KeyRound className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Project Officer Security PIN
            </h3>
          </div>

          <form onSubmit={handleUpdatePin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Change 4-Digit Security PIN
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Enter new 4-6 digit PIN"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Update PIN
                </button>
              </div>
              {pinMessage && (
                <p className="text-xs text-emerald-700 font-semibold mt-1.5">{pinMessage}</p>
              )}
            </div>
          </form>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span className="font-bold text-slate-800 block">Security Best Practice:</span>
            <span>
              Always lock your local workstation console using the lock button in the top navigation bar when leaving your desk or when unattended visitors are present.
            </span>
          </div>

          <button
            onClick={() => onUpdateSecurity({ isLocked: true })}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Lock Workstation Now</span>
          </button>
        </div>

      </div>

      {/* Encrypted Local Backups & Restorations */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Encrypted Local Backup & Restoration (AES-GCM 256-Bit)
            </h3>
            <p className="text-xs text-slate-500">
              Create password-encrypted offline backups to preserve ChildLink beneficiary data and field reports on secure external media.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Export Box */}
          <form onSubmit={handleExportEncryptedBackup} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 uppercase tracking-wider">
              <Download className="w-4 h-4 text-emerald-700" />
              <span>Export Encrypted Backup</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Encrypts all ChildLink records and CVA & EiE field blog reports using PBKDF2 + AES-GCM 256-bit encryption.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Backup Encryption Passphrase <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                placeholder="Choose a strong backup passphrase"
                value={backupPassphrase}
                onChange={(e) => setBackupPassphrase(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Encrypted .BAK File</span>
            </button>
            {backupStatus && (
              <p className="text-xs text-emerald-800 font-semibold">{backupStatus}</p>
            )}
          </form>

          {/* Import / Restore Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 uppercase tracking-wider">
              <Upload className="w-4 h-4 text-blue-700" />
              <span>Restore from Encrypted Backup</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Select an encrypted `.bak` or `.json` file and provide its original passphrase to restore local data.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Decryption Passphrase
              </label>
              <input
                type="password"
                placeholder="Enter passphrase used when exporting"
                value={restorePassphrase}
                onChange={(e) => setRestorePassphrase(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-blue-700" />
                <span>Select & Restore Backup File</span>
                <input
                  type="file"
                  accept=".bak,.json"
                  onChange={handleRestoreFileChange}
                  className="hidden"
                />
              </label>
            </div>
            {restoreStatus && (
              <p className="text-xs text-slate-700 font-semibold">{restoreStatus}</p>
            )}
          </div>

        </div>
      </div>

      {/* Local Tamper-Evident Audit Log */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Workstation Activity & Compliance Audit Trail
            </h3>
            <p className="text-xs text-slate-500">
              Chronological log of all access, exports, beneficiary updates, and security events.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/api/audit-trail-file"
              download="audit_trail.log"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-300"
              title="Download physical audit_trail.log file from local workstation disk"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-700" />
              <span>Download audit_trail.log</span>
            </a>

            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
          {filteredLogs.length === 0 ? (
            <div className="py-6 text-center text-slate-400">No matching audit logs found</div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-slate-800">{log.details}</span>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Officer: <span className="font-medium text-slate-700">{log.officer}</span>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
