/**
 * Image optimization utilities for the Deducto PWA
 */

/**
 * Interface for image optimization options
 */
interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
}

/**
 * Generate an optimized image URL
 * This is a placeholder implementation that would be replaced with actual
 * image optimization service in production (like Cloudinary, Imgix, etc.)
 */
export const getOptimizedImageUrl = (
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string => {
  // In a real implementation, this would connect to an image optimization service
  // For now, we'll just return the original URL with query parameters
  
  // Default options
  const defaultOptions: Required<ImageOptimizationOptions> = {
    width: 0,
    height: 0,
    quality: 80,
    format: 'webp'
  };
  
  // Merge options
  const mergedOptions = { ...defaultOptions, ...options };
  
  // If this is already an optimized URL or a data URL, return as is
  if (originalUrl.includes('?optimize=') || originalUrl.startsWith('data:')) {
    return originalUrl;
  }
  
  // Build query string
  const queryParams = [];
  
  if (mergedOptions.width > 0) {
    queryParams.push(`w=${mergedOptions.width}`);
  }
  
  if (mergedOptions.height > 0) {
    queryParams.push(`h=${mergedOptions.height}`);
  }
  
  queryParams.push(`q=${mergedOptions.quality}`);
  queryParams.push(`fmt=${mergedOptions.format}`);
  queryParams.push('optimize=true');
  
  // Add query parameters to URL
  const separator = originalUrl.includes('?') ? '&' : '?';
  return `${originalUrl}${separator}${queryParams.join('&')}`;
};

/**
 * Preload an image
 */
export const preloadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
};

/**
 * Preload multiple images
 */
export const preloadImages = (urls: string[]): Promise<HTMLImageElement[]> => {
  return Promise.all(urls.map(url => preloadImage(url)));
};

/**
 * Create a responsive image srcset
 */
export const createSrcSet = (
  originalUrl: string,
  widths: number[] = [320, 640, 960, 1280, 1920]
): string => {
  return widths
    .map(width => {
      const optimizedUrl = getOptimizedImageUrl(originalUrl, { width });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
};

/**
 * Get appropriate image size based on device
 */
export const getResponsiveImageSize = (
  originalWidth: number,
  originalHeight: number,
  containerWidth: number
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;
  const width = Math.min(originalWidth, containerWidth);
  const height = Math.round(width / aspectRatio);
  
  return { width, height };
};