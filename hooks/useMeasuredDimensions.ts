
import { useState, useEffect, useRef, RefObject } from 'react';

interface Dimensions {
  width: number;
  height: number;
  isReady: boolean;
}

export const useMeasuredDimensions = (containerRef: RefObject<HTMLElement | null>): Dimensions => {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0, isReady: false });
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observe = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setDimensions({ width, height, isReady: true });
      }
    };

    resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height, isReady: true });
        }
      }
    });

    resizeObserverRef.current.observe(containerRef.current);
    observe(); // Initial measurement

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [containerRef]);

  return dimensions;
};
