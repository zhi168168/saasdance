const createNextIntlPlugin = require("next-intl/plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/__clerk/:path*",
          destination: "/api/__clerk/:path*",
        },
      ],
    };
  },
  async redirects() {
    return [];
  },
  sassOptions: {
    // includePaths: [path.join(__dirname, 'styles')],
  },
  images: {
    remotePatterns: [],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

const withNextIntl = createNextIntlPlugin();

module.exports = withNextIntl(nextConfig);
