/**
 * Sketch Mask Processor - Multimodal Control Signal Translation
 * Converts user sketch strokes into OAL (Object Alignment Loss) and CCL (Color Consistency Loss) control maps
 */

export interface SketchAnalysis {
  binaryMask: string; // WebP data URL with alpha channel
  structuralMap: StructuralConstraints;
  colorMap: ColorGuidance[];
  featherAmount: number;
}

export interface StructuralConstraints {
  lineGeometry: LineSegment[];
  densityMap: number[][]; // 2D array representing stroke density
  confidenceScore: number;
}

export interface LineSegment {
  points: { x: number; y: number }[];
  thickness: number;
  confidence: number;
}

export interface ColorGuidance {
  color: string; // HSL format
  region: { x: number; y: number; width: number; height: number };
  weight: number; // 0-1, how strongly this color should influence
}

/**
 * Analyzes sketch and extracts multimodal control signals
 */
export const analyzeSketch = (
  sketchCanvas: HTMLCanvasElement,
  options: {
    featherAmount?: number;
    structureWeight?: number;
    colorWeight?: number;
  } = {}
): SketchAnalysis => {
  const ctx = sketchCanvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const { featherAmount = 0.03, structureWeight = 0.7, colorWeight = 0.3 } = options;

  const imageData = ctx.getImageData(0, 0, sketchCanvas.width, sketchCanvas.height);
  const { width, height, data } = imageData;

  // Extract structural map (line geometry)
  const structuralMap = extractStructuralMap(data, width, height, structureWeight);

  // Extract color guidance
  const colorMap = extractColorGuidance(data, width, height, colorWeight);

  // Generate binary mask with feathering
  const binaryMask = createFeatheredMask(data, width, height, featherAmount);

  return {
    binaryMask,
    structuralMap,
    colorMap,
    featherAmount,
  };
};

/**
 * Extracts line geometry and creates structural constraints (OAL analog)
 */
const extractStructuralMap = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  weight: number
): StructuralConstraints => {
  const lineGeometry: LineSegment[] = [];
  const densityMap: number[][] = Array(height).fill(0).map(() => Array(width).fill(0));

  // Scan for contiguous stroke regions
  const visited = new Set<string>();
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      
      // Track density for all pixels with content
      if (alpha > 0) {
        densityMap[y][x] = alpha / 255;
      }

      // Start new line segment if we find an unvisited edge
      if (alpha > 128 && !visited.has(`${x},${y}`)) {
        const segment = traceLineSegment(data, width, height, x, y, visited);
        if (segment.points.length > 2) {
          lineGeometry.push(segment);
        }
      }
    }
  }

  // Calculate confidence based on line clarity and density
  const totalPixels = width * height;
  const strokePixels = lineGeometry.reduce((sum, seg) => sum + seg.points.length, 0);
  const confidenceScore = Math.min(1, (strokePixels / totalPixels) * 10 * weight);

  return {
    lineGeometry,
    densityMap,
    confidenceScore,
  };
};

/**
 * Traces a continuous line segment from a starting point
 */
const traceLineSegment = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  startX: number,
  startY: number,
  visited: Set<string>
): LineSegment => {
  const points: { x: number; y: number }[] = [];
  const stack: { x: number; y: number }[] = [{ x: startX, y: startY }];
  let totalThickness = 0;
  let count = 0;

  while (stack.length > 0 && count < 1000) { // Limit to prevent infinite loops
    const { x, y } = stack.pop()!;
    const key = `${x},${y}`;
    
    if (visited.has(key)) continue;
    visited.add(key);

    const idx = (y * width + x) * 4;
    const alpha = data[idx + 3];
    
    if (alpha > 128) {
      points.push({ x, y });
      totalThickness += alpha / 255;
      count++;

      // Check 8-connected neighbors
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            stack.push({ x: nx, y: ny });
          }
        }
      }
    }
  }

  const avgThickness = count > 0 ? totalThickness / count : 0.5;

  return {
    points,
    thickness: avgThickness,
    confidence: Math.min(1, count / 10), // More points = higher confidence
  };
};

