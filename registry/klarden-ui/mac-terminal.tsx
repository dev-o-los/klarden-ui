"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────── Types ─────────────────────────── */

interface TerminalLine {
  id: string;
  type: "command" | "output" | "input";
  content: string;
  /** Rich colored segments for output lines */
  segments?: { text: string; color?: string }[];
}

interface MacTerminalProps {
  /** Initial lines to pre-fill the terminal with */
  initialLines?: TerminalLine[];
  /** The hostname shown in the prompt (e.g. "user@hostname") */
  hostname?: string;
  /** The username shown in the prompt */
  username?: string;
  /** The shell indicator (e.g. "zsh", "bash") */
  shell?: string;
  /** Title bar text override */
  title?: string;
  /** Initial width of the terminal window */
  width?: number;
  /** Initial height of the terminal window */
  height?: number;
  /** Whether the terminal is draggable */
  draggable?: boolean;
  /** Whether to show the neofetch output on mount */
  showNeofetch?: boolean;
  /** Custom neofetch system info entries */
  neofetchInfo?: { label: string; value: string }[];
  /** Additional className for the outer wrapper */
  className?: string;
  /** Callback when close button is clicked */
  onClose?: () => void;
  /** Callback when minimize button is clicked */
  onMinimize?: () => void;
  /** Callback when maximize button is clicked */
  onMaximize?: () => void;
  /** Custom command handler — return string[] of output lines */
  onCommand?: (command: string) => string[] | undefined;
}

/* ─────────────── Apple Logo ASCII Art ─────────────── */

const APPLE_LOGO_LINES = [
  "                'c.          ",
  "             ,xNMM.          ",
  "           .OMMMMo           ",
  "           OMMM0,            ",
  "     .;loddo:' loolloddol;.  ",
  "   cKMMMMMMMMMMNWMMMMMMMMMM0:",
  " .KMMMMMMMMMMMMMMMMMMMMMMMWd.",
  " XMMMMMMMMMMMMMMMMMMMMMMMX.  ",
  ";MMMMMMMMMMMMMMMMMMMMMMMM:   ",
  ":MMMMMMMMMMMMMMMMMMMMMMMM:   ",
  ".MMMMMMMMMMMMMMMMMMMMMMMMX.  ",
  " kMMMMMMMMMMMMMMMMMMMMMMMMWd.",
  " .XMMMMMMMMMMMMMMMMMMMMMMMMk ",
  "  .XMMMMMMMMMMMMMMMMMMMMMMK. ",
  "    kMMMMMMMMMMMMMMMMMMMMd    ",
  "     ;KMMMMMMMWXXWMMMMMMMk.  ",
  "       .cooc,.    .,coo:.    ",
];

/* ─────────── Neofetch Info Builder ─────────── */

function buildNeofetchSegments(
  username: string,
  hostname: string,
  info: { label: string; value: string }[]
): { text: string; color?: string }[][] {
  const rows: { text: string; color?: string }[][] = [];

  // Title line: user@hostname
  rows.push([
    { text: `${username}`, color: "var(--term-green)" },
    { text: "@", color: "var(--term-text)" },
    { text: `${hostname}`, color: "var(--term-green)" },
  ]);

  // Separator
  rows.push([{ text: "-------------------", color: "var(--term-text)" }]);

  // Info rows
  for (const entry of info) {
    rows.push([
      { text: `${entry.label}`, color: "var(--term-yellow)" },
      { text: `: ${entry.value}`, color: "var(--term-text)" },
    ]);
  }

  // Color blocks
  rows.push([{ text: "" }]); // spacer
  rows.push([
    { text: "███", color: "#1a1a2e" },
    { text: "███", color: "#c0392b" },
    { text: "███", color: "#27ae60" },
    { text: "███", color: "#d4ac0d" },
    { text: "███", color: "#2980b9" },
    { text: "███", color: "#8e44ad" },
    { text: "███", color: "#16a085" },
    { text: "███", color: "#95a5a6" },
  ]);

  return rows;
}

