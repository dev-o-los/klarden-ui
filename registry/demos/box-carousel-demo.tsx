"use client"

import React from "react"
import BoxCarousel from "@/registry/klarden-ui/box-carousel"

const ITEMS = [
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
]

export default function BoxCarouselDemo() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8">
      <div className="relative py-4 flex items-center justify-center">
        <BoxCarousel
          items={ITEMS}
          width={300}
          height={300}
          direction="left"
          autoPlay={false}
          enableDrag={true}
          perspective={800}
        />
      </div>

      <p id="carousel-instructions" className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
        Drag or use the arrow keys to rotate the 3D cube.
      </p>
    </div>
  )
}
