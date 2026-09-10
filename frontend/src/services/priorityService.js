// AI-assisted complaint prioritization — a heuristic scoring helper, NOT a
// certified government risk model. Combines issue severity, traffic impact,
// safety risk, location importance, similar-complaint volume and AI
// confidence into a CRITICAL/HIGH/MEDIUM/LOW label with a short rationale.

const CATEGORY_SEVERITY = {
  'Accident-Prone Location': 4,
  'Traffic Signal Malfunction': 4,
  Pothole: 3,
  'Road Obstruction': 3,
  Waterlogging: 3,
  'Damaged Road': 3,
  'Broken Street Light': 2,
  'Missing/Damaged Traffic Sign': 2,
  'Road Marking Problem': 2,
  'Illegal Parking': 1,
  'Garbage on Road': 1,
  'Broken Footpath': 1,
  Other: 1,
};

const IMPORTANCE_WEIGHT = { high: 3, medium: 2, low: 1 };

export function calculatePriority({
  category = 'Other',
  locationImportance = 'medium',
  similarCount = 0,
  aiConfidence = 85,
}) {
  const categoryScore = CATEGORY_SEVERITY[category] ?? 2;
  const locationScore = IMPORTANCE_WEIGHT[locationImportance] ?? 2;
  const similarScore = Math.min(3, similarCount);
  const confidenceScore = aiConfidence >= 90 ? 2 : aiConfidence >= 75 ? 1 : 0;
  const score = categoryScore + locationScore + similarScore + confidenceScore;

  let priority = 'LOW';
  if (score >= 10) priority = 'CRITICAL';
  else if (score >= 7) priority = 'HIGH';
  else if (score >= 4) priority = 'MEDIUM';

  return {
    priority,
    score,
    explanation: `AI-assisted priority (heuristic, not a certified risk model): ${category} severity, ${locationImportance} location importance, ${similarCount} similar report(s) nearby, and ${aiConfidence}% AI confidence combine to a score of ${score}/13.`,
  };
}

export const COMPLAINT_CATEGORIES = Object.keys(CATEGORY_SEVERITY);
