"use client";

import { Github } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface GitHubStarButtonProps {
  size?: "sm" | "md";
  className?: string;
}

export function GitHubStarButton({
  size = "md",
  className = "",
}: GitHubStarButtonProps) {
  const [stars, setStars] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/repos/dev-o-los/klarden-ui"
        );
        if (response.ok) {
          const data = await response.json();
          setStars(data.stargazers_count);
        }
      } catch (error) {
        console.error("Failed to fetch GitHub stars:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStars();
  }, []);

  const formatStars = (count: number): string => {
    return count.toLocaleString();
  };

  if (loading || stars === null) {
    return (
      <Link
        href="https://github.com/dev-o-los/klarden-ui"
        target="_blank"
        className={`inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 text-xs text-muted-foreground/80 hover:text-foreground hover:bg-zinc-100/50 dark:hover:bg-zinc-950/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 cursor-pointer shadow-xs ${
          size === "sm" ? "h-8 px-3" : "h-9 px-3.5"
        } ${className}`}
      >
        <Github size={size === "sm" ? 13 : 15} />
        <span className="h-4 w-8 animate-pulse rounded bg-muted"></span>
      </Link>
    );
  }

  return (
    <Link
      href="https://github.com/dev-o-los/klarden-ui"
      target="_blank"
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 text-xs text-muted-foreground/80 hover:text-foreground hover:bg-zinc-100/50 dark:hover:bg-zinc-950/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 cursor-pointer shadow-xs ${
        size === "sm" ? "h-8 px-3" : "h-9 px-3.5"
      } ${className}`}
    >
      <Github size={size === "sm" ? 13 : 15} />
      <span className="font-medium">{formatStars(stars)}</span>
    </Link>
  );
}
