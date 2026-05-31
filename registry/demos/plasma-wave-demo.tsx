"use client";

import { PlasmaWave } from "@/registry/klarden-ui/plasma-wave";

export default function PlasmaWaveDemo() {
  return (
    <PlasmaWave
      colors={["#EAB308", "#E2E8F0"]}
      speed1={0.06}
      speed2={0.06}
      focalLength={1.0}
      bend1={1.3}
      bend2={0.7}
      dir2={-1.0}
      rotationDeg={15}
      className="h-96 w-full"
      opacity={0.9}
    />
  );
}
