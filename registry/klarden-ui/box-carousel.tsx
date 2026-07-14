"use client"

import React, {
  forwardRef,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  ValueAnimationOptions,
} from "framer-motion"

import { cn } from "@/lib/utils"

interface CarouselItem {
  /**
   * Unique identifier for the carousel item
   */
  id: string
  /**
   * The type of media: "image" or "video"
   */
  type: "image" | "video"
  /**
   * Source URL for the image or video
   */
  src: string
  /**
   * (Optional) Alternative text for images
   */
  alt?: string
  /**
   * (Optional) Poster image for videos (displayed before playback)
   */
  poster?: string
}

/**
 * Props for a single face of the cube in the BoxCarousel.
 */
interface FaceProps {
  /**
   * The CSS transform string to position and rotate the face in 3D space.
   */
  transform: string
  /**
   * Optional additional CSS class names for the face.
   */
  className?: string
  /**
   * Optional React children to render inside the face.
   */
  children?: ReactNode
  /**
   * Optional inline styles for the face.
   */
  style?: React.CSSProperties
  /**
   * If true, enables debug mode (e.g., shows backface and opacity).
   */
  debug?: boolean
}

const CubeFace = memo(
  ({ transform, className, children, style, debug }: FaceProps) => (
    <div
      className={cn(
        "absolute overflow-hidden backface-hidden",
        debug && "backface-visible opacity-50",
        className
      )}
      style={{ transform, ...style }}
    >
      {children}
    </div>
  )
)

CubeFace.displayName = "CubeFace"

const MediaRenderer = memo(
  ({
    item,
    className,
    debug = false,
  }: {
    item: CarouselItem
    className?: string
    debug?: boolean
  }) => {
    if (!debug) {
      if (item.type === "video") {
        return (
          <video
            src={item.src}
            poster={item.poster}
            className={cn("w-full h-full object-cover", className)}
            muted
            loop
            autoPlay
            playsInline
          />
        )
      }

      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.src}
          alt={item.alt || ""}
          draggable={false}
          className={cn("w-full h-full object-cover select-none pointer-events-none", className)}
        />
      )
    }

    return (
      <div
        className={cn(
          "w-full h-full flex items-center justify-center border text-2xl font-mono",
          className
        )}
      >
        {item.id}
      </div>
    )
  }
)

MediaRenderer.displayName = "MediaRenderer"

export interface BoxCarouselRef {
  /**
   * Advance to the next item in the carousel.
   */
  next: () => void

  /**
   * Go back to the previous item in the carousel.
   */
  prev: () => void

  /**
   * Get the index of the currently visible item.
   */
  getCurrentItemIndex: () => number
}

type RotationDirection = "top" | "bottom" | "left" | "right"

interface SpringConfig {
  stiffness?: number
  damping?: number
  mass?: number
}

/**
 * Props for the BoxCarousel component
 */
interface BoxCarouselProps extends Omit<React.HTMLProps<HTMLDivElement>, 'ref'> {
  /**
   * Array of items to display in the carousel (cube has 6 sides)
   */
  items: CarouselItem[]

  /**
   * Width of the carousel in pixels
   */
  width: number

  /**
   * Height of the carousel in pixels
   */
  height: number

  /**
   * Additional CSS classes for the container
   */
  className?: string

  /**
   * Enable debug mode (shows extra info/overlays)
   */
  debug?: boolean

  /**
   * Perspective value for 3D effect (in px)
   * @default 600
   */
  perspective?: number

  /**
   * The axis and direction of rotation for next/prev commands
   * @default "left"
   */
  direction?: RotationDirection

  /**
   * Transition configuration for rotation animation
   */
  transition?: ValueAnimationOptions

  /**
   * Transition configuration for snapping after drag
   */
  snapTransition?: ValueAnimationOptions

  /**
   * Spring physics config for drag interaction
   */
  dragSpring?: SpringConfig

  /**
   * Enable auto-play mode
   * @default false
   */
  autoPlay?: boolean

  /**
   * Interval (ms) between auto-play transitions
   * @default 3000
   */
  autoPlayInterval?: number

  /**
   * Callback when the current item index changes
   */
  onIndexChange?: (index: number) => void

