import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { profile } from "@/data/profile";
import type { ContactLink } from "@/data/types";
import { isPortfolioValueConfigured } from "@/lib/portfolio-values";
import { Download, ExternalLink, FileText, Mail, Phone } from "lucide-react";

export function ContactPanel(): React.ReactElement {
  const cv = profile.contact.cv;
  const directLinks = [profile.contact.email, profile.contact.phone].filter(isConfiguredLink);
  const socialLinks = [profile.contact.linkedIn, profile.contact.github].filter(isConfiguredLink);
  const hasCv = isConfiguredLink(cv);
  const primaryContactLinks = [...directLinks, ...socialLinks].slice(0, 3);

  return (
    <div className="contact-page">
      <Panel className="contact-hero p-5 sm:p-7">
        <section>
          <Badge tone="success">Contact</Badge>
          <h1>Ready to talk about full-stack or SDET work.</h1>
          <p>
            Best first step: download CV for full detail, then reach out through email, phone, or
            LinkedIn.
          </p>
          <div className="contact-hero-actions">
            {hasCv ? (
              <a className="button-base button-primary" href={cv.href} download="cv.pdf">
                <Download aria-hidden="true" size={18} />
                <span>{cv.value}</span>
              </a>
            ) : null}
            {directLinks.map((link) => (
              <ContactAnchor key={link.id} link={link} />
            ))}
          </div>
        </section>

        <section className="contact-cv-card" aria-label="CV download status">
          <FileText aria-hidden="true" size={24} />
          <p className="mono">cv.asset</p>
          <h2>{hasCv ? "CV ready for HR download." : "CV owner action needed."}</h2>
          <p>
            {hasCv
              ? "Public portfolio stays concise; full role detail is available in the PDF."
              : "CV link is not configured yet."}
          </p>
          {hasCv ? (
            <a href={cv.href} download="cv.pdf">
              Open CV
              <ExternalLink aria-hidden="true" size={16} />
            </a>
          ) : null}
          <ol className="contact-readiness-list" aria-label="Hiring contact next steps">
            <li>CV contains deeper role and responsibility detail.</li>
            <li>Portfolio keeps proof concise for fast screening.</li>
            <li>Email or phone is the fastest follow-up path.</li>
          </ol>
        </section>
      </Panel>

      <Panel className="contact-conversion-strip p-5 sm:p-6">
        <div>
          <p className="mono text-sm text-[var(--accent)]">hiring.next.step</p>
          <h2>For HR or technical hiring teams.</h2>
          <p>Use CV for detail, then contact through the fastest available channel.</p>
        </div>
        <div className="contact-conversion-actions">
          {hasCv ? <ContactAnchor link={cv} /> : null}
          {primaryContactLinks.map((link) => (
            <ContactAnchor key={link.id} link={link} />
          ))}
        </div>
      </Panel>

      <div className="contact-grid">
        <Panel className="contact-card p-5 sm:p-6">
          <div>
            <p className="mono text-sm text-[var(--accent)]">direct.channels</p>
            <h2>Direct contact.</h2>
          </div>
          <div className="contact-link-list">
            {directLinks.map((link) => (
              <ContactAnchor key={link.id} link={link} variant="card" />
            ))}
          </div>
        </Panel>

        <Panel className="contact-card p-5 sm:p-6">
          <div>
            <p className="mono text-sm text-[var(--accent)]">social.links</p>
            <h2>Professional links.</h2>
          </div>
          <div className="contact-link-list">
            {socialLinks.length > 0 ? (
              socialLinks.map((link) => <ContactAnchor key={link.id} link={link} variant="card" />)
            ) : (
              <p className="contact-empty">No public social link configured.</p>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function ContactAnchor({
  link,
  variant = "button"
}: Readonly<{
  link: ContactLink;
  variant?: "button" | "card";
}>): React.ReactElement {
  const iconSize = variant === "button" ? 17 : 20;
  const isExternal = link.id !== "phone" && link.id !== "email" && link.id !== "cv";

  return (
    <a
      className={variant === "button" ? "button-base button-secondary" : "contact-link-card"}
      href={link.href}
      download={link.id === "cv" ? "cv.pdf" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      target={isExternal ? "_blank" : undefined}
    >
      {renderContactIcon(link.id, iconSize)}
      <span>
        <strong>{link.label}</strong>
        {variant === "card" ? <small>{link.value}</small> : null}
      </span>
      {variant === "card" ? <ExternalLink aria-hidden="true" size={16} /> : null}
    </a>
  );
}

function isConfiguredLink(link: ContactLink): boolean {
  return isPortfolioValueConfigured(link.value) && isPortfolioValueConfigured(link.href);
}

function renderContactIcon(id: ContactLink["id"], size: number): React.ReactElement {
  if (id === "email") {
    return <Mail aria-hidden="true" size={size} />;
  }

  if (id === "phone") {
    return <Phone aria-hidden="true" size={size} />;
  }

  if (id === "cv") {
    return <FileText aria-hidden="true" size={size} />;
  }

  return <ExternalLink aria-hidden="true" size={size} />;
}
