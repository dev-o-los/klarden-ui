"use client";

import { CommandOrbit } from "@/registry/klarden-ui/command-orbit";
import { MagneticDock } from "@/registry/klarden-ui/magnetic-dock";
import { SpotifyCard } from "@/registry/klarden-ui/spotify/spotify-card";
import { TactileHighlight } from "@/registry/klarden-ui/tactile-highlight";
import { Signature } from "@/registry/klarden-ui/signature";
import { Pagination, usePaginationState } from "@/registry/klarden-ui/pagination";
import BoxCarousel from "@/registry/klarden-ui/box-carousel";
import { ImageTrail, ImageTrailItem } from "@/registry/klarden-ui/image-trail";
import { motion, type Variants } from "framer-motion";
import { Layout, MousePointer2, Type, Zap, PenTool, Box, ChevronRight, Image as ImageIcon } from "lucide-react";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const BOX_CAROUSEL_ITEMS = [
  {
    id: "beach",
    type: "image" as const,
    src: "/images/box-carousel-1.jpg",
    alt: "Beautiful tropical beach",
  },
  {
    id: "mountains",
    type: "image" as const,
    src: "/images/box-carousel-2.jpg",
    alt: "Snowy mountain peaks under a starry night sky",
  },
  {
    id: "galaxy",
    type: "image" as const,
    src: "/images/box-carousel-3.jpg",
    alt: "Vibrant cosmic galaxy dust and stars",
  },
  {
    id: "sunset",
    type: "image" as const,
    src: "/images/box-carousel-4.jpg",
    alt: "Colorful sunset over a calm ocean beach",
  },
  {
    id: "valley",
    type: "image" as const,
    src: "/images/box-carousel-5.jpg",
    alt: "Beautiful green valley mountain trail",
  },
  {
    id: "hills",
    type: "image" as const,
    src: "/images/box-carousel-6.jpg",
    alt: "Deep forest hills under a sunny sky",
  },
];

const TRAIL_IMAGES = [
  "/images/trail-1.jpg",
  "/images/trail-2.jpg",
  "/images/trail-3.jpg",
  "/images/trail-4.jpg",
  "/images/trail-5.jpg",
];

export function Showcase() {
  const pagination = usePaginationState(1);

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

      {/* Signature */}
      <motion.div
        variants={itemVariants}
        className="md:col-span-4 group relative overflow-hidden rounded-3xl border border-border bg-card/50 p-6 md:p-8 shadow-sm backdrop-blur-sm transition-colors duration-500 flex flex-col justify-center min-h-80"
      >
        <div className="absolute top-6 left-6 z-10">
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-background border border-border text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-2 w-fit shadow-xs">
            <PenTool size={10} /> Vector
          </div>
          <h3 className="text-xl font-bold tracking-tight">Signature</h3>
        </div>
        <div className="flex items-center justify-center mt-12 overflow-hidden">
          <Signature
            text="Klarden UI"
            color="currentColor"
            className="text-zinc-900 dark:text-zinc-50"
            fontSize={36}
            duration={1.8}
            delay={0.3}
            glow={false}
            inView={true}
            once={false}
          />
        </div>
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

      {/* Box Carousel showcase */}
      <motion.div
        variants={itemVariants}
        className="md:col-span-7 group relative overflow-hidden rounded-3xl border border-border bg-card/50 p-6 md:p-8 shadow-sm backdrop-blur-sm transition-colors duration-500 flex flex-col items-center justify-center min-h-80"
      >
        <div className="absolute top-6 left-6 z-10">
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-background border border-border text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-2 w-fit shadow-xs">
            <Box size={10} /> 3D Cube
          </div>
          <h3 className="text-xl font-bold tracking-tight">Box Carousel</h3>
        </div>
        <div className="mt-16 scale-90 sm:scale-100 flex items-center justify-center">
          <BoxCarousel
            items={BOX_CAROUSEL_ITEMS}
            width={180}
            height={180}
            direction="left"
            autoPlay={true}
            enableDrag={true}
            perspective={800}
          />
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

      {/* Pagination showcase */}
      <motion.div
        variants={itemVariants}
        className="md:col-span-4 group relative overflow-hidden rounded-3xl border border-border bg-card/50 p-6 md:p-8 shadow-sm backdrop-blur-sm transition-colors duration-500 flex flex-col justify-center min-h-80"
      >
        <div className="absolute top-6 left-6 z-10">
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-background border border-border text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-2 w-fit shadow-xs">
            <ChevronRight size={10} /> Navigation
          </div>
          <h3 className="text-xl font-bold tracking-tight">Pagination</h3>
        </div>
        <div className="flex flex-col items-center justify-center mt-12 gap-4">
          <Pagination
            totalPages={5}
            currentPage={pagination.page}
            onPageChange={pagination.setPage}
            color="default"
            showEdges
          />
          <p className="text-[10px] text-muted-foreground font-medium mt-2">
            Active Page: {pagination.page}
          </p>
        </div>
      </motion.div>

      {/* Image Trail showcase */}
      <motion.div
        variants={itemVariants}
        className="md:col-span-8 group relative overflow-hidden rounded-3xl border border-border bg-card/50 p-6 md:p-8 shadow-sm backdrop-blur-sm transition-colors duration-500 flex flex-col justify-center min-h-80 cursor-crosshair"
      >
        <div className="absolute top-6 left-6 z-10">
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-background border border-border text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-2 w-fit shadow-xs">
            <ImageIcon size={10} /> Cursor Trail
          </div>
          <h3 className="text-xl font-bold tracking-tight">Image Trail</h3>
        </div>
        
        {/* Background grid representation */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

        <div className="absolute inset-0 flex items-center justify-center pt-16">
          <ImageTrail
            className="absolute inset-0"
            threshold={60}
            intensity={0.2}
            repeatChildren={8}
            keyframes={{
              scale: [0.3, 1, 1, 0.3],
              rotate: [0, -10, 10, 0],
              opacity: [0, 1, 1, 0],
            }}
            keyframesOptions={{
              duration: 1.0,
              times: [0, 0.05, 0.85, 1],
              ease: "easeOut",
            }}
            trailElementAnimationKeyframes={{
              x: { duration: 0.35, type: "tween", ease: "easeOut" },
              y: { duration: 0.35, type: "tween", ease: "easeOut" },
            }}
          >
            {TRAIL_IMAGES.map((src, index) => (
              <ImageTrailItem
                key={index}
                className="w-20 h-20 sm:w-28 sm:h-28 shadow-2xl overflow-hidden rounded-2xl bg-zinc-200 dark:bg-zinc-800"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Trail photo ${index + 1}`}
                  className="w-full h-full object-cover pointer-events-none select-none"
                />
              </ImageTrailItem>
            ))}
          </ImageTrail>
          
          <span className="text-xs text-muted-foreground font-medium pointer-events-none select-none z-10 bg-background/50 backdrop-blur-xs px-3 py-1.5 rounded-full border border-border">
            Move mouse here to view trail
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
