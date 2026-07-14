"use client";

import { RichButton } from "@/registry/klarden-ui/rich-button";
import { motion } from "framer-motion";
import { ArrowRight, Layout } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Hero() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex flex-col items-center text-center space-y-8 pt-20 pb-16 md:pt-28 md:pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group cursor-pointer overflow-hidden rounded-full border border-zinc-800 dark:border-zinc-800/80 bg-zinc-950 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-100 backdrop-blur-sm transition-all duration-300 hover:border-zinc-600 dark:hover:border-zinc-500 hover:shadow-[0_0_15px_rgba(255,255,255,0.06)]"
        whileHover={{ scale: 1.015 }}
      >
        {/* Shiny Paint Shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", repeatDelay: 1 }}
        />

        <div className="relative z-10 flex items-center gap-2.5">
          {/* status indicator dot */}
          <div className="relative flex h-2 w-2 items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-zinc-100 shadow-[0_0_8px_#ffffff]" />
          </div>

          <motion.span
            animate={{ letterSpacing: isHovered ? "0.24em" : "0.22em" }}
            transition={{ duration: 0.2 }}
            className="text-zinc-300 group-hover:text-white transition-colors duration-300"
          >
            Curated for Design Engineers
          </motion.span>
        </div>
      </motion.div>

      <div className="space-y-6 max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.1] text-foreground"
        >
          Refined UI components for <br />
          <span className="font-serif italic text-muted-foreground">
            modern interfaces
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="mx-auto max-w-2xl text-muted-foreground text-base md:text-lg lg:text-xl font-medium leading-relaxed tracking-tight px-4"
        >
          An ecosystem of high-end React components.{" "}
          <br className="hidden md:block" />
          Engineered with precision motion and tactile feedback.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="flex flex-wrap items-center justify-center gap-4 pt-4"
      >
        <Link href="/docs/introduction">
          <RichButton
            size="default"
            color="default"
            className="rounded-full h-11 px-8 text-sm font-semibold tracking-tight border-border"
          >
            Get Started <ArrowRight size={16} className="ml-2" />
          </RichButton>
        </Link>
        <Link href="/docs/components/rich-button">
          <RichButton
            size="default"
            color="blue"
            className="rounded-full h-11 px-8 text-sm font-semibold tracking-tight gap-2"
          >
            <Layout size={16} className="mr-2" /> Components
          </RichButton>
        </Link>
      </motion.div>
    </div>
  );
}
