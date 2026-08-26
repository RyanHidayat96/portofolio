import { NextResponse, type NextRequest } from "next/server";
import { getStaticWorkspacePaths } from "@/features/workspace/routing";

const workspacePaths = new Set(getStaticWorkspacePaths());
const generatedAssetPaths = new Set([
  "/apple-icon",
  "/icon",
  "/manifest.webmanifest",
  "/opengraph-image",
  "/robots.txt",
  "/sitemap.xml",
  "/twitter-image"
]);
const publicFilePattern = /\.[a-z0-9]+$/i;

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (isKnownPath(pathname)) {
    return NextResponse.next();
  }

  const notFoundUrl = request.nextUrl.clone();
  notFoundUrl.pathname = "/_not-found";
  notFoundUrl.search = "";

  return NextResponse.rewrite(notFoundUrl, { status: 404 });
}

function isKnownPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname === "/api" ||
    pathname === "/" ||
    workspacePaths.has(pathname) ||
    generatedAssetPaths.has(pathname) ||
    publicFilePattern.test(pathname)
  );
}

export const config = {
  matcher: "/:path*"
};
