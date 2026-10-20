import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      // Default is 1MB; model images can be up to 5MB plus the other form fields.
      // (On Vercel every request is capped at 4.5MB anyway, so .glb files go straight to Blob storage there.)
      bodySizeLimit: '100mb',
    },
  },
  images: {
    // Pictures uploaded on Vercel live in a public Vercel Blob store
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
  // The code reads and writes /public at run time (local uploads), so the build would copy the whole folder,
  // 500MB+ of .glb models, into every server function, far over Vercel's 250MB function limit.
  // Vercel serves /public itself, so the functions don't need it.
  outputFileTracingExcludes: {
    '/*': ['public/**/*'],
  },
};

export default nextConfig;
