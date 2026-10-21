import {
  ChildBeneficiary,
  DonationRecord,
  CommunityReport,
  AuditLogEntry,
  SecuritySettings,
  PolicyDocument,
  PolicyDocumentType,
  VolunteerProfile,
} from '../types';

const CHILDREN_ENC_PREFIX = 'enc:v1:';
const CHILDREN_PASSPHRASE = 'childlink-local-storage-protection-v1';

async function deriveChildrenKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(CHILDREN_PASSPHRASE),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('childlink-children-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function encryptChildrenPayload(children: ChildBeneficiary[]): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveChildrenKey();
  const plaintext = new TextEncoder().encode(JSON.stringify(children));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  const packed = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
  packed.set(iv, 0);
  packed.set(new Uint8Array(ciphertext), iv.length);
  return `${CHILDREN_ENC_PREFIX}${bytesToBase64(packed)}`;
}

async function decryptChildrenPayload(raw: string): Promise<ChildBeneficiary[]> {
  const base64 = raw.slice(CHILDREN_ENC_PREFIX.length);
  const packed = base64ToBytes(base64);
  const iv = packed.slice(0, 12);
  const ciphertext = packed.slice(12);
  const key = await deriveChildrenKey();
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return JSON.parse(new TextDecoder().decode(plaintext));
}

export const DEFAULT_COMMUNITIES: string[] = [
  'Brgy. Langkiwa, Binan, Laguna',
  'Towerville, San Jose Del Monte Bulacan',
  'Brgy. Nangka, Marikina',
  'Barugohay, Carigara, Leyte',
  'Southville, Sta. Rosa Laguna',
];

export const DEFAULT_POLICY_DOCUMENTS: PolicyDocument[] = [
  {
    id: 'data_privacy_policy',
    title: 'Data Privacy Policy',
    category: 'Information Security & Compliance',
    description:
      'Governs the collection, air-gapped local storage, masking, and confidentiality of beneficiary and donor data.',
  },
  {
    id: 'employee_safety_policy',
    title: 'Employee Safety Policy',
    category: 'Human Resources & Field Operations',
    description:
      'Workplace safety protocols, field assessment precautions, and emergency procedures for project staff.',
  },
  {
    id: 'child_protection_policy',
    title: 'Child Protection Policy',
    category: 'Safeguarding & Ethics',
    description:
      'Mandatory safeguarding code of conduct, zero-tolerance reporting procedures, and child rights standards.',
  },
];

const STORAGE_KEYS = {
  CHILDREN: 'vineyard_children_data',
  DONATIONS: 'vineyard_donations_data',
  REPORTS: 'vineyard_reports_data',
  VOLUNTEERS: 'vineyard_volunteers_data',
  AUDIT_LOGS: 'vineyard_audit_logs',
  SECURITY: 'vineyard_security_settings',
  COMMUNITIES: 'vineyard_community_areas',
  POLICIES: 'vineyard_policy_documents',
};

