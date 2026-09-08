// Centralized mock/demo data for UrbanSense AI.
// Context: Patna, Bihar — realistic Indian urban transport scenario.

export const CITY_CENTER = [25.6093, 85.1376];

export const ROADS = [
  { name: 'Bailey Road', coords: [25.6152, 85.0839] },
  { name: 'Fraser Road', coords: [25.6127, 85.1466] },
  { name: 'Ashok Rajpath', coords: [25.6194, 85.1751] },
  { name: 'Gandhi Maidan Road', coords: [25.6093, 85.1376] },
  { name: 'Kankarbagh Road', coords: [25.5904, 85.1484] },
  { name: 'Boring Road', coords: [25.6064, 85.1122] },
  { name: 'Exhibition Road', coords: [25.6121, 85.1389] },
  { name: 'Danapur Road', coords: [25.6335, 85.0481] },
];

export const ROUTES = [
  { id: 'RT-01', name: 'Patna Junction → Gandhi Maidan', stops: ['Patna Junction', 'Ashok Rajpath', 'Gandhi Maidan'] },
  { id: 'RT-02', name: 'Danapur → Kankarbagh', stops: ['Danapur', 'Bailey Road', 'Kankarbagh'] },
  { id: 'RT-03', name: 'Boring Road → Ashok Rajpath', stops: ['Boring Road', 'Exhibition Road', 'Ashok Rajpath'] },
  { id: 'RT-04', name: 'Fraser Road → Exhibition Road', stops: ['Fraser Road', 'Gandhi Maidan', 'Exhibition Road'] },
  { id: 'RT-05', name: 'Patliputra → Rajendra Nagar', stops: ['Patliputra Colony', 'Boring Road', 'Rajendra Nagar'] },
  { id: 'RT-06', name: 'Kankarbagh → Patna Junction', stops: ['Kankarbagh', 'Gandhi Maidan', 'Patna Junction'] },
  { id: 'RT-07', name: 'Danapur → Ashok Rajpath', stops: ['Danapur', 'Bailey Road', 'Ashok Rajpath'] },
  { id: 'RT-08', name: 'Rajendra Nagar → Fraser Road', stops: ['Rajendra Nagar', 'Exhibition Road', 'Fraser Road'] },
  { id: 'RT-09', name: 'Gandhi Maidan → Danapur', stops: ['Gandhi Maidan', 'Bailey Road', 'Danapur'] },
  { id: 'RT-10', name: 'Kankarbagh → Boring Road', stops: ['Kankarbagh', 'Exhibition Road', 'Boring Road'] },
];

export const DETECTION_TYPES = [
  'Pothole',
  'Waterlogging',
  'Damaged Road',
  'Missing Divider',
  'Missing Zebra Crossing',
  'Damaged Traffic Sign',
];

export const TRAFFIC_EVENT_TYPES = [
  'Traffic Congestion',
  'Rash Driving',
  'Pedestrian Risk',
];

export const INCIDENT_TYPES = ['Hit & Run', 'Rash Driving', 'Pedestrian Risk', 'Accident', 'Road Hazard'];

export const CAMERA_LABELS = ['FRONT CAMERA', 'REAR CAMERA', 'LEFT CAMERA', 'RIGHT CAMERA'];

export const AI_OBJECT_LABELS = ['Vehicle', 'Car', 'Bus', 'Pedestrian', 'Pothole', 'Traffic Sign'];

const SEVERITIES = ['HIGH', 'MEDIUM', 'LOW'];
const STATUSES = ['Active', 'Investigating', 'Resolved'];
const INCIDENT_STATUSES = ['Reported', 'Investigating', 'Resolved'];

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min, max, decimals = 4) {
  return Number((Math.random() * (max - min) + min).toFixed(decimals));
}

export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function jitterCoord([lat, lng], radius = 0.01) {
  return [lat + randomFloat(-radius, radius, 5), lng + randomFloat(-radius, radius, 5)];
}

export function generatePlate() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const l1 = pickRandom(letters.split(''));
  const l2 = pickRandom(letters.split(''));
  const num = randomInt(1, 9);
  const digits = randomInt(1000, 9999);
  return `BR${String(num).padStart(2, '0')}${l1}${l2}${digits}`;
}

