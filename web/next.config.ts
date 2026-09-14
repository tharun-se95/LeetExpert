import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mermaid is client-only; keep it out of the RSC graph.
  serverExternalPackages: ["mermaid"],
  // The lessons drawer's opener floats at the bottom-left, where Next's dev
  // badge sits by default; the badge is dev-only, so it moves out of the way.
  devIndicators: { position: "bottom-right" },
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
