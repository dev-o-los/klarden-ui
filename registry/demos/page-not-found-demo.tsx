"use client";

import React, { useRef } from "react";
import { PageNotFound } from "@/registry/klarden-ui/page-not-found";

export default function PageNotFoundDemo() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[450px] md:h-[550px] border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 overflow-hidden flex items-center justify-center select-none"
    >
      {/* Background Centered Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
        <h1 className="text-5xl md:text-7xl font-medium tracking-tighter text-zinc-900 dark:text-zinc-100 lowercase select-none">
          page not found
        </h1>
      </div>

      <PageNotFound
        containerRef={containerRef}
        speed={1.5}
        startPosition={{ x: 10, y: 15 }}
        startAngle={45}
      />
    </div>
  );
}
