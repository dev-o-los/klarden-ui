"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface AnimatedGradientProps {
  className?: string;
  variant?: "mist" | "lava" | "prism" | "plasma" | "pulse" | "vortex";
  speed?: number;
  opacity?: number;
}

const VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const MIST_SHADER = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  varying vec2 v_uv;
  uniform float u_time;
  uniform vec2 u_resolution;

  #define PI 3.14159265359

  float wave(float x, float y, float t) {
    return sin(x * 2.5 + y * 1.8 + t) * 0.5 + 0.5;
  }
  float wave2(float x, float y, float t) {
    return sin(x * 4.0 - y * 2.5 + t * 1.3) * 0.5 + 0.5;
  }
  float wave3(float x, float y, float t) {
    return sin(x * 1.5 + y * 3.2 + t * 0.7 + PI * 0.5) * 0.5 + 0.5;
  }

  void main() {
    vec2 uv = v_uv;
    float aspect = u_resolution.x / u_resolution.y;
    uv.x *= aspect;
    
    float t = u_time * 0.25;
    
    float n1 = wave(uv.x, uv.y, t);
    float n2 = wave2(uv.x + n1 * 0.5, uv.y - n1 * 0.3, t * 1.2);
    float n3 = wave3(uv.x - n2 * 0.4, uv.y + n2 * 0.5, t * 0.8);
    
    float flow = uv.x * 0.5 + uv.y * 0.5 + t;
    float w1 = sin(flow * 4.0 + n1 * 3.0) * 0.5 + 0.5;
    float w2 = sin(flow * 6.0 - n2 * 4.0 + PI) * 0.5 + 0.5;
    float w3 = sin(flow * 3.0 + n3 * 2.5 + PI * 0.25) * 0.5 + 0.5;
    
    float b1 = pow(w1, 3.0) * pow(w2, 1.5);
    float b2 = pow(w2, 2.0) * pow(w3, 2.0) * 0.7;
    float b3 = pow(w3, 3.5) * 0.5;
    
    float intensity = b1 * 0.8 + b2 * 0.6 + b3 * 0.5;
    
    vec2 center = vec2(0.5 * aspect, 0.5);
    float dist = length(uv - center);
    intensity += (n1 * 0.15 + n2 * 0.1) * (1.0 - smoothstep(0.0, 1.0, dist));
    
    vec3 col1 = vec3(0.98, 0.08, 0.51); // Hot pink
    vec3 col2 = vec3(0.55, 0.09, 0.79); // Purple
    vec3 col3 = vec3(0.12, 0.05, 0.38); // Deep Indigo
    vec3 col4 = vec3(0.85, 0.23, 0.64); // Violet/Magenta
    
    vec3 col = mix(col1, col2, n1);
    col = mix(col, col3, n2 * 0.5);
    col = mix(col, col4, w3 * 0.3);
    
    col = col * (intensity * 1.5 + 0.1);
    col = pow(col, vec3(0.85));
    
    gl_FragColor = vec4(col, 1.0);
  }
`;

const LAVA_SHADER = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  varying vec2 v_uv;
  uniform float u_time;
  uniform vec2 u_resolution;

  #define PI 3.14159265359

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 4; ++i) {
      v += a * noise(p);
      p = rot * p * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = v_uv;
    float aspect = u_resolution.x / u_resolution.y;
    uv.x *= aspect;
    
    float t = u_time * 0.15;
    
    vec2 q = vec2(0.0);
    q.x = fbm(uv * 3.0 + vec2(t, 0.0));
    q.y = fbm(uv * 3.0 + vec2(0.0, t));
    
    vec2 r = vec2(0.0);
    r.x = fbm(uv * 3.0 + 4.0 * q + vec2(1.7, 9.2) + 0.15 * t);
    r.y = fbm(uv * 3.0 + 4.0 * q + vec2(8.3, 2.8) + 0.126 * t);
    
    float f = fbm(uv * 2.5 + 4.0 * r);
    
    vec3 obsidian = vec3(0.05, 0.02, 0.08);
    vec3 deepRed = vec3(0.7, 0.02, 0.0);
    vec3 orange = vec3(0.95, 0.35, 0.02);
    vec3 gold = vec3(1.0, 0.75, 0.1);
    
    vec3 col = mix(obsidian, deepRed, f);
    col = mix(col, orange, clamp(length(q), 0.0, 1.0) * 0.7);
    col = mix(col, gold, pow(f, 3.0) * 1.2);
    
    float edge = smoothstep(0.4, 0.55, f);
    col += edge * orange * 0.3;
    
    vec2 center = vec2(0.5 * aspect, 0.5);
    float d = length(uv - center);
    col *= (1.0 - d * 0.4);
    
    gl_FragColor = vec4(col, 1.0);
  }
`;

