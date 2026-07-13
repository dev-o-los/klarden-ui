import {
  Compass,
  MousePointerClick,
  Sliders,
  Route,
  LayoutGrid,
  Baseline,
  GalleryHorizontal,
  Sparkles,
  LucideIcon,
} from "lucide-react";

export interface CategoryMeta {
  title: string;
  icon: LucideIcon;
  order: number;
}

export const CATEGORIES: Record<string, CategoryMeta> = {
  "Getting Started": { title: "Getting Started", icon: Compass, order: 0 },
  Button: { title: "Buttons", icon: MousePointerClick, order: 1 },
  Form: { title: "Forms", icon: Sliders, order: 2 },
  Navigation: { title: "Navigation", icon: Route, order: 3 },
  Layout: { title: "Layouts", icon: LayoutGrid, order: 4 },
  Typography: { title: "Typography", icon: Baseline, order: 5 },
  Media: { title: "Media", icon: GalleryHorizontal, order: 6 },
  Backgrounds: { title: "Backgrounds", icon: Sparkles, order: 7 },
};

export const FALLBACK_CATEGORY: CategoryMeta = {
  title: "General",
  icon: Compass,
  order: 99,
};

export function getCategoryMeta(category?: string): CategoryMeta {
  if (!category) return FALLBACK_CATEGORY;
  return CATEGORIES[category] ?? FALLBACK_CATEGORY;
}
