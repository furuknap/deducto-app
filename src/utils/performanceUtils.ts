/**
 * Performance utility functions for monitoring and optimizing the application
 */

/**
 * Measure and report performance metrics
 */
export const measurePerformance = (): void => {
  if (typeof window === 'undefined' || !window.performance) return;

  // Wait for the page to fully load
  window.addEventListener('load', () => {
    // Use setTimeout to ensure all initial rendering is complete
    setTimeout(() => {
      // Get performance metrics
      const perfEntries = performance.getEntriesByType('navigation');
      if (perfEntries.length > 0) {
        const navigationEntry = perfEntries[0] as PerformanceNavigationTiming;
        
        // Calculate key metrics
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        const fcp = getFCP();
        const lcp = getLCP();
        const cls = getCLS();
        
        // Log performance metrics
        console.log('Performance Metrics:');
        console.log(`Time to First Byte (TTFB): ${ttfb.toFixed(2)}ms`);
        console.log(`First Contentful Paint (FCP): ${fcp ? fcp.toFixed(2) + 'ms' : 'Not available'}`);
        console.log(`Largest Contentful Paint (LCP): ${lcp ? lcp.toFixed(2) + 'ms' : 'Not available'}`);
        console.log(`Cumulative Layout Shift (CLS): ${cls ? cls.toFixed(4) : 'Not available'}`);
      }
    }, 3000);
  });
};

/**
 * Get First Contentful Paint metric
 */
const getFCP = (): number | null => {
  const fcpEntry = performance.getEntriesByName('first-contentful-paint');
  return fcpEntry.length > 0 ? fcpEntry[0].startTime : null;
};

/**
 * Get Largest Contentful Paint metric
 * Note: This is a simplified version, in production you would use the web-vitals library
 */
const getLCP = (): number | null => {
  const paintEntries = performance.getEntriesByType('paint');
  let largestPaint = 0;
  
  paintEntries.forEach((entry) => {
    if (entry.startTime > largestPaint) {
      largestPaint = entry.startTime;
    }
  });
  
  return largestPaint > 0 ? largestPaint : null;
};

/**
 * Get Cumulative Layout Shift metric
 * Note: This is a simplified version, in production you would use the web-vitals library
 */
const getCLS = (): number | null => {
  // In a real implementation, you would use PerformanceObserver
  // This is just a placeholder
  return null;
};

/**
 * Preload critical resources
 */
export const preloadCriticalResources = (resources: string[]): void => {
  if (typeof window === 'undefined' || !document) return;
  
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    
    // Determine resource type
    if (resource.endsWith('.js')) {
      link.as = 'script';
    } else if (resource.endsWith('.css')) {
      link.as = 'style';
    } else if (resource.endsWith('.svg') || resource.endsWith('.png') || 
               resource.endsWith('.jpg') || resource.endsWith('.jpeg')) {
      link.as = 'image';
    }
    
    document.head.appendChild(link);
  });
};

/**
 * Initialize performance monitoring and optimizations
 */
export const initializePerformanceMonitoring = (): void => {
  // Measure performance metrics
  measurePerformance();
  
  // Report performance to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Performance monitoring initialized');
  }
};