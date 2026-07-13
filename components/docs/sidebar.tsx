"use client";

import { DocMetadata } from "@/lib/docs";
import { getCategoryMeta } from "@/lib/categories";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  items: DocMetadata[];
}

export function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname();
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const categories = items.reduce(
    (acc, item) => {
      const category = item.category || "General";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, DocMetadata[]>,
  );

  const sortedEntries = Object.entries(categories).sort((a, b) => {
    return getCategoryMeta(a[0]).order - getCategoryMeta(b[0]).order;
  });

  return (
    <aside className="sticky top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:block">
      <div 
        className="h-full overflow-y-auto py-6 pr-6 lg:py-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onMouseLeave={() => setHoveredSlug(null)}
      >
        {sortedEntries.map(([category, docs]) => {
          const { icon: Icon, title } = getCategoryMeta(category);
          const hasActiveChild = docs.some((doc) => pathname === `/docs/${doc.slug}`);

          return (
            <div key={category} className="pb-8">
              <div className="flex items-center gap-2 mb-3 px-2.5">
                <Icon
                  size={15}
                  className={cn(
                    "transition-colors duration-300",
                    hasActiveChild
                      ? "text-primary"
                      : "text-zinc-400 dark:text-zinc-500"
                  )}
                />
                <h4
                  className={cn(
                    "text-[10px] uppercase tracking-[0.2em] transition-colors duration-300",
                    hasActiveChild
                      ? "font-extrabold text-zinc-900 dark:text-zinc-100"
                      : "font-semibold text-zinc-400 dark:text-zinc-500"
                  )}
                >
                  {title}
                </h4>
              </div>
              <div className="grid grid-flow-row auto-rows-max text-sm gap-0.5 relative">
                {docs.map((doc) => {
                  const isActive = pathname === `/docs/${doc.slug}`;
                  return (
                    <Link
                      key={doc.slug}
                      href={`/docs/${doc.slug}`}
                      onMouseEnter={() => setHoveredSlug(doc.slug)}
                      className={cn(
                        "group relative flex w-full items-center rounded-lg px-3 py-1.5 transition-colors duration-200 text-sm outline-none",
                        isActive
                          ? "font-semibold text-primary"
                          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                      )}
                    >
                      {/* Hover background pill */}
                      <AnimatePresence>
                        {hoveredSlug === doc.slug && (
                          <motion.span
                            layoutId="sidebar-hover-pill"
                            className="absolute inset-0 bg-zinc-100/70 dark:bg-zinc-900/60 rounded-lg -z-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                      </AnimatePresence>

                      {/* Active link indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-pill"
                          className="absolute inset-0 bg-primary/10 dark:bg-primary/15 border border-primary/15 rounded-lg -z-10"
                          transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        />
                      )}

                      <span className="relative z-10">{doc.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
