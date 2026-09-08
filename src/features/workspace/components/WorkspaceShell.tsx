"use client";

import { Badge } from "@/components/ui/Badge";
import { branding } from "@/data/branding";
import {
  getNavigationGroups,
  getNavigationItem,
  getNavigationItems
} from "@/features/workspace/navigation";
import type { WorkspaceSceneTransition, WorkspaceSection } from "@/features/workspace/types";
import { cn } from "@/lib/cn";
import { House, Search } from "lucide-react";
import Link from "next/link";

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
            <p className="mt-2 text-xl font-semibold">Professional Portfolio</p>
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
          <header className="workspace-header sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface-deep-92)] backdrop-blur">
            <div className="workspace-header-row">
              <p className="workspace-section-label">{activeLabel}</p>
              <select
                className="workspace-section-select"
                value={section}
                aria-label="Select workspace section"
                onChange={(event) => onSectionChange(event.target.value as WorkspaceSection)}
              >
                {navGroups.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <Link
                className="button-base button-secondary workspace-header-tool"
                href="/"
                prefetch={false}
                aria-label="Back to room"
                title="Back to Room"
                data-cursor-intent="link"
                data-cursor-label="BACK TO ROOM"
              >
                <House aria-hidden="true" size={18} />
                <span className="workspace-tool-label">Back to Room</span>
              </Link>
              <Badge tone="info" className="workspace-header-specialty">
                Full Stack + SDET
              </Badge>
              <button
                type="button"
                className="button-base button-secondary workspace-header-tool"
                onClick={onOpenCommandPalette}
                aria-keyshortcuts="Control+K Meta+K"
                aria-label="Open command palette"
                title="Search pages (Ctrl K)"
                data-cursor-intent="button"
                data-cursor-label="SEARCH"
              >
                <Search aria-hidden="true" size={18} />
                <span className="workspace-tool-label">Search</span>
              </button>
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
