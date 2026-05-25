"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import {
  Clock,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer
} from "three";

interface WavePosition {
  x: number;
  y: number;
  rotate: number;
}

interface RnaLinesProps {
  linesGradient?: string[];
  enabledWaves?: Array<"top" | "middle" | "bottom">;
  lineCount?: number | number[];
  lineDistance?: number | number[];
  topWavePosition?: WavePosition;
  middleWavePosition?: WavePosition;
  bottomWavePosition?: WavePosition;
  speed?: number; // Maps to animationSpeed
  interactive?: boolean;
  bendRadius?: number;
  bendStrength?: number;
  mouseDamping?: number;
  parallax?: boolean;
  parallaxStrength?: number;
  mixBlendMode?: React.CSSProperties["mixBlendMode"];
  opacity?: number;
  className?: string;
  children?: React.ReactNode;
}

const vertexShader = `
precision highp float;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3  iResolution;
uniform float animationSpeed;

uniform bool enableTop;
uniform bool enableMiddle;
uniform bool enableBottom;

uniform int topLineCount;
uniform int middleLineCount;
uniform int bottomLineCount;

uniform float topLineDistance;
uniform float middleLineDistance;
uniform float bottomLineDistance;

uniform vec3 topWavePosition;
uniform vec3 middleWavePosition;
uniform vec3 bottomWavePosition;

uniform vec2 iMouse;
uniform bool interactive;
uniform float bendRadius;
uniform float bendStrength;
uniform float bendInfluence;

uniform bool parallax;
uniform float parallaxStrength;
uniform vec2 parallaxOffset;

uniform vec3 lineGradient[8];
uniform int lineGradientCount;

uniform float u_dark;
uniform float u_opacity;

const vec3 BLACK = vec3(0.0);

vec3 get_red_color() {
  // Vibrant neon pink-red in dark mode, deep ruby-red in light mode
  return (u_dark > 0.5) ? vec3(255.0, 75.0, 95.0) / 255.0 : vec3(220.0, 30.0, 60.0) / 255.0;
}

vec3 get_white_color() {
  // Silver-white in dark mode, pure black in light mode!
  return (u_dark > 0.5) ? vec3(230.0, 235.0, 255.0) / 255.0 : vec3(0.0);
}

mat2 rotate(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

vec3 background_color(vec2 uv) {
  // Little darker void in dark mode, pure white in light mode
  vec3 base_bg = (u_dark > 0.5) ? vec3(8.0, 6.0, 10.0) / 255.0 : vec3(1.0);
  
  float y = sin(uv.x - 0.2) * 0.3 - 0.1;
  float m = uv.y - y;
  
  vec3 w_col = get_white_color();
  vec3 r_col = get_red_color();

  // If in light mode, let's keep the background completely pure white without any tint!
  float tint_mult = (u_dark > 0.5) ? 0.012 : 0.0;
  vec3 tint = mix(w_col, BLACK, smoothstep(0.0, 1.5, abs(m))) * tint_mult;
  tint += mix(r_col, BLACK, smoothstep(0.0, 1.5, abs(m - 0.8))) * tint_mult;
  
  return base_bg + tint;
}

vec3 line_color(float t, vec2 uv) {
  vec3 col = vec3(0.0);
  float y = sin(uv.x - 0.2) * 0.3 - 0.1;
  float m = uv.y - y;

  vec3 w_col = get_white_color();
  vec3 r_col = get_red_color();

  col += mix(w_col, BLACK, smoothstep(0.0, 1.0, abs(m)));
  col += mix(r_col, BLACK, smoothstep(0.0, 1.0, abs(m - 0.8)));
  return clamp(col, 0.0, 1.0);
}

vec3 getLineColor(float t, vec3 baseColor, vec2 uv) {
  if (lineGradientCount <= 0) {
    return line_color(t, uv);
  }

  vec3 gradientColor = vec3(0.0);
  
  if (lineGradientCount == 1) {
    gradientColor = lineGradient[0];
  } else {
    float clampedT = clamp(t, 0.0, 0.9999);
    float scaled = clampedT * float(lineGradientCount - 1);
    int idx = int(floor(scaled));
    float f = fract(scaled);
    
    // Unrolled indexing structure for standard GLSL compilation compatibility
    for (int i = 0; i < 8; ++i) {
      if (i == idx) {
        vec3 c1 = lineGradient[i];
        vec3 c2 = c1;
        if (i == 0) c2 = lineGradient[1];
        else if (i == 1) c2 = lineGradient[2];
        else if (i == 2) c2 = lineGradient[3];
        else if (i == 3) c2 = lineGradient[4];
        else if (i == 4) c2 = lineGradient[5];
        else if (i == 5) c2 = lineGradient[6];
        else if (i == 6) c2 = lineGradient[7];
        
        gradientColor = mix(c1, c2, f);
        break;
      }
    }
  }
  
  return gradientColor * 0.55;
}

float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, bool shouldBend, float fi) {
  float time = iTime * animationSpeed;

  // Intertwining weave phase offset (DNA revolving effect!)
  float phase = fi * 0.32;
  float x_offset   = offset + phase;
  float x_movement = time * 0.12;
  float amp        = sin(offset + time * 0.25) * 0.35;
  
  // Revolve lines in opposite phase for even/odd indices to form beautiful intertwining double helix weaves
  float y;
  if (mod(fi, 2.0) == 0.0) {
    y = sin(uv.x + x_offset + x_movement) * amp;
  } else {
    y = sin(uv.x - x_offset - x_movement) * amp;
  }

  if (shouldBend) {
    vec2 d = screenUv - mouseUv;
    float influence = exp(-dot(d, d) * bendRadius);
    float bendOffset = (mouseUv.y - screenUv.y) * influence * bendStrength * bendInfluence;
    y += bendOffset;
  }

  float m = uv.y - y;
  // Thickened luxury ribbon threads that are perfectly visible and clear
  return 0.016 / (m * m * 14.0 + 0.006) + 0.003;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 baseUv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  baseUv.y *= -1.0;
  
  if (parallax) {
    baseUv += parallaxOffset;
  }

  // Draw dark velvet ambient backdrop
  vec3 bg = background_color(baseUv);
  vec3 col = bg;

  vec2 mouseUv = vec2(0.0);
  if (interactive) {
    mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
    mouseUv.y *= -1.0;
  }
  
  if (enableBottom) {
    for (int i = 0; i < 20; ++i) {
      if (i >= bottomLineCount) break;
      float fi = float(i);
      float t = fi / max(float(bottomLineCount - 1), 1.0);
      
      // Bottom wave is the beautiful Silver/White ribbon (shifts to Pure Black in light mode)
      vec3 w_col = get_white_color();
      vec3 lineCol = lineGradientCount > 0 ? getLineColor(t, bg, baseUv) : w_col;
      
      float angle = bottomWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      
      float intensity = wave(
        ruv + vec2(bottomLineDistance * fi + bottomWavePosition.x, bottomWavePosition.y),
        1.5 + 0.2 * fi,
        baseUv,
        mouseUv,
        interactive,
        fi
      ) * 0.18;
      col = mix(col, lineCol, clamp(intensity, 0.0, 1.0));
    }
  }

  if (enableMiddle) {
    for (int i = 0; i < 20; ++i) {
      if (i >= middleLineCount) break;
      float fi = float(i);
      float t = fi / max(float(middleLineCount - 1), 1.0);
      
      // Middle wave is the stunning vibrant Neon Pink/Red ribbon!
      vec3 r_col = get_red_color();
      vec3 lineCol = lineGradientCount > 0 ? getLineColor(t, bg, baseUv) : r_col;
      
      float angle = middleWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      
      float intensity = wave(
        ruv + vec2(middleLineDistance * fi + middleWavePosition.x, middleWavePosition.y),
        2.0 + 0.15 * fi,
        baseUv,
        mouseUv,
        interactive,
        fi
      ) * 0.45;
      col = mix(col, lineCol, clamp(intensity, 0.0, 1.0));
    }
  }

  if (enableTop) {
    for (int i = 0; i < 20; ++i) {
      if (i >= topLineCount) break;
      float fi = float(i);
      float t = fi / max(float(topLineCount - 1), 1.0);
      
      // Top wave is the Neon Pink/Red ribbon!
      vec3 r_col = get_red_color();
      vec3 lineCol = lineGradientCount > 0 ? getLineColor(t, bg, baseUv) : r_col;
      
      float angle = topWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      ruv.x *= -1.0;
      
      float intensity = wave(
        ruv + vec2(topLineDistance * fi + topWavePosition.x, topWavePosition.y),
        1.0 + 0.2 * fi,
        baseUv,
        mouseUv,
        interactive,
        fi
      ) * 0.12;
      col = mix(col, lineCol, clamp(intensity, 0.0, 1.0));
    }
  }

  fragColor = vec4(col * u_opacity, u_opacity);
}

void main() {
  vec4 color = vec4(0.0);
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}
`;

