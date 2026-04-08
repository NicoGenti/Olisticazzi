/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/Moonmood',
  assetPrefix: '/Moonmood/',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  experimental: {},
};

export default nextConfig;
