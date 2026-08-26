"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { branding } from "@/data/branding";
import { profile } from "@/data/profile";
import {
  getNavigationGroups,
  getNavigationItem,
  getNavigationItems
} from "@/features/workspace/navigation";
import type { WorkspaceSection } from "@/features/workspace/types";
import { Command } from "lucide-react";

export function WorkspaceShell({
  section,
  onSectionChange,
  onOpenCommandPalette,
  children
}: Readonly<{
  section: WorkspaceSection;
  onSectionChange: (section: WorkspaceSection) => void;
  onOpenCommandPalette: () => void;
  children: React.ReactNode;
}>): React.ReactElement {
  const activeLabel = getNavigationItem(section).label;
  const navGroups = getNavigationGroups();
  const navItems = getNavigationItems();

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <a href="#workspace-content" className="skip-link">
        Skip to workspace content
      </a>
      <p id="workspace-status" className="sr-only" aria-live="polite">
        Current section: {activeLabel}.
      </p>
      <div aria-hidden="true" className="engineering-grid fixed inset-x-0 top-0 h-96 opacity-35" />
      <div className="relative z-10 grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-[var(--border)] bg-[var(--surface-deep-96)] p-4 lg:block">
          <div className="mb-6">
            <p className="mono text-xs uppercase tracking-[0.24em] text-[var(--accent)]">
              {branding.appName}
            </p>
            <h1 className="mt-2 text-xl font-semibold">{branding.workspaceLabel}</h1>
            <Badge tone="success" className="mt-4">
              Portfolio Online
            </Badge>
          </div>

          <nav aria-label="Workspace sections" className="space-y-5">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="mono mb-2 px-3 text-[10px] uppercase tracking-[0.2em] text-[#556174]">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.id === section;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSectionChange(item.id)}
                        className={`flex min-h-[var(--touch-target)] w-full items-center gap-3 rounded-[var(--radius-control)] border px-3 py-2.5 text-left text-sm transition ${
                          isActive
                            ? "border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
                            : "border-transparent text-[var(--text-muted)] hover:border-[var(--border)] hover:text-[var(--text-primary)]"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <Icon aria-hidden="true" size={17} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface-deep-92)] px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="mono text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
                  {activeLabel}
                </p>
                <h2 className="text-xl font-semibold">{profile.name}</h2>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <select
                  className="min-h-[var(--touch-target)] w-full rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-sm text-[var(--text-primary)] sm:w-auto lg:hidden"
                  value={section}
                  aria-label="Select workspace section"
                  onChange={(event) => onSectionChange(event.target.value as WorkspaceSection)}
                >
                  {navItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>

                <Badge tone="info" className="hidden sm:inline-flex">
                  Full Stack + SDET
                </Badge>

                <Button
                  variant="secondary"
                  icon={<Command aria-hidden="true" size={17} />}
                  onClick={onOpenCommandPalette}
                  aria-keyshortcuts="Control+K Meta+K"
                  className="w-full min-w-0 sm:w-auto"
                >
                  Ctrl K
                </Button>
              </div>
            </div>
          </header>

          <div
            id="workspace-content"
            aria-describedby="workspace-status"
            className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-8"
          >
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