const PRISM_SHADER = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  varying vec2 v_uv;
  uniform float u_time;
  uniform vec2 u_resolution;

  #define PI 3.14159265359

  vec3 hsl2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
  }

  void main() {
    vec2 uv = v_uv;
    float aspect = u_resolution.x / u_resolution.y;
    uv.x *= aspect;
    
    float t = u_time * 0.08;
    
    vec2 p = uv - vec2(0.5 * aspect, 0.5);
    float r = length(p);
    float theta = atan(p.y, p.x);
    
    float wave1 = sin(uv.x * 3.0 + t) * 0.5 + 0.5;
    float wave2 = sin(uv.y * 3.0 - t * 1.5) * 0.5 + 0.5;
    float wave3 = sin(theta * 3.0 + t * 2.0) * 0.5 + 0.5;
    
    float hue = fract(t + r * 0.25 + wave1 * 0.15 + wave2 * 0.1 + wave3 * 0.05);
    
    float sat = 0.85 + 0.15 * sin(t * 3.0 + r * PI);
    float light = 0.45 + 0.15 * sin(theta - t + r * 4.0);
    
    vec3 rgb = hsl2rgb(vec3(hue, sat, light));
    
    float spec = pow(max(0.0, sin(uv.x * 10.0 + uv.y * 10.0 + t * 5.0)), 12.0) * 0.25;
    rgb += vec3(spec);
    
    rgb *= (1.0 - r * 0.35);
    
    gl_FragColor = vec4(rgb, 1.0);
  }
`;

const PLASMA_SHADER = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  varying vec2 v_uv;
  uniform float u_time;
  uniform vec2 u_resolution;

  void main() {
    vec2 uv = v_uv;
    float aspect = u_resolution.x / u_resolution.y;
    uv.x *= aspect;
    
    float t = u_time * 0.4;
    
    float x1 = uv.x * 2.0;
    float y1 = uv.y * 2.0;
    
    float v1 = sin(x1 + t);
    float v2 = sin(y1 + t * 0.5);
    float v3 = sin(x1 + y1 + t);
    
    vec2 temp = uv - 0.5 * vec2(aspect, 1.0);
    float v4 = sin(length(temp) * 8.0 - t);
    
    float plasma = (v1 + v2 + v3 + v4) / 4.0;
    
    vec3 electricBlue = vec3(0.0, 0.3, 1.0);
    vec3 neonPurple = vec3(0.5, 0.0, 1.0);
    vec3 cyan = vec3(0.0, 0.95, 1.0);
    vec3 magenta = vec3(1.0, 0.0, 0.6);
    
    vec3 col = mix(electricBlue, neonPurple, sin(plasma * 3.1415) * 0.5 + 0.5);
    col = mix(col, cyan, cos(plasma * 5.0) * 0.3 + 0.3);
    col = mix(col, magenta, smoothstep(0.2, 0.7, sin(plasma * 8.0 + t)) * 0.25);
    
    float glow = pow(1.0 - abs(plasma), 8.0) * 0.4;
    col += cyan * glow;
    
    col = col * col * 1.5;
    
    gl_FragColor = vec4(col, 1.0);
  }
`;

