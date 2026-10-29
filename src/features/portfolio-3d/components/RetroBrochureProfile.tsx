"use client";

import React from "react";
import {
  AtSign,
  Code2,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Scissors,
  Send
} from "lucide-react";
import { education } from "@/data/education";
import { profile } from "@/data/profile";
import { isPortfolioValueConfigured } from "@/lib/portfolio-values";

const deliveryStages = ["Build", "Verify", "Ship"] as const;

export function RetroBrochureContact({
  interactive = true
}: Readonly<{ interactive?: boolean }>): React.ReactElement {
  const credential = education[0];
  const { cv, email, phone, linkedIn, github } = profile.contact;
  const hasCv = isPortfolioValueConfigured(cv.href);
  const linkTabIndex = interactive ? 0 : -1;

  return (
    <div
      className="retro-brochure-page"
      aria-label={`${profile.name} professional contact brochure`}
    >
      {/* Physical Paper Tactile Overlays: Paper Grain, Texture, & Fold Lighting */}
      <div className="retro-brochure-paper-grain" aria-hidden="true" />
      <div className="retro-brochure-paper-crease" aria-hidden="true" />

      {/* Main Physical Brochure Sheet with Outer Inset Border */}
      <article className="retro-brochure-frame">
        {/* Top Meta Rule */}
        <header className="retro-brochure-masthead">
          <div className="retro-brochure-top-rule">
            <span>RYAN HIDAYAT / CONTACT BUREAU</span>
            <span aria-hidden="true">* * *</span>
            <span>PRINTED IN JAKARTA</span>
          </div>

          <div className="retro-brochure-hero-row">
            <div className="retro-brochure-hero-left">
              <p className="retro-brochure-kicker">FULL-CYCLE ENGINEERING</p>
              <h1 className="retro-brochure-title">{profile.name}</h1>
              <p className="retro-brochure-ribbon-wrap">
                <span className="retro-brochure-ribbon">{profile.headline}</span>
              </p>
            </div>

            {/* Skewed Postage Stamp Badge */}
            <div
              className="retro-brochure-seal"
              aria-label={`${profile.yearsOfExperience} experience`}
            >
              <div className="retro-brochure-seal-stamp">
                <span className="retro-brochure-seal-badge">OPEN</span>
                <strong className="retro-brochure-seal-val">{profile.yearsOfExperience}</strong>
                <span className="retro-brochure-seal-lbl">
                  YEARS OF
                  <br />
                  PRACTICE
                </span>
              </div>
              <div className="retro-brochure-seal-cancellation" aria-hidden="true" />
            </div>
          </div>
        </header>

        {/* Slogan Banner Bar */}
        <section className="retro-brochure-slogan-bar" aria-label="Professional statement">
          <p>{profile.tagline}</p>
        </section>

        {/* Two-Column Feature: Engineering Dispatch (Left) + Dossier Copy (Right) */}
        <section className="retro-brochure-feature" aria-label="Professional profile">
          {/* Left Card: Engineering Dispatch Plate */}
          <div className="retro-brochure-print-plate" aria-hidden="true">
            <p className="retro-brochure-plate-overline">ENGINEERING DISPATCH</p>
            <div className="retro-brochure-plate-mark">
              <span className="retro-brochure-plate-ray retro-brochure-plate-ray--one" />
              <span className="retro-brochure-plate-ray retro-brochure-plate-ray--two" />
              <span className="retro-brochure-plate-ray retro-brochure-plate-ray--three" />
              <span className="retro-brochure-plate-ring">
                <Send size={44} strokeWidth={1.5} className="retro-brochure-send-icon" />
              </span>
            </div>
            <p className="retro-brochure-plate-wordmark">BUILD / VERIFY / SHIP</p>
            <p className="retro-brochure-plate-caption">
              Reliable interfaces, APIs, delivery checks, and performance signals.
            </p>
          </div>

          {/* Right Copy: Bio, Facts, and Delivery Stages */}
          <div className="retro-brochure-profile-copy">
            <p className="retro-brochure-copy-eyebrow">Available for thoughtful engineering work</p>
            <h2 className="retro-brochure-copy-title">Systems people can trust.</h2>
            <p className="retro-brochure-summary">{profile.summary}</p>
            <dl className="retro-brochure-facts">
              <div>
                <dt>
                  <MapPin size={15} aria-hidden="true" /> Base
                </dt>
                <dd>{profile.location}</dd>
              </div>
              <div>
                <dt>
                  <GraduationCap size={15} aria-hidden="true" /> Study
                </dt>
                <dd>
                  {credential
                    ? `${credential.degree}, GPA ${credential.gpa}`
                    : "Informatics Engineering"}
                </dd>
              </div>
              <div>
                <dt>
                  <FileText size={15} aria-hidden="true" /> Focus
                </dt>
                <dd>{profile.focusAreas.join(" / ")}</dd>
              </div>
            </dl>
            <ul className="retro-brochure-focus-list" aria-label="Engineering delivery stages">
              {deliveryStages.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Lower Section: Correspondence Voucher Zone with Tabs & Dashed Coupon */}
        <section className="retro-brochure-voucher-zone" aria-label="Direct contact channels">
          <div className="retro-brochure-tabs" aria-hidden="true">
            <span className="retro-brochure-tab retro-brochure-tab--active">
              CORRESPONDENCE <Scissors size={11} className="retro-brochure-tab-scissor inline ml-1" />
            </span>
            <span className="retro-brochure-tab">SHIP</span>
          </div>

          <div className="retro-brochure-voucher-body">
            <div className="retro-brochure-voucher-grid">
              <BrochureLink
                href={email.href}
                label="Email"
                value={email.value}
                icon={<Mail size={16} />}
                ariaLabel={`Email ${profile.name}`}
                tabIndex={linkTabIndex}
              />
              <BrochureLink
                href={phone.href}
                label="Telephone"
                value={phone.value}
                icon={<Phone size={16} />}
                ariaLabel={`Call ${profile.name}`}
                tabIndex={linkTabIndex}
              />
              <BrochureLink
                href={linkedIn.href}
                label="LinkedIn"
                value={linkedIn.value}
                icon={<AtSign size={16} />}
                ariaLabel="Open LinkedIn profile"
                tabIndex={linkTabIndex}
                external
              />
              <BrochureLink
                href={github.href}
                label="GitHub"
                value={github.value}
                icon={<Code2 size={16} />}
                ariaLabel="Open GitHub profile"
                tabIndex={linkTabIndex}
                external
              />
            </div>

            {hasCv ? (
              <div className="retro-brochure-cta-box">
                <a
                  className="retro-brochure-cta-button"
                  href={cv.href}
                  download="cv.pdf"
                  tabIndex={linkTabIndex}
                  aria-label="Download complete curriculum vitae PDF"
                >
                  <Download size={16} aria-hidden="true" />
                  <span>OPEN COMPLETE CV DOSSIER (PDF)</span>
                </a>
              </div>
            ) : null}
          </div>
        </section>

        {/* Colophon Imprint */}
        <footer className="retro-brochure-colophon" aria-hidden="true">
          <span>RYAN HIDAYAT PROFESSIONAL CONTACT BROCHURE</span>
          <span>/</span>
          <span>MMXXVI</span>
        </footer>
      </article>
    </div>
  );
}

function BrochureLink({
  href,
  label,
  value,
  icon,
  ariaLabel,
  tabIndex,
  external = false
}: Readonly<{
  href: string;
  label: string;
  value: string;
  icon: React.ReactNode;
  ariaLabel: string;
  tabIndex: number;
  external?: boolean;
}>): React.ReactElement {
  return (
    <a
      className="retro-brochure-stamp"
      href={href}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
    >
      <span className="retro-brochure-stamp-icon">{icon}</span>
      <span className="retro-brochure-stamp-info">
        <b>{label}</b>
        <span>{value}</span>
      </span>
      <ExternalLink size={13} aria-hidden="true" className="retro-brochure-stamp-arrow" />
    </a>
  );
}
