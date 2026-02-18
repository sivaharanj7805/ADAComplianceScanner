import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a minimal standalone build (ideal for Vercel / Docker)
  output: "standalone",

  // Remote image domains – allow Supabase Storage for agency logos
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // Security: don't advertise the framework
  poweredByHeader: false,
};

export default nextConfig;
