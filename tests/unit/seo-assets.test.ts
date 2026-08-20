import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import manifest from "@/app/manifest";
import { createPortfolioJsonLd, serializeJsonLd } from "@/config/structured-data";
import {
  getAbsoluteUrl,
  getWorkspaceRouteMetadata,
  resolveSiteUrl,
  siteConfig
} from "@/config/site";
import { experience } from "@/data/experience";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { createRouteForSection } from "@/features/workspace/routing";
import { isPortfolioValueConfigured } from "@/lib/portfolio-values";
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("SEO and production asset configuration", () => {
  it("uses canonical Full Stack x SDET metadata text", () => {
    const webManifest = manifest();

    expect(siteConfig.title).toBe("Ryan Hidayat — Full Stack Engineer × SDET");
    expect(siteConfig.description).toBe(
      "Full Stack Engineer and SDET experienced in enterprise application development, Next.js, React, Node.js, Java Spring Boot, APIs, databases, test automation, performance engineering, Docker, and GitLab CI/CD."
    );
    expect(webManifest).toMatchObject({
      name: siteConfig.title,
      short_name: siteConfig.name,
      description: siteConfig.description,
      display: "standalone"
    });
  });

  it("normalizes production site URLs and falls back locally", () => {
    expect(resolveSiteUrl("https://portfolio.example.com/some/path").toString()).toBe(
      "https://portfolio.example.com/"
    );
    expect(resolveSiteUrl("not-a-url").toString()).toBe("http://localhost:3000/");
    expect(getAbsoluteUrl("/projects")).toBe(`${siteConfig.siteUrl.origin}/projects`);
  });

  it("uses central site URL for robots and sitemap entries", () => {
    const sitemapEntries = sitemap();
    const firstProject = projects[0];

    expect(robots().sitemap).toBe(`${siteConfig.siteUrl.origin}/sitemap.xml`);
    expect(sitemapEntries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: `${siteConfig.siteUrl.origin}/`
        }),
        expect.objectContaining({
          url: `${siteConfig.siteUrl.origin}/labs`
        }),
        expect.objectContaining({
          url: `${siteConfig.siteUrl.origin}/terminal`
        })
      ])
    );

    if (firstProject) {
      expect(sitemapEntries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            url: `${siteConfig.siteUrl.origin}/projects/${firstProject.slug}`
          })
        ])
      );
    }
  });

  it("creates canonical metadata for deep linked workspace routes", () => {
    const firstProject = projects[0];
    const labMetadata = getWorkspaceRouteMetadata(createRouteForSection("performance"));

    if (firstProject) {
      const projectMetadata = getWorkspaceRouteMetadata(
        createRouteForSection("projects", {
          projectSlug: firstProject.slug
        })
      );

      expect(projectMetadata).toMatchObject({
        title: firstProject.title,
        alternates: {
          canonical: `/projects/${firstProject.slug}`
        }
      });
    }

    expect(labMetadata).toMatchObject({
      title: "Performance Lab",
      alternates: {
        canonical: "/labs/performance"
      }
    });
  });

  it("links CV only when the real public PDF is configured", () => {
    if (isPortfolioValueConfigured(profile.contact.cv.href)) {
      expect(profile.contact.cv.href).toBe("/cv.pdf");
      expect(profile.contact.cv.value).not.toHaveLength(0);
      expect(existsSync("public/cv.pdf")).toBe(true);
      return;
    }

    expect(profile.contact.cv.href).toBe("");
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
      jobTitle: profile.role,
      email: profile.contact.email.value,
      worksFor: {
        name: experience[0]?.company
      }
    });
    expect(String(person?.description)).toContain(profile.headline);
    expect(person?.sameAs).toEqual([profile.contact.linkedIn.href]);
  });

  it("serializes JSON-LD safely for inline script output", () => {
    expect(serializeJsonLd({ text: "<script>" })).toContain("\\u003cscript>");
  });
});
