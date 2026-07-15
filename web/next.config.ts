import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mermaid is client-only; keep it out of the RSC graph.
  serverExternalPackages: ["mermaid"],
};

export default nextConfig;