// Initial Seed Data for ChildLink Masterlist
const INITIAL_CHILDREN: ChildBeneficiary[] = [
  {
    id: 'ch-1',
    beneficiaryName: 'Jasmine Alcantara Dela Cruz',
    beneficiaryCode: 'VIN-CL-2024-001',
    nickname: 'Jas',
    bday: '2016-04-12',
    age: 9,
    gradeLevel: 'Grade 3',
    favoriteSubject: 'Science and Nature Studies',
    householdChores: 'Sweeping the yard and washing dishes after dinner',
    siblings: '3 siblings: Carlos (14), Marco (11), and Baby Mia (2)',
    fatherNameOccupation: 'Eduardo Dela Cruz / Tricycle Driver',
    motherNameOccupation: 'Maria Dela Cruz / Market Vendor & Laundress',
    briefHistoryOfFamily:
      'The Dela Cruz family was relocated after severe monsoon flooding inundated their riverside dwelling in 2023. Eduardo works long hours driving a rented tricycle, while Maria sells vegetables when capital permits. Jasmine is a dedicated student who consistently ranks in the top 5 of her class and dreams of becoming an environmental biologist.',
    status: 'sponsored',
    sponsorName: 'Dr. Gregory & Helen Vance',
    sponsorCode: 'SP-2023-088',
    communityCluster: 'Brgy. Langkiwa, Binan, Laguna',
    mediaReleaseFormSigned: true,
    childProtectionPolicySigned: true,
    photoUrl: '',
    createdAt: '2024-01-15T08:00:00.000Z',
    updatedAt: '2024-06-20T10:30:00.000Z',
  },
  {
    id: 'ch-2',
    beneficiaryName: 'Mateo Gabriel Ramos',
    beneficiaryCode: 'VIN-CL-2024-002',
    nickname: 'Gabo',
    bday: '2014-09-28',
    age: 11,
    gradeLevel: 'Grade 5',
    favoriteSubject: 'Mathematics & Chess Club',
    householdChores: 'Fetching clean water from communal pump and folding laundry',
    siblings: '2 siblings: Sofia (13) and Christian (7)',
    fatherNameOccupation: 'Renato Ramos / Agricultural Day Laborer',
    motherNameOccupation: 'Annaliza Ramos / Housewife & Weaver',
    briefHistoryOfFamily:
      'The Ramos family resides in Towerville resettlement area. Seasonal drought regularly impacts agricultural labor income. Mateo walks each morning to attend the elementary school. He has displayed exceptional aptitude in mental arithmetic and represented his school in district competitions.',
    status: 'sponsored',
    sponsorName: 'Grace Fellowship Outreach',
    sponsorCode: 'SP-2024-014',
    communityCluster: 'Towerville, San Jose Del Monte Bulacan',
    mediaReleaseFormSigned: true,
    childProtectionPolicySigned: true,
    photoUrl: '',
    createdAt: '2024-02-01T09:15:00.000Z',
    updatedAt: '2024-07-10T14:20:00.000Z',
  },
  {
    id: 'ch-3',
    beneficiaryName: 'Kiana Rose Hernandez',
    beneficiaryCode: 'VIN-CL-2024-003',
    nickname: 'Kikay',
    bday: '2017-11-05',
    age: 7,
    gradeLevel: 'Grade 1',
    favoriteSubject: 'Art and Storytelling',
    householdChores: 'Feeding backyard chickens and putting away school supplies',
    siblings: '4 siblings: Noel (16), Bea (12), Jericho (9), and Dan (4)',
    fatherNameOccupation: 'Danilo Hernandez / Construction Helper (Irregular)',
    motherNameOccupation: 'Rosa Hernandez / Sari-sari Store Helper',
    briefHistoryOfFamily:
      'With five growing children and informal daily wages, the household faces persistent challenges covering school uniforms and learning supplies. Kiana was identified during the EiE school transition monitoring after a recent typhoon damaged their roof. She is eager to learn and loves drawing landscapes.',
    status: 'available',
    sponsorName: undefined,
    sponsorCode: undefined,
    communityCluster: 'Brgy. Nangka, Marikina',
    mediaReleaseFormSigned: true,
    childProtectionPolicySigned: true,
    photoUrl: '',
    createdAt: '2024-03-12T11:00:00.000Z',
    updatedAt: '2024-08-05T09:00:00.000Z',
  },
  {
    id: 'ch-4',
    beneficiaryName: 'Joshua Miguel Bautista',
    beneficiaryCode: 'VIN-CL-2024-004',
    nickname: 'Josh',
    bday: '2013-03-19',
    age: 12,
    gradeLevel: 'Grade 7',
    favoriteSubject: 'Social Studies & World History',
    householdChores: 'Washing dishes and helping care for younger brother',
    siblings: '1 sibling: Ethan (5)',
    fatherNameOccupation: 'Deceased',
    motherNameOccupation: 'Lourdes Bautista / School Canteen Assistant',
    briefHistoryOfFamily:
      'Joshua lost his father to sudden cardiac arrest three years ago. His mother single-handedly supports the small household on minimum daily wages. Despite financial hardships, Joshua maintains high honors and serves as class president.',
    status: 'available',
    sponsorName: undefined,
    sponsorCode: undefined,
    communityCluster: 'Barugohay, Carigara, Leyte',
    mediaReleaseFormSigned: true,
    childProtectionPolicySigned: true,
    photoUrl: '',
    createdAt: '2024-03-20T13:45:00.000Z',
    updatedAt: '2024-08-11T16:00:00.000Z',
  },
  {
    id: 'ch-5',
    beneficiaryName: 'Angelica Joyce Mendoza',
    beneficiaryCode: 'VIN-CL-2024-005',
    nickname: 'AJ',
    bday: '2015-08-14',
    age: 10,
    gradeLevel: 'Grade 4',
    favoriteSubject: 'English Reading and Spelling',
    householdChores: 'Mopping floor and helping mother prepare dinner vegetables',
    siblings: '2 siblings: Paul (8) and Nicole (6)',
    fatherNameOccupation: 'Wilfredo Mendoza / Carpenter',
    motherNameOccupation: 'Maricel Mendoza / Seamstress',
    briefHistoryOfFamily:
      'Both parents are skilled craftsmen whose earnings fluctuate heavily between building contracts. Angelica was awarded best reader in Grade 3 and participates actively in the community library club initiated by NGO community partners.',
    status: 'sponsored',
    sponsorName: 'Pacific Community Foundation',
    sponsorCode: 'SP-2023-031',
    communityCluster: 'Southville, Sta. Rosa Laguna',
    mediaReleaseFormSigned: true,
    childProtectionPolicySigned: true,
    photoUrl: '',
    createdAt: '2024-04-05T10:00:00.000Z',
    updatedAt: '2024-09-02T11:10:00.000Z',
  },
  {
    id: 'ch-6',
    beneficiaryName: 'Raphael David Navarro',
    beneficiaryCode: 'VIN-CL-2024-006',
    nickname: 'Raphie',
    bday: '2018-01-22',
    age: 7,
    gradeLevel: 'Grade 1',
    favoriteSubject: 'Music and Physical Education',
    householdChores: 'Arranging shoes and picking up toys with younger cousin',
    siblings: 'None (Only child in extended household)',
    fatherNameOccupation: 'Jerome Navarro / Fisherman',
    motherNameOccupation: 'Cynthia Navarro / Fish Vendor',
    briefHistoryOfFamily:
      'Coastal household vulnerable to rough seas and typhoons during monsoon months. The family participated in the humanitarian emergency cash transfer during the July gale warning. Raphael recently started Grade 1 with full eagerness.',
    status: 'available',
    sponsorName: undefined,
    sponsorCode: undefined,
    communityCluster: 'Brgy. Langkiwa, Binan, Laguna',
    mediaReleaseFormSigned: true,
    childProtectionPolicySigned: true,
    photoUrl: '',
    createdAt: '2024-04-18T14:30:00.000Z',
    updatedAt: '2024-09-15T08:40:00.000Z',
  },
];

