import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure strict linting and type checking are enabled for production builds.
  // These are typically true by default, but explicitly setting them ensures
  // they are not accidentally disabled.
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  /* config options here */
};

export default nextConfig;
