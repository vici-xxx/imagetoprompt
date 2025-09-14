// @ts-check
import "./src/env.mjs";
import "@saasfly/auth/env.mjs";

import { withNextDevtools } from "@next-devtools/core/plugin";
// import "@saasfly/api/env"
import withMDX from "@next/mdx";

!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: [
    "@saasfly/api",
    "@saasfly/auth",
    "@saasfly/db",
    "@saasfly/common",
    "@saasfly/ui",
    "@saasfly/stripe",
  ],
  pageExtensions: ["ts", "tsx", "mdx"],
  experimental: {
    mdxRs: true,
    missingSuspenseWithCSRBailout: false,
  },
  images: {
    domains: ["images.unsplash.com", "avatars.githubusercontent.com", "www.twillot.com", "cdnv2.ruguoapp.com", "www.setupyourpay.com"],
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: "standalone",
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  swcMinify: false,
  compiler: {
    removeConsole: false,
  },
  distDir: ".next",
  // 完全禁用静态生成
  generateStaticParams: false,
  // 强制所有页面为动态渲染
  experimental: {
    ...config.experimental,
    missingSuspenseWithCSRBailout: false,
  },
};

export default withNextDevtools(withMDX()(config));
