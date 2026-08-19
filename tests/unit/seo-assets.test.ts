import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { createPortfolioJsonLd, serializeJsonLd } from "@/config/structured-data";
import {
  getAbsoluteUrl,
  getWorkspaceRouteMetadata,
  resolveSiteUrl,
  siteConfig
} from "@/config/site";
import { profile } from "@/data/profile";
import { createRouteForSection } from "@/features/workspace/routing";
import { describe, expect, it } from "vitest";

describe("SEO and production asset configuration", () => {
  it("normalizes production site URLs and falls back locally", () => {
    expect(resolveSiteUrl("https://portfolio.example.com/some/path").toString()).toBe(
      "https://portfolio.example.com/"
    );
    expect(resolveSiteUrl("not-a-url").toString()).toBe("http://localhost:3000/");
    expect(getAbsoluteUrl("/projects")).toBe(`${siteConfig.siteUrl.origin}/projects`);
  });

  it("uses central site URL for robots and sitemap entries", () => {
    const sitemapEntries = sitemap();

    expect(robots().sitemap).toBe(`${siteConfig.siteUrl.origin}/sitemap.xml`);
    expect(sitemapEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: `${siteConfig.siteUrl.origin}/`
        }),
        expect.objectContaining({
          url: `${siteConfig.siteUrl.origin}/projects/cicd-quality-gates`
        })
      ])
    );
  });

  it("creates canonical metadata for deep linked workspace routes", () => {
    const projectMetadata = getWorkspaceRouteMetadata(
      createRouteForSection("projects", {
        projectSlug: "cicd-quality-gates"
      })
    );
    const labMetadata = getWorkspaceRouteMetadata(createRouteForSection("performance"));

    expect(projectMetadata).toMatchObject({
      title: "CI/CD Quality Gates",
      alternates: {
        canonical: "/projects/cicd-quality-gates"
      }
    });
    expect(labMetadata).toMatchObject({
      title: "Performance Lab",
      alternates: {
        canonical: "/labs/performance"
      }
    });
  });

  it("keeps CV unlinked until the real PDF exists", () => {
    expect(profile.contact.cv.href).toBe("");
    expect(profile.contact.cv.value).toBe("");
  });
});

describe("portfolio JSON-LD", () => {
  it("contains only verified person, profile page, and website data", () => {
    const jsonLd = createPortfolioJsonLd();
    const graph = jsonLd["@graph"] as readonly Record<string, unknown>[];
    const person = graph.find((node) => node["@type"] === "Person");

    expect(graph.map((node) => node["@type"])).toEqual(
      expect.arrayContaining(["Person", "ProfilePage", "WebSite"])
    );
    expect(person).toMatchObject({
      name: profile.name,
      email: profile.contact.email.value
    });
    expect(person?.sameAs).toEqual([profile.contact.linkedIn.href]);
  });

  it("serializes JSON-LD safely for inline script output", () => {
    expect(serializeJsonLd({ text: "<script>" })).toContain("\\u003cscript>");
  });
});
