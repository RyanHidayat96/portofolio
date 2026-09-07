const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff"
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin"
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()"
  }
];

const apiCacheHeaders = [
  {
    key: "Cache-Control",
    value: "public, max-age=3600, stale-while-revalidate=86400"
  }
];

const immutableAssetHeaders = [
  {
    key: "Cache-Control",
    value: "public, max-age=31536000, immutable"
  }
];

const cvCacheHeaders = [
  {
    key: "Cache-Control",
    value: "public, max-age=3600, stale-while-revalidate=86400"
  }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1"],
  typedRoutes: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      },
      {
        source: "/api/:path*",
        headers: apiCacheHeaders
      },
      {
        source: "/cv.pdf",
        headers: cvCacheHeaders
      },
      {
        source: "/favicon.svg",
        headers: immutableAssetHeaders
      },
      {
        source: "/portfolio-mark.svg",
        headers: immutableAssetHeaders
      },
      {
        source: "/manifest.webmanifest",
        headers: immutableAssetHeaders
      },
      {
        source: "/icon",
        headers: immutableAssetHeaders
      },
      {
        source: "/apple-icon",
        headers: immutableAssetHeaders
      },
      {
        source: "/opengraph-image",
        headers: immutableAssetHeaders
      },
      {
        source: "/twitter-image",
        headers: immutableAssetHeaders
      }
    ];
  }
};

export default nextConfig;