  /**
   * Enable drag interaction
   * @default true
   */
  enableDrag?: boolean

  /**
   * Sensitivity of drag (higher = more rotation per pixel)
   * @default 0.5
   */
  dragSensitivity?: number

  /**
   * Optional custom renderer for each item in the carousel
   */
  renderItem?: (item: CarouselItem, index: number) => ReactNode
}

const BoxCarousel = forwardRef<BoxCarouselRef, BoxCarouselProps>(
  (
    {
      items,
      width,
      height,
      className,
      perspective = 600,
      debug = false,
      direction = "left",
      transition = { duration: 1.25, ease: [0.953, 0.001, 0.019, 0.995] },
      snapTransition = { type: "spring", stiffness: 120, damping: 15 },
      dragSpring = { stiffness: 100, damping: 14 },
      autoPlay = false,
      autoPlayInterval = 3000,
      onIndexChange,
      enableDrag = true,
      dragSensitivity = 1.0,
      renderItem,
      ...props
    },
    ref
  ) => {
    const [currentItemIndex, setCurrentItemIndex] = useState(1) // Default to front face (index 1)
    const [isDraggingState, setIsDraggingState] = useState(false)

    const prefersReducedMotion = useReducedMotion()
    const _transition = prefersReducedMotion ? { duration: 0 } : transition

    const [currentRotation, setCurrentRotation] = useState(0)

    const isRotating = useRef(false)
    const isDragging = useRef(false)
    const startPosition = useRef({ x: 0, y: 0 })
    const startRotationX = useRef(0)
    const startRotationY = useRef(0)

    const lastMoveTime = useRef(0)
    const lastPosition = useRef({ x: 0, y: 0 })
    const dragVelocity = useRef({ x: 0, y: 0 })

    const baseRotateX = useMotionValue(0)
    const baseRotateY = useMotionValue(0)

    // Calculate active face index [0 to 5] based on current rotation angles
    const calculateActiveFaceIndex = useCallback((x: number, y: number) => {
      const normY = ((Math.round(y / 90) % 4) + 4) % 4
      const normX = ((Math.round(x / 90) % 4) + 4) % 4

      if (normX === 1) {
        return 5 // Bottom
      }
      if (normX === 3) {
        return 4 // Top
      }
      // If normX is 0 or 2:
      if (normY === 0) return 1 // Front
      if (normY === 1) return 0 // Left
      if (normY === 2) return 3 // Back
      if (normY === 3) return 2 // Right
      return 1
    }, [])

    // Drag functionality - using direct event handlers like css-box
    const handleDragStart = useCallback(
      (e: React.MouseEvent | React.TouchEvent) => {
        if (!enableDrag || isRotating.current) return

        // Focus the container so it can capture keydown events
        if (e.currentTarget instanceof HTMLElement) {
          e.currentTarget.focus()
        }

        isDragging.current = true
        setIsDraggingState(true)
        const point = "touches" in e ? e.touches[0] : e
        startPosition.current = { x: point.clientX, y: point.clientY }
        startRotationX.current = baseRotateX.get()
        startRotationY.current = baseRotateY.get()

        lastMoveTime.current = Date.now()
        lastPosition.current = { x: point.clientX, y: point.clientY }
        dragVelocity.current = { x: 0, y: 0 }

        // Prevent default to avoid text selection
        e.preventDefault()
      },
      [enableDrag, baseRotateX, baseRotateY]
    )

    const handleDragMove = useCallback(
      (e: MouseEvent | TouchEvent) => {
        if (!isDragging.current || isRotating.current) return

        const point = "touches" in e ? e.touches[0] : e
        const deltaX = point.clientX - startPosition.current.x
        const deltaY = point.clientY - startPosition.current.y

        // Moving mouse horizontally (deltaX) rotates around Y axis (baseRotateY)
        const rotationDeltaY = deltaX * dragSensitivity
        // Moving mouse vertically (deltaY) rotates around X axis (baseRotateX)
        const rotationDeltaX = deltaY * dragSensitivity

        // Physical updates: Y rotation for horizontal drag, X rotation for vertical drag
        const newRotationY = startRotationY.current + rotationDeltaY
        const newRotationX = startRotationX.current - rotationDeltaX

        // Constrain rotation values to keep the globe/cube movement within snap bounds
        const isVertical = direction === "top" || direction === "bottom"
        let constrainedRotationY = newRotationY
        let constrainedRotationX = newRotationX

        if (isVertical) {
          const minRotX = startRotationX.current - 120
          const maxRotX = startRotationX.current + 120
          constrainedRotationX = Math.max(minRotX, Math.min(maxRotX, constrainedRotationX))
          constrainedRotationY = Math.max(-90, Math.min(90, constrainedRotationY))
        } else {
          const minRotY = startRotationY.current - 120
          const maxRotY = startRotationY.current + 120
          constrainedRotationY = Math.max(minRotY, Math.min(maxRotY, constrainedRotationY))
          constrainedRotationX = Math.max(-90, Math.min(90, constrainedRotationX))
        }

        baseRotateX.set(constrainedRotationX)
        baseRotateY.set(constrainedRotationY)

        // Calculate drag velocity (degrees per millisecond) for momentum on release
        const now = Date.now()
        const dt = now - lastMoveTime.current
        if (dt > 0) {
          const dx = point.clientX - lastPosition.current.x
          const dy = point.clientY - lastPosition.current.y

          // Convert screen movement dx/dy to rotation velocity matching natural physical direction
          const vy = dx * dragSensitivity
          const vx = -dy * dragSensitivity

          dragVelocity.current = {
            x: vx / dt,
            y: vy / dt,
          }
        }
        lastMoveTime.current = now
        lastPosition.current = { x: point.clientX, y: point.clientY }
      },
      [direction, dragSensitivity]
    )

    const handleDragEnd = useCallback(() => {
      if (!isDragging.current) return

      isDragging.current = false
      setIsDraggingState(false)

      const currentX = baseRotateX.get()
      const currentY = baseRotateY.get()

      const isVertical = direction === "top" || direction === "bottom"

      // Add velocity-based momentum to the snap target calculation
      // If the user paused for more than 80ms before releasing, reset velocity to 0
      const timeSinceLastMove = Date.now() - lastMoveTime.current
      const velocityX = timeSinceLastMove > 80 ? 0 : dragVelocity.current.x
      const velocityY = timeSinceLastMove > 80 ? 0 : dragVelocity.current.y

      // Limit projected momentum rotation to maximum 180 degrees (2 faces) in either direction
      const maxProjection = 180
      const projDiffX = Math.max(-maxProjection, Math.min(maxProjection, velocityX * 120))
      const projDiffY = Math.max(-maxProjection, Math.min(maxProjection, velocityY * 120))

      const projectedX = currentX + projDiffX
      const projectedY = currentY + projDiffY

      const snappedX = Math.round(projectedX / 90) * 90
      const snappedY = Math.round(projectedY / 90) * 90

      isRotating.current = true

      // Start spring snap animation. We pass initial release velocity to the spring
      // so the animation starts at the exact speed of the user's gesture (jerk-free, seamless transition)
      const springXConfig = {
        ...snapTransition,
        velocity: velocityX * 1000 // Convert deg/ms to deg/s
      }

      const springYConfig = {
        ...snapTransition,
        velocity: velocityY * 1000 // Convert deg/ms to deg/s
      }

      animate(baseRotateX, snappedX, springXConfig)
      animate(baseRotateY, snappedY, {
        ...springYConfig,
        onComplete: () => {
          isRotating.current = false
          setCurrentRotation(isVertical ? snappedX : snappedY)
          const activeIndex = calculateActiveFaceIndex(snappedX, snappedY)
          setCurrentItemIndex(activeIndex)
          onIndexChange?.(activeIndex)
        },
      })
    }, [
      direction,
      baseRotateX,
      baseRotateY,
      currentRotation,
      snapTransition,
      calculateActiveFaceIndex,
      onIndexChange,
    ])

    // Set up global event listeners for drag
    useEffect(() => {
      if (enableDrag) {
        window.addEventListener("mousemove", handleDragMove)
        window.addEventListener("mouseup", handleDragEnd)
        window.addEventListener("touchmove", handleDragMove, { passive: true })
        window.addEventListener("touchend", handleDragEnd)

        return () => {
          window.removeEventListener("mousemove", handleDragMove)
          window.removeEventListener("mouseup", handleDragEnd)
          window.removeEventListener("touchmove", handleDragMove)
          window.removeEventListener("touchend", handleDragEnd)
        }
      }
    }, [enableDrag, handleDragMove, handleDragEnd])

    const next = useCallback(() => {
      if (items.length === 0 || isRotating.current) return

      isRotating.current = true
      const isVertical = direction === "top" || direction === "bottom"
      const targetMotionValue = isVertical ? baseRotateX : baseRotateY
      const currentVal = targetMotionValue.get()
      const targetVal = isVertical
        ? (direction === "top" ? currentVal + 90 : currentVal - 90)
        : (direction === "left" ? currentVal - 90 : currentVal + 90)

      animate(targetMotionValue, targetVal, {
        ..._transition,
        onComplete: () => {
          isRotating.current = false
          setCurrentRotation(targetVal)
          const activeIndex = calculateActiveFaceIndex(
            isVertical ? targetVal : baseRotateX.get(),
            isVertical ? baseRotateY.get() : targetVal
          )
          setCurrentItemIndex(activeIndex)
          onIndexChange?.(activeIndex)
        },
      })
    }, [items.length, direction, _transition, baseRotateX, baseRotateY, calculateActiveFaceIndex, onIndexChange])

    const prev = useCallback(() => {
      if (items.length === 0 || isRotating.current) return

      isRotating.current = true
      const isVertical = direction === "top" || direction === "bottom"
      const targetMotionValue = isVertical ? baseRotateX : baseRotateY
      const currentVal = targetMotionValue.get()
      const targetVal = isVertical
        ? (direction === "top" ? currentVal - 90 : currentVal + 90)
        : (direction === "left" ? currentVal + 90 : currentVal - 90)

      animate(targetMotionValue, targetVal, {
        ..._transition,
        onComplete: () => {
          isRotating.current = false
          setCurrentRotation(targetVal)
          const activeIndex = calculateActiveFaceIndex(
            isVertical ? targetVal : baseRotateX.get(),
            isVertical ? baseRotateY.get() : targetVal
          )
          setCurrentItemIndex(activeIndex)
          onIndexChange?.(activeIndex)
        },
      })
    }, [items.length, direction, _transition, baseRotateX, baseRotateY, calculateActiveFaceIndex, onIndexChange])

    useImperativeHandle(
      ref,
      () => ({
        next,
        prev,
        getCurrentItemIndex: () => currentItemIndex,
      }),
      [next, prev, currentItemIndex]
    )

    const depth = useMemo(() => width, [width])

    const transform = useTransform(
      [baseRotateX, baseRotateY],
      ([x, y]) =>
        `translateZ(-${depth / 2}px) rotateX(${x}deg) rotateY(${y}deg)`
    )

    // Distinct 3D transforms for all 6 faces of the cube
    const faceTransforms = useMemo(() => {
      const zTranslate = width / 2
      return [
        `rotateY(-90deg) translateZ(${zTranslate}px)`, // Left (index 0)
        `rotateY(0deg) translateZ(${zTranslate}px)`,   // Front (index 1)
        `rotateY(90deg) translateZ(${zTranslate}px)`,  // Right (index 2)
        `rotateY(180deg) translateZ(${zTranslate}px)`, // Back (index 3)
        `rotateX(90deg) translateZ(${zTranslate}px)`,  // Top (index 4)
        `rotateX(-90deg) translateZ(${zTranslate}px)`, // Bottom (index 5)
      ]
    }, [width])

    // Get item from registry, looping around items length
    const getItem = (idx: number) => {
      if (!items || items.length === 0) {
        return { id: `empty-${idx}`, type: "image", src: "" } as CarouselItem
      }
      return items[idx % items.length]
    }

    // Auto play functionality
    useEffect(() => {
      if (autoPlay && items.length > 0) {
        const interval = setInterval(next, autoPlayInterval)
        return () => clearInterval(interval)
      }
    }, [autoPlay, items.length, next, autoPlayInterval])

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (isRotating.current) return

        switch (e.key) {
          case "ArrowLeft":
            e.preventDefault()
            if (direction === "left" || direction === "right") prev()
            break
          case "ArrowRight":
            e.preventDefault()
            if (direction === "left" || direction === "right") next()
            break
          case "ArrowUp":
            e.preventDefault()
            if (direction === "top" || direction === "bottom") prev()
            break
          case "ArrowDown":
            e.preventDefault()
            if (direction === "top" || direction === "bottom") next()
            break
          default:
            break
        }
      },
      [direction, next, prev]
    )

    return (
      <div
        className={cn(
          "relative focus:outline-none",
          enableDrag && "cursor-grab active:cursor-grabbing touch-none",
          className
        )}
        style={{
          width,
          height,
          perspective: `${perspective}px`,
          touchAction: enableDrag ? "none" : "auto",
        }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-label={`3D carousel with ${items.length} items`}
        aria-describedby="carousel-instructions"
        aria-live="polite"
        aria-atomic="true"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        {...props}
      >
        <div className="sr-only" aria-live="assertive">
          Showing item {currentItemIndex + 1} of {items.length}
        </div>

        <motion.div
          className="relative w-full h-full [transform-style:preserve-3d]"
          style={{
            transform: transform,
          }}
        >
          {/* Left face (0) */}
          <CubeFace
            transform={faceTransforms[0]}
            className="border border-zinc-200/10 dark:border-zinc-800/10 shadow-2xl bg-white dark:bg-zinc-950"
            style={debug ? { width, height, backgroundColor: "#ff9999" } : { width, height }}
            debug={debug}
          >
            {renderItem ? renderItem(getItem(0), 0) : <MediaRenderer item={getItem(0)} debug={debug} />}
          </CubeFace>

          {/* Front face (1) */}
          <CubeFace
            transform={faceTransforms[1]}
            className="border border-zinc-200/10 dark:border-zinc-800/10 shadow-2xl bg-white dark:bg-zinc-950"
            style={debug ? { width, height, backgroundColor: "#99ff99" } : { width, height }}
            debug={debug}
          >
            {renderItem ? renderItem(getItem(1), 1) : <MediaRenderer item={getItem(1)} debug={debug} />}
          </CubeFace>

          {/* Right face (2) */}
          <CubeFace
            transform={faceTransforms[2]}
            className="border border-zinc-200/10 dark:border-zinc-800/10 shadow-2xl bg-white dark:bg-zinc-950"
            style={debug ? { width, height, backgroundColor: "#9999ff" } : { width, height }}
            debug={debug}
          >
            {renderItem ? renderItem(getItem(2), 2) : <MediaRenderer item={getItem(2)} debug={debug} />}
          </CubeFace>

          {/* Back face (3) */}
          <CubeFace
            transform={faceTransforms[3]}
            className="border border-zinc-200/10 dark:border-zinc-800/10 shadow-2xl bg-white dark:bg-zinc-950"
            style={debug ? { width, height, backgroundColor: "#ffff99" } : { width, height }}
            debug={debug}
          >
            {renderItem ? renderItem(getItem(3), 3) : <MediaRenderer item={getItem(3)} debug={debug} />}
          </CubeFace>

          {/* Top face (4) */}
          <CubeFace
            transform={faceTransforms[4]}
            className="border border-zinc-200/10 dark:border-zinc-800/10 shadow-2xl bg-white dark:bg-zinc-950"
            style={debug ? { width, height, backgroundColor: "#ff99ff" } : { width, height }}
            debug={debug}
          >
            {renderItem ? renderItem(getItem(4), 4) : <MediaRenderer item={getItem(4)} debug={debug} />}
          </CubeFace>

          {/* Bottom face (5) */}
          <CubeFace
            transform={faceTransforms[5]}
            className="border border-zinc-200/10 dark:border-zinc-800/10 shadow-2xl bg-white dark:bg-zinc-950"
            style={debug ? { width, height, backgroundColor: "#99ffff" } : { width, height }}
            debug={debug}
          >
            {renderItem ? renderItem(getItem(5), 5) : <MediaRenderer item={getItem(5)} debug={debug} />}
          </CubeFace>
        </motion.div>
      </div>
    )
  }
)

BoxCarousel.displayName = "BoxCarousel"

export default BoxCarousel
export type { CarouselItem, RotationDirection, SpringConfig }
