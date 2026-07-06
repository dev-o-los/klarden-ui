"use client";

import React from "react";

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
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-primary transition-all whitespace-nowrap active:scale-95 shadow-xs cursor-pointer"
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-3.5 w-3.5 shrink-0 text-[#19C37D]"
      >
        <path d="M21.5,10.7c-0.1-0.6-0.4-1.2-0.8-1.7c-0.5-0.6-1.1-1-1.8-1.2c0-0.1,0-0.2,0-0.3c0-1-0.4-2-1.1-2.7c-0.7-0.7-1.7-1.1-2.7-1.1c-0.6,0-1.2,0.1-1.7,0.4C12.8,3.6,12,3,11.1,2.8c-1-0.3-2.1-0.1-2.9,0.4c-0.7,0.5-1.2,1.2-1.5,2C6.1,5.2,5.5,5.4,5,5.8C4.1,6.5,3.6,7.5,3.6,8.6c0,0.3,0.1,0.6,0.2,0.9C3.1,10.1,2.6,10.9,2.5,11.9c-0.1,1,0.2,2,0.8,2.8c0.5,0.7,1.2,1.2,2,1.4c0,0.1,0,0.2,0,0.3c0,1,0.4,2,1.1,2.7c0.7,0.7,1.7,1.1,2.7,1.1c0.6,0,1.2-0.1,1.7-0.4c0.6,0.5,1.4,1.1,2.3,1.3c1,0.3,2.1,0.1,2.9-0.4c0.7-0.5,1.2-1.2,1.5-2c0.6-0.1,1.2-0.3,1.7-0.7c0.9-0.7,1.4-1.7,1.4-2.8c0-0.3-0.1-0.6-0.2-0.9c0.7-0.6,1.2-1.4,1.3-2.4C22.1,12.7,21.9,11.7,21.5,10.7z M12.8,20.4c-0.4,0-0.8-0.1-1.1-0.3c0.1-0.1,0.2-0.2,0.3-0.3l3.6-2.1c0.2-0.1,0.3-0.3,0.3-0.5v-5l2.1,1.2c0,0,0,0.1,0,0.1v4.2C18,19,15.7,20.4,12.8,20.4z M5.4,15.2c-0.2-0.3-0.3-0.7-0.3-1.1c0-0.4,0.1-0.8,0.3-1.1c0.1,0.1,0.2,0.2,0.3,0.3l3.6,2.1c0.2,0.1,0.4,0.1,0.6,0v5l-2.1-1.2c0,0,0-0.1,0-0.1v-4.2C7.8,16.2,6.4,15.2,5.4,15.2z M6.4,7.8C6.6,7.5,6.9,7.3,7.3,7.2v4.2c0,0.2,0.1,0.4,0.3,0.5l4.3,2.5l-2.1,1.2L6.2,13.5C5.3,12.3,5.4,10.1,6.4,7.8z M17.6,9v5l-4.3-2.5l2.1-1.2l3.6,2.1c0.9,1.2,0.8,3.4-0.2,5.7c-0.2,0.3-0.5,0.5-0.9,0.6v-4.2c0-0.2-0.1-0.4-0.3-0.5L13.7,11.2L17.6,9z M13,7.3c0-0.2-0.1-0.4-0.3-0.5L8.4,4.3l2.1-1.2l3.6,2.1c0.9,1.2,0.8,3.4-0.2,5.7c-0.2,0.3-0.5,0.5-0.9,0.6V7.3z M11,16.7l-3.6-2.1c-0.9-1.2-0.8-3.4,0.2-5.7c0.2-0.3,0.5-0.5,0.9-0.6v4.2c0,0.2,0.1,0.4,0.3,0.5l4.3,2.5L11,16.7z M12.8,13.4L9,11.2l3.8-2.2l3.8,2.2L12.8,13.4z" />
      </svg>
      <span>Open in ChatGPT</span>
    </button>
  );
}
