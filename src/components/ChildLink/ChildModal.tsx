import React, { useState, useEffect } from 'react';
import { ChildBeneficiary } from '../../types';
import {
  X,
  Save,
  User,
  Calendar,
  GraduationCap,
  Home,
  HeartHandshake,
  ShieldCheck,
  MapPin,
  Plus,
  Check,
  Camera,
  Upload,
  HardDrive,
  Cloud,
  Link as LinkIcon,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { DEFAULT_COMMUNITIES, getStoredCommunities, addStoredCommunity } from '../../utils/storage';
import { normalizePhotoUrl } from '../../utils/photoUtils';

interface ChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (child: ChildBeneficiary) => void;
  initialChild?: ChildBeneficiary | null;
  existingCount: number;
  communities?: string[];
  onAddCommunity?: (newArea: string) => void;
}

export const ChildModal: React.FC<ChildModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialChild,
  existingCount,
  communities: propCommunities,
  onAddCommunity,
}) => {
  const [availableCommunities, setAvailableCommunities] = useState<string[]>(
    propCommunities || DEFAULT_COMMUNITIES
  );
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [newAreaInput, setNewAreaInput] = useState('');
  const [areaError, setAreaError] = useState<string | null>(null);

  // Photo upload states (Local file vs Google Drive)
  const [photoUploadTab, setPhotoUploadTab] = useState<'local' | 'drive'>('local');
  const [driveUrlInput, setDriveUrlInput] = useState('');
  const [driveUrlError, setDriveUrlError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<ChildBeneficiary>>({
    beneficiaryName: '',
    beneficiaryCode: '',
    nickname: '',
    bday: '',
    age: 0,
    gradeLevel: 'Grade 1',
    favoriteSubject: '',
    householdChores: '',
    siblings: '',
    fatherNameOccupation: '',
    motherNameOccupation: '',
    briefHistoryOfFamily: '',
    status: 'available',
    sponsorName: '',
    sponsorCode: '',
    communityCluster: 'Brgy. Langkiwa, Binan, Laguna',
    mediaReleaseFormSigned: true,
    childProtectionPolicySigned: true,
    photoUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loaded = propCommunities && propCommunities.length > 0 ? propCommunities : getStoredCommunities();
    setAvailableCommunities(loaded);
  }, [propCommunities, isOpen]);

  useEffect(() => {
    setIsAddingArea(false);
    setNewAreaInput('');
    setAreaError(null);

    if (initialChild) {
      setFormData({
        ...initialChild,
        photoUrl: initialChild.photoUrl || '',
        mediaReleaseFormSigned: initialChild.mediaReleaseFormSigned ?? initialChild.consentSigned ?? true,
        childProtectionPolicySigned: initialChild.childProtectionPolicySigned ?? true,
      });
    } else {
      // Auto-generate next beneficiary code
      const nextNum = String(existingCount + 1).padStart(3, '0');
      const currentYear = new Date().getFullYear();
      const defaultCommunity =
        (availableCommunities && availableCommunities[0]) || DEFAULT_COMMUNITIES[0];

      setFormData({
        beneficiaryName: '',
        beneficiaryCode: `VIN-CL-${currentYear}-${nextNum}`,
        nickname: '',
        bday: '2016-01-01',
        age: 8,
        gradeLevel: 'Grade 3',
        favoriteSubject: '',
        householdChores: '',
        siblings: '',
        fatherNameOccupation: '',
        motherNameOccupation: '',
        briefHistoryOfFamily: '',
        status: 'available',
        sponsorName: '',
        sponsorCode: '',
        communityCluster: defaultCommunity,
        mediaReleaseFormSigned: true,
        childProtectionPolicySigned: true,
        photoUrl: '',
      });
    }
    setErrors({});
  }, [initialChild, existingCount, isOpen, availableCommunities]);

  if (!isOpen) return null;

  // Handle Birthday change to calculate Age automatically
  const handleBdayChange = (bdayVal: string) => {
    let calcAge = formData.age || 0;
    if (bdayVal) {
      const birth = new Date(bdayVal);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      if (age >= 0 && age <= 25) {
        calcAge = age;
      }
    }
    setFormData((prev) => ({
      ...prev,
      bday: bdayVal,
      age: calcAge,
    }));
  };

  const handleLocalPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setFormData((prev) => ({ ...prev, photoUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleApplyDriveUrl = () => {
    const trimmed = driveUrlInput.trim();
    if (!trimmed) {
      setDriveUrlError('Please enter a Google Drive link or image URL.');
      return;
    }
    const normalized = normalizePhotoUrl(trimmed);
    setFormData((prev) => ({ ...prev, photoUrl: normalized }));
    setDriveUrlInput('');
    setDriveUrlError(null);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.beneficiaryName?.trim()) errs.beneficiaryName = 'Beneficiary Name is required';
    if (!formData.beneficiaryCode?.trim()) errs.beneficiaryCode = 'Beneficiary Code is required';
    if (!formData.bday) errs.bday = 'Birthday is required';
    if (formData.age === undefined || formData.age < 0) errs.age = 'Valid Age is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleQuickAddArea = () => {
    const trimmed = newAreaInput.trim();
    if (!trimmed) {
      setAreaError('Please enter an area name.');
      return;
    }
    const exists = availableCommunities.some(
      (c) => c.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setAreaError('This area is already in the options list.');
      return;
    }

    const updated = addStoredCommunity(trimmed);
    setAvailableCommunities(updated);
    if (onAddCommunity) onAddCommunity(trimmed);
    setFormData((prev) => ({ ...prev, communityCluster: trimmed }));
    setIsAddingArea(false);
    setNewAreaInput('');
    setAreaError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const childRecord: ChildBeneficiary = {
      id: initialChild?.id || `ch-${Date.now()}`,
      beneficiaryName: formData.beneficiaryName || '',
      beneficiaryCode: formData.beneficiaryCode || '',
      nickname: formData.nickname || '',
      bday: formData.bday || '',
      age: Number(formData.age) || 0,
      gradeLevel: formData.gradeLevel || 'Grade 1',
      favoriteSubject: formData.favoriteSubject || '',
      householdChores: formData.householdChores || '',
      siblings: formData.siblings || '',
      fatherNameOccupation: formData.fatherNameOccupation || '',
      motherNameOccupation: formData.motherNameOccupation || '',
      briefHistoryOfFamily: formData.briefHistoryOfFamily || '',
      status: formData.status || 'available',
      sponsorName: formData.status === 'sponsored' ? formData.sponsorName : undefined,
      sponsorCode: formData.status === 'sponsored' ? formData.sponsorCode : undefined,
      communityCluster: formData.communityCluster || 'General Community',
      mediaReleaseFormSigned: Boolean(formData.mediaReleaseFormSigned),
      childProtectionPolicySigned: Boolean(formData.childProtectionPolicySigned),
      consentSigned: Boolean(formData.mediaReleaseFormSigned),
      photoUrl: formData.photoUrl || '',
      createdAt: initialChild?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(childRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {initialChild ? 'Edit Beneficiary Record' : 'Enroll New Beneficiary'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Beneficiaries Masterlist · All data stays stored securely on local server
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-sm">
          
          {/* Dedicated Photo Upload Section (Local File or Google Drive) */}
          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
                <Camera className="w-4 h-4 text-emerald-700" />
                <span>Beneficiary Photo (Local File or Google Drive)</span>
              </div>
              {formData.photoUrl && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Check className="w-3 h-3 text-emerald-700" />
                  <span>Photo Attached</span>
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              {/* Photo Preview Thumbnail */}
              <div className="w-28 h-28 rounded-xl border border-slate-300 bg-white overflow-hidden shrink-0 flex flex-col items-center justify-center relative shadow-2xs group">
                {formData.photoUrl ? (
                  <>
                    <img
                      src={formData.photoUrl}
                      alt={formData.beneficiaryName || 'Beneficiary Photo'}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // Fallback on error
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, photoUrl: '' })}
                      title="Remove Photo"
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                    <ImageIcon className="w-8 h-8 text-slate-300 mb-1" />
                    <span className="text-[10px] font-semibold text-slate-500">No Photo</span>
                  </div>
                )}
              </div>

              {/* Upload Controls: Local File or Google Drive */}
              <div className="flex-1 w-full space-y-2.5">
                {/* Method Switcher Tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-lg text-xs w-fit">
                  <button
                    type="button"
                    onClick={() => setPhotoUploadTab('local')}
                    className={`flex items-center gap-1.5 px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                      photoUploadTab === 'local'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <HardDrive className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Upload Local File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoUploadTab('drive')}
                    className={`flex items-center gap-1.5 px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                      photoUploadTab === 'drive'
                        ? 'bg-white text-blue-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Cloud className="w-3.5 h-3.5 text-blue-600" />
                    <span>Google Drive Link</span>
                  </button>
                </div>

                {photoUploadTab === 'local' ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Choose Photo from Computer</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLocalPhotoUpload}
                          className="hidden"
                        />
                      </label>
                      {formData.photoUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, photoUrl: '' })}
                          className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Supports JPG, PNG, WEBP. Converted and stored directly on your local offline machine.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-1.5">
                      <div className="relative flex-1">
                        <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Paste Google Drive link (e.g. https://drive.google.com/file/d/FILE_ID/view...)"
                          value={driveUrlInput}
                          onChange={(e) => {
                            setDriveUrlInput(e.target.value);
                            if (driveUrlError) setDriveUrlError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyDriveUrl();
                            }
                          }}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyDriveUrl}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors shrink-0 shadow-2xs"
                      >
                        Apply Link
                      </button>
                    </div>
                    {driveUrlError && (
                      <p className="text-[11px] text-rose-600 font-medium">{driveUrlError}</p>
                    )}
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Accepts Google Drive share URLs or direct image links. Ensure the file sharing in Google Drive is set to &ldquo;Anyone with the link can view&rdquo;.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 1: Core Child Information */}
          <div>
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-100 text-emerald-800 font-semibold text-xs tracking-wider uppercase">
              <User className="w-4 h-4 text-emerald-600" />
              <span>1. Child Identification &amp; Identity</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Beneficiary Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jasmine Alcantara Dela Cruz"
                  value={formData.beneficiaryName}
                  onChange={(e) => setFormData({ ...formData, beneficiaryName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {errors.beneficiaryName && (
                  <p className="text-xs text-rose-500 mt-0.5">{errors.beneficiaryName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Beneficiary Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIN-CL-2024-001"
                  value={formData.beneficiaryCode}
                  onChange={(e) => setFormData({ ...formData, beneficiaryCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {errors.beneficiaryCode && (
                  <p className="text-xs text-rose-500 mt-0.5">{errors.beneficiaryCode}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nickname
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jas"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  B-day (Birthdate) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.bday}
                  onChange={(e) => handleBdayChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
                {errors.bday && <p className="text-xs text-rose-500 mt-0.5">{errors.bday}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  AGE <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
                {errors.age && <p className="text-xs text-rose-500 mt-0.5">{errors.age}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Grade Level
                </label>
                <select
                  value={formData.gradeLevel}
                  onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white"
                >
                  <option value="Pre-Kinder">Pre-Kinder</option>
                  <option value="Kindergarten">Kindergarten</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 6">Grade 6</option>
                  <option value="Grade 7">Grade 7 (JHS)</option>
                  <option value="Grade 8">Grade 8 (JHS)</option>
                  <option value="Grade 9">Grade 9 (JHS)</option>
                  <option value="Grade 10">Grade 10 (JHS)</option>
                  <option value="Grade 11">Grade 11 (SHS)</option>
                  <option value="Grade 12">Grade 12 (SHS)</option>
                  <option value="College / Vocational">College / Vocational</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Education & Household Responsibilities */}
          <div>
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-100 text-emerald-800 font-semibold text-xs tracking-wider uppercase">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>2. Interests & Daily Responsibilities</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Favorite subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Science, Mathematics, English Reading"
                  value={formData.favoriteSubject}
                  onChange={(e) => setFormData({ ...formData, favoriteSubject: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Household chores
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sweeping yard, washing dishes, fetching water"
                  value={formData.householdChores}
                  onChange={(e) => setFormData({ ...formData, householdChores: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Family Profile & Household History */}
          <div>
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-100 text-emerald-800 font-semibold text-xs tracking-wider uppercase">
              <Home className="w-4 h-4 text-emerald-600" />
              <span>3. Family Profile & History</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Father’s Name / Occupation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Eduardo Dela Cruz / Tricycle Driver"
                  value={formData.fatherNameOccupation}
                  onChange={(e) => setFormData({ ...formData, fatherNameOccupation: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mother’s Name / Occupation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maria Dela Cruz / Market Vendor & Laundress"
                  value={formData.motherNameOccupation}
                  onChange={(e) => setFormData({ ...formData, motherNameOccupation: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Siblings (Count & Details)
              </label>
              <input
                type="text"
                placeholder="e.g. 3 siblings: Carlos (14), Marco (11), Baby Mia (2)"
                value={formData.siblings}
                onChange={(e) => setFormData({ ...formData, siblings: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brief History of the Family <span className="text-slate-400 font-normal">(Living condition, vulnerability background, relocation or disaster exposure)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Describe living circumstances, income stability, vulnerabilities or emergency displacement history..."
                value={formData.briefHistoryOfFamily}
                onChange={(e) => setFormData({ ...formData, briefHistoryOfFamily: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs leading-relaxed"
              />
            </div>
          </div>

          {/* Section 4: Operational Sponsorship & Privacy Compliance */}
          <div>
            <div className="flex items-center gap-2 pb-2 mb-3 border-b border-slate-100 text-emerald-800 font-semibold text-xs tracking-wider uppercase">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>4. Sponsorship & Privacy Compliance</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sponsorship Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white font-medium"
                >
                  <option value="available">Available (Needs Sponsor)</option>
                  <option value="sponsored">Sponsored (Active)</option>
                  <option value="graduated">Graduated / Transitioned</option>
                  <option value="inactive">Inactive / Case Relocated</option>
                </select>
              </div>

              <div className={formData.status === 'sponsored' ? 'sm:col-span-1' : 'sm:col-span-2'}>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Classification of Community <span className="text-rose-500">*</span>
                  </label>
                  {!isAddingArea && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingArea(true);
                        setAreaError(null);
                        setNewAreaInput('');
                      }}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer hover:underline"
                      title="Add a new community area for future reference"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Additional Area</span>
                    </button>
                  )}
                </div>

                {!isAddingArea ? (
                  <div className="relative">
                    <select
                      value={formData.communityCluster}
                      onChange={(e) => setFormData({ ...formData, communityCluster: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs bg-white font-medium"
                    >
                      {availableCommunities.map((area, idx) => (
                        <option key={area} value={area}>
                          {idx + 1}. {area}
                        </option>
                      ))}
                      {/* Preserve custom non-listed value if editing */}
                      {formData.communityCluster &&
                        !availableCommunities.includes(formData.communityCluster) && (
                          <option value={formData.communityCluster}>
                            {formData.communityCluster} (Custom Area)
                          </option>
                        )}
                    </select>
                  </div>
                ) : (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-700" />
                        <span>Add New Community Area:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingArea(false);
                          setAreaError(null);
                        }}
                        className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        autoFocus
                        placeholder="e.g. Sitio Bagong Silang, Rodriguez, Rizal"
                        value={newAreaInput}
                        onChange={(e) => {
                          setNewAreaInput(e.target.value);
                          if (areaError) setAreaError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleQuickAddArea();
                          }
                        }}
                        className="flex-1 px-2.5 py-1.5 text-xs bg-white rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleQuickAddArea}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-md cursor-pointer flex items-center gap-1 shrink-0 shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    </div>
                    {areaError && (
                      <p className="text-[11px] text-rose-600 font-semibold">{areaError}</p>
                    )}
                  </div>
                )}
              </div>

              {formData.status === 'sponsored' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Sponsor Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Gregory Vance"
                    value={formData.sponsorName || ''}
                    onChange={(e) => setFormData({ ...formData, sponsorName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>
              )}
            </div>

            {/* Media Release Form and Child Protection Policy */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Safeguarding & Policy Forms</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100/50 transition-colors">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.mediaReleaseFormSigned}
                      onChange={(e) =>
                        setFormData({ ...formData, mediaReleaseFormSigned: e.target.checked })
                      }
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Media Release Form
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block leading-normal">
                        Signed guardian authorization permitting program photography and video documentation for reporting and sponsor communication.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100/50 transition-colors">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.childProtectionPolicySigned}
                      onChange={(e) =>
                        setFormData({ ...formData, childProtectionPolicySigned: e.target.checked })
                      }
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Child Protection Policy
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block leading-normal">
                        Signed guardian compliance acknowledgment of the Child Protection Policy and safeguarding code of conduct.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-colors cursor-pointer text-xs font-bold shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{initialChild ? 'Update Masterlist Record' : 'Save Beneficiary'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
