"use client";

import { cn } from "@/lib/utils";
import { motion, useInView, Variants } from "framer-motion";
import React, { useRef } from "react";

type HighlightDirection = "left" | "right" | "top" | "bottom";

const colorClassMap = {
  default: {
    background: "bg-zinc-950 dark:bg-white",
    foreground: "text-white dark:text-zinc-950",
  },

  blue: {
    background: "bg-blue-600 dark:bg-blue-400",
    foreground: "text-white dark:text-zinc-950",
  },

  purple: {
    background: "bg-purple-800 dark:bg-purple-400",
    foreground: "text-white dark:text-zinc-950",
  },

  pink: {
    background: "bg-pink-600 dark:bg-pink-400",
    foreground: "text-white dark:text-zinc-950",
  },

  red: {
    background: "bg-red-600 dark:bg-red-400",
    foreground: "text-white dark:text-zinc-950",
  },

  orange: {
    background: "bg-orange-600 dark:bg-orange-400",
    foreground: "text-white dark:text-zinc-950",
  },

  yellow: {
    background: "bg-yellow-500 dark:bg-yellow-400",
    foreground: "text-white dark:text-zinc-950",
  },

  green: {
    background: "bg-green-600 dark:bg-green-400",
    foreground: "text-white dark:text-zinc-950",
  },

  teal: {
    background: "bg-teal-600 dark:bg-teal-400",
    foreground: "text-white dark:text-zinc-950",
  },

  cyan: {
    background: "bg-cyan-500 dark:bg-cyan-400",
    foreground: "text-white dark:text-zinc-950",
  },

  indigo: {
    background: "bg-indigo-800 dark:bg-indigo-400",
    foreground: "text-white dark:text-zinc-950",
  },

  violet: {
    background: "bg-violet-600 dark:bg-violet-400",
    foreground: "text-white dark:text-zinc-950",
  },

  rose: {
    background: "bg-rose-600 dark:bg-rose-400",
    foreground: "text-white dark:text-zinc-950",
  },

  amber: {
    background: "bg-amber-600 dark:bg-amber-400",
    foreground: "text-white dark:text-zinc-950",
  },

  lime: {
    background: "bg-lime-600 dark:bg-lime-400",
    foreground: "text-white dark:text-zinc-950",
  },

  sky: {
    background: "bg-sky-600 dark:bg-sky-400",
    foreground: "text-white dark:text-zinc-950",
  },

  emerald: {
    background: "bg-emerald-600 dark:bg-emerald-400",
    foreground: "text-white dark:text-zinc-950",
  },

  fuchsia: {
    background: "bg-fuchsia-600 dark:bg-fuchsia-400",
    foreground: "text-white dark:text-zinc-950",
  },
} as const;

type Color = keyof typeof colorClassMap;

type ColorClasses = (typeof colorClassMap)[Color];

const getColorClasses = (color: Color): ColorClasses => {
  return colorClassMap[color] ?? colorClassMap.default;
};

interface TactileHighlightProps {
  children: React.ReactNode;
  className?: string;
  direction?: HighlightDirection;
  delay?: number;
  trigger?: "auto" | "hover" | "inView";
  color?: Color;
}

/**
 * TactileHighlight - A premium animated text highlight component.
 * Uses `mix-blend-difference` to guarantee mathematically perfect contrast
 * across both Light and Dark modes dynamically.
 */
export const TactileHighlight = ({
  children,
  className,
  direction = "left",
  delay = 0.1,
  trigger = "inView",
  color = "default",
}: TactileHighlightProps) => {
  const ref = useRef(null);
  // once: false allows the animation to elegantly restart when scrolling back into view
  const isInView = useInView(ref, { once: false, margin: "-10%" });

  const isAnimated = trigger === "auto" || (trigger === "inView" && isInView);

  const { background, foreground } = getColorClasses(color);

  const variants: Variants = {
    hidden: {
      scaleX: direction === "left" || direction === "right" ? 0 : 1,
      scaleY: direction === "top" || direction === "bottom" ? 0 : 1,
      originX: direction === "left" ? 0 : direction === "right" ? 1 : 0.5,
      originY: direction === "top" ? 0 : direction === "bottom" ? 1 : 0.5,
      borderRadius: "12px", // Starts very rounded
    },
    visible: {
      scaleX: 1,
      scaleY: 1,
      borderRadius: "4px", // Snaps to sharp corners
      transition: {
        type: "spring",
        damping: 22,
        stiffness: 130,
        mass: 0.8,
        delay: delay,
      },
    },
    hover: {
      scale: 1.05,
      rotate: direction === "left" ? -1.5 : direction === "right" ? 1.5 : 0,
      borderRadius: "8px",
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 400,
      },
    },
  };

  return (
    <span
      ref={ref}
      className={cn(
        "relative inline-block whitespace-nowrap cursor-default group/tactile",
        className,
      )}
      style={{ padding: "0 0.15em", margin: "0 -0.15em" }}
    >
      {/* Background Block: Dark in light mode, Light in dark mode */}
      <motion.span
        initial="hidden"
        animate={isAnimated ? "visible" : "hidden"}
        whileHover={trigger === "hover" ? "visible" : "hover"}
        variants={variants}
        className={cn(
          background,
          "absolute inset-0 shadow-xl z-0 origin-[var(--origin-x)_var(--origin-y)]",
        )}
        style={
          {
            "--origin-x":
              direction === "left" ? 0 : direction === "right" ? 1 : 0.5,
            "--origin-y":
              direction === "top" ? 0 : direction === "bottom" ? 1 : 0.5,
          } as React.CSSProperties
        }
      />

      {/* 
        Text Layer: Always white, but uses difference blending.
        Light Mode (White Page): White text difference White page = Black Text.
        Dark Mode (Black Page): White text difference Black page = White Text.
        Inside Highlight: Color perfectly inverts. 
      */}
      <span className={cn(foreground, "relative z-10 pointer-events-none")}>
        {children}
      </span>
    </span>
  );
};
