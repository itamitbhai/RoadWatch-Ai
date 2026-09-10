import { useState } from 'react';
import { ImagePlus, Video, X, Loader2 } from 'lucide-react';
import { compressImageFile, formatBytes } from '../utils/imageUtils';

export default function EvidenceUploader({ images, onImagesChange, videoMeta, onVideoChange, maxImages = 4 }) {
  const [busy, setBusy] = useState(false);

  async function handleImages(e) {
    const files = Array.from(e.target.files || []).slice(0, Math.max(0, maxImages - images.length));
    if (!files.length) return;
    setBusy(true);
    try {
      const compressed = await Promise.all(files.map((f) => compressImageFile(f)));
      onImagesChange([...images, ...compressed]);
    } catch {
      // Unreadable/unsupported file — silently skip in this demo uploader.
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  }

  function handleVideo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    onVideoChange({ name: file.name, size: file.size, previewUrl: URL.createObjectURL(file) });
    e.target.value = '';
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {images.map((src, i) => (
          <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-white/10">
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onImagesChange(images.filter((_, idx) => idx !== i))}
              className="absolute right-1 top-1 rounded-full bg-black/70 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {images.length < maxImages && (
          <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-white/15 text-slate-400 hover:border-cyan-500/40 hover:text-cyan-300">
            {busy ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
            <span className="text-[10px]">Add photo</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
          </label>
        )}
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10">
        <Video size={14} />
        {videoMeta ? `${videoMeta.name} (${formatBytes(videoMeta.size)})` : 'Upload video (optional)'}
        <input type="file" accept="video/*" className="hidden" onChange={handleVideo} />
      </label>
    </div>
  );
}
