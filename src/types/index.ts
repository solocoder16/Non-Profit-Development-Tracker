export interface ChildBeneficiary {
  id: string;
  beneficiaryName: string;
  beneficiaryCode: string;
  nickname: string;
  bday: string; // YYYY-MM-DD
  age: number;
  gradeLevel: string;
  favoriteSubject: string;
  householdChores: string;
  siblings: string;
  fatherNameOccupation: string;
  motherNameOccupation: string;
  briefHistoryOfFamily: string;
  
  // Operational & Sponsorship attributes
  status: 'sponsored' | 'available' | 'graduated' | 'inactive';
  sponsorName?: string;
  sponsorCode?: string;
  communityCluster: string;
  mediaReleaseFormSigned: boolean;
  childProtectionPolicySigned: boolean;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;

  // Backward compatibility
  consentSigned?: boolean;
  medicalOrNutritionNotes?: string;
}

export type PolicyDocumentType = 'data_privacy_policy' | 'employee_safety_policy' | 'child_protection_policy';

export interface PolicyDocument {
  id: PolicyDocumentType;
  title: string;
  category: string;
  description: string;
  fileName?: string;
  fileSizeBytes?: number;
  fileSizeFormatted?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  fileDataUrl?: string;
  fileType?: string;
}

export interface DonationRecord {
  id: string;
  receiptNo: string;
  donorName: string;
  donorCode: string;
  donorEmail: string;
  donorCategory: 'individual' | 'corporate' | 'partner_ngo' | 'faith_community';
  isAnonymous: boolean;
  amount: number;
  currency: 'PHP' | 'USD';
  allocationType: 'child_sponsorship' | 'cva_fund' | 'eie_fund' | 'general_relief';
  linkedBeneficiaryId?: string;
  linkedBeneficiaryName?: string;
  date: string;
  paymentMethod: 'bank_transfer' | 'cash' | 'check' | 'remittance' | 'in_kind';
  status: 'verified' | 'pending_verification' | 'in_kind_logged';
  notes: string;
  receivedBy: string;
}

export interface MetricItem {
  label: string;
  value: string;
  unit?: string;
}

export interface CommunityReport {
  id: string;
  title: string;
  slug: string;
  program: 'cva' | 'eie' | 'integrated';
  date: string;
  location: string;
  officerName: string;
  officerRole: string;
  summary: string;
  coverImage: string;
  metrics: MetricItem[];
  situationOverview: string;
  actionTaken: string;
  challengesAndAdaptations: string;
  communityVoiceQuote: {
    quote: string;
    author: string;
    role: string;
  };
  photoGallery: {
    url: string;
    caption: string;
  }[];
  tags: string[];
  status: 'published' | 'draft';
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action:
    | 'view_child'
    | 'create_child'
    | 'update_child'
    | 'delete_child'
    | 'create_donation'
    | 'export_backup'
    | 'import_backup'
    | 'toggle_privacy'
    | 'security_login'
    | 'upload_policy'
    | 'delete_policy'
    | 'delete_report'
    | 'create_report'
    | 'create_volunteer'
    | 'update_volunteer'
    | 'delete_volunteer';
  details: string;
  officer: string;
}

export type UserRole = 'project_officer' | 'field_enumerator' | 'auditor';

export interface SecuritySettings {
  isLocked: boolean;
  pinCode: string;
  autoLockMinutes: number;
  privacyMode: boolean;
  currentRole: UserRole;
  dataPrivacyDisclaimerAccepted: boolean;
  policies?: PolicyDocument[];
}

export type VolunteerEngagementType = 'long_term' | 'one_time';
export type VolunteerStatus = 'active' | 'on_call' | 'inactive' | 'completed';

export interface EmergencyContact {
  name: string;
  relationship: string;
  primaryPhone: string;
  secondaryPhone?: string;
  address?: string;
}

export interface CharacterReference {
  name: string;
  relationship: string;
  organization: string;
  phone: string;
  email?: string;
}

export interface VolunteerProfile {
  id: string;
  volunteerCode: string;
  fullName: string;
  preferredName?: string;
  gender: string;
  birthdate: string;
  age: number;
  contactNumber: string;
  email: string;
  address: string;
  barangayCommunity: string;
  occupation: string;
  photoUrl?: string;

  // Engagement Type choice (Long-term vs One-time event)
  engagementType: VolunteerEngagementType;
  status: VolunteerStatus;
  enrolledByOfficer: string;
  enrollmentDate: string;

  // Emergency Contact Information
  emergencyContact: EmergencyContact;

  // Volunteer Track Interest and Availability
  volunteerTracks: string[];
  availabilityDays: string[];
  availabilityHoursPerWeek: string;
  notesOnAvailability?: string;

  // Skills Background
  skills: string[];
  educationLevel: string;
  priorVolunteerExperience?: string;
  specialTalentsOrCertifications?: string;

  // Health Safety and Reasonable Accommodations
  bloodType?: string;
  medicalConditionsOrAllergies?: string;
  dietaryOrPhysicalLimitations?: string;
  reasonableAccommodations?: string;
  childProtectionPolicyAgreed: boolean;
  volunteerWaiverSigned: boolean;

  // Character References
  characterReferences: CharacterReference[];

  createdAt: string;
  updatedAt: string;
}
