// @ts-check
import { withNextDevtools } from "@next-devtools/core/plugin";
// import "@saasfly/api/env"
import withMDX from "@next/mdx";

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
};

const withMdx = withMDX();
const wrappedConfig = withNextDevtools(withMdx(config));

export default wrappedConfig;