/* ─────────────────── Default Info ─────────────────── */

const DEFAULT_NEOFETCH_INFO = [
  { label: "OS", value: "macOS 15.1 24B5046f arm64" },
  { label: "Host", value: "MacBookPro18,3" },
  { label: "Kernel", value: "24.1.0" },
  { label: "Uptime", value: "5 days, 5 hours, 33 mins" },
  { label: "Packages", value: "3 (port), 214 (brew)" },
  { label: "Shell", value: "zsh 5.9" },
  { label: "Resolution", value: "1512x982, 3440x1440" },
  { label: "DE", value: "Aqua" },
  { label: "WM", value: "Quartz Compositor" },
  { label: "WM Theme", value: "Blue (Light)" },
  { label: "Terminal", value: "Apple_Terminal" },
  { label: "Terminal Font", value: "SFMono-Regular" },
  { label: "CPU", value: "Apple M1 Pro" },
  { label: "GPU", value: "Apple M1 Pro" },
  { label: "Memory", value: "2938MiB / 16384MiB" },
];

/* ─────────── Built-in command responses ─────────── */

function getBuiltinResponse(cmd: string, username: string, hostname: string): string[] | null {
  const trimmed = cmd.trim().toLowerCase();

  if (trimmed === "clear") return [];
  if (trimmed === "whoami") return [username];
  if (trimmed === "hostname") return [hostname];
  if (trimmed === "pwd") return [`/Users/${username}`];
  if (trimmed === "date") return [new Date().toString()];
  if (trimmed === "uname" || trimmed === "uname -a")
    return [
      "Darwin " + hostname + " 24.1.0 Darwin Kernel Version 24.1.0 arm64",
    ];
  if (trimmed === "echo $shell" || trimmed === "echo $SHELL")
    return ["/bin/zsh"];
  if (trimmed === "ls")
    return ["Applications  Desktop  Documents  Downloads  Library  Music  Pictures  Public"];
  if (trimmed.startsWith("echo "))
    return [cmd.slice(5)];
  if (trimmed === "help")
    return [
      "Available commands: clear, whoami, hostname, pwd, date, uname, ls, echo, help, neofetch",
    ];

  return null;
}

/* ──────────────────────────────────────────────────────────── */
/*                   MacTerminal Component                     */
/* ──────────────────────────────────────────────────────────── */

