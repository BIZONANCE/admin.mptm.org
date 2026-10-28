import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/registrations",
        destination: "/memberregistration",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

