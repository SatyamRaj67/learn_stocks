import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
