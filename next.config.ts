import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/mstravel/wsl",
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/mstravel/wsl",
        permanent: false,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
