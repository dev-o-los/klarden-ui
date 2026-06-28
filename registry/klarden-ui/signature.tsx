"use client";

import { useEffect, useId, useState } from "react";
import { motion } from "framer-motion";
import { parse as parseFont } from "opentype.js";
import { cn } from "@/lib/utils";

type SignatureGlyph = {
  advanceWidth?: number;
  getPath: (
    x: number,
    y: number,
    fontSize: number,
  ) => {
    toPathData: (decimalPlaces?: number) => string;
  };
};

type SignatureFont = {
  unitsPerEm: number;
  charToGlyph: (char: string) => SignatureGlyph;
};

const PATH_DELAY_STEP = 0.15; // Slightly faster for smoother cursive connection
const OPACITY_DELAY_OFFSET = 0.01;
const fontCache = new Map<string, SignatureFont>();

function getFontCacheKey(path: string): string {
  try {
    return new URL(path, window.location.origin).href;
  } catch {
    return path;
  }
}

function getPathTransition(index: number, duration: number, delay: number) {
  const pathDelay = delay + index * PATH_DELAY_STEP;

  return {
    pathLength: {
      delay: pathDelay,
      duration,
      ease: "easeInOut" as const,
    },
    opacity: {
      delay: pathDelay + OPACITY_DELAY_OFFSET,
      duration: 0.01,
    },
  };
}

async function loadFontFromPaths(fontPaths: string[]): Promise<SignatureFont> {
  for (const path of fontPaths) {
    try {
      const cacheKey = getFontCacheKey(path);
      const cachedFont = fontCache.get(cacheKey);

      if (cachedFont) {
        return cachedFont;
      }

      const response = await fetch(path);

      if (!response.ok) {
        continue;
      }

      const fontBuffer = await response.arrayBuffer();
      const font = parseFont(fontBuffer) as SignatureFont;
      fontCache.set(cacheKey, font);

      return font;
    } catch {
      // Try next path
    }
  }

  throw new Error(
    `Font could not be loaded from the provided path${fontPaths.length === 1 ? "" : "s"}: ${fontPaths.join(", ")}`,
  );
}

async function buildSignaturePaths({
  text,
  fontSize,
  baseline,
  horizontalPadding,
  fontUrl,
}: {
  text: string;
  fontSize: number;
  baseline: number;
  horizontalPadding: number;
  fontUrl: string;
}): Promise<{ paths: string[]; width: number }> {
  const font = await loadFontFromPaths([fontUrl]);

  let x = horizontalPadding;
  const nextPaths: string[] = [];

  for (const char of text) {
    const glyph = font.charToGlyph(char);
    const path = glyph.getPath(x, baseline, fontSize);
    nextPaths.push(path.toPathData(3));

    const advanceWidth = glyph.advanceWidth ?? font.unitsPerEm;
    x += advanceWidth * (fontSize / font.unitsPerEm);
  }

  return {
    paths: nextPaths,
    width: x + horizontalPadding,
  };
}

function renderMotionPaths({
  paths,
  stroke,
  strokeWidth,
  strokeLinecap,
  strokeLinejoin,
  duration,
  delay,
}: {
  paths: string[];
  stroke: string;
  strokeWidth: number;
  strokeLinecap: "round" | "butt";
  strokeLinejoin: "round";
  duration: number;
  delay: number;
}) {
  return paths.map((d, index) => (
    <motion.path
      key={index}
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill="none"
      variants={PATH_VARIANTS}
      transition={getPathTransition(index, duration, delay)}
      vectorEffect="non-scaling-stroke"
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
    />
  ));
}

const PATH_VARIANTS = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1 },
};

interface SignatureProps {
  text?: string;
  color?: string;
  gradientColors?: string[];
  fontSize?: number;
  duration?: number;
  delay?: number;
  strokeWidth?: number;
  maskStrokeWidth?: number;
  glow?: boolean;
  glowBlur?: number;
  glowColor?: string;
  fontUrl?: string;
  className?: string;
  inView?: boolean;
  once?: boolean;
  refreshKey?: string | number;
}