// Initial Seed Data for Donation History
const INITIAL_DONATIONS: DonationRecord[] = [
  {
    id: 'don-1',
    receiptNo: 'VIN-OR-2024-0101',
    donorName: 'Dr. Gregory & Helen Vance',
    donorCode: 'DNR-USA-088',
    donorEmail: 'greg.vance@vancemed.org',
    donorCategory: 'individual',
    isAnonymous: false,
    amount: 18000,
    currency: 'PHP',
    allocationType: 'child_sponsorship',
    linkedBeneficiaryId: 'ch-1',
    linkedBeneficiaryName: 'Jasmine Alcantara Dela Cruz (VIN-CL-2024-001)',
    date: '2024-09-05',
    paymentMethod: 'bank_transfer',
    status: 'verified',
    notes: 'Annual child sponsorship remittance covering tuition subsidies, health checkups, and school uniform kits for Jasmine.',
    receivedBy: 'Jericho (Project Officer)',
  },
  {
    id: 'don-2',
    receiptNo: 'VIN-OR-2024-0102',
    donorName: 'Hope Horizon Humanitarian Aid',
    donorCode: 'DNR-NGO-104',
    donorEmail: 'partnerships@hopehorizon.org',
    donorCategory: 'partner_ngo',
    isAnonymous: false,
    amount: 250000,
    currency: 'PHP',
    allocationType: 'cva_fund',
    date: '2024-09-12',
    paymentMethod: 'bank_transfer',
    status: 'verified',
    notes: 'Dedicated grant for Cash & Voucher Assistance (CVA) Cycle 3 targeting 240 typhoon-affected vulnerable families.',
    receivedBy: 'Jericho (Project Officer)',
  },
  {
    id: 'don-3',
    receiptNo: 'VIN-OR-2024-0103',
    donorName: 'Grace Fellowship Outreach',
    donorCode: 'DNR-REL-014',
    donorEmail: 'giving@gracefellowship.ph',
    donorCategory: 'faith_community',
    isAnonymous: false,
    amount: 15000,
    currency: 'PHP',
    allocationType: 'child_sponsorship',
    linkedBeneficiaryId: 'ch-2',
    linkedBeneficiaryName: 'Mateo Gabriel Ramos (VIN-CL-2024-002)',
    date: '2024-09-18',
    paymentMethod: 'bank_transfer',
    status: 'verified',
    notes: 'Semi-annual sponsorship installment for Mateo Gabriel Ramos for Grade 5 school materials and transportation assistance.',
    receivedBy: 'Jericho (Project Officer)',
  },
  {
    id: 'don-4',
    receiptNo: 'VIN-OR-2024-0104',
    donorName: 'Civic Resilience Guild',
    donorCode: 'DNR-CORP-052',
    donorEmail: 'csr@civicguild.com',
    donorCategory: 'corporate',
    isAnonymous: false,
    amount: 120000,
    currency: 'PHP',
    allocationType: 'eie_fund',
    date: '2024-09-25',
    paymentMethod: 'check',
    status: 'verified',
    notes: 'Education in Emergencies (EiE) grant to outfit 2 Temporary Learning Spaces with whiteboards, tarpaulin flooring, and 150 student learning kits.',
    receivedBy: 'Jericho (Project Officer)',
  },
  {
    id: 'don-5',
    receiptNo: 'VIN-OR-2024-0105',
    donorName: 'Anonymous Supporter #12',
    donorCode: 'DNR-ANON-012',
    donorEmail: 'confidential@donor.net',
    donorCategory: 'individual',
    isAnonymous: true,
    amount: 30000,
    currency: 'PHP',
    allocationType: 'general_relief',
    date: '2024-10-02',
    paymentMethod: 'remittance',
    status: 'verified',
    notes: 'Unrestricted humanitarian relief contingency reserve.',
    receivedBy: 'Jericho (Project Officer)',
  },
  {
    id: 'don-6',
    receiptNo: 'VIN-OR-2024-0106',
    donorName: 'Pacific Community Foundation',
    donorCode: 'DNR-FND-031',
    donorEmail: 'grants@pacificfoundation.org',
    donorCategory: 'partner_ngo',
    isAnonymous: false,
    amount: 36000,
    currency: 'PHP',
    allocationType: 'child_sponsorship',
    linkedBeneficiaryId: 'ch-5',
    linkedBeneficiaryName: 'Angelica Joyce Mendoza (VIN-CL-2024-005)',
    date: '2024-10-10',
    paymentMethod: 'bank_transfer',
    status: 'verified',
    notes: 'Direct 2-year educational continuity fund for Angelica Joyce Mendoza.',
    receivedBy: 'Jericho (Project Officer)',
  },
];

