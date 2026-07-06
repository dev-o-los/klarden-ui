"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/klarden-ui/accordion";
import { CommandOrbit } from "@/registry/klarden-ui/command-orbit";
import { MagneticDock } from "@/registry/klarden-ui/magnetic-dock";
import { OrbitContextMenu } from "@/registry/klarden-ui/orbit-context-menu";
import { RichButton } from "@/registry/klarden-ui/rich-button";
import { SpotifyCard } from "@/registry/klarden-ui/spotify/spotify-card";
import { TactileHighlight } from "@/registry/klarden-ui/tactile-highlight";
import { motion, type Variants } from "framer-motion";
import { Layout, MousePointer2, Type, Zap } from "lucide-react";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function Showcase() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ staggerChildren: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6"
    >
      {/* Command Orbit */}
      <motion.div
        variants={itemVariants}
        className="md:col-span-8 group relative overflow-hidden rounded-3xl border border-border bg-card/50 shadow-sm backdrop-blur-sm transition-colors duration-500"
      >
        <div className="absolute top-6 left-6 z-10">
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-background border border-border text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-2 w-fit shadow-xs">
            <MousePointer2 size={10} /> Interactive
          </div>
          <h3 className="text-xl font-bold tracking-tight">Command Orbit</h3>
        </div>
        <div className="flex items-center justify-center min-h-80 p-6">
          <CommandOrbit radius={90} className="scale-75 sm:scale-100" />
        </div>
      </motion.div>

      {/* Accordion */}
      <motion.div
        variants={itemVariants}
        className="md:col-span-4 group relative overflow-hidden rounded-3xl border border-border bg-card/50 p-6 md:p-8 shadow-sm backdrop-blur-sm transition-colors duration-500 flex flex-col justify-center"
      >
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-background border border-border text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-4 w-fit shadow-xs">
          <Layout size={10} /> Structure
        </div>
        <h3 className="text-xl font-bold tracking-tight mb-6">
          Tactile Accordion
        </h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="i1" className="border-border">
            <AccordionTrigger className="text-sm font-bold">
              Design Philosophy
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground font-medium">
              Focus on low-level primitives.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="i2" className="border-border">
            <AccordionTrigger className="text-sm font-bold">
              Motion
            </AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground font-medium">
              Optimized spring physics.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </motion.div>

      {/* Spotify Card showcase */}
      <motion.div
        variants={itemVariants}
        className="md:col-span-5 group relative overflow-hidden rounded-3xl border border-border bg-card/50 p-6 md:p-8 shadow-sm backdrop-blur-sm transition-colors duration-500 flex flex-col items-center justify-center min-h-80"
      >
        <div className="absolute top-6 left-6">
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-background border border-border text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-2 w-fit shadow-xs">
            <Zap size={10} /> Media
          </div>
          <h3 className="text-xl font-bold tracking-tight">Spotify Card</h3>
        </div>
        <div className="mt-12 scale-90 xl:scale-100 transition-transform">
          <SpotifyCard trackUrl="https://open.spotify.com/track/7EW7Yivb93qKAtp5qEm5of?si=301fefb2256f44cd" />
        </div>
      </motion.div>

      {/* Magnetic Dock */}
      <motion.div
        variants={itemVariants}
        className="md:col-span-7 group relative overflow-hidden rounded-3xl border border-border bg-card/50 flex flex-col items-center justify-center p-6 md:p-10 shadow-sm backdrop-blur-sm transition-colors duration-500"
      >
        <div className="absolute top-6 left-6">
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-background border border-border text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-2 w-fit shadow-xs">
            <MousePointer2 size={10} /> Proximity
          </div>
          <h3 className="text-xl font-bold tracking-tight">Magnetic Dock</h3>
        </div>
        <div className="mt-20 md:mt-12 scale-75 sm:scale-90 lg:scale-100">
          <MagneticDock magnification={70} distance={120} />
        </div>
      </motion.div>

      {/* Orbit Context Menu showcase */}
      <motion.div
        variants={itemVariants}
        className="md:col-span-7 group relative overflow-hidden rounded-3xl border border-border bg-card/50 p-8 md:p-10 shadow-sm backdrop-blur-sm transition-colors duration-500 flex flex-col items-center justify-center min-h-[20rem] md:min-h-80"
      >
        <div className="absolute top-6 left-6">
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-background border border-border text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-2 w-fit shadow-xs">
            <MousePointer2 size={10} /> Menu
          </div>
          <h3 className="text-xl font-bold tracking-tight">Context Menu</h3>
        </div>
        <div className="w-full max-w-sm mt-16 md:mt-12">
          <OrbitContextMenu>
            <div className="p-8 md:p-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 flex flex-col items-center justify-center text-center space-y-3 md:space-y-4 rounded-[2rem] transition-colors group-hover:bg-white/80 dark:group-hover:bg-zinc-900/80">
              <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <MousePointer2 className="text-zinc-400" size={28} />
              </div>
              <div className="space-y-2">
                <p className="text-zinc-900 dark:text-zinc-50 font-bold text-base md:text-lg">
                  Right-click here
                </p>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs px-2 md:px-4 font-medium">
                  Experience radial motion.
                </p>
              </div>
            </div>
          </OrbitContextMenu>
        </div>
      </motion.div>

      {/* Tactile Text showcase */}
      <motion.div
        variants={itemVariants}
        className="md:col-span-5 group relative overflow-hidden rounded-3xl border border-border bg-card/50 p-8 md:p-10 shadow-sm backdrop-blur-sm transition-colors duration-500 flex flex-col items-center justify-center min-h-80"
      >
        <div className="absolute top-6 left-6">
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-background border border-border text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-2 w-fit shadow-xs">
            <Type size={10} /> Typography
          </div>
          <h3 className="text-xl font-bold tracking-tight">Tactile Text</h3>
        </div>
        <div className="flex-1 flex items-center justify-center py-6 px-4">
          <div className="text-2xl md:text-3xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50 text-center leading-tight">
            Build{" "}
            <TactileHighlight direction="left">
              Better Interfaces
            </TactileHighlight>
          </div>
        </div>
      </motion.div>

      {/* Glossy Buttons showcase */}
      <motion.div
        variants={itemVariants}
        className="md:col-span-12 group relative overflow-hidden rounded-3xl border border-border bg-card/50 p-8 md:p-10 shadow-sm backdrop-blur-sm transition-colors duration-500 flex flex-col items-center justify-center min-h-[16rem] md:min-h-40"
      >
        <div className="absolute top-6 left-6">
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-background border border-border text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-2 w-fit shadow-xs">
            <Zap size={10} /> Varieties
          </div>
          <h3 className="text-xl font-bold tracking-tight">Glossy Buttons</h3>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mt-10 md:mt-8">
          <RichButton color="blue" size="sm" className="rounded-xl">
            Primary
          </RichButton>
          <RichButton color="emerald" size="sm" className="rounded-xl">
            <Zap size={14} className="mr-2" /> Success
          </RichButton>
          <RichButton color="purple" size="sm" className="rounded-xl">
            Purple
          </RichButton>
          <RichButton color="default" size="sm" className="rounded-xl">
            Dark
          </RichButton>
        </div>
      </motion.div>
    </motion.div>
  );
}
