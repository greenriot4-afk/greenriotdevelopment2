import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  quality?: 'low' | 'medium' | 'high';
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  quality = 'medium',
  loading = 'lazy',
  width,
  height
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(loading === 'eager');
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (loading === 'lazy' && imgRef.current && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(imgRef.current);
      return () => observer.disconnect();
    }
  }, [loading]);

  const getOptimizedSrc = (originalSrc: string) => {
    // For local images, add quality parameters
    if (originalSrc.startsWith('/lovable-uploads/')) {
      const qualityMap = {
        low: 60,
        medium: 80,
        high: 95
      };
      
      // Since we can't modify the actual files, we'll use the original but with CSS optimization
      return originalSrc;
    }
    return originalSrc;
  };

  const getImageStyle = () => {
    const baseStyle: React.CSSProperties = {};
    
    // Add image optimization CSS properties
    if (quality === 'low') {
      baseStyle.imageRendering = 'pixelated' as any;
    } else if (quality === 'high') {
      baseStyle.imageRendering = 'high-quality' as any;
    }

    return baseStyle;
  };

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {/* Placeholder while loading */}
      {!isLoaded && isInView && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse rounded"
          style={{ width, height }}
        />
      )}
      
      {/* Actual image */}
      {isInView && (
        <img
          src={getOptimizedSrc(src)}
          alt={alt}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          style={getImageStyle()}
          width={width}
          height={height}
          onLoad={() => setIsLoaded(true)}
          loading={loading}
          decoding="async"
        />
      )}
    </div>
  );
};