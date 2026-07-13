"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getCategoryMeta } from "@/lib/categories";
import { DocMetadata } from "@/lib/docs";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

interface SearchDialogProps {
  items: DocMetadata[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ items, open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const runCommand = useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange],
  );

  const categories = items.reduce(
    (acc, item) => {
      const category = item.category || "General";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, DocMetadata[]>,
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search documentation..." />
      <CommandList className="max-h-80 p-2">
        <CommandEmpty className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
              <Search size={18} />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">No results found</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">We couldn't find any docs matching your search.</p>
            </div>
          </div>
        </CommandEmpty>

        {Object.entries(categories)
          .sort(
            (a, b) =>
              getCategoryMeta(a[0]).order - getCategoryMeta(b[0]).order,
          )
          .map(([category, docs]) => {
            const { icon: Icon, title } = getCategoryMeta(category);
            return (
              <CommandGroup
                key={category}
                heading={
                  <div className="flex items-center gap-2 px-1 py-1 text-zinc-400 dark:text-zinc-500">
                    <Icon size={12} className="shrink-0" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                      {title}
                    </span>
                  </div>
                }
              >
                {docs.map((doc) => (
                  <CommandItem
                    key={doc.slug}
                    value={`${doc.title} ${doc.description || ""}`}
                    onSelect={() =>
                      runCommand(() => router.push(`/docs/${doc.slug}`))
                    }
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-150 data-[selected='true']:bg-zinc-100 dark:data-[selected='true']:bg-zinc-900/50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/40 text-zinc-500 dark:text-zinc-400 shrink-0">
                      <Icon size={13} />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {doc.title}
                      </span>
                      {doc.description && (
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {doc.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
      </CommandList>
    </CommandDialog>
  );
}
