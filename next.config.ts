import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
};

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: false,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: ({ request }) => request.mode === "navigate",
        handler: "NetworkFirst",
        options: {
          cacheName: "pages",
          expiration: {
            maxEntries: 32,
          },
        },
      },
      {
        urlPattern: ({ request }) =>
          request.destination === "style" ||
          request.destination === "script" ||
          request.destination === "worker" ||
          request.destination === "image" ||
          request.destination === "font",
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets",
          expiration: {
            maxEntries: 128,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          },
        },
      },
    ],
  },
});

export default withPWA(nextConfig);
