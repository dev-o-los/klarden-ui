import dynamic from "next/dynamic";
import React from "react";

export const registry: Record<
  string,
  React.ComponentType<Record<string, unknown>>
> = {
  "rich-button": dynamic(() => import("@/registry/demos/rich-button-demo")),
  "command-orbit": dynamic(() => import("@/registry/demos/command-orbit-demo")),
  "orbit-context-menu": dynamic(
    () => import("@/registry/demos/orbit-context-menu-demo"),
  ),
  accordion: dynamic(() => import("@/registry/demos/accordion-demo")),
  "magnetic-dock": dynamic(() => import("@/registry/demos/magnetic-dock-demo")),
  "portal-uploader": dynamic(
    () => import("@/registry/demos/portal-uploader-demo"),
  ),
  "tactile-highlight": dynamic(
    () => import("@/registry/demos/tactile-highlight-demo"),
  ),
  "spotify-card": dynamic(() => import("@/registry/demos/spotify-card-demo")),
  "blur-reveal": dynamic(() => import("@/registry/demos/blur-reveal-demo")),
  "shimmer-text": dynamic(() => import("@/registry/demos/shimmer-text-demo")),
  "shimmer-text-variants": dynamic(
    () => import("@/registry/demos/shimmer-text-variants-demo"),
  ),
  "basic-number-ticker": dynamic(() => import("@/registry/demos/basic-number-ticker-demo")),
  "basic-number-ticker-variants": dynamic(
    () => import("@/registry/demos/basic-number-ticker-variants-demo"),
  ),
  "label-input": dynamic(() => import("@/registry/demos/label-input-demo")),
  "label-input-colors": dynamic(
    () => import("@/registry/demos/label-input-colors-demo"),
  ),
  "label-input-forms": dynamic(
    () => import("@/registry/demos/label-input-forms-demo"),
  ),
  "qr-code": dynamic(() => import("@/registry/demos/qr-code-demo")),
  "qr-code-variants": dynamic(
    () => import("@/registry/demos/qr-code-variants-demo"),
  ),

  pagination: dynamic(() => import("@/registry/demos/pagination-demo")),
  "pagination-variants": dynamic(
    () => import("@/registry/demos/pagination-variants-demo"),
  ),
  slider: dynamic(() => import("@/registry/demos/slider-demo")),
  "animated-gradient": dynamic(
    () => import("@/registry/demos/animated-gradient-demo"),
  ),
  "animated-gradient-presets": dynamic(
    () => import("@/registry/demos/animated-gradient-presets-demo"),
  ),
  "rna-lines": dynamic(() => import("@/registry/demos/rna-lines-demo")),
  "plasma-wave": dynamic(() => import("@/registry/demos/plasma-wave-demo")),
  "ghost-ether": dynamic(() => import("@/registry/demos/ghost-ether-demo")),
  "starry-sky": dynamic(() => import("@/registry/demos/starry-sky-demo")),
  signature: dynamic(() => import("@/registry/demos/signature-demo")),
  "logo-carousel": dynamic(() => import("@/registry/demos/logo-carousel-demo")),
  "logo-carousel-right": dynamic(() => import("@/registry/demos/logo-carousel-demo-right")),
  "image-trail": dynamic(() => import("@/registry/demos/image-trail-demo")),
  "box-carousel": dynamic(() => import("@/registry/demos/box-carousel-demo")),
  "box-carousel-variants": dynamic(() => import("@/registry/demos/box-carousel-variants-demo")),
  "page-not-found": dynamic(() => import("@/registry/demos/page-not-found-demo")),
};