// Initial Seed Data for CVA and Education in Emergencies Blog Reports
const INITIAL_REPORTS: CommunityReport[] = [
  {
    id: 'rep-cva-01',
    title: 'Citizen Voice and Action: Community Scorecard & Public Dialogue for Barangay Health and Child Protection',
    slug: 'cva-community-scorecard-dialogue',
    program: 'cva',
    date: '2024-09-14',
    location: 'Barangay Multi-Purpose Center, Community Hall',
    officerName: 'Jericho',
    officerRole: 'Project Officer - Citizen Voice and Action (CVA)',
    summary:
      'A field dispatch documenting the successful Citizen Voice and Action (CVA) social accountability interface, bringing together 240 community members, parents, and barangay officials to evaluate maternal health clinic services, rural health unit standards, and child safeguarding.',
    coverImage: '/src/assets/images/cva_cash_distribution_1792381930481.jpg',
    metrics: [
      { label: 'Citizen Participants', value: '240', unit: 'residents' },
      { label: 'Community Monitors', value: '36', unit: 'trained leaders' },
      { label: 'Scorecard Dialogue', value: '100%', unit: 'completion' },
      { label: 'Action Commitments', value: '12', unit: 'LGU agreements' },
    ],
    situationOverview:
      'Residents in the community faced recurrent shortages of maternal health medicines and limited clinic operational hours, causing vulnerability for young children and pregnant mothers. Without structured civic dialogue channels, community grievances remained unresolved between citizens and local government health service providers.',
    actionTaken:
      'Field facilitators conducted a multi-stage Citizen Voice and Action (CVA) social accountability process. Field facilitators guided community groups through standard government service standard scorecards, followed by a collaborative town-hall interface meeting with Barangay councilors, health workers, and youth representatives. Joint resolutions were adopted to extend health center opening hours and establish a dedicated child protection referral desk.',
    challengesAndAdaptations:
      'Initial apprehension between community elders and local officials was bridged by grounding the dialogue in official Philippine Department of Health service standards. Breakout group sessions allowed women caregivers and teenage student leaders to voice their specific service priorities safely and constructively.',
    communityVoiceQuote: {
      quote:
        'Through Citizen Voice and Action, we learned our rights under official service standards. For the first time, our barangay officials sat down with us as partners, and now our children have access to a clean clinic with on-duty staff.',
      author: 'Nanay Corazon (47)',
      role: 'Mother & Community Health Monitor',
    },
    photoGallery: [
      {
        url: '/src/assets/images/cva_cash_distribution_1792381930481.jpg',
        caption: 'Project Officer facilitating Citizen Voice and Action community scorecard session with local residents and barangay leaders.',
      },
    ],
    tags: ['CVA', 'Citizen Voice and Action', 'Social Accountability', 'Child Protection', 'Community Dialogue'],
    status: 'published',
    createdAt: '2024-09-15T08:00:00.000Z',
  },
  {
    id: 'rep-eie-02',
    title: 'Rebuilding Learning Spaces: Education in Emergencies Response for 310 Displaced Children',
    slug: 'eie-temporary-learning-spaces-response',
    program: 'eie',
    date: '2024-10-04',
    location: 'Sitio Maligaya Settlement & Bagong Silang Primary School',
    officerName: 'Jericho',
    officerRole: 'Project Officer - Education & ChildLink',
    summary:
      'Field dispatch on the establishment of two Temporary Learning Spaces (TLS) and the distribution of comprehensive back-to-learning school kits for children displaced by localized flooding.',
    coverImage: '/src/assets/images/eie_temporary_learning_1792381930913.jpg',
    metrics: [
      { label: 'Children Enrolled in TLS', value: '310', unit: 'learners' },
      { label: 'Learning Spaces Erected', value: '2', unit: 'bamboo-timber hubs' },
      { label: 'Backpack & Stationery Kits', value: '310', unit: 'kits distributed' },
      { label: 'Volunteer Teachers Mobilized', value: '12', unit: 'educators' },
    ],
    situationOverview:
      'When flash floods damaged five elementary classrooms and swept away family possessions, formal classes were abruptly suspended. Without immediate intervention, children faced prolonged educational disruption, worsening learning regression and psychosocial stress.',
    actionTaken:
      'Within 72 hours of damage assessment, project teams collaborated with community parents and local carpenters to construct two well-ventilated, weather-proof Temporary Learning Spaces using treated bamboo, marine plywood, and heat-reflective tarpaulins. Every child was equipped with a sturdy blue waterproof backpack containing notebooks, writing pens, pencils, geometry kits, art supplies, and an emergency solar study lamp.',
    challengesAndAdaptations:
      'Continuous monsoon drizzle threatened materials; our team organized community work-brigades (bayanihan) that erected elevated wooden floor platforms to keep learners dry. Psychosocial support modules and expressive art sessions were integrated into the morning circle to help children process flood trauma before academic instruction.',
    communityVoiceQuote: {
      quote:
        'When the floods took our house, I thought my daughter would drop out for the entire school year. Seeing her hold her new backpack and sit with her classmates inside the new learning space gave our whole family renewed hope.',
      author: 'Tatay Danilo Ramos',
      role: 'Parent & Community Carpenter',
    },
    photoGallery: [
      {
        url: '/src/assets/images/eie_temporary_learning_1792381930913.jpg',
        caption: 'Children eagerly participating in morning mathematics instruction inside the newly erected temporary learning center.',
      },
      {
        url: '/src/assets/images/community_learning_supplies_1792381930966.jpg',
        caption: 'Organized distribution hub with backpacks, solar lamps, and stationery kits prepared for learner intake.',
      },
    ],
    tags: ['EiE', 'Child Protection', 'Temporary Learning Spaces', 'School Supplies', 'Psychosocial Support'],
    status: 'published',
    createdAt: '2024-10-05T09:30:00.000Z',
  },
  {
    id: 'rep-cva-03',
    title: 'Barangay Health Scorecard: Extended Clinic Hours & Maternal Care Access Dialogue',
    slug: 'cva-health-scorecard-binan-laguna',
    program: 'cva',
    date: '2024-10-12',
    location: 'Brgy. Langkiwa, Binan, Laguna',
    officerName: 'Jericho',
    officerRole: 'Project Officer - Citizen Voice and Action',
    summary:
      'Community scorecard dialogue with municipal health physicians and Barangay councilors to address pediatric medicine shortages and establish dedicated weekend health consultation days.',
    coverImage: '/src/assets/images/cva_cash_distribution_1792381930481.jpg',
    metrics: [
      { label: 'Participating Parents', value: '185', unit: 'caregivers' },
      { label: 'RHU Clinic Score', value: '88%', unit: 'satisfaction' },
      { label: 'Medicine Restock Days', value: '3x', unit: 'weekly deliveries' },
      { label: 'Action Items Signed', value: '8', unit: 'resolutions' },
    ],
    situationOverview:
      'Working parents in Langkiwa reported arriving at the rural health unit only to find immunization queues capped early. CVA facilitation enabled structured assessment against DOH primary care benchmarks.',
    actionTaken:
      'Facilitators conducted four focus groups followed by an open multi-stakeholder interface session with local health committee chairs and barangay captains, establishing weekend vaccination hours.',
    challengesAndAdaptations:
      'Scheduling conflicts with shift workers were mitigated by hosting evening validation sessions at the community chapel courtyard.',
    communityVoiceQuote: {
      quote:
        'We no longer have to take unpaid leave from factory shifts just to have our toddlers weighed and immunized. The new Saturday clinic schedule is a blessing.',
      author: 'Maricel Alcantara (34)',
      role: 'Parent Representative',
    },
    photoGallery: [
      {
        url: '/src/assets/images/cva_cash_distribution_1792381930481.jpg',
        caption: 'Langkiwa community leaders presenting health service scorecards to barangay council officials.',
      },
    ],
    tags: ['CVA', 'Maternal Health', 'Scorecard', 'Citizen Engagement', 'Local Governance'],
    status: 'published',
    createdAt: '2024-10-12T10:00:00.000Z',
  },
  {
    id: 'rep-eie-04',
    title: 'Classroom Continuity Kits & Solar Study Lamps for 190 Flood-Prone Households',
    slug: 'eie-flood-preparedness-laguna',
    program: 'eie',
    date: '2024-10-15',
    location: 'Brgy. Langkiwa, Binan, Laguna',
    officerName: 'Jericho',
    officerRole: 'Project Officer - Education & ChildLink',
    summary:
      'Distribution of rugged waterproof learning satchels, rechargeable solar study lamps, and home study activity workbooks for elementary learners residing near the Laguna de Bay lowlands.',
    coverImage: '/src/assets/images/community_learning_supplies_1792381930966.jpg',
    metrics: [
      { label: 'Learners Equipped', value: '190', unit: 'pupils' },
      { label: 'Solar Study Lamps', value: '190', unit: 'units' },
      { label: 'Teacher Kits Provided', value: '14', unit: 'modular packs' },
      { label: 'Home Learning Plans', value: '100%', unit: 'adopted' },
    ],
    situationOverview:
      'During high tide surges and torrential monsoon periods, localized power outages frequently interrupt evening home studies for young children in coastal clusters.',
    actionTaken:
      'In coordination with primary school teachers, our team delivered solar study lamps and waterproof document satchels to prevent learning material loss during flash flood alerts.',
    challengesAndAdaptations:
      'Ensured durable packaging and conducted quick parent orientations on battery maintenance and solar charging placement.',
    communityVoiceQuote: {
      quote:
        'Even when power goes out during heavy downpours, my son can finish his mathematics homework under his solar lamp without resorting to hazardous kerosene candles.',
      author: 'Eduardo Dela Cruz',
      role: 'Community Parent & Driver',
    },
    photoGallery: [
      {
        url: '/src/assets/images/community_learning_supplies_1792381930966.jpg',
        caption: 'Distribution of classroom continuity packs and solar study lamps to elementary school pupils.',
      },
    ],
    tags: ['EiE', 'Disaster Preparedness', 'Solar Lamps', 'Education Continuity', 'Laguna'],
    status: 'published',
    createdAt: '2024-10-15T11:00:00.000Z',
  },
  {
    id: 'rep-cva-05',
    title: 'Citizen Action Interface: Coastal Disaster Evacuation & Child Safeguarding Protocols',
    slug: 'cva-coastal-resilience-leyte',
    program: 'cva',
    date: '2024-10-17',
    location: 'Barugohay, Carigara, Leyte',
    officerName: 'Jericho',
    officerRole: 'Project Officer - Citizen Voice and Action',
    summary:
      'Multi-sector community dialogue establishing child-friendly spaces inside designated municipal storm shelters and standardizing family emergency reuniting protocols.',
    coverImage: '/src/assets/images/cva_cash_distribution_1792381930481.jpg',
    metrics: [
      { label: 'Fisherfolk Families', value: '140', unit: 'households' },
      { label: 'Shelter Protocols', value: '3', unit: 'designated hubs' },
      { label: 'Child Protection Desks', value: '100%', unit: 'operational' },
      { label: 'Civic Volunteers', value: '25', unit: 'mobilized' },
    ],
    situationOverview:
      'Typhoon warning bulletins require swift evacuation for coastal households. Community feedback highlighted the need for private nursing zones and secure child registration inside emergency centers.',
    actionTaken:
      'Held CVA interface meeting with the Municipal Disaster Risk Reduction Management Office (MDRRMO) and social workers, adopting standardized child-friendly shelter guidelines.',
    challengesAndAdaptations:
      'Simulated mock evacuation drill with parents to verify that child emergency identification cards were easily legible and waterproofed.',
    communityVoiceQuote: {
      quote:
        'When typhoons strike, knowing where my children will be safely registered and sheltered brings our whole barangay tremendous peace of mind.',
      author: 'Nanay Cynthia Navarro',
      role: 'Fisherfolk Family Representative',
    },
    photoGallery: [
      {
        url: '/src/assets/images/cva_cash_distribution_1792381930481.jpg',
        caption: 'Carigara community members reviewing disaster shelter child safeguarding standard scorecards.',
      },
    ],
    tags: ['CVA', 'Disaster Resilience', 'Evacuation Centers', 'Child Protection', 'Leyte'],
    status: 'published',
    createdAt: '2024-10-17T08:30:00.000Z',
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '2024-10-18T08:00:00.000Z',
    action: 'security_login',
    details: 'Project Officer authenticated on secure local server.',
    officer: 'Jericho (Project Officer)',
  },
  {
    id: 'log-2',
    timestamp: '2024-10-18T08:15:00.000Z',
    action: 'view_child',
    details: 'Accessed ChildLink profile for Jasmine Alcantara Dela Cruz (VIN-CL-2024-001).',
    officer: 'Jericho (Project Officer)',
  },
  {
    id: 'log-3',
    timestamp: '2024-10-18T09:30:00.000Z',
    action: 'create_donation',
    details: 'Recorded donation receipt VIN-OR-2024-0106 from Pacific Community Foundation (PHP 36,000).',
    officer: 'Jericho (Project Officer)',
  },
];

