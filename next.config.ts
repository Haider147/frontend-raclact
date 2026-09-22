import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Los placeholders de producto (bloques de color, sin fotos reales) son SVG locales.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
