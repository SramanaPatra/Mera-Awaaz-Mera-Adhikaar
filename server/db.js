import pg from 'pg';

const { Pool } = pg;

const mockSchemes = [
  {
    id: 1,
    title: 'Pradhan Mantri Artisan Skill & Tool Assistance',
    category: 'Skill Development',
    max_income_ceiling: 350000,
    target_occupation: 'Artisan',
    target_location: 'Urban',
    min_age: 18,
    max_age: 70,
    target_gender: 'All',
    financial_grant: 'INR 50,000 Stipend',
    subsidy_rate: '80 Percent Subsidy',
    description: 'Direct financial grant and advanced toolkits for urban craftspeople, handloom weavers, and informal creators.',
    document_checklist: ['Aadhaar Card', 'Income Certificate from Tehsildar', 'Artisan Guild Registry Card'],
    application_guide: ['Complete online registration on portal', 'Submit craft sample or skill certificate', 'Attend verification interview at district office']
  },
  {
    id: 2,
    title: 'National Smallholder Farmer Irrigation & Tech Scheme',
    category: 'Agriculture',
    max_income_ceiling: 450000,
    target_occupation: 'Farmer',
    target_location: 'Rural',
    min_age: 18,
    max_age: 75,
    target_gender: 'All',
    financial_grant: 'INR 1,20,000 Infrastructure',
    subsidy_rate: '90 Percent Subsidy',
    description: 'Subsidized drip irrigation systems and solar water pump installations for rural agricultural landholders.',
    document_checklist: ['Land Revenue Records (Khatian/Patta)', 'Bank Passbook Copy', 'Soil Testing Report'],
    application_guide: ['Upload land ownership documents', 'Select certified micro-irrigation vendor', 'Await physical field inspection verification']
  },
  {
    id: 3,
    title: 'Clean Energy Electric Vehicle Mobility Grant',
    category: 'Environmental',
    max_income_ceiling: 600000,
    target_occupation: 'Transport',
    target_location: 'Urban',
    min_age: 20,
    max_age: 65,
    target_gender: 'All',
    financial_grant: 'INR 75,000 Voucher',
    subsidy_rate: '50 Percent Subsidy',
    description: 'Electric vehicle conversion incentives and zero-emission commercial transport permit fee waivers.',
    document_checklist: ['Commercial Driver License', 'Vehicle Registration Certificate (RC)', 'Proof of Residency'],
    application_guide: ['Register vehicle VIN on central transport portal', 'Submit emission test clearance certificate', 'Claim voucher at authorized EV station']
  },
  {
    id: 4,
    title: 'Mahila Udyami Micro-Enterprise Incubator Fund',
    category: 'Economic Empowerment',
    max_income_ceiling: 500000,
    target_occupation: 'Entrepreneur',
    target_location: 'All Regions',
    min_age: 18,
    max_age: 60,
    target_gender: 'Female',
    financial_grant: 'INR 2,00,000 Capital',
    subsidy_rate: '75 Percent Subsidy',
    description: 'Seed funding, equipment support, and digital financial literacy mentoring for women-led micro-enterprises.',
    document_checklist: ['Business Incorporation Draft', 'Applicant Aadhaar Card', 'Project Proposal Summary'],
    application_guide: ['Submit micro-enterprise project proposal draft', 'Complete 3-day digital orientation module', 'Receive direct bank transfer of capital grant']
  },
  {
    id: 5,
    title: 'Senior Citizen Comprehensive Health & Mobility Pass',
    category: 'Healthcare',
    max_income_ceiling: 350000,
    target_occupation: 'Retired',
    target_location: 'All Regions',
    min_age: 60,
    max_age: 100,
    target_gender: 'All',
    financial_grant: 'INR 1,00,000 Annual Coverage',
    subsidy_rate: '100 Percent Subsidy',
    description: 'Full financial coverage for mobility devices, essential chronic care medications, and home health services.',
    document_checklist: ['Age Proof (Voter ID / Aadhaar)', 'Medical Diagnostic Summary', 'Income Certificate'],
    application_guide: ['Enroll via regional health welfare portal', 'Select primary municipal care center', 'Receive digital health benefit passcard']
  }
];

