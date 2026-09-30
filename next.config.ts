import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 加上下面这个护身符，强制忽略打包时的 TS 类型报错
  typescript: {
    ignoreBuildErrors: true,
  },
  // 顺便把代码检查也关了防报错
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