function hexToVec3(hex: string): [number, number, number] {
  if (!hex) return [1.0, 1.0, 1.0];
  let value = hex.trim();
  if (value.startsWith("#")) {
    value = value.slice(1);
  }

  let r = 255;
  let g = 255;
  let b = 255;

  if (value.length === 3) {
    r = parseInt(value[0] + value[0], 16);
    g = parseInt(value[1] + value[1], 16);
    b = parseInt(value[2] + value[2], 16);
  } else if (value.length === 6) {
    r = parseInt(value.slice(0, 2), 16);
    g = parseInt(value.slice(2, 4), 16);
    b = parseInt(value.slice(4, 6), 16);
  }

  r = isNaN(r) ? 255 : r;
  g = isNaN(g) ? 255 : g;
  b = isNaN(b) ? 255 : b;

  return [r / 255, g / 255, b / 255];
}

export function RnaLines({
  linesGradient,
  enabledWaves = ["top", "middle", "bottom"],
  lineCount = [7],
  lineDistance = [2.0],
  topWavePosition,
  middleWavePosition,
  bottomWavePosition,
  speed = 1.0,
  interactive = true,
  bendRadius = 5.0,
  bendStrength = -0.52,
  mouseDamping = 0.05,
  parallax = true,
  parallaxStrength = 0.2,
  mixBlendMode = "normal",
  opacity = 1.0,
  className,
  children,
}: RnaLinesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const targetMouseRef = useRef(new Vector2(-1000, -1000));
  const currentMouseRef = useRef(new Vector2(-1000, -1000));
  const targetInfluenceRef = useRef(0);
  const currentInfluenceRef = useRef(0);
  const targetParallaxRef = useRef(new Vector2(0, 0));
  const currentParallaxRef = useRef(new Vector2(0, 0));

  const [isDark, setIsDark] = useState(true);

  // Monitor theme preference changes on HTML element
  useEffect(() => {
    const checkTheme = () => {
      const isDarkClass = document.documentElement.classList.contains("dark");
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const dataTheme = document.documentElement.getAttribute("data-theme") === "dark";
      setIsDark(isDarkClass || dataTheme || (!document.documentElement.classList.contains("light") && isSystemDark));
    };

    checkTheme();

    const observer = new MutationObserver(() => {
      checkTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      checkTheme();
    };

    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  // Compute standard positions
  const topPos = {
    x: topWavePosition?.x ?? 10.0,
    y: topWavePosition?.y ?? 0.5,
    rotate: topWavePosition?.rotate ?? -0.4,
  };
  const middlePos = {
    x: middleWavePosition?.x ?? 5.0,
    y: middleWavePosition?.y ?? 0.0,
    rotate: middleWavePosition?.rotate ?? 0.2,
  };
  const bottomPos = {
    x: bottomWavePosition?.x ?? 2.0,
    y: bottomWavePosition?.y ?? -0.7,
    rotate: bottomWavePosition?.rotate ?? 0.4,
  };

  // High performance props reference storage
  const propsRef = useRef({
    linesGradient,
    enabledWaves,
    lineCount,
    lineDistance,
    topPos,
    middlePos,
    bottomPos,
    speed,
    interactive,
    bendRadius,
    bendStrength,
    mouseDamping,
    parallax,
    parallaxStrength,
    isDark,
    opacity,
  });

  // Sync props to refs dynamically to bypass rendering teardown cycles
  useEffect(() => {
    propsRef.current = {
      linesGradient,
      enabledWaves,
      lineCount,
      lineDistance,
      topPos,
      middlePos,
      bottomPos,
      speed,
      interactive,
      bendRadius,
      bendStrength,
      mouseDamping,
      parallax,
      parallaxStrength,
      isDark,
      opacity,
    };
  }, [
    linesGradient,
    enabledWaves,
    lineCount,
    lineDistance,
    topPos.x, topPos.y, topPos.rotate,
    middlePos.x, middlePos.y, middlePos.rotate,
    bottomPos.x, bottomPos.y, bottomPos.rotate,
    speed,
    interactive,
    bendRadius,
    bendStrength,
    mouseDamping,
    parallax,
    parallaxStrength,
    isDark,
    opacity,
  ]);

  // Main Three.js Initializer - Runs EXACTLY ONCE on component mount to prevent WebGL context leaks
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let active = true;

    const scene = new Scene();

    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // Canvas CSS styling for absolute background layering
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.zIndex = "0";
    renderer.domElement.style.pointerEvents = "none";

    container.appendChild(renderer.domElement);

    const initP = propsRef.current;

    // Get current line metrics
    const getLineCount = (waveType: "top" | "middle" | "bottom"): number => {
      if (typeof initP.lineCount === "number") return initP.lineCount;
      if (!initP.enabledWaves.includes(waveType)) return 0;
      const index = initP.enabledWaves.indexOf(waveType);
      return initP.lineCount[index] ?? 6;
    };

    const getLineDistance = (waveType: "top" | "middle" | "bottom"): number => {
      if (typeof initP.lineDistance === "number") return initP.lineDistance;
      if (!initP.enabledWaves.includes(waveType)) return 0.1;
      const index = initP.enabledWaves.indexOf(waveType);
      return initP.lineDistance[index] ?? 0.1;
    };

    const topLineCountVal = initP.enabledWaves.includes("top") ? getLineCount("top") : 0;
    const middleLineCountVal = initP.enabledWaves.includes("middle") ? getLineCount("middle") : 0;
    const bottomLineCountVal = initP.enabledWaves.includes("bottom") ? getLineCount("bottom") : 0;

    const topLineDistanceVal = initP.enabledWaves.includes("top") ? getLineDistance("top") * 0.01 : 0.01;
    const middleLineDistanceVal = initP.enabledWaves.includes("middle") ? getLineDistance("middle") * 0.01 : 0.01;
    const bottomLineDistanceVal = initP.enabledWaves.includes("bottom") ? getLineDistance("bottom") * 0.01 : 0.01;

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new Vector3(1, 1, 1) },
      animationSpeed: { value: initP.speed },

      enableTop: { value: initP.enabledWaves.includes("top") },
      enableMiddle: { value: initP.enabledWaves.includes("middle") },
      enableBottom: { value: initP.enabledWaves.includes("bottom") },

      topLineCount: { value: topLineCountVal },
      middleLineCount: { value: middleLineCountVal },
      bottomLineCount: { value: bottomLineCountVal },

      topLineDistance: { value: topLineDistanceVal },
      middleLineDistance: { value: middleLineDistanceVal },
      bottomLineDistance: { value: bottomLineDistanceVal },

      topWavePosition: {
        value: new Vector3(topPos.x, topPos.y, topPos.rotate),
      },
      middleWavePosition: {
        value: new Vector3(middlePos.x, middlePos.y, middlePos.rotate),
      },
      bottomWavePosition: {
        value: new Vector3(bottomPos.x, bottomPos.y, bottomPos.rotate),
      },

      iMouse: { value: new Vector2(-1000, -1000) },
      interactive: { value: initP.interactive },
      bendRadius: { value: initP.bendRadius },
      bendStrength: { value: initP.bendStrength },
      bendInfluence: { value: 0.0 },

      parallax: { value: initP.parallax },
      parallaxStrength: { value: initP.parallaxStrength },
      parallaxOffset: { value: new Vector2(0, 0) },

      lineGradient: {
        value: Array.from({ length: 8 }, () => new Vector3(1, 1, 1)),
      },
      lineGradientCount: { value: 0 },

      u_dark: { value: initP.isDark ? 1.0 : 0.0 },
      u_opacity: { value: initP.opacity },
    };

    const applyGradients = (stops: string[]) => {
      const cleanStops = stops.slice(0, 8);
      uniforms.lineGradientCount.value = cleanStops.length;
      cleanStops.forEach((hex, i) => {
        const [r, g, b] = hexToVec3(hex);
        uniforms.lineGradient.value[i].set(r, g, b);
      });
    };

    if (initP.linesGradient && initP.linesGradient.length > 0) {
      applyGradients(initP.linesGradient);
    }

    const material = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
    });

    const geometry = new PlaneGeometry(2, 2);
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    const clock = new Clock();

    const setSize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;

      renderer.setSize(w, h, false);

      const canvasWidth = renderer.domElement.width;
      const canvasHeight = renderer.domElement.height;
      uniforms.iResolution.value.set(canvasWidth, canvasHeight, 1);
    };

    setSize();

    const resizeObserver = new ResizeObserver(() => {
      if (!active) return;
      setSize();
    });
    resizeObserver.observe(container);

    const handlePointerMove = (e: PointerEvent) => {
      const p = propsRef.current;
      const rect = renderer.domElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dpr = renderer.getPixelRatio();

      targetMouseRef.current.set(x * dpr, (rect.height - y) * dpr);
      targetInfluenceRef.current = 1.0;

      if (p.parallax) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const offsetX = (x - centerX) / rect.width;
        const offsetY = -(y - centerY) / rect.height;
        targetParallaxRef.current.set(offsetX * p.parallaxStrength, offsetY * p.parallaxStrength);
      }
    };

    const handlePointerLeave = () => {
      targetInfluenceRef.current = 0.0;
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    let rafId = 0;
    const renderLoop = () => {
      if (!active) return;

      const p = propsRef.current;

      uniforms.iTime.value = clock.getElapsedTime();

      // Dynamic parameters syncing
      uniforms.animationSpeed.value = p.speed;
      uniforms.enableTop.value = p.enabledWaves.includes("top");
      uniforms.enableMiddle.value = p.enabledWaves.includes("middle");
      uniforms.enableBottom.value = p.enabledWaves.includes("bottom");

      // Dynamic line count calculations
      const dGetLineCount = (waveType: "top" | "middle" | "bottom"): number => {
        if (typeof p.lineCount === "number") return p.lineCount;
        if (!p.enabledWaves.includes(waveType)) return 0;
        const idx = p.enabledWaves.indexOf(waveType);
        return p.lineCount[idx] ?? 6;
      };

      const dGetLineDistance = (waveType: "top" | "middle" | "bottom"): number => {
        if (typeof p.lineDistance === "number") return p.lineDistance;
        if (!p.enabledWaves.includes(waveType)) return 0.1;
        const idx = p.enabledWaves.indexOf(waveType);
        return p.lineDistance[idx] ?? 0.1;
      };

      uniforms.topLineCount.value = p.enabledWaves.includes("top") ? dGetLineCount("top") : 0;
      uniforms.middleLineCount.value = p.enabledWaves.includes("middle") ? dGetLineCount("middle") : 0;
      uniforms.bottomLineCount.value = p.enabledWaves.includes("bottom") ? dGetLineCount("bottom") : 0;

      uniforms.topLineDistance.value = p.enabledWaves.includes("top") ? dGetLineDistance("top") * 0.01 : 0.01;
      uniforms.middleLineDistance.value = p.enabledWaves.includes("middle") ? dGetLineDistance("middle") * 0.01 : 0.01;
      uniforms.bottomLineDistance.value = p.enabledWaves.includes("bottom") ? dGetLineDistance("bottom") * 0.01 : 0.01;

      uniforms.topWavePosition.value.set(p.topPos.x, p.topPos.y, p.topPos.rotate);
      uniforms.middleWavePosition.value.set(p.middlePos.x, p.middlePos.y, p.middlePos.rotate);
      uniforms.bottomWavePosition.value.set(p.bottomPos.x, p.bottomPos.y, p.bottomPos.rotate);

      uniforms.interactive.value = p.interactive;
      uniforms.bendRadius.value = p.bendRadius;
      uniforms.bendStrength.value = p.bendStrength;
      uniforms.parallax.value = p.parallax;
      uniforms.parallaxStrength.value = p.parallaxStrength;

      const doc = document.documentElement;
      const isDarkNow =
        doc.classList.contains("dark") ||
        doc.getAttribute("data-theme") === "dark" ||
        (!doc.classList.contains("light") &&
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      uniforms.u_dark.value = isDarkNow ? 1.0 : 0.0;
      uniforms.u_opacity.value = p.opacity;

      if (p.linesGradient) {
        applyGradients(p.linesGradient);
      } else {
        uniforms.lineGradientCount.value = 0;
      }

      if (p.interactive) {
        currentMouseRef.current.lerp(targetMouseRef.current, p.mouseDamping);
        uniforms.iMouse.value.copy(currentMouseRef.current);

        currentInfluenceRef.current += (targetInfluenceRef.current - currentInfluenceRef.current) * p.mouseDamping;
        uniforms.bendInfluence.value = currentInfluenceRef.current;
      }

      if (p.parallax) {
        currentParallaxRef.current.lerp(targetParallaxRef.current, p.mouseDamping);
        uniforms.parallaxOffset.value.copy(currentParallaxRef.current);
      }

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      active = false;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();

      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);

      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden w-full h-full select-none touch-none bg-white dark:bg-black", className)}
      style={{ mixBlendMode }}
    >
      {/* Three.js appends canvas directly behind children overlay */}
      {children && <div className="relative z-10 w-full h-full">{children}</div>}
    </div>
  );
}