export function formatClock(date) {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

export function formatRelative(date) {
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 5) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr}h ago`;
}

// ---------- BUSES ----------
export const BUS_IDS = Array.from({ length: 10 }, (_, i) => `BUS-${101 + i}`);

export function createInitialBuses() {
  return BUS_IDS.map((id, i) => {
    const route = ROUTES[i % ROUTES.length];
    const base = jitterCoord(CITY_CENTER, 0.045);
    return {
      id,
      routeId: route.id,
      route: route.name,
      plate: generatePlate(),
      position: base,
      heading: randomInt(0, 359),
      speed: randomInt(18, 46),
      cameraStatus: 'Online',
      aiStatus: 'Active',
      detections: randomInt(80, 220),
      lastUpdate: new Date(),
      currentLocation: pickRandom(ROADS).name,
      driver: pickRandom(['R. Kumar', 'S. Yadav', 'A. Singh', 'M. Prasad', 'V. Sharma', 'D. Kumari']),
      occupancy: randomInt(15, 55),
    };
  });
}

// ---------- SEVERITY / CONFIDENCE HELPERS ----------
export function randomSeverity() {
  return pickRandom(SEVERITIES);
}

export function randomConfidence(min = 82, max = 98) {
  return randomInt(min, max);
}

// ---------- EVENT / DETECTION GENERATION ----------
let eventCounter = 1;
let incidentCounter = 1;

export function nextEventId() {
  return `EVT-${String(eventCounter++).padStart(5, '0')}`;
}

export function nextIncidentId() {
  return `INC-2026-${String(incidentCounter++).padStart(3, '0')}`;
}

export function generateRoadDetection(overrides = {}) {
  const type = pickRandom(DETECTION_TYPES);
  const road = pickRandom(ROADS);
  const bus = pickRandom(BUS_IDS);
  const severity = randomSeverity();
  const timestamp = overrides.timestamp || new Date();
  return {
    id: nextEventId(),
    category: 'road',
    type,
    severity,
    confidence: randomConfidence(78, 99),
    location: road.name,
    coords: jitterCoord(road.coords, 0.006),
    busId: bus,
    timestamp,
    status: pickRandom(STATUSES),
    ...overrides,
  };
}

export function generateTrafficEvent(overrides = {}) {
  const type = pickRandom(TRAFFIC_EVENT_TYPES);
  const road = pickRandom(ROADS);
  const bus = pickRandom(BUS_IDS);
  const timestamp = overrides.timestamp || new Date();
  return {
    id: nextEventId(),
    category: 'traffic',
    type,
    severity: randomSeverity(),
    confidence: randomConfidence(80, 98),
    location: road.name,
    coords: jitterCoord(road.coords, 0.006),
    busId: bus,
    timestamp,
    status: pickRandom(STATUSES),
    ...overrides,
  };
}

export function generateIncident(overrides = {}) {
  const type = pickRandom(INCIDENT_TYPES);
  const road = pickRandom(ROADS);
  const bus = pickRandom(BUS_IDS);
  const timestamp = overrides.timestamp || new Date();
  return {
    id: nextIncidentId(),
    category: 'incident',
    type,
    vehicleNumber: generatePlate(),
    plateConfidence: randomConfidence(85, 98),
    severity: type === 'Accident' || type === 'Hit & Run' ? 'HIGH' : randomSeverity(),
    confidence: randomConfidence(82, 97),
    location: road.name,
    coords: jitterCoord(road.coords, 0.006),
    busId: bus,
    timestamp,
    status: pickRandom(INCIDENT_STATUSES),
    ...overrides,
  };
}

function backdated(minutesAgo) {
  return new Date(Date.now() - minutesAgo * 60 * 1000);
}

// ---------- EMERGENCY RESPONSE (ambulance dispatch + police/department calls) ----------

export function distanceKm([lat1, lng1], [lat2, lng2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

const AMBULANCE_BASES = [
  { name: 'PMCH Ambulance Unit', coords: [25.6156, 85.1425] },
  { name: 'NMCH Ambulance Unit', coords: [25.5941, 85.1656] },
  { name: 'AIIMS Patna Ambulance Unit', coords: [25.5788, 85.05] },
  { name: 'Sadar Hospital Ambulance Unit', coords: [25.6089, 85.1296] },
  { name: 'IGIMS Ambulance Unit', coords: [25.6208, 85.0904] },
  { name: 'Kurji Holy Family Ambulance Unit', coords: [25.5891, 85.1035] },
];

export function createInitialAmbulances() {
  return AMBULANCE_BASES.map((b, i) => ({
    id: `AMB-0${i + 1}`,
    name: b.name,
    base: b.coords,
    position: b.coords,
    status: 'Available',
  }));
}

// Nearest police/fire/municipal units used to place automated department calls.
export const RESPONSE_UNITS = [
  { id: 'PS-01', name: 'Kotwali Police Station', department: 'Traffic Police Control Room', coords: [25.6127, 85.1466] },
  { id: 'PS-02', name: 'Gandhi Maidan Police Station', department: 'Traffic Police Control Room', coords: [25.6093, 85.1376] },
  { id: 'PS-03', name: 'Kankarbagh Police Station', department: 'Traffic Police Control Room', coords: [25.5904, 85.1484] },
  { id: 'PS-04', name: 'Danapur Police Station', department: 'Traffic Police Control Room', coords: [25.6335, 85.0481] },
  { id: 'FS-01', name: 'Patna Fire Station, Ashok Rajpath', department: 'Fire & Emergency Services', coords: [25.6194, 85.1751] },
  { id: 'MC-01', name: 'Patna Municipal Corporation — PWD Cell', department: 'Municipal Corporation (PWD)', coords: [25.6093, 85.1376] },
];

// Which responders are auto-notified per incident type.
export const INCIDENT_RESPONSE_MAP = {
  Accident: { ambulance: true, departments: ['Traffic Police Control Room', 'Fire & Emergency Services'] },
  'Hit & Run': { ambulance: true, departments: ['Traffic Police Control Room'] },
  'Pedestrian Risk': { ambulance: false, departments: ['Traffic Police Control Room'] },
  'Rash Driving': { ambulance: false, departments: ['Traffic Police Control Room'] },
  'Road Hazard': { ambulance: false, departments: ['Municipal Corporation (PWD)'] },
};

let dispatchCounter = 1;
let callCounter = 1;

export function nextDispatchId() {
  return `DSP-${String(dispatchCounter++).padStart(4, '0')}`;
}

export function nextCallId() {
  return `CALL-${String(callCounter++).padStart(4, '0')}`;
}

// Builds the ambulance dispatch + department call records for a newly reported incident,
// picking the nearest available unit of each required type by straight-line distance.
export function buildEmergencyResponse(incident, ambulances) {
  const config = INCIDENT_RESPONSE_MAP[incident.type] || { ambulance: false, departments: [] };
  const response = { dispatch: null, calls: [] };

  if (config.ambulance) {
    const pool = ambulances.filter((a) => a.status === 'Available');
    const candidates = pool.length ? pool : ambulances;
    const nearest = candidates.reduce(
      (best, unit) => {
        const d = distanceKm(unit.position, incident.coords);
        return d < best.d ? { unit, d } : best;
      },
      { unit: null, d: Infinity }
    );
    if (nearest.unit) {
      const avgSpeedKmh = 34;
      response.dispatch = {
        id: nextDispatchId(),
        incidentId: incident.id,
        incidentType: incident.type,
        ambulanceId: nearest.unit.id,
        ambulanceName: nearest.unit.name,
        originCoords: nearest.unit.position,
        targetCoords: incident.coords,
        location: incident.location,
        distanceKm: Number(nearest.d.toFixed(1)),
        etaMin: Math.max(2, Math.round((nearest.d / avgSpeedKmh) * 60)),
        status: 'Dispatched',
        timestamp: Date.now(),
      };
    }
  }

  config.departments.forEach((dept) => {
    const units = RESPONSE_UNITS.filter((u) => u.department === dept);
    const candidates = units.length ? units : RESPONSE_UNITS;
    const nearest = candidates.reduce(
      (best, unit) => {
        const d = distanceKm(unit.coords, incident.coords);
        return d < best.d ? { unit, d } : best;
      },
      { unit: null, d: Infinity }
    );
    if (nearest.unit) {
      response.calls.push({
        id: nextCallId(),
        incidentId: incident.id,
        incidentType: incident.type,
        department: dept,
        station: nearest.unit.name,
        location: incident.location,
        distanceKm: Number(nearest.d.toFixed(1)),
        status: 'Calling',
        timestamp: Date.now(),
      });
    }
  });

  return response;
}

// Seed at least 50 historical events across categories for demo richness.
export function createSeedEvents() {
  const events = [];
  for (let i = 0; i < 34; i++) {
    events.push(generateRoadDetection({ timestamp: backdated(randomInt(1, 600)) }));
  }
  for (let i = 0; i < 16; i++) {
    events.push(generateTrafficEvent({ timestamp: backdated(randomInt(1, 600)) }));
  }
  return events.sort((a, b) => b.timestamp - a.timestamp);
}

export function createSeedIncidents() {
  const incidents = [];
  for (let i = 0; i < 9; i++) {
    incidents.push(generateIncident({ timestamp: backdated(randomInt(1, 900)) }));
  }
  return incidents.sort((a, b) => b.timestamp - a.timestamp);
}

export const VEHICLE_CATEGORIES = ['Cars', 'Bikes', 'Buses', 'Trucks', 'Auto Rickshaws'];

export function createVehicleStats() {
  return {
    Cars: randomInt(3200, 4800),
    Bikes: randomInt(5200, 7600),
    Buses: randomInt(280, 420),
    Trucks: randomInt(600, 1100),
    'Auto Rickshaws': randomInt(1800, 2600),
  };
}

export function createHourlyVehicleSeries() {
  const hours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  return hours.map((h) => ({
    time: h,
    Cars: randomInt(150, 520),
    Bikes: randomInt(300, 780),
    Buses: randomInt(20, 60),
    Trucks: randomInt(40, 140),
  }));
}

export function congestionLabel(density) {
  if (density >= 80) return 'Severe';
  if (density >= 60) return 'High';
  if (density >= 40) return 'Moderate';
  return 'Low';
}

export function createRoadTrafficStats() {
  return ROADS.map((r) => {
    const density = randomInt(35, 96);
    return {
      road: r.name,
      coords: r.coords,
      density,
      avgSpeed: randomInt(12, 42),
      congestion: congestionLabel(density),
      delay: randomInt(2, 22),
    };
  });
}

export function createCongestionTrend() {
  const hours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  return hours.map((h) => ({ time: h, congestion: randomInt(20, 95) }));
}