const mockComplaints = [
  {
    id: 'CMP-8941',
    tracking_hash: '0x8F92A47B',
    title: 'Damaged Main Drainage Pipe Overflowing',
    category: 'Sanitation & Sewage',
    description: 'Raw sewage overflow creating biohazard on 5th Avenue intersection.',
    urgency: 'High Priority',
    latitude: 22.57260000,
    longitude: 88.36390000,
    location_descriptor: 'Kolkata Central District',
    location_name: 'Kolkata Central District',
    status: 'Escalated',
    upvotes: 42,
    reported_at: new Date(Date.now() - 52 * 3600 * 1000).toISOString(),
    resolved_at: null,
    resolution_note: null
  },
  {
    id: 'CMP-7820',
    tracking_hash: '0x7B20C49E',
    title: 'Streetlight Blackout in High-Pedestrian Zone',
    category: 'Public Safety',
    description: 'Multiple streetlights non-operational along 12th St causing safety risks.',
    urgency: 'Critical Emergency',
    latitude: 19.07600000,
    longitude: 72.87770000,
    location_descriptor: 'Mumbai West Corridor',
    location_name: 'Mumbai West Corridor',
    status: 'Pending',
    upvotes: 19,
    reported_at: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
    resolved_at: null,
    resolution_note: null
  },
  {
    id: 'CMP-6512',
    tracking_hash: '0x6512A91D',
    title: 'Pothole Hazard Near School Zone Entrance',
    category: 'Infrastructure',
    description: 'Deep road crater causing vehicle damage and safety risks for school buses.',
    urgency: 'Medium Priority',
    latitude: 28.61390000,
    longitude: 77.20900000,
    location_descriptor: 'New Delhi North Metro',
    location_name: 'New Delhi North Metro',
    status: 'Resolved',
    upvotes: 58,
    reported_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    resolution_note: 'Municipal road team asphalted surface layer.'
  },
  {
    id: 'CMP-5201',
    tracking_hash: '0x5201F82C',
    title: 'Contaminated Public Water Dispenser Line',
    category: 'Water Supply',
    description: 'Turbid water running from public drinking station near central park.',
    urgency: 'High Priority',
    latitude: 13.08270000,
    longitude: 80.27070000,
    location_descriptor: 'Chennai East Ward',
    location_name: 'Chennai East Ward',
    status: 'Pending',
    upvotes: 31,
    reported_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    resolved_at: null,
    resolution_note: null
  }
];

const mockApplications = [];
const mockLogs = [];
const mockEmergencySignals = [];

let pool = null;
let useDatabase = false;

try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/civic_db',
    connectionTimeoutMillis: 2000
  });
} catch (e) {
  useDatabase = false;
}

export const dbState = {
  schemes: mockSchemes,
  complaints: mockComplaints,
  applications: mockApplications,
  logs: mockLogs,
  emergencySignals: mockEmergencySignals
};

export async function query(text, params) {
  if (useDatabase && pool) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      useDatabase = false;
    }
  }

  const queryStr = text.trim().toLowerCase();

  if (queryStr.includes('select * from welfare_schemes') || queryStr.includes('from welfare_schemes')) {
    return { rows: dbState.schemes };
  }

  if (queryStr.includes('select * from civic_complaints') || queryStr.includes('from civic_complaints')) {
    return { rows: dbState.complaints };
  }

  if (queryStr.includes('select * from admin_logs') || queryStr.includes('from admin_logs')) {
    return { rows: dbState.logs };
  }

  if (queryStr.includes('select * from emergency_signals') || queryStr.includes('from emergency_signals')) {
    return { rows: dbState.emergencySignals };
  }

  return { rows: [] };
}

export default {
  query,
  dbState
};
