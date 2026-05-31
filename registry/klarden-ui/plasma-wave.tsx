"use client";

import { useRef, useEffect } from "react";
import { Renderer, Camera, Transform, Program, Mesh, Geometry } from "ogl";
import { cn } from "@/lib/utils";

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

const VERT = /* glsl */ `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision mediump float;
uniform float iTime;
uniform vec2  iResolution;
uniform vec2  uOffset;
uniform vec2  uMouse;
uniform float uRotation;
uniform float uFocalLength;
uniform float uSpeed1;
uniform float uSpeed2;
uniform float uDir2;
uniform float uBend1;
uniform float uBend2;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform float uDark;

const float lt   = 0.3;
const float pi   = 3.14159;
const float pi2  = 6.28318;
const float pi_2 = 1.5708;
#define MAX_STEPS 14

void mainImage(out vec4 C, in vec2 U) {
  float t = iTime * pi;
  float s = 1.0;
  float d = 0.0;
  vec2  R = iResolution;

  // Mirror horizontally: flip the screen X-coordinate around the viewport center
  vec2 mirroredU = vec2(R.x - U.x, U.y);

  vec3 o = vec3(0.0, 0.0, -7.0);

  // Parallax Tilt: Sway camera ray direction slightly based on normalized pointer coordinates
  // (Mirroring pointer sway along X to keep mouse tilt naturally aligned!)
  vec2 pointerOffset = vec2(-uMouse.x, uMouse.y) * 0.16;
  vec3 u = normalize(vec3((mirroredU - 0.5 * R) / R.y + pointerOffset, uFocalLength));
  vec2 k = vec2(0.0);
  vec3 p;

  float t1 = t * 0.7;
  float t2 = t * 0.9;
  float tSpeed1 = t * uSpeed1;
  float tSpeed2 = t * uSpeed2 * uDir2;

  // Normalized pointer coordinates scaled for fluid warp
  // (Mirroring pointer X coordinates so localized ripples align perfectly under the cursor!)
  vec2 pointerPos = vec2(-uMouse.x, uMouse.y) * 0.6;

  for (int i = 0; i < MAX_STEPS; ++i) {
    p = o + u * d;
    p.x -= 15.0;

    // Localized Fluid Ripple: push wave coordinates dynamically around the pointer position
    float pointerDist = length(p.yz - pointerPos * 2.5);
    float pointerWarp = exp(-pointerDist * 1.8) * 0.42;
    p.yz += pointerPos * pointerWarp;

    float px = p.x;
    float wob1 = uBend1 + sin(t1 + px * 0.8) * 0.1;
    float wob2 = uBend2 + cos(t2 + px * 1.1) * 0.1;

    float px2 = px + pi_2;
    vec2 sinOffset = sin(vec2(px, px2) + tSpeed1) * wob1;
    vec2 cosOffset = cos(vec2(px, px2) + tSpeed2) * wob2;

    vec2 yz = p.yz;
    float pxLt = px + lt;
    k.x = max(pxLt, length(yz - sinOffset) - lt);
    k.y = max(pxLt, length(yz - cosOffset) - lt);

    float current = min(k.x, k.y);
    s = min(s, current);
    if (s < 0.001 || d > 300.0) break;
    d += s * 0.7;
  }

  // Highly premium color presets tailored specifically for Light Mode:
  // If uDark = 1.0 (Dark Mode), we use the user's glowing neon colors.
  // If uDark = 0.0 (Light Mode), we map:
  // - Gold/Amber (col1) -> A rich, luxurious deep copper-burnt amber (vec3(0.68, 0.38, 0.08))
  // - Silver/Light (col2) -> An extremely sleek dark slate-obsidian (vec3(0.06, 0.07, 0.11))
  vec3 col1 = mix(vec3(0.68, 0.38, 0.08), uColor1, uDark);
  vec3 col2 = mix(vec3(0.06, 0.07, 0.11), uColor2, uDark);

  float sqrtD = sqrt(d);
  vec3 raw = max(cos(d * pi2) - s * sqrtD - vec3(k, 0.0), 0.0);
  raw.gb += 0.1;
  float maxC = max(raw.r, max(raw.g, raw.b));

  raw = raw * 0.4 + raw.brg * 0.6 + raw * raw;
  float lum = dot(raw, vec3(0.299, 0.587, 0.114));

  // Premium Lens Chromatic Aberration: split color bands outwards based on screen radius
  float edgeDist = length((U - 0.5 * R) / R.y);
  float shift = 0.024 * edgeDist;

  // Exposure dynamically scaled: lower in light mode to prevent white-out overexposure
  float exposure = mix(1.8, 3.5, uDark);

  // Red Channel Split
  float w1_r = max(0.0, 1.0 - (k.x - shift) * 2.0);
  float w2_r = max(0.0, 1.0 - (k.y - shift) * 2.0);
  float wt_r = w1_r + w2_r + 0.001;
  float c_r = (col1.r * w1_r + col2.r * w2_r) / wt_r * lum * exposure;

  // Green Channel (Baseline)
  float w1_g = max(0.0, 1.0 - k.x * 2.0);
  float w2_g = max(0.0, 1.0 - k.y * 2.0);
  float wt_g = w1_g + w2_g + 0.001;
  float c_g = (col1.g * w1_g + col2.g * w2_g) / wt_g * lum * exposure;

  // Blue Channel Split
  float w1_b = max(0.0, 1.0 - (k.x + shift) * 2.0);
  float w2_b = max(0.0, 1.0 - (k.y + shift) * 2.0);
  float wt_b = w1_b + w2_b + 0.001;
  float c_b = (col1.b * w1_b + col2.b * w2_b) / wt_b * lum * exposure;

  // Anti-Aliasing Alpha Fade: instead of hard 'discard' which leaves pixelated/harsh edges on a white backdrop,
  // we calculate a smooth alpha transition to let the edges blend softly into the container background.
  float alpha = smoothstep(0.12, 0.38, maxC);

  C = vec4(c_r, c_g, c_b, alpha);
}

void main() {
  vec2 coord = gl_FragCoord.xy + uOffset;
  coord -= 0.5 * iResolution;
  float c = cos(uRotation), s = sin(uRotation);
  coord = mat2(c, -s, s, c) * coord;
  coord += 0.5 * iResolution;

  vec4 color;
  mainImage(color, coord);
  gl_FragColor = color;
}
`;

