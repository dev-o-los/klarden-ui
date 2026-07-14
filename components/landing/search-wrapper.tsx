"use client";

import { SearchDialog } from "@/components/docs/search-dialog";
import { SearchButton } from "@/components/landing/search-button";
import { DocMetadata } from "@/lib/docs";
import { useEffect, useState } from "react";

interface SearchWrapperProps {
  items: DocMetadata[];
  className?: string;
  onTrigger?: () => void;
}

export function SearchWrapper({ items, className, onTrigger }: SearchWrapperProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    const handleOpenSearch = () => {
      setOpen(true);
    };

    document.addEventListener("keydown", down);
    document.addEventListener("open-search", handleOpenSearch);

    return () => {
      document.removeEventListener("keydown", down);
      document.removeEventListener("open-search", handleOpenSearch);
    };
  }, []);

  return (
    <>
      <SearchButton
        onOpen={() => {
          setOpen(true);
          onTrigger?.();
        }}
        className={className}
      />
      <SearchDialog items={items} open={open} onOpenChange={setOpen} />
    </>
  );
}
