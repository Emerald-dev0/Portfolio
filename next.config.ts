import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * Dev only. The sandbox preview serves this app from a proxied host, so
   * Next needs to be told that origin is legitimate before it will serve
   * /_next/* assets and the Spotify proxy to it.
   */
  allowedDevOrigins: ["*.e2b.app", "localhost:3001"],
  images: {
    // Spotify album art comes from goose-owned CDNs.
    remotePatterns: [{ protocol: "https", hostname: "i.scdn.co" }],
  },
};

export default nextConfig;