const PULSE_SHADER = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  varying vec2 v_uv;
  uniform float u_time;
  uniform vec2 u_resolution;

  #define PI 3.14159265359

  void main() {
    vec2 uv = v_uv;
    float aspect = u_resolution.x / u_resolution.y;
    uv.x *= aspect;
    
    vec2 center = vec2(0.5 * aspect, 0.5);
    vec2 d = uv - center;
    float dist = length(d);
    
    float t = u_time * 0.5;
    
    float pulse = sin(t * 1.5) * 0.5 + 0.5;
    
    float angle = atan(d.y, d.x);
    float deform = sin(angle * 5.0 + t) * 0.15 * (1.0 - smoothstep(0.4, 0.8, dist));
    float distDeformed = dist + deform;
    
    float ringIntensity = pow(sin(distDeformed * 15.0 - t * 2.5) * 0.5 + 0.5, 4.0);
    
    vec3 deepRed = vec3(0.4, 0.02, 0.0);
    vec3 amber = vec3(0.95, 0.4, 0.05);
    vec3 gold = vec3(1.0, 0.8, 0.2);
    vec3 softBg = vec3(0.08, 0.02, 0.04);
    
    vec3 col = mix(softBg, deepRed, 1.0 - smoothstep(0.1, 0.7, dist));
    col = mix(col, amber, ringIntensity * (0.8 - dist * 0.5));
    col = mix(col, gold, pow(ringIntensity, 2.0) * 0.4 * (1.0 - dist));
    
    float core = 1.0 - smoothstep(0.0, 0.15 + 0.05 * pulse, dist);
    col += gold * core * 0.9;
    
    col *= (1.0 - dist * 0.5);
    
    gl_FragColor = vec4(col, 1.0);
  }
`;

const VORTEX_SHADER = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  varying vec2 v_uv;
  uniform float u_time;
  uniform vec2 u_resolution;

  #define PI 3.14159265359

  float noise(in vec2 p) {
    return sin(p.x * 2.0) * sin(p.y * 2.0);
  }

  void main() {
    vec2 uv = v_uv;
    float aspect = u_resolution.x / u_resolution.y;
    uv.x *= aspect;
    
    vec2 center = vec2(0.5 * aspect, 0.5);
    vec2 d = uv - center;
    float r = length(d);
    float theta = atan(d.y, d.x);
    
    float t = u_time * 0.35;
    
    float spiral = theta + 4.5 / (r + 0.08) - t * 2.0;
    
    float w1 = sin(spiral * 2.0) * 0.5 + 0.5;
    float w2 = sin(spiral * 4.0 + PI * 0.5) * 0.5 + 0.5;
    
    float rNoise = noise(vec2(r * 4.0 - t, theta * 2.0)) * 0.12;
    float wCombined = mix(w1, w2, 0.4) + rNoise;
    
    float intensity = pow(wCombined, 3.0) * (1.0 - smoothstep(0.0, 0.9, r));
    
    vec3 spaceBlack = vec3(0.01, 0.02, 0.06);
    vec3 royalBlue = vec3(0.05, 0.15, 0.7);
    vec3 intenseCyan = vec3(0.0, 0.85, 0.95);
    vec3 emerald = vec3(0.05, 0.9, 0.6);
    
    vec3 col = mix(spaceBlack, royalBlue, intensity * 0.8 + r * 0.2);
    col = mix(col, intenseCyan, pow(intensity, 2.0) * 0.9);
    col = mix(col, emerald, pow(intensity, 4.0) * 0.5);
    
    float centerGlow = 1.0 - smoothstep(0.0, 0.05, r);
    col += intenseCyan * centerGlow * 1.2;
    
    col += emerald * pow(intensity, 5.0) * 0.3;
    
    gl_FragColor = vec4(col, 1.0);
  }
`;

const FRAGMENT_SHADERS = {
  mist: MIST_SHADER,
  lava: LAVA_SHADER,
  prism: PRISM_SHADER,
  plasma: PLASMA_SHADER,
  pulse: PULSE_SHADER,
  vortex: VORTEX_SHADER,
} as const;

export function AnimatedGradient({
  className,
  variant = "mist",
  speed = 1,
  opacity = 1,
}: AnimatedGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShaderSource = FRAGMENT_SHADERS[variant] || FRAGMENT_SHADERS.mist;
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
      if (vertexShader) gl.deleteShader(vertexShader);
      if (fragmentShader) gl.deleteShader(fragmentShader);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteProgram(program);
      return;
    }

    gl.useProgram(program);

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, "u_time");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

    const startTime = Date.now();

    const render = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      gl.uniform1f(timeLocation, elapsed * speed);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  }, [variant, speed]);

  return (
    <div className={cn("relative overflow-hidden bg-black", className)}>
      <canvas ref={canvasRef} className="h-full w-full" style={{ opacity }} />
    </div>
  );
}