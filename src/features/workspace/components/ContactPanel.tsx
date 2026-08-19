import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { profile } from "@/data/profile";
import { isPortfolioValueConfigured } from "@/lib/portfolio-values";
import { ExternalLink, FileText, Mail, Phone } from "lucide-react";

export function ContactPanel(): React.ReactElement {
  const links = Object.values(profile.contact).filter(
    (link) => isPortfolioValueConfigured(link.value) && isPortfolioValueConfigured(link.href)
  );

  return (
    <Panel className="p-5 sm:p-7">
      <div className="max-w-3xl">
        <Badge tone="success">Contact</Badge>
        <h1 className="mt-5 text-3xl font-semibold sm:text-5xl">Interested in working together?</h1>
        <p className="mt-5 text-lg text-[#b7c2d2]">Let&apos;s build reliable software.</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {links.map((link) => {
          const Icon = getContactIcon(link.id);
          return (
            <article
              key={link.label}
              className="border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="flex items-center gap-3">
                <Icon aria-hidden="true" className="text-[var(--accent)]" size={20} />
                <h2 className="font-semibold">{link.label}</h2>
              </div>
              <a
                className="mt-4 inline-block text-sm font-semibold text-[var(--accent)]"
                href={link.href}
                rel={link.id === "phone" || link.id === "email" ? undefined : "noreferrer"}
                target={link.id === "phone" || link.id === "email" ? undefined : "_blank"}
              >
                {link.value}
              </a>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}

function getContactIcon(id: string): typeof ExternalLink {
  if (id === "email") {
    return Mail;
  }

  if (id === "phone") {
    return Phone;
  }

  if (id === "cv") {
    return FileText;
  }

  return ExternalLink;
}
