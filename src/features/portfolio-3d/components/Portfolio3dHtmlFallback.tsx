'use client';

import { withPortfolio3dBasePath } from '../asset-url';
import { portfolio3dSectionContracts } from '../section-contracts';
import {
  getPortfolio3dPanelContent,
  isPortfolio3dSafeHref,
  type Portfolio3dPanelBlock,
  type Portfolio3dSectionPanelContent
} from '../screen-content';
import type { Portfolio3dSectionContract } from '../types';

interface FallbackSection {
  readonly contract: Portfolio3dSectionContract;
  readonly content: Portfolio3dSectionPanelContent;
}

const fallbackSections = portfolio3dSectionContracts
  .map((contract) => {
    const content = getPortfolio3dPanelContent(contract.id);
    return content ? { contract, content } : null;
  })
  .filter((section): section is FallbackSection => section !== null);

const contactContent = getPortfolio3dPanelContent('contact');
const primaryFallbackLinks = contactContent?.links.filter((link) =>
  ['CV', 'Email', 'Phone', 'LinkedIn'].includes(link.label)
) ?? [];

export function Portfolio3dHtmlFallback(): React.ReactElement {
  const retry3d = (): void => {
    window.location.reload();
  };

  return (
    <main
      className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]"
      style={{
        minHeight: '100dvh',
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'
      }}
    >
      <a href="#portfolio-3d-fallback-content" className="skip-link">
        Skip to portfolio content
      </a>

      <section
        id="portfolio-3d-fallback-content"
        className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8"
        aria-labelledby="portfolio-3d-fallback-title"
      >
        <header className="grid gap-5 border-b border-[var(--border)] pb-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="mono text-xs uppercase tracking-[0.24em] text-[var(--accent)]">
              RyanOS portfolio
            </p>
            <h1 id="portfolio-3d-fallback-title" className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
              Full portfolio, available without WebGL.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)] sm:text-base">
              All public sections, contact actions, and CV access remain available as semantic HTML.
            </p>
          </div>

          <div className="flex flex-wrap gap-2" aria-label="Fallback actions">
            <button type="button" className="button-base button-primary" onClick={retry3d}>
              Retry 3D
            </button>
            <a className="button-base button-secondary" href={withPortfolio3dBasePath('/workspace')}>
              Standard portfolio
            </a>
            {primaryFallbackLinks.map((link) => (
              <a
                key={link.label + link.href}
                className="button-base button-secondary"
                href={getPortfolio3dFallbackHref(link.href)}
                {...getAnchorProps(link.external)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </header>

        <nav
          className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-elevated)] p-3"
          aria-label="Portfolio fallback sections"
        >
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {fallbackSections.map(({ contract }) => (
              <a
                key={contract.id}
                className="button-base button-secondary justify-start text-left"
                href={`#portfolio-3d-fallback-${contract.id}`}
              >
                {contract.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="grid gap-4 lg:grid-cols-2">
          {fallbackSections.map(({ contract, content }) => (
            <article
              key={contract.id}
              id={`portfolio-3d-fallback-${contract.id}`}
              className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-elevated)] p-4 scroll-mt-6"
              aria-labelledby={`portfolio-3d-fallback-heading-${contract.id}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
                  {content.eyebrow}
                </p>
                <span className="mono rounded-full border border-[var(--border)] px-2 py-1 text-[9px] uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                  {contract.label}
                </span>
              </div>

              <h2
                id={`portfolio-3d-fallback-heading-${contract.id}`}
                className="mt-2 text-xl font-semibold leading-tight"
              >
                {content.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{content.summary}</p>

              {content.tags.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2" aria-label={`${contract.label} tags`}>
                  {content.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[var(--border)] bg-[var(--surface-base)] px-2 py-1 text-[11px] font-semibold text-[var(--text-muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-4 grid gap-3">
                {content.blocks.length > 0 ? (
                  content.blocks.map((block) => <Portfolio3dFallbackBlock key={block.heading} block={block} />)
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">{content.emptyLabel}</p>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {isPortfolio3dSafeHref(contract.routePath) ? (
                  <a className="button-base button-secondary text-xs" href={getPortfolio3dFallbackHref(contract.routePath)}>
                    Open HTML view
                  </a>
                ) : null}
                {content.links.filter((link) => isPortfolio3dSafeHref(link.href)).map((link) => (
                  <a
                    key={link.label + link.href}
                    className="button-base button-secondary text-xs"
                    href={getPortfolio3dFallbackHref(link.href)}
                    {...getAnchorProps(link.external)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Portfolio3dFallbackBlock({
  block
}: Readonly<{
  block: Portfolio3dPanelBlock;
}>): React.ReactElement {
  return (
    <section className="rounded-[var(--radius-button)] border border-[var(--border)] bg-[var(--surface-base)] p-3">
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{block.heading}</h3>
      {block.body ? <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{block.body}</p> : null}
      {block.items && block.items.length > 0 ? (
        <ul className="mt-3 grid gap-2">
          {block.items.map((item) => (
            <li key={item} className="flex gap-2 text-xs leading-5 text-[var(--text-muted)]">
              <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function getPortfolio3dFallbackHref(href: string): string {
  return href.startsWith('/') ? withPortfolio3dBasePath(href) : href;
}

function getAnchorProps(isExternal: boolean): Readonly<{ target?: string; rel?: string }> {
  return isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}