export interface PlasmaWaveProps {
  className?: string;
  opacity?: number;
  children?: React.ReactNode;
  xOffset?: number;
  yOffset?: number;
  rotationDeg?: number;
  focalLength?: number;
  speed1?: number;
  speed2?: number;
  dir2?: number;
  bend1?: number;
  bend2?: number;
  colors?: [string, string];
}

export function PlasmaWave(props: PlasmaWaveProps) {
  const {
    className,
    opacity = 1,
    children,
    xOffset = 0,
    yOffset = 0,
    rotationDeg = 0,
    focalLength = 0.8,
    speed1 = 0.05,
    speed2 = 0.05,
    dir2 = 1.0,
    bend1 = 1,
    bend2 = 0.5,
    colors = ["#A855F7", "#06B6D4"],
  } = props;

  const propsRef = useRef<PlasmaWaveProps>(props);
  propsRef.current = props;

  const containerRef = useRef<HTMLDivElement>(null);

  const targetMouse = useRef(new Float32Array([0, 0]));
  const currentMouse = useRef(new Float32Array([0, 0]));

  useEffect(() => {
    const ctn = containerRef.current;
    if (!ctn) return;

    const renderer = new Renderer({
      alpha: true,
      dpr: Math.min(window.devicePixelRatio, 1.5),
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    // Dynamically style the canvas to match our absolute full-bleed layout
    gl.canvas.className = "absolute inset-0 h-full w-full pointer-events-none";
    gl.canvas.style.opacity = opacity.toString();
    ctn.appendChild(gl.canvas);

    const camera = new Camera(gl);
    const scene = new Transform();

    const geometry = new Geometry(gl, {
      position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
    });

    const uniformOffset = new Float32Array([xOffset, yOffset]);
    const uniformResolution = new Float32Array([1, 1]);
    const uniformMouse = new Float32Array([0, 0]);
    const c1 = hexToRgb(colors[0]);
    const c2 = hexToRgb(colors[1]);

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: uniformResolution },
        uOffset: { value: uniformOffset },
        uMouse: { value: uniformMouse },
        uRotation: { value: (rotationDeg * Math.PI) / 180 },
        uFocalLength: { value: focalLength },
        uSpeed1: { value: speed1 },
        uSpeed2: { value: speed2 },
        uDir2: { value: dir2 },
        uBend1: { value: bend1 },
        uBend2: { value: bend2 },
        uColor1: { value: c1 },
        uColor2: { value: c2 },
        uDark: { value: 1.0 },
      },
    });

    new Mesh(gl, { geometry, program }).setParent(scene);

    function resize() {
      if (!ctn) return;
      const { width, height } = ctn.getBoundingClientRect();
      renderer.setSize(width, height);
      uniformResolution[0] = width * renderer.dpr;
      uniformResolution[1] = height * renderer.dpr;
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(ctn);
    resize();

    // Theme monitoring function (MutationObserver on class/data-theme updates)
    const checkTheme = () => {
      const doc = document.documentElement;
      const isDarkClass = doc.classList.contains("dark");
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const dataTheme = doc.getAttribute("data-theme") === "dark";
      const isDark = isDarkClass || dataTheme || (!doc.classList.contains("light") && isSystemDark);
      
      program.uniforms.uDark.value = isDark ? 1.0 : 0.0;
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

    // Mouse pointer listener handlers for dynamic sways & ripples
    const handlePointerMove = (e: PointerEvent) => {
      const rect = ctn.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetMouse.current[0] = x;
      targetMouse.current[1] = y;
    };

    const handlePointerLeave = () => {
      targetMouse.current[0] = 0;
      targetMouse.current[1] = 0;
    };

    ctn.addEventListener("pointermove", handlePointerMove);
    ctn.addEventListener("pointerleave", handlePointerLeave);

    const startTime = performance.now();
    let animateId: number;

    const update = (now: number) => {
      const {
        xOffset: xOff = 0,
        yOffset: yOff = 0,
        rotationDeg: rot = 0,
        focalLength: fLen = 0.8,
        speed1: s1 = 0.05,
        speed2: s2 = 0.05,
        dir2: d2 = 1.0,
        bend1: b1 = 1,
        bend2: b2 = 0.5,
        colors: cols = ["#A855F7", "#06B6D4"],
        opacity: op = 1,
      } = propsRef.current;

      // Pointer interpolation (lerp)
      currentMouse.current[0] += (targetMouse.current[0] - currentMouse.current[0]) * 0.08;
      currentMouse.current[1] += (targetMouse.current[1] - currentMouse.current[1]) * 0.08;

      uniformOffset[0] = xOff;
      uniformOffset[1] = yOff;
      uniformMouse[0] = currentMouse.current[0];
      uniformMouse[1] = currentMouse.current[1];

      program.uniforms.iTime.value = (now - startTime) * 0.001;
      
      // Dynamic tilt sway of the rotation angle based on mouse movement (mirrored)
      const dynamicRot = rot - currentMouse.current[0] * 6;
      program.uniforms.uRotation.value = (dynamicRot * Math.PI) / 180;

      program.uniforms.uFocalLength.value = fLen;
      program.uniforms.uSpeed1.value = s1;
      program.uniforms.uSpeed2.value = s2;
      program.uniforms.uDir2.value = d2;
      program.uniforms.uBend1.value = b1;
      program.uniforms.uBend2.value = b2;
      program.uniforms.uColor1.value = hexToRgb(cols[0]);
      program.uniforms.uColor2.value = hexToRgb(cols[1]);

      gl.canvas.style.opacity = op.toString();

      renderer.render({ scene, camera });
      animateId = requestAnimationFrame(update);
    };

    animateId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animateId);
      ro.disconnect();
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleMediaChange);
      ctn.removeEventListener("pointermove", handlePointerMove);
      ctn.removeEventListener("pointerleave", handlePointerLeave);
      if (ctn && gl.canvas.parentNode === ctn) {
        ctn.removeChild(gl.canvas);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden w-full h-full bg-white dark:bg-black", className)}>
      {children && <div className="relative z-10 w-full h-full">{children}</div>}
    </div>
  );
}