export function Signature({
  text = "Signature",
  color = "currentColor",
  gradientColors,
  fontSize = 40,
  duration = 1.5,
  delay = 0,
  strokeWidth = 1.5,
  maskStrokeWidth,
  glow = false,
  glowBlur = 4,
  glowColor,
  fontUrl = "/LastoriaBoldRegular.otf",
  className,
  inView = false,
  once = true,
  refreshKey = 0,
}: SignatureProps) {
  const [mounted, setMounted] = useState(false);
  const [paths, setPaths] = useState<string[]>([]);

  // Calculate proportional dimensions to prevent layout shifts and clipping
  const svgHeight = fontSize * 3.5; // Very generous height to prevent clipping loopy cursive ascenders/descenders
  const horizontalPadding = fontSize * 0.15;
  const topMargin = fontSize * 1.2; // Positions text baseline lower to provide massive top clearance
  const baseline = topMargin + fontSize * 1.0;

  // Initialize width dynamically based on text length to eliminate starting width layout shift
  const estimatedWidth = text.length * fontSize * 0.55 + horizontalPadding * 2;
  const [width, setWidth] = useState<number>(estimatedWidth);

  const uniqueId = useId().replace(/:/g, "");
  const maskId = `sig-mask-${uniqueId}`;
  const gradientId = `sig-grad-${uniqueId}`;
  const glowFilterId = `sig-glow-${uniqueId}`;

  // Widen the mask slightly so glyph outlines are fully filled without clipping
  const defaultMaskStrokeWidth = maskStrokeWidth ?? fontSize * 0.25;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let isCancelled = false;

    async function loadSignaturePaths() {
      try {
        const { paths: nextPaths, width: nextWidth } = await buildSignaturePaths({
          text,
          fontSize,
          baseline,
          horizontalPadding,
          fontUrl,
        });

        if (isCancelled) {
          return;
        }

        setPaths(nextPaths);
        setWidth(nextWidth);
      } catch {
        if (isCancelled) {
          return;
        }

        setPaths([]);
        setWidth(estimatedWidth);
      }
    }

    void loadSignaturePaths();

    return () => {
      isCancelled = true;
    };
  }, [text, fontSize, baseline, horizontalPadding, fontUrl, estimatedWidth, mounted]);

  // Render a clean placeholder during Server-Side Rendering (SSR), hydration,
  // or while paths are loading. This prevents Framer Motion's viewport intersection
  // observer from triggering on an empty SVG element and getting stuck on client remount.
  if (!mounted || paths.length === 0) {
    return (
      <div
        style={{ width: estimatedWidth, height: svgHeight }}
        className={className}
      />
    );
  }

  // Determine stroke and fill color (gradient URL vs solid color)
  const strokeColor = gradientColors && gradientColors.length >= 2
    ? `url(#${gradientId})`
    : color;

  const resolvedGlowColor = glowColor || color;

  return (
    <motion.svg
      key={refreshKey}
      width={width + (glow ? glowBlur * 2 : 0)}
      height={svgHeight}
      viewBox={`${glow ? -glowBlur : 0} 0 ${width + (glow ? glowBlur * 2 : 0)} ${svgHeight}`}
      fill="none"
      className={cn("overflow-visible", className)}
      style={{ overflow: "visible" }}
      initial="hidden"
      whileInView={inView ? "visible" : undefined}
      animate={inView ? undefined : "visible"}
      viewport={{ once }}
    >
      <defs>
        {/* progressive path reveal mask */}
        <mask id={maskId} maskUnits="userSpaceOnUse" x="-30%" y="-30%" width="160%" height="160%">
          {renderMotionPaths({
            paths,
            stroke: "white",
            strokeWidth: defaultMaskStrokeWidth,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            duration,
            delay,
          })}
        </mask>

        {/* linear gradient configuration */}
        {gradientColors && gradientColors.length >= 2 && (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            {gradientColors.map((col, idx) => (
              <stop
                key={idx}
                offset={`${(idx / (gradientColors.length - 1)) * 100}%`}
                stopColor={col}
              />
            ))}
          </linearGradient>
        )}

        {/* neon glow filter */}
        {glow && (
          <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={glowBlur} result="blur" />
            <feComponentTransfer in="blur" result="boostedBlur">
              <feFuncA type="linear" slope="1.8" />
            </feComponentTransfer>
            {/* Colorize glow if customized */}
            {glowColor && (
              <feFlood floodColor={resolvedGlowColor} result="flood" />
            )}
            {glowColor && (
              <feComposite in="flood" in2="boostedBlur" operator="in" result="coloredBlur" />
            )}
            <feMerge>
              <feMergeNode in={glowColor ? "coloredBlur" : "boostedBlur"} />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      <g filter={glow ? `url(#${glowFilterId})` : undefined}>
        {/* Step 1: Thin outlines drawn dynamically */}
        {renderMotionPaths({
          paths,
          stroke: strokeColor,
          strokeWidth,
          strokeLinecap: "butt",
          strokeLinejoin: "round",
          duration,
          delay,
        })}

        {/* Step 2: Filled characters revealed via mask */}
        <g mask={`url(#${maskId})`}>
          {paths.map((d, index) => (
            <path key={index} d={d} fill={strokeColor} />
          ))}
        </g>
      </g>
    </motion.svg>
  );
}
