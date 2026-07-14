"use client";

import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface SearchButtonProps {
  className?: string;
  onOpen?: () => void;
}

export function SearchButton({ className, onOpen }: SearchButtonProps) {
  return (
    <button
      onClick={() => onOpen?.()}
      className={cn(
        "items-center gap-2 h-9 pl-3.5 pr-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 text-xs text-muted-foreground/80 hover:text-foreground hover:bg-zinc-100/50 dark:hover:bg-zinc-950/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 cursor-pointer justify-between shadow-xs",
        className ? className : "hidden sm:inline-flex w-64",
      )}
    >
      <Search size={13} className="text-muted-foreground shrink-0" />
      <span className="flex-1 text-left font-medium">Search docs...</span>
      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-1.5 font-mono text-[9px] font-medium text-muted-foreground/80">
        <span className="text-[10px] font-sans">⌘</span>K
      </kbd>
    </button>
  );
}
