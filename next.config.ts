import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      // Default is 1MB; model images can be up to 5MB plus the other form fields
      bodySizeLimit: '6mb',
    },
  },
};

export default nextConfig;
