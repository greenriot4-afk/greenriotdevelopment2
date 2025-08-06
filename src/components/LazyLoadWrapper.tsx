import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface LazyLoadWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
}

export const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = ({
  children,
  fallback = <div className="bg-muted animate-pulse h-32 w-full rounded" />,
  threshold = 0.1,
  rootMargin = '50px'
}) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { threshold, rootMargin }
      );

      observer.observe(ref.current);
      return () => observer.disconnect();
    } else {
      // Fallback for browsers without IntersectionObserver
      setIsInView(true);
    }
  }, [threshold, rootMargin]);

  return (
    <div ref={ref}>
      {isInView ? children : fallback}
    </div>
  );
};