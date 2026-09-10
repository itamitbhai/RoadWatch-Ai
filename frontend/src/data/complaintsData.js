// Mock/demo data for the citizen complaint module.
import { ROADS, randomInt, randomConfidence, pickRandom, jitterCoord } from './mockData';
import { renderEvidenceImage } from '../utils/imageUtils';
import { COMPLAINT_CATEGORIES, calculatePriority } from '../services/priorityService';
import { computeSlaDeadline } from '../services/slaService';

export { COMPLAINT_CATEGORIES };

export const COMPLAINT_STATUSES = ['Submitted', 'Under Review', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];

export const CATEGORY_EMOJI = {
  Pothole: '🕳️',
  'Damaged Road': '🛣️',
  'Broken Street Light': '💡',
  'Missing/Damaged Traffic Sign': '🛑',
  Waterlogging: '💧',
  'Road Obstruction': '🚧',
  'Illegal Parking': '🅿️',
  'Traffic Signal Malfunction': '🚦',
  'Garbage on Road': '🗑️',
  'Accident-Prone Location': '⚠️',
  'Broken Footpath': '🚶',
  'Road Marking Problem': '➰',
  Other: '📍',
};

export const DEPARTMENTS = [
  { id: 'DEPT-TP', name: 'Traffic Police', head: 'DSP Rajesh Ranjan', contact: 'traffic.police@patna.gov.in.demo' },
  { id: 'DEPT-MC', name: 'Municipal Corporation', head: 'Commissioner Anita Verma', contact: 'pmc@patna.gov.in.demo' },
  { id: 'DEPT-RH', name: 'Road & Highway Department', head: 'EE Sanjay Mishra', contact: 'roads@bihar.gov.in.demo' },
  { id: 'DEPT-EL', name: 'Electrical Department', head: 'AE Poonam Sinha', contact: 'electrical@patna.gov.in.demo' },
  { id: 'DEPT-TR', name: 'Transport Department', head: 'RTO Vikas Kumar', contact: 'transport@bihar.gov.in.demo' },
  { id: 'DEPT-ES', name: 'Emergency Services', head: 'Chief Fire Officer', contact: 'emergency@patna.gov.in.demo' },
  { id: 'DEPT-OT', name: 'Other', head: 'General Cell', contact: 'support@patna.gov.in.demo' },
];

const CATEGORY_DEPARTMENT = {
  Pothole: 'Road & Highway Department',
  'Damaged Road': 'Road & Highway Department',
  'Broken Footpath': 'Road & Highway Department',
  'Road Marking Problem': 'Road & Highway Department',
  'Broken Street Light': 'Electrical Department',
  'Missing/Damaged Traffic Sign': 'Traffic Police',
  'Illegal Parking': 'Traffic Police',
  'Traffic Signal Malfunction': 'Traffic Police',
  'Accident-Prone Location': 'Traffic Police',
  Waterlogging: 'Municipal Corporation',
  'Road Obstruction': 'Municipal Corporation',
  'Garbage on Road': 'Municipal Corporation',
  Other: 'Other',
};

export function departmentForCategory(category) {
  return CATEGORY_DEPARTMENT[category] || 'Other';
}

const DESCRIPTIONS = {
  Pothole: 'Large pothole in the middle of the road causing vehicles to swerve, especially dangerous at night.',
  'Damaged Road': 'Road surface has broken up badly after the rains, full of loose gravel and cracks.',
  'Broken Street Light': 'Street light has been non-functional for over a week, this stretch is very dark at night.',
  'Missing/Damaged Traffic Sign': 'Speed limit sign near the junction is bent and no longer visible to approaching traffic.',
  Waterlogging: 'Water logs up to knee height every time it rains, drains appear to be blocked.',
  'Road Obstruction': 'Construction material dumped on the road is narrowing the carriageway and causing jams.',
  'Illegal Parking': 'Vehicles parked on both sides of this narrow lane block emergency vehicle access.',
  'Traffic Signal Malfunction': 'Traffic signal has been stuck on red in all directions since morning.',
  'Garbage on Road': 'Garbage has been piling up on the roadside for days and is spilling onto the carriageway.',
  'Accident-Prone Location': 'Multiple near-miss incidents at this blind curve — no warning signage or mirror installed.',
  'Broken Footpath': 'Footpath slabs are broken and uneven, unsafe for pedestrians and wheelchair users.',
  'Road Marking Problem': 'Lane markings have completely faded, causing confusion during peak traffic hours.',
  Other: 'Reporting a general road/traffic safety concern in this area.',
};

