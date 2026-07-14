"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { List } from "lucide-react";

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    // Read headings from the DOM.
    const extractHeadings = () => {
      const elements = Array.from(document.querySelectorAll("article h2, article h3"));
      const items: HeadingItem[] = elements
        .map((el) => ({
          id: el.id,
          text: el.textContent || "",
          level: el.tagName === "H3" ? 3 : 2,
        }))
        .filter((item) => item.id);

      setHeadings(items);

      if (items.length > 0) {
        setActiveId(items[0].id);
      }
    };

    // Run immediately
    extractHeadings();

    // Also run on a short timeout to handle lazy loads/delayed rendering of components
    const timer = setTimeout(extractHeadings, 150);

    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const elements = Array.from(document.querySelectorAll("article h2, article h3"));
      const scrollPosition = window.scrollY + 140; // Offset for header navbar
      
      let currentActiveId = "";
      for (const el of elements) {
        if (el instanceof HTMLElement && el.id) {
          if (el.offsetTop <= scrollPosition) {
            currentActiveId = el.id;
          } else {
            break;
          }
        }
      }

      if (currentActiveId) {
        setActiveId(currentActiveId);
      } else if (elements[0]?.id) {
        setActiveId(elements[0].id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Call once initially

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [headings, pathname]);

  if (headings.length === 0) return null;

  return (
    <aside 
      className="hidden xl:block w-56 shrink-0 sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onMouseLeave={() => setHoveredId(null)}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 px-3">
          <List size={12} className="shrink-0" />
          <span>On This Page</span>
        </div>
        <ul className="space-y-0.5 text-xs relative">
          {headings.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li
                key={item.id}
                style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
                className="relative"
              >
                <a
                  href={`#${item.id}`}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(item.id);
                    if (el) {
                      const offset = 100; // offset for sticky nav
                      const bodyRect = document.body.getBoundingClientRect().top;
                      const elementRect = el.getBoundingClientRect().top;
                      const elementPosition = elementRect - bodyRect;
                      const offsetPosition = elementPosition - offset;

                      window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                      });
                      window.history.pushState(null, "", `#${item.id}`);
                    }
                  }}
                  className={cn(
                    "group relative isolate block py-1.5 px-3 rounded-lg transition-colors duration-200 outline-none",
                    isActive
                      ? "font-semibold text-primary"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                  )}
                >
                  {/* Hover background pill */}
                  <AnimatePresence>
                    {hoveredId === item.id && (
                      <motion.span
                        layoutId="toc-hover-pill"
                        className="absolute inset-0 bg-zinc-100/70 dark:bg-zinc-900/60 rounded-lg -z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Active background pill */}
                  {isActive && (
                    <motion.div
                      layoutId="toc-active-pill"
                      className="absolute inset-0 bg-primary/10 dark:bg-primary/15 border border-primary/15 rounded-lg -z-10"
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    />
                  )}

                  <span className="relative z-10">{item.text}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
