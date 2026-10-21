import React from 'react';
import { VolunteerProfile } from '../../types';
import { VineyardLogo } from '../VineyardLogo';
import {
  X,
  Printer,
  FileText,
  Edit,
  User,
  HeartHandshake,
  Phone,
  Clock,
  Award,
  Stethoscope,
  Users2,
  Calendar,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { exportVolunteerProfileToWord } from '../../utils/wordExport';

interface VolunteerDossierModalProps {
  volunteer: VolunteerProfile;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (volunteer: VolunteerProfile) => void;
  privacyMode?: boolean;
}

export const VolunteerDossierModal: React.FC<VolunteerDossierModalProps> = ({
  volunteer,
  isOpen,
  onClose,
  onEdit,
  privacyMode = false,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = () => {
    exportVolunteerProfileToWord(volunteer);
  };

  const maskName = (name: string) => {
    if (!privacyMode || !name) return name;
    const parts = name.split(' ');
    return parts
      .map((p) => (p.length > 2 ? `${p[0]}${'*'.repeat(Math.max(p.length - 2, 2))}${p[p.length - 1]}` : '***'))
      .join(' ');
  };

  const isLongTerm = volunteer.engagementType === 'long_term';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded">
              {volunteer.volunteerCode}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-600 font-medium">Volunteer Profile Dossier</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Word Export Button */}
            <button
              onClick={handleDownloadWord}
              title="Download as readable Microsoft Word document (.doc)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download as Word (.doc)</span>
            </button>

            {/* Print Official Document Button */}
            <button
              onClick={handlePrint}
              title="Print official clean letterhead document without web chrome"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Dossier</span>
            </button>

            {/* Edit Button */}
            <button
              onClick={() => {
                onClose();
                onEdit(volunteer);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-emerald-700" />
              <span>Edit Record &amp; Photo</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dossier Document Sheet */}
        <div className="p-8 sm:p-10 overflow-y-auto flex-1 bg-white text-slate-800 space-y-8">
          
          {/* Official Letterhead */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-emerald-700 pb-6 gap-4">
            <VineyardLogo variant="horizontal" size="lg" showSubtitle={true} />
            <div className="sm:text-right">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                Humanitarian Corps Dossier
              </span>
              <p className="text-sm font-mono font-extrabold text-slate-800 mt-0.5">
                {volunteer.volunteerCode}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Enrolled: <span className="font-semibold text-slate-700">{volunteer.enrollmentDate}</span>
              </p>
            </div>
          </div>

          {/* Primary Profile Banner */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col md:flex-row gap-6 items-start">
            {/* Volunteer Photo / Avatar */}
            <div className="w-28 h-28 rounded-xl bg-slate-200 border border-slate-300 flex flex-col items-center justify-center shrink-0 shadow-inner relative overflow-hidden">
              {privacyMode ? (
                <div className="absolute inset-0 bg-slate-800/85 backdrop-blur-md flex items-center justify-center text-white text-[10px] font-bold text-center p-2">
                  Photo Masked
                </div>
              ) : volunteer.photoUrl ? (
                <img
                  src={volunteer.photoUrl}
                  alt={volunteer.fullName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full bg-emerald-700 text-white">
                  <User className="w-12 h-12 text-white/90" />
                  <span className="text-[10px] font-bold tracking-wider mt-1 opacity-80 uppercase">
                    Volunteer
                  </span>
                </div>
              )}
            </div>

            {/* Identity & Status */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {maskName(volunteer.fullName)}
                  </h1>
                  {volunteer.preferredName && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Preferred Name: &ldquo;<span className="font-semibold text-slate-700">{volunteer.preferredName}</span>&rdquo;
                      <span className="mx-2 text-slate-300">·</span>
                      {volunteer.occupation || 'Volunteer Specialist'}
                    </p>
                  )}
                </div>

                {/* Engagement Type Badge & Status */}
                <div className="flex flex-col sm:items-end gap-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      isLongTerm
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                    }`}
                  >
                    <HeartHandshake className="w-3.5 h-3.5" />
                    <span>{isLongTerm ? 'Long-Term Volunteer' : 'One-Time Event Volunteer'}</span>
                  </span>

                  <span className="text-[11px] font-medium text-slate-500">
                    Status: <strong className="text-slate-800 uppercase">{volunteer.status}</strong>
                  </span>
                </div>
              </div>

              {/* Key Quick Facts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs border-t border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10.5px]">Age / Gender</span>
                  <span className="font-bold text-slate-800">{volunteer.age} yrs · {volunteer.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10.5px]">Contact Number</span>
                  <span className="font-mono font-bold text-slate-800">{privacyMode ? '09**-***-****' : volunteer.contactNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10.5px]">Barangay Community</span>
                  <span className="font-bold text-slate-800 truncate block">{volunteer.barangayCommunity}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10.5px]">Enrolling Officer</span>
                  <span className="font-medium text-slate-700 truncate block">{volunteer.enrolledByOfficer}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 1: Volunteer Profile & Identification Details */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <User className="w-4 h-4 text-emerald-700" />
              <span>1. Volunteer Profile &amp; Contact Details</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">Email Address</span>
                  <span className="font-medium text-slate-800">{volunteer.email || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Birthdate</span>
                  <span className="font-mono text-slate-800">{volunteer.birthdate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Residential Address</span>
                  <span className="text-slate-800">{privacyMode ? '*** Protected Local Address ***' : volunteer.address || '—'}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">Engagement Commitment</span>
                  <span className="font-bold text-emerald-800">
                    {isLongTerm
                      ? 'Long-Term Continuous Engagement (Assigned to community projects)'
                      : 'One-Time Event Dispatch (Deployed for specific campaigns / disaster ops)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Primary Occupation</span>
                  <span className="text-slate-800 font-medium">{volunteer.occupation || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Enrollment Date</span>
                  <span className="font-mono text-slate-800">{volunteer.enrollmentDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Emergency Contact Information */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Phone className="w-4 h-4 text-emerald-700" />
              <span>2. Emergency Contact Information</span>
            </h2>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Primary Contact Person</span>
                <span className="font-bold text-slate-900 text-sm">{volunteer.emergencyContact?.name || '—'}</span>
                <span className="text-slate-500 block text-[11px]">Relationship: {volunteer.emergencyContact?.relationship || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Emergency Phone Number</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {privacyMode ? '09**-***-****' : volunteer.emergencyContact?.primaryPhone || '—'}
                </span>
                {volunteer.emergencyContact?.secondaryPhone && (
                  <span className="text-slate-500 block text-[11px] font-mono mt-0.5">
                    Alt: {volunteer.emergencyContact.secondaryPhone}
                  </span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Emergency Address</span>
                <span className="text-slate-800">{volunteer.emergencyContact?.address || 'Same as volunteer address'}</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: Volunteer Track Interest and Availability */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>3. Volunteer Track Interest &amp; Availability</span>
            </h2>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] mb-1.5">Assigned &amp; Interested Tracks</span>
                <div className="flex flex-wrap gap-1.5">
                  {(volunteer.volunteerTracks || []).map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 bg-white border border-emerald-300 text-emerald-900 rounded-md font-semibold text-[11px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">Availability Schedule Days</span>
                  <span className="font-semibold text-slate-800">
                    {(volunteer.availabilityDays || []).join(', ') || 'Flexible'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Commitment (Hours / Frequency)</span>
                  <span className="font-bold text-slate-800">{volunteer.availabilityHoursPerWeek || 'As needed'}</span>
                </div>
              </div>

              {volunteer.notesOnAvailability && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block text-[11px]">Schedule Constraints &amp; Notes</span>
                  <p className="text-slate-700 mt-0.5">{volunteer.notesOnAvailability}</p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: Skills Background */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Award className="w-4 h-4 text-emerald-700" />
              <span>4. Skills Background &amp; Competencies</span>
            </h2>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] mb-1.5">Core Skills &amp; Field Capabilities</span>
                <div className="flex flex-wrap gap-1.5">
                  {(volunteer.skills || []).map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 bg-white border border-slate-300 text-slate-800 rounded-md font-medium text-[11px]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">Educational Attainment</span>
                  <span className="font-semibold text-slate-800">{volunteer.educationLevel}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Special Talents / Certifications</span>
                  <span className="text-slate-800 font-medium">{volunteer.specialTalentsOrCertifications || '—'}</span>
                </div>
              </div>

              {volunteer.priorVolunteerExperience && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block text-[11px]">Prior Volunteer / NGO Experience</span>
                  <p className="text-slate-700 mt-0.5 leading-relaxed">{volunteer.priorVolunteerExperience}</p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 5: Health, Safety & Reasonable Accommodations */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Stethoscope className="w-4 h-4 text-emerald-700" />
              <span>5. Health, Safety &amp; Reasonable Accommodations</span>
            </h2>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-slate-400 block text-[11px]">Blood Type</span>
                  <span className="font-bold text-slate-900 text-sm">{volunteer.bloodType || 'Unknown'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[11px]">Medical Conditions or Allergies</span>
                  <span className="text-slate-800 font-medium">{volunteer.medicalConditionsOrAllergies || 'None declared'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">Dietary / Physical Limitations</span>
                  <span className="text-slate-800">{volunteer.dietaryOrPhysicalLimitations || 'None'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Requested Field Accommodations</span>
                  <span className="text-slate-800">{volunteer.reasonableAccommodations || 'None required'}</span>
                </div>
              </div>

              {/* Safeguarding Badges */}
              <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block text-[11px]">Child Protection Policy</span>
                    <span className="text-emerald-700 font-semibold text-[10.5px]">Signed &amp; Compliant</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block text-[11px]">Volunteer Service Waiver</span>
                    <span className="text-emerald-700 font-semibold text-[10.5px]">Acknowledged &amp; Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: Character References */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
              <Users2 className="w-4 h-4 text-emerald-700" />
              <span>6. Character References (Non-Family)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {(volunteer.characterReferences || []).map((ref, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{ref.name}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Ref #{idx + 1}</span>
                  </div>
                  <p className="text-slate-600">
                    {ref.relationship} · <strong className="text-slate-700">{ref.organization}</strong>
                  </p>
                  <p className="font-mono text-slate-700 text-[11px]">Phone: {ref.phone}</p>
                  {ref.email && <p className="text-slate-500 text-[11px]">{ref.email}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Document Sign-off Footer */}
          <div className="pt-8 border-t-2 border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-800">NGO Data Tracker · Humanitarian Operations</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Archived locally on workstation server · C:\WebApp Data\vineyard_masterlist.json
              </p>
            </div>
            <div className="text-right">
              <div className="w-48 border-b border-slate-400 mb-1 ml-auto"></div>
              <p className="font-bold text-slate-800">{volunteer.enrolledByOfficer}</p>
              <p className="text-[10px] text-slate-400">Enrolling Project Officer Sign-off</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
