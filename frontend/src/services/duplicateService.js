import { distanceKm } from '../data/mockData';

function tokenize(text) {
  return new Set(
    String(text || '')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 3)
  );
}

function textSimilarity(a, b) {
  const setA = tokenize(a);
  const setB = tokenize(b);
  if (!setA.size || !setB.size) return 0;
  let overlap = 0;
  setA.forEach((w) => {
    if (setB.has(w)) overlap += 1;
  });
  return overlap / Math.max(setA.size, setB.size);
}

// Flags likely-duplicate open complaints via coordinate proximity + category
// match + description keyword overlap — a lightweight stand-in for a real
// image/location clustering service.
export function findDuplicateCandidates(target, existingComplaints, { radiusKm = 0.12, minScore = 0.4 } = {}) {
  return existingComplaints
    .filter((c) => c.id !== target.id && !['Resolved', 'Rejected'].includes(c.status))
    .map((c) => {
      const sameCategory = c.category === target.category;
      const dist = target.coords && c.coords ? distanceKm(target.coords, c.coords) : Infinity;
      const locationScore = dist <= radiusKm ? 1 - dist / radiusKm : 0;
      const textScore = textSimilarity(target.description, c.description);
      const score = sameCategory ? locationScore * 0.65 + textScore * 0.35 : locationScore * 0.25;
      return { complaint: c, score: Number(score.toFixed(2)), distanceKm: Number(dist.toFixed(3)) };
    })
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score);
}
