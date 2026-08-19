import {
  createRouteForSection,
  getStaticWorkspacePaths,
  getWorkspacePath,
  resolveWorkspaceRouteFromPathname
} from "@/features/workspace/routing";
import { describe, expect, it } from "vitest";

describe("workspace routing", () => {
  it("maps preferred shareable deep links to workspace state", () => {
    expect(resolveWorkspaceRouteFromPathname("/projects")).toMatchObject({
      section: "projects",
      mode: "recruiter",
      isDeepLink: true,
      isKnownRoute: true
    });
    expect(
      resolveWorkspaceRouteFromPathname("/projects/enterprise-web-automation-ecosystem")
    ).toMatchObject({
      section: "projects",
      mode: "recruiter",
      projectSlug: "enterprise-web-automation-ecosystem"
    });
    expect(resolveWorkspaceRouteFromPathname("/labs/automation")).toMatchObject({
      section: "automation",
      mode: "engineer"
    });
    expect(resolveWorkspaceRouteFromPathname("/labs/pipeline")).toMatchObject({
      section: "pipeline",
      mode: "engineer"
    });
    expect(resolveWorkspaceRouteFromPathname("/labs/performance")).toMatchObject({
      section: "performance",
      mode: "engineer"
    });
  });

  it("serializes workspace state to clean paths", () => {
    expect(getWorkspacePath(createRouteForSection("projects"))).toBe("/projects");
    expect(
      getWorkspacePath(
        createRouteForSection("projects", {
          projectSlug: "cicd-quality-gates"
        })
      )
    ).toBe("/projects/cicd-quality-gates");
    expect(getWorkspacePath(createRouteForSection("api"))).toBe("/labs/api");
    expect(
      getWorkspacePath(
        createRouteForSection("overview", {
          mode: "engineer"
        })
      )
    ).toBe("/labs");
  });

  it("rejects unknown paths while keeping root as the landing route", () => {
    expect(resolveWorkspaceRouteFromPathname("/")).toMatchObject({
      section: "overview",
      mode: "recruiter",
      isDeepLink: false,
      isKnownRoute: true
    });
    expect(resolveWorkspaceRouteFromPathname("/projects/not-real")).toMatchObject({
      isKnownRoute: false
    });
    expect(resolveWorkspaceRouteFromPathname("/unknown")).toMatchObject({
      isKnownRoute: false
    });
  });

  it("includes SEO paths for labs and project slugs", () => {
    expect(getStaticWorkspacePaths()).toEqual(
      expect.arrayContaining([
        "/",
        "/projects",
        "/projects/cicd-quality-gates",
        "/labs/automation",
        "/labs/pipeline",
        "/labs/performance",
        "/labs/api",
        "/labs/architecture"
      ])
    );
  });
});
