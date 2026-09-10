// DEMO MODE — mock ANPR (Automatic Number Plate Recognition).
// A real deployment would run a plate-detection + OCR model against the
// camera frame; here we simulate the pipeline latency and return a
// plausible plate + confidence so the rest of the workflow (vehicle
// lookup, history, notifications) can be demonstrated end-to-end.
import { generatePlate, randomInt } from '../data/mockData';
import { renderPlateImage } from '../utils/imageUtils';

export function runAnpr({ knownPlate } = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const plate = knownPlate || generatePlate();
      const confidence = randomInt(84, 99);
      resolve({
        plate,
        confidence,
        plateImage: renderPlateImage(plate),
      });
    }, 900 + randomInt(0, 600));
  });
}
