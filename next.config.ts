import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Shared hosting: use 1 CPU during build to avoid SIGABRT/SIGKILL (OOM)
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
};

export default nextConfig;
