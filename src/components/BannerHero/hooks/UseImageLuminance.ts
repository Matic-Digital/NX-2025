import { useEffect, useState } from 'react';

import { 
  calculateImageLuminance, 
  getLuminanceDescription, 
  isImageLight 
} from '@/components/BannerHero/utils/imageLuminance';

interface ImageLuminanceResult {
  luminance: number | null;
  isLight: boolean;
  description: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook to calculate and track image luminance
 * @param imageUrl - URL of the image to analyze
 * @returns ImageLuminanceResult - Luminance data and loading state
 */
export function useImageLuminance(imageUrl: string | undefined): ImageLuminanceResult {
  const [luminance, setLuminance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setLuminance(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const analyzeLuminance = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await calculateImageLuminance(imageUrl);
        
        if (!isCancelled) {
          setLuminance(result);
        }
      } catch (err) {
        if (!isCancelled) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setError(errorMessage);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void analyzeLuminance();

    // Cleanup function to cancel the request if component unmounts
    return () => {
      isCancelled = true;
    };
  }, [imageUrl]);

  return {
    luminance,
    isLight: luminance !== null ? isImageLight(luminance) : false,
    description: luminance !== null ? getLuminanceDescription(luminance) : 'Unknown',
    isLoading,
    error
  };
}