const INITIAL_SECURITY: SecuritySettings = {
  isLocked: false,
  pinCode: '2024',
  autoLockMinutes: 15,
  privacyMode: false,
  currentRole: 'project_officer',
  dataPrivacyDisclaimerAccepted: true,
};

// Storage helper functions
export async function getStoredChildren(): Promise<ChildBeneficiary[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHILDREN);
    if (!raw) {
      const encryptedInitial = await encryptChildrenPayload(INITIAL_CHILDREN);
      localStorage.setItem(STORAGE_KEYS.CHILDREN, encryptedInitial);
      return INITIAL_CHILDREN;
    }

    if (raw.startsWith(CHILDREN_ENC_PREFIX)) {
      return await decryptChildrenPayload(raw);
    }

    const parsed = JSON.parse(raw) as ChildBeneficiary[];
    const migrated = await encryptChildrenPayload(parsed);
    localStorage.setItem(STORAGE_KEYS.CHILDREN, migrated);
    return parsed;
  } catch (err) {
    console.error('Failed reading children data from localStorage:', err);
    return INITIAL_CHILDREN;
  }
}

export async function saveStoredChildren(children: ChildBeneficiary[]): Promise<void> {
  try {
    const encrypted = await encryptChildrenPayload(children);
    localStorage.setItem(STORAGE_KEYS.CHILDREN, encrypted);
    triggerServerSync();
  } catch (err) {
    console.error('Failed saving children data:', err);
  }
}

export function getStoredDonations(): DonationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DONATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(INITIAL_DONATIONS));
      return INITIAL_DONATIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading donations data:', err);
    return INITIAL_DONATIONS;
  }
}

export function saveStoredDonations(donations: DonationRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(donations));
    triggerServerSync();
  } catch (err) {
    console.error('Failed saving donations data:', err);
  }
}

export function getStoredReports(): CommunityReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading reports data:', err);
    return INITIAL_REPORTS;
  }
}

export function saveStoredReports(reports: CommunityReport[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    triggerServerSync();
  } catch (err) {
    console.error('Failed saving reports data:', err);
  }
}

export function deleteStoredReport(reportId: string): CommunityReport[] {
  const current = getStoredReports();
  const updated = current.filter((r) => r.id !== reportId);
  saveStoredReports(updated);
  return updated;
}

export function updateStoredReport(updatedReport: CommunityReport): CommunityReport[] {
  const current = getStoredReports();
  const updated = current.map((r) => (r.id === updatedReport.id ? updatedReport : r));
  saveStoredReports(updated);
  return updated;
}

