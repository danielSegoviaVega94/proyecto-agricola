import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tierra",
    short_name: "Tierra",
    description: "Marketplace agricola mobile-first para comprar directo a productores locales.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fafaf7",
    theme_color: "#16803c",
    lang: "es-CL",
    categories: ["food", "shopping", "business"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
