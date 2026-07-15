import { useState, useEffect, RefObject } from "react";

export function useDimensions(ref: RefObject<HTMLElement | null>) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const getDimensions = () => {
      if (ref.current) {
        setDimensions({
          width: ref.current.offsetWidth,
          height: ref.current.offsetHeight,
        });
      }
    };

    getDimensions();

    const observer = new ResizeObserver(() => {
      getDimensions();
    });

    if (ref.current) {
      observer.observe(ref.current);
    } else {
      // Fallback polling for when the React ref is populated after mount
      const interval = setInterval(() => {
        if (ref.current) {
          observer.observe(ref.current);
          getDimensions();
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return dimensions;
}
