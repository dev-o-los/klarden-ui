"use client";

import { Signature } from "@/registry/klarden-ui/signature";

export default function SignatureDemo() {
  return (
    <Signature
      text="Klarden UI"
      color="currentColor"
      className="text-zinc-950 dark:text-zinc-50"
      fontSize={40}
      duration={1.8}
      delay={0.5}
      glow={false}
      inView={true} // Re-enabled scroll-view observer now that the key-remount issue is resolved
      once={false}
    />
  );
}
