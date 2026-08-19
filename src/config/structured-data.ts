import { education } from "@/data/education";
import { experience } from "@/data/experience";
import { profile } from "@/data/profile";
import { skillGroups } from "@/data/skills";
import { getAbsoluteUrl, siteConfig } from "./site";

type JsonValue =
  string | number | boolean | null | readonly JsonValue[] | { readonly [key: string]: JsonValue };

interface JsonLdGraph {
  readonly "@context": "https://schema.org";
  readonly "@graph": readonly JsonValue[];
}

export function createPortfolioJsonLd(): JsonLdGraph {
  const personId = `${getAbsoluteUrl("/")}#person`;
  const websiteId = `${getAbsoluteUrl("/")}#website`;
  const profilePageId = `${getAbsoluteUrl("/")}#profile`;
  const sameAs = [profile.contact.linkedIn.href, profile.contact.github.href].filter(Boolean);
  const knowsAbout = uniqueValues([
    ...profile.focusAreas,
    ...skillGroups.flatMap((group) => group.skills.map((skill) => skill.name))
  ]);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: siteConfig.name,
        url: getAbsoluteUrl("/"),
        description: siteConfig.description,
        publisher: {
          "@id": personId
        }
      },
      {
        "@type": "ProfilePage",
        "@id": profilePageId,
        name: siteConfig.title,
        url: getAbsoluteUrl("/profile"),
        description: profile.summary,
        isPartOf: {
          "@id": websiteId
        },
        mainEntity: {
          "@id": personId
        }
      },
      {
        "@type": "Person",
        "@id": personId,
        name: profile.name,
        jobTitle: profile.headline,
        description: profile.summary,
        url: getAbsoluteUrl("/"),
        email: profile.contact.email.value,
        address: {
          "@type": "PostalAddress",
          addressLocality: profile.location
        },
        sameAs,
        knowsAbout,
        worksFor: uniqueValues(experience.map((role) => role.company)).map((company) => ({
          "@type": "Organization",
          name: company
        })),
        alumniOf: education.map((credential) => ({
          "@type": "EducationalOrganization",
          name: credential.institution,
          address: credential.location
        }))
      }
    ]
  };
}

export function serializeJsonLd(value: JsonLdGraph | JsonValue): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function uniqueValues(values: readonly string[]): readonly string[] {
  return Array.from(new Set(values.filter(Boolean)));
}
