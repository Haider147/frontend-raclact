import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera .next/standalone con un server.js mínimo para la imagen Docker.
  output: "standalone",
  images: {
    // Los placeholders de producto (bloques de color, sin fotos reales) son SVG locales.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