// Initial Seed Data for Volunteer Management
export const INITIAL_VOLUNTEERS: VolunteerProfile[] = [
  {
    id: 'vol-1',
    volunteerCode: 'VIN-VOL-2024-001',
    fullName: 'Maria Elena Santos',
    preferredName: 'Elena',
    gender: 'Female',
    birthdate: '1996-08-14',
    age: 28,
    contactNumber: '0917-822-4410',
    email: 'elena.santos@gmail.com',
    address: 'Block 12, Lot 4, Phase 2, Brgy. Langkiwa',
    barangayCommunity: 'Brgy. Langkiwa, Binan, Laguna',
    occupation: 'Licensed Elementary School Teacher',
    photoUrl: '/src/assets/images/community_learning_supplies_1792381930966.jpg',
    engagementType: 'long_term',
    status: 'active',
    enrolledByOfficer: 'Jericho (Project Officer)',
    enrollmentDate: '2024-02-10',
    emergencyContact: {
      name: 'Roberto Santos',
      relationship: 'Father',
      primaryPhone: '0917-555-1201',
      secondaryPhone: '049-511-8890',
      address: 'Block 12, Lot 4, Phase 2, Brgy. Langkiwa, Binan, Laguna',
    },
    volunteerTracks: [
      'ChildLink Tutoring & Mentorship',
      'EiE Emergency Learning & Relief',
    ],
    availabilityDays: ['Saturdays', 'Sundays'],
    availabilityHoursPerWeek: '6-8 hours/week',
    notesOnAvailability: 'Available every weekend morning for reading clinic and homework assistance.',
    skills: [
      'Teaching & Tutoring',
      'Event Facilitation',
      'First Aid / Medical',
      'Counseling / Psycho-social',
    ],
    educationLevel: 'Bachelor of Elementary Education (Licensed Teacher)',
    priorVolunteerExperience: '4 years tutoring underprivileged youth with DepEd Reading Remediation and Church Outreach.',
    specialTalentsOrCertifications: 'PRC Licensed Professional Teacher, Red Cross Basic Life Support Certified',
    bloodType: 'O+',
    medicalConditionsOrAllergies: 'None',
    dietaryOrPhysicalLimitations: 'None',
    reasonableAccommodations: 'Prefers ground-floor classrooms during community floods.',
    childProtectionPolicyAgreed: true,
    volunteerWaiverSigned: true,
    characterReferences: [
      {
        name: 'Principal Anita Reyes',
        relationship: 'Department Supervisor / Principal',
        organization: 'DepEd Binan Elementary School',
        phone: '0919-445-1200',
        email: 'anita.reyes@deped.gov.ph',
      },
      {
        name: 'Pastor Daniel Lim',
        relationship: 'Senior Pastor & Community Elder',
        organization: 'Grace Community Fellowship',
        phone: '0922-811-9321',
        email: 'pastor.lim@gcf.org',
      },
    ],
    createdAt: '2024-02-10T08:30:00Z',
    updatedAt: '2024-10-15T09:00:00Z',
  },
  {
    id: 'vol-2',
    volunteerCode: 'VIN-VOL-2024-002',
    fullName: 'Joshua Miguel Tan',
    preferredName: 'Josh',
    gender: 'Male',
    birthdate: '2002-11-23',
    age: 22,
    contactNumber: '0918-933-7721',
    email: 'josh.tan2002@outlook.com',
    address: 'Area C, Towerville Phase 4',
    barangayCommunity: 'Towerville, San Jose Del Monte Bulacan',
    occupation: 'BS Information Technology Student',
    photoUrl: '',
    engagementType: 'one_time',
    status: 'completed',
    enrolledByOfficer: 'Jericho (Project Officer)',
    enrollmentDate: '2024-07-05',
    emergencyContact: {
      name: 'Caridad Tan',
      relationship: 'Mother',
      primaryPhone: '0918-555-8832',
      secondaryPhone: '',
      address: 'Area C, Towerville Phase 4, SJDM Bulacan',
    },
    volunteerTracks: [
      'CVA Citizen Advocacy & Scorecards',
      'Relief Logistics & Packing',
    ],
    availabilityDays: ['Flexible / On-Call', 'Saturdays'],
    availabilityHoursPerWeek: 'Full day during disaster relief events',
    notesOnAvailability: 'Enrolled specifically for emergency relief packing and typhoon food basket distributions.',
    skills: [
      'Logistics & Driving',
      'Photography & Video',
      'Data Entry & Admin',
    ],
    educationLevel: 'College Undergraduate (Senior Year BS IT)',
    priorVolunteerExperience: 'Volunteer photographer during Barangay SK Youth Summits and typhoon relief drives.',
    specialTalentsOrCertifications: 'Non-Professional Driver License (Motorcycle & 4-Wheel Van), Drone Photography',
    bloodType: 'A+',
    medicalConditionsOrAllergies: 'Mild dust asthma (carries rescue inhaler)',
    dietaryOrPhysicalLimitations: 'Needs dust mask during dry warehouse packaging.',
    reasonableAccommodations: 'Requires shaded or ventilated stations during heavy lifting.',
    childProtectionPolicyAgreed: true,
    volunteerWaiverSigned: true,
    characterReferences: [
      {
        name: 'SK Chairman Mark Villanueva',
        relationship: 'Youth Council Chairman',
        organization: 'Sangguniang Kabataan Towerville',
        phone: '0917-332-9011',
        email: 'mark.villanueva@sjdm.gov.ph',
      },
      {
        name: 'Prof. Grace Aquino',
        relationship: 'College Department Chair',
        organization: 'Bulacan State University',
        phone: '0920-771-4552',
        email: 'gaquino@bulsu.edu.ph',
      },
    ],
    createdAt: '2024-07-05T10:15:00Z',
    updatedAt: '2024-09-18T14:20:00Z',
  },
  {
    id: 'vol-3',
    volunteerCode: 'VIN-VOL-2024-003',
    fullName: 'Dr. Benjamin Cruz',
    preferredName: 'Doc Benjie',
    gender: 'Male',
    birthdate: '1982-03-30',
    age: 42,
    contactNumber: '0920-555-8819',
    email: 'dr.benjamin.cruz@clinic.ph',
    address: '14 Katipunan St., Brgy. Nangka',
    barangayCommunity: 'Brgy. Nangka, Marikina',
    occupation: 'Physician / General Practitioner',
    photoUrl: '',
    engagementType: 'long_term',
    status: 'on_call',
    enrolledByOfficer: 'Jericho (Project Officer)',
    enrollmentDate: '2024-03-12',
    emergencyContact: {
      name: 'Patricia Cruz',
      relationship: 'Spouse',
      primaryPhone: '0920-555-3419',
      secondaryPhone: '02-8941-2233',
      address: '14 Katipunan St., Brgy. Nangka, Marikina',
    },
    volunteerTracks: [
      'Medical & First Aid',
      'ChildLink Tutoring & Mentorship',
    ],
    availabilityDays: ['Saturdays', 'Flexible / On-Call'],
    availabilityHoursPerWeek: '4 hours/month or emergency triage',
    notesOnAvailability: 'On-call volunteer doctor for medical missions, annual beneficiary check-ups, and disaster triage.',
    skills: [
      'First Aid / Medical',
      'Counseling / Psycho-social',
      'Event Facilitation',
    ],
    educationLevel: 'Doctor of Medicine (MD), Board Certified Physician',
    priorVolunteerExperience: '10 years organizing community medical-dental missions and pediatric health screenings.',
    specialTalentsOrCertifications: 'PRC Licensed Physician, Pediatric Advanced Life Support (PALS)',
    bloodType: 'B+',
    medicalConditionsOrAllergies: 'None',
    dietaryOrPhysicalLimitations: 'None',
    reasonableAccommodations: 'Need clean examination table and lighting setup.',
    childProtectionPolicyAgreed: true,
    volunteerWaiverSigned: true,
    characterReferences: [
      {
        name: 'Dr. Samuel Go',
        relationship: 'Hospital Department Head',
        organization: 'Marikina Valley Medical Center',
        phone: '0917-990-2134',
        email: 'dr.sgo@mvmc.com.ph',
      },
      {
        name: 'Atty. Carmen Diaz',
        relationship: 'Civic Partner / Legal Counsel',
        organization: 'Rotary Club of Marikina Heights',
        phone: '0918-123-9876',
        email: 'cdiaz@rotarymarikina.org',
      },
    ],
    createdAt: '2024-03-12T11:00:00Z',
    updatedAt: '2024-08-20T16:45:00Z',
  },
];

