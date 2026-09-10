import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { buildIcon } from './mapIcons';
import { CITY_CENTER } from '../../data/mockData';
import { SeverityBadge, PriorityBadge, StatusBadge } from '../Badge';
import { buildHotspots } from '../../utils/geo';

function congestionColor(density) {
  if (density >= 80) return '#ef4444';
  if (density >= 60) return '#f97316';
  if (density >= 40) return '#eab308';
  return '#22c55e';
}

export default function UrbanMap({
  buses = [],
  events = [],
  incidents = [],
  ambulances = [],
  dispatches = [],
  violations = [],
  complaints = [],
  showBuses = true,
  showHeatmap = false,
  showHotspots = false,
  roadTrafficStats = [],
  height = '480px',
  zoom = 13,
  center = CITY_CENTER,
  onSelect,
}) {
  const hotspots = showHotspots ? buildHotspots([...violations, ...complaints], 3) : [];
  return (
    <div style={{ height }} className="overflow-hidden rounded-2xl border border-white/10">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles-dark"
        />

        {showHeatmap &&
          roadTrafficStats.map((r) => (
            <Circle
              key={r.road}
              center={r.coords || center}
              radius={550 + r.density * 6}
              pathOptions={{
                color: congestionColor(r.density),
                fillColor: congestionColor(r.density),
                fillOpacity: 0.22,
                weight: 1.5,
                opacity: 0.6,
              }}
            />
          ))}

        {showBuses &&
          buses.map((bus) => (
            <Marker key={bus.id} position={bus.position} icon={buildIcon('Bus', { pulse: true })} eventHandlers={{ click: () => onSelect?.({ kind: 'bus', data: bus }) }}>
              <Popup>
                <div className="min-w-[180px] space-y-1 font-sans">
                  <p className="font-bold text-cyan-300">{bus.id}</p>
                  <p className="text-xs text-slate-300">{bus.route}</p>
                  <p className="text-xs text-slate-400">Speed: {bus.speed} km/h</p>
                  <p className="text-xs text-slate-400">Near: {bus.currentLocation}</p>
                  <p className="text-xs text-slate-400">AI: {bus.aiStatus} · Cam: {bus.cameraStatus}</p>
                </div>
              </Popup>
            </Marker>
          ))}

        {events.map((ev) => (
          <Marker key={ev.id} position={ev.coords} icon={buildIcon(ev.type)} eventHandlers={{ click: () => onSelect?.({ kind: 'event', data: ev }) }}>
            <Popup>
              <div className="min-w-[200px] space-y-1.5 font-sans">
                <p className="font-bold text-white">{ev.type}</p>
                <SeverityBadge severity={ev.severity} />
                <p className="text-xs text-slate-400">Confidence: {ev.confidence}%</p>
                <p className="text-xs text-slate-400">Bus: {ev.busId}</p>
                <p className="text-xs text-slate-400">Location: {ev.location}</p>
                <p className="text-xs text-slate-400">GPS: {ev.coords[0].toFixed(4)}, {ev.coords[1].toFixed(4)}</p>
                <p className="text-xs text-slate-500">{new Date(ev.timestamp).toLocaleTimeString('en-IN')}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {dispatches
          .filter((d) => d.status !== 'Completed')
          .map((d) => (
            <Polyline
              key={d.id}
              positions={[d.originCoords, d.targetCoords]}
              pathOptions={{ color: '#f43f5e', weight: 2, opacity: 0.55, dashArray: '6 8' }}
            />
          ))}

        {ambulances.map((amb) => (
          <Marker key={amb.id} position={amb.position} icon={buildIcon('Ambulance', { pulse: amb.status !== 'Available' })} eventHandlers={{ click: () => onSelect?.({ kind: 'ambulance', data: amb }) }}>
            <Popup>
              <div className="min-w-[180px] space-y-1 font-sans">
                <p className="font-bold text-rose-300">{amb.id}</p>
                <p className="text-xs text-slate-300">{amb.name}</p>
                <p className="text-xs text-slate-400">Status: {amb.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {showHotspots &&
          hotspots.map((h) => (
            <Circle
              key={`hotspot-${h.coords[0]}-${h.coords[1]}`}
              center={h.coords}
              radius={140 + h.count * 90}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: Math.min(0.5, 0.15 + h.count * 0.08), weight: 1, opacity: 0.5 }}
            />
          ))}

        {violations.map((v) => (
          <Marker key={v.id} position={v.coords} icon={buildIcon(v.violationType, { pulse: v.status === 'Pending' })} eventHandlers={{ click: () => onSelect?.({ kind: 'violation', data: v }) }}>
            <Popup>
              <div className="min-w-45 space-y-1.5 font-sans">
                <p className="font-bold text-white">{v.violationType}</p>
                <SeverityBadge severity={v.severity} />
                <p className="text-xs text-slate-400">Vehicle: {v.vehicleNumber}</p>
                <p className="text-xs text-slate-400">Confidence: {v.confidence}%</p>
                <p className="text-xs text-slate-400">Location: {v.location}</p>
                <p className="text-xs text-slate-500">{new Date(v.timestamp).toLocaleString('en-IN')}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {complaints.map((c) => (
          <Marker key={c.id} position={c.coords} icon={buildIcon(c.category, { pulse: c.status !== 'Resolved' })} eventHandlers={{ click: () => onSelect?.({ kind: 'complaint', data: c }) }}>
            <Popup>
              <div className="min-w-50 space-y-1.5 font-sans">
                <p className="font-bold text-white">{c.category}</p>
                <div className="flex gap-1.5">
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                </div>
                <p className="text-xs text-slate-400">{c.id}</p>
                <p className="text-xs text-slate-400">Location: {c.location}</p>
                <p className="text-xs text-slate-500">{new Date(c.submittedAt).toLocaleString('en-IN')}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {incidents.map((inc) => (
          <Marker key={inc.id} position={inc.coords} icon={buildIcon(inc.type, { pulse: inc.status !== 'Resolved' })} eventHandlers={{ click: () => onSelect?.({ kind: 'incident', data: inc }) }}>
            <Popup>
              <div className="min-w-[200px] space-y-1.5 font-sans">
                <p className="font-bold text-rose-300">{inc.type}</p>
                <SeverityBadge severity={inc.severity} />
                <p className="text-xs text-slate-400">Vehicle: {inc.vehicleNumber}</p>
                <p className="text-xs text-slate-400">Confidence: {inc.confidence}%</p>
                <p className="text-xs text-slate-400">Bus: {inc.busId}</p>
                <p className="text-xs text-slate-400">Location: {inc.location}</p>
                <p className="text-xs text-slate-500">{new Date(inc.timestamp).toLocaleTimeString('en-IN')}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
