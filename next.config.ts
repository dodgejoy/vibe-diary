import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.rawg.io",
      },
      {
        protocol: "https",
        hostname: "*.rawg.io",
      },
      {
        protocol: "https",
        hostname: "rawg.io",
      },
      {
        protocol: "https",
        hostname: "preview.redd.it",
      },
      {
        protocol: "https",
        hostname: "i.redd.it",
      },
      {
        protocol: "https",
        hostname: "external-preview.redd.it",
      },
      {
        protocol: "https",
        hostname: "a.thumbs.redditmedia.com",
      },
      {
        protocol: "https",
        hostname: "b.thumbs.redditmedia.com",
      },
    ],
  },
};

export default nextConfig;
