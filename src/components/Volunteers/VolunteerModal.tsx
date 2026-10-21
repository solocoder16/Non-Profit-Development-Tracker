import React, { useState, useEffect } from 'react';
import {
  VolunteerProfile,
  VolunteerEngagementType,
  VolunteerStatus,
  CharacterReference,
} from '../../types';
import {
  X,
  Save,
  User,
  HeartHandshake,
  Phone,
  AlertCircle,
  Calendar,
  Sparkles,
  Camera,
  Upload,
  HardDrive,
  Cloud,
  Link as LinkIcon,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Award,
  Stethoscope,
  Users2,
  Briefcase,
  MapPin,
  Clock,
  Plus,
} from 'lucide-react';
import { normalizePhotoUrl, readFileAsDataUrl, sanitizeImageUrl } from '../../utils/photoUtils';

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (volunteer: VolunteerProfile) => void;
  initialVolunteer?: VolunteerProfile | null;
  communities: string[];
  enrollingOfficerName?: string;
}

const VOLUNTEER_TRACK_OPTIONS = [
  'ChildLink Tutoring & Mentorship',
  'CVA Citizen Advocacy & Scorecards',
  'EiE Emergency Learning & Relief',
  'Medical & First Aid',
  'Relief Logistics & Packing',
  'Event Facilitation & Community Outreach',
  'Documentation, Media & Photography',
  'Disaster Response & Triage',
];

const SKILL_OPTIONS = [
  'Teaching & Tutoring',
  'First Aid / Medical',
  'Logistics & Driving',
  'Event Facilitation',
  'Photography & Video',
  'Cooking & Relief Packing',
  'Data Entry & Admin',
  'Counseling / Psycho-social',
  'Public Speaking & Facilitation',
  'Language & Dialect Translation',
];

const DAY_OPTIONS = [
  'Weekdays (Mon-Fri)',
  'Weekends (Sat-Sun)',
  'Saturdays',
  'Sundays',
  'Flexible / On-Call',
];

