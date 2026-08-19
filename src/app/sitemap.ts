import type { MetadataRoute } from "next";
import { getAbsoluteUrl } from "@/config/site";
import { getStaticWorkspacePaths } from "@/features/workspace/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-11");

  return getStaticWorkspacePaths().map((path) => ({
    url: getAbsoluteUrl(path),
    lastModified,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : path.startsWith("/projects") ? 0.8 : 0.7
  }));
}
