import { ROADS, distanceKm } from '../data/mockData';

export { distanceKm };

export function nearestRoad(coords) {
  return ROADS.reduce((best, r) => {
    const d = distanceKm(r.coords, coords);
    return d < best.d ? { d, name: r.name, coords: r.coords } : best;
  }, { d: Infinity, name: ROADS[0].name, coords: ROADS[0].coords });
}

// Buckets coordinates into a coarse grid so nearby reports can be counted
// as a "hotspot" without pulling in a dedicated heat-layer library.
export function gridKey([lat, lng], precision = 3) {
  return `${lat.toFixed(precision)}:${lng.toFixed(precision)}`;
}

export function buildHotspots(points, precision = 3) {
  const buckets = new Map();
  points.forEach((p) => {
    if (!p.coords) return;
    const key = gridKey(p.coords, precision);
    if (!buckets.has(key)) buckets.set(key, { coords: p.coords, count: 0 });
    buckets.get(key).count += 1;
  });
  return Array.from(buckets.values());
}
