/**
 * WebP Converter Utilities
 * Optimized for Nano Banana API - Uses lossless WebP with alpha channel
 * 26% more efficient than PNG for transparency
 */

/**
 * Convert canvas to lossless WebP with alpha channel
 * @param canvas - The canvas element to convert
 * @param quality - Quality (0-1), default 1.0 for lossless
 * @returns Promise resolving to base64 WebP data URL
 */
export const canvasToWebP = async (
  canvas: HTMLCanvasElement,
  quality: number = 1.0
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Use WebP with alpha support
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob from canvas'));
            return;
          }

          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        },
        'image/webp',
        quality
      );
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Convert ImageData to lossless WebP data URL
 * @param imageData - Raw pixel data
 * @param quality - Quality (0-1), default 1.0 for lossless
 * @returns Promise resolving to base64 WebP data URL
 */
export const imageDataToWebP = async (
  imageData: ImageData,
  quality: number = 1.0
): Promise<string> => {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.putImageData(imageData, 0, 0);
  return canvasToWebP(canvas, quality);
};

/**
 * Load image from URL and convert to WebP
 * @param imageUrl - URL or data URL of image
 * @param quality - Quality (0-1), default 1.0 for lossless
 * @returns Promise resolving to base64 WebP data URL
 */
export const imageUrlToWebP = async (
  imageUrl: string,
  quality: number = 1.0
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      
      try {
        const webpUrl = await canvasToWebP(canvas, quality);
        resolve(webpUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
};

/**
 * Check if browser supports WebP with alpha
 * @returns Promise resolving to boolean
 */
export const supportsWebP = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    const img = new Image();
    img.onload = () => resolve(img.width === 2);
    img.onerror = () => resolve(false);
    img.src = webP;
  });
};

/**
 * Estimate WebP file size
 * @param width - Image width
 * @param height - Image height
 * @param hasAlpha - Whether image has transparency
 * @returns Estimated size in bytes
 */
export const estimateWebPSize = (
  width: number,
  height: number,
  hasAlpha: boolean
): number => {
  const pixels = width * height;
  const bitsPerPixel = hasAlpha ? 32 : 24;
  const uncompressed = (pixels * bitsPerPixel) / 8;
  
  // WebP lossless typically achieves 40-70% compression
  const compressionRatio = 0.55;
  return Math.ceil(uncompressed * compressionRatio);
};

/**
 * Check if image data URL exceeds 7MB limit (Nano Banana constraint)
 * @param dataUrl - Base64 data URL
 * @returns boolean
 */
export const exceedsSizeLimit = (dataUrl: string): boolean => {
  const MAX_SIZE = 7 * 1024 * 1024; // 7MB in bytes
  
  // Remove data URL prefix to get base64 string
  const base64 = dataUrl.split(',')[1] || dataUrl;
  
  // Each base64 char represents 6 bits, but includes padding
  // Approximate size: (base64.length * 3) / 4
  const estimatedSize = (base64.length * 3) / 4;
  
  return estimatedSize > MAX_SIZE;
};

/**
 * Create a binary mask from canvas selection
 * White (255,255,255,255) = edit region
 * Transparent (0,0,0,0) = preserve region
 * 
 * @param width - Canvas width
 * @param height - Canvas height
 * @param selectedPixels - Set of pixel indices that are selected
 * @param featherAmount - Optional feathering (0-1), default 0.03 (3% dilation)
 * @returns Promise resolving to WebP mask data URL
 */
export const createBinaryMask = async (
  width: number,
  height: number,
  selectedPixels: Set<number>,
  featherAmount: number = 0.03
): Promise<string> => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  // First pass: Set binary mask
  for (let i = 0; i < data.length; i += 4) {
    const pixelIndex = i / 4;
    
    if (selectedPixels.has(pixelIndex)) {
      // Selected region: white with full opacity
      data[i] = 255;     // R
      data[i + 1] = 255; // G
      data[i + 2] = 255; // B
      data[i + 3] = 255; // A
    } else {
      // Unselected region: transparent
      data[i] = 0;       // R
      data[i + 1] = 0;   // G
      data[i + 2] = 0;   // B
      data[i + 3] = 0;   // A (transparent)
    }
  }

  // Second pass: Apply feathering if requested
  if (featherAmount > 0) {
    const featherPixels = Math.ceil(Math.max(width, height) * featherAmount);
    applyFeathering(data, width, height, featherPixels);
  }

  ctx.putImageData(imageData, 0, 0);
  return canvasToWebP(canvas, 1.0);
};

/**
 * Apply feathering/dilation to mask edges
 * @param data - ImageData.data array
 * @param width - Image width
 * @param height - Image height
 * @param featherRadius - Radius in pixels
 */
const applyFeathering = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  featherRadius: number
): void => {
  const tempData = new Uint8ClampedArray(data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const currentAlpha = tempData[idx + 3];

      // Only feather boundary pixels (transition from 0 to 255)
      if (currentAlpha > 0 && currentAlpha < 255) {
        continue; // Already feathered
      }

      // Check if this is a boundary pixel
      let isBoundary = false;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;

          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIdx = (ny * width + nx) * 4;
            const neighborAlpha = tempData[nIdx + 3];
            
            if (currentAlpha !== neighborAlpha) {
              isBoundary = true;
              break;
            }
          }
        }
        if (isBoundary) break;
      }

      // Apply feathering to boundary pixels
      if (isBoundary && currentAlpha === 255) {
        // Gradually reduce alpha based on distance from edge
        const distance = calculateDistanceToEdge(x, y, tempData, width, height);
        const featherFactor = Math.min(distance / featherRadius, 1);
        data[idx + 3] = Math.floor(255 * featherFactor);
      }
    }
  }
};

/**
 * Calculate distance to nearest edge (approximate)
 */
const calculateDistanceToEdge = (
  x: number,
  y: number,
  data: Uint8ClampedArray,
  width: number,
  height: number
): number => {
  let minDistance = Infinity;

  for (let dy = -5; dy <= 5; dy++) {
    for (let dx = -5; dx <= 5; dx++) {
      if (dx === 0 && dy === 0) continue;

      const nx = x + dx;
      const ny = y + dy;
      
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const idx = (ny * width + nx) * 4;
        if (data[idx + 3] === 0) {
          const distance = Math.sqrt(dx * dx + dy * dy);
          minDistance = Math.min(minDistance, distance);
        }
      }
    }
  }

  return minDistance;
};
