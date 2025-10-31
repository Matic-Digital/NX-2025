/**
 * Image Luminance Utility
 * 
 * Calculates the perceived luminance of an image to determine if it's light or dark.
 * This can be used to automatically adjust text color overlays for better contrast.
 */

/**
 * Calculate the luminance of an image using canvas sampling
 * @param imageUrl - URL of the image to analyze
 * @returns Promise<number> - Luminance value between 0 (dark) and 1 (light)
 */
export async function calculateImageLuminance(imageUrl: string): Promise<number> {
  return new Promise((resolve, reject) => {
    // Create a new image element
    const img = new Image();
    
    // Handle CORS for external images
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Create canvas to analyze the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Set canvas size (we can use a smaller size for performance)
        const sampleSize = 100;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        
        // Draw the image onto the canvas, scaled to fit
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
        const data = imageData.data;
        
        let totalLuminance = 0;
        const pixelCount = data.length / 4; // 4 values per pixel (RGBA)
        
        // Calculate luminance for each pixel (process 4 bytes at a time: RGBA)
        for (let i = 0; i < data.length; i += 4) {
          // Use slice to safely extract RGB values
          const rgbSlice = Array.from(data.slice(i, i + 3));
          const [r = 0, g = 0, b = 0] = rgbSlice;
          
          // Calculate relative luminance using the standard formula
          // https://en.wikipedia.org/wiki/Relative_luminance
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          totalLuminance += luminance;
        }
        
        // Calculate average luminance
        const averageLuminance = totalLuminance / pixelCount;
        resolve(averageLuminance);
        
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Unknown error during image analysis'));
      }
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imageUrl}`));
    };
    
    // Start loading the image
    img.src = imageUrl;
  });
}

/**
 * Determine if an image is considered "light" or "dark" based on luminance
 * @param luminance - Luminance value between 0 and 1
 * @param threshold - Threshold value (default: 0.5)
 * @returns boolean - true if light, false if dark
 */
export function isImageLight(luminance: number, threshold = 0.5): boolean {
  return luminance > threshold;
}

/**
 * Get a descriptive label for the luminance level
 * @param luminance - Luminance value between 0 and 1
 * @returns string - Description of the luminance level
 */
export function getLuminanceDescription(luminance: number): string {
  if (luminance < 0.2) return 'Very Dark';
  if (luminance < 0.4) return 'Dark';
  if (luminance < 0.6) return 'Medium';
  if (luminance < 0.8) return 'Light';
  return 'Very Light';
}
