import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      // Default is 1MB; model images can be up to 5MB plus the other form fields
      bodySizeLimit: '100mb',
    },
  },
};

export default nextConfig;