export function getStoredVolunteers(): VolunteerProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VOLUNTEERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(INITIAL_VOLUNTEERS));
      return INITIAL_VOLUNTEERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading volunteers data:', err);
    return INITIAL_VOLUNTEERS;
  }
}

export function saveStoredVolunteers(volunteers: VolunteerProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(volunteers));
    triggerServerSync();
  } catch (err) {
    console.error('Failed saving volunteers data:', err);
  }
}

export function addStoredVolunteer(volunteer: VolunteerProfile): VolunteerProfile[] {
  const current = getStoredVolunteers();
  const updated = [volunteer, ...current];
  saveStoredVolunteers(updated);
  return updated;
}

export function updateStoredVolunteer(volunteer: VolunteerProfile): VolunteerProfile[] {
  const current = getStoredVolunteers();
  const updated = current.map((v) => (v.id === volunteer.id ? volunteer : v));
  saveStoredVolunteers(updated);
  return updated;
}

export function deleteStoredVolunteer(volunteerId: string): VolunteerProfile[] {
  const current = getStoredVolunteers();
  const updated = current.filter((v) => v.id !== volunteerId);
  saveStoredVolunteers(updated);
  return updated;
}


export function getStoredAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading audit logs:', err);
    return INITIAL_AUDIT_LOGS;
  }
}

export function appendAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
  try {
    const current = getStoredAuditLogs();
    const newEntry: AuditLogEntry = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      ...entry,
    };
    const updated = [newEntry, ...current].slice(0, 500); // keep last 500 actions
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed writing audit log:', err);
  }
}

export function getStoredCommunities(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMUNITIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COMMUNITIES, JSON.stringify(DEFAULT_COMMUNITIES));
      return DEFAULT_COMMUNITIES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEYS.COMMUNITIES, JSON.stringify(DEFAULT_COMMUNITIES));
      return DEFAULT_COMMUNITIES;
    }
    // Merge any missing default communities while preserving custom added ones
    const combined = [...parsed];
    DEFAULT_COMMUNITIES.forEach((def) => {
      if (!combined.some((c) => c.toLowerCase().trim() === def.toLowerCase().trim())) {
        combined.push(def);
      }
    });
    return combined;
  } catch (err) {
    console.error('Failed reading communities from localStorage:', err);
    return DEFAULT_COMMUNITIES;
  }
}

export function saveStoredCommunities(communities: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMMUNITIES, JSON.stringify(communities));
    triggerServerSync();
  } catch (err) {
    console.error('Failed saving communities data:', err);
  }
}

export function addStoredCommunity(newCommunity: string): string[] {
  const trimmed = newCommunity.trim();
  if (!trimmed) return getStoredCommunities();
  const current = getStoredCommunities();
  const exists = current.some((c) => c.toLowerCase() === trimmed.toLowerCase());
  if (exists) return current;

  const updated = [...current, trimmed];
  saveStoredCommunities(updated);
  appendAuditLog({
    action: 'update_child',
    details: `Added new community classification area: "${trimmed}"`,
    officer: 'Jericho (Project Officer)',
  });
  return updated;
}

// Organizational Policies Storage & Document Upload
export function getStoredPolicies(): PolicyDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POLICIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(DEFAULT_POLICY_DOCUMENTS));
      return DEFAULT_POLICY_DOCUMENTS;
    }
    const parsed: PolicyDocument[] = JSON.parse(raw);
    // Ensure all 3 standard policies exist in the returned array
    const map = new Map<string, PolicyDocument>();
    DEFAULT_POLICY_DOCUMENTS.forEach((def) => map.set(def.id, def));
    if (Array.isArray(parsed)) {
      parsed.forEach((doc) => {
        const existing = map.get(doc.id);
        if (existing) {
          map.set(doc.id, { ...existing, ...doc });
        } else {
          map.set(doc.id, doc);
        }
      });
    }
    return Array.from(map.values());
  } catch (err) {
    console.error('Failed reading policies from localStorage:', err);
    return DEFAULT_POLICY_DOCUMENTS;
  }
}

export function saveStoredPolicies(policies: PolicyDocument[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(policies));
    triggerServerSync();
  } catch (err) {
    console.error('Failed saving policies:', err);
  }
}

export function uploadPolicyDocument(
  policyId: PolicyDocumentType,
  fileName: string,
  fileSizeBytes: number,
  fileDataUrl: string,
  fileType: string
): PolicyDocument[] {
  const current = getStoredPolicies();
  const formattedSize =
    fileSizeBytes > 1024 * 1024
      ? `${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`
      : `${(fileSizeBytes / 1024).toFixed(1)} KB`;

  const updated = current.map((p) => {
    if (p.id === policyId) {
      return {
        ...p,
        fileName,
        fileSizeBytes,
        fileSizeFormatted: formattedSize,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Jericho (Project Officer)',
        fileDataUrl,
        fileType,
      };
    }
    return p;
  });

  saveStoredPolicies(updated);
  const target = updated.find((p) => p.id === policyId);
  appendAuditLog({
    action: 'upload_policy',
    details: `Uploaded organizational document for ${target?.title || policyId}: "${fileName}" (${formattedSize})`,
    officer: 'Jericho (Project Officer)',
  });
  return updated;
}

export function deletePolicyDocument(policyId: PolicyDocumentType): PolicyDocument[] {
  const current = getStoredPolicies();
  const target = current.find((p) => p.id === policyId);
  const updated = current.map((p) => {
    if (p.id === policyId) {
      const {
        fileName,
        fileSizeBytes,
        fileSizeFormatted,
        uploadedAt,
        uploadedBy,
        fileDataUrl,
        fileType,
        ...rest
      } = p;
      return rest;
    }
    return p;
  });

  saveStoredPolicies(updated);
  appendAuditLog({
    action: 'delete_policy',
    details: `Removed uploaded document from ${target?.title || policyId}`,
    officer: 'Jericho (Project Officer)',
  });
  return updated;
}

export interface StorageInfoResponse {
  success: boolean;
  storageType: string;
  absolutePath: string;
  relativePath: string;
  directory: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  lastModified: string;
  counts: {
    children: number;
    donations: number;
    reports: number;
    auditLogs: number;
    communities?: number;
  };
  offlineCompliance: {
    networkIsolation: string;
    cloudSynchronization: string;
    encryptionOption: string;
  };
}

