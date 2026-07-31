"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AnimatedIconHandle } from "@/components/ui/types";
import BrandOpenaiIcon from "@/components/ui/brand-openai-icon";
import BrandAnthropicIcon from "@/components/ui/brand-anthropic-icon";
import BrandGeminiIcon from "@/components/ui/brand-gemini-icon";
import BrandPerplexityIcon from "@/components/ui/brand-perplexity-icon";
import BrandGrokIcon from "@/components/ui/brand-grok-icon";

interface OpenInChatGPTButtonProps {
  title: string;
  description?: string;
  url: string;
}

interface AIProvider {
  id: string;
  name: string;
  icon: any;
  getUrl: (prompt: string) => string;
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    icon: BrandOpenaiIcon,
    getUrl: (prompt) => `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`,
  },
  {
    id: "claude",
    name: "Claude",
    icon: BrandAnthropicIcon,
    getUrl: (prompt) => `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
  },
  {
    id: "gemini",
    name: "Gemini",
    icon: BrandGeminiIcon,
    getUrl: (prompt) => `https://gemini.google.com/app?prompt=${encodeURIComponent(prompt)}`,
  },
  {
    id: "perplexity",
    name: "Perplexity",
    icon: BrandPerplexityIcon,
    getUrl: (prompt) => `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`,
  },
  {
    id: "grok",
    name: "Grok",
    icon: BrandGrokIcon,
    getUrl: (prompt) => `https://grok.com/?q=${encodeURIComponent(prompt)}`,
  },
];

function DropdownProviderItem({
  provider,
  isSelected,
  onSelect,
}: {
  provider: AIProvider;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const iconRef = useRef<AnimatedIconHandle>(null);
  const ProviderIcon = provider.icon;

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
      className={`group/item w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 cursor-pointer ${isSelected
          ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 font-semibold"
          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/80 hover:text-zinc-900 dark:hover:text-zinc-100"
        }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <ProviderIcon
          ref={iconRef}
          size={14}
          color="currentColor"
          className={`h-3.5 w-3.5 shrink-0 ${isSelected
              ? "text-zinc-900 dark:text-zinc-100"
              : "text-zinc-400 dark:text-zinc-500 group-hover/item:text-zinc-900 dark:group-hover/item:text-zinc-100"
            }`}
        />
        <span className="truncate">{provider.name}</span>
      </div>
      {isSelected && (
        <Check
          size={12}
          className="text-zinc-900 dark:text-zinc-100 shrink-0 ml-2"
        />
      )}
    </button>
  );
}

export function OpenInChatGPTButton({ title, description, url }: OpenInChatGPTButtonProps) {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(AI_PROVIDERS[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mainIconRef = useRef<AnimatedIconHandle>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = (provider: AIProvider = selectedProvider) => {
    const prompt = `I am reading the documentation for the component "${title}" on ${url}.

${description ? `Description: ${description}` : ""}

Could you please explain this component in detail, what it is all about, and provide a comprehensive guide on how to integrate and use it in my Next.js React project? Please include styling tips, prop usage examples, and best practices.`;

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(prompt).catch(() => {});
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    }

    const aiUrl = provider.getUrl(prompt);
    window.open(aiUrl, "_blank");
  };

  const handleSelectProvider = (provider: AIProvider) => {
    setSelectedProvider(provider);
    setIsOpen(false);
    handleOpen(provider);
  };

  const MainIconComponent = selectedProvider.icon;

  return (
    <div ref={containerRef} className={`relative inline-flex items-center ${isOpen || copiedToast ? "z-50" : "z-20"}`}>
      <div className="inline-flex items-stretch h-9 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 shadow-xs overflow-hidden select-none">
        {/* Main Action Button */}
        <button
          onClick={() => handleOpen(selectedProvider)}
          onMouseEnter={() => mainIconRef.current?.startAnimation()}
          onMouseLeave={() => mainIconRef.current?.stopAnimation()}
          className="inline-flex items-center gap-2 h-full px-3.5 text-xs font-medium text-muted-foreground/80 hover:text-foreground hover:bg-zinc-100/80 dark:hover:bg-zinc-900/60 transition-all duration-200 active:scale-95 cursor-pointer group"
          title={`Open component in ${selectedProvider.name}`}
        >
          <MainIconComponent
            ref={mainIconRef}
            size={14}
            color="currentColor"
            className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80 group-hover:text-foreground transition-colors"
          />
          <span>Open in {selectedProvider.name}</span>
        </button>

        {/* Extended Full-Height Vertical Divider */}
        <div className="w-px h-full bg-zinc-200/80 dark:bg-zinc-800/80 shrink-0" />

        {/* Dropdown Toggle Chevron */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center justify-center h-full px-2.5 text-muted-foreground/80 hover:text-foreground hover:bg-zinc-100/80 dark:hover:bg-zinc-900/60 transition-all duration-200 active:scale-95 cursor-pointer"
          aria-label="Select AI provider"
          aria-expanded={isOpen}
        >
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-foreground" : ""}`}
          />
        </button>
      </div>

      {/* Copied Toast Banner */}
      <AnimatePresence>
        {copiedToast && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 z-[999] mt-1 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 text-[11px] font-medium shadow-xl flex items-center gap-2 whitespace-nowrap pointer-events-none"
          >
            <Check size={13} className="text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>Prompt copied to clipboard! Paste (Ctrl+V) in {selectedProvider.name}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 4 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full right-0 z-[999] min-w-[170px] mt-1 p-1 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl shadow-xl shadow-zinc-950/10 dark:shadow-zinc-950/60 overflow-hidden space-y-0.5"
          >
            {AI_PROVIDERS.map((provider) => (
              <DropdownProviderItem
                key={provider.id}
                provider={provider}
                isSelected={provider.id === selectedProvider.id}
                onSelect={() => handleSelectProvider(provider)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { OpenInChatGPTButton as OpenInAIButton };
