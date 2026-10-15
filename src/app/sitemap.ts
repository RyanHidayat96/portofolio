import type { MetadataRoute } from "next";
import { getAbsoluteUrl } from "@/config/site";
import { getStaticWorkspacePaths, workspaceEntryPath } from "@/features/workspace/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-11");
  const staticPaths = [
    "/",
    ...new Set([workspaceEntryPath, ...getStaticWorkspacePaths()]).values()
  ];

  return staticPaths.map((path) => ({
    url: getAbsoluteUrl(path),
    lastModified,
    changeFrequency: "monthly",
    priority:
      path === "/"
        ? 1
        : path === workspaceEntryPath
          ? 0.8
          : path.startsWith("/projects")
            ? 0.8
            : 0.7
  }));
}
