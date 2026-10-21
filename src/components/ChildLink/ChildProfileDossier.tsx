import React from 'react';
import { ChildBeneficiary } from '../../types';
import { VineyardLogo } from '../VineyardLogo';
import {
  X,
  Printer,
  Edit,
  ShieldCheck,
  Calendar,
  User,
  GraduationCap,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  Heart,
  FileText,
} from 'lucide-react';
import { exportChildProfileToWord } from '../../utils/wordExport';

interface ChildProfileDossierProps {
  child: ChildBeneficiary;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (child: ChildBeneficiary) => void;
  privacyMode: boolean;
}

export const ChildProfileDossier: React.FC<ChildProfileDossierProps> = ({
  child,
  isOpen,
  onClose,
  onEdit,
  privacyMode,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = () => {
    exportChildProfileToWord(child);
  };

  const maskString = (str: string) => {
    if (!privacyMode) return str;
    if (!str) return '—';
    const words = str.split(' ');
    return words
      .map((w) => (w.length > 2 ? `${w[0]}${'*'.repeat(Math.max(w.length - 2, 2))}${w[w.length - 1]}` : '***'))
      .join(' ');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded">
              {child.beneficiaryCode}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-600 font-medium">ChildLink Beneficiary Profile Dossier</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Word Export Button */}
            <button
              onClick={handleDownloadWord}
              title="Download as clean, readable Microsoft Word document (.doc) with headings, tables, and photo"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download as Word (.doc)</span>
            </button>

            {/* Print Official Document Button */}
            <button
              onClick={handlePrint}
              title="Print official clean letterhead document without web chrome or screenshot borders"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Dossier</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(child);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-emerald-700" />
              <span>Edit Record</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dossier Document Sheet (Formatted for screen and physical print) */}
        <div className="p-8 sm:p-10 overflow-y-auto flex-1 bg-white text-slate-800">
          
          {/* Official Letterhead */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-emerald-700 pb-6 mb-8 gap-4">
            <VineyardLogo variant="horizontal" size="lg" showSubtitle={true} />
            <div className="sm:text-right">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                Beneficiary Case Profile
              </span>
              <p className="text-sm font-mono font-extrabold text-slate-800 mt-0.5">
                {child.beneficiaryCode}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Local Record ID: <span className="font-mono text-slate-700">{child.id}</span>
              </p>
              <p className="text-xs text-slate-500">
                Community Cluster: <span className="font-semibold text-slate-700">{child.communityCluster}</span>
              </p>
            </div>
          </div>

          {/* Child Primary Banner */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-8 flex flex-col md:flex-row gap-6 items-start">
            {/* Child Photo / Avatar */}
            <div className="w-28 h-28 rounded-xl bg-slate-200 border border-slate-300 flex flex-col items-center justify-center shrink-0 shadow-inner relative overflow-hidden">
              {privacyMode ? (
                <div className="absolute inset-0 bg-slate-800/85 backdrop-blur-md flex items-center justify-center text-white text-[10px] font-bold text-center p-2">
                  Photo Masked (Privacy)
                </div>
              ) : child.photoUrl ? (
                <img
                  src={child.photoUrl}
                  alt={child.beneficiaryName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to avatar if image fails to load
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full bg-emerald-700 text-white">
                  <User className="w-12 h-12 text-white/90" />
                  <span className="text-[10px] font-bold tracking-wider mt-1 opacity-80 uppercase">
                    {child.nickname || 'ChildLink'}
                  </span>
                </div>
              )}
            </div>

            {/* Main Identity Information */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {maskString(child.beneficiaryName)}
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Known as &ldquo;<span className="font-semibold text-slate-700">{privacyMode ? '***' : child.nickname}</span>&rdquo;
                    <span className="mx-2 text-slate-300">·</span>
                    Grade: <span className="font-bold text-slate-800">{child.gradeLevel}</span>
                  </p>
                </div>

                {/* Status indicator (Zero-pill text separator) */}
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="text-slate-500">Status:</span>
                  <span
                    className={
                      child.status === 'sponsored'
                        ? 'text-emerald-700 font-bold'
                        : child.status === 'available'
                        ? 'text-amber-700 font-bold'
                        : 'text-slate-600 font-bold'
                    }
                  >
                    {child.status === 'sponsored'
                      ? '● Active Sponsorship'
                      : child.status === 'available'
                      ? '○ Available for Sponsor'
                      : '✓ ' + child.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Core Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Birthdate (B-day):</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {privacyMode ? '****-**-**' : child.bday}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Current AGE:</span>
                  <span className="font-bold text-slate-800 tabular-nums text-sm">
                    {child.age} years old
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Favorite Subject:</span>
                  <span className="font-semibold text-emerald-800">
                    {child.favoriteSubject || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Household Chores:</span>
                  <span className="font-semibold text-slate-800">
                    {child.householdChores || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Family Profile & Household History */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-200 text-slate-900 font-bold text-sm">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <span>Family Profile & Living Circumstances</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-medium block">Father’s Name / Occupation:</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block text-sm">
                    {maskString(child.fatherNameOccupation) || 'Not reported'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Mother’s Name / Occupation:</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block text-sm">
                    {maskString(child.motherNameOccupation) || 'Not reported'}
                  </span>
                </div>
                <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-medium block">Siblings:</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {maskString(child.siblings) || 'No siblings listed'}
                  </span>
                </div>
              </div>
            </div>

            {/* Brief History of the Family */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-200 text-slate-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Brief History of the Family & Vulnerability Context</span>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                {privacyMode ? (
                  <p className="italic text-slate-500">
                    Family background narrative is obscured in Privacy Mode. Disable privacy mode to read full confidential history.
                  </p>
                ) : (
                  <p className="whitespace-pre-line">{child.briefHistoryOfFamily || 'No family history documented yet.'}</p>
                )}
              </div>
            </div>

            {/* Sponsorship Allocation & Safeguarding Policies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 text-emerald-800">
                  Sponsorship Allocation
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold capitalize text-slate-800">{child.status}</span>
                  </div>
                  {child.sponsorName && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sponsor:</span>
                      <span className="font-semibold text-slate-800">{child.sponsorName}</span>
                    </div>
                  )}
                  {child.sponsorCode && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sponsor ID:</span>
                      <span className="font-mono text-slate-700">{child.sponsorCode}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Classification of Community:</span>
                    <span className="font-semibold text-slate-800">{child.communityCluster}</span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 text-emerald-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Media Release Form & Child Protection Policy</span>
                </h3>
                <div className="space-y-2.5 text-xs">
                  {/* Media Release Form */}
                  <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {child.mediaReleaseFormSigned ?? child.consentSigned ?? true ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold text-slate-800 block">
                        Media Release Form:{' '}
                        {child.mediaReleaseFormSigned ?? child.consentSigned ?? true ? (
                          <span className="text-emerald-700">Signed on File</span>
                        ) : (
                          <span className="text-amber-700">Pending Signature</span>
                        )}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Authorizes official case documentation and sponsor reporting photos.
                      </span>
                    </div>
                  </div>

                  {/* Child Protection Policy */}
                  <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {child.childProtectionPolicySigned ?? true ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold text-slate-800 block">
                        Child Protection Policy:{' '}
                        {child.childProtectionPolicySigned ?? true ? (
                          <span className="text-emerald-700">Signed & Acknowledged</span>
                        ) : (
                          <span className="text-amber-700">Pending Acknowledgment</span>
                        )}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Complies with organizational safeguarding standards and zero-tolerance protocols.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Verification Footer for printed files */}
            <div className="pt-8 mt-8 border-t-2 border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-end gap-6">
              <div>
                <p className="font-semibold text-slate-700">NGO Data Tracker · Humanitarian Operations</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Local Confidential Archive · Republic of the Philippines Data Privacy Act Compliance
                </p>
              </div>
              <div className="text-right">
                <div className="border-b border-slate-400 w-48 mb-1" />
                <p className="text-[11px] font-semibold text-slate-700">Project Officer Sign-off & Verification</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
