"use client";

import React from "react";
import BrandOpenaiIcon from "@/components/ui/brand-openai-icon";

interface OpenInChatGPTButtonProps {
  title: string;
  description?: string;
  url: string;
}

export function OpenInChatGPTButton({ title, description, url }: OpenInChatGPTButtonProps) {
  const handleOpen = () => {
    const prompt = `I am reading the documentation for the component "${title}" on ${url}.

${description ? `Description: ${description}` : ""}

Could you please explain this component in detail, what it is all about, and provide a comprehensive guide on how to integrate and use it in my Next.js React project? Please include styling tips, prop usage examples, and best practices.`;

    const chatgptUrl = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
    window.open(chatgptUrl, "_blank");
  };

  return (
    <button
      onClick={handleOpen}
      className="inline-flex items-center gap-2 h-9 px-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 text-xs font-medium text-muted-foreground/80 hover:text-foreground hover:bg-zinc-100/50 dark:hover:bg-zinc-950/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 active:scale-95 shadow-xs cursor-pointer group"
    >
      <BrandOpenaiIcon size={13} color="currentColor" className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80 group-hover:text-foreground transition-colors" />
      <span>Open in ChatGPT</span>
    </button>
  );
}
