import { profile } from "@/data/profile";
import { isPortfolioValueConfigured } from "@/lib/portfolio-values";
import { Download, Mail } from "lucide-react";

export function ProfessionalContactActions(): React.ReactElement {
  const { cv, email } = profile.contact;

  return (
    <div className="professional-actions">
      {isPortfolioValueConfigured(cv.href) ? (
        <a className="button-base button-primary" href={cv.href} download="cv.pdf">
          <Download size={18} aria-hidden="true" />
          <span>Download CV</span>
        </a>
      ) : null}
      {isPortfolioValueConfigured(email.href) ? (
        <a className="button-base button-secondary" href={email.href}>
          <Mail size={18} aria-hidden="true" />
          <span>Email Ryan</span>
        </a>
      ) : null}
    </div>
  );
}
