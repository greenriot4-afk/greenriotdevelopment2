// Utility functions for image optimization

export const getOptimizedImageUrl = (
  originalUrl: string,
  width?: number,
  height?: number,
  quality: 'low' | 'medium' | 'high' = 'medium'
): string => {
  // For local images that can't be modified, we return the original
  // In a real production environment, you would implement server-side image optimization
  if (originalUrl.startsWith('/lovable-uploads/')) {
    return originalUrl;
  }
  
  // For external images, you could add query parameters for optimization services
  const qualityMap = {
    low: 60,
    medium: 80,
    high: 95
  };
  
  try {
    const url = new URL(originalUrl);
    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    url.searchParams.set('q', qualityMap[quality].toString());
    return url.toString();
  } catch {
    return originalUrl;
  }
};

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadCriticalImages = (imageSrcs: string[]): void => {
  imageSrcs.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};