// Check server disk storage diagnostics
export async function fetchServerStorageInfo(): Promise<StorageInfoResponse | null> {
  try {
    const res = await fetch('/api/storage-info');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

// Background sync to local server filesystem
let syncDebounceTimer: any = null;
export function triggerServerSync() {
  clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(async () => {
    try {
      const payload = {
        version: '1.0',
        organization: 'NGO Data Tracker Operations',
        children: getStoredChildren(),
        donations: getStoredDonations(),
        reports: getStoredReports(),
        volunteers: getStoredVolunteers(),
        auditLogs: getStoredAuditLogs(),
        communities: getStoredCommunities(),
        policies: getStoredPolicies(),
      };
      await fetch('/api/save-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      // Local server might be starting or offline
    }
  }, 300);
}

// Load data bundle from local server on startup
export async function initializeFromLocalServer(): Promise<boolean> {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) return false;
    const data = await res.json();
    if (data.children && Array.isArray(data.children)) {
      localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(data.children));
    }
    if (data.donations && Array.isArray(data.donations)) {
      localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(data.donations));
    }
    if (data.reports && Array.isArray(data.reports)) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(data.reports));
    }
    if (data.volunteers && Array.isArray(data.volunteers)) {
      localStorage.setItem(STORAGE_KEYS.VOLUNTEERS, JSON.stringify(data.volunteers));
    }
    if (data.auditLogs && Array.isArray(data.auditLogs)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(data.auditLogs));
    }
    if (data.communities && Array.isArray(data.communities)) {
      const merged = [...data.communities];
      DEFAULT_COMMUNITIES.forEach((def) => {
        if (!merged.some((c: string) => c.toLowerCase().trim() === def.toLowerCase().trim())) {
          merged.push(def);
        }
      });
      localStorage.setItem(STORAGE_KEYS.COMMUNITIES, JSON.stringify(merged));
    }
    if (data.policies && Array.isArray(data.policies)) {
      localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(data.policies));
    }
    return true;
  } catch (err) {
    return false;
  }
}

export function getStoredSecurity(): SecuritySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SECURITY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SECURITY, JSON.stringify(INITIAL_SECURITY));
      return INITIAL_SECURITY;
    }
    return { ...INITIAL_SECURITY, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed reading security settings:', err);
    return INITIAL_SECURITY;
  }
}

export function saveStoredSecurity(settings: Partial<SecuritySettings>): void {
  try {
    const current = getStoredSecurity();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SECURITY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed saving security settings:', err);
  }
}

// Full Database Export & Import
export function exportAllDataBundle() {
  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    organization: 'NGO Data Tracker Operations',
    children: getStoredChildren(),
    donations: getStoredDonations(),
    reports: getStoredReports(),
    volunteers: getStoredVolunteers(),
    auditLogs: getStoredAuditLogs(),
    communities: getStoredCommunities(),
    policies: getStoredPolicies(),
  };
}

export function importAllDataBundle(bundle: ReturnType<typeof exportAllDataBundle>) {
  if (!bundle.children) {
    throw new Error('Invalid database structure. Missing required collections.');
  }
  saveStoredChildren(bundle.children);
  if (bundle.donations) saveStoredDonations(bundle.donations);
  if (bundle.reports) saveStoredReports(bundle.reports);
  if (bundle.auditLogs) localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(bundle.auditLogs));
  if (bundle.communities && Array.isArray(bundle.communities)) saveStoredCommunities(bundle.communities);
  if (bundle.policies && Array.isArray(bundle.policies)) saveStoredPolicies(bundle.policies);
  appendAuditLog({
    action: 'import_backup',
    details: `Restored database bundle with ${bundle.children.length} beneficiaries, ${bundle.communities?.length || 0} community areas, and ${bundle.policies?.length || 0} policies.`,
    officer: 'Jericho (Project Officer)',
  });
}

// CSV Export generator for ChildLink Data
export function exportChildLinkToCSV(children: ChildBeneficiary[]): string {
  const headers = [
    'Beneficiary Code',
    'Beneficiary Name',
    'Nickname',
    'Birthdate',
    'Age',
    'Grade Level',
    'Favorite Subject',
    'Household Chores',
    'Siblings',
    'Father Name / Occupation',
    'Mother Name / Occupation',
    'Brief History of the Family',
    'Status',
    'Sponsor Name',
    'Classification of Community',
    'Media Release Form Signed',
    'Child Protection Policy Signed',
  ];

  const escapeCSV = (str: string | number | undefined | boolean) => {
    if (str === undefined || str === null) return '""';
    const clean = String(str).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = children.map((c) => [
    escapeCSV(c.beneficiaryCode),
    escapeCSV(c.beneficiaryName),
    escapeCSV(c.nickname),
    escapeCSV(c.bday),
    escapeCSV(c.age),
    escapeCSV(c.gradeLevel),
    escapeCSV(c.favoriteSubject),
    escapeCSV(c.householdChores),
    escapeCSV(c.siblings),
    escapeCSV(c.fatherNameOccupation),
    escapeCSV(c.motherNameOccupation),
    escapeCSV(c.briefHistoryOfFamily),
    escapeCSV(c.status),
    escapeCSV(c.sponsorName || 'Unassigned'),
    escapeCSV(c.communityCluster),
    escapeCSV(c.mediaReleaseFormSigned ? 'Yes' : 'No'),
    escapeCSV(c.childProtectionPolicySigned ? 'Yes' : 'No'),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

// CSV Export generator for Donations
export function exportDonationsToCSV(donations: DonationRecord[]): string {
  const headers = [
    'Receipt No',
    'Date',
    'Donor Name',
    'Donor Code',
    'Category',
    'Anonymous',
    'Amount',
    'Currency',
    'Allocation Program',
    'Linked Beneficiary',
    'Payment Method',
    'Verification Status',
    'Received By',
    'Notes',
  ];

  const escapeCSV = (str: string | number | undefined | boolean) => {
    if (str === undefined || str === null) return '""';
    const clean = String(str).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = donations.map((d) => [
    escapeCSV(d.receiptNo),
    escapeCSV(d.date),
    escapeCSV(d.isAnonymous ? 'ANONYMOUS DONOR' : d.donorName),
    escapeCSV(d.donorCode),
    escapeCSV(d.donorCategory),
    escapeCSV(d.isAnonymous ? 'Yes' : 'No'),
    escapeCSV(d.amount),
    escapeCSV(d.currency),
    escapeCSV(d.allocationType),
    escapeCSV(d.linkedBeneficiaryName || 'N/A'),
    escapeCSV(d.paymentMethod),
    escapeCSV(d.status),
    escapeCSV(d.receivedBy),
    escapeCSV(d.notes),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}