export const VolunteerModal: React.FC<VolunteerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialVolunteer,
  communities,
  enrollingOfficerName = 'Jericho (Project Officer)',
}) => {
  const isEditing = Boolean(initialVolunteer);

  // SECTION 1: VOLUNTEER PROFILE
  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [volunteerCode, setVolunteerCode] = useState('');
  const [gender, setGender] = useState('Female');
  const [birthdate, setBirthdate] = useState('1998-05-15');
  const [age, setAge] = useState(26);
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [barangayCommunity, setBarangayCommunity] = useState('');
  const [occupation, setOccupation] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [engagementType, setEngagementType] = useState<VolunteerEngagementType>('long_term');
  const [status, setStatus] = useState<VolunteerStatus>('active');
  const [enrollmentDate, setEnrollmentDate] = useState(new Date().toISOString().slice(0, 10));

  // Photo controls
  const [photoUploadTab, setPhotoUploadTab] = useState<'local' | 'drive'>('local');
  const [driveUrlInput, setDriveUrlInput] = useState('');
  const [driveUrlError, setDriveUrlError] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [photoLoadError, setPhotoLoadError] = useState(false);

  // SECTION 2: EMERGENCY CONTACT INFORMATION
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencySecondaryPhone, setEmergencySecondaryPhone] = useState('');
  const [emergencyAddress, setEmergencyAddress] = useState('');

  // SECTION 3: VOLUNTEER TRACK INTEREST AND AVAILABILITY
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [availabilityHours, setAvailabilityHours] = useState('4-6 hours/week');
  const [availabilityNotes, setAvailabilityNotes] = useState('');

  // SECTION 4: SKILLS BACKGROUND
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [educationLevel, setEducationLevel] = useState('College Graduate');
  const [priorExperience, setPriorExperience] = useState('');
  const [specialCertifications, setSpecialCertifications] = useState('');

  // SECTION 5: HEALTH SAFETY AND REASONABLE ACCOMODATIONS
  const [bloodType, setBloodType] = useState('O+');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [dietaryOrPhysical, setDietaryOrPhysical] = useState('');
  const [accommodations, setAccommodations] = useState('');
  const [childProtectionAgreed, setChildProtectionAgreed] = useState(true);
  const [waiverSigned, setWaiverSigned] = useState(true);

  // SECTION 6: CHARACTER REFERENCES
  const [references, setReferences] = useState<CharacterReference[]>([
    { name: '', relationship: '', organization: '', phone: '', email: '' },
    { name: '', relationship: '', organization: '', phone: '', email: '' },
  ]);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Auto calculate age from birthdate
  const handleBirthdateChange = (val: string) => {
    setBirthdate(val);
    if (val) {
      const birth = new Date(val);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        calculatedAge--;
      }
      if (!isNaN(calculatedAge) && calculatedAge >= 0) {
        setAge(calculatedAge);
      }
    }
  };

  useEffect(() => {
    if (initialVolunteer) {
      setFullName(initialVolunteer.fullName || '');
      setPreferredName(initialVolunteer.preferredName || '');
      setVolunteerCode(initialVolunteer.volunteerCode || '');
      setGender(initialVolunteer.gender || 'Female');
      setBirthdate(initialVolunteer.birthdate || '1998-05-15');
      setAge(initialVolunteer.age || 26);
      setContactNumber(initialVolunteer.contactNumber || '');
      setEmail(initialVolunteer.email || '');
      setAddress(initialVolunteer.address || '');
      setBarangayCommunity(initialVolunteer.barangayCommunity || (communities[0] || ''));
      setOccupation(initialVolunteer.occupation || '');
      setPhotoUrl(initialVolunteer.photoUrl || '');
      setPhotoLoadError(false);
      setEngagementType(initialVolunteer.engagementType || 'long_term');
      setStatus(initialVolunteer.status || 'active');
      setEnrollmentDate(initialVolunteer.enrollmentDate || new Date().toISOString().slice(0, 10));

      // Emergency
      setEmergencyName(initialVolunteer.emergencyContact?.name || '');
      setEmergencyRelationship(initialVolunteer.emergencyContact?.relationship || '');
      setEmergencyPhone(initialVolunteer.emergencyContact?.primaryPhone || '');
      setEmergencySecondaryPhone(initialVolunteer.emergencyContact?.secondaryPhone || '');
      setEmergencyAddress(initialVolunteer.emergencyContact?.address || '');

      // Tracks & Availability
      setSelectedTracks(initialVolunteer.volunteerTracks || []);
      setSelectedDays(initialVolunteer.availabilityDays || []);
      setAvailabilityHours(initialVolunteer.availabilityHoursPerWeek || '4-6 hours/week');
      setAvailabilityNotes(initialVolunteer.notesOnAvailability || '');

      // Skills
      setSelectedSkills(initialVolunteer.skills || []);
      setEducationLevel(initialVolunteer.educationLevel || 'College Graduate');
      setPriorExperience(initialVolunteer.priorVolunteerExperience || '');
      setSpecialCertifications(initialVolunteer.specialTalentsOrCertifications || '');

      // Health
      setBloodType(initialVolunteer.bloodType || 'O+');
      setMedicalConditions(initialVolunteer.medicalConditionsOrAllergies || '');
      setDietaryOrPhysical(initialVolunteer.dietaryOrPhysicalLimitations || '');
      setAccommodations(initialVolunteer.reasonableAccommodations || '');
      setChildProtectionAgreed(Boolean(initialVolunteer.childProtectionPolicyAgreed));
      setWaiverSigned(Boolean(initialVolunteer.volunteerWaiverSigned));

      // References
      if (initialVolunteer.characterReferences && initialVolunteer.characterReferences.length > 0) {
        setReferences(initialVolunteer.characterReferences);
      } else {
        setReferences([
          { name: '', relationship: '', organization: '', phone: '', email: '' },
          { name: '', relationship: '', organization: '', phone: '', email: '' },
        ]);
      }
    } else {
      // New volunteer defaults
      const randomCode = `VIN-VOL-${new Date().getFullYear()}-${String(
        Math.floor(Math.random() * 900) + 100
      )}`;
      setFullName('');
      setPreferredName('');
      setVolunteerCode(randomCode);
      setGender('Female');
      setBirthdate('1998-05-15');
      setAge(26);
      setContactNumber('');
      setEmail('');
      setAddress('');
      setBarangayCommunity(communities[0] || 'Brgy. Langkiwa, Binan, Laguna');
      setOccupation('');
      setPhotoUrl('');
      setPhotoLoadError(false);
      setEngagementType('long_term');
      setStatus('active');
      setEnrollmentDate(new Date().toISOString().slice(0, 10));

      setEmergencyName('');
      setEmergencyRelationship('');
      setEmergencyPhone('');
      setEmergencySecondaryPhone('');
      setEmergencyAddress('');

      setSelectedTracks(['ChildLink Tutoring & Mentorship']);
      setSelectedDays(['Saturdays']);
      setAvailabilityHours('4-6 hours/week');
      setAvailabilityNotes('');

      setSelectedSkills(['Teaching & Tutoring', 'Event Facilitation']);
      setEducationLevel('College Graduate');
      setPriorExperience('');
      setSpecialCertifications('');

      setBloodType('O+');
      setMedicalConditions('None');
      setDietaryOrPhysical('None');
      setAccommodations('');
      setChildProtectionAgreed(true);
      setWaiverSigned(true);

      setReferences([
        { name: '', relationship: '', organization: '', phone: '', email: '' },
        { name: '', relationship: '', organization: '', phone: '', email: '' },
      ]);
    }
    setFormErrors({});
  }, [initialVolunteer, isOpen, communities]);

  if (!isOpen) return null;

  // Local photo upload
  const handleLocalPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingPhoto(true);
      const dataUrl = await readFileAsDataUrl(file, 1000, 1000, 0.85);
      setPhotoUrl(dataUrl);
      setPhotoLoadError(false);
    } catch (err) {
      console.error('Failed reading photo file:', err);
    } finally {
      setIsProcessingPhoto(false);
      e.target.value = '';
    }
  };

  // Google Drive photo apply
  const handleApplyDriveUrl = () => {
    const trimmed = driveUrlInput.trim();
    if (!trimmed) {
      setDriveUrlError('Please paste a valid Google Drive URL.');
      return;
    }
    const sanitized = sanitizeImageUrl(trimmed);
    if (!sanitized) {
      setDriveUrlError('Please enter a valid HTTP, HTTPS, or Google Drive photo link.');
      return;
    }
    setPhotoUrl(sanitized);
    setPhotoLoadError(false);
    setDriveUrlInput('');
    setDriveUrlError(null);
  };

  const toggleTrack = (track: string) => {
    if (selectedTracks.includes(track)) {
      setSelectedTracks(selectedTracks.filter((t) => t !== track));
    } else {
      setSelectedTracks([...selectedTracks, track]);
    }
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
      setCustomSkillInput('');
    }
  };

  const handleReferenceChange = (index: number, field: keyof CharacterReference, val: string) => {
    const updated = [...references];
    updated[index] = { ...updated[index], [field]: val };
    setReferences(updated);
  };

  const handleAddReference = () => {
    setReferences([
      ...references,
      { name: '', relationship: '', organization: '', phone: '', email: '' },
    ]);
  };

  const handleRemoveReference = (index: number) => {
    if (references.length > 1) {
      setReferences(references.filter((_, i) => i !== index));
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = 'Full Name is required.';
    if (!volunteerCode.trim()) errors.volunteerCode = 'Volunteer Code is required.';
    if (!contactNumber.trim()) errors.contactNumber = 'Contact Phone Number is required.';
    if (!emergencyName.trim()) errors.emergencyName = 'Emergency Contact Name is required.';
    if (!emergencyPhone.trim()) errors.emergencyPhone = 'Emergency Contact Phone is required.';
    if (!childProtectionAgreed) {
      errors.childProtection = 'Child Protection Policy agreement is mandatory.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const volunteerRecord: VolunteerProfile = {
      id: initialVolunteer?.id || `vol-${Date.now()}`,
      volunteerCode: volunteerCode.trim(),
      fullName: fullName.trim(),
      preferredName: preferredName.trim() || undefined,
      gender,
      birthdate,
      age: Number(age) || 0,
      contactNumber: contactNumber.trim(),
      email: email.trim(),
      address: address.trim(),
      barangayCommunity: barangayCommunity || communities[0] || 'General Community',
      occupation: occupation.trim(),
      photoUrl: photoUrl || '',

      // Choices: long_term vs one_time
      engagementType,
      status,
      enrolledByOfficer: initialVolunteer?.enrolledByOfficer || enrollingOfficerName,
      enrollmentDate,

      // Emergency Contact
      emergencyContact: {
        name: emergencyName.trim(),
        relationship: emergencyRelationship.trim(),
        primaryPhone: emergencyPhone.trim(),
        secondaryPhone: emergencySecondaryPhone.trim() || undefined,
        address: emergencyAddress.trim() || undefined,
      },

      // Tracks & Availability
      volunteerTracks: selectedTracks.length > 0 ? selectedTracks : ['General Community Support'],
      availabilityDays: selectedDays.length > 0 ? selectedDays : ['Flexible'],
      availabilityHoursPerWeek: availabilityHours.trim(),
      notesOnAvailability: availabilityNotes.trim(),

      // Skills Background
      skills: selectedSkills.length > 0 ? selectedSkills : ['Community Field Support'],
      educationLevel,
      priorVolunteerExperience: priorExperience.trim(),
      specialTalentsOrCertifications: specialCertifications.trim(),

      // Health Safety & Accommodations
      bloodType,
      medicalConditionsOrAllergies: medicalConditions.trim(),
      dietaryOrPhysicalLimitations: dietaryOrPhysical.trim(),
      reasonableAccommodations: accommodations.trim(),
      childProtectionPolicyAgreed: Boolean(childProtectionAgreed),
      volunteerWaiverSigned: Boolean(waiverSigned),

      // Character References
      characterReferences: references.filter((r) => r.name.trim().length > 0),

      createdAt: initialVolunteer?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(volunteerRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col text-sm">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                <HeartHandshake className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-800">
                {isEditing ? 'Edit Volunteer Record & Profile' : 'Enroll New Humanitarian Corps Volunteer'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Official officer enrollment portal for long-term and one-time event community volunteers.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-8 flex-1">
          
          {/* ========================================================================= */}
          {/* SECTION 1: VOLUNTEER PROFILE SECTION                                      */}
          {/* ========================================================================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  1. Volunteer Profile &amp; Identification
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Section 1 of 6</span>
            </div>

            {/* Engagement Type Choice (Long-Term vs One-Time Event) */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-emerald-950">
                Volunteer Engagement Commitment Type <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Long Term */}
                <label
                  className={`p-3.5 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                    engagementType === 'long_term'
                      ? 'border-emerald-600 bg-white shadow-xs'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="engagementType"
                    value="long_term"
                    checked={engagementType === 'long_term'}
                    onChange={() => setEngagementType('long_term')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900">
                      Long-Term Volunteer
                    </span>
                    <span className="block text-[11px] text-slate-600 mt-0.5 leading-normal">
                      Regular sustained service (weekly/monthly tutoring, social accountability monitoring, or recurring clinic sessions).
                    </span>
                  </div>
                </label>

                {/* One Time Event */}
                <label
                  className={`p-3.5 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                    engagementType === 'one_time'
                      ? 'border-emerald-600 bg-white shadow-xs'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="engagementType"
                    value="one_time"
                    checked={engagementType === 'one_time'}
                    onChange={() => setEngagementType('one_time')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900">
                      One-Time Event Volunteer
                    </span>
                    <span className="block text-[11px] text-slate-600 mt-0.5 leading-normal">
                      Specific disaster relief dispatch, holiday gift packing, emergency food kit distribution, or single medical outreach.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Photo Upload Section */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start gap-4">
              <div className="w-28 h-28 rounded-xl border border-slate-300 bg-white overflow-hidden shrink-0 flex flex-col items-center justify-center relative shadow-2xs group">
                {(() => {
                  const safePhoto = photoUrl ? sanitizeImageUrl(photoUrl) : '';
                  if (safePhoto && !photoLoadError) {
                    return (
                      <>
                        <img
                          src={safePhoto}
                          alt="Volunteer Photo"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={() => setPhotoLoadError(true)}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoUrl('');
                            setPhotoLoadError(false);
                          }}
                          title="Remove Photo"
                          className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    );
                  }
                  return (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                      <ImageIcon className="w-8 h-8 text-slate-300 mb-1" />
                      <span className="text-[10px] font-semibold text-slate-500">
                        {photoLoadError ? 'Image unavailable' : 'No Photo'}
                      </span>
                    </div>
                  );
                })()}
              </div>

              <div className="flex-1 w-full space-y-2">
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
                  <div className="space-y-1">
                    <label className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{isProcessingPhoto ? 'Uploading...' : 'Choose Photo from Computer'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLocalPhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10.5px] text-slate-500">
                      Supports JPG, PNG, WEBP. Scaled and saved locally for offline security.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex gap-1.5">
                      <div className="relative flex-1">
                        <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Paste Google Drive share link..."
                          value={driveUrlInput}
                          onChange={(e) => {
                            setDriveUrlInput(e.target.value);
                            if (driveUrlError) setDriveUrlError(null);
                          }}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyDriveUrl}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                    {driveUrlError && (
                      <p className="text-[10.5px] text-rose-600">{driveUrlError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Names & ID */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Volunteer Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Elena Santos"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold focus:ring-2 focus:ring-emerald-500"
                />
                {formErrors.fullName && (
                  <p className="text-xs text-rose-600 mt-1">{formErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Name / Nickname
                </label>
                <input
                  type="text"
                  placeholder="e.g. Elena"
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Codes, Status, Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Volunteer ID Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={volunteerCode}
                  onChange={(e) => setVolunteerCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Volunteer Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-semibold text-slate-800"
                >
                  <option value="active">Active (Deployable)</option>
                  <option value="on_call">On-Call (Emergency Only)</option>
                  <option value="inactive">Inactive / On Leave</option>
                  <option value="completed">Completed (Event Finished)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enrollment Date
                </label>
                <input
                  type="date"
                  value={enrollmentDate}
                  onChange={(e) => setEnrollmentDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>

            {/* Birthday, Age, Occupation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Birthdate
                </label>
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => handleBirthdateChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  min="15"
                  max="90"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Occupation / Profession
                </label>
                <input
                  type="text"
                  placeholder="e.g. Teacher, Nurse, IT Specialist, Student"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>

            {/* Contacts & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Contact Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0917-123-4567"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                />
                {formErrors.contactNumber && (
                  <p className="text-xs text-rose-600 mt-1">{formErrors.contactNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. volunteer@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Barangay / Community
                </label>
                <select
                  value={barangayCommunity}
                  onChange={(e) => setBarangayCommunity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-medium text-slate-800"
                >
                  {communities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Residential Address
              </label>
              <input
                type="text"
                placeholder="House #, Street, Phase, Barangay, City / Municipality"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2: EMERGENCY CONTACT INFORMATION                                  */}
          {/* ========================================================================= */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2. Emergency Contact Information
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Section 2 of 6</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Contact Person <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Roberto Santos"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
                />
                {formErrors.emergencyName && (
                  <p className="text-xs text-rose-600 mt-1">{formErrors.emergencyName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Relationship to Volunteer
                </label>
                <input
                  type="text"
                  placeholder="e.g. Parent, Spouse, Sibling"
                  value={emergencyRelationship}
                  onChange={(e) => setEmergencyRelationship(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Emergency Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0917-555-1234"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold"
                />
                {formErrors.emergencyPhone && (
                  <p className="text-xs text-rose-600 mt-1">{formErrors.emergencyPhone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Secondary Phone (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Landline or alternate mobile"
                  value={emergencySecondaryPhone}
                  onChange={(e) => setEmergencySecondaryPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Address / Location
                </label>
                <input
                  type="text"
                  placeholder="Same as volunteer address or specify"
                  value={emergencyAddress}
                  onChange={(e) => setEmergencyAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3: VOLUNTEER TRACK INTEREST AND AVAILABILITY                      */}
          {/* ========================================================================= */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  3. Volunteer Track Interest &amp; Availability
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Section 3 of 6</span>
            </div>

            {/* Track Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Program Tracks &amp; Deployment Areas of Interest
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {VOLUNTEER_TRACK_OPTIONS.map((track) => (
                  <label
                    key={track}
                    onClick={() => toggleTrack(track)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      selectedTracks.includes(track)
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTracks.includes(track)}
                      onChange={() => {}}
                      className="text-emerald-600 focus:ring-emerald-500 rounded"
                    />
                    <span>{track}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Days Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Availability Days
              </label>
              <div className="flex flex-wrap gap-2">
                {DAY_OPTIONS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      selectedDays.includes(day)
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Availability Commitment (Hours / Frequency)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4-6 hours/week, or full weekend on dispatch"
                  value={availabilityHours}
                  onChange={(e) => setAvailabilityHours(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Special Schedule Constraints / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Available only after 1:00 PM on Sundays"
                  value={availabilityNotes}
                  onChange={(e) => setAvailabilityNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 4: SKILLS BACKGROUND                                              */}
          {/* ========================================================================= */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  4. Skills Background &amp; Competencies
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Section 4 of 6</span>
            </div>

            {/* Skill Badges Checklist */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Core Humanitarian &amp; Technical Skills
              </label>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      selectedSkills.includes(skill)
                        ? 'bg-slate-900 text-white border-slate-900 font-bold'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              {/* Custom Skill Input */}
              <div className="flex gap-2 mt-2 max-w-sm">
                <input
                  type="text"
                  placeholder="Add custom skill or talent..."
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSkill();
                    }
                  }}
                  className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Add
                </button>
              </div>

              {selectedSkills.filter((s) => !SKILL_OPTIONS.includes(s)).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSkills
                    .filter((s) => !SKILL_OPTIONS.includes(s))
                    .map((customSkill) => (
                      <span
                        key={customSkill}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-950 border border-emerald-300 text-xs font-semibold"
                      >
                        <span>{customSkill}</span>
                        <button
                          type="button"
                          onClick={() => toggleSkill(customSkill)}
                          className="text-emerald-700 hover:text-rose-600 cursor-pointer ml-1"
                          title="Remove custom skill"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Highest Educational Attainment
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                >
                  <option value="Post-Graduate / Masteral / Doctorate">Post-Graduate / Masteral / Doctorate</option>
                  <option value="College Graduate (Bachelor Degree)">College Graduate (Bachelor Degree)</option>
                  <option value="College Undergraduate">College Undergraduate</option>
                  <option value="Vocational / Technical Diploma">Vocational / Technical Diploma</option>
                  <option value="Senior High School">Senior High School</option>
                  <option value="Junior High School">Junior High School</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Special Talents / Professional Certifications
                </label>
                <input
                  type="text"
                  placeholder="e.g. Licensed Teacher (LPT), BLS/CPR Certified, Professional Driver"
                  value={specialCertifications}
                  onChange={(e) => setSpecialCertifications(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prior Volunteer or NGO Experience
              </label>
              <textarea
                rows={2}
                placeholder="Mention previous volunteer work with community groups, disaster response, church missions, or civic organizations..."
                value={priorExperience}
                onChange={(e) => setPriorExperience(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 5: HEALTH SAFETY AND REASONABLE ACCOMODATIONS                      */}
          {/* ========================================================================= */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  5. Health, Safety &amp; Reasonable Accommodations
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Section 5 of 6</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Type</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-bold"
                >
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Medical Conditions, Allergies, or Health Precautions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Asthma (carries inhaler), Penicillin allergy, Hypertension, or None"
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dietary or Physical Limitations
                </label>
                <input
                  type="text"
                  placeholder="e.g. Halal, Vegetarian, No heavy lifting over 15kg"
                  value={dietaryOrPhysical}
                  onChange={(e) => setDietaryOrPhysical(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reasonable Field Accommodations Needed
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ground-floor stations, shaded area, rest breaks during hot hours"
                  value={accommodations}
                  onChange={(e) => setAccommodations(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>

            {/* Safeguarding & Compliance Checkboxes */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={childProtectionAgreed}
                  onChange={(e) => setChildProtectionAgreed(e.target.checked)}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500 rounded cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">
                    Child Protection Policy &amp; Zero-Tolerance Code of Conduct Agreement <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-slate-500 block mt-0.5">
                    Volunteer has read, acknowledged, and agreed to adhere to the organization's Child Safeguarding protocols during all community engagements.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={waiverSigned}
                  onChange={(e) => setWaiverSigned(e.target.checked)}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500 rounded cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">
                    Volunteer Service Liability Waiver &amp; Data Privacy Acknowledgment
                  </span>
                  <span className="text-slate-500 block mt-0.5">
                    Consent to field deployment conditions and adherence to RA 10173 (Philippine Data Privacy Act) regarding confidential beneficiary data.
                  </span>
                </div>
              </label>
              {formErrors.childProtection && (
                <p className="text-xs text-rose-600 font-bold">{formErrors.childProtection}</p>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 6: CHARACTER REFERENCES                                           */}
          {/* ========================================================================= */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Users2 className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  6. Character References (Non-Family Members)
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddReference}
                className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Reference</span>
              </button>
            </div>

            <div className="space-y-4">
              {references.map((ref, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Reference #{idx + 1}
                    </span>
                    {references.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveReference(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Remove reference"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                        Reference Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Principal Anita Reyes"
                        value={ref.name}
                        onChange={(e) => handleReferenceChange(idx, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                        Relationship to Volunteer
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Supervisor, Pastor, Professor, Community Leader"
                        value={ref.relationship}
                        onChange={(e) => handleReferenceChange(idx, 'relationship', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                        Organization / Affiliation
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. DepEd Binan, Church, Barangay Hall"
                        value={ref.organization}
                        onChange={(e) => handleReferenceChange(idx, 'organization', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                        Contact Phone Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 0919-445-1200"
                        value={ref.phone}
                        onChange={(e) => handleReferenceChange(idx, 'phone', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Enrolling Project Officer: <strong className="text-slate-800">{enrollingOfficerName}</strong>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-colors text-xs font-bold shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Save Volunteer Updates' : 'Complete Volunteer Enrollment'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
