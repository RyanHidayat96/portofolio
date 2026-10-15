"use client";

import type { PaletteAction } from "@/features/workspace/navigation";
import { Command, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const paletteListId = "command-palette-options";
const paletteDescriptionId = "command-palette-description";

export function CommandPalette({
  isOpen,
  actions,
  onClose,
  onSelect
}: Readonly<{
  isOpen: boolean;
  actions: readonly PaletteAction[];
  onClose: () => void;
  onSelect: (action: PaletteAction) => void;
}>): React.ReactElement | null {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const dialogRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const filteredActions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return actions;
    }

    return actions.filter((action) =>
      `${action.label} ${action.description} ${action.keywords?.join(" ") ?? ""}`
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [actions, query]);
  const clampedActiveIndex =
    filteredActions.length === 0 ? -1 : Math.min(activeIndex, filteredActions.length - 1);
  const activeAction = clampedActiveIndex >= 0 ? filteredActions[clampedActiveIndex] : undefined;
  const activeOptionId =
    activeAction && clampedActiveIndex >= 0
      ? createPaletteOptionId(activeAction.id, clampedActiveIndex)
      : undefined;

  const closePalette = useCallback((): void => {
    setQuery("");
    setActiveIndex(0);
    onClose();
    window.setTimeout(() => previousActiveElementRef.current?.focus(), 0);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusTimerId = window.setTimeout(() => inputRef.current?.focus(), 0);

    return () => window.clearTimeout(focusTimerId);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePalette();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      trapDialogFocus(event, dialogRef.current);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closePalette, isOpen]);

  useEffect(() => {
    if (!activeOptionId || !isOpen) {
      return;
    }

    document.getElementById(activeOptionId)?.scrollIntoView({ block: "nearest" });
  }, [activeOptionId, isOpen]);

  if (!isOpen) {
    return null;
  }

  const moveActiveIndex = (direction: "previous" | "next"): void => {
    if (filteredActions.length === 0) {
      return;
    }

    setActiveIndex((currentIndex) => {
      const safeIndex = Math.min(currentIndex, filteredActions.length - 1);
      if (direction === "next") {
        return (safeIndex + 1) % filteredActions.length;
      }

      return (safeIndex - 1 + filteredActions.length) % filteredActions.length;
    });
  };

  const selectActiveAction = (): void => {
    if (!activeAction) {
      return;
    }

    onSelect(activeAction);
    closePalette();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 p-3 sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closePalette();
        }
      }}
    >
      <section
        ref={dialogRef}
        className="palette-dialog mx-auto mt-4 w-full max-w-2xl border-2 border-[var(--accent)] bg-[var(--surface-deep)] shadow-[6px_6px_0px_#000,0_0_24px_rgba(255,176,0,0.3)] sm:mt-20"
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-palette-title"
        aria-describedby={paletteDescriptionId}
      >
        <h2 id="command-palette-title" className="sr-only">
          Command palette
        </h2>
        <p id={paletteDescriptionId} className="sr-only">
          Search actions. Use arrow keys to move through results, Enter to select, Escape to close.
        </p>

        <div className="flex items-center justify-between border-b-2 border-[var(--accent)] bg-[var(--surface-raised)] px-4 py-2 mono text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
          <span className="flex items-center gap-1">
            <span className="text-[var(--accent-secondary)]">╔══</span>
            <span>COMMAND_PALETTE.EXE</span>
          </span>
          <span className="text-xs text-[var(--text-muted)]">[ ESC: CLOSE ] ══╗</span>
        </div>

        <div className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface-deep)] p-3 sm:p-4">
          <span className="mono text-xl font-black text-[var(--accent)]" aria-hidden="true">
            &gt;
          </span>
          <input
            ref={inputRef}
            value={query}
            role="combobox"
            aria-controls={paletteListId}
            aria-expanded="true"
            aria-autocomplete="list"
            aria-activedescendant={activeOptionId}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                moveActiveIndex("next");
              }

              if (event.key === "ArrowUp") {
                event.preventDefault();
                moveActiveIndex("previous");
              }

              if (event.key === "Enter") {
                event.preventDefault();
                selectActiveAction();
              }
            }}
            className="min-h-[var(--touch-target)] min-w-0 flex-1 bg-transparent mono text-lg text-[var(--text-primary)] outline-none placeholder:text-[var(--text-subtle)]"
            placeholder="SEARCH ACTIONS, LABS, PROFILE..."
            aria-label="Search commands"
          />
          <span className="terminal-caret" aria-hidden="true" />
        </div>

        <div
          id={paletteListId}
          className="max-h-[70vh] overflow-y-auto p-0 sm:max-h-[420px]"
          role="listbox"
          aria-label="Command palette actions"
        >
          {filteredActions.length > 0 ? (
            filteredActions.map((action, index) => {
              const isActive = index === clampedActiveIndex;
              return (
                <button
                  key={action.id}
                  id={createPaletteOptionId(action.id, index)}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onSelect(action);
                    closePalette();
                  }}
                  onFocus={() => setActiveIndex(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`w-full border-b border-[var(--border)] p-3 sm:p-4 text-left mono transition-none ${
                    isActive
                      ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                      : "bg-transparent text-[var(--text-primary)] hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="block font-bold text-base">
                      {isActive ? `► ${action.label}` : `  ${action.label}`}
                    </span>
                    {action.href ? (
                      <span
                        className={`mono text-xs ${
                          isActive ? "text-[var(--accent-contrast)]" : "text-[var(--accent)]"
                        }`}
                      >
                        [{action.isExternal ? "EXT" : "LINK"}]
                      </span>
                    ) : null}
                  </div>
                  <span
                    className={`mt-1 block text-sm ${
                      isActive
                        ? "text-[var(--accent-contrast)] opacity-90"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {action.description}
                  </span>
                </button>
              );
            })
          ) : (
            <p className="p-4 mono text-sm uppercase text-[var(--text-muted)]">
              No matching command.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t-2 border-[var(--border-strong)] bg-[var(--surface-raised)] px-4 py-2 mono text-xs text-[var(--text-muted)]">
          <span>↑/↓ SELECT</span>
          <span>[ENTER] EXECUTE</span>
          <span>╚══[ {filteredActions.length} ACTIONS ]══╝</span>
        </div>
      </section>
    </div>
  );
}

function createPaletteOptionId(actionId: string, index: number): string {
  return `command-palette-option-${index}-${actionId}`;
}

function trapDialogFocus(event: KeyboardEvent, dialog: HTMLElement): void {
  const focusableElements = getFocusableElements(dialog);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements.at(-1);

  if (!firstElement || !lastElement) {
    return;
  }

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
    return;
  }

  if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

function getFocusableElements(container: HTMLElement): readonly HTMLElement[] {
  const selector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])'
  ].join(",");

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => !element.hasAttribute("aria-hidden")
  );
}
