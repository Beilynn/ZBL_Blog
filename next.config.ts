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

  // 精简 Netlify 服务端函数包：构建期依赖、静态资源与仓库元数据不进运行时压缩包。
  // 键为路由 glob（'/*' 覆盖所有产生 server trace 的路由），值相对项目根。
  outputFileTracingExcludes: {
    '/*': [
      './.git/**/*',
      './public/**/*',
      './.netlify/**/*',
      'node_modules/typescript/**/*',
      'node_modules/sharp/**/*',
      'node_modules/@img/**/*',
      'node_modules/caniuse-lite/**/*',
    ],
  },
};

export default nextConfig;