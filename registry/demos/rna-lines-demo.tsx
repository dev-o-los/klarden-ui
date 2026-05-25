"use client";

import { RnaLines } from "@/registry/klarden-ui/rna-lines";

export default function RnaLinesDemo() {
  return (
    <RnaLines
      speed={0.8}
      opacity={0.9}
      className="h-96 w-full animate-fade-in"
    >
    </RnaLines>
  );
}