/**
 * Extracts color guidance from sketch strokes (CCL analog)
 */
const extractColorGuidance = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  weight: number
): ColorGuidance[] => {
  const colorRegions = new Map<string, { pixels: { x: number; y: number }[]; color: { r: number; g: number; b: number } }>();

  // Scan for distinct color regions
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      
      if (alpha > 128) {
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        // Quantize color to reduce variations
        const colorKey = `${Math.floor(r / 32)},${Math.floor(g / 32)},${Math.floor(b / 32)}`;
        
        if (!colorRegions.has(colorKey)) {
          colorRegions.set(colorKey, { pixels: [], color: { r, g, b } });
        }
        colorRegions.get(colorKey)!.pixels.push({ x, y });
      }
    }
  }

  // Convert regions to ColorGuidance
  const colorMap: ColorGuidance[] = [];
  
  colorRegions.forEach((region) => {
    if (region.pixels.length < 10) return; // Ignore tiny regions
    
    // Calculate bounding box
    const xs = region.pixels.map(p => p.x);
    const ys = region.pixels.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    // Convert RGB to HSL
    const { r, g, b } = region.color;
    const hsl = rgbToHsl(r, g, b);
    
    colorMap.push({
      color: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      region: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      },
      weight: Math.min(1, (region.pixels.length / (width * height)) * 100 * weight),
    });
  });

  return colorMap;
};

/**
 * Creates a feathered binary mask with smooth transitions
 */
const createFeatheredMask = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  featherAmount: number
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create mask canvas');

  const maskData = ctx.createImageData(width, height);
  const featherRadius = Math.max(1, Math.floor(Math.min(width, height) * featherAmount));

  // Calculate distance transform for feathering
  const distances = calculateDistanceTransform(data, width, height);

  for (let i = 0; i < data.length; i += 4) {
    const pixelIdx = i / 4;
    const alpha = data[i + 3];
    const distance = distances[pixelIdx];

    // Apply feathering based on distance to edge
    let featheredAlpha = alpha;
    if (distance < featherRadius && alpha > 0) {
      const fadeRatio = distance / featherRadius;
      featheredAlpha = Math.floor(alpha * fadeRatio);
    }

    // Copy RGB (white for mask)
    maskData.data[i] = 255;
    maskData.data[i + 1] = 255;
    maskData.data[i + 2] = 255;
    maskData.data[i + 3] = featheredAlpha;
  }

  ctx.putImageData(maskData, 0, 0);
  
  // Convert to lossless WebP
  return canvas.toDataURL('image/png'); // Fallback to PNG for broad compatibility
};

/**
 * Calculates distance transform for edge feathering
 */
const calculateDistanceTransform = (
  data: Uint8ClampedArray,
  width: number,
  height: number
): Float32Array => {
  const distances = new Float32Array((width * height));
  const maxDist = Math.sqrt(width * width + height * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const alpha = data[idx * 4 + 3];
      
      if (alpha > 128) {
        // Find distance to nearest transparent pixel
        let minDist = maxDist;
        const searchRadius = 20; // Limit search for performance
        
        for (let dy = -searchRadius; dy <= searchRadius; dy++) {
          for (let dx = -searchRadius; dx <= searchRadius; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = (ny * width + nx) * 4 + 3;
              if (data[nIdx] < 128) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                minDist = Math.min(minDist, dist);
              }
            }
          }
        }
        
        distances[idx] = minDist;
      } else {
        distances[idx] = 0;
      }
    }
  }

  return distances;
};

/**
 * RGB to HSL color conversion
 */
const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

/**
 * Validates mask size against Nano Banana API limits (7MB)
 */
export const validateMaskSize = (maskDataUrl: string): { valid: boolean; sizeKB: number } => {
  const base64Length = maskDataUrl.split(',')[1]?.length || 0;
  const sizeBytes = (base64Length * 3) / 4; // Approximate decoded size
  const sizeKB = sizeBytes / 1024;
  const sizeMB = sizeKB / 1024;

  return {
    valid: sizeMB < 7,
    sizeKB: Math.round(sizeKB),
  };
};
