import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mermaid is client-only; keep it out of the RSC graph.
  serverExternalPackages: ["mermaid"],
  async redirects() {
    return [
      {
        source: "/course",
        destination: "/courses/dsa",
        permanent: true,
      },
      {
        source: "/course/:path*",
        destination: "/courses/dsa/:path*",
        permanent: true,
      },
      {
        source: "/problems",
        destination: "/courses/dsa/problems",
        permanent: true,
      },
      {
        source: "/problems/:path*",
        destination: "/courses/dsa/problems/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
