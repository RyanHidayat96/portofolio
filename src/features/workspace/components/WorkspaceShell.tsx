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
import type { WorkspaceSceneTransition, WorkspaceSection } from "@/features/workspace/types";
import { cn } from "@/lib/cn";
import { Command } from "lucide-react";

export function WorkspaceShell({
  section,
  onSectionChange,
  onOpenCommandPalette,
  sceneTransition,
  sceneKey,
  children
}: Readonly<{
  section: WorkspaceSection;
  onSectionChange: (section: WorkspaceSection) => void;
  onOpenCommandPalette: () => void;
  sceneTransition: WorkspaceSceneTransition;
  sceneKey: string;
  children: React.ReactNode;
}>): React.ReactElement {
  const activeLabel = getNavigationItem(section).label;
  const navGroups = getNavigationGroups();
  const navItems = getNavigationItems();

  const onNavigationKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentSection: WorkspaceSection
  ): void => {
    if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const currentIndex = navItems.findIndex((item) => item.id === currentSection);
    const fallbackIndex = Math.max(0, currentIndex);
    const nextIndex = getNextNavigationIndex(event.key, fallbackIndex, navItems.length);
    const nextItem = navItems[nextIndex];

    if (!nextItem) {
      return;
    }

    onSectionChange(nextItem.id);
    window.requestAnimationFrame(() =>
      document.getElementById(createWorkspaceNavigationId(nextItem.id))?.focus()
    );
  };

  return (
    <main
      className="workspace-root min-h-screen bg-[var(--background)] text-[var(--text-primary)]"
      data-section={section}
      data-transition={sceneTransition.phase}
    >
      <a href="#workspace-content" className="skip-link">
        Skip to workspace content
      </a>
      <p id="workspace-status" className="sr-only" aria-live="polite">
        Current section: {activeLabel}.
      </p>
      {sceneTransition.phase !== "idle" ? (
        <p className="sr-only" aria-live="polite">
          Transitioning to {sceneTransition.targetLabel}.
        </p>
      ) : null}
      <div aria-hidden="true" className="engineering-grid fixed inset-x-0 top-0 h-96 opacity-35" />
      <div className="relative z-10 grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="workspace-sidebar hidden border-r border-[var(--border)] bg-[var(--surface-deep-96)] p-4 lg:block">
          <div className="workspace-brand mb-6">
            <p className="mono text-xs uppercase tracking-[0.24em] text-[var(--accent)]">
              {branding.appName}
            </p>
            <h1 className="mt-2 text-xl font-semibold">{branding.workspaceLabel}</h1>
            <Badge tone="success" className="mt-4">
              Portfolio Online
            </Badge>
          </div>

          <nav aria-label="Workspace sections" className="workspace-navigation space-y-5">
            {navGroups.map((group) => (
              <div key={group.label} className="workspace-nav-group">
                <p className="mono mb-2 px-3 text-[10px] uppercase tracking-[0.2em] text-[#556174]">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.id === section;
                    const itemDescriptionId = `workspace-nav-desc-${item.id}`;

                    return (
                      <button
                        key={item.id}
                        id={createWorkspaceNavigationId(item.id)}
                        type="button"
                        onClick={() => onSectionChange(item.id)}
                        onKeyDown={(event) => onNavigationKeyDown(event, item.id)}
                        className={cn(
                          "workspace-nav-button",
                          isActive && "workspace-nav-button-active"
                        )}
                        data-active={isActive}
                        data-cursor-intent="button"
                        data-cursor-label={isActive ? "ACTIVE" : "OPEN"}
                        aria-current={isActive ? "page" : undefined}
                        aria-describedby={itemDescriptionId}
                      >
                        <span className="workspace-nav-indicator" aria-hidden="true" />
                        <span className="workspace-nav-icon">
                          <Icon aria-hidden="true" size={17} />
                        </span>
                        <span className="workspace-nav-label">{item.label}</span>
                        <span id={itemDescriptionId} className="sr-only">
                          {item.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <section className="workspace-main min-w-0">
          <header className="workspace-header sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface-deep-92)] px-4 py-3 backdrop-blur sm:px-6">
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
                  aria-label="Open command palette"
                  className="w-full min-w-0 sm:w-auto"
                >
                  Ctrl K
                </Button>
              </div>
            </div>
          </header>

          <div
            id="workspace-content"
            tabIndex={-1}
            aria-describedby="workspace-status"
            className="workspace-content min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-8"
          >
            <div key={sceneKey} className="workspace-scene-panel">
              {children}
            </div>
            <div className="workspace-scene-transition" aria-hidden="true">
              <span />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function getNextNavigationIndex(key: string, currentIndex: number, itemCount: number): number {
  if (key === "Home") {
    return 0;
  }

  if (key === "End") {
    return itemCount - 1;
  }

  const direction = key === "ArrowDown" || key === "ArrowRight" ? 1 : -1;
  return (currentIndex + direction + itemCount) % itemCount;
}

function createWorkspaceNavigationId(section: WorkspaceSection): string {
  return `workspace-nav-${section}`;
}