export function MacTerminal({
  initialLines,
  hostname = "dev_",
  username = "utkarsh",
  shell = "zsh",
  title,
  width = 680,
  height = 420,
  draggable = true,
  showNeofetch = true,
  neofetchInfo = DEFAULT_NEOFETCH_INFO,
  className,
  onClose,
  onMinimize,
  onMaximize,
  onCommand,
}: MacTerminalProps) {
  const uid = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Drag state ── */
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  /* ── Terminal state ── */
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  /* ── Generate neofetch output ── */
  const generateNeofetchLines = useCallback((): TerminalLine[] => {
    const neofetchRows = buildNeofetchSegments(username, hostname, neofetchInfo);
    const outputLines: TerminalLine[] = [];

    // Command line
    outputLines.push({
      id: `${uid}-nf-cmd`,
      type: "command",
      content: "neofetch",
    });

    const maxRows = Math.max(APPLE_LOGO_LINES.length, neofetchRows.length);

    for (let i = 0; i < maxRows; i++) {
      const logoLine = APPLE_LOGO_LINES[i] ?? " ".repeat(28);
      const infoSegments = neofetchRows[i] ?? [];

      outputLines.push({
        id: `${uid}-nf-${i}`,
        type: "output",
        content: logoLine + "  " + infoSegments.map((s) => s.text).join(""),
        segments: [
          { text: logoLine, color: "var(--term-green)" },
          { text: "  " },
          ...infoSegments,
        ],
      });
    }

    return outputLines;
  }, [uid, username, hostname, neofetchInfo]);

  /* ── Initialize ── */
  useEffect(() => {
    if (initialLines) {
      setLines(initialLines);
    } else if (showNeofetch) {
      setLines(generateNeofetchLines());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Auto-scroll ── */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  /* ── Drag handlers ── */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!draggable) return;
      setIsDragging(true);
      setIsFocused(true);
      dragOffset.current = {
        x: e.clientX - pos.x,
        y: e.clientY - pos.y,
      };
    },
    [draggable, pos]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  /* ── Command execution ── */
  const executeCommand = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim();
      if (!trimmed) return;

      setCommandHistory((prev) => [...prev, trimmed]);
      setHistoryIndex(-1);

      // Handle clear
      if (trimmed.toLowerCase() === "clear") {
        setLines([]);
        return;
      }

      // Handle neofetch
      if (trimmed.toLowerCase() === "neofetch") {
        setLines((prev) => [...prev, ...generateNeofetchLines()]);
        return;
      }

      const commandLine: TerminalLine = {
        id: `${uid}-${Date.now()}-cmd`,
        type: "command",
        content: trimmed,
      };

      // Check custom handler first
      const customResult = onCommand?.(trimmed);
      if (customResult !== undefined) {
        const outputLines: TerminalLine[] = customResult.map((line, i) => ({
          id: `${uid}-${Date.now()}-out-${i}`,
          type: "output" as const,
          content: line,
        }));
        setLines((prev) => [...prev, commandLine, ...outputLines]);
        return;
      }

      // Check builtins
      const builtinResult = getBuiltinResponse(trimmed, username, hostname);
      if (builtinResult !== null) {
        const outputLines: TerminalLine[] = builtinResult.map((line, i) => ({
          id: `${uid}-${Date.now()}-out-${i}`,
          type: "output" as const,
          content: line,
        }));
        setLines((prev) => [...prev, commandLine, ...outputLines]);
        return;
      }

      // Unknown command
      const errorLine: TerminalLine = {
        id: `${uid}-${Date.now()}-err`,
        type: "output",
        content: `zsh: command not found: ${trimmed.split(" ")[0]}`,
        segments: [
          {
            text: `zsh: command not found: ${trimmed.split(" ")[0]}`,
            color: "var(--term-red)",
          },
        ],
      };
      setLines((prev) => [...prev, commandLine, errorLine]);
    },
    [uid, onCommand, username, hostname, generateNeofetchLines]
  );

  /* ── Key handling ── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        executeCommand(currentInput);
        setCurrentInput("");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (commandHistory.length > 0) {
          const newIndex =
            historyIndex === -1
              ? commandHistory.length - 1
              : Math.max(0, historyIndex - 1);
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex !== -1) {
          const newIndex = historyIndex + 1;
          if (newIndex >= commandHistory.length) {
            setHistoryIndex(-1);
            setCurrentInput("");
          } else {
            setHistoryIndex(newIndex);
            setCurrentInput(commandHistory[newIndex]);
          }
        }
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        setLines([]);
      }
    },
    [currentInput, executeCommand, commandHistory, historyIndex]
  );

  /* ── Focus input on click ── */
  const handleBodyClick = useCallback(() => {
    inputRef.current?.focus();
    setIsFocused(true);
  }, []);

  /* ── Traffic light buttons ── */
  const handleClose = useCallback(() => {
    setIsClosed(true);
    onClose?.();
  }, [onClose]);

  const handleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
    onMinimize?.();
  }, [onMinimize]);

  const handleMaximize = useCallback(() => {
    onMaximize?.();
  }, [onMaximize]);

  if (isClosed) return null;

  /* ── Determine titlebar text ── */
  const titleText =
    title ?? `${username} — -${shell} — 80x24`;

  /* ── Prompt string ── */
  const prompt = `${username}@${hostname.split(".")[0]} ~ % `;

  return (
    <>
      {/* ─── CSS Custom Properties ─── */}
      <style>{`
        .mac-terminal-${uid} {
          --term-bg: #ffffff;
          --term-text: #1a1a1a;
          --term-titlebar: #e8e6e3;
          --term-titlebar-text: #4d4d4d;
          --term-border: #c8c8c8;
          --term-prompt: #1a1a1a;
          --term-green: #2e7d32;
          --term-yellow: #bf8c00;
          --term-red: #c0392b;
          --term-cyan: #0277bd;
          --term-magenta: #8e24aa;
          --term-selection: rgba(59, 130, 246, 0.15);
          --term-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.2),
                         0 12px 28px -8px rgba(0, 0, 0, 0.15),
                         0 0 0 1px rgba(0, 0, 0, 0.06);
          --term-inner-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
          --term-titlebar-border: #d0cfcd;
          --btn-close: #ff5f57;
          --btn-close-hover: #ff3b30;
          --btn-min: #febc2e;
          --btn-min-hover: #ffb500;
          --btn-max: #28c840;
          --btn-max-hover: #00b920;
          --btn-border: rgba(0,0,0,0.12);
        }

        :is(.dark) .mac-terminal-${uid} {
          --term-bg: #0d0d0d;
          --term-text: #d4d4d4;
          --term-titlebar: #1a1a1b;
          --term-titlebar-text: #8a8a8a;
          --term-border: #2a2a2a;
          --term-prompt: #d4d4d4;
          --term-green: #4ec94e;
          --term-yellow: #e5c07b;
          --term-red: #e06c75;
          --term-cyan: #56b6c2;
          --term-magenta: #c678dd;
          --term-selection: rgba(81, 154, 255, 0.18);
          --term-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.7),
                         0 12px 28px -8px rgba(0, 0, 0, 0.5),
                         0 0 0 1px rgba(255, 255, 255, 0.04);
          --term-inner-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
          --term-titlebar-border: #222;
          --btn-close: #ff5f57;
          --btn-close-hover: #ff3b30;
          --btn-min: #febc2e;
          --btn-min-hover: #ffb500;
          --btn-max: #28c840;
          --btn-max-hover: #00b920;
          --btn-border: rgba(0,0,0,0.3);
        }

        .mac-terminal-${uid} ::selection {
          background: var(--term-selection);
        }
      `}</style>

      <div
        ref={containerRef}
        className={cn(
          `mac-terminal-${uid}`,
          "relative select-none",
          isDragging && "cursor-grabbing",
          className
        )}
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          width,
          zIndex: isFocused ? 50 : 40,
          transition: isDragging ? "none" : "box-shadow 0.2s ease",
        }}
        onMouseDown={() => setIsFocused(true)}
      >
        {/* ─── Window Chrome ─── */}
        <div
          style={{
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "var(--term-shadow)",
            border: "1px solid var(--term-border)",
          }}
        >
          {/* ─── Title Bar ─── */}
          <div
            onMouseDown={handleMouseDown}
            style={{
              background: "var(--term-titlebar)",
              borderBottom: "1px solid var(--term-titlebar-border)",
              boxShadow: "var(--term-inner-shadow)",
              cursor: draggable ? (isDragging ? "grabbing" : "grab") : "default",
              userSelect: "none",
            }}
            className="relative flex items-center px-3 py-[7px]"
          >
            {/* Traffic Lights */}
            <div className="flex items-center gap-[7px] z-10">
              <button
                onClick={handleClose}
                aria-label="Close"
                className="group/btn relative w-[13px] h-[13px] rounded-full flex items-center justify-center transition-colors"
                style={{
                  background: "var(--btn-close)",
                  boxShadow: `inset 0 0 0 0.5px var(--btn-border)`,
                }}
              >
                <svg
                  className="opacity-0 group-hover/btn:opacity-100 transition-opacity"
                  width="7"
                  height="7"
                  viewBox="0 0 7 7"
                  fill="none"
                >
                  <path
                    d="M1 1L6 6M6 1L1 6"
                    stroke="rgba(75,0,0,0.7)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <button
                onClick={handleMinimize}
                aria-label="Minimize"
                className="group/btn relative w-[13px] h-[13px] rounded-full flex items-center justify-center transition-colors"
                style={{
                  background: "var(--btn-min)",
                  boxShadow: `inset 0 0 0 0.5px var(--btn-border)`,
                }}
              >
                <svg
                  className="opacity-0 group-hover/btn:opacity-100 transition-opacity"
                  width="7"
                  height="2"
                  viewBox="0 0 7 2"
                  fill="none"
                >
                  <path
                    d="M1 1H6"
                    stroke="rgba(100,60,0,0.7)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <button
                onClick={handleMaximize}
                aria-label="Maximize"
                className="group/btn relative w-[13px] h-[13px] rounded-full flex items-center justify-center transition-colors"
                style={{
                  background: "var(--btn-max)",
                  boxShadow: `inset 0 0 0 0.5px var(--btn-border)`,
                }}
              >
                <svg
                  className="opacity-0 group-hover/btn:opacity-100 transition-opacity"
                  width="8"
                  height="8"
                  viewBox="0 0 8 8"
                  fill="none"
                >
                  <path
                    d="M1 4.5L3.5 7L7 1"
                    stroke="rgba(0,70,0,0.7)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Title */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                color: "var(--term-titlebar-text)",
                fontSize: 13,
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", system-ui, sans-serif',
                fontWeight: 400,
                letterSpacing: "-0.01em",
              }}
            >
              <span className="flex items-center gap-1.5">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  opacity={0.5}
                >
                  <path d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v9a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 12.5v-9zM3.5 3a.5.5 0 00-.5.5v9a.5.5 0 00.5.5h9a.5.5 0 00.5-.5v-9a.5.5 0 00-.5-.5h-9z" />
                  <path d="M4 5.5a.5.5 0 01.5-.5h7a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-7a.5.5 0 01-.5-.5v-1z" />
                </svg>
                {titleText}
              </span>
            </div>
          </div>

          {/* ─── Terminal Body ─── */}
          {!isMinimized && (
            <div
              ref={scrollRef}
              onClick={handleBodyClick}
              style={{
                background: "var(--term-bg)",
                color: "var(--term-text)",
                height,
                fontFamily:
                  '"SF Mono", "Menlo", "Monaco", "Cascadia Code", "Consolas", monospace',
                fontSize: 13,
                lineHeight: 1.5,
                overflowY: "auto",
                overflowX: "hidden",
                cursor: "text",
              }}
              className="p-3 select-text"
            >
              {/* ── Rendered Lines ── */}
              {lines.map((line) => (
                <div key={line.id} className="whitespace-pre-wrap break-all">
                  {line.type === "command" ? (
                    <span>
                      <span style={{ color: "var(--term-prompt)" }}>
                        {prompt}
                      </span>
                      <span>{line.content}</span>
                    </span>
                  ) : line.segments ? (
                    <span>
                      {line.segments.map((seg, i) => (
                        <span
                          key={i}
                          style={seg.color ? { color: seg.color } : undefined}
                        >
                          {seg.text}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span>{line.content}</span>
                  )}
                </div>
              ))}

              {/* ── Active Input Line ── */}
              <div className="flex items-center whitespace-pre">
                <span style={{ color: "var(--term-prompt)" }}>{prompt}</span>
                <div className="relative flex-1 min-w-0">
                  <input
                    ref={inputRef}
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    className="w-full bg-transparent border-none outline-none p-0 m-0"
                    style={{
                      color: "var(--term-text)",
                      fontFamily: "inherit",
                      fontSize: "inherit",
                      lineHeight: "inherit",
                      caretColor: "var(--term-text)",
                    }}
                    aria-label="Terminal input"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
