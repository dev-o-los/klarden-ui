"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface StarrySkyProps {
  className?: string;
  speed?: number;
  starDensity?: number;
  glowIntensity?: number;
  nebulaIntensity?: number;
  interactive?: boolean;
  opacity?: number;
  children?: React.ReactNode;
}

const VERTEX_SHADER = `
  varying vec2 v_uv;
  void main() {
    v_uv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  varying vec2 v_uv;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  
  // Custom configurations
  uniform float u_speed;
  uniform float u_starDensity;
  uniform float u_glowIntensity;
  uniform float u_nebulaIntensity;
  uniform float u_isDark;

  // Simple pseudo-random generators
  float hash21(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
  }

  vec2 hash22(vec2 p) {
      float n = hash21(p);
      return vec2(n, hash21(p + n));
  }

  // 2D Noise for nebula clouds
  float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
          mix(hash21(i + vec2(0.0, 0.0)), hash21(i + vec2(1.0, 0.0)), u.x),
          mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
          u.y
      );
  }

  // Layered noise for organic nebula shapes
  float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      for (int i = 0; i < 4; i++) {
          value += amplitude * noise(p * frequency);
          frequency *= 2.0;
          amplitude *= 0.5;
      }
      return value;
  }

  // Single star layer calculation with search grid to prevent edge clipping
  vec3 getStarLayer(vec2 uv, float gridScale, float speedMultiplier, float seed) {
      vec3 col = vec3(0.0);
      vec2 gv = fract(uv * gridScale) - 0.5;
      vec2 id = floor(uv * gridScale);
      
      for (int y = -1; y <= 1; y++) {
          for (int x = -1; x <= 1; x++) {
              vec2 offset = vec2(float(x), float(y));
              vec2 cellId = id + offset;
              vec2 rand = hash22(cellId + seed);
              
              // Random offset inside cell (clamped to prevent overlap)
              vec2 p = offset + (rand - 0.5) * 0.7;
              
              vec2 diff = gv - p;
              float d = length(diff);
              
              // Twinkling animation over time
              float twinkleSeed = hash21(cellId) * 6.28;
              float twinkle = sin(u_time * 1.5 * speedMultiplier * u_speed + twinkleSeed) * 0.45 + 0.55;
              
              // Star size based on second random factor
              float size = rand.y * u_starDensity;
              
              // Sharp exponential star glow decay (removes background gray fogginess)
              float starGlow = exp(-d * (45.0 / size)) * twinkle * 0.8;
              
              // Add a gorgeous 4-point lens flare (glint) for bright stars
              if (rand.y > 0.76) {
                  float rays = max(0.0, 1.0 - abs(diff.x * diff.y) * 1200.0);
                  starGlow += exp(-d * (20.0 / size)) * rays * twinkle * u_glowIntensity * 0.4;
              }
              
              // Subtle star color variations
              vec3 starColor = vec3(1.0);
              if (rand.x < 0.22) {
                  starColor = vec3(1.0, 0.94, 0.86); // Warm white / gold
              } else if (rand.x > 0.82) {
                  starColor = vec3(0.85, 0.92, 1.0); // Soft icy blue
              } else if (rand.x > 0.72 && rand.x <= 0.82) {
                  starColor = vec3(1.0, 0.88, 0.82); // Soft amber
              }
              
              col += starGlow * starColor;
          }
      }
      return col;
  }

  void main() {
      vec2 uv = v_uv;
      float aspect = u_resolution.x / u_resolution.y;
      vec2 p = uv - 0.5;
      p.x *= aspect;

      // 1. Nebula Background Glow
      vec2 nebulaCoord = p * 1.2 + vec2(u_time * 0.02 * u_speed);
      float nGlow1 = fbm(nebulaCoord);
      float nGlow2 = fbm(nebulaCoord + vec2(1.5, -1.0));
      
      // Cosmic colors - Dynamic based on light/dark mode
      vec3 spaceBlack;
      vec3 deepNavy;
      vec3 deepPurple;
      vec3 nebulaDust;
      
      if (u_isDark > 0.5) {
          spaceBlack = vec3(0.0, 0.0, 0.0);          // Pitch black
          deepNavy = vec3(0.003, 0.002, 0.01);       // Very dark navy
          deepPurple = vec3(0.006, 0.003, 0.012);     // Very dark purple
          nebulaDust = vec3(0.012, 0.005, 0.018);     // Very dark purple-grey dust
      } else {
          spaceBlack = vec3(0.98, 0.98, 0.99);       // Soft off-white
          deepNavy = vec3(0.93, 0.95, 0.98);         // Soft light blue
          deepPurple = vec3(0.95, 0.93, 0.97);       // Soft light lavender
          nebulaDust = vec3(0.97, 0.91, 0.94);       // Soft light rose
      }
      
      // Blend nebula clouds based on noise
      vec3 nebulaColor = mix(spaceBlack, deepNavy, nGlow1);
      nebulaColor = mix(nebulaColor, deepPurple, nGlow2 * 0.7);
      nebulaColor = mix(nebulaColor, nebulaDust, pow(nGlow1 * nGlow2, 1.8) * 0.5);
      
      // Scale nebula glow intensity
      vec3 finalBg = mix(spaceBlack, nebulaColor, u_nebulaIntensity);

      // 2. Star Layers with Parallax Offset
      vec3 finalStars = vec3(0.0);

      // Background small stars (little parallax)
      vec2 bgP = p + u_mouse * 0.012;
      finalStars += getStarLayer(bgP, 18.0, 0.6, 12.34);

      // Midground stars (medium parallax)
      vec2 midP = p + u_mouse * 0.025;
      finalStars += getStarLayer(midP, 10.0, 1.0, 56.78);

      // Foreground stars with glint (strongest parallax)
      vec2 fgP = p + u_mouse * 0.045;
      finalStars += getStarLayer(fgP, 5.0, 1.4, 90.12);

      // 3. Combine Background and Stars
      vec3 finalColor;
      if (u_isDark > 0.5) {
          // Dark Mode: Additive stars
          finalColor = finalBg + finalStars;
          finalColor = pow(finalColor, vec3(1.15));
      } else {
          // Light Mode: Stars act as dark ink-dot mask
          vec3 darkStarInk = vec3(0.08, 0.12, 0.22);
          finalColor = mix(finalBg, darkStarInk, clamp(finalStars, 0.0, 1.0));
          finalColor = pow(finalColor, vec3(0.95));
      }

      gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export function StarrySky({
  className,
  speed = 1,
  starDensity = 1,
  glowIntensity = 1,
  nebulaIntensity = 0.5,
  interactive = true,
  opacity = 1,
  children,
}: StarrySkyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const uniformsRef = useRef<{
    u_time: { value: number };
    u_resolution: { value: THREE.Vector2 };
    u_mouse: { value: THREE.Vector2 };
    u_speed: { value: number };
    u_starDensity: { value: number };
    u_glowIntensity: { value: number };
    u_nebulaIntensity: { value: number };
    u_isDark: { value: number };
  } | null>(null);

  const interactiveRef = useRef(interactive);
  const [darkTheme, setDarkTheme] = useState(true);

  // Dynamic theme detection
  useEffect(() => {
    const checkDark = () => {
      setDarkTheme(document.documentElement.classList.contains("dark"));
    };
    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Sync refs so they are updated dynamically without rebuilding the shader
  useEffect(() => {
    interactiveRef.current = interactive;
  }, [interactive]);

  useEffect(() => {
    if (uniformsRef.current) {
      uniformsRef.current.u_speed.value = speed;
      uniformsRef.current.u_starDensity.value = starDensity;
      uniformsRef.current.u_glowIntensity.value = glowIntensity;
      uniformsRef.current.u_nebulaIntensity.value = nebulaIntensity;
      uniformsRef.current.u_isDark.value = darkTheme ? 1.0 : 0.0;
    }
  }, [speed, starDensity, glowIntensity, nebulaIntensity, darkTheme]);

  // Handle mouse movements
  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      targetMouseRef.current = { x, y };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [interactive]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Create scene and camera
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      renderer.setSize(width, height, false);
      renderer.setPixelRatio(dpr);

      material.uniforms.u_resolution.value.set(width * dpr, height * dpr);
    };

    // Uniforms mapping
    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2() },
      u_mouse: { value: new THREE.Vector2() },
      u_speed: { value: speed },
      u_starDensity: { value: starDensity },
      u_glowIntensity: { value: glowIntensity },
      u_nebulaIntensity: { value: nebulaIntensity },
      u_isDark: { value: darkTheme ? 1.0 : 0.0 },
    };
    uniformsRef.current = uniforms;

    // Create full screen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
      depthWrite: false,
      depthTest: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    resize();

    // Add resize observer to resize dynamically
    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(container);

    let animationFrameId = 0;
    const startTime = performance.now();

    const animate = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      material.uniforms.u_time.value = elapsed;

      // Smooth interpolation for mouse parallax (easing/lag)
      if (interactiveRef.current) {
        mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.08;
        mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.08;
      } else {
        mouseRef.current.x += (0 - mouseRef.current.x) * 0.08;
        mouseRef.current.y += (0 - mouseRef.current.y) * 0.08;
      }
      material.uniforms.u_mouse.value.set(mouseRef.current.x, mouseRef.current.y);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      resizeObserver.disconnect();

      // Dispose Three.js objects to prevent memory leaks
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      uniformsRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden transition-colors duration-300",
        darkTheme ? "bg-black" : "bg-[#fafafc]",
        className
      )}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ opacity }} />
      {children && <div className="relative z-10 w-full h-full">{children}</div>}
    </div>
  );
}

export default StarrySky;
