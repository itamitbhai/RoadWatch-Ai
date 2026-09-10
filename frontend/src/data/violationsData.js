// Mock/demo data for the violation detection + ANPR + vehicle registry
// modules. Follows the same conventions as mockData.js (padded counter IDs,
// severity/status enums, [lat,lng] coords) so it slots into the existing
// UI components without special-casing.
import { ROADS, randomInt, randomConfidence, pickRandom, jitterCoord, generatePlate } from './mockData';
import { renderEvidenceImage, renderPlateImage } from '../utils/imageUtils';

export const VIOLATION_TYPES = [
  'Helmet Violation',
  'Triple Riding',
  'Red Light Violation',
  'Wrong-Side Driving',
  'Over-Speeding',
  'No Seatbelt',
  'Illegal Parking',
  'Number Plate Violation',
  'Signal Jumping',
  'Using Phone While Driving',
];

export const VIOLATION_STATUSES = ['Pending', 'Verified', 'Rejected', 'Enforced'];
export const NOTIFICATION_STATUSES = ['Pending', 'Processing', 'Sent', 'Delivered', 'Failed'];
export const VEHICLE_TYPES = ['Motorcycle', 'Car', 'Auto Rickshaw', 'Bus', 'Truck'];

const OWNER_FIRST = ['Ravi', 'Sunita', 'Amit', 'Priya', 'Manoj', 'Kavita', 'Deepak', 'Neha', 'Suresh', 'Anjali'];
const OWNER_LAST = ['Kumar', 'Yadav', 'Singh', 'Prasad', 'Sharma', 'Kumari', 'Verma', 'Das', 'Chaudhary', 'Gupta'];

export const CAMERA_IDS = Array.from({ length: 16 }, (_, i) => `CAM-${String(i + 1).padStart(3, '0')}`);

function severityForType(type) {
  if (['Over-Speeding', 'Wrong-Side Driving', 'Red Light Violation', 'Signal Jumping'].includes(type)) return 'HIGH';
  if (['Triple Riding', 'No Seatbelt', 'Using Phone While Driving'].includes(type)) return 'MEDIUM';
  return 'LOW';
}

let violationCounter = 1;
export function nextViolationId() {
  return `TV-2026-${String(violationCounter++).padStart(6, '0')}`;
}

function aiAnalysisFor(type, confidence) {
  return `AI detection engine flagged this frame as "${type}" with ${confidence}% confidence. Bounding box and plate crop attached below. Requires department verification before enforcement.`;
}

export function generateViolation(overrides = {}) {
  const type = overrides.violationType || pickRandom(VIOLATION_TYPES);
  const road = pickRandom(ROADS);
  const confidence = overrides.confidence ?? randomConfidence(80, 99);
  const cameraId = overrides.cameraId || pickRandom(CAMERA_IDS);
  const plate = overrides.vehicleNumber || generatePlate();
  const timestamp = overrides.timestamp || new Date();
  return {
    id: nextViolationId(),
    category: 'violation',
    violationType: type,
    vehicleNumber: plate,
    severity: severityForType(type),
    confidence,
    location: road.name,
    coords: jitterCoord(road.coords, 0.006),
    cameraId,
    timestamp,
    status: 'Pending',
    notificationStatus: 'Pending',
    evidenceImage: renderEvidenceImage({ label: type, confidence, cameraId }),
    plateImage: renderPlateImage(plate),
    plateConfidence: randomConfidence(85, 99),
    aiAnalysis: aiAnalysisFor(type, confidence),
    source: overrides.source || 'Camera Feed',
    ...overrides,
  };
}

function backdated(minutesAgo) {
  return new Date(Date.now() - minutesAgo * 60 * 1000);
}

export function createVehicleRecord(plate) {
  return {
    plate,
    ownerName: `${pickRandom(OWNER_FIRST)} ${pickRandom(OWNER_LAST)}`,
    vehicleType: pickRandom(VEHICLE_TYPES),
    color: pickRandom(['White', 'Black', 'Silver', 'Red', 'Blue', 'Grey']),
    registeredSince: 2016 + randomInt(0, 8),
    model: pickRandom(['Hero Splendor', 'Honda Activa', 'Maruti Swift', 'Tata Ace', 'Bajaj Pulsar', 'Hyundai i20']),
  };
}

export function createSeedVehicles() {
  const plates = new Set();
  while (plates.size < 12) plates.add(generatePlate());
  return Array.from(plates).map((plate) => createVehicleRecord(plate));
}

// Derives violation counts / risk status per vehicle from the live
// violations list — kept as a pure selector so it always reflects current
// state rather than duplicating counts in two places.
export function withViolationHistory(vehicles, violations) {
  return vehicles.map((v) => {
    const vehicleViolations = violations
      .filter((viol) => viol.vehicleNumber === v.plate)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const totalViolations = vehicleViolations.length;
    const riskStatus = totalViolations >= 4 ? 'HIGH' : totalViolations >= 2 ? 'MEDIUM' : 'LOW';
    return {
      ...v,
      totalViolations,
      riskStatus,
      lastViolation: vehicleViolations[0] || null,
      violations: vehicleViolations,
    };
  });
}

export function createSeedViolations(vehicles) {
  const violations = [];
  for (let i = 0; i < 24; i++) {
    const useKnownPlate = Math.random() < 0.55;
    violations.push(
      generateViolation({
        timestamp: backdated(randomInt(5, 4000)),
        vehicleNumber: useKnownPlate ? pickRandom(vehicles).plate : generatePlate(),
        status: pickRandom(['Pending', 'Verified', 'Verified', 'Enforced', 'Rejected']),
        notificationStatus: pickRandom(['Sent', 'Delivered', 'Delivered', 'Pending', 'Failed']),
      })
    );
  }
  return violations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}
