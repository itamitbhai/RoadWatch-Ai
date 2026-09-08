import L from 'leaflet';

const CATEGORY_META = {
  Bus: { emoji: '🚌', color: '#22d3ee' },
  Pothole: { emoji: '⚠️', color: '#f97316' },
  'Damaged Road': { emoji: '🛣️', color: '#f97316' },
  Waterlogging: { emoji: '💧', color: '#3b82f6' },
  'Missing Divider': { emoji: '🚧', color: '#eab308' },
  'Missing Zebra Crossing': { emoji: '🚸', color: '#eab308' },
  'Damaged Traffic Sign': { emoji: '🛑', color: '#eab308' },
  'Traffic Congestion': { emoji: '🚦', color: '#a855f7' },
  'Rash Driving': { emoji: '⚡', color: '#ef4444' },
  'Pedestrian Risk': { emoji: '🚷', color: '#ef4444' },
  'Hit & Run': { emoji: '🚨', color: '#ef4444' },
  Accident: { emoji: '🚨', color: '#ef4444' },
  'Road Hazard': { emoji: '⚠️', color: '#ef4444' },
  Ambulance: { emoji: '🚑', color: '#f43f5e' },
};

export function getCategoryMeta(type) {
  return CATEGORY_META[type] || { emoji: '📍', color: '#38bdf8' };
}

const cache = new Map();

export function buildIcon(type, { size = 30, pulse = false } = {}) {
  const key = `${type}-${size}-${pulse}`;
  if (cache.has(key)) return cache.get(key);
  const { emoji, color } = getCategoryMeta(type);
  const html = `
    <div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;">
      ${pulse ? `<span style="position:absolute;inset:0;border-radius:9999px;background:${color};opacity:0.35;animation:blip 1.8s ease-in-out infinite;"></span>` : ''}
      <div style="position:relative;width:${size}px;height:${size}px;border-radius:9999px;background:radial-gradient(circle at 30% 30%, ${color}dd, ${color}99);border:2px solid rgba(255,255,255,0.85);box-shadow:0 0 12px ${color}aa;display:flex;align-items:center;justify-content:center;font-size:${Math.round(size * 0.52)}px;line-height:1;">
        ${emoji}
      </div>
    </div>`;
  const icon = L.divIcon({
    html,
    className: 'urbansense-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
  cache.set(key, icon);
  return icon;
}
