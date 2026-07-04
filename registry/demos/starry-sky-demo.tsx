"use client";

import { StarrySky } from "@/registry/klarden-ui/starry-sky";
import React from "react";

export default function StarrySkyDemo() {
  return (
    <div className="relative w-full h-[450px] bg-black overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <StarrySky
        speed={1.0}
        starDensity={1.0}
        nebulaIntensity={0.5}
        interactive={true}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
