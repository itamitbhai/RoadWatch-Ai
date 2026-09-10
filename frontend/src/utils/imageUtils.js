// Downscales a citizen-uploaded image before it is stored as a data URL in
// localStorage, so a handful of complaint photos don't blow the ~5MB quota.
export function compressImageFile(file, { maxDim = 900, quality = 0.62 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Not an image file'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
}

// A canvas-rendered "plate" crop standing in for a real ANPR output — PNG
// (not SVG) so it can be embedded both in the UI and in generated PDFs.
export function renderPlateImage(plateText, color = '#facc15') {
  const canvas = document.createElement('canvas');
  canvas.width = 240;
  canvas.height = 70;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 240, 70);
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 236, 66);
  ctx.fillStyle = '#111827';
  ctx.font = '700 30px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(plateText, 120, 38);
  return canvas.toDataURL('image/png');
}

// A canvas-rendered "camera frame" evidence snapshot standing in for real
// footage — gradient background + AI bounding box + camera watermark, so
// the AI → Evidence → PDF pipeline has a real image to carry through.
export function renderEvidenceImage({ label, confidence, cameraId, emoji = '📷' }) {
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 270;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 270);
  grad.addColorStop(0, '#0b0f16');
  grad.addColorStop(1, '#1b2333');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 480, 270);

  ctx.font = '120px sans-serif';
  ctx.globalAlpha = 0.18;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 240, 135);
  ctx.globalAlpha = 1;

  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 3;
  ctx.strokeRect(150, 70, 190, 110);
  ctx.fillStyle = '#ef4444';
  ctx.font = '700 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const tagText = `${label} ${confidence}%`;
  const tagWidth = ctx.measureText(tagText).width + 12;
  ctx.fillRect(150, 50, tagWidth, 18);
  ctx.fillStyle = '#0b0f16';
  ctx.fillText(tagText, 156, 63);

  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(10, 238, 220, 22);
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 12px sans-serif';
  ctx.fillText(`${cameraId || 'CAM-001'} · AI DETECTION`, 16, 253);

  return canvas.toDataURL('image/jpeg', 0.82);
}
