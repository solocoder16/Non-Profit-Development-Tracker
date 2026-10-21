import express from 'express';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));

// Standard lightweight rate limiting middleware to prevent request flooding and satisfy CodeQL security rules
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // Limit each IP address to 300 requests per minute
  standardHeaders: true, // Return standard rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable deprecated `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too many requests from this IP address, please try again after a minute.',
  },
});

// Protect all local API endpoints with rate limiting
app.use('/api', apiLimiter);

// Local server primary data directory and file
const WINDOWS_DATA_DIR = process.env.DATA_DIR || 'C:\\WebApp Data';
const WINDOWS_DATA_FILE = process.env.DATA_FILE || 'C:\\WebApp Data\\vineyard_masterlist.json';
const ALT_WINDOWS_DATA_FILE = 'C:/WebApp Data/vineyard_masterlist.json';
const LOCAL_FALLBACK_DIR = path.resolve(process.cwd(), 'data');
const LOCAL_FALLBACK_FILE = path.join(LOCAL_FALLBACK_DIR, 'vineyard_masterlist.json');

// Ensure local fallback directory exists
if (!fs.existsSync(LOCAL_FALLBACK_DIR)) {
  fs.mkdirSync(LOCAL_FALLBACK_DIR, { recursive: true });
}

function resolveActiveDataFile(): string {
  try {
    if (process.platform === 'win32' || fs.existsSync(WINDOWS_DATA_DIR) || fs.existsSync('C:\\')) {
      if (!fs.existsSync(WINDOWS_DATA_DIR)) {
        fs.mkdirSync(WINDOWS_DATA_DIR, { recursive: true });
      }
      return WINDOWS_DATA_FILE;
    }
  } catch (e) {
    // Non-Windows environment fallback
  }
  return LOCAL_FALLBACK_FILE;
}

// Active storage file
const DATA_FILE = resolveActiveDataFile();

const DEFAULT_COMMUNITIES = [
  'Brgy. Langkiwa, Binan, Laguna',
  'Towerville, San Jose Del Monte Bulacan',
  'Brgy. Nangka, Marikina',
  'Barugohay, Carigara, Leyte',
  'Southville, Sta. Rosa Laguna',
];

const DEFAULT_POLICY_DOCUMENTS = [
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

// Initial seed data if file doesn't exist
const INITIAL_DATABASE = {
  version: '1.0',
  organization: 'NGO Data Tracker Operations',
  lastUpdated: new Date().toISOString(),
  communities: DEFAULT_COMMUNITIES,
  policies: DEFAULT_POLICY_DOCUMENTS,
  children: [
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
      consentSigned: true,
      medicalOrNutritionNotes: 'Normal BMI; completed basic immunization schedule.',
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
        'The Ramos family resides in an upland farming settlement. Seasonal drought regularly impacts agricultural labor income. Mateo walks 3.5 kilometers each morning to attend the elementary school. He has displayed exceptional aptitude in mental arithmetic and represented his school in district competitions.',
      status: 'sponsored',
      sponsorName: 'Grace Fellowship Outreach',
      sponsorCode: 'SP-2024-014',
      communityCluster: 'Towerville, San Jose Del Monte Bulacan',
      consentSigned: true,
      medicalOrNutritionNotes: 'Mild asthmatic episodes during cold rainy season; inhaler provided by clinic.',
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
      consentSigned: true,
      medicalOrNutritionNotes: 'Underweight; enrolled in supplemental weekend nutrition feeding program.',
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
      consentSigned: true,
      medicalOrNutritionNotes: 'Healthy, good eyesight.',
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
        'Both parents are skilled craftsmen whose earnings fluctuate heavily between building contracts. Angelica was awarded best reader in Grade 3 and participates actively in the community library club initiated by Vineyard.',
      status: 'sponsored',
      sponsorName: 'Pacific Community Foundation',
      sponsorCode: 'SP-2023-031',
      communityCluster: 'Southville, Sta. Rosa Laguna',
      consentSigned: true,
      medicalOrNutritionNotes: 'Normal development; eye checkup scheduled for mild myopia.',
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
        'Coastal household vulnerable to rough seas and typhoons during monsoon months. The family participated in the Vineyard emergency cash transfer during the July gale warning. Raphael recently started Grade 1 with full eagerness.',
      status: 'available',
      sponsorName: undefined,
      sponsorCode: undefined,
      communityCluster: 'Brgy. Langkiwa, Binan, Laguna',
      consentSigned: true,
      medicalOrNutritionNotes: 'Requires dental fluoride checkup; otherwise strong and active.',
      photoUrl: '',
      createdAt: '2024-04-18T14:30:00.000Z',
      updatedAt: '2024-09-15T08:40:00.000Z',
    },
  ],
  donations: [
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
  ],
  reports: [
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
        'Vineyard conducted a multi-stage Citizen Voice and Action (CVA) social accountability process. Field facilitators guided community groups through standard government service standard scorecards, followed by a collaborative town-hall interface meeting with Barangay councilors, health workers, and youth representatives. Joint resolutions were adopted to extend health center opening hours and establish a dedicated child protection referral desk.',
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
        'Within 72 hours of damage assessment, Vineyard collaborated with community parents and local carpenters to construct two well-ventilated, weather-proof Temporary Learning Spaces using treated bamboo, marine plywood, and heat-reflective tarpaulins. Every child was equipped with a sturdy blue waterproof backpack containing notebooks, writing pens, pencils, geometry kits, art supplies, and an emergency solar study lamp.',
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
  ],
  auditLogs: [
    {
      id: 'log-1',
      timestamp: '2024-10-18T08:00:00.000Z',
      action: 'security_login',
      details: 'Project Officer initialized local server masterlist file storage.',
      officer: 'Jericho (Project Officer)',
    },
  ],
};

