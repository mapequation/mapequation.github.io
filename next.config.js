/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  outputFileTracingRoot: __dirname,
  trailingSlash: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "mapequation.org" }],
    unoptimized: true,
  },
};

module.exports = nextConfig;
