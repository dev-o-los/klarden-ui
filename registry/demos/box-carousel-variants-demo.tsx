"use client"

import React, { useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Play, Pause, Compass, Brain, Dna, Orbit, Shield, Zap } from "lucide-react"
import BoxCarousel, { BoxCarouselRef, CarouselItem } from "@/registry/klarden-ui/box-carousel"

const PREMIUM_ITEMS: (CarouselItem & { title: string; description: string; icon: React.ReactNode; gradient: string })[] = [
  {
    id: "quantum",
    type: "image",
    src: "/images/box-carousel-v1.jpg",
    alt: "Quantum Computing Illustration",
    title: "Quantum Computing",
    description: "Next-generation multi-state qubits and cryogenic hardware architectures.",
    icon: <Orbit className="w-6 h-6 text-violet-400" />,
    gradient: "from-violet-600/30 to-indigo-600/30 border-indigo-500/30",
  },
  {
    id: "neural",
    type: "image",
    src: "/images/box-carousel-v2.jpg",
    alt: "Neural Network Illustration",
    title: "Neural Networks",
    description: "Synaptic deep learning models with backpropagation and automated weights.",
    icon: <Brain className="w-6 h-6 text-rose-400" />,
    gradient: "from-rose-600/30 to-orange-500/30 border-rose-500/30",
  },
  {
    id: "bio",
    type: "image",
    src: "/images/box-carousel-v3.jpg",
    alt: "Bioinformatics Illustration",
    title: "Bioinformatics",
    description: "High-throughput genome sequencing and genetic pattern analytics.",
    icon: <Dna className="w-6 h-6 text-emerald-400" />,
    gradient: "from-emerald-600/30 to-teal-500/30 border-emerald-500/30",
  },
  {
    id: "astro",
    type: "image",
    src: "/images/box-carousel-v4.jpg",
    alt: "Cosmology Space Illustration",
    title: "Space Exploration",
    description: "Astro-navigation algorithms mapping orbital pathways and wormholes.",
    icon: <Compass className="w-6 h-6 text-cyan-400" />,
    gradient: "from-cyan-600/30 to-blue-600/30 border-cyan-500/30",
  },
  {
    id: "cyber",
    type: "image",
    src: "/images/box-carousel-v5.jpg",
    alt: "Cybersecurity Illustration",
    title: "Cybersecurity",
    description: "Cryptographic protocols protecting cloud assets and multi-signature nodes.",
    icon: <Shield className="w-6 h-6 text-amber-400" />,
    gradient: "from-amber-600/30 to-orange-600/30 border-amber-500/30",
  },
  {
    id: "fusion",
    type: "image",
    src: "/images/box-carousel-v6.jpg",
    alt: "Fusion Power Illustration",
    title: "Fusion Energy",
    description: "Magnetohydrodynamics guiding high-temperature deuterium fusion cells.",
    icon: <Zap className="w-6 h-6 text-fuchsia-400" />,
    gradient: "from-fuchsia-600/30 to-purple-600/30 border-fuchsia-500/30",
  },
]

export default function BoxCarouselVariantsDemo() {
  const carouselRef = useRef<BoxCarouselRef>(null)
  const [direction, setDirection] = useState<"left" | "right" | "top" | "bottom">("left")
  const [autoPlay, setAutoPlay] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleIndexChange = (index: number) => {
    setActiveIndex(index)
  }

  // Render a premium dashboard-like slide on the cube face
  const renderCard = (item: CarouselItem, index: number) => {
    const data = PREMIUM_ITEMS[index]
    return (
      <div className={`relative w-full h-full bg-zinc-950 flex flex-col justify-end p-6 border-2 rounded-xl overflow-hidden group/card bg-gradient-to-t ${data.gradient}`}>
        {/* Background photo with darker tint overlay */}
        <img
          src={data.src}
          alt={data.alt}
          className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover/card:scale-105 transition-transform duration-700 pointer-events-none select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />

        {/* Content container */}
        <div className="relative z-10 flex flex-col gap-2 text-left">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-white/10 border border-white/10 backdrop-blur-md">
              {data.icon}
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Tech Stack
            </span>
          </div>
          <h3 className="text-xl font-semibold text-white tracking-tight">
            {data.title}
          </h3>
          <p className="text-xs text-zinc-300 leading-relaxed max-w-[90%]">
            {data.description}
          </p>
          <div className="mt-2 flex items-center">
            <button className="text-xs font-semibold text-white px-3 py-1.5 rounded-md bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/20 active:scale-95 transition-all cursor-pointer">
              Launch Module
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-8 w-full max-w-lg mx-auto">
      {/* Controls panel */}
      <div className="flex flex-wrap items-center justify-center gap-3 p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-md w-full">
        {/* Direction Controls */}
        <div className="flex bg-zinc-200 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-300/40 dark:border-zinc-700/40">
          {(["left", "right", "top", "bottom"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDirection(d)}
              className={`px-3 py-1 text-xs font-medium capitalize rounded-md transition-all cursor-pointer ${
                direction === d
                  ? "bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Autoplay Toggle */}
        <button
          onClick={() => setAutoPlay(!autoPlay)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
            autoPlay
              ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
              : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          }`}
        >
          {autoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          Autoplay
        </button>
      </div>

      {/* 3D Carousel container */}
      <div className="relative group p-6 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-inner flex items-center justify-center w-full min-h-[380px]">
        <BoxCarousel
          ref={carouselRef}
          items={PREMIUM_ITEMS}
          width={300}
          height={300}
          direction={direction}
          autoPlay={autoPlay}
          autoPlayInterval={3000}
          enableDrag={true}
          perspective={1000}
          onIndexChange={handleIndexChange}
          renderItem={renderCard}
        />

        {/* Floating Side Nav Controls */}
        <button
          onClick={() => carouselRef.current?.prev()}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 dark:bg-zinc-950/90 border border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-md text-zinc-800 dark:text-zinc-200 hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer z-20"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => carouselRef.current?.next()}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 dark:bg-zinc-950/90 border border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-md text-zinc-800 dark:text-zinc-200 hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer z-20"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Slide Indicators / Dots */}
      <div className="flex items-center justify-center gap-2">
        {PREMIUM_ITEMS.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              // Standard next/prev transition sequence to target index
              if (index === activeIndex) return
              const diff = index - activeIndex
              if (diff > 0) {
                for (let i = 0; i < diff; i++) carouselRef.current?.next()
              } else {
                for (let i = 0; i < Math.abs(diff); i++) carouselRef.current?.prev()
              }
            }}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              activeIndex === index
                ? "w-8 bg-zinc-900 dark:bg-zinc-100"
                : "w-2.5 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