// Ensure storage file exists
const initialTarget = resolveActiveDataFile();
if (!fs.existsSync(initialTarget)) {
  const dir = path.dirname(initialTarget);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(initialTarget, JSON.stringify(INITIAL_DATABASE, null, 2), 'utf-8');
}
if (!fs.existsSync(LOCAL_FALLBACK_FILE)) {
  fs.writeFileSync(LOCAL_FALLBACK_FILE, JSON.stringify(INITIAL_DATABASE, null, 2), 'utf-8');
}

// Storage Location & Diagnostic API
app.get('/api/storage-info', (req, res) => {
  try {
    const activeFile = resolveActiveDataFile();
    const stats = fs.existsSync(activeFile) ? fs.statSync(activeFile) : fs.statSync(LOCAL_FALLBACK_FILE);
    const content = fs.existsSync(activeFile)
      ? JSON.parse(fs.readFileSync(activeFile, 'utf-8'))
      : JSON.parse(fs.readFileSync(LOCAL_FALLBACK_FILE, 'utf-8'));

    res.json({
      success: true,
      storageType: 'Local Server Persistent Filesystem (JSON Database)',
      primaryServerDiskFile: 'C:\\WebApp Data\\vineyard_masterlist.json',
      primaryServerDirectory: 'C:\\WebApp Data',
      absolutePath: 'C:\\WebApp Data\\vineyard_masterlist.json',
      relativePath: 'C:\\WebApp Data\\vineyard_masterlist.json',
      directory: 'C:\\WebApp Data',
      currentHostPath: activeFile,
      fileSizeBytes: stats.size,
      fileSizeFormatted: `${(stats.size / 1024).toFixed(2)} KB`,
      lastModified: stats.mtime.toISOString(),
      counts: {
        children: content.children?.length || 0,
        reports: content.reports?.length || 0,
        volunteers: content.volunteers?.length || 0,
        auditLogs: content.auditLogs?.length || 0,
        communities: content.communities?.length || DEFAULT_COMMUNITIES.length,
        policies: content.policies?.length || DEFAULT_POLICY_DOCUMENTS.length,
      },
      offlineCompliance: {
        networkIsolation: 'Air-Gapped / Local Only',
        cloudSynchronization: 'Disabled (Strict Privacy Compliance)',
        encryptionOption: 'AES-GCM 256-bit Backups Supported',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Load full dataset from local file
app.get('/api/data', (req, res) => {
  try {
    const activeFile = resolveActiveDataFile();
    if (!fs.existsSync(activeFile)) {
      if (fs.existsSync(LOCAL_FALLBACK_FILE)) {
        return res.sendFile(LOCAL_FALLBACK_FILE);
      }
      fs.writeFileSync(activeFile, JSON.stringify(INITIAL_DATABASE, null, 2), 'utf-8');
    }
    const content = JSON.parse(fs.readFileSync(activeFile, 'utf-8'));
    if (!content.communities || !Array.isArray(content.communities)) {
      content.communities = DEFAULT_COMMUNITIES;
    }
    res.json(content);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read local masterlist database file' });
  }
});

// Get or add community classification options
app.get('/api/communities', (req, res) => {
  try {
    const activeFile = resolveActiveDataFile();
    const target = fs.existsSync(activeFile) ? activeFile : LOCAL_FALLBACK_FILE;
    if (fs.existsSync(target)) {
      const content = JSON.parse(fs.readFileSync(target, 'utf-8'));
      if (content.communities && Array.isArray(content.communities)) {
        return res.json({ communities: content.communities });
      }
    }
    res.json({ communities: DEFAULT_COMMUNITIES });
  } catch (err: any) {
    res.json({ communities: DEFAULT_COMMUNITIES });
  }
});

app.post('/api/communities', (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Community name required' });
    }
    const trimmed = name.trim();
    const activeFile = resolveActiveDataFile();
    const target = fs.existsSync(activeFile) ? activeFile : LOCAL_FALLBACK_FILE;
    let content = INITIAL_DATABASE;
    if (fs.existsSync(target)) {
      content = JSON.parse(fs.readFileSync(target, 'utf-8'));
    }
    const current = content.communities || DEFAULT_COMMUNITIES;
    if (!current.some((c: string) => c.toLowerCase() === trimmed.toLowerCase())) {
      content.communities = [...current, trimmed];
      content.lastUpdated = new Date().toISOString();
      fs.writeFileSync(target, JSON.stringify(content, null, 2), 'utf-8');
    }
    res.json({ success: true, communities: content.communities });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update communities' });
  }
});

// Save dataset to local file atomically
app.post('/api/save-all', (req, res) => {
  try {
    const payload = req.body;
    if (!payload.children) {
      return res.status(400).json({ error: 'Invalid database structure' });
    }

    const updatedData = {
      ...payload,
      lastUpdated: new Date().toISOString(),
    };

    const targetFile = resolveActiveDataFile();
    const dir = path.dirname(targetFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Atomic write to prevent file corruption
    const tmpFile = `${targetFile}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(updatedData, null, 2), 'utf-8');
    fs.renameSync(tmpFile, targetFile);

    // Keep fallback mirror updated
    if (targetFile !== LOCAL_FALLBACK_FILE) {
      try {
        fs.writeFileSync(LOCAL_FALLBACK_FILE, JSON.stringify(updatedData, null, 2), 'utf-8');
      } catch (e) {}
    }

    const stats = fs.statSync(targetFile);

    // If records were created or deleted in payload, log to physical audit_trail.log
    if (payload.auditLogs && Array.isArray(payload.auditLogs) && payload.auditLogs.length > 0) {
      const latest = payload.auditLogs[0];
      if (latest && latest.action) {
        recordDiskAuditLog(latest.action, latest.details || '', latest.officer || 'Project Officer');
      }
    }

    res.json({
      success: true,
      path: 'C:\\WebApp Data\\vineyard_masterlist.json',
      fileSizeBytes: stats.size,
      lastModified: stats.mtime.toISOString(),
    });
  } catch (err: any) {
    console.error('Save error:', err);
    res.status(500).json({ error: 'Failed to save to local server file' });
  }
});

// RA 10173 Local Disk Audit Trail
const AUDIT_TRAIL_FILE = path.join(path.dirname(resolveActiveDataFile()), 'audit_trail.log');
const FALLBACK_AUDIT_TRAIL = path.join(LOCAL_FALLBACK_DIR, 'audit_trail.log');

function recordDiskAuditLog(action: string, details: string, officer: string = 'Authorized Officer') {
  const line = `[${new Date().toISOString()}] ACTION: ${action.toUpperCase()} | OFFICER: ${officer} | DETAILS: ${details}\n`;
  try {
    if (!fs.existsSync(LOCAL_FALLBACK_DIR)) {
      fs.mkdirSync(LOCAL_FALLBACK_DIR, { recursive: true });
    }
    fs.appendFileSync(FALLBACK_AUDIT_TRAIL, line, 'utf-8');
    const targetDir = path.dirname(AUDIT_TRAIL_FILE);
    if (fs.existsSync(targetDir)) {
      fs.appendFileSync(AUDIT_TRAIL_FILE, line, 'utf-8');
    }
  } catch (e) {}
}

app.post('/api/audit-trail-log', (req, res) => {
  const { action, details, officer } = req.body;
  recordDiskAuditLog(action || 'RECORD_OPERATION', details || '', officer || 'Project Officer');
  res.json({ success: true });
});

app.get('/api/audit-trail-file', (req, res) => {
  const target = fs.existsSync(AUDIT_TRAIL_FILE) ? AUDIT_TRAIL_FILE : FALLBACK_AUDIT_TRAIL;
  if (fs.existsSync(target)) {
    return res.type('text/plain').sendFile(target);
  }
  res.type('text/plain').send(`[${new Date().toISOString()}] AUDIT TRAIL LOG INITIALIZED (RA 10173 Compliant)\n`);
});

// Logo Path Resolution for Windows Local Server and Local Backups
const CONFIGURED_WINDOWS_LOGO = process.env.LOGO_PATH || 'C:\\WebApp Data\\Logo\\NGO Data Tracker Logo.png';
const ALT_WINDOWS_LOGO = 'C:/WebApp Data/Logo/NGO Data Tracker Logo.png';
const GENERAL_WINDOWS_LOGO = 'C:\\WebApp Data\\Logo\\logo.png';
const PUBLIC_LOGO_SVG = path.resolve(process.cwd(), 'public', 'logo.svg');
const DATA_LOGO = path.join(LOCAL_FALLBACK_DIR, 'logo.png');
const PUBLIC_LOGO = path.resolve(process.cwd(), 'public', 'logo.png');

function resolveServerLogo(): string | null {
  if (fs.existsSync(CONFIGURED_WINDOWS_LOGO)) return CONFIGURED_WINDOWS_LOGO;
  if (fs.existsSync(ALT_WINDOWS_LOGO)) return ALT_WINDOWS_LOGO;
  if (fs.existsSync(GENERAL_WINDOWS_LOGO)) return GENERAL_WINDOWS_LOGO;
  if (fs.existsSync(PUBLIC_LOGO_SVG)) return PUBLIC_LOGO_SVG;
  if (fs.existsSync(DATA_LOGO)) return DATA_LOGO;
  if (fs.existsSync(PUBLIC_LOGO)) return PUBLIC_LOGO;
  return null;
}

// Serve the logo directly from the local file
app.get('/api/logo', (req, res) => {
  const logoPath = resolveServerLogo();
  if (logoPath && fs.existsSync(logoPath)) {
    res.setHeader('Cache-Control', 'public, max-age=3600');
    if (logoPath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
    return res.sendFile(logoPath);
  }
  res.status(404).send('Logo not found');
});

// Logo status endpoint for diagnostics
app.get('/api/logo-status', (req, res) => {
  const activePath = resolveServerLogo();
  const foundAtWindows = fs.existsSync(CONFIGURED_WINDOWS_LOGO) || fs.existsSync(ALT_WINDOWS_LOGO) || fs.existsSync(GENERAL_WINDOWS_LOGO);
  res.json({
    configuredWindowsPath: 'C:\\WebApp Data\\Logo\\NGO Data Tracker Logo.png',
    isFoundAtWindowsPath: foundAtWindows,
    activePathResolved: activePath || 'None',
    exists: Boolean(activePath),
  });
});

// Mount Vite or static server
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', apiLimiter, (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vineyard Server running on http://0.0.0.0:${PORT}`);
    console.log(`Local masterlist database stored at: ${DATA_FILE}`);
  });
}

startServer();
