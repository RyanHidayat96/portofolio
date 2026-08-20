"use client";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { WorkspaceMode, WorkspaceSection } from "@/features/workspace/types";
import {
  getNavigationGroups,
  getNavigationItem,
  getNavigationItemsForMode
} from "@/features/workspace/navigation";
import { branding } from "@/data/branding";
import { profile } from "@/data/profile";
import { Command } from "lucide-react";

export function WorkspaceShell({
  section,
  mode,
  onSectionChange,
  onModeChange,
  onOpenCommandPalette,
  children
}: Readonly<{
  section: WorkspaceSection;
  mode: WorkspaceMode;
  onSectionChange: (section: WorkspaceSection) => void;
  onModeChange: (mode: WorkspaceMode) => void;
  onOpenCommandPalette: () => void;
  children: React.ReactNode;
}>): React.ReactElement {
  const activeLabel = getNavigationItem(section).label;
  const navGroups = getNavigationGroups(mode);
  const navItems = getNavigationItemsForMode(mode);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <div aria-hidden="true" className="engineering-grid fixed inset-x-0 top-0 h-96 opacity-35" />
      <div className="relative z-10 grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-[var(--border)] bg-[#080a0f]/96 p-4 lg:block">
          <div className="mb-6">
            <p className="mono text-xs uppercase tracking-[0.24em] text-[var(--accent)]">
              {branding.appName}
            </p>
            <h1 className="mt-2 text-xl font-semibold">{branding.workspaceLabel}</h1>
            <Badge tone="success" className="mt-4">
              System Online
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
                        className={`flex w-full items-center gap-3 border px-3 py-2.5 text-left text-sm transition ${
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
          <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[#080a0f]/92 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="mono text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
                  {activeLabel}
                </p>
                <h2 className="text-xl font-semibold">{profile.name}</h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="min-h-10 border border-[var(--border)] bg-[#111722] px-3 text-sm text-[var(--text-primary)] lg:hidden"
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

                <div
                  className="flex border border-[var(--border)] bg-[var(--surface)] p-1"
                  role="group"
                  aria-label="Workspace mode"
                >
                  {(["recruiter", "engineer"] as const).map((modeOption) => (
                    <button
                      key={modeOption}
                      type="button"
                      onClick={() => onModeChange(modeOption)}
                      aria-pressed={mode === modeOption}
                      className={`px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
                        mode === modeOption
                          ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      {modeOption}
                    </button>
                  ))}
                </div>

                <Button
                  variant="secondary"
                  icon={<Command aria-hidden="true" size={17} />}
                  onClick={onOpenCommandPalette}
                  aria-keyshortcuts="Control+K Meta+K"
                  className="min-w-0"
                >
                  Ctrl K
                </Button>
              </div>
            </div>
          </header>

          <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
