"use client";

import React, { useEffect, useRef } from "react";
import { motion, useAnimationFrame, useMotionValue, motionValue } from "framer-motion";
import { cn } from "@/lib/utils";

type PageNotFoundProps = {
  children?: React.ReactNode;
  images?: string[];
  containerRef: React.RefObject<HTMLElement | null>;
  speed?: number;
  startPosition?: { x: number; y: number }; // x,y as percentages (0-100)
  startAngle?: number; // in degrees
  className?: string;
  imageClassName?: string;
};

const DEFAULT_IMAGES = [
  "/images/trail-1.jpg",
  "/images/trail-2.jpg",
  "/images/trail-3.jpg",
  "/images/trail-4.jpg",
  "/images/trail-5.jpg",
  "/images/box-carousel-1.jpg",
  "/images/box-carousel-2.jpg",
  "/images/box-carousel-3.jpg",
  "/images/box-carousel-4.jpg",
  "/images/box-carousel-5.jpg",
  "/images/box-carousel-6.jpg",
  "/images/box-carousel-v1.jpg",
  "/images/box-carousel-v2.jpg",
  "/images/box-carousel-v3.jpg",
  "/images/box-carousel-v4.jpg",
  "/images/box-carousel-v5.jpg",
  "/images/box-carousel-v6.jpg",
];

export const PageNotFound: React.FC<PageNotFoundProps> = ({
  children,
  images,
  speed = 3,
  startPosition = { x: 0, y: 0 },
  startAngle = 45,
  containerRef,
  className,
  imageClassName,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  // Unconditional React hooks for lead position
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const angle = useRef((startAngle * Math.PI) / 180);

  // Determine active images (only if no children are provided)
  const activeImages = !children ? (images || DEFAULT_IMAGES) : [];

  // We initialize the non-hook motionValue objects inside a ref to obey the React Rules of Hooks
  const xValuesRef = useRef<any[]>([]);
  const yValuesRef = useRef<any[]>([]);
  
  if (xValuesRef.current.length !== activeImages.length) {
    xValuesRef.current = activeImages.map(() => motionValue(0));
    yValuesRef.current = activeImages.map(() => motionValue(0));
  }

  const historyRef = useRef<{ x: number; y: number }[]>([]);
  const initialized = useRef(false);

  useAnimationFrame(() => {
    const container = containerRef.current;
    const element = elementRef.current;
    if (!container || !element) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const elemWidth = element.clientWidth || 160;
    const elemHeight = element.clientHeight || 160;

    if (!containerWidth || !containerHeight) return;

    // Initialize position once sizes are available
    if (!initialized.current) {
      const initialX = (startPosition.x / 100) * (containerWidth - elemWidth);
      const initialY = (startPosition.y / 100) * (containerHeight - elemHeight);
      
      x.set(initialX);
      y.set(initialY);

      // Seed trail history if we are using images
      if (activeImages.length > 0) {
        historyRef.current = Array.from({ length: activeImages.length * 12 }, () => ({
          x: initialX,
          y: initialY,
        }));
      }
      
      initialized.current = true;
      return;
    }

    const velocity = speed;
    const dx = Math.cos(angle.current) * velocity;
    const dy = Math.sin(angle.current) * velocity;

    let newX = x.get() + dx;
    let newY = y.get() + dy;

    // Check for collisions with container boundaries
    if (newX <= 0 || newX + elemWidth >= containerWidth) {
      angle.current = Math.PI - angle.current;
      newX = Math.max(0, Math.min(newX, containerWidth - elemWidth));
    }
    if (newY <= 0 || newY + elemHeight >= containerHeight) {
      angle.current = -angle.current;
      newY = Math.max(0, Math.min(newY, containerHeight - elemHeight));
    }

    x.set(newX);
    y.set(newY);

    if (activeImages.length > 0) {
      // Push new coordinate to the front of history queue
      historyRef.current.unshift({ x: newX, y: newY });
      if (historyRef.current.length > 250) {
        historyRef.current.pop();
      }

      // Update trail coordinates
      const spacing = 8; 
      for (let i = 0; i < activeImages.length; i++) {
        const historyIndex = Math.min(i * spacing, historyRef.current.length - 1);
        const pos = historyRef.current[historyIndex] || { x: newX, y: newY };
        xValuesRef.current[i].set(pos.x);
        yValuesRef.current[i].set(pos.y);
      }
    }
  });

  // If children are provided, act exactly like a standard Screensaver
  if (children) {
    return (
      <motion.div
        ref={elementRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          x,
          y,
        }}
        className={cn("transform will-change-transform", className)}
      >
        {children}
      </motion.div>
    );
  }

  // Otherwise, render the trailing images deck
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Invisible dimension calculation card */}
      <div
        ref={elementRef}
        className={cn(
          "w-32 h-32 md:w-40 md:h-40 absolute pointer-events-none opacity-0 invisible",
          imageClassName
        )}
      />

      {activeImages.map((src, index) => {
        const zIndex = activeImages.length - index;
        return (
          <motion.div
            key={`${src}-${index}`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              x: xValuesRef.current[index] || x,
              y: yValuesRef.current[index] || y,
              zIndex,
            }}
            className={cn(
              "w-32 h-32 md:w-40 md:h-40 rounded-md overflow-hidden shadow-2xl bg-zinc-950 will-change-transform pointer-events-auto",
              className
            )}
          >
            <img
              src={src}
              alt={`Screensaver item ${index}`}
              className={cn("w-full h-full object-cover select-none pointer-events-none", imageClassName)}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default PageNotFound;
