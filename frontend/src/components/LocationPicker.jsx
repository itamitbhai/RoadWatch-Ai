import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Crosshair, MapPin } from 'lucide-react';
import { CITY_CENTER } from '../data/mockData';
import { nearestRoad } from '../utils/geo';
import { buildIcon } from './map/mapIcons';

function ClickCatcher({ onPick }) {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function LocationPicker({ coords, onChange, landmark, onLandmarkChange }) {
  const [locating, setLocating] = useState(false);

  function pick(latlng) {
    const nearest = nearestRoad(latlng);
    onChange(latlng, nearest.name);
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        pick([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 6000 }
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-white/10" style={{ height: 240 }}>
        <MapContainer center={coords || CITY_CENTER} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" className="map-tiles-dark" />
          <ClickCatcher onPick={pick} />
          {coords && <Marker position={coords} icon={buildIcon('Road Hazard')} />}
        </MapContainer>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-60"
        >
          <Crosshair size={13} /> {locating ? 'Locating…' : 'Use My Current Location'}
        </button>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <MapPin size={12} /> Or click anywhere on the map to drop a pin
        </span>
      </div>
      <input
        value={landmark}
        onChange={(e) => onLandmarkChange(e.target.value)}
        placeholder="Landmark (e.g. near XYZ junction)"
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition-colors focus:border-cyan-500/40 focus:bg-white/[0.07]"
      />
    </div>
  );
}
