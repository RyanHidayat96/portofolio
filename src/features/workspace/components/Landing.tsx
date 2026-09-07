"use client";

import { Button } from "@/components/ui/Button";
import { branding } from "@/data/branding";
import { profile } from "@/data/profile";
import { EngineeringCore } from "@/features/workspace/components/EngineeringCore";
import { ScrollNarrative } from "@/features/workspace/components/ScrollNarrative";
import { isPortfolioValueConfigured } from "@/lib/portfolio-values";
import {
  ArrowDown,
  BriefcaseBusiness,
  ExternalLink,
  FileText,
  Mail,
  Power
} from "lucide-react";

const heroCapabilities = [
  {
    label: "Build",
    value: "Frontend, API, backend, data"
  },
  {
    label: "Quality",
    value: "Automation, API, mobile, performance"
  },
  {
    label: "Ship",
    value: "CI/CD, Docker, quality gates"
  }
] as const;

export function Landing({
  onInitialize
}: Readonly<{
  onInitialize: () => void;
}>): React.ReactElement {
  const cvLink = profile.contact.cv;
  const contactLink = profile.contact.email;
  const linkedInLink = profile.contact.linkedIn;
  const hasCv = isPortfolioValueConfigured(cvLink.value) && isPortfolioValueConfigured(cvLink.href);
  const hasContact =
    isPortfolioValueConfigured(contactLink.value) && isPortfolioValueConfigured(contactLink.href);
  const hasLinkedIn =
    isPortfolioValueConfigured(linkedInLink.value) && isPortfolioValueConfigured(linkedInLink.href);
  const ctaLinkClass = "action-link landing-action-link";

  return (
    <main className="landing-shell">
      <div aria-hidden="true" className="engineering-grid landing-grid" />
      <section className="content-container landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-grid">
          <div className="landing-copy">
            <div className="landing-eyebrow">
              <span>Portfolio</span>
              <span aria-hidden="true" />
              <span>Full Stack x SDET</span>
            </div>

            <div className="landing-system-kicker" aria-label="Build Quality Ship system signal">
              {heroCapabilities.map((item) => (
                <span key={item.label}>{item.label}</span>
              ))}
            </div>

            <p className="landing-role">Full Stack x SDET</p>
            <h1 id="landing-title" className="landing-title">
              {profile.name}
            </h1>

            <p className="landing-statement">
              {branding.heroStatementLead}
              <span>{branding.heroStatementAccent}</span>
            </p>

            <p className="landing-summary">
              Full Stack Developer with SDET depth across application build, API/backend work,
              database validation, automation, performance signals, and release gates.
            </p>

            <div className="landing-current" aria-label="Current role">
              <BriefcaseBusiness aria-hidden="true" size={18} />
              <span>{profile.role}</span>
              <span>Full timeline in CV</span>
            </div>

            <ol className="landing-pillars" aria-label="Build Quality Ship positioning">
              {heroCapabilities.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <p>{item.value}</p>
                </li>
              ))}
            </ol>

            <div className="landing-actions">
              <Button
                variant="primary"
                icon={<Power aria-hidden="true" size={18} />}
                onClick={onInitialize}
                cursorLabel="OPEN"
                magnetic
                className="landing-action-primary"
              >
                Open Portfolio
              </Button>
              {hasCv ? (
                <a
                  href={cvLink.href}
                  download="cv.pdf"
                  className={ctaLinkClass}
                  data-cursor-intent="link"
                  data-cursor-label="CV"
                >
                  <FileText aria-hidden="true" size={18} />
                  <span>Download CV</span>
                </a>
              ) : null}
              {hasContact || hasLinkedIn ? (
                <div className="landing-contact-actions">
                  {hasContact ? (
                    <a
                      href={contactLink.href}
                      className={ctaLinkClass}
                      data-cursor-intent="link"
                      data-cursor-label="MAIL"
                    >
                      <Mail aria-hidden="true" size={18} />
                      <span>Contact</span>
                    </a>
                  ) : null}
                  {hasLinkedIn ? (
                    <a
                      href={linkedInLink.href}
                      className={ctaLinkClass}
                      rel="noreferrer"
                      target="_blank"
                      data-cursor-intent="link"
                      data-cursor-label="LINK"
                    >
                      <ExternalLink aria-hidden="true" size={18} />
                      <span>LinkedIn</span>
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>

            <a className="landing-scroll-cue" href="#build-quality-ship" data-cursor-intent="link">
              <ArrowDown aria-hidden="true" size={16} />
              <span>Follow Build Quality Ship</span>
            </a>
          </div>

          <EngineeringCore />
        </div>
      </section>
      <ScrollNarrative />
    </main>
  );
}
