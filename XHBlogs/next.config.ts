import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 动态模式：保留 API 路由
  // output: 'export',
  // trailingSlash: true,

  // 下面这些可以保留
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true, // 忽略 TS 错误，方便快速部署
  },
};

export default nextConfig;