const CITIZEN_NAMES = ['Rohit Sharma', 'Meena Devi', 'Arjun Verma', 'Fatima Khan', 'Sandeep Singh', 'Pooja Kumari', 'Vikram Das', 'Anita Roy'];

let complaintCounter = 1;
export function nextComplaintId() {
  return `CMP-2026-${String(complaintCounter++).padStart(5, '0')}`;
}

function backdated(minutesAgo) {
  return Date.now() - minutesAgo * 60 * 1000;
}

function initialStatusHistory(status, submittedAt) {
  const order = ['Submitted', 'Under Review', 'Verified', 'Assigned', 'In Progress', 'Resolved'];
  const idx = status === 'Rejected' ? 0 : order.indexOf(status);
  const history = [{ status: 'Submitted', at: submittedAt, note: 'Citizen submitted complaint via portal.', by: 'Citizen' }];
  for (let i = 1; i <= idx; i++) {
    history.push({ status: order[i], at: submittedAt + i * 3600 * 1000 * randomInt(2, 10), note: `Status updated to ${order[i]}.`, by: 'Admin' });
  }
  if (status === 'Rejected') {
    history.push({ status: 'Rejected', at: submittedAt + 3600 * 1000 * 6, note: 'Marked as not a valid road safety issue.', by: 'Admin' });
  }
  return history;
}

export function generateComplaint(overrides = {}) {
  const category = overrides.category || pickRandom(COMPLAINT_CATEGORIES);
  const road = pickRandom(ROADS);
  const submittedAt = overrides.submittedAt ?? backdated(randomInt(5, 6000));
  const status = overrides.status || 'Submitted';
  const locationImportance = pickRandom(['high', 'medium', 'medium', 'low']);
  const aiConfidence = randomConfidence(72, 97);
  const { priority } = calculatePriority({ category, locationImportance, similarCount: randomInt(0, 3), aiConfidence });
  const department = status === 'Submitted' || status === 'Under Review' ? null : departmentForCategory(category);
  const citizen = pickRandom(CITIZEN_NAMES);

  const complaint = {
    id: nextComplaintId(),
    category,
    description: DESCRIPTIONS[category],
    images: [renderEvidenceImage({ label: category, confidence: aiConfidence, cameraId: 'CITIZEN-UPLOAD', emoji: CATEGORY_EMOJI[category] })],
    videoMeta: null,
    location: road.name,
    landmark: `Near ${road.name} junction`,
    coords: jitterCoord(road.coords, 0.007),
    contactName: citizen,
    contactPhone: `9${randomInt(100000000, 999999999)}`,
    contactEmail: null,
    submittedAt,
    status,
    priority,
    aiConfidence,
    locationImportance,
    department,
    assignedAt: department ? submittedAt + 3 * 3600 * 1000 : null,
    slaDeadline: computeSlaDeadline(priority, submittedAt),
    statusHistory: initialStatusHistory(status, submittedAt),
    duplicateOf: null,
    resolution:
      status === 'Resolved'
        ? {
            images: [renderEvidenceImage({ label: 'Resolved', confidence: 100, cameraId: 'FIELD-STAFF', emoji: '✅' })],
            notes: 'Issue fixed by department field team and verified on-site.',
            resolvedAt: submittedAt + randomInt(24, 96) * 3600 * 1000,
            resolvedBy: 'Field Staff',
          }
        : null,
    feedback:
      status === 'Resolved' && Math.random() < 0.6
        ? { rating: randomInt(3, 5), satisfaction: pickRandom(['Yes', 'Partially', 'Yes']), comment: 'Thanks for the quick fix.', submittedAt: submittedAt + randomInt(100, 140) * 3600 * 1000 }
        : null,
    citizenNotified: status === 'Resolved',
    escalationLevel: 0,
    ...overrides,
  };
  return complaint;
}

export function createSeedComplaints() {
  const statusPlan = [
    'Submitted', 'Submitted', 'Under Review', 'Under Review', 'Verified',
    'Assigned', 'Assigned', 'In Progress', 'In Progress', 'In Progress',
    'Resolved', 'Resolved', 'Resolved', 'Resolved', 'Rejected',
  ];
  const complaints = statusPlan.map((status) => generateComplaint({ status }));
  return complaints.sort((a, b) => b.submittedAt - a.submittedAt);
}
